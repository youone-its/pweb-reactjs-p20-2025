import React, { useState } from 'react';
import { Book } from '../types';
import { Link, useNavigate } from 'react-router-dom';

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  const handleBuyNow = () => {
    if (quantity < 1) {
      setError('Jumlah minimal 1');
      return;
    }
    if (quantity > book.stock_quantity) {
      setError(`Stok hanya tersedia ${book.stock_quantity}`);
      return;
    }
    setError('');

    const cart = [{ book_id: book.id, quantity }];
    localStorage.setItem('cart', JSON.stringify(cart));
    navigate('/checkout');
  };

  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-md transition flex flex-col h-full">
      <div className="flex-1">
        <h3 className="font-bold text-lg mb-1">{book.title}</h3>
        <p className="text-gray-600 text-sm">Penulis: {book.writer}</p>
        <p className="text-gray-600 text-sm">Genre: {book.genre.name}</p>
        <p className="text-orange-600 font-medium mt-2">Rp{Number(book.price).toLocaleString()}</p>
        <p className="text-gray-500 text-sm mt-1">Stok: {book.stock_quantity}</p>
        
        <div className="mt-3">
          <label className="block text-sm text-gray-700 mb-1">Jumlah:</label>
          <input
            type="number"
            min="1"
            max={book.stock_quantity}
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              setQuantity(Math.max(1, Math.min(val, book.stock_quantity)));
              setError('');
            }}
            className="w-full p-1 border rounded text-sm"
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      </div>
      
      <div className="mt-3 flex flex-col gap-2">
        <button
          onClick={handleBuyNow}
          disabled={book.stock_quantity <= 0}
          className={`w-full py-2 rounded text-white font-medium ${
            book.stock_quantity > 0
              ? 'bg-orange-500 hover:bg-orange-600'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {book.stock_quantity > 0 ? 'Beli Sekarang' : 'Stok Habis'}
        </button>
        
        <Link
          to={`/books/${book.id}`}
          className="text-center text-gray-500 hover:underline text-sm"
        >
          Lihat Detail
        </Link>
      </div>
    </div>
  );
};

export default BookCard;