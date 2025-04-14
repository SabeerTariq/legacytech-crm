import app from './app';
import { config } from './config/env.config';
import sequelize, { testConnection } from './config/database.config';

const PORT = config.port;

// Function to start the server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Sync database models (in development)
    if (config.nodeEnv === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Database synced successfully');
    }

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
