import React from 'react';
import { Star, ShoppingCart, Info } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  key?: any;
}

export default function ProductCard({ product, onAddToCart, onViewDetails }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div 
      id={`product-card-${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-md"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Category tag */}
        <span className="absolute top-3 left-3 rounded-md bg-white/95 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-800 shadow-sm border border-slate-100">
          {product.category}
        </span>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px]">
            <span className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white tracking-wide shadow-lg animate-pulse">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-1.5">
          {/* Star rating */}
          <div className="flex items-center space-x-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-slate-700">{product.rating || '5.0'}</span>
            <span className="text-slate-400 text-[10px]">({product.reviewsCount || '0'})</span>
          </div>

          {/* Stock warnings */}
          {isLowStock && (
            <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              Only {product.stock} left
            </span>
          )}
          {!isOutOfStock && !isLowStock && (
            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              In stock
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="mt-2.5 font-sans text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {product.name}
        </h3>

        {/* Description Snippet */}
        <p className="mt-1 flex-1 text-xs text-slate-500 line-clamp-2">
          {product.description}
        </p>

        {/* Price & Action Strip */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-base font-bold text-slate-900">
            ${product.price.toFixed(2)}
          </span>

          <div className="flex space-x-1.5">
            {/* Quick Details Trigger */}
            <button
              onClick={() => onViewDetails(product)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition"
              title="View Details"
            >
              <Info className="h-4 w-4" />
            </button>

            {/* Quick Add To Cart */}
            <button
              onClick={() => onAddToCart(product)}
              disabled={isOutOfStock}
              className={`flex items-center justify-center rounded-lg px-3.5 py-2 text-xs font-bold text-white shadow-sm transition ${
                isOutOfStock
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-sm shadow-indigo-100'
              }`}
            >
              <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
