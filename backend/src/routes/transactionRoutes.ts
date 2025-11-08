import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/authMiddleware';
import { calculateTransactionStats } from '../utils/calculateStats';

const router = Router();
const prisma = new PrismaClient();

router.post('/', authenticateToken, async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items are required' });
  }

  try {
    const bookDetails: any[] = [];
    for (const item of items) {
      const book = await prisma.books.findUnique({ 
        where: { id: item.book_id, deleted_at: null } 
      });
      if (!book) return res.status(404).json({ error: `Book ${item.book_id} not found` });
      
      if (book.stock_quantity < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for "${book.title}". Available: ${book.stock_quantity}` 
        });
      }
      bookDetails.push({ ...book, requestedQty: item.quantity });
    }

    const order = await prisma.orders.create({
      data: {
        user_id: req.user!.id,
        order_items: {
          create: items.map((item: any) => ({
            book_id: item.book_id,
            quantity: item.quantity,
          })),
        },
      },
    });

    for (const book of bookDetails) {
      await prisma.books.update({
        where: { id: book.id },
        data: { stock_quantity: book.stock_quantity - book.requestedQty },
      });
    }

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Transaction failed' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const transactions = await prisma.orders.findMany({
      where: { user_id: req.user!.id },
      include: {
        order_items: { include: { book: true } },
      },
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

router.get('/:transaction_id', authenticateToken, async (req, res) => {
  try {
    const transaction = await prisma.orders.findUnique({
      where: { id: parseInt(req.params.transaction_id) },
      include: {
        order_items: { include: { book: true } },
      },
    });
    if (!transaction || transaction.user_id !== req.user!.id) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    const stats = await calculateTransactionStats(prisma);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;