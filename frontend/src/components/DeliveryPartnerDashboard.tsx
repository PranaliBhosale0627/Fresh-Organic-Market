import { useEffect, useState } from 'react';
import { Bike, CheckCircle2, Clock, CreditCard, LocateFixed, MapPin, PackageCheck, ToggleLeft, ToggleRight } from 'lucide-react';
import { deliveryPartnersApi } from '../api.js';
import { DeliveryPartner, Order } from '../types';

interface DeliveryPartnerDashboardProps {
  onNavigate: (view: string) => void;
}

const statuses: Order['deliveryStatus'][] = ['Accepted', 'Picked Up', 'Out for Delivery', 'Near Your Location', 'Delivered', 'Delivery Failed'];

export default function DeliveryPartnerDashboard({ onNavigate }: DeliveryPartnerDashboardProps) {
  const [profile, setProfile] = useState<DeliveryPartner | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [history, setHistory] = useState<Order[]>([]);
  const [otpByOrder, setOtpByOrder] = useState<Record<string, string>>({});
  const [addressByOrder, setAddressByOrder] = useState<Record<string, string>>({});
  const [busyAction, setBusyAction] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const notify = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3500);
  };

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

  const runAction = async (key: string, action: () => Promise<string | void>) => {
    try {
      setBusyAction(key);
      setError('');
      const message = await action();
      await loadData();
      if (message) notify(message);
    } catch (err: any) {
      setError(err.message || 'Action failed');
    } finally {
      setBusyAction('');
    }
  };

  const updateAvailability = async () => {
    if (!profile) return;
    const next = profile.availability === 'Available' ? 'Unavailable' : 'Available';
    await runAction('availability', async () => {
      const res = await deliveryPartnersApi.availability(next);
      setProfile(res.data);
      return `Availability updated to ${next}`;
    });
  };

  const respond = async (orderId: string, decision: 'accept' | 'reject') => {
    await runAction(`${orderId}-${decision}`, async () => {
      const res = await deliveryPartnersApi.respond(orderId, decision);
      return res.message || (decision === 'accept' ? 'Order Accepted Successfully' : 'Order Rejected');
    });
  };

  const updateStatus = async (orderId: string, status: Order['deliveryStatus']) => {
    await runAction(`${orderId}-${status}`, async () => {
      const res = await deliveryPartnersApi.updateDeliveryStatus(orderId, status, otpByOrder[orderId]);
      setOtpByOrder((prev) => ({ ...prev, [orderId]: '' }));
      return res.message || `Delivery status updated to ${status}`;
    });
  };

  const shareGpsLocation = async (orderId: string) => {
    if (!navigator.geolocation) {
      setError('GPS location is not supported in this browser. Enter current address manually.');
      return;
    }
    await runAction(`${orderId}-gps`, () => new Promise<string>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await deliveryPartnersApi.updateLocation(orderId, {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            estimatedDeliveryTime: '10-15 minutes'
          });
          resolve('Live GPS location shared');
        },
        () => reject(new Error('Location permission denied. Enter current address manually.')),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }));
  };

  const shareManualLocation = async (orderId: string) => {
    const address = addressByOrder[orderId]?.trim();
    if (!address) {
      setError('Enter current location/address first.');
      return;
    }
    await runAction(`${orderId}-manual-location`, async () => {
      await deliveryPartnersApi.updateLocation(orderId, { address, estimatedDeliveryTime: '15-20 minutes' });
      return 'Current delivery location updated';
    });
  };

  const collectCod = async (orderId: string) => {
    await runAction(`${orderId}-cod`, async () => {
      const res = await deliveryPartnersApi.collectCod(orderId);
      return res.message || 'COD payment marked as Collected';
    });
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
            disabled={busyAction === 'availability'}
            className="flex items-center justify-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container-low px-5 py-3 text-xs font-black uppercase tracking-wider text-primary disabled:opacity-60"
          >
            {profile?.availability === 'Available' ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
            {busyAction === 'availability' ? 'Updating...' : profile?.availability || 'Unavailable'}
          </button>
        </div>
      </section>

      {success && <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-black text-emerald-800">{success}</div>}
      {error && <div className="mt-4 rounded-2xl border border-error/20 bg-error-container p-4 text-xs font-bold text-on-error-container">{error}</div>}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Metric label="Assigned Orders" value={orders.length} icon={PackageCheck} />
        <Metric label="Completed Deliveries" value={profile?.completedDeliveries || 0} icon={CheckCircle2} />
        <Metric label="Average Time" value={`${profile?.averageDeliveryTime || 0} min`} icon={Clock} />
      </div>

      <section className="mt-6 rounded-[32px] border border-outline-variant/30 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-black text-primary">Assigned Deliveries</h2>
        <div className="space-y-4">
          {orders.map((order) => {
            const isCod = String(order.paymentMethod || '').toLowerCase().includes('cash');
            return (
              <div key={order.id} className="rounded-3xl border border-outline-variant/25 bg-surface-container-low p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-black text-primary">{order.id}</p>
                    <p className="mt-1 text-xs font-semibold text-on-surface">{order.customerName}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-on-surface-variant">
                      <MapPin className="h-3.5 w-3.5" /> {order.address}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <p className="rounded-full bg-secondary/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-secondary">{order.deliveryStatus || 'Assigned'}</p>
                      <p className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-primary">{order.paymentMethod}</p>
                      {isCod && <p className="rounded-full bg-[#d08a23]/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[#d08a23]">{order.paymentStatus}</p>}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {order.deliveryStatus === 'Assigned' && (
                      <>
                        <button disabled={busyAction === `${order.id}-accept`} onClick={() => respond(order.id, 'accept')} className="rounded-full bg-primary px-4 py-2 text-xs font-black text-white disabled:opacity-60">
                          {busyAction === `${order.id}-accept` ? 'Accepting...' : 'Accept'}
                        </button>
                        <button disabled={busyAction === `${order.id}-reject`} onClick={() => respond(order.id, 'reject')} className="rounded-full bg-error px-4 py-2 text-xs font-black text-white disabled:opacity-60">
                          {busyAction === `${order.id}-reject` ? 'Rejecting...' : 'Reject'}
                        </button>
                      </>
                    )}
                    {statuses.map((status) => (
                      <button
                        key={status}
                        disabled={busyAction === `${order.id}-${status}`}
                        onClick={() => updateStatus(order.id, status)}
                        className="rounded-full border border-outline-variant/30 bg-white px-3 py-2 text-[10px] font-black uppercase text-primary disabled:opacity-60"
                      >
                        {busyAction === `${order.id}-${status}` ? 'Updating...' : status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto]">
                  <input
                    value={addressByOrder[order.id] || ''}
                    onChange={(event) => setAddressByOrder((prev) => ({ ...prev, [order.id]: event.target.value }))}
                    placeholder="Current address/location"
                    className="rounded-2xl border border-outline-variant/40 px-4 py-3 text-sm font-bold outline-none focus:border-primary"
                  />
                  <button onClick={() => shareManualLocation(order.id)} className="rounded-2xl bg-white px-4 py-3 text-xs font-black uppercase text-primary border border-outline-variant/30">
                    Update Address
                  </button>
                  <button onClick={() => shareGpsLocation(order.id)} className="rounded-2xl bg-secondary px-4 py-3 text-xs font-black uppercase text-white">
                    <LocateFixed className="mr-1 inline h-4 w-4" /> Share GPS
                  </button>
                </div>

                {order.deliveryStatus === 'Near Your Location' && (
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

                {isCod && order.status === 'Delivered' && order.paymentStatus !== 'Collected' && (
                  <button onClick={() => collectCod(order.id)} className="mt-4 rounded-2xl bg-[#d08a23] px-5 py-3 text-xs font-black uppercase text-white">
                    <CreditCard className="mr-1 inline h-4 w-4" /> Mark COD Collected
                  </button>
                )}
              </div>
            );
          })}
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
