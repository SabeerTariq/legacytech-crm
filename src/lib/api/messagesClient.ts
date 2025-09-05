const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-domain.com/api' 
  : 'http://localhost:3000/api';

export class MessagesClient {
  private static getAuthHeaders() {
    return {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    };
  }

  static async getConversations() {
    const response = await fetch(`${API_BASE_URL}/admin/get-conversations-mysql`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async getMessages(conversationId: string) {
    const response = await fetch(`${API_BASE_URL}/messages/get-messages-mysql?conversationId=${conversationId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async sendMessage(conversationId: string, content: string, messageType: string = 'text') {
    const response = await fetch(`${API_BASE_URL}/messages/send-message-mysql`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        conversationId,
        content,
        messageType
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async createConversation(title: string, participants: string[], conversationType: string = 'general') {
    const response = await fetch(`${API_BASE_URL}/admin/create-conversation-mysql`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        title,
        participants,
        conversation_type: conversationType
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async getUserProfiles(excludeCurrentUser: boolean = true) {
    const response = await fetch(`${API_BASE_URL}/users/get-user-profiles-mysql?excludeCurrentUser=${excludeCurrentUser}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}
