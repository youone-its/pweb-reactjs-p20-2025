import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTransactions } from '../../api/client';
import { Transaction } from '../../types/index';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

const TransactionList = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetchTransactions()
      .then(setTransactions)
      .catch(() => setError('Gagal memuat transaksi'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Riwayat Transaksi</h1>
      </div>
      {loading && <Loading />}
      {error && <ErrorMessage message={error} />}
      {!loading && !error && transactions.length === 0 && (
        <p className="text-gray-500">Belum ada transaksi.</p>
      )}
      <div className="space-y-4">
        {transactions.map((txn) => (
          <div
            key={txn.id}
            className="border rounded p-4 hover:shadow cursor-pointer"
            onClick={() => navigate(`/transactions/${txn.id}`)}
          >
            <div className="flex justify-between">
              <span className="font-bold">Transaksi #{txn.id}</span>
              <span className="text-gray-500">
                {new Date(txn.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {txn.order_items.length} item(s)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList;