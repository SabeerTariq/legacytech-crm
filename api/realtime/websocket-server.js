import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

class RealtimeServer {
  constructor(server) {
    this.wss = new WebSocketServer({ server });
    this.clients = new Map(); // Map of client ID to WebSocket connection
    this.subscriptions = new Map(); // Map of channel to Set of client IDs
    this.setupWebSocketServer();
  }

  setupWebSocketServer() {
    this.wss.on('connection', (ws, req) => {
      const clientId = uuidv4();
      const clientInfo = {
        id: clientId,
        ws,
        subscriptions: new Set(),
        user: null,
        connectedAt: new Date()
      };

      this.clients.set(clientId, clientInfo);

      console.log(`🔌 WebSocket client connected: ${clientId}`);

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection',
        client_id: clientId,
        message: 'Connected to realtime server'
      }));

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(clientId, message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format'
          }));
        }
      });

      ws.on('close', () => {
        this.handleClientDisconnect(clientId);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
        this.handleClientDisconnect(clientId);
      });
    });

    console.log('🚀 WebSocket realtime server initialized');
  }

  handleMessage(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'subscribe':
        this.handleSubscribe(clientId, message);
        break;
      case 'unsubscribe':
        this.handleUnsubscribe(clientId, message);
        break;
      case 'authenticate':
        this.handleAuthenticate(clientId, message);
        break;
      case 'ping':
        this.handlePing(clientId);
        break;
      default:
        console.log(`Unknown message type: ${message.type}`);
        client.ws.send(JSON.stringify({
          type: 'error',
          message: `Unknown message type: ${message.type}`
        }));
    }
  }

  handleSubscribe(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { channel, event = 'INSERT' } = message;
    
    if (!channel) {
      client.ws.send(JSON.stringify({
        type: 'error',
        message: 'Channel is required for subscription'
      }));
      return;
    }

    // Add client to channel subscription
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }
    this.subscriptions.get(channel).add(clientId);
    client.subscriptions.add(channel);

    console.log(`📡 Client ${clientId} subscribed to channel: ${channel}`);

    client.ws.send(JSON.stringify({
      type: 'subscribed',
      channel,
      event,
      message: `Subscribed to ${channel}`
    }));
  }

  handleUnsubscribe(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { channel } = message;
    
    if (!channel) {
      client.ws.send(JSON.stringify({
        type: 'error',
        message: 'Channel is required for unsubscription'
      }));
      return;
    }

    // Remove client from channel subscription
    if (this.subscriptions.has(channel)) {
      this.subscriptions.get(channel).delete(clientId);
      if (this.subscriptions.get(channel).size === 0) {
        this.subscriptions.delete(channel);
      }
    }
    client.subscriptions.delete(channel);

    console.log(`📡 Client ${clientId} unsubscribed from channel: ${channel}`);

    client.ws.send(JSON.stringify({
      type: 'unsubscribed',
      channel,
      message: `Unsubscribed from ${channel}`
    }));
  }

  handleAuthenticate(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { token, user } = message;
    
    if (token && user) {
      client.user = user;
      console.log(`🔐 Client ${clientId} authenticated as: ${user.email}`);
      
      client.ws.send(JSON.stringify({
        type: 'authenticated',
        user: {
          id: user.id,
          email: user.email,
          display_name: user.display_name
        },
        message: 'Authentication successful'
      }));
    } else {
      client.ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid authentication data'
      }));
    }
  }

  handlePing(clientId) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.ws.send(JSON.stringify({
      type: 'pong',
      timestamp: new Date().toISOString()
    }));
  }

  handleClientDisconnect(clientId) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Remove client from all subscriptions
    client.subscriptions.forEach(channel => {
      if (this.subscriptions.has(channel)) {
        this.subscriptions.get(channel).delete(clientId);
        if (this.subscriptions.get(channel).size === 0) {
          this.subscriptions.delete(channel);
        }
      }
    });

    this.clients.delete(clientId);
    console.log(`🔌 WebSocket client disconnected: ${clientId}`);
  }

  // Broadcast message to all clients subscribed to a channel
  broadcast(channel, event, data, filter = null) {
    if (!this.subscriptions.has(channel)) {
      return;
    }

    const message = {
      type: 'broadcast',
      channel,
      event,
      data,
      timestamp: new Date().toISOString()
    };

    const subscribers = this.subscriptions.get(channel);
    subscribers.forEach(clientId => {
      const client = this.clients.get(clientId);
      if (client && client.ws.readyState === 1) { // WebSocket.OPEN
        // Apply filter if provided
        if (filter && client.user) {
          if (!filter(client.user, data)) {
            return; // Skip this client based on filter
          }
        }
        
        try {
          client.ws.send(JSON.stringify(message));
        } catch (error) {
          console.error(`Error sending message to client ${clientId}:`, error);
          // Remove problematic client
          this.handleClientDisconnect(clientId);
        }
      }
    });

    console.log(`📡 Broadcasted to ${subscribers.size} clients on channel: ${channel}`);
  }

  // Send message to specific client
  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === 1) {
      try {
        client.ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error(`Error sending message to client ${clientId}:`, error);
        this.handleClientDisconnect(clientId);
        return false;
      }
    }
    return false;
  }

  // Get server statistics
  getStats() {
    return {
      total_clients: this.clients.size,
      total_channels: this.subscriptions.size,
      channels: Array.from(this.subscriptions.entries()).map(([channel, clients]) => ({
        channel,
        subscriber_count: clients.size
      })),
      uptime: new Date() - this.startTime
    };
  }

  // Cleanup method
  close() {
    this.wss.close();
    console.log('🔌 WebSocket realtime server closed');
  }
}

export default RealtimeServer;
