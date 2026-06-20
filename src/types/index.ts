export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  rating: number;
  imageUrl: string;
  amazonUrl: string;
  features: string[];
  pros: string[];
  cons: string[];
}

export interface Review {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  productId: string;
  date: string;
  author: string;
  score: number;
}

export interface Guide {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  recommendedProducts: string[]; // Product IDs
}

export interface Comparison {
  id: string;
  slug: string;
  title: string;
  products: string[]; // Product IDs
  criteria: string[];
  winnerId: string;
  date: string;
}

export interface NewsPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  imageUrl: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  sourceUrl: string;
  competitor: string;
  createdAt: string;
}

export interface BenchmarkRecord {
  id: string;
  timestamp: string;
  source: string;
  articleCount: number;
}
