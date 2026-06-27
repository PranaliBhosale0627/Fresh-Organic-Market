import React, { useState } from 'react';
import { Search, Heart, Sparkles, Truck, Award, ShoppingCart, Check } from 'lucide-react';
import { Product } from '../types';

interface HomeViewProps {
  products: Product[];
  onNavigate: (view: string, category?: string) => void;
  onSelectProduct: (productId: string) => void;
  onAddToCart: (product: Product) => void;
}

export default function HomeView({
  products,
  onNavigate,
  onSelectProduct,
  onAddToCart,
}: HomeViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [addedItemIds, setAddedItemIds] = useState<string[]>([]);

  // Find trending items
  const trendingIds = ['prod-cherry-tomatoes', 'prod-sourdough', 'prod-microgreens', 'prod-avocados'];
  const trendingProducts = products.filter((p) => trendingIds.includes(p.id));

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('category');
    }
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    
    // Quick success animation state
    setAddedItemIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedItemIds((prev) => prev.filter((id) => id !== product.id));
    }, 2000);
  };

  const categories = [
    { name: 'Vegetables', icon: '🌱', colorBg: 'bg-emerald-50 hover:bg-emerald-100', colorText: 'text-emerald-800' },
    { name: 'Fruits', icon: '🍊', colorBg: 'bg-orange-50 hover:bg-orange-100', colorText: 'text-orange-800' },
    { name: 'Dairy', icon: '🥛', colorBg: 'bg-blue-50 hover:bg-blue-100', colorText: 'text-blue-800' },
    { name: 'Bakery', icon: '🍞', colorBg: 'bg-amber-50 hover:bg-amber-100', colorText: 'text-amber-800' },
    { name: 'Meats', icon: '🥩', colorBg: 'bg-red-50 hover:bg-red-100', colorText: 'text-red-800' },
    { name: 'Pantry', icon: '🥫', colorBg: 'bg-yellow-50 hover:bg-yellow-100', colorText: 'text-yellow-800' },
  ];

  return (
    <div className="px-4 md:px-12 py-6 space-y-10 max-w-7xl mx-auto">
      {/* Search Input Section */}
      <section className="relative max-w-2xl mx-auto mt-4">
        <form onSubmit={handleSearchSubmit} className="relative group">
          <input
            type="text"
            placeholder="Search fresh vegetables, fruits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-6 rounded-full border-none bg-white shadow-[0_4px_15px_rgba(45,90,39,0.06)] focus:ring-2 focus:ring-primary/20 text-sm transition-all focus:shadow-[0_4px_20px_rgba(45,90,39,0.12)] outline-none"
          />
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-primary-container transition-colors"
          >
            Find
          </button>
        </form>
      </section>

      {/* Seasonal Picks Banner */}
      <section>
        <div className="relative h-[340px] md:h-[420px] rounded-[32px] overflow-hidden group shadow-lg border border-outline-variant/20">
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/70 via-black/30 to-transparent"></div>
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ 
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAEbA0DBCn3YgVEcw1RCtV77DJyczEPFrFL1vd6HXyet2G1jLsO-necd6nAIDjDgH0bx733bd-dy8iiYKizRRxvZNtjJ0dRa4LOq0_pSURhYIMHJuwnhW4JJ3w-dvcFU4152QHdrqPjFNjJaW-JLjS4ED7ccQzxjU2o22Cn-NDyzM9ygHOZPYL1Cxq2E5F5IYHVKR6zJC7Qay63qCPhiyxU3FoJEy8EbMVHDZq-2YL02RM00pGM8BqmSiXxKPXBHQ2UbOLek8VDYTg')` 
            }}
          ></div>
          <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 md:px-16 max-w-2xl text-left">
            <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant w-fit px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider mb-4 border border-tertiary-fixed-dim/30">
              Limited Availability
            </span>
            <h2 className="text-white font-display-lg text-3xl md:text-5xl leading-tight mb-3">
              Summer's Finest Harvest
            </h2>
            <p className="text-white/90 text-sm md:text-base leading-relaxed mb-6 max-w-md">
              Experience the crunch of peak-season vegetables, harvested daily from our partner farms in Sonoma.
            </p>
            <button 
              onClick={() => onNavigate('category', 'Vegetables')}
              className="bg-primary text-on-primary px-8 py-3.5 rounded-full font-bold text-sm w-fit hover:bg-primary-container transition-all hover:shadow-lg active:scale-95"
            >
              Shop Seasonal Picks
            </button>
          </div>
        </div>
      </section>

      {/* Horizontal Categories */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-md text-xl md:text-2xl text-on-surface font-bold">Browse by Category</h3>
          <button 
            onClick={() => onNavigate('category')} 
            className="text-primary font-bold text-sm hover:underline decoration-2 underline-offset-4"
          >
            View All
          </button>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-none scroll-smooth">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onNavigate('category', cat.name)}
              className="flex-shrink-0 w-28 group cursor-pointer text-center focus:outline-none"
            >
              <div className={`w-24 h-24 rounded-full ${cat.colorBg} flex items-center justify-center mb-2 mx-auto transition-all shadow-sm border border-outline-variant/10 group-hover:scale-105 group-hover:shadow-md`}>
                <span className="text-4xl transition-transform group-hover:rotate-6">{cat.icon}</span>
              </div>
              <p className="font-bold text-xs text-on-surface group-hover:text-primary transition-colors">
                {cat.name}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Trending Near You Grid */}
      <section className="space-y-6">
        <div className="text-left">
          <h3 className="font-headline-md text-xl md:text-2xl text-on-surface font-bold flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-secondary animate-pulse" /> Trending Near You
          </h3>
          <p className="text-on-surface-variant text-xs md:text-sm mt-1">
            Community favorites based on recent local purchases.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.map((p) => {
            const isFav = favorites.includes(p.id);
            const isAdded = addedItemIds.includes(p.id);
            return (
              <div
                key={p.id}
                onClick={() => onSelectProduct(p.id)}
                className="bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-outline-variant/30 flex flex-col h-full cursor-pointer relative"
              >
                {/* Image Aspect ratio container */}
                <div className="relative aspect-square overflow-hidden bg-surface-container-low">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={p.image}
                    alt={p.name}
                  />
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => toggleFavorite(p.id, e)}
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white hover:scale-110 active:scale-90 transition-all z-10 border border-outline-variant/10"
                  >
                    <Heart
                      className={`w-4.5 h-4.5 transition-colors ${
                        isFav ? 'text-error fill-error' : 'text-on-surface-variant'
                      }`}
                    />
                  </button>
                  {/* Badge */}
                  {p.tag && (
                    <div className="absolute bottom-3 left-3 flex gap-1 z-10">
                      <span className="bg-primary/95 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-primary/20">
                        {p.tag}
                      </span>
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="p-4 flex flex-col flex-grow text-left justify-between">
                  <div>
                    <h4 className="font-semibold text-xs md:text-sm text-on-surface mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {p.name}
                    </h4>
                    <p className="text-[11px] text-on-surface-variant font-medium">
                      {p.category} • {p.unit}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="font-bold text-base text-primary">${p.price.toFixed(2)}</p>
                      {p.originalPrice && (
                        <p className="text-[10px] text-error line-through font-semibold">
                          ${p.originalPrice.toFixed(2)}
                        </p>
                      )}
                    </div>
                    {/* Add to Cart button */}
                    <button
                      onClick={(e) => handleQuickAdd(p, e)}
                      className={`p-2.5 rounded-xl hover:shadow-md active:scale-90 transition-all border ${
                        isAdded
                          ? 'bg-secondary text-white border-secondary'
                          : 'bg-secondary-container text-on-secondary-container border-secondary-container hover:bg-secondary-container/80'
                      }`}
                    >
                      {isAdded ? (
                        <Check className="w-4 h-4 stroke-[3px]" />
                      ) : (
                        <ShoppingCart className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Freshness Promise Banner */}
      <section className="pb-10">
        <div className="bg-primary-container text-on-primary-container rounded-[32px] p-6 md:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,_rgba(255,255,255,0.15)_0%,_transparent_100%)]"></div>
          
          <div className="relative z-10 flex-1 text-left space-y-4">
            <h3 className="font-headline-lg text-2xl md:text-4xl font-bold text-primary-fixed leading-tight">
              The Freshness Promise
            </h3>
            <p className="text-primary-fixed/90 text-sm md:text-base max-w-lg leading-relaxed font-body-lg">
              Every item in our store is hand-selected and delivered within 24 hours of harvest. If you aren't delighted by the quality, your next box is on us.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-2 bg-primary/30 px-4 py-2 rounded-full border border-primary/20">
                <Award className="w-4 h-4 text-primary-fixed" />
                <span className="text-xs font-bold text-primary-fixed">Certified Organic</span>
              </div>
              <div className="flex items-center gap-2 bg-primary/30 px-4 py-2 rounded-full border border-primary/20">
                <Truck className="w-4 h-4 text-primary-fixed" />
                <span className="text-xs font-bold text-primary-fixed">Eco-Delivery</span>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 w-full md:w-1/3 max-w-[280px] aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDzxTSvIUOTp9JD2xcTsaqH3ElLylvGfhzaifyL1vsVkBdNRfkXVSevD1wbCxxPIpM92UxbchHMr2cbyXCQNB69XoXRINAonp7FphzCvCGtNuEkAPhZoIKAuQ-XHXYZBye9l4V44ktlLZ5D0Kf1OqCNQonTVo4hEfs_dmbnWbhVwJhc6TdWHI78Q0tkA8xqlUmx-Vh9RYYJoepHutoOyU17JJsTtIXQWkDHTkBaUAlBBxQ204jSdvdlb3IEMizohkmgdADNO4oNt0"
              alt="Harvest Basket"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
