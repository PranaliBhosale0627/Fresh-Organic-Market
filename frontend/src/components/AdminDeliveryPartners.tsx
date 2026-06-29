import { useEffect, useMemo, useState } from 'react';
import { Bike, Plus, RefreshCw, Search, Star, Trash2, UserCheck } from 'lucide-react';
import { deliveryPartnersApi } from '../api.js';
import { DeliveryPartner, Order } from '../types';

interface AdminDeliveryPartnersProps {
  orders: Order[];
  onOrdersUpdated: (orders: Order[]) => void;
}

export default function AdminDeliveryPartners({ orders, onOrdersUpdated }: AdminDeliveryPartnersProps) {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', vehicleType: '', vehicleNumber: '', password: 'partner123' });
  const [busy, setBusy] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const [partnersRes, analyticsRes] = await Promise.all([
      deliveryPartnersApi.getAll({ q: query }),
      deliveryPartnersApi.analytics()
    ]);
    setPartners(partnersRes.data);
    setAnalytics(analyticsRes.data);
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const unassignedOrders = useMemo(
    () => orders.filter((order) => order.status !== 'Delivered' && order.status !== 'Cancelled'),
    [orders]
  );
  const ongoingDeliveries = useMemo(
    () => orders.filter((order) => order.assignedPartner && order.status !== 'Delivered' && order.status !== 'Cancelled'),
    [orders]
  );

  const createPartner = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setBusy('create');
      setError('');
      await deliveryPartnersApi.create(form);
      setSuccess('Delivery partner created successfully');
      setForm({ name: '', email: '', phone: '', vehicleType: '', vehicleNumber: '', password: 'partner123' });
      await load();
    } catch (err: any) {
      setError(err.message || 'Unable to create partner');
    } finally {
      setBusy('');
    }
  };

  const togglePartner = async (partner: DeliveryPartner) => {
    const res = await deliveryPartnersApi.update(partner.id, {
      status: partner.status === 'Active' ? 'Inactive' : 'Active'
    });
    setPartners((prev) => prev.map((item) => (item.id === partner.id ? res.data : item)));
  };

  const deletePartner = async (partnerId: string) => {
    if (!confirm('Delete this delivery partner?')) return;
    await deliveryPartnersApi.remove(partnerId);
    await load();
  };

  const assignOrder = async () => {
    if (!selectedOrderId || !selectedPartnerId) return;
    try {
      setBusy('assign');
      setError('');
      const res = await deliveryPartnersApi.assign(selectedOrderId, selectedPartnerId, '30-40 minutes');
      onOrdersUpdated(orders.map((order) => (order.id === res.data.id ? res.data : order)));
      setSuccess(res.message || 'Delivery Partner Assigned Successfully');
      setSelectedOrderId('');
      setSelectedPartnerId('');
      await load();
    } catch (err: any) {
      setError(err.message || 'Unable to assign delivery partner');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="space-y-6 pb-16 text-left">
      <div>
        <p className="text-[11px] font-black uppercase tracking-wider text-primary">Delivery Operations</p>
        <h1 className="font-display text-3xl font-black text-on-surface">Delivery Partner Management</h1>
        <p className="mt-1 text-sm text-on-surface-variant">Add partners, assign orders, monitor performance, and manage availability.</p>
      </div>

      {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-black text-emerald-800">{success}</div>}
      {error && <div className="rounded-2xl border border-error/20 bg-error-container p-4 text-xs font-bold text-on-error-container">{error}</div>}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Metric label="Completed" value={analytics?.completedDeliveries || 0} />
        <Metric label="Active Deliveries" value={analytics?.activeDeliveries || 0} />
        <Metric label="Avg Time" value={`${analytics?.averageDeliveryTime || 0} min`} />
        <Metric label="Avg Rating" value={`${analytics?.partnerRating || 0}`} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <form onSubmit={createPartner} className="rounded-[32px] border border-outline-variant/30 bg-white p-6 shadow-sm xl:col-span-1">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-primary">
            <Plus className="h-5 w-5" /> Add Partner
          </h2>
          <div className="space-y-3">
            {[
              ['name', 'Full name'],
              ['email', 'Email'],
              ['phone', 'Phone'],
              ['vehicleType', 'Vehicle type'],
              ['vehicleNumber', 'Vehicle number'],
              ['password', 'Password']
            ].map(([key, label]) => (
              <input
                key={key}
                required
                value={(form as any)[key]}
                onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
                placeholder={label}
                className="w-full rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-xs font-bold outline-none focus:border-primary"
              />
            ))}
            <button disabled={busy === 'create'} className="w-full rounded-2xl bg-primary px-5 py-3 text-xs font-black uppercase tracking-wider text-white disabled:opacity-60">
              {busy === 'create' ? 'Creating...' : 'Create Partner'}
            </button>
          </div>
        </form>

        <div className="rounded-[32px] border border-outline-variant/30 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-black text-primary">Partner Directory</h2>
            <div className="flex items-center gap-2 rounded-full border border-outline-variant/30 px-4 py-2">
              <Search className="h-4 w-4 text-primary" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && load()}
                placeholder="Search partner"
                className="bg-transparent text-xs font-bold outline-none"
              />
              <button onClick={load} className="text-primary"><RefreshCw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {partners.map((partner) => (
              <div key={partner.id} className="rounded-3xl border border-outline-variant/25 bg-surface-container-low p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-black text-white">
                      {partner.avatar || partner.name.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-black text-on-surface">{partner.name}</p>
                      <p className="text-[11px] font-semibold text-on-surface-variant">{partner.email}</p>
                      <p className="mt-1 text-[11px] text-on-surface-variant">{partner.vehicleType} - {partner.vehicleNumber}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-secondary/10 px-2 py-1 text-[10px] font-black text-secondary">{partner.availability}</span>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-1 text-xs font-black text-[#d08a23]"><Star className="h-3.5 w-3.5 fill-current" /> {partner.rating}</span>
                  <div className="flex gap-2">
                    <button onClick={() => togglePartner(partner)} className="rounded-full bg-white px-3 py-2 text-[10px] font-black uppercase text-primary">
                      {partner.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => deletePartner(partner.id)} className="rounded-full bg-error px-3 py-2 text-white">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-outline-variant/30 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-primary">
          <UserCheck className="h-5 w-5" /> Assign / Reassign Orders
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">
          <select value={selectedOrderId} onChange={(event) => setSelectedOrderId(event.target.value)} className="rounded-2xl border border-outline-variant/40 px-4 py-3 text-sm font-bold">
            <option value="">Select order</option>
            {unassignedOrders.map((order) => (
              <option key={order.id} value={order.id}>{order.id} - {order.customerName} - {order.deliveryStatus || 'Unassigned'}</option>
            ))}
          </select>
          <select value={selectedPartnerId} onChange={(event) => setSelectedPartnerId(event.target.value)} className="rounded-2xl border border-outline-variant/40 px-4 py-3 text-sm font-bold">
            <option value="">Select partner</option>
            {partners.filter((partner) => partner.status === 'Active').map((partner) => (
              <option key={partner.id} value={partner.id}>{partner.name} - {partner.availability}</option>
            ))}
          </select>
          <button onClick={assignOrder} disabled={busy === 'assign'} className="rounded-2xl bg-primary px-6 py-3 text-xs font-black uppercase text-white disabled:opacity-60">
            {busy === 'assign' ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </section>

      <section className="rounded-[32px] border border-outline-variant/30 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-primary">
          <Bike className="h-5 w-5" /> Live Delivery Monitor
        </h2>
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {ongoingDeliveries.map((order) => (
            <div key={order.id} className="rounded-3xl border border-outline-variant/25 bg-surface-container-low p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-primary">{order.id}</p>
                  <p className="mt-1 text-xs font-bold text-on-surface">{order.assignedPartner?.name}</p>
                  <p className="mt-1 text-[11px] font-semibold text-on-surface-variant">{order.deliveryStatus || 'Assigned'} - ETA {order.estimatedDeliveryTime || 'N/A'}</p>
                </div>
                <span className="rounded-full bg-secondary/10 px-2 py-1 text-[10px] font-black text-secondary">{order.paymentMethod}</span>
              </div>
              <div className="mt-3 rounded-2xl bg-white p-3 text-xs font-semibold text-on-surface-variant">
                Location: {order.liveLocation?.address || (
                  order.liveLocation?.lat && order.liveLocation?.lng
                    ? `${order.liveLocation.lat.toFixed(4)}, ${order.liveLocation.lng.toFixed(4)}`
                    : 'Waiting for location update'
                )}
              </div>
            </div>
          ))}
          {ongoingDeliveries.length === 0 && (
            <p className="rounded-3xl border border-dashed border-outline-variant/40 p-8 text-center text-sm font-bold text-on-surface-variant">
              No ongoing deliveries right now.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-outline-variant/30 bg-white p-5 shadow-sm">
      <Bike className="mb-4 h-5 w-5 text-primary" />
      <p className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">{label}</p>
      <p className="mt-1 text-2xl font-black text-on-surface">{value}</p>
    </div>
  );
}
