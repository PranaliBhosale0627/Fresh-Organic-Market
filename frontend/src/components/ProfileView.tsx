import React, { useMemo, useState } from 'react';
import {
  Award,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  Coins,
  CreditCard,
  Download,
  Gift,
  Heart,
  Home,
  Leaf,
  Mail,
  MapPin,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Ticket,
  Trash2,
  User,
  Wallet,
} from 'lucide-react';
import { authStorage } from '../api.js';
import { Order, Product } from '../types';

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
  orders?: Order[];
  products?: Product[];
  notifications?: string[];
  onNavigate?: (view: string) => void;
  wishlistItems?: Product[];
  onRemoveWishlistItem?: (productId: string) => void;
  onMoveWishlistToCart?: (productId: string) => void;
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const REDEEMABLE_REWARDS: RedeemableReward[] = [
  {
    id: 'reward-5',
    title: '$5 Off Organic Crop Box',
    description: 'Apply a flat $5 discount to any checkout order over $15.',
    cost: 50,
    code: 'HARVEST5',
    discountValue: 5,
    couponType: 'fixed',
  },
  {
    id: 'reward-10',
    title: '$10 Premium Sourced Gift',
    description: 'Unlock a premium $10 voucher for your next checkout.',
    cost: 90,
    code: 'HARVEST10',
    discountValue: 10,
    couponType: 'fixed',
  },
  {
    id: 'reward-free-del',
    title: 'Free Delivery Pass',
    description: 'Skip delivery fees on your next order.',
    cost: 30,
    code: 'ECOPASS',
    discountValue: 2.99,
    couponType: 'free_delivery',
  },
];

