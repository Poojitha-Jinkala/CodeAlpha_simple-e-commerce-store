import { useState, useEffect } from 'react';
import { Package, Clock, ShieldCheck, Truck, ChevronDown, ChevronUp, RefreshCw, ClipboardList } from 'lucide-react';
import { Order } from '../types';

interface OrderHistoryProps {
  token: string | null;
  onReturnToShop: () => void;
}

export default function OrderHistory({ token, onReturnToShop }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Could not retrieve orders.');
      }
      const data = await response.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Error communicating with database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(prev => (prev === orderId ? null : orderId));
  };

  const getStatusBadge = (status: Order['status']) => {
    const base = "rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ";
    switch (status) {
      case 'Pending':
        return <span className={base + "bg-amber-50 text-amber-700 border border-amber-200"}>Pending</span>;
      case 'Shipped':
        return <span className={base + "bg-blue-50 text-blue-700 border border-blue-200"}>Shipped</span>;
      case 'Delivered':
        return <span className={base + "bg-emerald-50 text-emerald-700 border border-emerald-200"}>Delivered</span>;
      case 'Cancelled':
        return <span className={base + "bg-red-50 text-red-700 border border-red-200"}>Cancelled</span>;
      default:
        return <span className={base + "bg-slate-50 text-slate-700 border border-slate-200"}>{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-500 mb-2" />
        <span className="text-sm text-slate-500 font-medium">Querying order history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center">
        <div className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-600 border border-red-100">
          ⚠️ {error}
        </div>
        <button
          onClick={fetchOrders}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition shadow-indigo-100"
        >
          Retry Fetch
        </button>
      </div>
    );
  }

  return (
    <div id="orders-timeline-view" className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-sans text-2xl font-extrabold tracking-tight text-slate-900">Your Order History</h1>
          <p className="mt-1 text-xs text-slate-500">Track and view your premium lifestyle item orders</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center space-x-1.5 rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-indigo-600 transition text-xs font-semibold"
          title="Refresh orders list"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {orders.length === 0 ? (
        <div id="no-orders-state" className="mt-12 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-250 bg-white py-16 px-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-4 border border-slate-100">
            <ClipboardList className="h-7 w-7 text-indigo-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">No orders logged</h2>
          <p className="mt-1 text-sm text-slate-500 max-w-xs">
            You haven't placed any orders yet. Head back to our store and find some items you love!
          </p>
          <button
            onClick={onReturnToShop}
            className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition shadow-indigo-100"
          >
            Go to Shop
          </button>
        </div>
      ) : (
        /* Orders list */
        <div className="mt-8 space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            return (
              <div 
                key={order.id} 
                className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
              >
                {/* Order Summary Strip (Click to toggle expand) */}
                <div 
                  onClick={() => toggleExpand(order.id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 cursor-pointer hover:bg-slate-50/50 transition"
                >
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order Reference</span>
                      <p className="font-mono text-sm font-bold text-slate-900">{order.id}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Submitted On</span>
                      <p className="text-xs text-slate-600 font-medium">
                        {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Charged</span>
                      <p className="text-xs font-bold text-indigo-600">${order.total.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3.5">
                    {getStatusBadge(order.status)}
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded details container */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-5 space-y-5">
                    
                    {/* Progress visual tracker */}
                    <div className="flex items-center justify-between max-w-md mx-auto py-3">
                      <div className="flex flex-col items-center">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold shadow shadow-indigo-100">
                          <Clock className="h-3.5 w-3.5" />
                        </div>
                        <span className="mt-1 text-[10px] font-bold text-slate-700">Pending</span>
                      </div>
                      <div className={`h-0.5 flex-1 mx-2 ${['Shipped', 'Delivered'].includes(order.status) ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                      
                      <div className="flex flex-col items-center">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shadow-sm ${
                          ['Shipped', 'Delivered'].includes(order.status) ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                        }`}>
                          <Truck className="h-3.5 w-3.5" />
                        </div>
                        <span className={`mt-1 text-[10px] font-bold ${
                          ['Shipped', 'Delivered'].includes(order.status) ? 'text-slate-700' : 'text-slate-400'
                        }`}>Shipped</span>
                      </div>
                      <div className={`h-0.5 flex-1 mx-2 ${order.status === 'Delivered' ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>

                      <div className="flex flex-col items-center">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shadow-sm ${
                          order.status === 'Delivered' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                        }`}>
                          <ShieldCheck className="h-3.5 w-3.5" />
                        </div>
                        <span className={`mt-1 text-[10px] font-bold ${
                          order.status === 'Delivered' ? 'text-slate-700' : 'text-slate-400'
                        }`}>Delivered</span>
                      </div>
                    </div>

                    {/* Purchased Items List */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Purchased Items</h4>
                      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
                        {order.items.map((item) => (
                          <div key={item.productId} className="flex items-center justify-between p-3 gap-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.productName}
                                referrerPolicy="no-referrer"
                                className="h-10 w-10 rounded-md border border-slate-200 object-cover"
                              />
                              <div>
                                <span className="text-xs font-bold text-slate-900 block">{item.productName}</span>
                                <span className="text-[10px] text-slate-500 font-medium">Qty: {item.quantity} × ${item.price.toFixed(2)}</span>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-800">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery & Payment details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Shipping Address */}
                      <div className="rounded-lg border border-slate-200 bg-white p-3.5">
                        <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Delivery Address</h5>
                        <p className="text-xs font-bold text-slate-900">{order.shippingAddress.name}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{order.shippingAddress.address}</p>
                        <p className="text-xs text-slate-600">
                          {order.shippingAddress.city}, {order.shippingAddress.zip}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{order.shippingAddress.country}</p>
                      </div>

                      {/* Payment Profile */}
                      <div className="rounded-lg border border-slate-200 bg-white p-3.5 flex flex-col justify-between">
                        <div>
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Payment Details</h5>
                          <p className="text-xs font-bold text-slate-900">{order.paymentMethod || 'Simulated Payment Card'}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Authorization Code: AUTH-S-{order.id.slice(-6).toUpperCase()}</p>
                        </div>
                        <div className="text-right border-t border-slate-100 pt-2 mt-2">
                          <span className="text-xs font-bold text-slate-400">Paid Total: </span>
                          <span className="text-sm font-extrabold text-slate-900">${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
