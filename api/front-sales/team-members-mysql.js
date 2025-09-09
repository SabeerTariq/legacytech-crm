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

// GET /api/front-sales/team-members - Get all team members
router.get('/team-members', async (req, res) => {
  try {
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      const [members] = await mysqlConnection.execute(`
        SELECT 
          tm.id,
          tm.team_id,
          tm.member_id,
          tm.role,
          tm.joined_at,
          tm.is_active,
          e.full_name as member_name,
          e.email as member_email
        FROM team_members tm
        LEFT JOIN employees e ON tm.member_id = e.id
        WHERE tm.is_active = 1
        ORDER BY tm.joined_at
      `);

      res.status(200).json({
        success: true,
        data: members
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch team members'
    });
  }
});

// POST /api/front-sales/team-members - Add member to team
router.post('/team-members', async (req, res) => {
  try {
    const { team_id, member_id, role } = req.body;
    
    if (!team_id || !member_id) {
      return res.status(400).json({
        success: false,
        error: 'Team ID and member ID are required'
      });
    }

    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Check if member is already in this team
      const [existing] = await mysqlConnection.execute(`
        SELECT id FROM team_members 
        WHERE team_id = ? AND member_id = ? AND is_active = 1
      `, [team_id, member_id]);

      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'This member is already part of this team'
        });
      }

      const memberRecordId = uuidv4();
      
      const [result] = await mysqlConnection.execute(`
        INSERT INTO team_members (id, team_id, member_id, role, joined_at, is_active)
        VALUES (?, ?, ?, ?, NOW(), 1)
      `, [memberRecordId, team_id, member_id, role || 'member']);

      res.status(201).json({
        success: true,
        data: { id: memberRecordId }
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add team member'
    });
  }
});

// DELETE /api/front-sales/team-members/:id - Remove member from team
router.delete('/team-members/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      await mysqlConnection.execute(`
        UPDATE team_members 
        SET is_active = 0
        WHERE id = ?
      `, [id]);

      res.status(200).json({
        success: true,
        message: 'Member removed from team successfully'
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error removing team member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove team member'
    });
  }
});

export default router;
