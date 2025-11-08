import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBook, fetchGenres } from '../../api/client';
import { Genre } from '../../types';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { useAuth } from '../../auth/useAuth';

const ALLOWED_EMAILS = ['dio@gmail.com', 'yuan1@gmail.com', 'arkan1@gmail.com'];

const AddBook = () => {
  const { user } = useAuth(); 
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [writer, setWriter] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publicationYear, setPublicationYear] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [genreId, setGenreId] = useState('');
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !ALLOWED_EMAILS.includes(user.email)) {
      return;
    }
    fetchGenres()
      .then((data) => {
        setGenres(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Gagal memuat daftar genre');
        setLoading(false);
      });
  }, [user]);

  if (!user || !ALLOWED_EMAILS.includes(user.email)) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center bg-red-50 rounded border border-red-200">
        <h2 className="text-xl font-bold text-red-600 mb-2">Akses Ditolak</h2>
        <p className="text-gray-700 mb-4">
          Hanya pengguna berikut yang dapat menambah buku:
        </p>
        <ul className="text-sm text-gray-600 mb-6">
          {ALLOWED_EMAILS.map((email) => (
            <li key={email} className="inline-block mr-2 bg-gray-100 px-2 py-1 rounded">
              {email}
            </li>
          ))}
        </ul>
        <button
          onClick={() => navigate('/books')}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Kembali ke Daftar Buku
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !writer.trim() || !price || !stock || !genreId || !publicationYear) {
      setError('Semua field bertanda * wajib diisi');
      return;
    }

    const numPrice = Number(price);
    const numStock = Number(stock);
    const numYear = Number(publicationYear);
    const currentYear = new Date().getFullYear();

    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Harga harus berupa angka positif');
      return;
    }
    if (isNaN(numStock) || numStock < 0) {
      setError('Stok tidak boleh negatif');
      return;
    }
    if (isNaN(numYear) || numYear < 0 || numYear > currentYear) {
      setError(`Tahun publikasi harus antara 0 hingga ${currentYear}`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await createBook({
        title,
        writer,
        publisher,
        publication_year: numYear,
        description: description.trim() || undefined,
        price: numPrice,
        stock_quantity: numStock,
        genre_id: Number(genreId),
      });
      navigate('/books');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Gagal menambah buku. Coba lagi.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tambah Buku Baru</h1>
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Judul *</label>
          <input
            type="text"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-gray-300"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul buku"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Penulis *</label>
          <input
            type="text"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-gray-300"
            value={writer}
            onChange={(e) => setWriter(e.target.value)}
            placeholder="Nama penulis"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Penerbit</label>
          <input
            type="text"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-gray-300"
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            placeholder="Nama penerbit"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Tahun Publikasi *</label>
          <input
            type="number"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-gray-300"
            value={publicationYear}
            onChange={(e) => setPublicationYear(e.target.value)}
            min="0"
            max={new Date().getFullYear()}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Harga (Rp) *</label>
          <input
            type="number"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-gray-300"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="1"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Stok *</label>
          <input
            type="number"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-gray-300"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            min="0"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Genre *</label>
          <select
            className="w-full p-2 border rounded focus:ring-2 focus:ring-gray-300"
            value={genreId}
            onChange={(e) => setGenreId(e.target.value)}
          >
            <option value="">Pilih genre</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Deskripsi</label>
          <textarea
            className="w-full p-2 border rounded focus:ring-2 focus:ring-gray-300"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Opsional"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? 'Menyimpan...' : 'Simpan Buku'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/books')}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBook;