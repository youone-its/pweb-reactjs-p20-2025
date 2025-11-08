import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import BookList from './pages/books/BookList';
import AddBook from './pages/books/AddBook';
import BookDetail from './pages/books/BookDetail';
import Checkout from './pages/Checkout';
import TransactionList from './pages/transactions/TransactionList';
import TransactionDetail from './pages/transactions/TransactionDetail';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/books" element={<BookList />} />
              <Route path="/books/add" element={<AddBook />} />
              <Route path="/books/:id" element={<BookDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/transactions" element={<TransactionList />} />
              <Route path="/transactions/:id" element={<TransactionDetail />} />
            </Route>
            <Route path="/" element={<Navigate to="/books" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;