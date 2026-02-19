import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import companyUserRoutes from './routes/companyUserRoutes.js';

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/company/users', companyUserRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
