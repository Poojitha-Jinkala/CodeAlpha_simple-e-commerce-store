import React, { useState, useEffect } from 'react';
import { Package, ClipboardList, Plus, Edit, Trash2, Check, RefreshCw, AlertCircle, TrendingUp, X, Sparkles } from 'lucide-react';
import { Product, Order } from '../types';

interface AdminDashboardProps {
  token: string | null;
  products: Product[];
  onRefreshProducts: () => void;
}

export default function AdminDashboard({ token, products, onRefreshProducts }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  // Form states for creating/editing product
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Product input states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Fetch orders from database
  const fetchOrders = async () => {
    if (!token) return;
    setLoadingOrders(true);
    setOrdersError('');
    try {
      const response = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Could not fetch database orders.');
      }
      const data = await response.json();
      setOrders(data);
    } catch (err: any) {
      setOrdersError(err.message || 'Error communicating with database.');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, token]);

  const handleOpenCreateForm = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setStock('');
    setImage('');
    setCategory('Electronics');
    setFormError('');
    setFormSuccess('');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setImage(product.image);
    setCategory(product.category);
    setFormError('');
    setFormSuccess('');
    setIsFormOpen(true);
  };

  // Submit add or edit form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!name.trim() || !description.trim() || !price || !stock || !image.trim() || !category) {
      return setFormError('All input fields are required.');
    }

    const numPrice = Number(price);
    const numStock = Number(stock);

    if (isNaN(numPrice) || numPrice <= 0) {
      return setFormError('Price must be a valid positive number.');
    }
    if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
      return setFormError('Stock must be a valid non-negative integer.');
    }

    const endpoint = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          price: numPrice,
          stock: numStock,
          image: image.trim(),
          category
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error saving product.');
      }

      setFormSuccess(editingProduct ? 'Product updated successfully!' : 'New product created successfully!');
      onRefreshProducts();
      setTimeout(() => {
        setIsFormOpen(false);
      }, 1000);
    } catch (err: any) {
      setFormError(err.message || 'Error saving product details.');
    }
  };

  // Delete product action
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server rejected product deletion.');
      }

      onRefreshProducts();
    } catch (err: any) {
      alert(err.message || 'Error deleting product.');
    }
  };

  // Update order status action
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Could not update order status.');
      }

      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Error updating order status.');
    }
  };

  // Helper metric calculations
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((acc, curr) => acc + curr.total, 0);

  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;

  return (
    <div id="admin-panel" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Admin Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-6 gap-4">
        <div>
          <h1 className="font-sans text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Admin Control Panel</span>
            <span className="rounded-md bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 border border-emerald-150 shadow-sm">
              Database Core
            </span>
          </h1>
          <p className="mt-1 text-xs text-slate-500">Manage real-time catalog items, adjust stock levels, and dispatch pending client orders</p>
        </div>

        {/* Form Opener */}
        {activeTab === 'inventory' && (
          <button
            onClick={handleOpenCreateForm}
            className="flex items-center space-x-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition active:scale-95 shadow-indigo-100"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {/* Metric Cards - Only shown if orders are loaded */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Catalog Size</span>
          <span className="text-2xl font-extrabold text-slate-800 mt-1">{products.length} Products</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Simulated Revenue</span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1">${totalRevenue.toFixed(2)}</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Dispatches</span>
          <span className="text-2xl font-extrabold text-amber-600 mt-1">{pendingOrdersCount} Orders Pending</span>
        </div>
      </div>

      {/* Secondary Tab Switchers */}
      <div className="mt-8 flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-bold text-sm transition-all duration-200 ${
            activeTab === 'inventory'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Package className="h-4 w-4" />
          <span>Catalog Inventory ({products.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-bold text-sm transition-all duration-200 ${
            activeTab === 'orders'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          <span>Order Dispatch Queue ({orders.length})</span>
        </button>
      </div>

      {/* TAB CONTENTS */}

      {/* --- INVENTORY MANAGER TAB --- */}
      {activeTab === 'inventory' && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm text-slate-600">
            <thead className="bg-slate-50 font-bold text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Product Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-center">Stock Level</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => {
                const isLow = product.stock <= 5 && product.stock > 0;
                const isOut = product.stock === 0;
                return (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="h-10 w-10 rounded-md border border-slate-200 object-cover"
                      />
                      <div className="max-w-xs">
                        <span className="font-bold text-slate-900 block truncate">{product.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {product.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700 uppercase tracking-wide">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`font-bold ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-slate-850'}`}>
                          {product.stock} units
                        </span>
                        {isOut && (
                          <span className="text-[9px] font-bold text-red-600 uppercase flex items-center gap-0.5 mt-0.5">
                            <AlertCircle className="h-2.5 w-2.5" /> Out of Stock
                          </span>
                        )}
                        {isLow && (
                          <span className="text-[9px] font-bold text-amber-600 uppercase flex items-center gap-0.5 mt-0.5 animate-pulse">
                            <AlertCircle className="h-2.5 w-2.5" /> Low Stock
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenEditForm(product)}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 hover:text-indigo-650 transition"
                          title="Edit product parameters"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="rounded-lg border border-slate-200 p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                          title="Delete product"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* --- DISPATCH QUEUE TAB --- */}
      {activeTab === 'orders' && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-semibold text-slate-500">{orders.length} total client transactions</span>
            <button
              onClick={fetchOrders}
              className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <RefreshCw className={`h-3 w-3 ${loadingOrders ? 'animate-spin' : ''}`} />
              <span>Refresh Orders</span>
            </button>
          </div>

          {ordersError && (
            <div className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-600 border border-red-100">
              ⚠️ {ordersError}
            </div>
          )}

          {orders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white py-12 px-4 text-center text-slate-500">
              No customer transactions have been recorded in the database yet.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                  
                  {/* Order header row */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="font-mono text-xs font-extrabold text-slate-900">ID: {order.id}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Placed by <span className="font-bold text-slate-700">{order.username}</span> ({order.email}) on {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Order Status Dispatch Controller */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dispatch Status</span>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className={`rounded-lg border py-1.5 px-3.5 text-xs font-bold uppercase tracking-wide bg-white outline-none transition cursor-pointer ${
                          order.status === 'Pending' ? 'text-amber-700 border-amber-200 bg-amber-50' :
                          order.status === 'Shipped' ? 'text-blue-700 border-blue-200 bg-blue-50' :
                          order.status === 'Delivered' ? 'text-emerald-700 border-emerald-200 bg-emerald-50' :
                          'text-red-700 border-red-200 bg-red-50'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Order Contents */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    
                    {/* Items */}
                    <div>
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Purchased Items</span>
                      <ul className="mt-1.5 space-y-2 border border-slate-200 bg-slate-50 p-3 rounded-lg divide-y divide-slate-150 max-h-40 overflow-y-auto">
                        {order.items.map((item) => (
                          <li key={item.productId} className="flex items-center justify-between py-1.5 gap-2 first:pt-0 last:pb-0">
                            <span className="font-semibold text-slate-800 line-clamp-1">{item.productName} <span className="text-slate-400 font-normal">×{item.quantity}</span></span>
                            <span className="font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Meta info block */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-slate-200 p-2.5">
                        <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">Shipping Destination</span>
                        <p className="font-bold text-slate-900 mt-1">{order.shippingAddress.name}</p>
                        <p className="text-slate-600 text-[11px] truncate">{order.shippingAddress.address}</p>
                        <p className="text-slate-600 text-[11px]">{order.shippingAddress.city}, {order.shippingAddress.zip}</p>
                      </div>

                      <div className="rounded-lg border border-slate-200 p-2.5 flex flex-col justify-between">
                        <div>
                          <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">Billing Details</span>
                          <p className="font-medium text-slate-700 mt-1">{order.paymentMethod}</p>
                        </div>
                        <div className="text-right border-t border-slate-100 pt-1">
                          <span className="text-[10px] text-slate-400 font-medium">Charged Total</span>
                          <p className="text-sm font-extrabold text-slate-900">${order.total.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {/* PRODUCT CREATION/EDIT MODAL OVERLAY */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="font-sans text-lg font-extrabold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                <span>{editingProduct ? 'Edit Catalog Product' : 'Add New Catalog Product'}</span>
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-100">
                ⚠️ {formError}
              </div>
            )}
            {formSuccess && (
              <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-600 border border-emerald-100 flex items-center gap-1.5">
                <Check className="h-4 w-4" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-500 uppercase tracking-wider">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Solace Headphones v2"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 py-2.5 px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 uppercase tracking-wider">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Audio">Audio</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Home & Living">Home & Living</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-500 uppercase tracking-wider">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="299.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 py-2.5 px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 uppercase tracking-wider">Stock Units</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="15"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 py-2.5 px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter deep features and product specifications detailed overview copy..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 py-2.5 px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider">Image Link URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 py-2.5 px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono bg-white"
                />
                
                {/* Image visual preview box */}
                {image.trim().startsWith('http') && (
                  <div className="mt-2 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Image Link Preview:</span>
                    <div className="mt-1 h-20 w-32 mx-auto overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      <img
                        src={image.trim()}
                        alt="Catalog preview"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover object-center"
                        onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600'; }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 rounded-lg border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-indigo-600 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition shadow-indigo-100"
                >
                  Save Product
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
