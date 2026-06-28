import React, { useState } from 'react';
import { MapPin, Bell, UserCheck, ShieldAlert, Sparkles, MapPinCheck, LogOut, LogIn } from 'lucide-react';

interface HeaderProps {
  isAdminMode: boolean;
  onToggleAdminMode: (admin: boolean) => void;
  onNavigate: (view: string) => void;
  cartCount: number;
  currentUser: { name: string; email: string; avatar: string; isAdmin: boolean } | null;
  onLogout: () => void;
  notifications: string[];
  onClearNotifications: () => void;
}

export default function Header({
  isAdminMode,
  onToggleAdminMode,
  onNavigate,
  cartCount,
  currentUser,
  onLogout,
  notifications = [],
  onClearNotifications,
}: HeaderProps) {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('San Francisco, CA');
  const [newLocationInput, setNewLocationInput] = useState('');
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLocationInput.trim()) {
      setCurrentLocation(newLocationInput.trim());
      setShowLocationModal(false);
      setNewLocationInput('');
    }
  };

  return (
    <>
      <header className="glass-panel border-b border-white/70 sticky top-0 z-[100] shadow-sm supports-[backdrop-filter]:bg-white/80">
        <div className="flex justify-between items-center gap-2 px-3 sm:px-4 md:px-12 py-3 max-w-7xl mx-auto">
          {/* Brand/Location Section */}
          <div className="flex items-center gap-6">
            {!isAdminMode ? (
              <div 
                onClick={() => setShowLocationModal(true)}
                className="flex items-center gap-2 cursor-pointer group active:scale-95 transition-transform min-w-0"
                id="location-picker-btn"
              >
                <div className="bg-secondary-container p-2 rounded-full text-on-secondary-container transition-transform group-hover:scale-105 shrink-0 shadow-sm">
                  <MapPin className="w-5 h-5 text-on-secondary-container" fill="currentColor" />
                </div>
                <div className="hidden sm:block min-w-0">
                  <p className="text-[11px] text-on-surface-variant font-medium leading-none">Deliver to</p>
                  <p className="text-sm font-bold text-primary flex items-center gap-1 group-hover:underline truncate max-w-[150px] md:max-w-none">
                    {currentLocation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-xl">
                  <ShieldAlert className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[11px] text-on-surface-variant font-medium leading-none">Management</p>
                  <p className="text-sm font-bold text-primary">Harvest Control Room</p>
                </div>
              </div>
            )}
          </div>

          {/* Center Brand Name */}
          <div 
            onClick={() => onNavigate(isAdminMode ? 'admin-dashboard' : 'home')} 
            className="cursor-pointer group flex items-center gap-2 min-w-0"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold font-headline-md shadow-md shadow-primary/20 transition-transform duration-300 group-hover:scale-110 shrink-0">
              V
            </div>
            <h1 className="font-headline-md text-lg sm:text-xl md:text-2xl text-primary font-bold tracking-tight leading-tight">
              Verdant Harvest
            </h1>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            
            {/* Mode Switch Toggle */}
            {(currentUser?.isAdmin || isAdminMode) && (
              <div className="hidden sm:flex bg-surface-container-low p-1 rounded-full border border-outline-variant/50 shadow-inner mr-2">
                <button
                  onClick={() => {
                    onToggleAdminMode(false);
                    onNavigate('home');
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    !isAdminMode
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Store
                </button>
                <button
                  onClick={() => {
                    onToggleAdminMode(true);
                    onNavigate('admin-dashboard');
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    isAdminMode
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Admin
                </button>
              </div>
            )}

            {/* Profile Dropdown / Login Action */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div 
                  onClick={() => onNavigate('profile')}
                  className="flex items-center gap-2 cursor-pointer bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 px-2 sm:px-3 py-1.5 rounded-full shadow-sm transition-all active:scale-95"
                >
                  <div className="w-7 h-7 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center shadow-inner">
                    {currentUser.avatar}
                  </div>
                  <span className="text-xs font-bold text-on-surface hidden md:inline-block">
                    {currentUser.name.split(' ')[0]}
                  </span>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-2 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors duration-150 active:scale-95 cursor-pointer text-on-surface-variant"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="bg-primary hover:bg-primary-container text-white hover:text-primary border border-primary/20 px-3 sm:px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow transition-all duration-150 flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Notification Dropdown Container */}
            <div className="relative">
              <button 
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className="p-2 rounded-full hover:bg-surface-container transition-colors relative active:scale-95 duration-150 cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5 text-on-surface-variant" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-2 ring-white animate-pulse"></span>
                )}
              </button>

              {showNotificationsDropdown && (
                <div className="absolute right-0 mt-2 w-[min(18rem,calc(100vw-1.5rem))] bg-white rounded-2xl border border-outline-variant/50 shadow-2xl z-[150] p-4 space-y-3 animate-rise-in">
                  <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
                    <span className="font-bold text-xs text-primary">Notifications ({notifications.length})</span>
                    {notifications.length > 0 && (
                      <button 
                        onClick={() => {
                          onClearNotifications();
                          setShowNotificationsDropdown(false);
                        }}
                        className="text-[10px] font-bold text-error hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-[11px] text-on-surface-variant text-center py-4">No new notifications</p>
                    ) : (
                      notifications.map((notif, idx) => (
                        <div key={idx} className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/25 text-[11px] text-on-surface leading-normal text-left animate-fade-in">
                          {notif}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-outline-variant/30 animate-rise-in">
            <h3 className="font-headline-md text-xl text-primary font-bold mb-2 flex items-center gap-2">
              <MapPin className="text-secondary" /> Change Delivery Address
            </h3>
            <p className="text-sm text-on-surface-variant mb-4">
              Enter your current city or neighborhood to view local trending items and customize delivery time slots.
            </p>
            <form onSubmit={handleSaveLocation} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA"
                  value={newLocationInput}
                  onChange={(e) => setNewLocationInput(e.target.value)}
                  className="w-full h-12 pl-4 pr-10 rounded-xl border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                  autoFocus
                />
                <MapPinCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLocationModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-semibold bg-primary text-on-primary rounded-full hover:bg-primary-container transition-colors"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
