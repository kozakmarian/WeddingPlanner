import cors from 'cors';
import express from 'express';
import { AppError, errorHandler } from './lib/errors.js';
import authRoutes from './modules/auth/auth.routes.js';
import weddingRoutes from './modules/wedding-settings/wedding.routes.js';
import guestRoutes from './modules/guests/guests.routes.js';
import budgetRoutes from './modules/budget/budget.routes.js';
import taskRoutes from './modules/tasks/tasks.routes.js';

const knownApiRoutes: { pattern: RegExp; methods: string[] }[] = [
  { pattern: /^\/api\/health\/?$/, methods: ['GET', 'HEAD'] },
  { pattern: /^\/api\/auth\/(?:register|login)\/?$/, methods: ['POST'] },
  { pattern: /^\/api\/auth\/me\/?$/, methods: ['GET', 'HEAD'] },
  { pattern: /^\/api\/wedding\/?$/, methods: ['GET', 'HEAD', 'PUT'] },
  { pattern: /^\/api\/guests\/?$/, methods: ['GET', 'HEAD', 'POST'] },
  { pattern: /^\/api\/guests\/[^/]+\/?$/, methods: ['GET', 'HEAD', 'PUT', 'DELETE'] },
  { pattern: /^\/api\/(?:budget|budget-items)\/?$/, methods: ['GET', 'HEAD', 'POST'] },
  {
    pattern: /^\/api\/(?:budget|budget-items)\/[^/]+\/?$/,
    methods: ['GET', 'HEAD', 'PUT', 'DELETE'],
  },
  { pattern: /^\/api\/tasks\/?$/, methods: ['GET', 'HEAD', 'POST'] },
  { pattern: /^\/api\/tasks\/[^/]+\/?$/, methods: ['GET', 'HEAD', 'PUT', 'DELETE'] },
];

export const app = express();
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';
app.use(cors({ origin: frontendOrigin }));
app.use(express.json());
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/wedding', weddingRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/budget-items', budgetRoutes);
app.use('/api/tasks', taskRoutes);
app.use((req, res, next) => {
  const path = req.originalUrl.split('?')[0];
  if (path !== '/api' && !path.startsWith('/api/')) return next();

  const route = knownApiRoutes.find(({ pattern }) => pattern.test(path));
  if (route) {
    res.set('Allow', route.methods.join(', '));
    return next(
      new AppError(405, 'HTTP method is not allowed for this endpoint.', 'METHOD_NOT_ALLOWED'),
    );
  }
  return next(new AppError(404, 'API endpoint not found.', 'NOT_FOUND'));
});
app.use(errorHandler);
