import { useState } from 'react';
import { Search, ShieldAlert, ShieldCheck, Heart, UserMinus, UserCheck, Mail } from 'lucide-react';
import { Customer } from '../types';

interface AdminCustomersProps {
  customers: Customer[];
  onToggleCustomerStatus: (customerId: string) => void;
}

export default function AdminCustomers({
  customers,
  onToggleCustomerStatus,
}: AdminCustomersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Blocked'>('All');

  const filteredCustomers = customers.filter((c) => {
    const matchesFilter = statusFilter === 'All' || c.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  // Calculate statistics
  const activeCount = customers.filter((c) => c.status === 'Active').length;
  const blockedCount = customers.filter((c) => c.status === 'Blocked').length;
  const avgOrders = Math.round(customers.reduce((acc, c) => acc + c.ordersCount, 0) / customers.length) || 14;

  return (
    <div className="space-y-6 text-left pb-16">
      {/* View Header */}
      <div>
        <h1 className="font-display-lg text-2xl md:text-3.5xl text-primary font-bold">User Directory</h1>
        <p className="text-on-surface-variant text-sm mt-1">Review community customer accounts, track individual loyalty stats, and modify access flags.</p>
      </div>

      {/* Stats row */}
      <section className="bg-white rounded-2xl p-4 md:p-6 border border-outline-variant/30 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center md:text-left border-r border-outline-variant/20 last:border-0 pr-2">
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Registered Users</p>
          <p className="text-2xl text-primary font-bold mt-1">{customers.length}</p>
        </div>
        <div className="text-center md:text-left border-r border-outline-variant/20 last:border-0 pr-2">
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Active Cohorts</p>
          <p className="text-2xl text-secondary font-bold mt-1">{activeCount}</p>
        </div>
        <div className="text-center md:text-left border-r border-outline-variant/20 last:border-0 pr-2">
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Blocked Flags</p>
          <p className="text-2xl text-error font-bold mt-1">{blockedCount}</p>
        </div>
        <div className="text-center md:text-left last:border-0">
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Avg Order Volume</p>
          <p className="text-2xl text-on-surface font-bold mt-1">{avgOrders} per user</p>
        </div>
      </section>

      {/* Search and Filters actions */}
      <section className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:max-w-xs relative group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search customer account..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-outline-variant/30 rounded-full h-11 pl-9 pr-4 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline-variant"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
          {['All', 'Active', 'Blocked'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter as any)}
              className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors shrink-0 ${
                statusFilter === filter
                  ? 'bg-secondary-container text-on-secondary-container shadow-sm'
                  : 'bg-white border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      {/* Directory Table List */}
      <section className="bg-white rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant/40 text-on-surface-variant font-bold text-[11px] uppercase tracking-wider">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Join Date</th>
                <th className="px-6 py-4">Order Metrics</th>
                <th className="px-6 py-4">Account Flag</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-medium text-xs">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-on-surface-variant font-semibold">
                    No customers match criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const isActive = c.status === 'Active';
                  return (
                    <tr key={c.id} className="hover:bg-surface-container-low transition-colors">
                      {/* Customer block */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img className="w-10 h-10 rounded-full object-cover border border-outline-variant/15 shrink-0" src={c.avatar} alt={c.name} />
                          <div>
                            <p className="font-bold text-on-surface">{c.name}</p>
                            <p className="text-[10px] text-on-surface-variant">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      {/* Join Date */}
                      <td className="px-6 py-4 text-on-surface-variant font-semibold">{c.joinDate}</td>
                      {/* Total Orders count */}
                      <td className="px-6 py-4 font-bold text-on-surface">{c.ordersCount} total orders</td>
                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {isActive ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                          {c.status}
                        </span>
                      </td>
                      {/* Toggle Block status */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => onToggleCustomerStatus(c.id)}
                            className={`p-2 rounded-xl transition-all flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider border active:scale-95 duration-100 ${
                              isActive
                                ? 'border-error/20 hover:bg-error hover:text-white text-error'
                                : 'border-emerald-600/20 hover:bg-emerald-600 hover:text-white text-emerald-700'
                            }`}
                          >
                            {isActive ? (
                              <>
                                <UserMinus className="w-3.5 h-3.5" />
                                Block User
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                Activate
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
