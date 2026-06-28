import React, { useState } from 'react';
import { User, Mail, MapPin, Calendar, Coins, Award, Ticket, Leaf, Sparkles, Zap, Check, Gift, CheckCircle2, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { authStorage } from '../api.js';
import { Product } from '../types';

export interface EcoQuest {
  id: string;
  title: string;
  description: string;
  reward: number;
  status: 'locked' | 'completable' | 'claimed';
  progressText: string;
}

export interface RedeemableReward {
  id: string;
  title: string;
  description: string;
  cost: number;
  code: string;
  discountValue: number;
  couponType: 'fixed' | 'free_delivery';
}

interface ProfileViewProps {
  coins: number;
  onUpdateCoins: (newBalance: number) => void;
  quests: EcoQuest[];
  onClaimQuest: (questId: string) => void;
  unlockedCoupons: string[];
  onUnlockCoupon: (couponCode: string) => void;
  currentUser: { name: string; email: string; avatar: string; isAdmin: boolean } | null;
  wishlistItems?: Product[];
  onRemoveWishlistItem?: (productId: string) => void;
  onMoveWishlistToCart?: (productId: string) => void;
}

export default function ProfileView({
  coins,
  onUpdateCoins,
  quests,
  onClaimQuest,
  unlockedCoupons,
  onUnlockCoupon,
  currentUser,
  wishlistItems = [],
  onRemoveWishlistItem,
  onMoveWishlistToCart,
}: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'rewards' | 'wishlist' | 'info'>('rewards');
  const [redemptionSuccess, setRedemptionSuccess] = useState<string | null>(null);

  // Dynamic user data
  const displayName = currentUser ? currentUser.name : 'Guest Shopper';
  const displayEmail = currentUser ? currentUser.email : (authStorage.getToken() || 'guest@harvest.com');
  const displayAvatar = currentUser ? currentUser.avatar : 'GS';
  const memberLevel = currentUser ? 'Level 4 Member' : 'Guest Tier';

  // Rewards list
  const REDEEMABLE_REWARDS: RedeemableReward[] = [
    {
      id: 'reward-5',
      title: '$5.00 Off Organic Crop Box',
      description: 'Redeem this voucher to apply a flat $5.00 discount to any checkout order over $15.',
      cost: 50,
      code: 'HARVEST5',
      discountValue: 5.00,
      couponType: 'fixed'
    },
    {
      id: 'reward-10',
      title: '$10.00 Premium Sourced Gift',
      description: 'Unlock a premium $10.00 discount voucher valid on any cart checkout.',
      cost: 90,
      code: 'HARVEST10',
      discountValue: 10.00,
      couponType: 'fixed'
    },
    {
      id: 'reward-free-del',
      title: 'Free Delivery Pass',
      description: 'Get free shipping on your next order, bypassing the standard $30 free delivery limit.',
      cost: 30,
      code: 'ECOPASS',
      discountValue: 2.99,
      couponType: 'free_delivery'
    }
  ];

  const handleRedeemReward = (reward: RedeemableReward) => {
    if (coins < reward.cost) return;

    // Deduct coins and save coupon
    onUpdateCoins(coins - reward.cost);
    onUnlockCoupon(reward.code);

    setRedemptionSuccess(`Voucher successfully redeemed! Code "${reward.code}" is now active in your Digital Wallet.`);
    setTimeout(() => {
      setRedemptionSuccess(null);
    }, 4000);
  };

  const handleClaimCoins = (quest: EcoQuest) => {
    if (quest.status !== 'completable') return;
    onUpdateCoins(coins + quest.reward);
    onClaimQuest(quest.id);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 mb-24 text-left">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-outline-variant/30 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold font-display shadow-md shadow-primary/20 shrink-0">
            {displayAvatar}
          </div>
          <div>
            <h2 className="font-display text-xl md:text-2.5xl font-bold text-primary flex items-center gap-1.5">
              {displayName} <span className="bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{memberLevel}</span>
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-on-surface-variant font-medium">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {displayEmail}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> San Francisco, CA</span>
            </div>
          </div>
        </div>

        {/* View Switchers tabs */}
        <div className="flex bg-surface-container p-1 rounded-full border border-outline-variant/40 shadow-inner w-fit shrink-0">
          <button
            onClick={() => setActiveTab('rewards')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'rewards'
                ? 'bg-white text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Loyalty Rewards
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'info'
                ? 'bg-white text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Personal Details
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'wishlist'
                ? 'bg-white text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Wishlist
          </button>
        </div>
      </div>

      {activeTab === 'rewards' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Center - Quests & Voucher Shop */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Gamified Quests Panel */}
            <section className="bg-white rounded-[32px] p-6 md:p-8 border border-outline-variant/30 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-base md:text-lg font-bold text-primary flex items-center gap-2">
                    <Award className="text-secondary" /> Active Eco-Quests
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Complete community challenges and claim Harvest Coins.
                  </p>
                </div>
                <span className="text-[10px] bg-secondary-container text-on-secondary-container font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Weekly Refresh
                </span>
              </div>

              <div className="divide-y divide-outline-variant/15">
                {quests.map((quest) => (
                  <div key={quest.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 text-left max-w-md">
                      <div className="flex items-center gap-1.5">
                        <Leaf className="w-3.5 h-3.5 text-primary" />
                        <h4 className="font-bold text-xs md:text-sm text-on-surface">{quest.title}</h4>
                      </div>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">
                        {quest.description}
                      </p>
                      <p className="text-[10px] text-primary font-bold">
                        Progress: {quest.progressText}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {quest.status === 'claimed' ? (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 stroke-[3px]" /> Claimed +{quest.reward}
                        </span>
                      ) : quest.status === 'completable' ? (
                        <button
                          onClick={() => handleClaimCoins(quest)}
                          className="bg-secondary text-white hover:bg-secondary/90 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider shadow active:scale-95 transition-all flex items-center gap-1 border border-secondary/10"
                        >
                          <Gift className="w-3.5 h-3.5" /> Claim {quest.reward} Coins
                        </button>
                      ) : (
                        <span className="text-[10px] text-on-surface-variant font-bold bg-surface-container px-3 py-1.5 rounded-full">
                          Locked ({quest.reward} Coins)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Voucher Store Section */}
            <section className="space-y-4">
              <h3 className="font-display text-base md:text-lg font-bold text-primary flex items-center gap-2">
                <Ticket className="text-secondary rotate-45" /> Redeem Vouchers Shop
              </h3>

              {redemptionSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3 text-emerald-800 text-xs font-semibold leading-relaxed animate-fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{redemptionSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {REDEEMABLE_REWARDS.map((reward) => {
                  const isUnlocked = unlockedCoupons.includes(reward.code);
                  const canAfford = coins >= reward.cost;

                  return (
                    <div
                      key={reward.id}
                      className={`bg-white rounded-3xl p-5 border shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                        isUnlocked
                          ? 'border-emerald-500 bg-emerald-50/10'
                          : 'border-outline-variant/30 hover:border-primary/10'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-xs md:text-sm text-primary line-clamp-1">
                            {reward.title}
                          </h4>
                          <span className="bg-primary/5 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/10 shrink-0">
                            {reward.cost} Coins
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant leading-relaxed">
                          {reward.description}
                        </p>
                      </div>

                      {isUnlocked ? (
                        <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-2xl border border-emerald-200 text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                          <Check className="w-4 h-4 stroke-[3px]" /> Voucher Unlocked
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRedeemReward(reward)}
                          disabled={!canAfford}
                          className={`w-full py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-150 border ${
                            canAfford
                              ? 'bg-primary text-on-primary border-primary hover:bg-primary-container hover:shadow'
                              : 'bg-neutral-100 text-on-surface-variant border-neutral-200 cursor-not-allowed'
                          }`}
                        >
                          Redeem Voucher
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Column - Coin Card Wallet */}
          <aside className="lg:col-span-1 space-y-6">
            
            {/* Glowing Reward Balance Card */}
            <section className="bg-gradient-to-br from-[#1e3d1a] to-[#2d5a27] rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden border border-primary-container/20">
              <div className="absolute -right-12 -top-12 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
              <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-secondary/10 rounded-full blur-xl pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col justify-between h-48 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] text-primary-fixed/80 uppercase tracking-widest font-bold">
                      Harvest Club Card
                    </p>
                    <p className="font-display text-sm font-bold text-white mt-0.5">
                      Elena Rodriguez
                    </p>
                  </div>
                  <Coins className="w-8 h-8 text-tertiary" fill="currentColor" />
                </div>

                <div>
                  <p className="text-[10px] text-primary-fixed/70 uppercase tracking-wider">
                    Available Rewards Balance
                  </p>
                  <p className="text-3xl font-display font-bold text-white flex items-baseline gap-1">
                    {coins} <span className="text-xs text-primary-fixed/90 font-semibold uppercase tracking-wider">Coins</span>
                  </p>
                  <p className="text-[11px] text-primary-fixed/80 font-medium mt-1 italic">
                    Equivalent to ${(coins / 10).toFixed(2)} cash discounts
                  </p>
                </div>
              </div>
            </section>

            {/* My Voucher Wallet */}
            <section className="bg-white rounded-3xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-secondary" /> Digital Wallet ({unlockedCoupons.length})
              </h3>

              {unlockedCoupons.length === 0 ? (
                <div className="py-6 text-center text-on-surface-variant text-xs leading-relaxed">
                  <p className="font-semibold">Your Wallet is empty.</p>
                  <p className="text-[10px] mt-0.5">Redeem Harvest Coins to generate discount passes.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {unlockedCoupons.map((code) => {
                    // Match code metadata
                    const matchingReward = REDEEMABLE_REWARDS.find(r => r.code === code);
                    const label = matchingReward ? matchingReward.title : code;

                    return (
                      <div
                        key={code}
                        className="p-3 bg-secondary-container/30 border border-secondary/20 rounded-2xl flex items-center justify-between text-left"
                      >
                        <div>
                          <p className="font-bold text-xs text-on-secondary-container leading-none">
                            {code}
                          </p>
                          <p className="text-[10px] text-on-surface-variant font-medium mt-1 line-clamp-1">
                            {label}
                          </p>
                        </div>
                        <span className="text-[9px] bg-secondary text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Active
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </aside>
        </div>
      ) : activeTab === 'wishlist' ? (
        <div className="bg-white rounded-[32px] p-6 md:p-8 border border-outline-variant/30 shadow-sm space-y-6 animate-rise-in">
          <div className="flex items-center justify-between gap-4 border-b border-outline-variant/10 pb-4">
            <div>
              <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
                <Heart className="w-5 h-5 text-error fill-error" /> Saved Wishlist
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">
                {wishlistItems.length} saved {wishlistItems.length === 1 ? 'item' : 'items'} ready for your next cart.
              </p>
            </div>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="py-12 text-center rounded-3xl bg-surface-container-low border border-dashed border-outline-variant">
              <Heart className="w-10 h-10 mx-auto text-on-surface-variant/40 mb-3" />
              <p className="font-bold text-sm text-on-surface">No saved products yet</p>
              <p className="text-xs text-on-surface-variant mt-1">Tap the heart on products to save them here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {wishlistItems.map((product) => (
                <div key={product.id} className="flex gap-4 rounded-3xl border border-outline-variant/30 bg-surface-container-low/40 p-4 interactive-lift">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-24 w-24 rounded-2xl object-cover border border-outline-variant/20"
                  />
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <h4 className="line-clamp-1 text-sm font-bold text-on-surface">{product.name}</h4>
                      <p className="text-[11px] font-semibold text-on-surface-variant">{product.category} • {product.unit}</p>
                      <p className="mt-1 text-base font-bold text-primary">${product.price.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2 pt-3">
                      <button
                        onClick={() => onMoveWishlistToCart?.(product.id)}
                        className="flex items-center gap-1 rounded-full bg-primary px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white transition-all active:scale-95"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" /> Cart
                      </button>
                      <button
                        onClick={() => onRemoveWishlistItem?.(product.id)}
                        className="flex items-center gap-1 rounded-full bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-error border border-outline-variant/30 transition-all active:scale-95"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* PERSONAL INFO TAB VIEW */
        <div className="bg-white rounded-[32px] p-6 md:p-8 border border-outline-variant/30 max-w-xl mx-auto space-y-6">
          <div className="flex items-center gap-4 border-b border-outline-variant/10 pb-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm">
              ER
            </div>
            <div>
              <h3 className="font-bold text-base text-primary">Member Account</h3>
              <p className="text-on-surface-variant text-xs font-semibold">Active since January 2023</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-on-surface-variant leading-relaxed">
            <div className="space-y-1">
              <p className="text-[10px] text-primary uppercase font-bold tracking-wider">Verified Name</p>
              <p className="text-on-surface font-bold text-sm">Elena Rodriguez</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-primary uppercase font-bold tracking-wider">Email Address</p>
              <p className="text-on-surface font-bold text-sm">elena.r@example.com</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-primary uppercase font-bold tracking-wider">Primary Delivery address</p>
              <p className="text-on-surface font-semibold text-sm">452 Organic Meadows Lane, SF</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-primary uppercase font-bold tracking-wider">Membership Program</p>
              <p className="text-on-surface font-bold text-sm flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-secondary" /> Organic Gold Cohort
              </p>
            </div>
          </div>

          <div className="bg-surface-container rounded-2xl p-4 flex items-start gap-3 border border-outline-variant/20 shadow-sm">
            <Calendar className="w-5 h-5 text-secondary shrink-0" />
            <div>
              <p className="font-bold text-xs text-on-surface">Weekly Preferred Schedule</p>
              <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                Your deliveries are default grouped into our zero-emission neighborhood run on Friday mornings to reduce logistics footprint.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
