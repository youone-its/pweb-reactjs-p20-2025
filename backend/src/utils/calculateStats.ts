import { PrismaClient } from '@prisma/client';

export const calculateTransactionStats = async (prisma: PrismaClient) => {
  const totalTransactions = await prisma.orders.count();

  const transactions = await prisma.orders.findMany({
    include: { order_items: { include: { book: true } } },
  });

  let totalRevenue = 0;
  for (const t of transactions) {
    let orderTotal = 0;
    for (const item of t.order_items) {
      orderTotal += Number(item.book.price) * item.quantity;
    }
    totalRevenue += orderTotal;
  }
  const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  const genreStats = await prisma.$queryRaw<any[]>`
    SELECT 
      g.name AS genre_name,
      COUNT(oi.id) AS transaction_count
    FROM genres g
    JOIN books b ON g.id = b.genre_id
    JOIN order_items oi ON b.id = oi.book_id
    WHERE g.deleted_at IS NULL AND b.deleted_at IS NULL
    GROUP BY g.id, g.name
    ORDER BY transaction_count DESC
  `;

  const mostGenre = genreStats[0]?.genre_name || null;
  const leastGenre = genreStats.length > 0 ? genreStats[genreStats.length - 1]?.genre_name : null;

  return {
    totalTransactions,
    averageTransactionValue: avgTransaction,
    mostPopularGenre: mostGenre,
    leastPopularGenre: leastGenre,
  };
};