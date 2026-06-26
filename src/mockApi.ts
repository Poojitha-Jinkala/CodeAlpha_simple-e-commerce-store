// Transparent client-side fallback/mock database for GitHub Pages (static host) deployment
import { Product, Order, OrderItem, User } from './types';

// Let's copy the initial products and users from db.json
const INITIAL_PRODUCTS: Product[] = [
  {
    "id": "prod-1",
    "name": "Solace Noise Cancelling Headphones",
    "description": "Immerse yourself in pure sound with industry-leading hybrid active noise cancellation, high-fidelity audio drivers, and comfortable ergonomic memory foam cushions. Enjoy up to 40 hours of seamless playback on a single charge.",
    "price": 299.99,
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    "category": "Audio",
    "stock": 15,
    "rating": 4.8,
    "reviewsCount": 124
  },
  {
    "id": "prod-2",
    "name": "Poojitha_aura App Minimalist Mechanical Keyboard",
    "description": "A beautiful tenkeyless mechanical keyboard featuring hot-swappable tactile switches, double-shot PBT keycaps, and custom ambient white LED backlighting. Housed in a premium CNC aluminum frame with high-quality acoustic dampening.",
    "price": 149.99,
    "image": "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=80",
    "category": "Electronics",
    "stock": 8,
    "rating": 4.7,
    "reviewsCount": 89
  },
  {
    "id": "prod-3",
    "name": "Vertex Smart Sport Watch",
    "description": "Track your health and maximize your performance with style. Features a vibrant, scratch-resistant AMOLED display, built-in dual-band GPS, continuous heart rate and SpO2 tracking, and up to 14 days of battery life.",
    "price": 199.99,
    "image": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80",
    "category": "Wearables",
    "stock": 20,
    "rating": 4.5,
    "reviewsCount": 56
  },
  {
    "id": "prod-4",
    "name": "NeoBuds Pro Wireless Earbuds",
    "description": "True wireless earbuds delivering exceptional studio-grade audio with active ambient transparency. Includes IPX7 water resistance, custom touch controls, and an ultra-compact USB-C charging case with wireless charging support.",
    "price": 129.99,
    "image": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
    "category": "Audio",
    "stock": 25,
    "rating": 4.6,
    "reviewsCount": 142
  },
  {
    "id": "prod-5",
    "name": "Luna Ceramic Ambient Lamp",
    "description": "Add a warm, peaceful glow to any room. Individually hand-crafted from textured premium ceramic, featuring touch-sensitive continuous brightness dimming, an eco-friendly warm LED element, and a braided linen power cable.",
    "price": 79.99,
    "image": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80",
    "category": "Home & Living",
    "stock": 12,
    "rating": 4.9,
    "reviewsCount": 38
  },
  {
    "id": "prod-6",
    "name": "Atlas Waterproof Backpack",
    "description": "The ultimate commuter and travel companion. Crafted from durable, highly water-resistant ballistic nylon, featuring a padded 16-inch laptop compartment, ergonomic back ventilation, and hidden anti-theft security pockets.",
    "price": 89.99,
    "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
    "category": "Wearables",
    "stock": 18,
    "rating": 4.4,
    "reviewsCount": 73
  },
  {
    "id": "prod-7",
    "name": "Nomad MagSafe Leather Phone Case",
    "description": "Constructed from rich, sustainably sourced vegetable-tanned leather that develops a beautiful unique patina over time. Fully compatible with MagSafe chargers and accessories with high-performance 10ft drop protection.",
    "price": 45.00,
    "image": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80",
    "category": "Electronics",
    "stock": 30,
    "rating": 4.3,
    "reviewsCount": 95
  },
  {
    "id": "prod-8",
    "name": "Metro Ergonomic Task Chair",
    "description": "Reclaim your posture and workspace. Engaged with 3D adjustable armrests, responsive dynamic lumbar support, tilt-tension recline settings, and an ultra-breathable mesh back panel keeping you cool and focused throughout the day.",
    "price": 349.99,
    "image": "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&auto=format&fit=crop&q=80",
    "category": "Home & Living",
    "stock": 6,
    "rating": 4.7,
    "reviewsCount": 29
  }
];

interface MockDB {
  users: Array<User & { passwordHash: string }>;
  products: Product[];
  orders: Order[];
}

const INITIAL_DB: MockDB = {
  users: [
    {
      id: "user-admin",
      username: "admin",
      email: "admin@store.com",
      passwordHash: "admin123", // Simplified plain-text/match for static mock DB
      isAdmin: true
    },
    {
      id: "user-customer",
      username: "user",
      email: "user@store.com",
      passwordHash: "user123",
      isAdmin: false
    }
  ],
  products: INITIAL_PRODUCTS,
  orders: []
};

