import { useState, useEffect } from 'react';
import { Search, ShoppingBag, Eye, RefreshCw, Printer, AlertCircle, MapPin, Clock, CreditCard, ChevronRight } from 'lucide-react';
import { Order } from '../types';

interface AdminOrdersProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  selectedOrderFromDashboard?: Order | null;
  onClearDashboardSelection?: () => void;
}

export default function AdminOrders({
  orders,
  onUpdateOrderStatus,
  selectedOrderFromDashboard,
  onClearDashboardSelection,
}: AdminOrdersProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | Order['status']>('All');

  useEffect(() => {
    if (selectedOrderFromDashboard) {
      setSelectedOrder(selectedOrderFromDashboard);
    } else if (orders.length > 0 && !selectedOrder) {
      setSelectedOrder(orders[0]);
    }
  }, [selectedOrderFromDashboard, orders]);

  // Clean filters
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.customerEmail.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const handlePrintInvoice = () => {
    if (!selectedOrder) return;
    alert(`Generating high-fidelity printable PDF receipt for Order ${selectedOrder.id}...`);
  };

  return (
    <div className="space-y-6 text-left pb-16">
      {/* View Header */}
      <div>
        <h1 className="font-display-lg text-2xl md:text-3.5xl text-primary font-bold">Order Management</h1>
        <p className="text-on-surface-variant text-sm mt-1">Track customer baskets, modify dispatch timelines, and review total logistics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: Orders list */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-outline-variant/30 shadow-sm space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search ID, customer, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline-variant"
            />
          </div>

          {/* Status filter pills */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {['All', 'Pending', 'Processing', 'Shipped', 'Delivered'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter as any)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0 ${
                  statusFilter === filter
                    ? 'bg-primary text-white'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* List items */}
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredOrders.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-outline-variant rounded-2xl">
                <p className="text-xs font-semibold text-on-surface-variant">No orders match filter.</p>
              </div>
            ) : (
              filteredOrders.map((o) => {
                const isSelected = selectedOrder?.id === o.id;
                return (
                  <div
                    key={o.id}
                    onClick={() => {
                      setSelectedOrder(o);
                      if (onClearDashboardSelection) onClearDashboardSelection();
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-2 border-primary bg-primary/5 shadow-md'
                        : 'border-outline-variant/20 bg-white hover:bg-surface-container-low/55'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-xs text-primary">{o.id}</span>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        o.status === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : o.status === 'Shipped'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : o.status === 'Processing'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {o.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <h4 className="font-bold text-xs text-on-surface leading-tight">{o.customerName}</h4>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">{o.items.length} items • {o.date}</p>
                      </div>
                      <span className="font-bold text-xs text-on-surface">${o.total.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right column: Selected Order detail pane */}
        <div className="lg:col-span-7 space-y-6">
          {selectedOrder ? (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-outline-variant/30 shadow-sm space-y-6">
              {/* Card Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-outline-variant/10 pb-5 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-primary">{selectedOrder.id}</span>
                    <span className="text-xs text-on-surface-variant font-medium">({selectedOrder.date})</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">Secure payment via {selectedOrder.paymentMethod}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handlePrintInvoice}
                    className="p-2 bg-surface-container-low hover:bg-surface-container rounded-xl transition-colors text-on-surface-variant active:scale-95 border border-outline-variant/15 flex items-center gap-1 text-xs font-semibold"
                  >
                    <Printer className="w-4 h-4" /> Print Invoice
                  </button>
                </div>
              </div>

              {/* Status Update Controller */}
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 space-y-3">
                <p className="font-bold text-xs text-primary uppercase tracking-wider leading-none">Modify Logistic Status</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(['Pending', 'Processing', 'Shipped', 'Delivered'] as Order['status'][]).map((st) => {
                    const isCurrent = selectedOrder.status === st;
                    return (
                      <button
                        key={st}
                        onClick={() => {
                          onUpdateOrderStatus(selectedOrder.id, st);
                          // Sync selected order local state too
                          setSelectedOrder((prev) => prev ? { ...prev, status: st } : null);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-primary text-white shadow'
                            : 'bg-white border border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Order breakdown */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-on-surface">Purchased Basket items</h3>
                <div className="divide-y divide-outline-variant/20 border border-outline-variant/20 rounded-2xl px-4 bg-surface-container-low/30">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center py-3.5 first:pt-4 last:pb-4 text-xs">
                      <div>
                        <p className="font-bold text-on-surface">{it.productName}</p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">Quantity: {it.quantity} x ${it.price.toFixed(2)}</p>
                      </div>
                      <span className="font-bold text-primary">${(it.quantity * it.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing statistics breakdown */}
              <div className="grid grid-cols-2 gap-4 border-t border-outline-variant/10 pt-5 text-xs font-semibold text-on-surface-variant">
                <div className="space-y-2 text-left">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="text-on-surface font-bold">${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span className="text-on-surface font-bold">${selectedOrder.deliveryFee.toFixed(2)}</span>
                  </div>
                </div>
                <div className="space-y-2 text-left">
                  <div className="flex justify-between">
                    <span>Tax (8%):</span>
                    <span className="text-on-surface font-bold">${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-secondary">
                      <span>Discount:</span>
                      <span className="font-bold">-${selectedOrder.discount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                
                <div className="col-span-2 pt-4 border-t border-outline-variant/20 flex justify-between items-end">
                  <span className="font-bold text-sm text-on-surface">Grand total billing:</span>
                  <span className="font-display-lg text-xl text-primary font-bold leading-none">${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Recipient Details */}
              <div className="pt-4 border-t border-outline-variant/10 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                <div className="space-y-1">
                  <p className="font-bold text-[10px] text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Shipping Address
                  </p>
                  <p className="text-on-surface-variant leading-relaxed">
                    <strong>{selectedOrder.customerName}</strong><br />
                    {selectedOrder.address}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-[10px] text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Scheduled slot
                  </p>
                  <p className="text-on-surface-variant leading-relaxed">
                    {selectedOrder.deliveryTimeSlot}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-outline-variant rounded-3xl bg-white text-on-surface-variant">
              <div className="text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-outline-variant mx-auto" />
                <p className="font-semibold text-xs">Select an order on the left to inspect details.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
