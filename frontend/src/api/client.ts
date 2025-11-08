import axios from 'axios';
import { User } from '../types/index';

const API = axios.create({
  baseURL: 'http://localhost:5000',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (email: string, password: string) =>
  API.post<{ token: string; user: User }>('/auth/login', { email, password }).then(res => res.data);

export const register = (email: string, password: string) =>
  API.post<{ token: string; user: User }>('/auth/register', { email, password }).then(res => res.data);

export const fetchCurrentUser = () => API.get<User>('/auth/me').then(res => res.data);

export const fetchBooks = (params?: Record<string, any>) =>
  API.get('/books', { params }).then(res => res.data);

export const fetchBookById = (id: number) =>
  API.get(`/books/${id}`).then(res => res.data);

export const createBook = (data: any) => API.post('/books', data);
export const updateBook = (id: number, data: any) => API.patch(`/books/${id}`, data);
export const deleteBook = (id: number) => API.delete(`/books/${id}`);

export const fetchGenres = () => API.get('/genre').then(res => res.data);

export const createTransaction = (items: { book_id: number; quantity: number }[]) =>
  API.post('/transactions', { items });

export const fetchTransactions = (params?: Record<string, any>) =>
  API.get('/transactions', { params }).then(res => res.data);

export const fetchTransactionById = (id: number) =>
  API.get(`/transactions/${id}`).then(res => res.data);

export const fetchTransactionStats = () =>
  API.get('/transactions/statistics').then(res => res.data);