// Initialize localStorage DB if needed
function getDB(): MockDB {
  const data = localStorage.getItem('Poojitha_aura App_store_db');
  if (!data) {
    localStorage.setItem('Poojitha_aura App_store_db', JSON.stringify(INITIAL_DB));
    return INITIAL_DB;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_DB;
  }
}

function saveDB(db: MockDB) {
  localStorage.setItem('Poojitha_aura App_store_db', JSON.stringify(db));
}

// Token helper
function generateMockToken(user: any): string {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
    exp: Date.now() + 24 * 60 * 60 * 1000
  };
  return btoa(JSON.stringify(payload));
}

function decodeMockToken(token: string): any {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

function getAuthUserFromHeaders(headers: HeadersInit | undefined): any {
  if (!headers) return null;
  
  let authHeader = '';
  if (headers instanceof Headers) {
    authHeader = headers.get('authorization') || '';
  } else if (Array.isArray(headers)) {
    const found = headers.find(([key]) => key.toLowerCase() === 'authorization');
    if (found) authHeader = found[1];
  } else {
    authHeader = (headers as any)['Authorization'] || (headers as any)['authorization'] || '';
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  return decodeMockToken(token);
}

// Global window.fetch interceptor
export function setupMockApi() {
  const originalFetch = window.fetch;

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlStr = typeof input === 'string' ? input : (input instanceof URL ? input.href : input.url);
    const method = init?.method?.toUpperCase() || 'GET';
    
    // We only intercept requests directed towards "/api/"
    if (urlStr.includes('/api/')) {
      const db = getDB();
      const authUser = getAuthUserFromHeaders(init?.headers);
      
      const parsedUrl = new URL(urlStr, window.location.origin);
      const pathname = parsedUrl.pathname;
      
      let responseBody: any = null;
      let status = 200;

      try {
        const bodyData = init?.body ? JSON.parse(init.body as string) : {};

        // --- AUTH ROUTES ---
        if (pathname === '/api/auth/register' && method === 'POST') {
          const { username, email, password } = bodyData;
          if (!username || !email || !password) {
            status = 400;
            responseBody = { error: 'Username, email, and password are required.' };
          } else {
            const lowerEmail = email.toLowerCase().trim();
            const lowerUsername = username.toLowerCase().trim();
            const userExists = db.users.some(
              u => u.email.toLowerCase() === lowerEmail || u.username.toLowerCase() === lowerUsername
            );

            if (userExists) {
              status = 400;
              responseBody = { error: 'Username or email already in use.' };
            } else {
              const newUser = {
                id: 'user-' + Date.now(),
                username: username.trim(),
                email: lowerEmail,
                passwordHash: password, // Simplified
                isAdmin: false
              };
              db.users.push(newUser);
              saveDB(db);

              const token = generateMockToken(newUser);
              responseBody = {
                user: {
                  id: newUser.id,
                  username: newUser.username,
                  email: newUser.email,
                  isAdmin: newUser.isAdmin
                },
                token
              };
              status = 201;
            }
          }
        }
        else if (pathname === '/api/auth/login' && method === 'POST') {
          const { emailOrUsername, password } = bodyData;
          if (!emailOrUsername || !password) {
            status = 400;
            responseBody = { error: 'Credentials and password are required.' };
          } else {
            const searchStr = emailOrUsername.toLowerCase().trim();
            const user = db.users.find(
              u => (u.email.toLowerCase() === searchStr || u.username.toLowerCase() === searchStr) && u.passwordHash === password
            );

            if (!user) {
              status = 401;
              responseBody = { error: 'Invalid username, email, or password.' };
            } else {
              const token = generateMockToken(user);
              responseBody = {
                user: {
                  id: user.id,
                  username: user.username,
                  email: user.email,
                  isAdmin: user.isAdmin
                },
                token
              };
            }
          }
        }
        else if (pathname === '/api/auth/me' && method === 'GET') {
          if (!authUser) {
            status = 401;
            responseBody = { error: 'Session expired or not logged in.' };
          } else {
            responseBody = { user: authUser };
          }
        }

        // --- PRODUCTS ROUTES ---
        else if (pathname === '/api/products' && method === 'GET') {
          responseBody = db.products;
        }
        else if (pathname.startsWith('/api/products/') && method === 'GET') {
          const id = pathname.split('/').pop();
          const prod = db.products.find(p => p.id === id);
          if (!prod) {
            status = 404;
            responseBody = { error: 'Product not found.' };
          } else {
            responseBody = prod;
          }
        }
        else if (pathname === '/api/products' && method === 'POST') {
          if (!authUser || !authUser.isAdmin) {
            status = 403;
            responseBody = { error: 'Forbidden. Admin privileges required.' };
          } else {
            const { name, description, price, image, category, stock } = bodyData;
            const newProduct: Product = {
              id: 'prod-' + Date.now(),
              name,
              description,
              price: Number(price),
              image,
              category,
              stock: Number(stock),
              rating: 5.0,
              reviewsCount: 0
            };
            db.products.push(newProduct);
            saveDB(db);
            responseBody = newProduct;
            status = 201;
          }
        }
        else if (pathname.startsWith('/api/products/') && method === 'PUT') {
          if (!authUser || !authUser.isAdmin) {
            status = 403;
            responseBody = { error: 'Forbidden. Admin privileges required.' };
          } else {
            const id = pathname.split('/').pop();
            const idx = db.products.findIndex(p => p.id === id);
            if (idx === -1) {
              status = 404;
              responseBody = { error: 'Product not found.' };
            } else {
              db.products[idx] = { ...db.products[idx], ...bodyData };
              saveDB(db);
              responseBody = db.products[idx];
            }
          }
        }
        else if (pathname.startsWith('/api/products/') && method === 'DELETE') {
          if (!authUser || !authUser.isAdmin) {
            status = 403;
            responseBody = { error: 'Forbidden. Admin privileges required.' };
          } else {
            const id = pathname.split('/').pop();
            const len = db.products.length;
            db.products = db.products.filter(p => p.id !== id);
            if (db.products.length === len) {
              status = 404;
              responseBody = { error: 'Product not found.' };
            } else {
              saveDB(db);
              responseBody = { success: true, message: 'Product deleted.' };
            }
          }
        }

        // --- ORDERS ROUTES ---
        else if (pathname === '/api/orders' && method === 'POST') {
          if (!authUser) {
            status = 401;
            responseBody = { error: 'Unauthorized. Please login.' };
          } else {
            const { items, shippingAddress, paymentMethod } = bodyData;
            const validatedItems: OrderItem[] = [];
            let calculatedTotal = 0;

            for (const item of items) {
              const prod = db.products.find(p => p.id === item.productId);
              if (!prod) {
                status = 404;
                throw new Error(`Product with ID ${item.productId} not found.`);
              }
              if (prod.stock < item.quantity) {
                status = 400;
                throw new Error(`Insufficient stock for product "${prod.name}".`);
              }
              validatedItems.push({
                productId: prod.id,
                productName: prod.name,
                quantity: item.quantity,
                price: prod.price,
                image: prod.image
              });
              calculatedTotal += prod.price * item.quantity;
              prod.stock -= item.quantity;
            }

            const newOrder: Order = {
              id: 'ord-' + Date.now(),
              userId: authUser.id,
              username: authUser.username,
              email: authUser.email,
              items: validatedItems,
              total: Number(calculatedTotal.toFixed(2)),
              status: 'Pending',
              createdAt: new Date().toISOString(),
              shippingAddress,
              paymentMethod: paymentMethod || 'Mock Card'
            };

            db.orders.unshift(newOrder);
            saveDB(db);
            responseBody = newOrder;
            status = 201;
          }
        }
        else if (pathname === '/api/orders' && method === 'GET') {
          if (!authUser) {
            status = 401;
            responseBody = { error: 'Unauthorized.' };
          } else if (authUser.isAdmin) {
            responseBody = db.orders;
          } else {
            responseBody = db.orders.filter(o => o.userId === authUser.id);
          }
        }
        else if (pathname.endsWith('/status') && method === 'PUT') {
          if (!authUser || !authUser.isAdmin) {
            status = 403;
            responseBody = { error: 'Admin privileges required.' };
          } else {
            const pathParts = pathname.split('/');
            // /api/orders/:id/status
            const id = pathParts[pathParts.length - 2];
            const ord = db.orders.find(o => o.id === id);
            if (!ord) {
              status = 404;
              responseBody = { error: 'Order not found.' };
            } else {
              ord.status = bodyData.status;
              saveDB(db);
              responseBody = ord;
            }
          }
        } else {
          // Unrecognized API
          status = 404;
          responseBody = { error: 'Endpoint not found in mock DB.' };
        }

      } catch (err: any) {
        if (status === 200) status = 500;
        responseBody = { error: err.message || 'Mock server error' };
      }

      // Simulate network latency (100ms - 250ms) for real-world application feel
      await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 100));

      return new Response(JSON.stringify(responseBody), {
        status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return originalFetch(input, init);
  };
}
