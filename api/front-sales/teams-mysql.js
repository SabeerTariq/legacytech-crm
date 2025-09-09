import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

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

// GET /api/front-sales/teams - Get all Front Sales teams
router.get('/teams', async (req, res) => {
  try {
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      const [teams] = await mysqlConnection.execute(`
        SELECT 
          t.id,
          t.name,
          t.description,
          t.team_leader_id,
          t.department,
          t.is_active,
          t.created_at,
          t.updated_at,
          e.full_name as team_leader_name
        FROM teams t
        LEFT JOIN employees e ON t.team_leader_id = e.id
        WHERE t.department = 'Front Sales' AND t.is_active = 1
        ORDER BY t.name
      `);

      res.status(200).json({
        success: true,
        data: teams
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch teams'
    });
  }
});

// POST /api/front-sales/teams - Create new team
router.post('/teams', async (req, res) => {
  try {
    const { name, description, team_leader_id, department } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Team name is required'
      });
    }

    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      const teamId = uuidv4();
      
      const [result] = await mysqlConnection.execute(`
        INSERT INTO teams (id, name, description, team_leader_id, department, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
      `, [teamId, name, description, team_leader_id || null, department || 'Front Sales']);

      res.status(201).json({
        success: true,
        data: { id: teamId }
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create team'
    });
  }
});

// PUT /api/front-sales/teams/:id - Update team
router.put('/teams/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, team_leader_id, department } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Team name is required'
      });
    }

    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      await mysqlConnection.execute(`
        UPDATE teams 
        SET name = ?, description = ?, team_leader_id = ?, department = ?, updated_at = NOW()
        WHERE id = ?
      `, [name, description, team_leader_id || null, department || 'Front Sales', id]);

      res.status(200).json({
        success: true,
        message: 'Team updated successfully'
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update team'
    });
  }
});

// DELETE /api/front-sales/teams/:id - Soft delete team
router.delete('/teams/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      await mysqlConnection.execute(`
        UPDATE teams 
        SET is_active = 0, updated_at = NOW()
        WHERE id = ?
      `, [id]);

      res.status(200).json({
        success: true,
        message: 'Team deleted successfully'
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete team'
    });
  }
});

export default router;
