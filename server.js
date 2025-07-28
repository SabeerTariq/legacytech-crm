import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import createUserHandler from './api/admin/create-user-clean.js';
import deleteUserHandler from './api/admin/delete-user.js';
import updateUserHandler from './api/admin/update-user.js';
import rolesRouter from './api/admin/roles.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Admin API routes
app.post('/api/admin/create-user', createUserHandler);
app.delete('/api/admin/delete-user', deleteUserHandler);
app.put('/api/admin/update-user', updateUserHandler);
app.use('/api/admin/roles', rolesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Admin API server is running' });
});

app.listen(PORT, () => {
  console.log(`Admin API server running on port ${PORT}`);
}); 