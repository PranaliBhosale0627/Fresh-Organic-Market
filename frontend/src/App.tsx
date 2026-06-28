import { useState, useEffect, useCallback } from 'react';
import { Product, CartItem, Order, Customer } from './types';
import { productsApi, ordersApi, customersApi, cartApi, wishlistApi, loyaltyApi, authApi, authStorage } from './api.js';
import { createRealtimeSocket } from './realtime.js';

// Components
import Header from './components/Header';
import UserNav from './components/UserNav';
import AdminSidebar from './components/AdminSidebar';

// Views
import HomeView from './components/HomeView';
import CategoryView from './components/CategoryView';
import ProductDetailView from './components/ProductDetailView';
import CartView from './components/CartView';
import CheckoutView from './components/CheckoutView';
import OrderTrackingView from './components/OrderTrackingView';
import RecipesView from './components/RecipesView';
import ProfileView, { EcoQuest } from './components/ProfileView';
import LoginView from './components/LoginView';
import AdminDashboard from './components/AdminDashboard';
import AdminOrders from './components/AdminOrders';
import AdminInventory from './components/AdminInventory';
import AdminCustomers from './components/AdminCustomers';
import AdminDeliveryPartners from './components/AdminDeliveryPartners';
import AdminContactMessages from './components/AdminContactMessages';
import DeliveryPartnerDashboard from './components/DeliveryPartnerDashboard';
import AboutView from './components/AboutView';
import ContactView from './components/ContactView';
import Footer from './components/Footer';

