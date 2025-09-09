import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'dev_root',
  password: process.env.MYSQL_PASSWORD || 'Developer@1234',
  database: process.env.MYSQL_DATABASE || 'logicworks_crm',
  port: process.env.MYSQL_PORT || 3306,
  multipleStatements: false
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { conversationId } = req.query;
    const userId = req.user.id;

    if (!conversationId) {
      return res.status(400).json({ 
        error: 'Missing required parameter',
        message: 'conversationId is required'
      });
    }

    // Connect to MySQL database
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // First, verify user is a participant in this conversation
      const [participantCheck] = await mysqlConnection.execute(`
        SELECT 1 FROM conversation_participants 
        WHERE conversation_id = ? AND user_id = ?
      `, [conversationId, userId]);

      if (participantCheck.length === 0) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You are not a participant in this conversation'
        });
      }

      // Get messages for the conversation with sender details
      const [messages] = await mysqlConnection.execute(`
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
        WHERE cm.conversation_id = ?
        ORDER BY cm.created_at ASC
      `, [conversationId]);

      // Transform the data to match the expected format
      const transformedMessages = messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender_id: msg.sender_id,
        conversation_id: msg.conversation_id,
        created_at: msg.created_at,
        updated_at: msg.updated_at,
        message_type: msg.message_type,
        sender: {
          full_name: msg.sender_name,
          email: msg.sender_email
        }
      }));

      return res.status(200).json({
        success: true,
        data: {
          messages: transformedMessages
        }
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error in get-messages API:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch messages',
      details: error.message
    });
  }
}
