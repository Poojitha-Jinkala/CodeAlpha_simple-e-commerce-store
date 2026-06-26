import React, { useState } from 'react';
import { CreditCard, Truck, CheckCircle2, ShoppingBag, Loader2, ArrowLeft } from 'lucide-react';
import { CartItem, ShippingAddress } from '../types';

interface CheckoutViewProps {
  cartItems: CartItem[];
  onSubmitOrder: (address: ShippingAddress, paymentMethod: string) => Promise<{ id: string } | null>;
  onCancel: () => void;
  onViewOrders: () => void;
  onReturnToShop: () => void;
}

export default function CheckoutView({
  cartItems,
  onSubmitOrder,
  onCancel,
  onViewOrders,
  onReturnToShop
}: CheckoutViewProps) {
  // Form fields
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('United States');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [placedOrder, setPlacedOrder] = useState<{ id: string; total: number } | null>(null);

  // Math calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shipping = subtotal > 150 ? 0 : 15.00;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Input validations
    if (!name.trim()) return setValidationError('Full name is required.');
    if (!address.trim()) return setValidationError('Shipping address is required.');
    if (!city.trim()) return setValidationError('City is required.');
    if (!zip.trim()) return setValidationError('Zip/Postal code is required.');
    
    // Card validations
    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (cleanCard.length < 12 || isNaN(Number(cleanCard))) {
      return setValidationError('Please enter a valid credit card number.');
    }
    if (!expiry.trim()) return setValidationError('Expiry date is required.');
    if (cvv.trim().length < 3 || isNaN(Number(cvv.trim()))) {
      return setValidationError('Please enter a valid CVV.');
    }

    setIsLoading(true);

    try {
      const shippingAddress: ShippingAddress = {
        name: name.trim(),
        address: address.trim(),
        city: city.trim(),
        zip: zip.trim(),
        country: country
      };

      const result = await onSubmitOrder(shippingAddress, 'Visa Ending in *' + cleanCard.slice(-4));
      if (result) {
        setPlacedOrder({
          id: result.id,
          total: total
        });
      }
    } catch (err: any) {
      setValidationError(err.message || 'Failed to submit order. Please check stock levels and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If order is completed successfully
  if (placedOrder) {
    return (
      <div id="checkout-receipt-success" className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100 animate-bounce">
            <CheckCircle2 className="h-10 w-10" />
          </div>
        </div>

        <h1 className="font-sans text-3xl font-extrabold tracking-tight text-slate-900">Order Placed Successfully!</h1>
        <p className="mt-2.5 text-sm text-slate-500">
          Thank you for shopping with AURA. We've received your order and are preparing it for shipment.
        </p>

        {/* Receipt Box */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6 text-left">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Receipt</h3>
          <div className="mt-4 divide-y divide-slate-100 text-sm text-slate-600">
            <div className="flex justify-between py-2">
              <span>Order Number</span>
              <span className="font-mono font-bold text-slate-900">{placedOrder.id}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Delivery Method</span>
              <span>Premium Priority Shipping</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Est. Delivery Date</span>
              <span className="font-semibold text-slate-800">
                {new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span>Delivery To</span>
              <span className="font-semibold text-slate-800">{name}</span>
            </div>
            <div className="flex justify-between py-3 text-base font-extrabold text-slate-900 border-t border-slate-200">
              <span>Total Payment Charged</span>
              <span className="text-indigo-650">${placedOrder.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Success Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onViewOrders}
            className="flex-1 rounded-lg bg-indigo-600 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition shadow-indigo-100"
          >
            Track My Orders
          </button>
          <button
            onClick={onReturnToShop}
            className="flex-1 rounded-lg border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="checkout-view" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back to Cart */}
      <button
        onClick={onCancel}
        className="mb-8 flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Shopping Cart</span>
      </button>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Form Column */}
        <form onSubmit={handleFormSubmit} className="lg:col-span-7 space-y-6">
          
          {/* Shipping Address Panel */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              <Truck className="h-5 w-5 text-indigo-550" />
              <span>Shipping Information</span>
            </h2>

            {validationError && (
              <div className="mt-4 rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-600 border border-red-100">
                ⚠️ {validationError}
              </div>
            )}

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Recipient's Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 py-2.5 px-3.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="123 Luxury Avenue, Suite 101"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 py-2.5 px-3.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">City</label>
                  <input
                    type="text"
                    required
                    placeholder="New York"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 py-2.5 px-3.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Zip / Postal Code</label>
                  <input
                    type="text"
                    required
                    placeholder="10001"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 py-2.5 px-3.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                </select>
              </div>
            </div>
          </div>

          {/* Secure Mock Payment Panel */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              <CreditCard className="h-5 w-5 text-indigo-550" />
              <span>Simulated Payment Details</span>
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Card Number (Mock)</label>
                <input
                  type="text"
                  required
                  placeholder="4111 2222 3333 4444"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 py-2.5 px-3.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Expiry Date</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    maxLength={5}
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 py-2.5 px-3.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">CVV / CVC</label>
                  <input
                    type="password"
                    required
                    placeholder="123"
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 py-2.5 px-3.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Trigger */}
          <button
            type="submit"
            disabled={isLoading || cartItems.length === 0}
            className={`flex w-full items-center justify-center rounded-lg bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-300 shadow-indigo-100 ${
              isLoading || cartItems.length === 0
                ? 'opacity-60 cursor-not-allowed'
                : 'hover:bg-indigo-700 active:scale-[0.98]'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Processing Your Secure Transaction...</span>
              </>
            ) : (
              <span>Authorize & Place Order (${total.toFixed(2)})</span>
            )}
          </button>
        </form>

        {/* Order review sidebar */}
        <div className="lg:col-span-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">Review Order Items</h2>
            
            {/* Scrollable Items */}
            <div className="mt-4 divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex py-3 gap-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="h-12 w-12 rounded-lg border border-slate-200 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Qty: {item.quantity} × ${item.product.price.toFixed(2)}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-800">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 mt-4 pt-4 space-y-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-slate-900">
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span className="font-semibold text-slate-900">${tax.toFixed(2)}</span>
              </div>
              <div className="h-[1px] bg-slate-200 my-2"></div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900">
                <span>Total Due</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
