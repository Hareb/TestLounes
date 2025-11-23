import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Routes
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import instructorRoutes from './routes/instructor.routes';
import vehicleRoutes from './routes/vehicle.routes';
import lessonRoutes from './routes/lesson.routes';
import paymentRoutes from './routes/payment.routes';
import invoiceRoutes from './routes/invoice.routes';
import dashboardRoutes from './routes/dashboard.routes';
import pdfRoutes from './routes/pdf.routes';

// Middleware
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============================================
// ROUTES
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Auto-École Management API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/pdf', pdfRoutes);

// ============================================
// ERROR HANDLING
// ============================================

app.use(errorHandler);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// ============================================
// SERVER START
// ============================================

app.listen(PORT, () => {
  console.log(`\n🚗 Auto-École API démarrée sur le port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health\n`);
});

export default app;
