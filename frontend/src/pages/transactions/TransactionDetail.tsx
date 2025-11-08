import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTransactionById } from '../../api/client';
import { Transaction } from '../../types/index';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

const TransactionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchTransactionById(Number(id))
      .then(setTransaction)
      .catch(() => setError('Transaksi tidak ditemukan'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!transaction) return <ErrorMessage message="Transaksi tidak ditemukan" />;

  const total = transaction.order_items.reduce(
    (sum, item) => sum + Number(item.book.price) * item.quantity,
    0
  );

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Detail Transaksi #{transaction.id}</h1>
      <p className="text-gray-600 mb-4">
        Tanggal: {new Date(transaction.created_at).toLocaleString()}
      </p>
      <div className="border rounded overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">Buku</th>
              <th className="text-center p-2">Jumlah</th>
              <th className="text-right p-2">Harga</th>
            </tr>
          </thead>
          <tbody>
            {transaction.order_items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.book.title}</td>
                <td className="text-center p-2">{item.quantity}</td>
                <td className="text-right p-2">
                  Rp{Number(item.book.price).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="font-bold bg-gray-50">
            <tr>
              <td colSpan={2} className="p-2 text-right">Total:</td>
              <td className="text-right p-2">Rp{total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <button
        onClick={() => navigate('/transactions')}
        className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
      >
        Kembali ke Daftar
      </button>
    </div>
  );
};

export default TransactionDetail;