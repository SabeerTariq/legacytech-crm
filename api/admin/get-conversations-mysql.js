import mysql from 'mysql2/promise';
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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit = 50, offset = 0, conversation_type, search } = req.query;
    const userId = req.user.id;

    // Connect to MySQL database
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Build the base query for conversations the user is part of
      let baseQuery = `
        SELECT DISTINCT
          c.id,
          c.title as name,
          c.description,
          c.type as conversation_type,
          c.created_at,
          c.updated_at,
          COUNT(cp.user_id) as participant_count,
          GROUP_CONCAT(DISTINCT up.display_name SEPARATOR ', ') as participant_names,
          GROUP_CONCAT(DISTINCT up.email SEPARATOR ', ') as participant_emails,
          CASE WHEN COUNT(cp.user_id) > 2 THEN 1 ELSE 0 END as is_group,
          (SELECT cm.content FROM chat_messages cm 
           WHERE cm.conversation_id = c.id 
           ORDER BY cm.created_at DESC 
           LIMIT 1) as last_message_text
        FROM conversations c
        INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
        LEFT JOIN user_profiles up ON cp.user_id = up.user_id
        WHERE cp.user_id = ?
      `;

      const queryParams = [userId];

      // Add filters
      if (conversation_type) {
        baseQuery += ` AND c.conversation_type = ?`;
        queryParams.push(conversation_type);
      }

      if (search) {
        baseQuery += ` AND (c.title LIKE ? OR c.description LIKE ?)`;
        const searchTerm = `%${search}%`;
        queryParams.push(searchTerm, searchTerm);
      }

      // Complete the query with grouping and ordering
      baseQuery += `
        GROUP BY c.id, c.title, c.description, c.type, c.created_at, c.updated_at
        ORDER BY c.updated_at DESC
        LIMIT ? OFFSET ?
      `;

      queryParams.push(parseInt(limit), parseInt(offset));

      // Execute the query
      const [conversations] = await mysqlConnection.execute(baseQuery, queryParams);

      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(DISTINCT c.id) as total
        FROM conversations c
        INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
        WHERE cp.user_id = ?
      `;

      const countParams = [userId];

      if (conversation_type) {
        countQuery += ` AND c.conversation_type = ?`;
        countParams.push(conversation_type);
      }

      if (search) {
        countQuery += ` AND (c.title LIKE ? OR c.description LIKE ?)`;
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm);
      }

      const [countResult] = await mysqlConnection.execute(countQuery, countParams);
      const totalCount = countResult[0].total;

      // Transform the data for better readability
      const transformedConversations = conversations.map(conv => ({
        id: conv.id,
        name: conv.name,
        description: conv.description,
        conversation_type: conv.conversation_type,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        participant_count: conv.participant_count,
        participant_names: conv.participant_names ? conv.participant_names.split(', ') : [],
        participant_emails: conv.participant_emails ? conv.participant_emails.split(', ') : [],
        is_group: conv.is_group === 1,
        last_message_text: conv.last_message_text
      }));

      return res.status(200).json({
        success: true,
        data: {
          conversations: transformedConversations,
          pagination: {
            total: totalCount,
            limit: parseInt(limit),
            offset: parseInt(offset),
            has_more: (parseInt(offset) + parseInt(limit)) < totalCount
          }
        }
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error in get-conversations API:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch conversations',
      details: error.message
    });
  }
}
