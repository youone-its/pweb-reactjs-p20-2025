export interface User {
  id: number;
  email: string;
  username?: string;
}

export interface Genre {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Book {
  id: number;
  title: string;
  writer: string;
  publisher: string;
  publication_year: number;
  description: string | null;
  price: string;
  stock_quantity: number;
  genre_id: number;
  genre: Genre;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface OrderItem {
  id: number;
  quantity: number;
  book_id: number;
  book: Book;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
}

export{}