export default function ProfileView({
  coins,
  onUpdateCoins,
  quests,
  onClaimQuest,
  unlockedCoupons,
  onUnlockCoupon,
  currentUser,
  orders = [],
  products = [],
  notifications = [],
  onNavigate,
  wishlistItems = [],
  onRemoveWishlistItem,
  onMoveWishlistToCart,
}: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'wishlist' | 'wallet' | 'profile'>('overview');
  const [redemptionSuccess, setRedemptionSuccess] = useState<string | null>(null);

  if (!currentUser && !authStorage.getToken()) {
    return (
      <div className="mx-auto mb-24 max-w-3xl px-4 py-12 text-left">
        <div className="rounded-[32px] border border-outline-variant/30 bg-white p-8 shadow-sm animate-rise-in">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="font-display text-2xl font-black text-primary">Protected Customer Dashboard</h1>
          <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
            Sign in to view orders, saved addresses, wallet, coupons, invoices, notifications, wishlist, and loyalty points.
          </p>
          <button
            onClick={() => onNavigate?.('login')}
            className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-primary/15 active:scale-95"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const displayName = currentUser?.name || 'Guest Shopper';
  const displayEmail = currentUser?.email || 'guest@harvest.com';
  const displayAvatar = currentUser?.avatar || displayName.charAt(0).toUpperCase();
  const memberLevel = coins > 180 ? 'Platinum Harvest' : coins > 90 ? 'Gold Member' : 'Green Member';
  const customerOrders = orders.filter((order) => !currentUser || order.customerEmail === currentUser.email || currentUser.isAdmin);
  const deliveredOrders = customerOrders.filter((order) => order.status === 'Delivered');
  const pendingOrders = customerOrders.filter((order) => order.status !== 'Delivered' && order.status !== 'Cancelled');
  const walletValue = coins / 10;

  const buyAgainProducts = useMemo(() => {
    const orderedIds = new Set(customerOrders.flatMap((order) => order.items.map((item) => item.productId)));
    const fromOrders = products.filter((product) => orderedIds.has(product.id));
    return (fromOrders.length ? fromOrders : products).slice(0, 4);
  }, [customerOrders, products]);
  const recentlyViewed = products.slice(2, 6);

  const savedAddresses = [
    {
      label: 'Home',
      value: customerOrders[0]?.address || '452 Organic Meadows Lane, San Francisco, CA 94103',
      note: 'Default zero-emission delivery route',
    },
    {
      label: 'Work',
      value: '88 Market Street, San Francisco, CA 94105',
      note: 'Weekday deliveries before 5 PM',
    },
  ];

  const handleRedeemReward = (reward: RedeemableReward) => {
    if (coins < reward.cost || unlockedCoupons.includes(reward.code)) return;
    onUpdateCoins(coins - reward.cost);
    onUnlockCoupon(reward.code);
    setRedemptionSuccess(`Coupon ${reward.code} added to your wallet.`);
    setTimeout(() => setRedemptionSuccess(null), 3500);
  };

  const handleClaimCoins = (quest: EcoQuest) => {
    if (quest.status !== 'completable') return;
    onUpdateCoins(coins + quest.reward);
    onClaimQuest(quest.id);
  };

  const handleDownloadInvoice = (order: Order) => {
    const invoice = [
      'Verdant Harvest Invoice',
      `Order: ${order.id}`,
      `Customer: ${order.customerName}`,
      `Email: ${order.customerEmail}`,
      `Date: ${order.date}`,
      `Status: ${order.status}`,
      '',
      ...order.items.map((item) => `${item.productName} x ${item.quantity} - ${currency.format(item.price * item.quantity)}`),
      '',
      `Subtotal: ${currency.format(order.subtotal)}`,
      `Delivery: ${currency.format(order.deliveryFee)}`,
      `Tax: ${currency.format(order.tax)}`,
      `Discount: ${currency.format(order.discount)}`,
      `Total: ${currency.format(order.total)}`,
    ].join('\n');
    const blob = new Blob([invoice], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${order.id.replace(/[^a-z0-9]/gi, '-')}-invoice.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const statCards = [
    { label: 'My Orders', value: customerOrders.length, icon: ShoppingBag, tone: 'bg-primary/10 text-primary' },
    { label: 'Wishlist', value: wishlistItems.length, icon: Heart, tone: 'bg-error/10 text-error' },
    { label: 'Wallet', value: currency.format(walletValue), icon: Wallet, tone: 'bg-[#234b70]/10 text-[#234b70]' },
    { label: 'Loyalty Points', value: coins, icon: Coins, tone: 'bg-[#d08a23]/10 text-[#d08a23]' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'orders', label: 'My Orders', icon: PackageCheck },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'wallet', label: 'Wallet', icon: CreditCard },
    { id: 'profile', label: 'Profile', icon: User },
  ] as const;

  return (
    <div className="mx-auto mb-24 max-w-7xl px-3 py-6 text-left sm:px-4 md:py-8">
      <section className="relative overflow-hidden rounded-[32px] border border-outline-variant/30 bg-white p-5 shadow-sm md:p-8 animate-rise-in">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-primary text-xl font-black text-white shadow-lg shadow-primary/20">
              {displayAvatar.startsWith('http') ? <img src={displayAvatar} alt={displayName} className="h-full w-full object-cover" /> : displayAvatar}
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-primary">Customer Dashboard</p>
              <h1 className="font-display text-2xl font-black text-on-surface md:text-4xl">{displayName}</h1>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-on-surface-variant">
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {displayEmail}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> San Francisco, CA</span>
                <span className="rounded-full bg-secondary-container px-2 py-0.5 text-on-secondary-container">{memberLevel}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[520px]">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-3xl border border-outline-variant/25 bg-surface-container-low p-4">
                  <span className={`mb-3 flex h-9 w-9 items-center justify-center rounded-2xl ${card.tone}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">{card.label}</p>
                  <p className="mt-1 text-xl font-black text-on-surface">{card.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mt-5 flex gap-2 overflow-x-auto rounded-full border border-outline-variant/30 bg-white p-1 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === tab.id ? 'bg-primary text-white shadow-md shadow-primary/15' : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && (
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="rounded-[32px] border border-outline-variant/30 bg-white p-6 shadow-sm xl:col-span-2 animate-rise-in">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-primary">My Orders</h2>
                <p className="text-xs text-on-surface-variant">{pendingOrders.length} active, {deliveredOrders.length} delivered</p>
              </div>
              <button onClick={() => setActiveTab('orders')} className="text-xs font-black uppercase text-primary">View All</button>
            </div>
            <div className="space-y-3">
              {customerOrders.slice(0, 3).map((order) => (
                <OrderRow key={order.id} order={order} onDownloadInvoice={handleDownloadInvoice} />
              ))}
              {customerOrders.length === 0 && <EmptyState icon={ShoppingBag} title="No orders yet" text="Your MongoDB-backed orders will appear here after checkout." />}
            </div>
          </section>

          <section className="rounded-[32px] border border-outline-variant/30 bg-white p-6 shadow-sm animate-rise-in">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-primary">
              <Bell className="h-5 w-5 text-[#d08a23]" /> Notifications
            </h2>
            <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {notifications.slice(0, 6).map((message, index) => (
                <div key={`${message}-${index}`} className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-3 text-xs font-semibold text-on-surface-variant">
                  {message}
                </div>
              ))}
              {notifications.length === 0 && <EmptyState icon={Bell} title="No alerts" text="Order and wallet updates will appear here." />}
            </div>
          </section>

          <section className="rounded-[32px] border border-outline-variant/30 bg-white p-6 shadow-sm animate-rise-in">
            <h2 className="mb-4 text-lg font-black text-primary">Buy Again</h2>
            <ProductStrip products={buyAgainProducts} actionLabel="Buy Again" onAction={(id) => onMoveWishlistToCart?.(id)} />
          </section>

          <section className="rounded-[32px] border border-outline-variant/30 bg-white p-6 shadow-sm animate-rise-in">
            <h2 className="mb-4 text-lg font-black text-primary">Recently Viewed</h2>
            <ProductStrip products={recentlyViewed} actionLabel="View" />
          </section>

          <section className="rounded-[32px] border border-outline-variant/30 bg-white p-6 shadow-sm xl:col-span-1 animate-rise-in">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-primary">
              <MapPin className="h-5 w-5 text-secondary" /> Saved Addresses
            </h2>
            <AddressList addresses={savedAddresses} />
          </section>
        </div>
      )}

      {activeTab === 'orders' && (
        <section className="mt-6 rounded-[32px] border border-outline-variant/30 bg-white p-6 shadow-sm animate-rise-in">
          <h2 className="mb-5 text-lg font-black text-primary">My Orders & Invoices</h2>
          <div className="space-y-3">
            {customerOrders.map((order) => (
              <OrderRow key={order.id} order={order} onDownloadInvoice={handleDownloadInvoice} expanded />
            ))}
            {customerOrders.length === 0 && <EmptyState icon={ShoppingBag} title="No orders yet" text="Checkout orders are saved in MongoDB and will show here." />}
          </div>
        </section>
      )}

      {activeTab === 'wishlist' && (
        <section className="mt-6 rounded-[32px] border border-outline-variant/30 bg-white p-6 shadow-sm animate-rise-in">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-black text-primary">
            <Heart className="h-5 w-5 fill-error text-error" /> Wishlist
          </h2>
          {wishlistItems.length === 0 ? (
            <EmptyState icon={Heart} title="No saved products yet" text="Tap a heart on any product to save it to MongoDB." />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {wishlistItems.map((product) => (
                <div key={product.id} className="flex gap-4 rounded-3xl border border-outline-variant/30 bg-surface-container-low/40 p-4 interactive-lift">
                  <img src={product.image} alt={product.name} className="h-24 w-24 rounded-2xl object-cover" />
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <h4 className="truncate text-sm font-black text-on-surface">{product.name}</h4>
                      <p className="text-[11px] font-semibold text-on-surface-variant">{product.category} - {product.unit}</p>
                      <p className="mt-1 font-black text-primary">{currency.format(product.price)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => onMoveWishlistToCart?.(product.id)} className="rounded-full bg-primary px-3 py-2 text-[10px] font-black uppercase text-white">
                        <ShoppingCart className="mr-1 inline h-3.5 w-3.5" /> Cart
                      </button>
                      <button onClick={() => onRemoveWishlistItem?.(product.id)} className="rounded-full border border-outline-variant/30 bg-white px-3 py-2 text-[10px] font-black uppercase text-error">
                        <Trash2 className="mr-1 inline h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'wallet' && (
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="rounded-[32px] bg-gradient-to-br from-[#1e3d1a] to-[#2d5a27] p-6 text-white shadow-xl xl:col-span-1 animate-rise-in">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Digital Wallet</p>
            <h2 className="mt-2 text-3xl font-black">{currency.format(walletValue)}</h2>
            <p className="mt-1 text-xs font-semibold text-white/70">{coins} loyalty points available</p>
            <div className="mt-8 rounded-3xl border border-white/15 bg-white/10 p-4">
              <p className="text-xs font-black uppercase tracking-wider">Active Coupons</p>
              <p className="mt-1 text-2xl font-black">{unlockedCoupons.length}</p>
            </div>
          </section>

          <section className="rounded-[32px] border border-outline-variant/30 bg-white p-6 shadow-sm xl:col-span-2 animate-rise-in">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-primary">
              <Ticket className="h-5 w-5 text-secondary" /> Coupons
            </h2>
            {redemptionSuccess && (
              <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-700">
                {redemptionSuccess}
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {REDEEMABLE_REWARDS.map((reward) => {
                const unlocked = unlockedCoupons.includes(reward.code);
                const canAfford = coins >= reward.cost;
                return (
                  <div key={reward.id} className="rounded-3xl border border-outline-variant/30 bg-surface-container-low p-4">
                    <p className="text-sm font-black text-primary">{reward.title}</p>
                    <p className="mt-1 min-h-10 text-[11px] text-on-surface-variant">{reward.description}</p>
                    <p className="mt-3 text-xs font-black text-[#d08a23]">{reward.cost} points</p>
                    <button
                      onClick={() => handleRedeemReward(reward)}
                      disabled={unlocked || !canAfford}
                      className={`mt-3 w-full rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-wider ${
                        unlocked
                          ? 'bg-emerald-50 text-emerald-700'
                          : canAfford
                          ? 'bg-primary text-white'
                          : 'bg-neutral-100 text-on-surface-variant'
                      }`}
                    >
                      {unlocked ? 'Unlocked' : 'Redeem'}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-[32px] border border-outline-variant/30 bg-white p-6 shadow-sm xl:col-span-3 animate-rise-in">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-primary">
              <Award className="h-5 w-5 text-secondary" /> Loyalty Quests
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {quests.map((quest) => (
                <div key={quest.id} className="rounded-3xl border border-outline-variant/25 bg-surface-container-low p-4">
                  <p className="flex items-center gap-2 text-sm font-black text-on-surface"><Leaf className="h-4 w-4 text-primary" /> {quest.title}</p>
                  <p className="mt-2 text-[11px] leading-relaxed text-on-surface-variant">{quest.description}</p>
                  <p className="mt-2 text-[10px] font-bold text-primary">Progress: {quest.progressText}</p>
                  <button
                    onClick={() => handleClaimCoins(quest)}
                    disabled={quest.status !== 'completable'}
                    className={`mt-4 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-wider ${
                      quest.status === 'claimed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : quest.status === 'completable'
                        ? 'bg-secondary text-white'
                        : 'bg-neutral-100 text-on-surface-variant'
                    }`}
                  >
                    {quest.status === 'claimed' ? 'Claimed' : quest.status === 'completable' ? `Claim ${quest.reward}` : 'Locked'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <section className="rounded-[32px] border border-outline-variant/30 bg-white p-6 shadow-sm animate-rise-in">
            <h2 className="mb-4 text-lg font-black text-primary">Profile</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoItem label="Name" value={displayName} />
              <InfoItem label="Email" value={displayEmail} />
              <InfoItem label="Membership" value={memberLevel} />
              <InfoItem label="Preferred Delivery" value="Friday morning" />
            </div>
            <div className="mt-5 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4 text-xs text-on-surface-variant">
              <Calendar className="mb-2 h-5 w-5 text-secondary" />
              Your deliveries are grouped into a lower-emission neighborhood route whenever possible.
            </div>
          </section>

          <section className="rounded-[32px] border border-outline-variant/30 bg-white p-6 shadow-sm animate-rise-in">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-primary">
              <MapPin className="h-5 w-5 text-secondary" /> Saved Addresses
            </h2>
            <AddressList addresses={savedAddresses} />
          </section>
        </div>
      )}
    </div>
  );
}

function OrderRow({
  order,
  onDownloadInvoice,
  expanded = false,
}: {
  order: Order;
  onDownloadInvoice: (order: Order) => void;
  expanded?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-outline-variant/25 bg-surface-container-low p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-black text-primary">{order.id}</p>
          <p className="mt-1 text-xs font-semibold text-on-surface-variant">{order.date} - {order.items.length} items</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase text-primary">{order.status}</span>
          <span className="text-sm font-black text-on-surface">{currency.format(order.total)}</span>
          <button onClick={() => onDownloadInvoice(order)} className="rounded-full bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wider text-primary shadow-sm">
            <Download className="mr-1 inline h-3.5 w-3.5" /> Invoice
          </button>
        </div>
      </div>
      {expanded && (
        <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-on-surface-variant md:grid-cols-2">
          <p><span className="font-bold text-on-surface">Address:</span> {order.address}</p>
          <p><span className="font-bold text-on-surface">Slot:</span> {order.deliveryTimeSlot}</p>
        </div>
      )}
    </div>
  );
}

function ProductStrip({
  products,
  actionLabel,
  onAction,
}: {
  products: Product[];
  actionLabel: string;
  onAction?: (productId: string) => void;
}) {
  if (products.length === 0) {
    return <EmptyState icon={Sparkles} title="No products yet" text="Products from MongoDB will show here." />;
  }

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <div key={product.id} className="flex items-center justify-between gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-3">
          <div className="flex min-w-0 items-center gap-3">
            <img src={product.image} alt={product.name} className="h-12 w-12 rounded-2xl object-cover" />
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-on-surface">{product.name}</p>
              <p className="text-[11px] font-semibold text-on-surface-variant">{currency.format(product.price)} - {product.unit}</p>
            </div>
          </div>
          <button onClick={() => onAction?.(product.id)} className="rounded-full bg-primary/10 px-3 py-2 text-[10px] font-black uppercase text-primary">
            <RotateCcw className="mr-1 inline h-3.5 w-3.5" /> {actionLabel}
          </button>
        </div>
      ))}
    </div>
  );
}

function AddressList({ addresses }: { addresses: { label: string; value: string; note: string }[] }) {
  return (
    <div className="space-y-3">
      {addresses.map((address) => (
        <div key={address.label} className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4">
          <p className="text-xs font-black uppercase tracking-wider text-primary">{address.label}</p>
          <p className="mt-1 text-sm font-bold text-on-surface">{address.value}</p>
          <p className="mt-1 text-[11px] text-on-surface-variant">{address.note}</p>
        </div>
      ))}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4">
      <p className="text-[10px] font-black uppercase tracking-wider text-primary">{label}</p>
      <p className="mt-1 text-sm font-bold text-on-surface">{value}</p>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-outline-variant/50 bg-surface-container-low p-8 text-center">
      <Icon className="mx-auto mb-3 h-9 w-9 text-on-surface-variant/45" />
      <p className="text-sm font-black text-on-surface">{title}</p>
      <p className="mt-1 text-xs text-on-surface-variant">{text}</p>
    </div>
  );
}