export default function App() {
  // ─── Core Data State ──────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);

  // ─── Loyalty State ────────────────────────────────────────────────────────
  const [coins, setCoins] = useState<number>(185);
  const [unlockedCoupons, setUnlockedCoupons] = useState<string[]>([]);
  const [quests, setQuests] = useState<EcoQuest[]>([]);

  // ─── Authentication State ──────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; avatar: string; isAdmin: boolean; role?: string; isDeliveryPartner?: boolean } | null>(null);

  // ─── Notification State ───────────────────────────────────────────────────
  const [notifications, setNotifications] = useState<string[]>([
    "🌿 Welcome to Verdant Harvest! Enjoy your shopping.",
    "🎉 You have earned a 50 Coins Welcome Bonus! Claim vouchers in your profile."
  ]);

  const handleClearNotifications = () => setNotifications([]);

  // ─── UI State ─────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('home');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All Products');
  const [selectedOrderForInspection, setSelectedOrderForInspection] = useState<Order | null>(null);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);

  // ─── User-Specific Data Loading ───────────────────────────────────────────
  const loadUserData = useCallback(async () => {
    try {
      const [cartRes, wishlistRes, loyaltyRes, ordersRes] = await Promise.all([
        cartApi.get(),
        wishlistApi.get(),
        loyaltyApi.get(),
        ordersApi.getAll()
      ]);
      setCartItems(cartRes.data);
      setWishlistItems(wishlistRes.data);
      setCoins(loyaltyRes.data.coins);
      setUnlockedCoupons(loyaltyRes.data.unlockedCoupons);
      setQuests(loyaltyRes.data.quests);
      setOrders(ordersRes.data);
    } catch (err) {
      console.error('Failed to load user-specific data:', err);
    }
  }, []);

  const loadAdminData = useCallback(async () => {
    try {
      const [productsRes, customersRes, ordersRes] = await Promise.all([
        productsApi.getAll(),
        customersApi.getAll(),
        ordersApi.getAll()
      ]);

      setProducts(productsRes.data);
      setCustomers(customersRes.data);
      setOrders(ordersRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setNotifications(prev => ['Unable to refresh admin orders. Please confirm admin login.', ...prev].slice(0, 25));
    }
  }, []);

  // ─── Initial Data Load ────────────────────────────────────────────────────
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Verify Authentication Session or allocate a temporary guest token
      let token = authStorage.getToken();
      let verifiedUser: any = null;
      if (!token) {
        token = `guest_${Math.floor(100000 + Math.random() * 900000)}@harvest.com`;
        authStorage.setToken(token);
      }

      if (token) {
        try {
          const authRes = await authApi.me();
          if (authRes.success && authRes.user) {
            verifiedUser = authRes.user;
            setCurrentUser(authRes.user);
            setNotifications(prev => [`🔐 Session verified. Logged in as ${authRes.user.name}`, ...prev]);
            if (authRes.user.isAdmin) {
              setIsAdminMode(true);
              setCurrentView('admin-dashboard');
            } else if (authRes.user.role === 'delivery_partner') {
              setCurrentView('delivery-dashboard');
            }
          }
        } catch (e) {
          console.error('Session verification failed:', e);
        }
      }

      // 2. Load Public catalog and Admin items
      const [productsRes, customersRes] = await Promise.all([
        productsApi.getAll(),
        customersApi.getAll()
      ]);
      setProducts(productsRes.data);
      setCustomers(customersRes.data);

      // 3. Load role-specific data. Admin must fetch every order, not only the current user's orders.
      if (verifiedUser?.isAdmin) {
        const ordersRes = await ordersApi.getAll();
        setOrders(ordersRes.data);
      } else {
        await loadUserData();
      }
    } catch (err) {
      console.error('Failed to load data from API:', err);
      // Fallback: import initial data so the UI still renders
      const { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_CUSTOMERS } = await import('./data');
      setProducts(INITIAL_PRODUCTS);
      setOrders(INITIAL_ORDERS);
      setCustomers(INITIAL_CUSTOMERS);
    } finally {
      setLoading(false);
    }
  }, [loadAdminData, loadUserData]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    if (!currentUser?.isAdmin || !isAdminMode) return;
    if (currentView === 'admin-dashboard' || currentView === 'admin-orders' || currentView === 'admin-delivery') {
      loadAdminData();
    }
  }, [currentUser?.isAdmin, currentView, isAdminMode, loadAdminData]);

  useEffect(() => {
    const email = currentUser?.email || authStorage.getToken();
    if (!email) return;

    const socket = createRealtimeSocket({
      email,
      isAdmin: Boolean(currentUser?.isAdmin || isAdminMode),
      role: currentUser?.role
    });

    socket.on('connect', () => {
      if (currentUser?.isAdmin || isAdminMode) {
        socket.emit('join-admin');
      }
      socket.emit('join-user', { email });
      if (currentUser?.role === 'delivery_partner') {
        socket.emit('join-delivery-partner', { email });
      }
    });

    socket.on('notification:new', (notification: any) => {
      const message = notification?.message || notification?.title || 'New notification';
      setNotifications(prev => [message, ...prev].slice(0, 25));
    });

    socket.on('order:new', (order: Order) => {
      setOrders(prev => {
        if (prev.some(o => o.id === order.id)) return prev;
        return [order, ...prev];
      });
      setNotifications(prev => [`New order received: ${order.id}`, ...prev].slice(0, 25));
    });

    socket.on('order:updated', (order: Order) => {
      setOrders(prev => {
        const exists = prev.some(o => o.id === order.id);
        if (!exists) return [order, ...prev];
        return prev.map(o => o.id === order.id ? order : o);
      });
      setActiveTrackingOrder(prev => prev?.id === order.id ? order : prev);
      setSelectedOrderForInspection(prev => prev?.id === order.id ? order : prev);
      setNotifications(prev => [`Order ${order.id} updated to ${order.status}`, ...prev].slice(0, 25));
    });

    socket.on('delivery:assigned', (order: Order) => {
      setOrders(prev => {
        const exists = prev.some(o => o.id === order.id);
        return exists ? prev.map(o => o.id === order.id ? order : o) : [order, ...prev];
      });
      setNotifications(prev => [`Delivery assigned: ${order.id}`, ...prev].slice(0, 25));
    });

    socket.on('delivery:updated', (order: Order) => {
      setOrders(prev => {
        const exists = prev.some(o => o.id === order.id);
        return exists ? prev.map(o => o.id === order.id ? order : o) : [order, ...prev];
      });
      setActiveTrackingOrder(prev => prev?.id === order.id ? order : prev);
      setNotifications(prev => [`Delivery update: ${order.id} is ${order.deliveryStatus}`, ...prev].slice(0, 25));
    });

    socket.on('connect_error', (error) => {
      console.warn('Realtime connection failed:', error.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser?.email, currentUser?.isAdmin, isAdminMode]);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, selectedProductId]);

  // ─── Auth Handlers ────────────────────────────────────────────────────────
  const handleLoginSuccess = async (user: any, token: string) => {
    setCurrentUser(user);
    setNotifications(prev => [`🔐 Signed in as ${user.name}`, ...prev]);
    if (user.isAdmin) {
      setIsAdminMode(true);
      setCurrentView('admin-dashboard');
      await loadAdminData();
    } else if (user.role === 'delivery_partner') {
      setIsAdminMode(false);
      setCurrentView('delivery-dashboard');
    } else {
      setIsAdminMode(false);
      setCurrentView('home');
      await loadUserData();
    }
  };

  const handleToggleAdminMode = async (admin: boolean) => {
    if (admin) {
      if (!currentUser?.isAdmin) {
        setIsAdminMode(false);
        setCurrentView('login');
        setNotifications(prev => ['Admin access requires the admin account. Please sign in as admin first.', ...prev].slice(0, 25));
        return;
      }

      setIsAdminMode(true);
      setCurrentView('admin-dashboard');
      await loadAdminData();
      return;
    }

    setIsAdminMode(false);
    setCurrentView('home');
    await loadUserData();
  };

  const handleLogout = async () => {
    await authApi.logout();
    setCurrentUser(null);
    setIsAdminMode(false);
    setCurrentView('home');
    
    // Clear state
    setCartItems([]);
    setWishlistItems([]);
    setCoins(185);
    setUnlockedCoupons([]);
    setQuests([]);
    setNotifications(prev => ["🔓 Logged out. Switched to guest shopper.", ...prev]);
    
    // Refresh catalog and reload guest data
    await loadAllData();
  };

  // ─── Cart Handlers ────────────────────────────────────────────────────────
  const handleAddToCart = async (product: Product, quantity: number = 1) => {
    try {
      const res = await cartApi.addItem(product.id, quantity);
      setCartItems(res.data);
    } catch (err) {
      console.error('Add to cart failed:', err);
      // Optimistic fallback
      setCartItems(prev => {
        const existing = prev.find(item => item.product.id === product.id);
        if (existing) {
          return prev.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
              : item
          );
        }
        return [...prev, { product, quantity }];
      });
    }
  };

  const handleUpdateCartQuantity = async (productId: string, quantity: number) => {
    try {
      const res = await cartApi.updateQuantity(productId, quantity);
      setCartItems(res.data);
    } catch (err) {
      console.error('Update cart quantity failed:', err);
    }
  };

  const handleRemoveCartItem = async (productId: string) => {
    try {
      const res = await cartApi.removeItem(productId);
      setCartItems(res.data);
    } catch (err) {
      console.error('Remove cart item failed:', err);
      setCartItems(prev => prev.filter(item => item.product.id !== productId));
    }
  };

  const handleToggleWishlist = async (product: Product) => {
    const isSaved = wishlistItems.some(item => item.id === product.id);

    try {
      const res = isSaved
        ? await wishlistApi.remove(product.id)
        : await wishlistApi.add(product.id);
      setWishlistItems(res.data);
      setNotifications(prev => [
        isSaved ? `${product.name} removed from wishlist` : `${product.name} saved to wishlist`,
        ...prev
      ].slice(0, 25));
    } catch (err) {
      console.error('Wishlist update failed:', err);
    }
  };

  const handleMoveWishlistToCart = async (productId: string) => {
    try {
      const res = await wishlistApi.moveToCart(productId);
      setWishlistItems(res.data.wishlist);
      setCartItems(res.data.cart);
      setNotifications(prev => ['Wishlist item moved to cart', ...prev].slice(0, 25));
    } catch (err) {
      console.error('Move wishlist item to cart failed:', err);
    }
  };

  // ─── Quest Handlers ───────────────────────────────────────────────────────
  const handleCompleteQuest = async (questId: string) => {
    try {
      const res = await loyaltyApi.completeQuest(questId);
      setQuests(res.data.quests);
    } catch (err) {
      console.error('Complete quest failed:', err);
      // Optimistic update
      setQuests(prev =>
        prev.map(q =>
          q.id === questId && q.status === 'locked'
            ? { ...q, status: 'completable', progressText: '1/1 completed - Reward available!' }
            : q
        )
      );
    }
  };

  const handleClaimQuest = async (questId: string) => {
    try {
      const res = await loyaltyApi.claimQuest(questId);
      setQuests(res.data.quests);
      setCoins(res.data.coins);
    } catch (err) {
      console.error('Claim quest failed:', err);
      // Optimistic update
      setQuests(prev =>
        prev.map(q => {
          if (q.id === questId && q.status === 'completable') {
            setCoins(c => c + q.reward);
            return { ...q, status: 'claimed', progressText: `Claimed +${q.reward} Coins!` };
          }
          return q;
        })
      );
    }
  };

  // ─── Order Handler ────────────────────────────────────────────────────────
  const handlePlaceOrder = async (details: { address: string; slot: string; payment: string; earnedCoins?: number }) => {
    if (cartItems.length === 0) return;

    const discountStr = localStorage.getItem('checkout_discount');
    const discount = discountStr ? parseFloat(discountStr) : 0;

    try {
      const res = await ordersApi.place({
        cartItems,
        address: details.address,
        deliveryTimeSlot: details.slot,
        paymentMethod: details.payment,
        appliedDiscount: discount
      });

      const newOrder = res.data;

      // Refresh products (stock changed) and loyalty (eco coins)
      const [productsRes, loyaltyRes] = await Promise.all([
        productsApi.getAll(),
        loyaltyApi.get()
      ]);
      setProducts(productsRes.data);
      setCoins(loyaltyRes.data.coins);
      setQuests(loyaltyRes.data.quests);

      // Refresh orders list
      setOrders(prev => [newOrder, ...prev]);

      // Add order notification
      setNotifications(prev => [`📦 Order placed successfully! Tracking ID: ${newOrder.id}`, ...prev]);

      // Clear cart state
      setCartItems([]);

      // Clear checkout localStorage tokens
      ['checkout_subtotal', 'checkout_delivery', 'checkout_tax', 'checkout_discount', 'checkout_total', 'checkout_discount_code'].forEach(k => localStorage.removeItem(k));

      setActiveTrackingOrder(newOrder);
      setCurrentView('order-tracking');
    } catch (err) {
      console.error('Place order failed:', err);
      alert('Failed to place order. Please try again.');
    }
  };

  // ─── Admin Handlers ───────────────────────────────────────────────────────
  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const res = await ordersApi.updateStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
      setNotifications(prev => [`🚚 Order ${orderId} updated to: ${status}`, ...prev]);
    } catch (err) {
      console.error('Update order status failed:', err);
    }
  };

  const handleRestockProduct = async (productId: string, quantity: number = 50) => {
    try {
      const res = await productsApi.restock(productId, quantity);
      setProducts(prev => prev.map(p => p.id === productId ? res.data : p));
    } catch (err) {
      console.error('Restock failed:', err);
    }
  };

  const handleAddProduct = async (newCrop: Omit<Product, 'id'>) => {
    try {
      const res = await productsApi.create(newCrop);
      setProducts(prev => [...prev, res.data]);
    } catch (err) {
      console.error('Add product failed:', err);
    }
  };

  const handleUpdateProductPrice = async (productId: string, newPrice: number) => {
    try {
      const res = await productsApi.updatePrice(productId, newPrice);
      setProducts(prev => prev.map(p => p.id === productId ? res.data : p));
    } catch (err) {
      console.error('Update price failed:', err);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await productsApi.delete(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      console.error('Delete product failed:', err);
    }
  };

  const handleToggleCustomerStatus = async (customerId: string) => {
    try {
      const res = await customersApi.toggleStatus(customerId);
      setCustomers(prev => prev.map(c => c.id === customerId ? res.data : c));
    } catch (err) {
      console.error('Toggle customer status failed:', err);
    }
  };

  const handleUpdateCoins = async (newCoins: number) => {
    try {
      const res = await loyaltyApi.setCoins(newCoins);
      setCoins(res.data.coins);
    } catch (err) {
      setCoins(newCoins);
    }
  };

  const handleUnlockCoupon = async (code: string) => {
    try {
      const res = await loyaltyApi.unlockCoupon(code, 0);
      setUnlockedCoupons(res.data.unlockedCoupons);
    } catch (err) {
      setUnlockedCoupons(prev => [...prev, code]);
    }
  };

  // ─── Navigation ───────────────────────────────────────────────────────────
  const handleNavigate = async (view: string, category?: string) => {
    // Only intercept admin screens if not logged in as Admin
    if (view.startsWith('admin') && (!currentUser || !currentUser.isAdmin)) {
      setCurrentView('login');
      setNotifications(prev => ['Admin pages require the admin account. Please sign in as admin@harvest.com.', ...prev].slice(0, 25));
      return;
    }
    if (view === 'delivery-dashboard' && currentUser?.role !== 'delivery_partner') {
      setCurrentView('login');
      return;
    }
    setSelectedCategoryFilter(category || 'All Products');
    setCurrentView(view);
    if (view === 'admin-dashboard' || view === 'admin-orders') {
      await loadAdminData();
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('product-detail');
  };

  const handleSelectOrderFromDashboard = (order: Order) => {
    setSelectedOrderForInspection(order);
    setCurrentView('admin-orders');
  };

  // ─── Computed Metrics ─────────────────────────────────────────────────────
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const lowStockCount = products.filter(p => p.stock <= 15).length;

  // ─── Loading Screen ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-container-low gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-on-surface-variant text-sm font-semibold tracking-wide">Loading Verdant Harvest…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-container-low font-sans antialiased text-on-surface">
      {/* Dynamic Header */}
      <Header
        isAdminMode={isAdminMode}
        onToggleAdminMode={handleToggleAdminMode}
        onNavigate={handleNavigate}
        cartCount={cartCount}
        currentUser={currentUser}
        onLogout={handleLogout}
        notifications={notifications}
        onClearNotifications={handleClearNotifications}
      />

      {/* Main Layout Grid */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row relative">

        {/* Admin left side panel */}
        {isAdminMode && (
          <AdminSidebar
            currentView={currentView}
            onNavigate={handleNavigate}
            lowStockCount={lowStockCount}
          />
        )}

        {/* Core Frame Panel */}
        <main className={`flex-1 w-full px-3 sm:px-4 md:px-6 transition-all duration-300 ${
          isAdminMode ? 'lg:pl-[300px] lg:pt-6' : 'pt-4'
        }`}>
          <div key={`${isAdminMode}-${currentView}-${selectedProductId || ''}`} className="animate-rise-in">
            {/* View Switching Router */}
            {currentView === 'delivery-dashboard' ? (
              <DeliveryPartnerDashboard onNavigate={handleNavigate} />
            ) : !isAdminMode ? (
              // ─── User Storefront Views ───
              <>
                {currentView === 'home' && (
                  <HomeView
                    products={products}
                    onNavigate={handleNavigate}
                    onSelectProduct={handleSelectProduct}
                    onAddToCart={handleAddToCart}
                    wishlistItems={wishlistItems}
                    onToggleWishlist={handleToggleWishlist}
                  />
                )}
                {(currentView === 'category' || currentView === 'search') && (
                  <CategoryView
                    products={products}
                    initialCategory={selectedCategoryFilter}
                    onNavigate={handleNavigate}
                    onSelectProduct={handleSelectProduct}
                    onAddToCart={handleAddToCart}
                    wishlistItems={wishlistItems}
                    onToggleWishlist={handleToggleWishlist}
                  />
                )}
                {currentView === 'product-detail' && selectedProductId && (
                  <ProductDetailView
                    product={products.find(p => p.id === selectedProductId) || products[0]}
                    onNavigate={handleNavigate}
                    onAddToCart={handleAddToCart}
                    isWishlisted={wishlistItems.some(item => item.id === selectedProductId)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                )}
                {currentView === 'cart' && (
                  <CartView
                    cartItems={cartItems}
                    onUpdateQuantity={handleUpdateCartQuantity}
                    onRemoveItem={handleRemoveCartItem}
                    onNavigate={handleNavigate}
                  />
                )}
                {currentView === 'checkout' && (
                  <CheckoutView
                    onNavigate={handleNavigate}
                    onPlaceOrder={handlePlaceOrder}
                    unlockedCoupons={unlockedCoupons}
                  />
                )}
                {currentView === 'recipes' && (
                  <RecipesView
                    products={products}
                    onAddToCart={handleAddToCart}
                    onNavigate={handleNavigate}
                    onCompleteQuest={handleCompleteQuest}
                  />
                )}
                {currentView === 'order-tracking' && (
                  <OrderTrackingView
                    order={activeTrackingOrder || orders[0]}
                    onNavigate={handleNavigate}
                  />
                )}
                {currentView === 'profile' && (
                  <ProfileView
                    coins={coins}
                    onUpdateCoins={handleUpdateCoins}
                    quests={quests}
                    onClaimQuest={handleClaimQuest}
                    unlockedCoupons={unlockedCoupons}
                    onUnlockCoupon={handleUnlockCoupon}
                    currentUser={currentUser}
                    orders={orders}
                    products={products}
                    notifications={notifications}
                    onNavigate={handleNavigate}
                    wishlistItems={wishlistItems}
                    onRemoveWishlistItem={(productId) => {
                      const product = wishlistItems.find(item => item.id === productId);
                      if (product) handleToggleWishlist(product);
                    }}
                    onMoveWishlistToCart={handleMoveWishlistToCart}
                  />
                )}
                {currentView === 'about' && (
                  <AboutView />
                )}
                {currentView === 'contact' && (
                  <ContactView />
                )}
                {currentView === 'login' && (
                  <LoginView
                    onLoginSuccess={handleLoginSuccess}
                    onNavigate={handleNavigate}
                  />
                )}
              </>
            ) : (
              // ─── Admin Views ───
              <>
                {currentView === 'admin-dashboard' && (
                  <AdminDashboard
                    orders={orders}
                    products={products}
                    customers={customers}
                    notifications={notifications}
                    onNavigate={handleNavigate}
                    onSelectOrder={handleSelectOrderFromDashboard}
                    onRestock={handleRestockProduct}
                  />
                )}
                {currentView === 'admin-orders' && (
                  <AdminOrders
                    orders={orders}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    selectedOrderFromDashboard={selectedOrderForInspection}
                    onClearDashboardSelection={() => setSelectedOrderForInspection(null)}
                  />
                )}
                {currentView === 'admin-inventory' && (
                  <AdminInventory
                    products={products}
                    onRestock={handleRestockProduct}
                    onAddProduct={handleAddProduct}
                    onUpdatePrice={handleUpdateProductPrice}
                    onDeleteProduct={handleDeleteProduct}
                  />
                )}
                {currentView === 'admin-customers' && (
                  <AdminCustomers
                    customers={customers}
                    onToggleCustomerStatus={handleToggleCustomerStatus}
                  />
                )}
                {currentView === 'admin-delivery' && (
                  <AdminDeliveryPartners
                    orders={orders}
                    onOrdersUpdated={setOrders}
                  />
                )}
                {currentView === 'admin-contact' && (
                  <AdminContactMessages />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {!isAdminMode && currentView !== 'delivery-dashboard' && (
        <Footer onNavigate={handleNavigate} />
      )}

      {/* Floating bottom nav for User store */}
      {!isAdminMode && (
        <UserNav
          currentView={currentView}
          onNavigate={handleNavigate}
          cartCount={cartCount}
          cartTotal={cartTotal}
        />
      )}
    </div>
  );
}
