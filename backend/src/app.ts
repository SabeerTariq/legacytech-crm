import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/not-found.middleware';

const app: Express = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// API Routes
app.use('/api', routes);

// Handle 404 errors
app.use(notFoundHandler);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  return errorHandler(err, req, res, next);
});

export default app;
