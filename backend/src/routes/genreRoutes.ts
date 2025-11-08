import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

router.post('/', authenticateToken, async (req, res) => {
  const { name } = req.body;
  try {
    const genre = await prisma.genres.create({ data: { name } });
    res.status(201).json(genre);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Genre already exists' });
    res.status(500).json({ error: 'Failed to create genre' });
  }
});

router.get('/', async (_req, res) => {
  try {
    const genres = await prisma.genres.findMany({ where: { deleted_at: null } });
    res.json(genres);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});

router.get('/:genre_id', async (req, res) => {
  try {
    const genre = await prisma.genres.findUnique({
      where: { id: parseInt(req.params.genre_id), deleted_at: null },
    });
    if (!genre) return res.status(404).json({ error: 'Genre not found' });
    res.json(genre);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:genre_id', authenticateToken, async (req, res) => {
  try {
    const genre = await prisma.genres.update({
      where: { id: parseInt(req.params.genre_id), deleted_at: null },
      data: { name: req.body.name },
    });
    res.json(genre);
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Genre not found' });
    if (error.code === 'P2002') return res.status(400).json({ error: 'Genre name already exists' });
    res.status(500).json({ error: 'Update failed' });
  }
});

router.delete('/:genre_id', authenticateToken, async (req, res) => {
  try {
    await prisma.genres.update({
      where: { id: parseInt(req.params.genre_id) },
      data: { deleted_at: new Date() },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete genre' });
  }
});

export default router;