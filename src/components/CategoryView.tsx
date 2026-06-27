import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, ChevronDown, Check, ShoppingCart, Mail } from 'lucide-react';
import { Product } from '../types';

interface CategoryViewProps {
  products: Product[];
  initialCategory?: string;
  onNavigate: (view: string) => void;
  onSelectProduct: (productId: string) => void;
  onAddToCart: (product: Product) => void;
}

export default function CategoryView({
  products,
  initialCategory = 'All Products',
  onNavigate,
  onSelectProduct,
  onAddToCart,
}: CategoryViewProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'price-asc' | 'price-desc' | 'popular'>('relevance');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<string[]>([]);
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [subscriberEmail, setSubscriberEmail] = useState('');

  const categories = ['All Products', 'Vegetables', 'Fruits', 'Dairy', 'Bakery', 'Pantry'];

  // Filter & Search Logic
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category Filter
    if (selectedCategory !== 'All Products') {
      list = list.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    // Sorting Logic
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'popular') {
      list.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    }

    return list;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    
    // Quick tick animation
    setAddedItemIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedItemIds((prev) => prev.filter((id) => id !== product.id));
    }, 2000);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscriberEmail.trim()) {
      setEmailSubscribed(true);
      setTimeout(() => {
        setEmailSubscribed(false);
        setSubscriberEmail('');
      }, 5000);
    }
  };

  return (
    <div className="px-4 md:px-12 py-8 max-w-7xl mx-auto space-y-8 text-left">
      {/* Search & Sort Actions Bar */}
      <section className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search input with pill styling */}
        <div className="w-full md:max-w-md relative group">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder={`Search fresh ${selectedCategory === 'All Products' ? 'vegetables' : selectedCategory.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-white border border-outline-variant/30 rounded-full shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>

        {/* Sort and Filters */}
        <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button className="flex items-center gap-2 px-5 h-12 bg-primary-container text-on-primary-container font-semibold text-xs md:text-sm rounded-full whitespace-nowrap hover:opacity-95 transition-all">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 px-5 h-12 bg-white border border-outline-variant hover:bg-surface-container-low text-on-surface font-semibold text-label-md rounded-full whitespace-nowrap transition-colors"
            >
              Sort by: {
                {
                  'Relevance': 'Relevance',
                  'PriceLow': 'Price: Low to High',
                  'PriceHigh': 'Price: High to Low',
                }[sortBy] || 'Relevance'
              }
              <ChevronDown className="w-4 h-4 text-on-surface-variant" />
            </button>

            {/* Simulated Sort Dropdown */}
            <div className="absolute right-0 mt-2 bg-white border border-outline-variant/50 rounded-2xl shadow-xl w-48 py-2 z-50 hidden hover:block group-hover:block">
              {/* Note: Simply select directly using trigger list or inline selection bar */}
            </div>
            {/* Simple dropdown toggle since we're in pure react, let's just make it a select or inline togglers */}
            <select 
              value={sortBy} 
              onChange={(e) => {
                const val = e.target.value as any;
                setSortBy(val);
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popular">Popularity</option>
            </select>
          </div>
        </div>
      </section>

      {/* Category Selection Chips */}
      <section className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSearchQuery('');
              }}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-white shadow-sm ring-2 ring-primary/10'
                  : 'bg-white border border-outline-variant text-on-surface-variant hover:bg-surface-container-low hover:border-secondary'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </section>

      {/* Title & Stats */}
      <section className="space-y-1">
        <h2 className="font-display-lg text-2xl md:text-3.5xl text-on-surface font-bold">
          {selectedCategory === 'All Products' ? 'Organic Produce' : selectedCategory}
        </h2>
        <p className="text-on-surface-variant font-medium text-xs">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
        </p>
      </section>

      {/* Bento Asymmetrical Grid */}
      <section>
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-outline-variant rounded-[32px] bg-white">
            <p className="text-on-surface-variant font-medium text-sm">
              No organic products match your query. Try selecting another category!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => {
              const isAdded = addedItemIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProduct(p.id)}
                  className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-outline-variant/30 hover:shadow-xl transition-all duration-300 cursor-pointer shadow-sm relative h-full"
                >
                  {/* Photo area */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-surface-container-low">
                    <img
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={p.image}
                      alt={p.name}
                    />
                    {p.tag && (
                      <div className="absolute top-3 left-3 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-bold text-[10px] shadow-sm uppercase tracking-wider">
                        {p.tag}
                      </div>
                    )}
                  </div>

                  {/* Contents */}
                  <div className="p-4 md:p-5 flex flex-col flex-grow justify-between gap-2">
                    <div>
                      <span className="font-semibold text-[11px] text-on-surface-variant/80 tracking-wide uppercase">
                        {p.unit}
                      </span>
                      <h3 className="font-bold text-sm md:text-base text-on-surface leading-tight mt-0.5 line-clamp-1 group-hover:text-primary transition-colors">
                        {p.name}
                      </h3>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-1">
                      <div className="flex flex-col">
                        <span className="font-bold text-base text-primary">${p.price.toFixed(2)}</span>
                        {p.originalPrice && (
                          <span className="text-[10px] text-error line-through font-semibold">
                            ${p.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleQuickAdd(p, e)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md active:scale-90 ${
                          isAdded
                            ? 'bg-secondary text-white'
                            : 'bg-primary text-on-primary hover:bg-primary-container'
                        }`}
                      >
                        {isAdded ? (
                          <Check className="w-4.5 h-4.5 stroke-[3px]" />
                        ) : (
                          <ShoppingCart className="w-4.5 h-4.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Premium High-End Newsletter Box */}
      <section className="mt-12 relative rounded-[40px] overflow-hidden bg-primary-container p-8 md:p-16 text-on-primary-container shadow-lg border border-primary/20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(255,255,255,0.25)_0%,_transparent_100%)]"></div>
        </div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <h2 className="font-display-lg text-white text-3xl md:text-5xl font-bold leading-tight">
            Fresh harvests, delivered weekly.
          </h2>
          <p className="font-body-lg text-sm md:text-base opacity-90 leading-relaxed max-w-lg text-primary-fixed">
            Join our organic club and get 15% off your first box of seasonal vegetables straight from local partner farms.
          </p>
          
          {emailSubscribed ? (
            <div className="bg-white/10 border border-white/20 p-4 rounded-2xl flex items-center gap-3 text-white max-w-md animate-fade-in">
              <Check className="w-6 h-6 text-secondary-fixed shrink-0" />
              <div>
                <p className="font-bold text-sm">Thank you for subscribing!</p>
                <p className="text-xs opacity-80">Check your inbox for a 15% discount coupon.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 pt-2">
              <input
                type="email"
                required
                placeholder="Your email address"
                value={subscriberEmail}
                onChange={(e) => setSubscriberEmail(e.target.value)}
                className="flex-grow h-14 px-6 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:ring-2 focus:ring-white focus:outline-none transition-all text-sm outline-none"
              />
              <button
                type="submit"
                className="h-14 px-8 bg-secondary-fixed text-on-secondary-fixed font-bold text-sm rounded-full hover:bg-secondary-container transition-all active:scale-95"
              >
                Subscribe Now
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
