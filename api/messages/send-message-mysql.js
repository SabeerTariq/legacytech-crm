import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || undefined,
  database: process.env.MYSQL_DATABASE || 'logicworks_crm',
  port: process.env.MYSQL_PORT || 3306,
  multipleStatements: false
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { conversationId, content, messageType = 'text' } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!conversationId || !content) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'conversationId and content are required'
      });
    }

    // Connect to MySQL database
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Start transaction
      await mysqlConnection.beginTransaction();

      try {
        // First, verify user is a participant in this conversation
        const [participantCheck] = await mysqlConnection.execute(`
          SELECT 1 FROM conversation_participants 
          WHERE conversation_id = ? AND user_id = ?
        `, [conversationId, userId]);

        if (participantCheck.length === 0) {
          await mysqlConnection.rollback();
          return res.status(403).json({
            error: 'Access denied',
            message: 'You are not a participant in this conversation'
          });
        }

        // Create the message
        const messageId = uuidv4();
        await mysqlConnection.execute(`
          INSERT INTO chat_messages (
            id, conversation_id, sender_id, content, message_type, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [messageId, conversationId, userId, content, messageType]);

        // Update conversation's updated_at timestamp
        await mysqlConnection.execute(`
          UPDATE conversations 
          SET updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `, [conversationId]);

        // Commit transaction
        await mysqlConnection.commit();

        // Get the created message with sender details
        const [message] = await mysqlConnection.execute(`
          SELECT 
            cm.id,
            cm.content,
            cm.sender_id,
            cm.conversation_id,
            cm.message_type,
            cm.created_at,
            cm.updated_at,
            up.display_name as sender_name,
            up.email as sender_email
          FROM chat_messages cm
          LEFT JOIN user_profiles up ON cm.sender_id = up.user_id
          WHERE cm.id = ?
        `, [messageId]);

        if (message.length === 0) {
          return res.status(500).json({
            error: 'Message creation failed',
            message: 'Message was created but could not be retrieved'
          });
        }

        const msg = message[0];
        return res.status(201).json({
          success: true,
          message: 'Message sent successfully',
          data: {
            id: msg.id,
            content: msg.content,
            sender_id: msg.sender_id,
            conversation_id: msg.conversation_id,
            message_type: msg.message_type,
            created_at: msg.created_at,
            updated_at: msg.updated_at,
            sender: {
              full_name: msg.sender_name,
              email: msg.sender_email
            }
          }
        });

      } catch (error) {
        // Rollback transaction on error
        await mysqlConnection.rollback();
        throw error;
      }

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error in send-message API:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to send message',
      details: error.message
    });
  }
}
