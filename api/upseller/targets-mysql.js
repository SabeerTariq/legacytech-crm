import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'dev_root',
  password: process.env.MYSQL_PASSWORD || 'Developer@1234',
  database: process.env.MYSQL_DATABASE || 'logicworks_crm',
  port: process.env.MYSQL_PORT || 3306,
  multipleStatements: false
};

// POST /api/upseller/targets - Create or update upseller target
router.post('/targets', async (req, res) => {
  try {
    console.log('🎯 Raw request body:', JSON.stringify(req.body, null, 2));
    console.log('🎯 Request body keys:', Object.keys(req.body));
    
    const { seller_id, month, target_cash_in } = req.body;
    
    console.log('🎯 Extracted parameters:', { seller_id, month, target_cash_in });
    console.log('🎯 seller_id type:', typeof seller_id, 'value:', seller_id);
    console.log('🎯 month type:', typeof month, 'value:', month);
    console.log('🎯 target_cash_in type:', typeof target_cash_in, 'value:', target_cash_in);
    
    if (!seller_id || seller_id === '' || !month || month === '' || target_cash_in === undefined || target_cash_in === null) {
      console.log('❌ Validation failed:', { seller_id, month, target_cash_in });
      return res.status(400).json({
        success: false,
        error: 'Seller ID, month, and target cash in are required'
      });
    }

    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      console.log('🎯 Creating/updating upseller target:', { seller_id, month, target_cash_in });
      console.log('🎯 Raw request body:', req.body);
      console.log('🎯 Request headers:', req.headers);
      console.log('🎯 seller_id type:', typeof seller_id, 'value:', seller_id);

      // Generate UUID for the target
      const { v4: uuidv4 } = await import('uuid');
      const targetId = uuidv4();
      
      // Upsert target
      console.log('🎯 SQL parameters:', [targetId, seller_id, month, target_cash_in]);
      await mysqlConnection.execute(`
        INSERT INTO upseller_targets (id, seller_id, month, target_accounts, target_gross, target_cash_in, created_at, updated_at)
        VALUES (?, ?, ?, 0, 0, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          target_cash_in = VALUES(target_cash_in),
          updated_at = NOW()
      `, [targetId, seller_id, month, target_cash_in]);

      console.log('✅ Target created/updated successfully');

      res.status(200).json({
        success: true,
        message: 'Target created/updated successfully'
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error creating/updating upseller target:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to create/update target',
      details: error.message
    });
  }
});

// DELETE /api/upseller/targets/:id - Delete upseller target
router.delete('/targets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Target ID is required'
      });
    }

    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      console.log('🗑️ Deleting upseller target:', id);

      const [result] = await mysqlConnection.execute(`
        DELETE FROM upseller_targets WHERE id = ?
      `, [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Target not found'
        });
      }

      console.log('✅ Target deleted successfully');

      res.status(200).json({
        success: true,
        message: 'Target deleted successfully'
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error deleting upseller target:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete target',
      details: error.message
    });
  }
});

export default router;
