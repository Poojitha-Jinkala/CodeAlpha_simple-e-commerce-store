import { useState } from 'react';
import { Star, ShoppingBag, ArrowLeft, Plus, Minus, Check, AlertCircle } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailsProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onBack: () => void;
}

export default function ProductDetails({ product, onAddToCart, onBack }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <div id={`product-details-${product.id}`} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-8 flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to listings</span>
      </button>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        
        {/* Left Column: Product Image Showcase */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm aspect-square max-h-[500px]">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center transition duration-300 hover:scale-[1.02]"
          />
        </div>

        {/* Right Column: Detailed Copy and Action Panel */}
        <div className="flex flex-col justify-center">
          
          {/* Category & Badge Row */}
          <div className="flex items-center space-x-3">
            <span className="rounded-md bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-800">
              {product.category}
            </span>
            {isOutOfStock ? (
              <span className="flex items-center text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-md">
                <AlertCircle className="mr-1 h-3.5 w-3.5" /> Out of stock
              </span>
            ) : isLowStock ? (
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
                Low stock: only {product.stock} left
              </span>
            ) : (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                In stock & ready to ship
              </span>
            )}
          </div>

          {/* Product Title */}
          <h1 className="mt-4 font-sans text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {product.name}
          </h1>

          {/* Star Reviews & Metrics */}
          <div className="mt-4 flex items-center space-x-3 border-b border-slate-100 pb-5">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating || 5)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-slate-800">{product.rating || '5.0'}</span>
            <span className="text-slate-300">|</span>
            <span className="text-sm text-slate-500">{product.reviewsCount || '10'} verified customer reviews</span>
          </div>

          {/* Pricing Panel */}
          <div className="mt-6">
            <span className="text-3xl font-extrabold text-slate-900">${product.price.toFixed(2)}</span>
            <p className="mt-1 text-xs text-slate-400">Tax calculated during checkout</p>
          </div>

          {/* Description Copy */}
          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Product Overview</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {product.description}
            </p>
          </div>

          {/* Spec details mock block to feel professional and high craft */}
          <div className="mt-6 rounded-xl bg-slate-50 p-4 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Specifications</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
              <span className="font-medium text-slate-400">Category</span>
              <span>{product.category}</span>
              <span className="font-medium text-slate-400">Warranty</span>
              <span>2 Year Limited</span>
              <span className="font-medium text-slate-400">Condition</span>
              <span>Brand New Original</span>
            </div>
          </div>

          {/* Add To Cart & Quantity Section */}
          {!isOutOfStock && (
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
              
              {/* Quantity Selector widget */}
              <div className="flex items-center">
                <span className="mr-3 text-sm font-semibold text-slate-700">Quantity:</span>
                <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1">
                  <button
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 transition"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-slate-800">{quantity}</span>
                  <button
                    onClick={handleIncrement}
                    disabled={quantity >= product.stock}
                    className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleAdd}
                className={`flex flex-1 items-center justify-center rounded-lg px-6 py-3 text-sm font-bold text-white shadow-md transition-all duration-300 ${
                  isAdded
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-100'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    <span>Add {quantity} to Shopping Cart</span>
                  </>
                )}
              </button>
            </div>
          )}

          {isOutOfStock && (
            <div className="mt-8 rounded-xl bg-red-50 p-4 border border-red-100 text-sm text-red-700">
              This item is currently out of stock. Please check back later or explore other products in our store.
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
