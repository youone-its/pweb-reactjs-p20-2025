import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBookById, createTransaction } from '../api/client';
import { Book } from '../types';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const Checkout = () => {
  const [cartItems, setCartItems] = useState<{ book_id: number; quantity: number }[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadCart = async () => {
      try {
        const cartStr = localStorage.getItem('cart');
        if (!cartStr) {
          navigate('/books');
          return;
        }
        const cart = JSON.parse(cartStr);
        if (!Array.isArray(cart) || cart.length === 0) {
          navigate('/books');
          return;
        }
        setCartItems(cart);

        const bookPromises = cart.map((item: any) => fetchBookById(item.book_id));
        const bookData = await Promise.all(bookPromises);
        setBooks(bookData);
      } catch (err) {
        console.error('Checkout error:', err);
        setError('Gagal memuat data buku');
        navigate('/books');
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, [navigate]);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setSubmitting(true);
    setError('');
    try {
        await createTransaction(cartItems);
        localStorage.removeItem('cart');
        
        setTimeout(() => {
        navigate('/books');
        }, 2000);
    } catch (err: any) {
        const msg = err.response?.data?.error || 'Pembelian gagal. Coba lagi.';
        setError(msg);
        setSubmitting(false);
    }
    };

  const total = books.reduce((sum, book, index) => {
    return sum + Number(book.price) * (cartItems[index]?.quantity || 1);
  }, 0);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Konfirmasi Pembelian</h1>
      <div className="border rounded-lg overflow-hidden mb-6">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Buku</th>
              <th className="text-center p-3">Jumlah</th>
              <th className="text-right p-3">Harga</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book, index) => (
              <tr key={book.id} className="border-t">
                <td className="p-3">{book.title}</td>
                <td className="text-center p-3">{cartItems[index]?.quantity || 1}</td>
                <td className="text-right p-3">
                  Rp{Number(book.price).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="font-bold bg-gray-50">
            <tr>
              <td colSpan={2} className="p-3 text-right">Total:</td>
              <td className="text-right p-3">Rp{total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleCheckout}
          disabled={submitting}
          className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
        >
          {submitting ? 'Memproses...' : 'Bayar Sekarang'}
        </button>
        <button
          onClick={() => navigate('/books')}
          className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
        >
          Batal
        </button>
      </div>
    </div>
  );
};

export default Checkout;