import { useState } from 'react';
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronUp, MapPin, MessageSquare, PhoneCall, ShieldCheck, ShoppingCart } from 'lucide-react';
import { Order } from '../types';

interface OrderTrackingViewProps {
  order: Order;
  onNavigate: (view: string) => void;
}

const deliveryStages = [
  'Order Placed',
  'Confirmed',
  'Assigned to Delivery Partner',
  'Picked Up',
  'Out for Delivery',
  'Reached Destination',
  'Delivered',
];

export default function OrderTrackingView({ order, onNavigate }: OrderTrackingViewProps) {
  const [showItems, setShowItems] = useState(false);
  const completed = new Set<string>(['Order Placed']);
  if (order.status !== 'Pending') completed.add('Confirmed');
  if (order.assignedPartner) completed.add('Assigned to Delivery Partner');
  for (const entry of order.deliveryHistory || []) completed.add(entry.status);
  if (order.status === 'Delivered') completed.add('Delivered');

  const partner = order.assignedPartner;

  return (
    <div className="mx-auto mb-24 max-w-5xl space-y-8 px-4 py-8 text-left">
      <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('home')} className="rounded-full p-2 text-primary transition hover:bg-surface-container-low active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-headline-md font-bold text-primary">Track Order {order.id}</h1>
        </div>
        <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
          {order.deliveryStatus || order.status}
        </span>
      </div>

      <section className="rounded-[32px] border border-primary/20 bg-primary-container p-6 text-on-primary-container shadow-sm md:p-8">
        <div className="flex items-center gap-5">
          <CheckCircle2 className="h-12 w-12 shrink-0 text-primary" />
          <div>
            <h2 className="font-headline-md text-xl font-bold text-primary-fixed">Order confirmed</h2>
            <p className="mt-1 text-sm leading-relaxed text-primary-fixed/90">
              Estimated arrival: <strong className="text-white">{order.estimatedDeliveryTime || order.deliveryTimeSlot}</strong>
            </p>
          </div>
        </div>
      </section>

      {order.deliveryOtpCode && order.deliveryStatus === 'Out for Delivery' && (
        <section className="rounded-[28px] border border-secondary/30 bg-secondary-container p-5 text-on-secondary-container shadow-sm">
          <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" /> Secure Delivery OTP
          </p>
          <p className="mt-2 text-3xl font-black tracking-[0.35em]">{order.deliveryOtpCode}</p>
          <p className="mt-2 text-xs font-bold">Share this OTP only after receiving your order.</p>
        </section>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[2.5rem] border border-outline-variant/30 bg-emerald-50 shadow-md">
            <div className="absolute left-6 top-5 rounded-2xl border border-emerald-600/20 bg-emerald-600/10 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-800">
              Verdant Hub
            </div>
            <div className="absolute inset-x-0 top-1/3 h-9 rotate-[-1deg] border-y border-outline-variant/20 bg-white" />
            <div className="absolute inset-x-0 top-2/3 h-10 rotate-2 border-y border-outline-variant/20 bg-white" />
            <div className="absolute bottom-8 right-10 flex flex-col items-center">
              <div className="rounded-full border-2 border-white bg-primary p-3 text-white shadow-lg">
                <MapPin className="h-5 w-5 fill-current" />
              </div>
              <span className="mt-1 rounded-md bg-white px-2 py-1 text-[9px] font-black text-primary shadow">Home</span>
            </div>
            <div className="absolute left-1/3 top-1/2 flex flex-col items-center">
              <div className="rounded-full border-2 border-white bg-secondary p-3 text-white shadow-lg">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <span className="mt-1 rounded-full bg-secondary px-3 py-1 text-[9px] font-black text-white shadow">
                {order.deliveryStatus || 'Preparing'}
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-outline-variant/30 bg-white/95 p-4 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-xs font-black text-white">
                  {partner?.avatar || 'DP'}
                </div>
                <div>
                  <h4 className="text-sm font-black text-on-surface">{partner?.name || 'Delivery partner pending'}</h4>
                  <p className="mt-0.5 text-[10px] font-semibold text-on-surface-variant">
                    {partner ? `${partner.vehicleType} - ${partner.vehicleNumber} - ${partner.rating || 4.7} star` : 'Admin will assign a partner soon'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => alert(`Calling ${partner?.phone || '+1-800-ORGANIC'}`)} className="rounded-full bg-surface-container-low p-2">
                  <PhoneCall className="h-4 w-4 text-on-surface-variant" />
                </button>
                <button onClick={() => alert('Opening delivery chat...')} className="rounded-full bg-primary p-2 text-white">
                  <MessageSquare className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-5">
          <section className="rounded-[2rem] border border-outline-variant/30 bg-white p-6 shadow-sm md:p-8">
            <h3 className="mb-6 text-base font-black text-on-surface">Delivery Timeline</h3>
            <div className="relative space-y-6 pl-6">
              <div className="absolute bottom-2 left-[9px] top-2 z-0 w-0.5 bg-outline-variant/30" />
              {deliveryStages.map((stage, index) => {
                const isComplete = completed.has(stage);
                const history = (order.deliveryHistory || []).find((entry) => entry.status === stage);
                return (
                  <div key={stage} className="relative z-10 flex gap-4">
                    <div className="absolute -left-[23px] top-1">
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border border-white text-[9px] font-bold shadow-sm ${isComplete ? 'bg-primary text-white' : 'bg-surface-container-high text-outline-variant'}`}>
                        {isComplete ? '✓' : index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between gap-2">
                        <h4 className={`text-sm font-black ${isComplete ? 'text-primary' : 'text-on-surface-variant'}`}>{stage}</h4>
                        <span className="text-[10px] font-bold text-on-surface-variant">
                          {history ? new Date(history.changedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : isComplete ? 'Done' : 'Pending'}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-on-surface-variant">
                        {history?.note || `${stage} status for your delivery.`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-white shadow-sm">
            <button onClick={() => setShowItems(!showItems)} className="flex w-full items-center justify-between px-5 py-4 text-sm font-bold text-on-surface hover:bg-surface-container-low">
              <span className="flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-primary" /> Review Purchased Items</span>
              {showItems ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showItems && (
              <div className="space-y-3 border-t border-outline-variant/10 px-5 pb-5 pt-2">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between pt-3 text-xs">
                    <div>
                      <p className="font-bold text-on-surface">{item.productName}</p>
                      <p className="text-[11px] text-on-surface-variant">Qty: {item.quantity} x ${item.price.toFixed(2)}</p>
                    </div>
                    <span className="font-bold text-primary">${(item.quantity * item.price).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-outline-variant/20 pt-3 text-xs font-bold text-primary">
                  <span>Grand Total</span>
                  <span className="text-sm">${order.total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
