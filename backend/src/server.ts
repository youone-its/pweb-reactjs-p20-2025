import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import bookRoutes from './routes/bookRoutes';
import genreRoutes from './routes/genreRoutes';
import transactionRoutes from './routes/transactionRoutes';
import { authenticateToken } from './middleware/authMiddleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/books', bookRoutes);
app.use('/genre', genreRoutes);
app.use('/transactions', authenticateToken, transactionRoutes);

app.get('/health', (_req, res) => res.json({ status: 'OK', service: 'IT Literature Shop Backend' }));

app.listen(PORT, () => {
  console.log(`IT Literature Shop Backend running on http://localhost:${PORT}`);
});