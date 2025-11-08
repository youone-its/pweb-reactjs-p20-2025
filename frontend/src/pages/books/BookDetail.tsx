import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBookById, deleteBook } from '../../api/client';
import { Book } from '../../types';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { useAuth } from '../../auth/useAuth';

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const ALLOWED_EMAILS = ['dio@gmail.com', 'yuan1@gmail.com', 'arkan1@gmail.com'];
  const canDelete = user && ALLOWED_EMAILS.includes(user.email);

  useEffect(() => {
    if (!id) {
      setError('ID buku tidak valid');
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchBookById(Number(id))
      .then(setBook)
      .catch(() => setError('Buku tidak ditemukan'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Yakin ingin menghapus buku ini? Tindakan tidak bisa dibatalkan.')) return;
    setDeleting(true);
    try {
      await deleteBook(Number(id));
      navigate('/books');
    } catch (err) {
      setError('Gagal menghapus buku');
      setDeleting(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!book) return <ErrorMessage message="Buku tidak ditemukan" />;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">{book.title}</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p><span className="font-semibold text-gray-700">Penulis:</span> {book.writer}</p>
            <p><span className="font-semibold text-gray-700">Penerbit:</span> {book.publisher}</p>
            <p><span className="font-semibold text-gray-700">Tahun Publikasi:</span> {book.publication_year}</p>
            <p><span className="font-semibold text-gray-700">Genre:</span> {book.genre.name}</p>
          </div>
          <div>
            <p><span className="font-semibold text-gray-700">Harga:</span> Rp{Number(book.price).toLocaleString()}</p>
            <p><span className="font-semibold text-gray-700">Stok Tersedia:</span> {book.stock_quantity}</p>
            <p><span className="font-semibold text-gray-700">ID Buku:</span> #{book.id}</p>
            <p className="text-sm text-gray-500">
              Ditambahkan: {new Date(book.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {book.description && (
          <div className="mt-6 pt-4 border-t">
            <h3 className="font-semibold text-gray-700 mb-2">Deskripsi</h3>
            <p className="text-gray-700">{book.description}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate('/books')}
          className="bg-gray-500 text-white px-5 py-2 rounded hover:bg-gray-600"
        >
          ← Kembali ke Daftar
        </button>
        
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-500 text-white px-5 py-2 rounded hover:bg-red-600 disabled:opacity-50 flex items-center"
          >
            {deleting ? 'Menghapus...' : 'Hapus Buku'}
          </button>
        )}
      </div>
    </div>
  );
};

export default BookDetail;