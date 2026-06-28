import { useEffect, useState } from 'react';
import { Bike, CheckCircle2, Clock, MapPin, PackageCheck, ShieldCheck, ToggleLeft, ToggleRight, XCircle } from 'lucide-react';
import { deliveryPartnersApi } from '../api.js';
import { DeliveryPartner, Order } from '../types';

interface DeliveryPartnerDashboardProps {
  onNavigate: (view: string) => void;
}

const statuses: Order['deliveryStatus'][] = ['Picked Up', 'Out for Delivery', 'Reached Destination', 'Delivered'];

export default function DeliveryPartnerDashboard({ onNavigate }: DeliveryPartnerDashboardProps) {
  const [profile, setProfile] = useState<DeliveryPartner | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [history, setHistory] = useState<Order[]>([]);
  const [otpByOrder, setOtpByOrder] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const loadData = async () => {
    const [profileRes, ordersRes, historyRes] = await Promise.all([
      deliveryPartnersApi.profile(),
      deliveryPartnersApi.myOrders(),
      deliveryPartnersApi.history()
    ]);
    setProfile(profileRes.data);
    setOrders(ordersRes.data);
    setHistory(historyRes.data);
  };

  useEffect(() => {
    loadData().catch((err) => setError(err.message || 'Unable to load delivery dashboard'));
  }, []);

  const updateAvailability = async () => {
    if (!profile) return;
    const next = profile.availability === 'Available' ? 'Unavailable' : 'Available';
    const res = await deliveryPartnersApi.availability(next);
    setProfile(res.data);
  };

  const respond = async (orderId: string, decision: 'accept' | 'reject') => {
    await deliveryPartnersApi.respond(orderId, decision);
    await loadData();
  };

  const updateStatus = async (orderId: string, status: Order['deliveryStatus']) => {
    try {
      setError('');
      await deliveryPartnersApi.updateDeliveryStatus(orderId, status, otpByOrder[orderId]);
      setOtpByOrder((prev) => ({ ...prev, [orderId]: '' }));
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Unable to update delivery status');
    }
  };

  return (
    <div className="mx-auto mb-24 max-w-6xl px-4 py-8 text-left">
      <section className="rounded-[32px] border border-outline-variant/30 bg-white p-6 shadow-sm animate-rise-in">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary text-white">
              <Bike className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-primary">Delivery Partner</p>
              <h1 className="font-display text-2xl font-black text-on-surface">{profile?.name || 'Delivery Dashboard'}</h1>
              <p className="text-xs font-semibold text-on-surface-variant">
                {profile?.vehicleType} {profile?.vehicleNumber ? `- ${profile.vehicleNumber}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={updateAvailability}
            className="flex items-center justify-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container-low px-5 py-3 text-xs font-black uppercase tracking-wider text-primary"
          >
            {profile?.availability === 'Available' ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
            {profile?.availability || 'Unavailable'}
          </button>
        </div>
      </section>

      {error && (
        <div className="mt-4 rounded-2xl border border-error/20 bg-error-container p-4 text-xs font-bold text-on-error-container">
          {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Metric label="Assigned Orders" value={orders.length} icon={PackageCheck} />
        <Metric label="Completed Deliveries" value={profile?.completedDeliveries || 0} icon={CheckCircle2} />
        <Metric label="Average Time" value={`${profile?.averageDeliveryTime || 0} min`} icon={Clock} />
      </div>

      <section className="mt-6 rounded-[32px] border border-outline-variant/30 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-black text-primary">Assigned Deliveries</h2>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-3xl border border-outline-variant/25 bg-surface-container-low p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-black text-primary">{order.id}</p>
                  <p className="mt-1 text-xs font-semibold text-on-surface">{order.customerName}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-on-surface-variant">
                    <MapPin className="h-3.5 w-3.5" /> {order.address}
                  </p>
                  <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-secondary">{order.deliveryStatus || 'Assigned'}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {order.deliveryStatus === 'Assigned' && (
                    <>
                      <button onClick={() => respond(order.id, 'accept')} className="rounded-full bg-primary px-4 py-2 text-xs font-black text-white">
                        Accept
                      </button>
                      <button onClick={() => respond(order.id, 'reject')} className="rounded-full bg-error px-4 py-2 text-xs font-black text-white">
                        Reject
                      </button>
                    </>
                  )}
                  {statuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(order.id, status)}
                      className="rounded-full border border-outline-variant/30 bg-white px-3 py-2 text-[10px] font-black uppercase text-primary"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {order.deliveryStatus === 'Reached Destination' && (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={otpByOrder[order.id] || ''}
                    onChange={(event) => setOtpByOrder((prev) => ({ ...prev, [order.id]: event.target.value }))}
                    placeholder="Enter customer OTP"
                    maxLength={6}
                    className="rounded-2xl border border-outline-variant/40 px-4 py-3 text-sm font-bold outline-none focus:border-primary"
                  />
                  <button onClick={() => updateStatus(order.id, 'Delivered')} className="rounded-2xl bg-secondary px-5 py-3 text-xs font-black uppercase text-white">
                    Verify OTP & Deliver
                  </button>
                </div>
              )}
            </div>
          ))}
          {orders.length === 0 && (
            <div className="rounded-3xl border border-dashed border-outline-variant/50 p-10 text-center text-sm font-bold text-on-surface-variant">
              No active delivery assignments.
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-[32px] border border-outline-variant/30 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-black text-primary">Delivery History</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {history.slice(0, 8).map((order) => (
            <div key={order.id} className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4">
              <p className="font-black text-primary">{order.id}</p>
              <p className="mt-1 text-xs text-on-surface-variant">{order.customerName} - ${order.total.toFixed(2)}</p>
            </div>
          ))}
          {history.length === 0 && <p className="text-xs font-semibold text-on-surface-variant">No completed deliveries yet.</p>}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) {
  return (
    <div className="rounded-3xl border border-outline-variant/30 bg-white p-5 shadow-sm">
      <Icon className="mb-4 h-6 w-6 text-primary" />
      <p className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">{label}</p>
      <p className="mt-1 text-2xl font-black text-on-surface">{value}</p>
    </div>
  );
}
