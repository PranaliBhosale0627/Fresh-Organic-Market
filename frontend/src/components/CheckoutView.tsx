import { useState } from 'react';
import { ArrowLeft, MapPin, Clock, CreditCard, ShieldCheck, Landmark, Leaf, Ticket, Sparkles } from 'lucide-react';

interface CheckoutViewProps {
  onNavigate: (view: string) => void;
  onPlaceOrder: (details: { address: string; slot: string; payment: string; earnedCoins?: number }) => void;
  unlockedCoupons?: string[];
}

export default function CheckoutView({
  onNavigate,
  onPlaceOrder,
  unlockedCoupons = [],
}: CheckoutViewProps) {
  // Grab cached values or fallback
  const initialSubtotal = parseFloat(localStorage.getItem('checkout_subtotal') || '42.50');
  const initialTax = parseFloat(localStorage.getItem('checkout_tax') || '1.25');
  const initialDiscount = parseFloat(localStorage.getItem('checkout_discount') || '0.00');
  const initialDeliveryFee = parseFloat(localStorage.getItem('checkout_delivery') || '2.99');
  const initialDiscountCode = localStorage.getItem('checkout_discount_code') || '';

  // Selection states
  const [selectedSlot, setSelectedSlot] = useState('02:30 PM (Express)');
  const [selectedPayment, setSelectedPayment] = useState('Credit Card');
  const [address, setAddress] = useState('452 Organic Meadows Lane, Culinary District, SF 94103');
  const [selectedCoupon, setSelectedCoupon] = useState<string>('');

  // Re-calculate pricing dynamically based on coupon selection
  const subtotal = initialSubtotal;
  let discount = initialDiscount;
  let discountCode = initialDiscountCode || selectedCoupon;

  if (selectedCoupon === 'HARVEST5') {
    discount = 5.00;
    discountCode = 'HARVEST5 ($5 Off)';
  } else if (selectedCoupon === 'HARVEST10') {
    discount = 10.00;
    discountCode = 'HARVEST10 ($10 Off)';
  }

  let deliveryFee = initialDeliveryFee;
  if (selectedCoupon === 'ECOPASS') {
    deliveryFee = 0.00;
    discountCode = 'ECOPASS (Free Del.)';
  }

  const tax = subtotal * 0.08;
  const total = Math.max(0, subtotal - discount + deliveryFee + tax);

  const handlePlaceOrder = () => {
    // Check if slot chosen is Eco-Consolidated
    const isEcoSlot = selectedSlot.includes('Eco-Consolidated');
    const earnedCoins = isEcoSlot ? 20 : 0;

    // Cache updated summary values in localStorage so App.tsx can save the finalized order details
    localStorage.setItem('checkout_discount', discount.toFixed(2));
    localStorage.setItem('checkout_delivery', deliveryFee.toFixed(2));
    localStorage.setItem('checkout_tax', tax.toFixed(2));
    localStorage.setItem('checkout_total', total.toFixed(2));
    if (discountCode) {
      localStorage.setItem('checkout_discount_code', discountCode);
    }

    onPlaceOrder({
      address,
      slot: selectedSlot,
      payment: selectedPayment,
      earnedCoins
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-5 sm:py-8 mb-24 animate-rise-in">
      {/* Top App Bar */}
      <div className="flex justify-between items-center mb-6 sm:mb-8 border-b border-outline-variant/10 pb-4 animate-rise-in">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('cart')}
            className="active:scale-95 duration-150 hover:bg-surface-container-low transition-all rounded-full p-2 text-primary border border-outline-variant/20 bg-white shadow-sm"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-display text-2xl md:text-3xl text-primary font-bold">Checkout</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Left Column: Checkout Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address Section */}
          <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-xl hover:shadow-primary/10 border border-outline-variant/30 interactive-lift animate-rise-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-secondary-container p-2 rounded-xl text-on-secondary-container">
                  <MapPin className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-base text-on-surface">Delivery Address</h2>
              </div>
              <button 
                onClick={() => {
                  const newAddr = prompt("Enter delivery address:", address);
                  if (newAddr) setAddress(newAddr);
                }}
                className="text-primary font-bold text-xs hover:underline uppercase tracking-wider"
              >
                Change
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-full sm:w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-outline-variant/30 bg-surface-container-low relative">
                {/* Simulated Map Background */}
                <div className="absolute inset-0 bg-emerald-50 bg-[radial-gradient(#154212_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div className="flex-grow">
                <p className="font-bold text-xs text-primary uppercase tracking-wider mb-1">Home Address</p>
                <p className="text-on-surface-variant text-sm leading-relaxed text-left">
                  {address}
                </p>
              </div>
            </div>
          </section>

          {/* Delivery Time Section */}
          <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-xl hover:shadow-primary/10 border border-outline-variant/30 interactive-lift animate-rise-in stagger-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-secondary-container p-2 rounded-xl text-on-secondary-container">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-base text-on-surface">Delivery Time</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <p className="font-bold text-[10px] text-on-surface-variant mb-3 uppercase tracking-widest text-left">
                  Today, Oct 24
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button 
                    onClick={() => setSelectedSlot('11:00 AM (Standard)')}
                    className={`border rounded-2xl p-4 text-left transition-all active:scale-95 ${
                      selectedSlot === '11:00 AM (Standard)'
                        ? 'border-2 border-primary bg-primary-fixed-dim/10'
                        : 'border-outline-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <p className="text-sm font-bold text-on-surface">11:00 AM</p>
                    <p className="text-[10px] text-on-surface-variant font-semibold">Standard Delivery</p>
                  </button>
                  <button 
                    onClick={() => setSelectedSlot('02:30 PM (Express)')}
                    className={`border rounded-2xl p-4 text-left transition-all active:scale-95 ${
                      selectedSlot === '02:30 PM (Express)'
                        ? 'border-2 border-primary bg-primary-fixed-dim/10'
                        : 'border-outline-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <p className="text-sm font-bold text-primary">02:30 PM</p>
                    <p className="text-[10px] text-primary font-bold">Express Delivery</p>
                  </button>
                  <button 
                    onClick={() => setSelectedSlot('05:00 PM (Eco-Consolidated)')}
                    className={`border rounded-2xl p-4 text-left transition-all active:scale-95 relative overflow-hidden ${
                      selectedSlot === '05:00 PM (Eco-Consolidated)'
                        ? 'border-2 border-secondary bg-secondary-container/10'
                        : 'border-outline-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="absolute right-2 top-2">
                      <Leaf className="w-4.5 h-4.5 text-secondary" fill="currentColor" />
                    </div>
                    <p className="text-sm font-bold text-secondary">05:00 PM</p>
                    <p className="text-[10px] text-secondary font-bold flex items-center gap-0.5">
                      Eco-Slot 🌱 <span className="bg-secondary text-white text-[8px] px-1 rounded-md">+20 Coins</span>
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <p className="font-bold text-[10px] text-on-surface-variant mb-3 uppercase tracking-widest text-left">
                  Tomorrow, Oct 25
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button 
                    onClick={() => setSelectedSlot('09:00 AM (Standard)')}
                    className={`border rounded-2xl p-4 text-left transition-all active:scale-95 ${
                      selectedSlot === '09:00 AM (Standard)'
                        ? 'border-2 border-primary bg-primary-fixed-dim/10'
                        : 'border-outline-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <p className="text-sm font-bold text-on-surface">09:00 AM</p>
                    <p className="text-[10px] text-on-surface-variant font-semibold">Standard Delivery</p>
                  </button>
                  <button 
                    onClick={() => setSelectedSlot('12:00 PM (Eco-Consolidated)')}
                    className={`border rounded-2xl p-4 text-left transition-all active:scale-95 relative overflow-hidden ${
                      selectedSlot === '12:00 PM (Eco-Consolidated)'
                        ? 'border-2 border-secondary bg-secondary-container/10'
                        : 'border-outline-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="absolute right-2 top-2">
                      <Leaf className="w-4.5 h-4.5 text-secondary" fill="currentColor" />
                    </div>
                    <p className="text-sm font-bold text-secondary">12:00 PM</p>
                    <p className="text-[10px] text-secondary font-bold flex items-center gap-0.5">
                      Eco-Slot 🌱 <span className="bg-secondary text-white text-[8px] px-1 rounded-md">+20 Coins</span>
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Payment Method Section */}
          <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-xl hover:shadow-primary/10 border border-outline-variant/30 interactive-lift animate-rise-in stagger-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-secondary-container p-2 rounded-xl text-on-secondary-container">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-base text-on-surface">Payment Method</h2>
            </div>
            
            <div className="space-y-3">
              {/* Apple Pay */}
              <label 
                onClick={() => setSelectedPayment('Apple Pay')}
                className={`flex items-center p-4 border rounded-xl cursor-pointer hover:bg-surface-container-low transition-all active:scale-[0.99] group ${
                  selectedPayment === 'Apple Pay' ? 'border-2 border-primary bg-primary-fixed-dim/10' : 'border-outline-variant'
                }`}
              >
                <input 
                  type="radio" 
                  name="payment" 
                  checked={selectedPayment === 'Apple Pay'} 
                  onChange={() => {}}
                  className="rounded-full border-outline-variant text-primary focus:ring-primary h-4.5 w-4.5 mr-4"
                />
                <div className="flex items-center justify-between w-full">
                  <div className="text-left">
                    <p className="text-sm font-bold text-on-surface">Apple Pay</p>
                    <p className="text-[11px] text-on-surface-variant font-medium">Instant secure payment</p>
                  </div>
                  <Landmark className="w-5 h-5 text-on-surface-variant" />
                </div>
              </label>

              {/* Credit Card */}
              <label 
                onClick={() => setSelectedPayment('Credit Card')}
                className={`flex items-center p-4 border rounded-xl cursor-pointer hover:bg-surface-container-low transition-all active:scale-[0.99] group ${
                  selectedPayment === 'Credit Card' ? 'border-2 border-primary bg-primary-fixed-dim/10' : 'border-outline-variant'
                }`}
              >
                <input 
                  type="radio" 
                  name="payment" 
                  checked={selectedPayment === 'Credit Card'} 
                  onChange={() => {}}
                  className="rounded-full border-outline-variant text-primary focus:ring-primary h-4.5 w-4.5 mr-4"
                />
                <div className="flex items-center justify-between w-full">
                  <div className="text-left">
                    <p className="text-sm font-bold text-on-surface">Credit Card</p>
                    <p className="text-xs text-on-surface-variant font-semibold">**** **** **** 4242</p>
                  </div>
                  <CreditCard className="w-5 h-5 text-on-surface-variant" />
                </div>
              </label>

              {/* UPI Payment */}
              <label 
                onClick={() => setSelectedPayment('UPI Payment')}
                className={`flex items-center p-4 border rounded-xl cursor-pointer hover:bg-surface-container-low transition-all active:scale-[0.99] group ${
                  selectedPayment === 'UPI Payment' ? 'border-2 border-primary bg-primary-fixed-dim/10' : 'border-outline-variant'
                }`}
              >
                <input 
                  type="radio" 
                  name="payment" 
                  checked={selectedPayment === 'UPI Payment'} 
                  onChange={() => {}}
                  className="rounded-full border-outline-variant text-primary focus:ring-primary h-4.5 w-4.5 mr-4"
                />
                <div className="flex items-center justify-between w-full text-left">
                  <div>
                    <p className="text-sm font-bold text-on-surface">UPI Payment</p>
                    <p className="text-[11px] text-on-surface-variant font-medium">Pay via UPI app</p>
                  </div>
                  <Landmark className="w-5 h-5 text-on-surface-variant" />
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary Card */}
        <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-28 animate-rise-in stagger-3">
          {/* Unlocked Coupons Wallet slider */}
          {unlockedCoupons.length > 0 && (
            <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-200 text-left space-y-3 shadow-sm">
              <p className="font-bold text-[11px] text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <Ticket className="w-4 h-4 rotate-45 text-secondary" /> Unlocked Wallet Vouchers
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                {unlockedCoupons.map((code) => {
                  const isApplied = selectedCoupon === code;
                  let label = code;
                  if (code === 'HARVEST5') label = "$5.00 Off";
                  else if (code === 'HARVEST10') label = "$10.00 Off";
                  else if (code === 'ECOPASS') label = "Free Del.";

                  return (
                    <button
                      key={code}
                      onClick={() => setSelectedCoupon(isApplied ? '' : code)}
                      className={`flex-shrink-0 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 border ${
                        isApplied
                          ? 'bg-primary text-on-primary border-primary shadow-sm'
                          : 'bg-white text-on-surface border-outline-variant/35 hover:border-outline-variant'
                      }`}
                    >
                      {label} {isApplied && "✓"}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed">
                Click an unlocked coupon to instantly apply and recalculate order total.
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 shadow-xl shadow-primary/10 border border-outline-variant/50 space-y-6 text-left">
            <h2 className="font-bold text-base text-on-surface border-b border-outline-variant/10 pb-3">
              Order Summary
            </h2>
            
            <div className="space-y-4 text-xs font-semibold text-on-surface-variant">
              <div className="flex justify-between items-center">
                <span>Items Subtotal</span>
                <span className="text-on-surface font-bold text-sm">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Delivery Fee</span>
                <span className="text-on-surface font-bold text-sm">
                  {deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Tax</span>
                <span className="text-on-surface font-bold text-sm">${tax.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-primary font-bold">
                  <span>Promotion ({discountCode})</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-end">
                <span className="font-bold text-sm text-on-surface">Total</span>
                <span className="font-display-lg text-2xl text-primary font-bold leading-none">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handlePlaceOrder}
                className="w-full bg-primary text-on-primary py-4 rounded-full font-bold text-sm hover:bg-primary-container hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25 transition-all shadow-md active:scale-95 duration-150 border border-primary/20"
              >
                Place Order
              </button>
              <p className="text-center text-[10px] text-on-surface-variant leading-relaxed px-2 font-medium">
                By placing an order, you agree to our Terms of Service.
              </p>
            </div>
          </div>

          {/* Secure Trust Alert */}
          <div className="bg-surface-container-low rounded-xl p-4 flex items-start gap-3 border border-outline-variant/20 shadow-sm text-left interactive-lift">
            <ShieldCheck className="w-5 h-5 text-secondary shrink-0" />
            <div>
              <p className="font-bold text-xs text-on-surface">Safe &amp; Secure Payment</p>
              <p className="text-[11px] text-on-surface-variant leading-snug mt-0.5 font-medium">
                Your payment information is encrypted and never stored on our servers.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
