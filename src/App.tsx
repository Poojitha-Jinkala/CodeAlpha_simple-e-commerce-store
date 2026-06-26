import { useState, useEffect } from 'react';
import { ShoppingBag, Star, ShieldCheck, Sparkles, Loader2, ArrowRight, AlertTriangle, AlertCircle, Check } from 'lucide-react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductDetails from './components/ProductDetails';
import CartView from './components/CartView';
import CheckoutView from './components/CheckoutView';
import AdminDashboard from './components/AdminDashboard';
import AuthView from './components/AuthView';
import OrderHistory from './components/OrderHistory';
import { Product, User, CartItem, ShippingAddress } from './types';

export default function App() {
  // Session states
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('Poojitha_aura App_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('Poojitha_aura App_token');
  });

  // Navigation state
  const [currentTab, setCurrentTab] = useState<string>('shop');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Search and Category filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('Poojitha_aura App_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Catalog state
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [catalogError, setCatalogError] = useState('');

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Sync session with localstorage
  useEffect(() => {
    if (currentUser && token) {
      localStorage.setItem('Poojitha_aura App_user', JSON.stringify(currentUser));
      localStorage.setItem('Poojitha_aura App_token', token);
    } else {
      localStorage.removeItem('Poojitha_aura App_user');
      localStorage.removeItem('Poojitha_aura App_token');
    }
  }, [currentUser, token]);

  // Sync cart with localstorage
  useEffect(() => {
    localStorage.setItem('Poojitha_aura App_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Load product catalog from backend API
  const fetchProducts = async () => {
    setLoadingProducts(true);
    setCatalogError('');
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to retrieve catalog products.');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err: any) {
      setCatalogError(err.message || 'Error connecting to catalog service.');
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Sync user profile on mount
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) {
            // Token stale
            handleLogout();
          }
        })
        .catch(() => {});
    }
  }, [token]);

  // Logout routine
  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    showToast('Signed out of session.', 'info');
    setCurrentTab('shop');
  };

  // Auth success routines
  const handleAuthSuccess = (user: User, userToken: string, message: string) => {
    setCurrentUser(user);
    setToken(userToken);
    showToast(message, 'success');
    
    // Redirect smartly depending on if admin or returning to cart
    if (user.isAdmin) {
      setCurrentTab('admin');
    } else if (cartItems.length > 0) {
      setCurrentTab('cart');
    } else {
      setCurrentTab('shop');
    }
  };

  // Add to cart routine
  const handleAddToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      showToast('Item is out of stock!', 'error');
      return;
    }

    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.product.id === product.id);
      
      let updated: CartItem[];
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stock);
        showToast(`Updated "${product.name}" quantity to ${newQty} in cart.`);
        updated = prevItems.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        showToast(`Added "${product.name}" to cart.`);
        updated = [...prevItems, { product, quantity: Math.min(quantity, product.stock) }];
      }
      return updated;
    });
  };

  // Update item quantity in cart
  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.product.id === productId) {
          const targetQty = item.quantity + delta;
          const validatedQty = Math.max(1, Math.min(targetQty, item.product.stock));
          return { ...item, quantity: validatedQty };
        }
        return item;
      });
    });
  };

  // Remove single item from cart
  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Removed item from shopping cart.', 'info');
  };

  // Clear shopping cart
  const handleClearCart = () => {
    setCartItems([]);
    showToast('Shopping cart cleared.', 'info');
  };

  // Trigger checkout view
  const handleProceedToCheckout = () => {
    if (!currentUser) {
      showToast('Please log in or register to complete your order.', 'info');
      setCurrentTab('auth');
    } else {
      setCurrentTab('checkout');
    }
  };

  // Order submission processor
  const handleOrderSubmission = async (address: ShippingAddress, paymentMethod: string) => {
    if (!token) return null;

    const formattedItems = cartItems.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity
    }));

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: formattedItems,
          shippingAddress: address,
          paymentMethod
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process checkout transaction.');
      }

      showToast('Transaction authorized! Stock deducted successfully.', 'success');
      
      // Clear cart
      setCartItems([]);
      // Refresh catalog list to see updated stock counts!
      fetchProducts();

      return data;
    } catch (err: any) {
      showToast(err.message || 'Checkout failed.', 'error');
      throw err;
    }
  };

  // Filter and sort catalog products
  const getFilteredProducts = () => {
    let list = [...products];

    // Filter by category
    if (selectedCategory !== 'All') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    }

    return list;
  };

  const filteredProducts = getFilteredProducts();
  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div id="app-root-container" className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-600 selection:text-white flex flex-col justify-between">
      
      {/* Dynamic Floating Toast Alerts */}
      {toast && (
        <div 
          id="system-toast"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3.5 text-xs font-bold shadow-xl border animate-slide-in-right ${
            toast.type === 'success' ? 'bg-slate-950 text-white border-slate-850' :
            toast.type === 'error' ? 'bg-red-950 text-red-200 border-red-900' :
            'bg-blue-950 text-blue-200 border-blue-900'
          }`}
        >
          {toast.type === 'success' && <Check className="h-4 w-4 text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle className="h-4 w-4 text-red-400" />}
          {toast.type === 'info' && <AlertCircle className="h-4 w-4 text-blue-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Primary Navigation bar */}
      <Navbar
        currentUser={currentUser}
        cartCount={totalCartCount}
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          setSelectedProduct(null);
        }}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Main Container Stage */}
      <main className="flex-grow">
        
        {/* SHOP TAB (Catalog listings) */}
        {currentTab === 'shop' && !selectedProduct && (
          <div>
            {/* Curated Lifestyle Hero Banner */}
            {selectedCategory === 'All' && !searchQuery && (
              <div id="store-hero" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
                <div className="relative overflow-hidden rounded-3xl bg-slate-900 py-16 px-8 text-white sm:px-16 shadow-lg">
                  <div className="relative z-10 max-w-lg">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Curated Premium Collection</span>
                    </span>
                    <h1 className="mt-4 font-sans text-3xl font-extrabold tracking-tight sm:text-5xl">
                      Poojitha_aura App of Modern Living.
                    </h1>
                    <p className="mt-4 text-sm leading-relaxed text-slate-300">
                      Elegantly manufactured workspace tools, wearable tech, and sensory sound controllers. Designed for absolute focus, comfort, and minimal aesthetic harmony.
                    </p>
                    <div className="mt-8">
                      <button 
                        onClick={() => setSelectedCategory('Electronics')}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-xs font-bold text-white transition hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95"
                      >
                        <span>Browse Desk Accessories</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Backdrop glowing gradient accents */}
                  <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-30 pointer-events-none hidden md:block">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-indigo-500 blur-3xl"></div>
                    <div className="absolute top-1/3 left-2/3 -translate-x-1/2 -translate-y-1/2 h-56 w-56 rounded-full bg-slate-200 blur-3xl"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Catalog Grid Section */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
              
              {/* Filter controls row */}
              <div id="catalog-controls" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Showing {filteredProducts.length} premium results
                </span>

                <div className="flex items-center space-x-3.5">
                  <span className="text-xs text-slate-500 font-semibold">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs font-semibold outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="default">Release Date</option>
                    <option value="rating">Best Rating</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Error messages */}
              {catalogError && (
                <div className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-600 border border-red-100">
                  ⚠️ {catalogError}
                </div>
              )}

              {/* Loading spinner */}
              {loadingProducts ? (
                <div className="flex h-64 flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                  <span className="text-xs font-semibold text-slate-400 mt-2">Loading curated catalogue...</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                /* Empty query state */
                <div id="empty-search-state" className="text-center py-16 rounded-xl border border-dashed border-slate-200 bg-white">
                  <AlertTriangle className="mx-auto h-8 w-8 text-indigo-500" />
                  <h3 className="mt-4 text-sm font-bold text-slate-900">No products match your filters</h3>
                  <p className="mt-1 text-xs text-slate-500">Try adjusting your search keywords or choosing a different category.</p>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                    className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition shadow-indigo-100"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                /* Primary Bento Grid */
                <div id="products-grid" className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={(prod) => handleAddToCart(prod, 1)}
                      onViewDetails={(prod) => setSelectedProduct(prod)}
                    />
                  ))}
                </div>
              )}

            </div>
          </div>
        )}

        {/* DETAILED PRODUCT PAGE VIEW */}
        {selectedProduct && (
          <ProductDetails
            product={selectedProduct}
            onAddToCart={handleAddToCart}
            onBack={() => setSelectedProduct(null)}
          />
        )}

        {/* SHOPPING CART VIEW */}
        {currentTab === 'cart' && (
          <CartView
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onProceedToCheckout={handleProceedToCheckout}
            onReturnToShop={() => setCurrentTab('shop')}
          />
        )}

        {/* ORDER CHECKOUT AND SIMULATION VIEW */}
        {currentTab === 'checkout' && (
          <CheckoutView
            cartItems={cartItems}
            onSubmitOrder={handleOrderSubmission}
            onCancel={() => setCurrentTab('cart')}
            onViewOrders={() => setCurrentTab('orders')}
            onReturnToShop={() => setCurrentTab('shop')}
          />
        )}

        {/* USER REGISTRATION / SIGN IN */}
        {currentTab === 'auth' && (
          <AuthView
            onLoginSuccess={(user, userToken) => handleAuthSuccess(user, userToken, `Welcome back, ${user.username}!`)}
            onRegisterSuccess={(user, userToken) => handleAuthSuccess(user, userToken, `Welcome, ${user.username}! Your account has been registered.`)}
          />
        )}

        {/* ORDER TIMELINE AND HISTORY */}
        {currentTab === 'orders' && (
          <OrderHistory
            token={token}
            onReturnToShop={() => setCurrentTab('shop')}
          />
        )}

        {/* ADMINISTRATOR INVENTORY CONTROL AND DISPATCH */}
        {currentTab === 'admin' && (
          <AdminDashboard
            token={token}
            products={products}
            onRefreshProducts={fetchProducts}
          />
        )}

      </main>

      {/* Styled Human Footer */}
      <footer id="app-footer" className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-xs mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-2">
              <span className="font-sans text-base font-bold tracking-tight text-white">
                Poojitha_aura App<span className="text-slate-500 font-normal">.store</span>
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full border border-slate-700 font-mono">v1.1</span>
            </div>
            
            <p className="text-slate-500 text-center md:text-right">
              &copy; {new Date().getFullYear()} Poojitha_aura App Curated Design Store. Built securely with Express.js backend and React client.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
