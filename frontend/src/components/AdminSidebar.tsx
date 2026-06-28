import { LayoutDashboard, ShoppingBasket, Boxes, Users, ClipboardMinus, HeartHandshake, Bike, Mail } from 'lucide-react';

interface AdminSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  lowStockCount: number;
}

export default function AdminSidebar({
  currentView,
  onNavigate,
  lowStockCount,
}: AdminSidebarProps) {
  const menuItems = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-orders', label: 'Orders', icon: ShoppingBasket },
    { id: 'admin-delivery', label: 'Delivery', icon: Bike },
    { id: 'admin-inventory', label: 'Inventory', icon: Boxes, badge: lowStockCount > 0 ? lowStockCount : undefined },
    { id: 'admin-customers', label: 'Users', icon: Users },
    { id: 'admin-contact', label: 'Messages', icon: Mail },
  ];

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] z-40 hidden lg:flex flex-col py-6 bg-surface-container-low w-72 border-r border-outline-variant">
      {/* Brand Profile Section inside Sidebar */}
      <div className="px-6 mb-8 flex flex-col items-start">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center text-on-primary shadow-md shadow-primary/10">
            <HeartHandshake className="w-6 h-6 text-on-primary" />
          </div>
          <div>
            <h2 className="font-headline-md text-sm text-primary font-bold">Store Admin</h2>
            <p className="text-on-surface-variant font-medium text-[11px] leading-tight">Harvest &amp; Co.</p>
          </div>
        </div>
        <span className="bg-primary-container text-on-primary-container px-3 py-0.5 rounded-full font-label-sm text-[10px] uppercase font-bold tracking-wider">
          Super Admin
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-[calc(100%-2rem)] mx-4 flex items-center justify-between px-4 py-3 font-semibold text-sm rounded-full transition-all duration-200 ${
                isActive
                  ? 'bg-secondary-container text-on-secondary-container shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <div className="flex items-center">
                <Icon className="w-5 h-5 mr-3" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="bg-error text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.badge} Low
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer Metrics */}
      <div className="px-6 mt-auto">
        <div className="p-4 bg-white rounded-2xl border border-outline-variant/40 shadow-sm">
          <p className="font-label-md text-xs font-bold text-primary mb-1.5 flex items-center gap-1.5">
            <ClipboardMinus className="w-4 h-4" />
            System Health
          </p>
          <div className="w-full bg-surface-container-high rounded-full h-2 mb-2">
            <div className="bg-secondary h-2 rounded-full w-[82%] transition-all duration-1000"></div>
          </div>
          <p className="text-on-surface-variant font-label-sm text-[11px] leading-none">
            82% Operational
          </p>
        </div>
      </div>
    </aside>
  );
}
