import { useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Tag, Truck, ShoppingBag } from 'lucide-react';
import { CartItem, Product } from '../types';

interface CartViewProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onNavigate: (view: string) => void;
}

export default function CartView({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onNavigate,
}: CartViewProps) {
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState(0);
  const [couponError, setCouponCodeError] = useState('');
  const [couponSuccess, setCouponCodeSuccess] = useState('');

  // Computations
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal > 30 || subtotal === 0 ? 0 : 2.99;
  const tax = subtotal * 0.08; // 8% tax
  const discountAmount = subtotal * (appliedDiscountPercent / 100);
  const total = subtotal - discountAmount + deliveryFee + tax;

  const handleApplyCoupon = () => {
    setCouponCodeError('');
    setCouponCodeSuccess('');
    
    const code = couponCode.trim().toUpperCase();
    if (code === 'FRESH20') {
      setAppliedDiscountPercent(20);
      setCouponCodeSuccess('Coupon "FRESH20" (20% off) applied successfully!');
    } else if (code === 'HEALTHY10') {
      setAppliedDiscountPercent(10);
      setCouponCodeSuccess('Coupon "HEALTHY10" (10% off) applied successfully!');
    } else {
      setCouponCodeError('Invalid coupon code. Try "FRESH20" or "HEALTHY10"');
    }
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length > 0) {
      // Store summary in localStorage for checkout view
      localStorage.setItem('checkout_subtotal', subtotal.toFixed(2));
      localStorage.setItem('checkout_delivery', deliveryFee.toFixed(2));
      localStorage.setItem('checkout_tax', tax.toFixed(2));
      localStorage.setItem('checkout_discount', discountAmount.toFixed(2));
      localStorage.setItem('checkout_total', total.toFixed(2));
      localStorage.setItem('checkout_discount_code', appliedDiscountPercent > 0 ? couponCode : '');
      
      onNavigate('checkout');
    }
  };

  return (
    <div className="px-4 md:px-12 py-8 max-w-7xl mx-auto text-left space-y-8">
      {/* View Header */}
      <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <h2 className="font-headline-lg text-2xl md:text-3.5xl text-on-surface font-bold">Your Shopping Cart</h2>
        </div>
        <span className="text-on-surface-variant font-semibold text-sm">
          {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      {cartItems.length === 0 ? (
        /* Empty Cart State */
        <div className="py-20 text-center space-y-6 max-w-md mx-auto bg-white rounded-3xl border border-outline-variant/30 p-8 shadow-sm">
          <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto text-on-surface-variant/40">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="font-headline-md text-xl font-bold">Your cart is empty</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Looks like you haven't added anything yet. Choose from our fresh hand-picked catalog to begin.
            </p>
          </div>
          <button
            onClick={() => onNavigate('category')}
            className="bg-primary text-on-primary px-8 py-3.5 rounded-full font-bold text-sm shadow-md hover:bg-primary-container transition-colors inline-block active:scale-95"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        /* Full Cart Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.product.id}
                className="bg-white rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 border border-outline-variant/30 shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Product Image */}
                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container-low border border-outline-variant/10">
                  <img
                    className="w-full h-full object-cover"
                    src={item.product.image}
                    alt={item.product.name}
                  />
                </div>

                {/* Info and Actions */}
                <div className="flex-grow w-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm md:text-base text-on-surface leading-snug">
                        {item.product.name}
                      </h3>
                      <p className="text-on-surface-variant font-semibold text-[11px] uppercase tracking-wide mt-0.5">
                        {item.product.category} • {item.product.unit}
                      </p>
                    </div>
                    <span className="font-bold text-base text-primary">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  {/* Quantity and Delete row */}
                  <div className="flex items-center justify-between mt-5">
                    <div className="flex items-center bg-surface-container rounded-full px-2 py-1 border border-outline-variant/10">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-colors text-primary active:scale-90"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 font-bold text-xs select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-colors text-primary active:scale-90"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-error flex items-center gap-1 font-bold text-xs hover:underline active:scale-95 transition-transform"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Summary Side card */}
          <div className="lg:col-span-4 space-y-6">
            {/* Coupon Code section */}
            <div className="bg-white rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-3">
              <label className="block font-bold text-xs text-on-surface uppercase tracking-wider" htmlFor="coupon">
                Have a coupon code?
              </label>
              <div className="flex gap-2">
                <input
                  id="coupon"
                  type="text"
                  placeholder="FRESH20"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-grow bg-surface-container-low border border-outline-variant/20 rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline-variant font-bold"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="bg-secondary-container text-on-secondary-container px-5 py-2.5 rounded-full font-bold text-xs hover:brightness-95 transition-all active:scale-95 border border-secondary-container/20"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="text-xs font-bold text-error">{couponError}</p>}
              {couponSuccess && <p className="text-xs font-bold text-secondary">{couponSuccess}</p>}
              <p className="text-[10px] text-on-surface-variant font-medium">Use "FRESH20" for 20% off or "HEALTHY10" for 10% off</p>
            </div>

            {/* Total Pricing panel */}
            <div className="bg-primary-container text-on-primary-container rounded-2xl p-6 md:p-8 shadow-lg space-y-6 border border-primary/20">
              <h3 className="font-headline-md text-lg md:text-xl font-bold text-white border-b border-white/10 pb-4">
                Order Summary
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between font-bold text-xs text-primary-fixed">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {appliedDiscountPercent > 0 && (
                  <div className="flex justify-between font-bold text-xs text-secondary-container">
                    <span>Discount ({appliedDiscountPercent}%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xs text-primary-fixed">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-bold text-xs text-primary-fixed">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between font-headline-md text-lg md:text-xl text-white pt-4 border-t border-white/10 font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-white text-primary-container py-4 rounded-full font-bold text-sm shadow-xl hover:bg-opacity-95 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group border border-white/10"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-center text-[10px] font-bold text-primary-fixed/60 uppercase tracking-widest">
                  Secure Checkout via Stripe
                </p>
              </div>
            </div>

            {/* Delivery Eco Notice */}
            <div className="flex items-start gap-3 p-4 bg-tertiary-fixed text-on-tertiary-fixed rounded-2xl border border-tertiary-fixed-dim/20 shadow-sm">
              <Truck className="w-5 h-5 text-tertiary shrink-0" />
              <div>
                <p className="font-bold text-xs text-on-tertiary-fixed">Carbon Neutral Delivery</p>
                <p className="text-xs opacity-90 mt-0.5 leading-normal font-medium">
                  Your order will arrive in 30–45 mins with 100% biodegradable compostable packaging.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
