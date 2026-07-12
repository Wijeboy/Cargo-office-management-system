import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import customerRoutes from './src/routes/customerRoutes.js';
import inquiryRoutes from './src/routes/inquiryRoutes.js';
import complaintRoutes from './src/routes/complaintRoutes.js';
import feedbackRoutes from './src/routes/feedbackRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Initialize Prisma Client
const prisma = new PrismaClient();

// Middleware
app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(
  express.urlencoded({
    limit: '10mb',
    extended: true,
  }),
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check route
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.json({
      status: 'OK',
      message:
        'LogiFlow Cargo Management API is running and database is connected.',
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Health check error:', error);

    return res.status(500).json({
      status: 'ERROR',
      message: 'API is running but database connection failed.',
      error: error.message,
    });
  }
});

// Root route
app.get('/', (req, res) => {
  return res.json({
    message: 'Welcome to LogiFlow Cargo Office Management API',
  });
});

// 404 handler
app.use((req, res) => {
  return res.status(404).json({
    status: 404,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack || err);

  return res.status(err.status || 500).json({
    status: err.status || 500,
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
  });
});

// Start server
const server = app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`👉 Health check: http://localhost:${port}/api/health`);
  console.log(`👉 Customer API: http://localhost:${port}/api/customers`);
});

// Handle graceful shutdown
const gracefulShutdown = async () => {
  console.log('Shutting down server gracefully...');

  server.close(async () => {
    console.log('HTTP server closed.');

    await prisma.$disconnect();

    console.log('Prisma Client disconnected.');

    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);