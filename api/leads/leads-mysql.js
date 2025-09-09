import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'dev_root',
  password: process.env.MYSQL_PASSWORD || 'Developer@1234',
  database: process.env.MYSQL_DATABASE || 'logicworks_crm',
  port: process.env.MYSQL_PORT || 3306,
  multipleStatements: false
};

// GET /api/leads - Get all leads
export const getLeads = async (req, res) => {
  try {
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      const [leads] = await mysqlConnection.execute(`
        SELECT 
          id, 
          client_name, 
          business_description,
          email_address, 
          contact_number, 
          source,
          status,
          price,
          created_at,
          updated_at,
          city_state,
          services_required,
          budget,
          additional_info,
          date,
          user_id,
          agent
        FROM leads
        WHERE status != 'converted'
        ORDER BY created_at DESC
      `);

      res.status(200).json({
        success: true,
        data: leads || []
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error in getLeads:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch leads'
    });
  }
};

// POST /api/leads - Create a new lead
export const createLead = async (req, res) => {
  try {
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      const {
        client_name,
        email_address,
        contact_number,
        city_state,
        business_description,
        services_required,
        budget,
        additional_info,
        source,
        status = 'new',
        price = 0,
        priority,
        lead_score,
        agent
      } = req.body;

      // Validate required fields
      if (!client_name || !email_address) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Client name and email address are required'
        });
      }

      const leadId = uuidv4();
      const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

      const [result] = await mysqlConnection.execute(`
        INSERT INTO leads (
          id, client_name, email_address, contact_number, city_state,
          business_description, services_required, budget, additional_info,
          user_id, created_at, updated_at, date, status, source, price,
          priority, lead_score, agent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        leadId, client_name, email_address, contact_number || null, city_state || null,
        business_description || null, services_required || null, budget || null, additional_info || null,
        req.user?.id || null, currentDate, currentDate, currentDate.split(' ')[0], status, source || null, price || 0,
        priority || null, lead_score || null, agent || null
      ]);

      res.status(201).json({
        success: true,
        message: 'Lead created successfully',
        data: { id: leadId }
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error in createLead:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to create lead'
    });
  }
};

// PUT /api/leads/:id - Update a lead
export const updateLead = async (req, res) => {
  try {
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      const { id } = req.params;
      const {
        client_name,
        email_address,
        contact_number,
        city_state,
        business_description,
        services_required,
        budget,
        additional_info,
        source,
        status,
        price,
        priority,
        lead_score,
        agent
      } = req.body;

      // Validate required fields
      if (!client_name || !email_address) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Client name and email address are required'
        });
      }

      const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

      const [result] = await mysqlConnection.execute(`
        UPDATE leads SET
          client_name = ?, email_address = ?, contact_number = ?, city_state = ?,
          business_description = ?, services_required = ?, budget = ?, additional_info = ?,
          updated_at = ?, status = ?, source = ?, price = ?, priority = ?, lead_score = ?, agent = ?
        WHERE id = ?
      `, [
        client_name, email_address, contact_number || null, city_state || null,
        business_description || null, services_required || null, budget || null, additional_info || null,
        currentDate, status || 'new', source || null, price || 0, priority || null, lead_score || null, agent || null, id
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Lead not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Lead updated successfully'
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error in updateLead:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to update lead'
    });
  }
};

// DELETE /api/leads/:id - Delete a lead
export const deleteLead = async (req, res) => {
  try {
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      const { id } = req.params;

      const [result] = await mysqlConnection.execute(`
        DELETE FROM leads WHERE id = ?
      `, [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Lead not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Lead deleted successfully'
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error in deleteLead:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to delete lead'
    });
  }
};

// GET /api/leads/:id - Get a specific lead
export const getLeadById = async (req, res) => {
  try {
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      const { id } = req.params;

      const [leads] = await mysqlConnection.execute(`
        SELECT * FROM leads WHERE id = ?
      `, [id]);

      if (leads.length === 0) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Lead not found'
        });
      }

      res.status(200).json({
        success: true,
        data: leads[0]
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error in getLeadById:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch lead'
    });
  }
};

import express from 'express';

const router = express.Router();

// GET /api/leads - Get all leads
router.get('/', getLeads);

// GET /api/leads/:id - Get a specific lead
router.get('/:id', getLeadById);

// POST /api/leads - Create a new lead
router.post('/', createLead);

// PUT /api/leads/:id - Update a lead
router.put('/:id', updateLead);

// DELETE /api/leads/:id - Delete a lead
router.delete('/:id', deleteLead);

export default router;
