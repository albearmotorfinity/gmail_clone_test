import { Router } from 'express';
import { emailRoutes } from './email.routes';
import { userRoutes } from './user.routes';

export const routes = Router();

routes.use('/emails', emailRoutes);
routes.use('/users', userRoutes);

// Health check route
routes.get('/health', (req, res) => {
  res.json({ status: 'ok' });
}); 