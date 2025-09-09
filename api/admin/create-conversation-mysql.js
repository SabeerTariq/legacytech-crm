import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, description, participants, conversation_type } = req.body;

    // Validate required fields
    if (!title || !participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'title and participants array are required'
      });
    }

    // Connect to MySQL database
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Start transaction
      await mysqlConnection.beginTransaction();

      try {
        // Create conversation
        const conversationId = uuidv4();
        await mysqlConnection.execute(`
          INSERT INTO conversations (
            id, title, type, created_at, updated_at
          ) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [
          conversationId,
          title,
          conversation_type || 'general'
        ]);

        console.log('Conversation created:', conversationId);

        // Add participants
        for (const participantId of participants) {
          await mysqlConnection.execute(`
            INSERT INTO conversation_participants (
              conversation_id, user_id, joined_at
            ) VALUES (?, ?, CURRENT_TIMESTAMP)
          `, [conversationId, participantId]);
        }

        // Add creator as participant if not already included
        if (!participants.includes(req.user.id)) {
          await mysqlConnection.execute(`
            INSERT INTO conversation_participants (
              conversation_id, user_id, joined_at
            ) VALUES (?, ?, CURRENT_TIMESTAMP)
          `, [conversationId, req.user.id]);
        }

        // Commit transaction
        await mysqlConnection.commit();

        // Get the created conversation with participants
        const [conversation] = await mysqlConnection.execute(`
          SELECT 
            c.id,
            c.title as name,
            c.type as conversation_type,
            c.created_at,
            c.updated_at,
            GROUP_CONCAT(cp.user_id) as participant_ids,
            CASE WHEN COUNT(cp.user_id) > 2 THEN 1 ELSE 0 END as is_group
          FROM conversations c
          LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
          WHERE c.id = ?
          GROUP BY c.id, c.title, c.type, c.created_at, c.updated_at
        `, [conversationId]);

        if (conversation.length === 0) {
          return res.status(500).json({
            error: 'Conversation creation failed',
            message: 'Conversation was created but could not be retrieved'
          });
        }

        const conv = conversation[0];
        return res.status(201).json({
          success: true,
          message: 'Conversation created successfully',
          data: {
            id: conv.id,
            name: conv.name,
            conversation_type: conv.conversation_type,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            participant_count: participants.length + (participants.includes(req.user.id) ? 0 : 1),
            participants: conv.participant_ids ? conv.participant_ids.split(',') : [],
            is_group: conv.is_group === 1,
            last_message_text: null
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
    console.error('Error in create-conversation API:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to create conversation',
      details: error.message
    });
  }
}
