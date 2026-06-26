import { ShoppingBag, User, LogOut, ShieldAlert, ClipboardList, Search } from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  currentUser: UserType | null;
  cartCount: number;
  currentTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CATEGORIES = ['All', 'Audio', 'Electronics', 'Wearables', 'Home & Living'];

export default function Navbar({
  currentUser,
  cartCount,
  currentTab,
  onTabChange,
  onLogout,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange
}: NavbarProps) {
  return (
    <header id="app-header" className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo */}
          <div 
            id="brand-logo" 
            className="flex cursor-pointer items-center space-x-2" 
            onClick={() => { onTabChange('shop'); onCategoryChange('All'); }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md transition hover:scale-105">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="font-sans text-xl font-bold tracking-tight text-slate-900">
              Poojitha_aura App<span className="text-indigo-600 font-medium">.store</span>
            </span>
          </div>

          {/* Search bar - Only visible in shop */}
          {currentTab === 'shop' && (
            <div id="search-container" className="hidden max-w-md flex-1 sm:block">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search premium products..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-4 pl-10 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div id="nav-actions" className="flex items-center space-x-4">
            {/* My Orders Button */}
            {currentUser && (
              <button
                onClick={() => onTabChange('orders')}
                className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  currentTab === 'orders' 
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                title="My Orders"
              >
                <ClipboardList className="h-4 w-4 text-indigo-500" />
                <span className="hidden md:inline">My Orders</span>
              </button>
            )}

            {/* Admin Dashboard Button */}
            {currentUser?.isAdmin && (
              <button
                onClick={() => onTabChange('admin')}
                className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  currentTab === 'admin' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                title="Admin Panel"
              >
                <ShieldAlert className="h-4 w-4 text-emerald-600" />
                <span className="hidden md:inline">Admin</span>
              </button>
            )}

            {/* Shopping Cart Trigger */}
            <button
              onClick={() => onTabChange('cart')}
              className={`relative flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                currentTab === 'cart' 
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              title="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline">Cart</span>
            </button>

            {/* Auth Block */}
            <div className="h-6 w-[1px] bg-slate-200"></div>

            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="hidden flex-col items-end text-xs md:flex">
                  <span className="font-medium text-slate-900">{currentUser.username}</span>
                  <span className="text-slate-400 text-[10px]">{currentUser.email}</span>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 font-semibold ring-1 ring-indigo-100">
                  {currentUser.username.substring(0, 2).toUpperCase()}
                </div>
                <button
                  onClick={onLogout}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onTabChange('auth')}
                className="flex items-center space-x-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 transition shadow-sm"
              >
                <User className="h-4 w-4" />
                <span>Log In</span>
              </button>
            )}
          </div>
        </div>

        {/* Categories Bar - Only in Shop tab */}
        {currentTab === 'shop' && (
          <div id="categories-tabs" className="flex items-center space-x-2 overflow-x-auto py-3 scrollbar-none border-t border-slate-100">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`rounded-full px-4 py-1 text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
