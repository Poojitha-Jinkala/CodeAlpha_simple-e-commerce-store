import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { CartItem } from '../types';

interface CartViewProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  onReturnToShop: () => void;
}

export default function CartView({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  onReturnToShop
}: CartViewProps) {
  const isCartEmpty = cartItems.length === 0;

  // Cost calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shipping = subtotal > 150 ? 0 : isCartEmpty ? 0 : 15.00;
  const tax = subtotal * 0.08; // 8% mock tax
  const total = subtotal + shipping + tax;

  return (
    <div id="shopping-cart-view" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-sans text-2xl font-extrabold tracking-tight text-slate-900">Your Shopping Cart</h1>

      {isCartEmpty ? (
        /* Empty Cart State */
        <div id="empty-cart-state" className="mt-12 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16 px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-4 border border-slate-100">
            <ShoppingBag className="h-8 w-8 text-indigo-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Your cart is empty</h2>
          <p className="mt-1 text-sm text-slate-500 max-w-sm">
            Looks like you haven't added any products to your shopping cart yet. Explore our premium collection now!
          </p>
          <button
            onClick={onReturnToShop}
            className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition shadow-indigo-100"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        /* Cart Contents & Summary */
        <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-12">
          
          {/* Cart Items List */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-sm font-semibold text-slate-500">{cartItems.length} unique items</span>
              <button
                onClick={onClearCart}
                className="text-xs font-bold text-red-600 hover:text-red-700 transition"
              >
                Clear Cart
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {cartItems.map((item) => {
                const maxStock = item.product.stock;
                return (
                  <div key={item.product.id} className="flex py-6 gap-4 sm:gap-6">
                    {/* Thumbnail */}
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 leading-tight">
                            {item.product.name}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-400 capitalize">{item.product.category}</p>
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-4">
                        {/* Quantity Counter */}
                        <div className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, -1)}
                            disabled={item.quantity <= 1}
                            className="rounded-md p-1 text-slate-500 hover:bg-white disabled:opacity-40 transition"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-slate-800">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, 1)}
                            disabled={item.quantity >= maxStock}
                            className="rounded-md p-1 text-slate-500 hover:bg-white disabled:opacity-40 transition"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="flex items-center space-x-1 text-xs text-red-500 hover:text-red-700 transition font-bold"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Order Summary Column */}
          <div className="lg:col-span-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">Order Summary</h2>

              <dl className="mt-4 space-y-3.5 text-sm text-slate-600">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd className="font-semibold text-slate-900">${subtotal.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Estimated Shipping</dt>
                  <dd className="font-semibold text-slate-900">
                    {shipping === 0 ? (
                      <span className="text-emerald-600 font-bold uppercase tracking-wider text-xs">Free Shipping</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Estimated Tax (8%)</dt>
                  <dd className="font-semibold text-slate-900">${tax.toFixed(2)}</dd>
                </div>

                <div className="h-[1px] bg-slate-250 my-4"></div>

                <div className="flex justify-between text-base font-extrabold text-slate-900">
                  <dt>Total Payment</dt>
                  <dd>${total.toFixed(2)}</dd>
                </div>
              </dl>

              {/* Free shipping banner if not met */}
              {shipping > 0 && (
                <div className="mt-4 rounded-lg bg-slate-100 p-2.5 text-center text-xs font-semibold text-slate-600 border border-slate-200">
                  💡 Add <span className="text-slate-900 font-bold">${(150 - subtotal).toFixed(2)}</span> more to qualify for <span className="text-indigo-600 font-bold">FREE Shipping</span>!
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={onProceedToCheckout}
                  className="flex w-full items-center justify-center rounded-lg bg-indigo-600 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition active:scale-[0.98] shadow-indigo-100"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
                <button
                  onClick={onReturnToShop}
                  className="w-full text-center text-xs font-bold text-slate-500 hover:text-indigo-600 transition"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
