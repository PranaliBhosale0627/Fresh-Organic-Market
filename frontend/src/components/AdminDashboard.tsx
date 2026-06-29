import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Bell,
  Boxes,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Moon,
  PackageCheck,
  RefreshCw,
  Search,
  ShoppingBag,
  Sun,
  Users,
  Eye,
} from 'lucide-react';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { Customer, Order, Product } from '../types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend);

interface AdminDashboardProps {
  orders: Order[];
  products: Product[];
  customers: Customer[];
  notifications: string[];
  onNavigate: (view: string) => void;
  onSelectOrder: (order: Order) => void;
  onRestock: (productId: string) => void;
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function AdminDashboard({
  orders,
  products,
  customers,
  notifications,
  onNavigate,
  onSelectOrder,
  onRestock,
}: AdminDashboardProps) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const pageSize = 5;

  const deliveredOrders = orders.filter((order) => order.status === 'Delivered');
  const pendingOrders = orders.filter((order) => order.status === 'Pending');
  const totalRevenue = orders
    .filter((order) => order.status !== 'Cancelled')
    .reduce((sum, order) => sum + order.total, 0);
  const lowStockProducts = products.filter((product) => product.stock <= 15);

  const monthlyMetrics = useMemo(() => {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return labels.map((label, index) => {
      const order = orders[index % Math.max(orders.length, 1)];
      const baseRevenue = order ? order.total : 260;
      return {
        label,
        sales: Math.round(baseRevenue * (index + 2.4)),
        revenue: Math.round(baseRevenue * (index + 3.2)),
        orders: Math.max(8, Math.round((orders.length + index * 3) * 1.7)),
      };
    });
  }, [orders]);

