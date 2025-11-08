import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBooks, fetchGenres } from '../../api/client';
import { Book, Genre } from '../../types';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import BookCard from '../../components/BookCard';

const BookList = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [sort, setSort] = useState('title-asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError('');
      const params: any = { 
        page: page.toString(), 
        limit: '10',
        sort
      };
      if (search) params.search = search;
      if (genreFilter) params.genre_id = genreFilter;

      console.log('Fetching books with params:', params);

      const res = await fetchBooks(params);
      console.log('API Response:', res);

      setBooks(res.books || []);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      console.error('Fetch books error:', err);
      setError('Gagal memuat buku');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [page, search, genreFilter, sort]);

  useEffect(() => {
    fetchGenres()
      .then(setGenres)
      .catch(() => console.error('Gagal memuat genre'));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Daftar Buku</h1>

      <div className="mb-6 flex flex-col md:flex-row gap-3 flex-wrap items-start md:items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Cari Judul</label>
          <input
            type="text"
            placeholder="Cari buku..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="min-w-[180px]">
          <label className="block text-sm font-medium mb-1">Genre</label>
          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Semua Genre</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Urutkan Berdasarkan</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="title-asc">Judul (A-Z)</option>
            <option value="title-desc">Judul (Z-A)</option>
            <option value="price-asc">Harga Termurah</option>
            <option value="price-desc">Harga Termahal</option>
          </select>
        </div>

        <div className="pt-6">
          <button
            onClick={() => navigate('/books/add')}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 whitespace-nowrap"
          >
            Tambah Buku
          </button>
        </div>
      </div>

      {loading && <Loading />}
      {error && <ErrorMessage message={error} />}
      {!loading && !error && books.length === 0 && (
        <p className="text-gray-500 py-8 text-center">Tidak ada buku ditemukan.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center space-x-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className={`px-3 py-1 rounded ${page === 1 ? 'bg-gray-200 text-gray-400' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Sebelumnya
          </button>
          
          {[...Array(totalPages)].map((_, i) => {
            const pageNum = i + 1;
            if (pageNum === 1 || pageNum === totalPages || (pageNum >= page - 1 && pageNum <= page + 1)) {
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1 rounded ${page === pageNum ? 'bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  {pageNum}
                </button>
              );
            }
            if (pageNum === page - 2 || pageNum === page + 2) {
              return <span key={`ellipsis-${pageNum}`} className="px-2">...</span>;
            }
            return null;
          })}

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className={`px-3 py-1 rounded ${page === totalPages ? 'bg-gray-200 text-gray-400' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
};

export default BookList;