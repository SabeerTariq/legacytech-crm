import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const router = express.Router();

const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || undefined,
  database: process.env.MYSQL_DATABASE || 'logicworks_crm',
  port: process.env.MYSQL_PORT || 3306,
  multipleStatements: false
};

// GET /api/front-sales/targets - Get all front seller targets
router.get('/targets', async (req, res) => {
  try {
    const { month } = req.query;
    
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      let query = `
        SELECT 
          fst.id,
          fst.seller_id,
          fst.month,
          fst.target_accounts,
          fst.target_gross,
          fst.target_cash_in,
          fst.created_at,
          fst.updated_at,
          e.full_name as seller_name
        FROM front_seller_targets fst
        LEFT JOIN employees e ON fst.seller_id = e.id
      `;
      
      const params = [];
      if (month) {
        query += ` WHERE fst.month = ?`;
        params.push(month);
      }
      
      query += ` ORDER BY fst.created_at`;

      const [targets] = await mysqlConnection.execute(query, params);

      res.status(200).json({
        success: true,
        data: targets
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error fetching targets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch targets'
    });
  }
});

// POST /api/front-sales/targets - Create new target
router.post('/targets', async (req, res) => {
  try {
    const { seller_id, month, target_accounts } = req.body;
    
    if (!seller_id || !month) {
      return res.status(400).json({
        success: false,
        error: 'Seller ID and month are required'
      });
    }

    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      const targetId = uuidv4();
      
      const [result] = await mysqlConnection.execute(`
        INSERT INTO front_seller_targets (id, seller_id, month, target_accounts, target_gross, target_cash_in, created_at, updated_at)
        VALUES (?, ?, ?, ?, 0, 0, NOW(), NOW())
      `, [targetId, seller_id, month, target_accounts || 0]);

      res.status(201).json({
        success: true,
        data: { id: targetId }
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error creating target:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create target'
    });
  }
});

// PUT /api/front-sales/targets/:id - Update target
router.put('/targets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { seller_id, month, target_accounts } = req.body;
    
    if (!seller_id || !month) {
      return res.status(400).json({
        success: false,
        error: 'Seller ID and month are required'
      });
    }

    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      await mysqlConnection.execute(`
        UPDATE front_seller_targets 
        SET seller_id = ?, month = ?, target_accounts = ?, target_gross = 0, target_cash_in = 0, updated_at = NOW()
        WHERE id = ?
      `, [seller_id, month, target_accounts || 0, id]);

      res.status(200).json({
        success: true,
        message: 'Target updated successfully'
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error updating target:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update target'
    });
  }
});

// DELETE /api/front-sales/targets/:id - Delete target
router.delete('/targets/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      await mysqlConnection.execute(`
        DELETE FROM front_seller_targets 
        WHERE id = ?
      `, [id]);

      res.status(200).json({
        success: true,
        message: 'Target deleted successfully'
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error deleting target:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete target'
    });
  }
});

export default router;
