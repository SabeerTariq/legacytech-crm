import express from 'express';
import mysql from 'mysql2/promise';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

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

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// POST /api/files/upload - Upload a file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file provided',
        message: 'Please select a file to upload'
      });
    }

    const { customer_id, uploaded_by, file_type, description } = req.body;
    
    if (!customer_id || !uploaded_by) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'customer_id and uploaded_by are required'
      });
    }

    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Generate file URL (relative to server)
      const fileUrl = `/uploads/${req.file.filename}`;
      
      // Store file metadata in database
      const [result] = await mysqlConnection.execute(`
        INSERT INTO customer_files (
          id, customer_id, file_url, file_name, uploaded_by, uploaded_at
        ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        uuidv4(),
        customer_id,
        fileUrl,
        req.file.originalname,
        uploaded_by
      ]);

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          file_id: result.insertId,
          file_url: fileUrl,
          file_name: req.file.originalname,
          file_size: req.file.size,
          mime_type: req.file.mimetype
        }
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to upload file',
      details: error.message
    });
  }
});

// GET /api/files/:customer_id - Get files for a customer
router.get('/:customer_id', async (req, res) => {
  try {
    const { customer_id } = req.params;
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      const [files] = await mysqlConnection.execute(`
        SELECT 
          cf.*,
          up.display_name as uploader_name
        FROM customer_files cf
        LEFT JOIN user_profiles up ON cf.uploaded_by = up.user_id
        WHERE cf.customer_id = ?
        ORDER BY cf.created_at DESC
      `, [customer_id]);

      res.status(200).json({
        success: true,
        data: files
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch files',
      details: error.message
    });
  }
});

// GET /api/files/download/:file_id - Download a file
router.get('/download/:file_id', async (req, res) => {
  try {
    const { file_id } = req.params;
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Get file information
      const [files] = await mysqlConnection.execute(`
        SELECT * FROM customer_files WHERE id = ?
      `, [file_id]);

      if (files.length === 0) {
        return res.status(404).json({
          error: 'File not found',
          message: 'File could not be found'
        });
      }

      const file = files[0];
      
      // Construct file path
      const fileName = file.file_url.split('/').pop();
      const filePath = path.join(process.cwd(), 'uploads', fileName);

      // Check if file exists on disk
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          error: 'File not found on disk',
          message: 'File was deleted or moved'
        });
      }

      // Set headers for download
      res.setHeader('Content-Type', file.mime_type);
      res.setHeader('Content-Disposition', `attachment; filename="${file.file_name}"`);
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to download file',
      details: error.message
    });
  }
});

// DELETE /api/files/:file_id - Delete a file
router.delete('/:file_id', async (req, res) => {
  try {
    const { file_id } = req.params;
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Get file information
      const [files] = await mysqlConnection.execute(`
        SELECT * FROM customer_files WHERE id = ?
      `, [file_id]);

      if (files.length === 0) {
        return res.status(404).json({
          error: 'File not found',
          message: 'File could not be found'
        });
      }

      const file = files[0];

      // Delete file from disk
      const fileName = file.file_url.split('/').pop();
      const filePath = path.join(process.cwd(), 'uploads', fileName);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete file record from database
      await mysqlConnection.execute(`
        DELETE FROM customer_files WHERE id = ?
      `, [file_id]);

      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
        data: {
          deleted_file: {
            id: file.id,
            file_name: file.file_name
          },
          deleted_at: new Date().toISOString()
        }
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to delete file',
      details: error.message
    });
  }
});

// GET /api/files/stats - Get file storage statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Get total file count and size
      const [stats] = await mysqlConnection.execute(`
        SELECT 
          COUNT(*) as total_files,
          COUNT(DISTINCT customer_id) as customers_with_files
        FROM customer_files
      `);

      // Get files by type (using file extension)
      const [fileTypes] = await mysqlConnection.execute(`
        SELECT 
          SUBSTRING_INDEX(file_name, '.', -1) as file_type,
          COUNT(*) as count
        FROM customer_files
        GROUP BY SUBSTRING_INDEX(file_name, '.', -1)
        ORDER BY count DESC
      `);

      // Get recent uploads
      const [recentUploads] = await mysqlConnection.execute(`
        SELECT 
          cf.file_name,
          cf.uploaded_at,
          c.customer_name
        FROM customer_files cf
        JOIN customers c ON cf.customer_id = c.id
        ORDER BY cf.uploaded_at DESC
        LIMIT 10
      `);

      res.status(200).json({
        success: true,
        data: {
          overview: stats[0],
          file_types: fileTypes,
          recent_uploads: recentUploads
        }
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error fetching file stats:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch file statistics',
      details: error.message
    });
  }
});

export default router;
