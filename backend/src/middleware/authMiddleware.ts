import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email: string };
    }
  }
}

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const userEmail = req.user?.email;
  const allowedEmails = ['dio@gmail.com', 'yuan1@gmail.com', 'arkan1@gmail.com'];

  if (!userEmail || !allowedEmails.includes(userEmail)) {
    return res.status(403).json({ error: 'Forbidden: Admin only' });
  }

  next();
};

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; email: string };
    const user = await prisma.users.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(403).json({ error: 'Invalid token' });

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};