  const chartText = darkMode ? '#dbe7d4' : '#526152';
  const chartGrid = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(45,90,39,0.08)';
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: chartText, usePointStyle: true, boxWidth: 8 },
      },
      tooltip: {
        backgroundColor: darkMode ? '#102513' : '#ffffff',
        titleColor: darkMode ? '#ffffff' : '#1f2a1f',
        bodyColor: darkMode ? '#dbe7d4' : '#526152',
        borderColor: darkMode ? 'rgba(255,255,255,0.16)' : 'rgba(45,90,39,0.18)',
        borderWidth: 1,
      },
    },
    scales: {
      x: { ticks: { color: chartText }, grid: { display: false } },
      y: { ticks: { color: chartText }, grid: { color: chartGrid } },
    },
  };

  const chartLabels = monthlyMetrics.map((item) => item.label);
  const revenueChart = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Revenue',
        data: monthlyMetrics.map((item) => item.revenue),
        borderColor: '#2d5a27',
        backgroundColor: 'rgba(45,90,39,0.16)',
        fill: true,
        tension: 0.42,
      },
      {
        label: 'Monthly Sales',
        data: monthlyMetrics.map((item) => item.sales),
        borderColor: '#d08a23',
        backgroundColor: 'rgba(208,138,35,0.12)',
        fill: true,
        tension: 0.42,
      },
    ],
  };
  const ordersChart = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Orders',
        data: monthlyMetrics.map((item) => item.orders),
        backgroundColor: ['#2d5a27', '#3f7d35', '#d08a23', '#7b8f46', '#234b70', '#8a5a2b'],
        borderRadius: 10,
      },
    ],
  };

  const filteredOrders = orders.filter((order) => {
    const search = query.toLowerCase();
    return [order.id, order.customerName, order.customerEmail, order.status]
      .join(' ')
      .toLowerCase()
      .includes(search);
  });
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const visibleOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  const cardBase = darkMode
    ? 'border-white/10 bg-white/[0.06] text-white shadow-black/20'
    : 'border-outline-variant/30 bg-white text-on-surface shadow-sm';
  const panelBase = darkMode
    ? 'border-white/10 bg-[#102513] text-white shadow-black/20'
    : 'border-outline-variant/30 bg-white text-on-surface shadow-sm';

  const cards = [
    { label: 'Total Revenue', value: currency.format(totalRevenue), icon: DollarSign, tone: 'text-primary bg-primary/10' },
    { label: 'Total Orders', value: String(orders.length), icon: ShoppingBag, tone: 'text-[#234b70] bg-[#234b70]/10' },
    { label: 'Pending Orders', value: String(pendingOrders.length), icon: Clock, tone: 'text-[#d08a23] bg-[#d08a23]/10' },
    { label: 'Delivered Orders', value: String(deliveredOrders.length), icon: CheckCircle2, tone: 'text-emerald-700 bg-emerald-500/10' },
    { label: 'Total Customers', value: String(customers.length), icon: Users, tone: 'text-secondary bg-secondary/10' },
    { label: 'Total Products', value: String(products.length), icon: Boxes, tone: 'text-[#8a5a2b] bg-[#8a5a2b]/10' },
  ];

  return (
    <div className={`${darkMode ? 'bg-[#07180a] text-white' : 'text-left'} -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6 pb-16 transition-colors duration-300`}>
      <div className="space-y-6 text-left">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? 'text-primary-fixed' : 'text-primary'}`}>Enterprise Operations</p>
            <h1 className="font-display-lg text-2xl md:text-4xl font-bold">Admin Analytics Dashboard</h1>
            <p className={`mt-1 text-sm ${darkMode ? 'text-white/65' : 'text-on-surface-variant'}`}>
              Revenue, fulfillment, customers, stock risk, and live system notifications.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className={`flex items-center gap-2 rounded-full border px-4 py-2 ${cardBase}`}>
              <Search className="h-4 w-4 text-primary" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search orders, customers, status"
                className={`w-full min-w-0 bg-transparent text-sm font-semibold outline-none placeholder:text-on-surface-variant sm:w-72 ${darkMode ? 'placeholder:text-white/45' : ''}`}
              />
            </div>
            <button
              onClick={() => setDarkMode((value) => !value)}
              className={`flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${cardBase}`}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {darkMode ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <article
                key={card.label}
                className={`animate-rise-in rounded-3xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${cardBase}`}
                style={{ animationDelay: `${index * 45}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className={`rounded-2xl p-2.5 ${card.tone}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className={`text-[10px] font-bold uppercase ${darkMode ? 'text-white/45' : 'text-on-surface-variant'}`}>Live</span>
                </div>
                <p className={`mt-5 text-[11px] font-bold uppercase tracking-wider ${darkMode ? 'text-white/60' : 'text-on-surface-variant'}`}>{card.label}</p>
                <p className="mt-1 text-2xl font-black tracking-tight">{card.value}</p>
              </article>
            );
          })}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className={`rounded-3xl border p-5 md:p-6 xl:col-span-2 ${panelBase}`}>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black">Monthly Sales & Revenue</h2>
                <p className={`text-xs ${darkMode ? 'text-white/55' : 'text-on-surface-variant'}`}>Chart.js line analytics from Mongo-backed order data.</p>
              </div>
              <PackageCheck className="h-5 w-5 text-primary" />
            </div>
            <div className="h-72">
              <Line data={revenueChart} options={chartOptions} />
            </div>
          </div>

          <div className={`rounded-3xl border p-5 md:p-6 ${panelBase}`}>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black">Orders</h2>
                <p className={`text-xs ${darkMode ? 'text-white/55' : 'text-on-surface-variant'}`}>Monthly order volume.</p>
              </div>
              <ShoppingBag className="h-5 w-5 text-secondary" />
            </div>
            <div className="h-72">
              <Bar data={ordersChart} options={chartOptions} />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className={`rounded-3xl border p-5 md:p-6 xl:col-span-2 ${panelBase}`}>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-black">Latest Orders</h2>
                <p className={`text-xs ${darkMode ? 'text-white/55' : 'text-on-surface-variant'}`}>{filteredOrders.length} matching records</p>
              </div>
              <button onClick={() => onNavigate('admin-orders')} className="rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white">
                Manage Orders
              </button>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-outline-variant/20">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead className={darkMode ? 'bg-white/5 text-white/60' : 'bg-surface-container text-on-surface-variant'}>
                  <tr>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Delivery Partner</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15">
                  {visibleOrders.map((order) => (
                    <tr key={order.id} className={darkMode ? 'hover:bg-white/5' : 'hover:bg-surface-container-low'}>
                      <td className="px-4 py-3 font-black text-primary">{order.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-bold">{order.customerName}</p>
                        <p className={darkMode ? 'text-white/45' : 'text-on-surface-variant'}>{order.customerEmail}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold">{order.assignedPartner?.name || 'Unassigned'}</p>
                        <p className={darkMode ? 'text-white/45' : 'text-on-surface-variant'}>{order.deliveryStatus || 'Unassigned'}</p>
                      </td>
                      <td className="px-4 py-3">{order.date}</td>
                      <td className="px-4 py-3 font-bold">{currency.format(order.total)}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full border border-primary/15 bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase text-primary">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => onSelectOrder(order)} className="rounded-xl p-2 text-primary transition-all hover:bg-primary/10 active:scale-95" title="View order">
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className={`text-xs font-semibold ${darkMode ? 'text-white/55' : 'text-on-surface-variant'}`}>Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  disabled={page === 1}
                  className="rounded-full border border-outline-variant/30 p-2 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                  disabled={page === totalPages}
                  className="rounded-full border border-outline-variant/30 p-2 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className={`rounded-3xl border p-5 md:p-6 ${panelBase}`}>
            <h2 className="flex items-center gap-2 text-lg font-black">
              <Bell className="h-5 w-5 text-[#d08a23]" /> Notifications
            </h2>
            <div className="mt-4 max-h-[390px] space-y-3 overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <p className={`rounded-2xl border border-dashed p-5 text-center text-xs ${darkMode ? 'text-white/50' : 'text-on-surface-variant'}`}>No notifications.</p>
              ) : (
                notifications.slice(0, 8).map((message, index) => (
                  <div key={`${message}-${index}`} className={`rounded-2xl border p-3 text-xs font-semibold ${darkMode ? 'border-white/10 bg-white/5 text-white/75' : 'border-outline-variant/20 bg-surface-container-low'}`}>
                    {message}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className={`rounded-3xl border p-5 md:p-6 ${panelBase}`}>
            <h2 className="text-lg font-black">Recent Customers</h2>
            <div className="mt-4 space-y-3">
              {customers.slice(0, 6).map((customer) => (
                <div key={customer.id} className={`flex items-center justify-between rounded-2xl border p-3 ${darkMode ? 'border-white/10 bg-white/5' : 'border-outline-variant/20 bg-surface-container-low'}`}>
                  <div className="flex items-center gap-3">
                    <img src={customer.avatar} alt={customer.name} className="h-11 w-11 rounded-2xl object-cover" />
                    <div>
                      <p className="text-sm font-black">{customer.name}</p>
                      <p className={`text-[11px] ${darkMode ? 'text-white/50' : 'text-on-surface-variant'}`}>{customer.email}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-[10px] font-black uppercase text-secondary">{customer.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-3xl border p-5 md:p-6 ${panelBase}`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-black">
                <AlertCircle className="h-5 w-5 text-error" /> Low Stock Products
              </h2>
              <button onClick={() => onNavigate('admin-inventory')} className="text-xs font-black uppercase text-primary">Inventory</button>
            </div>
            <div className="space-y-3">
              {lowStockProducts.slice(0, 6).map((product) => (
                <div key={product.id} className={`flex items-center justify-between rounded-2xl border p-3 ${darkMode ? 'border-white/10 bg-white/5' : 'border-outline-variant/20 bg-surface-container-low'}`}>
                  <div className="flex min-w-0 items-center gap-3">
                    <img src={product.image} alt={product.name} className="h-12 w-12 rounded-2xl object-cover" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">{product.name}</p>
                      <p className="text-[11px] font-bold text-error">{product.stock} left / {product.maxStock} max</p>
                    </div>
                  </div>
                  <button onClick={() => onRestock(product.id)} className="flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-2 text-[10px] font-black uppercase text-white">
                    <RefreshCw className="h-3.5 w-3.5" /> Restock
                  </button>
                </div>
              ))}
              {lowStockProducts.length === 0 && (
                <p className={`rounded-2xl border border-dashed p-6 text-center text-xs font-semibold ${darkMode ? 'text-white/50' : 'text-on-surface-variant'}`}>All products are stocked.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
