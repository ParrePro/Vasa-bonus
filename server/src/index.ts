import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import classRoutes from './routes/classes';
import pointsRoutes from './routes/points';
import rolesRoutes from './routes/roles';
import schoolsRoutes from './routes/schools';
import dbRoutes from './routes/db';
import rpcRoutes from './routes/rpc';
import storageRoutes from './routes/storage';
import functionsRoutes from './routes/functions';
import giftsRoutes from './routes/gifts';
import profilesRoutes from './routes/profiles';
import contactRoutes from './routes/contact';
import { startReminderScheduler } from './scheduler';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Parse CORS origins from environment variable
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080', 'http://127.0.0.1:8080'];

console.log('CORS origins:', corsOrigins);

// Middleware
app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/schools', schoolsRoutes);
app.use('/api/db', dbRoutes);
app.use('/api/rpc', rpcRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/functions', functionsRoutes);
app.use('/api/gifts', giftsRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/contact', contactRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  
  // Start the reminder scheduler for follow-up emails
  startReminderScheduler();
});
