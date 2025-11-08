import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

const getPagination = (page: string | undefined, limit: string | undefined) => {
  const take = limit ? parseInt(limit) : 10;
  const skip = page ? (parseInt(page) - 1) * take : 0;
  return { take, skip };
};

router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  const { title, writer, publisher, publication_year, description, price, stock_quantity, genre_id } = req.body;
  try {
    const book = await prisma.books.create({
      data: { title, writer, publisher, publication_year, description, price: parseFloat(price), stock_quantity, genre_id },
    });
    res.status(201).json(book);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Book title already exists' });
    }
    res.status(500).json({ error: 'Failed to create book' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  const { 
    page = '1', 
    limit = '10', 
    genre_id, 
    search,
    sort 
  } = req.query;

  const take = limit ? parseInt(limit as string) : 10;
  const skip = page ? (parseInt(page as string) - 1) * take : 0;

  const where: any = { 
    deleted_at: null,
    stock_quantity: { gt: 0 }
  };
  if (genre_id) where.genre_id = parseInt(genre_id as string);
  if (search) where.title = { contains: search as string, mode: 'insensitive' };

  let orderBy: any = { title: 'asc' };

  if (sort === 'price-asc') {
    orderBy = { price: 'asc' };
  } else if (sort === 'price-desc') {
    orderBy = { price: 'desc' };
  } else if (sort === 'title-asc') {
    orderBy = { title: 'asc' };
  } else if (sort === 'title-desc') {
    orderBy = { title: 'desc' };
  }

  try {
    let books;
    let total;

    if (sort === 'sold-desc' || sort === 'sold-asc') {
      const direction = sort === 'sold-desc' ? 'DESC' : 'ASC';
      
      interface BookWithSold {
        id: number;
        title: string;
        writer: string;
        publisher: string;
        publication_year: number;
        description: string | null;
        price: any;
        stock_quantity: number;
        genre_id: number;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        total_sold: number;
      }

      const bookQuery = `
        SELECT 
          b.id,
          b.title,
          b.writer,
          b.publisher,
          b.publication_year,
          b.description,
          b.price,
          b.stock_quantity,
          b.genre_id,
          b.created_at,
          b.updated_at,
          b.deleted_at,
          COALESCE(SUM(oi.quantity), 0) AS total_sold
        FROM books b
        LEFT JOIN order_items oi ON b.id = oi.book_id
        WHERE b.deleted_at IS NULL AND b.stock_quantity > 0
        ${genre_id ? `AND b.genre_id = ${parseInt(genre_id as string)}` : ''}
        ${search ? `AND LOWER(b.title) LIKE LOWER('%${(search as string).replace(/'/g, "''")}%')` : ''}
        GROUP BY b.id, b.title, b.writer, b.publisher, b.publication_year, b.description, b.price, b.stock_quantity, b.genre_id, b.created_at, b.updated_at, b.deleted_at
        ORDER BY total_sold ${direction}, b.title ASC
        LIMIT ${take} OFFSET ${skip}
      `;

      const countQuery = `
        SELECT COUNT(*) as count
        FROM books b
        WHERE b.deleted_at IS NULL AND b.stock_quantity > 0
        ${genre_id ? `AND b.genre_id = ${parseInt(genre_id as string)}` : ''}
        ${search ? `AND LOWER(b.title) LIKE LOWER('%${(search as string).replace(/'/g, "''")}%')` : ''}
      `;

      const booksRaw = await prisma.$queryRawUnsafe<BookWithSold[]>(bookQuery);
      const countRaw: { count: string }[] = await prisma.$queryRawUnsafe(countQuery);
      total = parseInt(countRaw[0].count);

      books = booksRaw.map(book => ({
        ...book,
        price: book.price.toString(),
        created_at: book.created_at.toISOString(),
        updated_at: book.updated_at.toISOString(),
        deleted_at: book.deleted_at ? book.deleted_at.toISOString() : null,
        genre: {
          id: book.genre_id,
          name: '',
          created_at: '',
          updated_at: '',
          deleted_at: null
        }
      }));

      const genreIds = [...new Set(books.map(b => b.genre_id))];
      if (genreIds.length > 0) {
        const genres = await prisma.genres.findMany({
          where: { id: { in: genreIds } },
          select: { id: true, name: true }
        });
        const genreMap = new Map(genres.map(g => [g.id, g.name]));
        books = books.map(book => ({
          ...book,
          genre: {
            ...book.genre,
            name: genreMap.get(book.genre_id) || 'Unknown'
          }
        }));
      }
    } 
    else {
      books = await prisma.books.findMany({
        where,
        skip,
        take,
        orderBy,
        include: { genre: { select: { name: true } } },
      });
      total = await prisma.books.count({ where });
    }

    res.json({
      books,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error('Books fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

router.get('/:book_id', async (req, res) => {
  const { book_id } = req.params;
  try {
    const book = await prisma.books.findUnique({
      where: { id: parseInt(book_id), deleted_at: null },
      include: { genre: true },
    });
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/genre/:genre_id', async (req, res) => {
  const { genre_id } = req.params;
  const { page = '1', limit = '10', search } = req.query;
  const { take, skip } = getPagination(page as string, limit as string);

  const where: any = { genre_id: parseInt(genre_id), deleted_at: null };
  if (search) where.title = { contains: search as string, mode: 'insensitive' };

  try {
    const books = await prisma.books.findMany({ 
      where, 
      skip, 
      take,
      include: { genre: { select: { name: true } } }
    });
    const total = await prisma.books.count({ where });
    res.json({
      books,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / take)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch books by genre' });
  }
});

router.patch('/:book_id', authenticateToken, async (req, res) => {
  const { book_id } = req.params;
  const { title, writer, publisher, publication_year, description, price, stock_quantity, genre_id } = req.body;

  try {
    const book = await prisma.books.update({
      where: { id: parseInt(book_id), deleted_at: null },
      data: { title, writer, publisher, publication_year, description, price, stock_quantity, genre_id },
    });
    res.json(book);
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Book not found' });
    if (error.code === 'P2002') return res.status(400).json({ error: 'Title already exists' });
    res.status(500).json({ error: 'Update failed' });
  }
});

router.delete('/:book_id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.books.update({
      where: { id: parseInt(req.params.book_id) },
      data: { deleted_at: new Date() },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

export default router;