import { useState } from 'react';
import { ArrowLeft, Star, Heart, Share2, Plus, Minus, ShoppingCart, Check, ShieldCheck, MapPin } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailViewProps {
  product: Product;
  onNavigate: (view: string) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
}

export default function ProductDetailView({
  product,
  onNavigate,
  onAddToCart,
  isWishlisted = false,
  onToggleWishlist,
}: ProductDetailViewProps) {
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);

  const handleQtyChange = (delta: number) => {
    setQuantity((prev) => Math.min(product.stock, Math.max(1, prev + delta)));
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert(`Sharing URL for: ${product.name}!`);
    }
  };

  // Safe defaults if product values are empty
  const rating = product.rating || 4.8;
  const reviewsCount = product.reviewsCount || 1200;
  const description = product.description || 'Creamy, rich, and harvested daily at the peak of flavor.';
  const nutritionalFacts = product.nutritionalFacts || {
    calories: 160,
    fat: '15g',
    fiber: '7g',
    protein: '2g',
    details: 'Great source of vitamins C, E, K, and B6, as well as riboflavin, niacin, and potassium.'
  };
  const origin = product.origin || {
    farm: 'Verde Valley Farms',
    location: 'Sonoma County, CA',
    badges: ['Certified Regenerative', 'Hand-Picked Daily']
  };

  return (
    <div className="pb-32 relative text-left animate-rise-in">
      {/* Top action app bar */}
      <div className="glass-panel sticky top-[64px] z-40 max-w-7xl mx-auto px-3 sm:px-4 md:px-12 py-3 sm:py-4 flex items-center justify-between border border-white/70 rounded-b-[28px] shadow-lg shadow-primary/5">
        <button
          onClick={() => onNavigate('category')}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-all active:scale-95 text-primary border border-outline-variant/20 bg-white/80 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-sm text-primary uppercase tracking-wider font-headline-md">
          {product.category} details
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onToggleWishlist?.(product)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-all active:scale-95 border border-outline-variant/20 bg-white/80 shadow-sm"
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'text-error fill-error' : 'text-on-surface-variant'}`} />
          </button>
          <button
            onClick={handleShare}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-all active:scale-95 border border-outline-variant/20 bg-white/80 shadow-sm"
          >
            <Share2 className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-12 mt-6 lg:mt-12 space-y-10 sm:space-y-12">
        {/* Hero Section: Grid Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Large Image Container */}
          <div className="lg:col-span-7 relative group animate-rise-in">
            <div className="aspect-[4/5] md:aspect-[16/10] lg:aspect-[4/3] rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden shadow-xl shadow-primary/10 border border-outline-variant/20 interactive-lift">
              <img
                className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                src={product.image}
                alt={product.name}
              />
            </div>
            
            {/* Tag Badges Overlay */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              <span className="bg-secondary-container text-on-secondary-container px-4 py-1.5 rounded-full font-bold text-xs flex items-center gap-1 shadow-sm backdrop-blur-md bg-opacity-95">
                <Check className="w-3.5 h-3.5 stroke-[3px]" />
                {product.tag || '100% Organic'}
              </span>
              <span className="bg-white text-primary px-4 py-1.5 rounded-full font-bold text-xs flex items-center gap-1 shadow-sm backdrop-blur-md bg-opacity-95 border border-outline-variant/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Free Delivery
              </span>
            </div>
          </div>

          {/* Product Info Block */}
          <div className="lg:col-span-5 flex flex-col justify-center gap-6 animate-rise-in stagger-1">
            <div className="space-y-3">
              {/* Rating stars */}
              <div className="flex items-center gap-2">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="w-4.5 h-4.5" 
                      fill={i < Math.floor(rating) ? 'currentColor' : 'none'} 
                    />
                  ))}
                </div>
                <span className="font-bold text-xs text-on-surface-variant">({reviewsCount} Reviews)</span>
              </div>

              {/* Title & Description */}
              <h2 className="font-headline-lg text-3xl md:text-5xl text-primary leading-tight font-bold tracking-tight">
                {product.name}
              </h2>
              <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
                {description}
              </p>
            </div>

            {/* Price display */}
            <div className="flex items-end gap-3 border-y border-outline-variant/20 py-4">
              <span className="font-display-lg text-4xl text-primary font-bold leading-none">
                ${product.price.toFixed(2)}
              </span>
              <span className="font-semibold text-xs text-on-surface-variant mb-1">
                / {product.unit}
              </span>
            </div>

            {/* Quantity Selector & Stock Info */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center bg-surface-container rounded-full p-1 border border-outline-variant/40 shadow-inner">
                <button
                  onClick={() => handleQtyChange(-1)}
                  disabled={quantity <= 1}
                  className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all disabled:opacity-40"
                >
                  <Minus className="w-4.5 h-4.5" />
                </button>
                <span className="w-12 text-center font-bold text-base select-none">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQtyChange(1)}
                  disabled={quantity >= product.stock}
                  className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all disabled:opacity-40"
                >
                  <Plus className="w-4.5 h-4.5" />
                </button>
              </div>
              <div>
                <p className="text-xs font-bold text-primary">In Stock: {product.stock} available</p>
                <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">Maximum order checkout limit applies</p>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Details Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 animate-rise-in stagger-2">
          {/* Nutritional Facts Bento */}
          <div className="md:col-span-2 bg-white rounded-[1.75rem] sm:rounded-[2rem] p-5 sm:p-6 md:p-8 shadow-sm hover:shadow-xl hover:shadow-primary/10 border border-outline-variant/30 text-left interactive-lift">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-headline-md text-lg md:text-xl text-primary font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-secondary" />
                Nutritional Facts
              </h3>
              <span className="font-semibold text-[10px] text-on-surface-variant uppercase tracking-wider">Per 100g</span>
            </div>

            {/* Nutrition metrics grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-4 rounded-2xl bg-surface-container-low/70 border border-outline-variant/10 interactive-lift">
                <span className="font-headline-lg text-2xl text-primary font-bold">{nutritionalFacts.calories}</span>
                <span className="font-semibold text-[11px] text-on-surface-variant mt-1">Calories</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-2xl bg-surface-container-low/70 border border-outline-variant/10 interactive-lift">
                <span className="font-headline-lg text-2xl text-primary font-bold">{nutritionalFacts.fat}</span>
                <span className="font-semibold text-[11px] text-on-surface-variant mt-1">Total Fat</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-2xl bg-surface-container-low/70 border border-outline-variant/10 interactive-lift">
                <span className="font-headline-lg text-2xl text-primary font-bold">{nutritionalFacts.fiber}</span>
                <span className="font-semibold text-[11px] text-on-surface-variant mt-1">Fiber</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-2xl bg-surface-container-low/70 border border-outline-variant/10 interactive-lift">
                <span className="font-headline-lg text-2xl text-primary font-bold">{nutritionalFacts.protein}</span>
                <span className="font-semibold text-[11px] text-on-surface-variant mt-1">Protein</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-outline-variant/20">
              <p className="text-xs text-on-surface-variant italic font-medium leading-relaxed">
                * {nutritionalFacts.details}
              </p>
            </div>
          </div>

          {/* Store Origin Bento */}
          <div className="bg-primary-container text-on-primary-container rounded-[1.75rem] sm:rounded-[2rem] p-6 md:p-8 shadow-xl shadow-primary/10 flex flex-col justify-between overflow-hidden relative group border border-primary/20 interactive-lift">
            <div className="relative z-10 space-y-4">
              <h3 className="font-headline-md text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-fixed" />
                Store Origin
              </h3>
              <div className="flex flex-col">
                <p className="text-base font-bold text-primary-fixed">{origin.farm}</p>
                <p className="text-xs text-primary-fixed/80">{origin.location}</p>
              </div>
              <div className="space-y-2 pt-2">
                {origin.badges.map((badge, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-white/90 text-xs font-semibold">
                    <Check className="w-4 h-4 text-secondary-container" />
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => alert(`Visiting profile of ${origin.farm}!`)}
              className="mt-6 relative z-10 w-full py-3 bg-white text-primary rounded-xl font-bold text-xs hover:bg-opacity-95 transition-all active:scale-95 shadow-md"
            >
              Visit Store Profile
            </button>
          </div>
        </section>

        {/* Why Choose Section with Images */}
        <section className="space-y-6 pt-4 animate-rise-in stagger-3">
          <div className="max-w-xl">
            <h3 className="font-headline-md text-xl md:text-2xl text-primary font-bold mb-3">Why choose {product.name.split(' ').pop()}?</h3>
            <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">
              These premium selections are harvested using regeneratively certified practices, ensuring soil health and high trace nutrient mineral concentration. Plump, delicious, and double-checked for quality.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-3xl overflow-hidden aspect-video relative group shadow-sm border border-outline-variant/10 interactive-lift">
              <img
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCr0a6XLWbL86ML0aDKsd-Wn4flLSMuwsj6IGGiCurrHmpTFIDD-lFT8tbS-tmd6KEVfeqhUp-Zg2Nq2_MxxU2gwVlzoveTKXAZg4imxeZAWmm27PIiTqM97ToT2XD73L6b0X2AWLEytWM1_hiexwZ4VRT4mnuvHPJmqFiDTn6Otl4ar5BDYzWNjoPUq1kr4hkTSCHTLJyifljOcPZQz0sstDmmQbiyXCZ3pUSDRf9urlO24wZpj2rv9DnlMMMoMigsbiBwjM1Tlog"
                alt="Preparation toast"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                <span className="text-white font-bold text-xs">Fresh Culinary Slices</span>
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden aspect-video relative group shadow-sm border border-outline-variant/10 interactive-lift">
              <img
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAn6KK1amU1jtvWYsC9zLBwbwFOeQXfBRP2giUQghulayl12Zs-WqQpwSfYDBLdjo044IyZXxtEo7gWH4OTn2qLqv7zQyJR225cChqZf3Fgf_IxHxQerdjr8yotlZjVttMs4DR0n1wml38Nai2GHg2Vuzufb3Ta2Ql1wxLy-vZQWunDAsCwAcF4ye-hWlV-CbbcTrwe1GYnIDrFLzi_j13wdrlu6wExc-ahxz5CYOIWZi30X1_Lg-g61Su6VTOwtQ01nWmH06M-jF8"
                alt="Salad bowl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                <span className="text-white font-bold text-xs">Bright Healthy Salads</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky Bottom Action bar */}
      <div className="fixed bottom-0 left-0 w-full z-50 glass-panel border-t border-white/70 px-3 sm:px-4 py-3 sm:py-4 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          <div className="hidden md:flex flex-col">
            <span className="font-semibold text-[11px] text-on-surface-variant uppercase tracking-wider">Total Price</span>
            <span className="font-bold text-2xl text-primary">
              ${(quantity * product.price).toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className="flex-1 max-w-2xl bg-primary text-on-primary py-4 rounded-full font-bold text-sm sm:text-base flex items-center justify-center gap-3 shadow-lg hover:bg-primary-container hover:shadow-xl hover:shadow-primary/25 transition-all active:scale-[0.98] duration-150 border border-primary/20"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart - ${(quantity * product.price).toFixed(2)}
          </button>

          <button
            onClick={() => onToggleWishlist?.(product)}
            className="w-14 h-14 flex items-center justify-center rounded-full border-2 border-primary text-primary hover:bg-secondary-container/20 transition-colors active:scale-95 shrink-0"
          >
            <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-primary' : 'none'}`} />
          </button>
        </div>
      </div>

      {/* Micro-interaction: Success Toast */}
      <div
        className={`fixed bottom-24 left-1/2 -translate-x-1/2 bg-on-surface text-surface px-6 py-3 rounded-full font-semibold text-xs shadow-2xl transition-all duration-300 z-[100] flex items-center gap-2 ${
          showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-ping"></span>
        Added {quantity} x {product.name} to your basket!
      </div>
    </div>
  );
}
