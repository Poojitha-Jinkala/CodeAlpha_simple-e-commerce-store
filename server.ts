import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { readDB, writeDB, hashPassword, DBUser } from './server/db';
import { Product, Order, OrderItem } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// Token utilities: Base64-encoded token for robust, self-contained mock authorization
function generateToken(user: DBUser): string {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// Middewares for Authentication and Administration
function getAuthenticatedUser(req: express.Request): any {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    if (payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch (err) {
    return null;
  }
}

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized. Please register or log in.' });
  }
  (req as any).user = user;
  next();
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = getAuthenticatedUser(req);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden. Admin privileges required.' });
  }
  (req as any).user = user;
  next();
}

// API Routes

// --- AUTHENTICATION ---

// Register
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required.' });
  }

  const db = readDB();
  const lowerEmail = email.toLowerCase().trim();
  const lowerUsername = username.toLowerCase().trim();

  const userExists = db.users.some(
    u => u.email.toLowerCase() === lowerEmail || u.username.toLowerCase() === lowerUsername
  );

  if (userExists) {
    return res.status(400).json({ error: 'Username or email already in use.' });
  }

  const newUser: DBUser = {
    id: 'user-' + Date.now(),
    username: username.trim(),
    email: lowerEmail,
    passwordHash: hashPassword(password),
    isAdmin: false
  };

  db.users.push(newUser);
  writeDB(db);

  const token = generateToken(newUser);
  res.status(201).json({
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      isAdmin: newUser.isAdmin
    },
    token
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { emailOrUsername, password } = req.body;
  if (!emailOrUsername || !password) {
    return res.status(400).json({ error: 'Credentials and password are required.' });
  }

  const db = readDB();
  const searchStr = emailOrUsername.toLowerCase().trim();
  const targetHash = hashPassword(password);

  const user = db.users.find(
    u => (u.email.toLowerCase() === searchStr || u.username.toLowerCase() === searchStr) && u.passwordHash === targetHash
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid username, email, or password.' });
  }

  const token = generateToken(user);
  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin
    },
    token
  });
});

// Get current user profile
app.get('/api/auth/me', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Session expired or not logged in.' });
  }
  res.json({ user });
});


// --- PRODUCTS API (CRUD) ---

// List all products
app.get('/api/products', (req, res) => {
  const db = readDB();
  res.json(db.products);
});

// Get product details
app.get('/api/products/:id', (req, res) => {
  const db = readDB();
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  res.json(product);
});

// Create new product (Admin only)
app.post('/api/products', requireAdmin, (req, res) => {
  const { name, description, price, image, category, stock } = req.body;
  if (!name || !description || price === undefined || !image || !category || stock === undefined) {
    return res.status(400).json({ error: 'All fields (name, description, price, image, category, stock) are required.' });
  }

  const numPrice = Number(price);
  const numStock = Number(stock);

  if (isNaN(numPrice) || numPrice <= 0) {
    return res.status(400).json({ error: 'Price must be a valid positive number.' });
  }
  if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
    return res.status(400).json({ error: 'Stock must be a non-negative integer.' });
  }

  const db = readDB();
  const newProduct: Product = {
    id: 'prod-' + Date.now(),
    name,
    description,
    price: numPrice,
    image,
    category,
    stock: numStock,
    rating: 5.0,
    reviewsCount: 0
  };

  db.products.push(newProduct);
  writeDB(db);
  res.status(201).json(newProduct);
});

// Update product (Admin only)
app.put('/api/products/:id', requireAdmin, (req, res) => {
  const { name, description, price, image, category, stock } = req.body;
  const db = readDB();
  const productIndex = db.products.findIndex(p => p.id === req.params.id);

  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  const current = db.products[productIndex];

  if (price !== undefined) {
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ error: 'Price must be a valid positive number.' });
    }
    current.price = numPrice;
  }

  if (stock !== undefined) {
    const numStock = Number(stock);
    if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
      return res.status(400).json({ error: 'Stock must be a non-negative integer.' });
    }
    current.stock = numStock;
  }

  if (name) current.name = name;
  if (description) current.description = description;
  if (image) current.image = image;
  if (category) current.category = category;

  db.products[productIndex] = current;
  writeDB(db);
  res.json(current);
});

// Delete product (Admin only)
app.delete('/api/products/:id', requireAdmin, (req, res) => {
  const db = readDB();
  const initialLen = db.products.length;
  db.products = db.products.filter(p => p.id !== req.params.id);

  if (db.products.length === initialLen) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  writeDB(db);
  res.json({ success: true, message: 'Product deleted successfully.' });
});


// --- ORDERS API ---

// Submit a new order
app.post('/api/orders', requireAuth, (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item.' });
  }
  if (!shippingAddress || !shippingAddress.name || !shippingAddress.address || !shippingAddress.city || !shippingAddress.zip || !shippingAddress.country) {
    return res.status(400).json({ error: 'Complete shipping address is required.' });
  }

  const db = readDB();
  const authUser = (req as any).user;

  // Validate items and verify stocks
  const validatedItems: OrderItem[] = [];
  let calculatedTotal = 0;

  for (const item of items) {
    const { productId, quantity } = item;
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid order item parameters.' });
    }

    const dbProduct = db.products.find(p => p.id === productId);
    if (!dbProduct) {
      return res.status(404).json({ error: `Product with ID ${productId} not found.` });
    }

    if (dbProduct.stock < quantity) {
      return res.status(400).json({ error: `Insufficient stock for product "${dbProduct.name}". Only ${dbProduct.stock} left in stock.` });
    }

    validatedItems.push({
      productId: dbProduct.id,
      productName: dbProduct.name,
      quantity: Number(quantity),
      price: dbProduct.price,
      image: dbProduct.image
    });

    calculatedTotal += dbProduct.price * quantity;
    
    // Decrement stock levels
    dbProduct.stock -= quantity;
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
    paymentMethod: paymentMethod || 'Card Sim'
  };

  db.orders.unshift(newOrder); // Add to the beginning of list
  writeDB(db);

  res.status(201).json(newOrder);
});

// List orders
app.get('/api/orders', requireAuth, (req, res) => {
  const db = readDB();
  const authUser = (req as any).user;

  if (authUser.isAdmin) {
    // Admins see all orders
    res.json(db.orders);
  } else {
    // Customers only see their own orders
    const userOrders = db.orders.filter(o => o.userId === authUser.id);
    res.json(userOrders);
  }
});

// Update order status (Admin only)
app.put('/api/orders/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];

  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
  }

  const db = readDB();
  const order = db.orders.find(o => o.id === req.params.id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  order.status = status as any;
  writeDB(db);

  res.json(order);
});


// Server setup with Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`E-commerce Server running at http://localhost:${PORT}`);
  });
}

startServer();
