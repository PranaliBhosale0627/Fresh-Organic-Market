import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShoppingBag, TrendingUp, AlertCircle, Users, Check, Clock, Eye, RefreshCw, Star } from 'lucide-react';
import { Order, Product } from '../types';

interface AdminDashboardProps {
  orders: Order[];
  products: Product[];
  onNavigate: (view: string) => void;
  onSelectOrder: (order: Order) => void;
  onRestock: (productId: string) => void;
}

export default function AdminDashboard({
  orders,
  products,
  onNavigate,
  onSelectOrder,
  onRestock,
}: AdminDashboardProps) {
  // Compute dashboard metrics
  const totalRevenue = orders.reduce((acc, o) => acc + (o.status !== 'Pending' ? o.total : 0), 0);
  const activeOrdersCount = orders.filter((o) => o.status === 'Pending' || o.status === 'Processing' || o.status === 'Shipped').length;
  const lowStockItems = products.filter((p) => p.stock <= 15);
  const totalCustomers = 140; // mock total customer count

  // Sample analytics chart data
  const chartData = [
    { name: 'Mon', revenue: 420, orders: 12 },
    { name: 'Tue', revenue: 780, orders: 18 },
    { name: 'Wed', revenue: 510, orders: 15 },
    { name: 'Thu', revenue: 980, orders: 24 },
    { name: 'Fri', revenue: 1250, orders: 32 },
    { name: 'Sat', revenue: 1842, orders: 40 },
    { name: 'Sun', revenue: 1420, orders: 28 },
  ];

  const statCards = [
    {
      title: "Today's Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      change: "+12.4% from yesterday",
      color: "border-primary text-primary bg-primary/5",
      icon: TrendingUp,
    },
    {
      title: "Active Orders",
      value: `${activeOrdersCount} orders`,
      change: "3 pending picker assignment",
      color: "border-secondary text-secondary bg-secondary/5",
      icon: ShoppingBag,
    },
    {
      title: "Low Stock Alert",
      value: `${lowStockItems.length} items`,
      change: `${products.filter(p => p.stock === 0).length} items completely out`,
      color: "border-error text-error bg-error/5",
      icon: AlertCircle,
    },
    {
      title: "Active Customers",
      value: `${totalCustomers} users`,
      change: "+5.1% increase this week",
      color: "border-on-surface-variant text-on-surface-variant bg-surface-container",
      icon: Users,
    }
  ];

  return (
    <div className="space-y-8 text-left pb-16">
      {/* Title block */}
      <div>
        <h1 className="font-display-lg text-2xl md:text-3.5xl text-primary font-bold">Harvest Dashboard</h1>
        <p className="text-on-surface-variant text-sm mt-1">Real-time statistics, organic inventory indices, and logistics status.</p>
      </div>

      {/* Stats Cards Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`border rounded-[24px] p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow bg-white ${stat.color}`}
            >
              <div className="flex justify-between items-start">
                <p className="font-bold text-xs text-on-surface-variant uppercase tracking-wider">{stat.title}</p>
                <div className="p-2 rounded-xl bg-white border border-outline-variant/30 shadow-inner">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <p className="font-headline-lg text-2xl md:text-3xl font-bold text-on-surface leading-tight">
                  {stat.value}
                </p>
                <p className="text-[11px] text-on-surface-variant font-semibold mt-1 leading-none">{stat.change}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Analytics Chart & Alerts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly sales graph card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-outline-variant/30 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-headline-md text-base md:text-lg text-on-surface font-bold">Revenue Flow Analysis</h2>
              <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">Weekly metrics summary of order volume vs earnings.</p>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-[10px] font-bold text-primary px-2 py-1 rounded bg-primary/10">
                <span className="w-2 h-2 bg-primary rounded-full"></span> Earnings
              </span>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2d5a27" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2d5a27" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2d5a27" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick action restocking widget sidebar */}
        <div className="bg-white rounded-3xl p-6 border border-outline-variant/30 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="font-headline-md text-base md:text-lg text-on-surface font-bold flex items-center gap-1.5">
              <AlertCircle className="w-5 h-5 text-error" /> Inventory Alerts
            </h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Below organic items are critically below buffer stock level.
            </p>

            <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
              {lowStockItems.length === 0 ? (
                <p className="text-xs font-semibold text-secondary py-4 text-center">
                  All organic crops are fully stocked!
                </p>
              ) : (
                lowStockItems.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-2.5">
                      <img className="w-9 h-9 rounded-lg object-cover" src={p.image} alt={p.name} />
                      <div>
                        <h4 className="font-bold text-xs text-on-surface line-clamp-1">{p.name}</h4>
                        <p className="text-[10px] text-error font-bold">{p.stock} left in stock</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onRestock(p.id)}
                      className="px-2.5 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary-container transition-colors shadow-sm"
                    >
                      Restock +50
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate('admin-inventory')}
            className="w-full mt-6 py-3 border-2 border-primary text-primary rounded-xl font-bold text-xs hover:bg-primary/5 transition-all text-center active:scale-95"
          >
            Manage All Inventory
          </button>
        </div>
      </section>

      {/* Recent Orders log Table */}
      <section className="bg-white rounded-3xl p-6 md:p-8 border border-outline-variant/30 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-headline-md text-base md:text-lg text-on-surface font-bold">Recent Incoming Orders</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Real-time purchase logs awaiting processing and logistics dispatch.</p>
          </div>
          <button
            onClick={() => onNavigate('admin-orders')}
            className="text-primary font-bold text-xs hover:underline uppercase tracking-wider"
          >
            Manage Orders
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-outline-variant/30">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant/40 text-on-surface-variant font-bold text-[11px] uppercase tracking-wider">
                <th className="px-5 py-4">Order ID</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-medium text-xs">
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-5 py-4 font-bold text-primary">{o.id}</td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-on-surface">{o.customerName}</p>
                    <p className="text-[10px] text-on-surface-variant">{o.customerEmail}</p>
                  </td>
                  <td className="px-5 py-4 text-on-surface-variant font-semibold">{o.date}</td>
                  <td className="px-5 py-4 font-bold text-on-surface">${o.total.toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
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
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onSelectOrder(o)}
                        className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-primary active:scale-95"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
