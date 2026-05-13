import { Product, Review, Guide, Comparison, NewsPost } from '../types';

export const products: Product[] = [
  {
    id: 'p1',
    name: 'EcoClean Robot Vacuum',
    brand: 'EcoVacs',
    price: 299.99,
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=500&auto=format&fit=crop&q=60',
    amazonUrl: 'https://amazon.com/example-robot-vacuum',
    features: ['Lidar Mapping', 'Self-Emptying', 'Mop Combo'],
    pros: ['Excellent navigation', 'Quiet operation'],
    cons: ['Small dustbin', 'App can be buggy']
  },
  {
    id: 'p2',
    name: 'SoundPro Noise Cancelling Headphones',
    brand: 'AudioTech',
    price: 349.00,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
    amazonUrl: 'https://amazon.com/example-headphones',
    features: ['Active Noise Cancelling', '40h Battery Life', 'Multi-point Bluetooth'],
    pros: ['Superior sound quality', 'Very comfortable'],
    cons: ['Expensive', 'Bulky case']
  }
];

export const reviews: Review[] = [
  {
    id: 'r1',
    slug: 'ecoclean-robot-vacuum-review',
    title: 'EcoClean Robot Vacuum Review: The Best Mid-Range Option?',
    summary: 'A deep dive into the EcoClean robot vacuum, exploring its mapping capabilities and cleaning performance.',
    content: 'Full content of the review goes here...',
    productId: 'p1',
    date: '2023-10-15',
    author: 'John Doe',
    score: 90
  }
];

export const guides: Guide[] = [
  {
    id: 'g1',
    slug: 'best-robot-vacuums-2023',
    title: 'Best Robot Vacuums of 2023: A Complete Buying Guide',
    category: 'Home Appliances',
    excerpt: 'Looking for a robot vacuum? We tested the top models to help you find the perfect one for your home.',
    content: 'Full guide content here...',
    date: '2023-11-01',
    author: 'Jane Smith',
    recommendedProducts: ['p1']
  }
];

export const comparisons: Comparison[] = [
  {
    id: 'c1',
    slug: 'ecoclean-vs-roomba',
    title: 'EcoClean Robot Vacuum vs. Roomba J7+: Which Is Better?',
    products: ['p1', 'p2'], // In reality would be two comparable products
    criteria: ['Suction Power', 'Navigation', 'Price', 'App Features'],
    winnerId: 'p1',
    date: '2023-11-10'
  }
];

export const newsPosts: NewsPost[] = [
  {
    id: 'n1',
    slug: 'new-amazon-affiliate-tools',
    title: 'Amazon Launches New Tools for Content Creators',
    excerpt: 'Amazon recently announced a suite of new tools designed to help affiliate marketers track performance.',
    content: 'Full news article here...',
    date: '2023-12-05',
    author: 'Editor',
    imageUrl: 'https://images.unsplash.com/photo-1523475496153-3d6cc0f0bf19?w=500&auto=format&fit=crop&q=60'
  }
];
