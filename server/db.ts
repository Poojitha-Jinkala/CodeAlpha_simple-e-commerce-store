import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Product, Order } from '../src/types';

const DB_FILE = path.join(process.cwd(), 'db.json');

export interface DBUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  isAdmin: boolean;
}

export interface DBStructure {
  users: DBUser[];
  products: Product[];
  orders: Order[];
}

// Simple standard SHA256 password hashing
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Initial seed data
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Solace Noise Cancelling Headphones',
    description: 'Immerse yourself in pure sound with industry-leading hybrid active noise cancellation, high-fidelity audio drivers, and comfortable ergonomic memory foam cushions. Enjoy up to 40 hours of seamless playback on a single charge.',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    category: 'Audio',
    stock: 15,
    rating: 4.8,
    reviewsCount: 124
  },
  {
    id: 'prod-2',
    name: 'Aura Minimalist Mechanical Keyboard',
    description: 'A beautiful tenkeyless mechanical keyboard featuring hot-swappable tactile switches, double-shot PBT keycaps, and custom ambient white LED backlighting. Housed in a premium CNC aluminum frame with high-quality acoustic dampening.',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=80',
    category: 'Electronics',
    stock: 8,
    rating: 4.7,
    reviewsCount: 89
  },
  {
    id: 'prod-3',
    name: 'Vertex Smart Sport Watch',
    description: 'Track your health and maximize your performance with style. Features a vibrant, scratch-resistant AMOLED display, built-in dual-band GPS, continuous heart rate and SpO2 tracking, and up to 14 days of battery life.',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
    category: 'Wearables',
    stock: 20,
    rating: 4.5,
    reviewsCount: 56
  },
  {
    id: 'prod-4',
    name: 'NeoBuds Pro Wireless Earbuds',
    description: 'True wireless earbuds delivering exceptional studio-grade audio with active ambient transparency. Includes IPX7 water resistance, custom touch controls, and an ultra-compact USB-C charging case with wireless charging support.',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
    category: 'Audio',
    stock: 25,
    rating: 4.6,
    reviewsCount: 142
  },
  {
    id: 'prod-5',
    name: 'Luna Ceramic Ambient Lamp',
    description: 'Add a warm, peaceful glow to any room. Individually hand-crafted from textured premium ceramic, featuring touch-sensitive continuous brightness dimming, an eco-friendly warm LED element, and a braided linen power cable.',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
    category: 'Home & Living',
    stock: 12,
    rating: 4.9,
    reviewsCount: 38
  },
  {
    id: 'prod-6',
    name: 'Atlas Waterproof Backpack',
    description: 'The ultimate commuter and travel companion. Crafted from durable, highly water-resistant ballistic nylon, featuring a padded 16-inch laptop compartment, ergonomic back ventilation, and hidden anti-theft security pockets.',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    category: 'Wearables',
    stock: 18,
    rating: 4.4,
    reviewsCount: 73
  },
  {
    id: 'prod-7',
    name: 'Nomad MagSafe Leather Phone Case',
    description: 'Constructed from rich, sustainably sourced vegetable-tanned leather that develops a beautiful unique patina over time. Fully compatible with MagSafe chargers and accessories with high-performance 10ft drop protection.',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80',
    category: 'Electronics',
    stock: 30,
    rating: 4.3,
    reviewsCount: 95
  },
  {
    id: 'prod-8',
    name: 'Metro Ergonomic Task Chair',
    description: 'Reclaim your posture and workspace. Engaged with 3D adjustable armrests, responsive dynamic lumbar support, tilt-tension recline settings, and an ultra-breathable mesh back panel keeping you cool and focused throughout the day.',
    price: 349.99,
    image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&auto=format&fit=crop&q=80',
    category: 'Home & Living',
    stock: 6,
    rating: 4.7,
    reviewsCount: 29
  }
];

function getInitialDB(): DBStructure {
  return {
    users: [
      {
        id: 'user-admin',
        username: 'admin',
        email: 'admin@store.com',
        passwordHash: hashPassword('admin123'),
        isAdmin: true
      },
      {
        id: 'user-customer',
        username: 'user',
        email: 'user@store.com',
        passwordHash: hashPassword('user123'),
        isAdmin: false
      }
    ],
    products: DEFAULT_PRODUCTS,
    orders: []
  };
}

export function readDB(): DBStructure {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDB();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading DB:', error);
    return getInitialDB();
  }
}

export function writeDB(data: DBStructure): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing DB:', error);
  }
}
