import { Home, Search, ShoppingCart, User, BookOpen } from 'lucide-react';

interface UserNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  cartCount: number;
  cartTotal: number;
}

export default function UserNav({
  currentView,
  onNavigate,
  cartCount,
  cartTotal,
}: UserNavProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'recipes', label: 'Recipes', icon: BookOpen },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, badge: cartCount },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Bottom Sticky Tab Bar (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white md:hidden shadow-[0_-2px_10px_rgba(45,90,39,0.08)] border-t border-outline-variant/30">
        <div className="flex justify-around items-center h-16 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentView === tab.id || (tab.id === 'search' && currentView === 'category');
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-4 rounded-full transition-all duration-200 active:scale-90 ${
                  isActive
                    ? 'bg-secondary-container text-on-secondary-container font-bold font-label-md'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" fill={isActive ? 'currentColor' : 'none'} />
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-error text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2 ring-white">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-label-md mt-0.5">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Floating Action Button for Cart (Desktop Only) */}
      <div className="fixed bottom-8 right-8 hidden md:block z-50">
        <button
          onClick={() => onNavigate('cart')}
          className="bg-primary text-on-primary w-16 h-16 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center group relative border border-primary/20"
        >
          <ShoppingCart className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-error text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md">
              {cartCount}
            </span>
          )}
          
          {/* Tooltip Hover Summary */}
          <div className="absolute right-20 bg-white text-on-surface p-3 rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap border border-outline-variant/60">
            <p className="font-label-md text-xs text-on-surface-variant">
              {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
            </p>
            <p className="text-primary font-bold text-sm mt-0.5">
              ${cartTotal.toFixed(2)} total
            </p>
          </div>
        </button>
      </div>
    </>
  );
}
