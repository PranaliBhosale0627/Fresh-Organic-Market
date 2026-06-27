import { useState } from 'react';
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronUp, MapPin, MessageSquare, PhoneCall, ShoppingCart } from 'lucide-react';
import { Order } from '../types';

interface OrderTrackingViewProps {
  order: Order;
  onNavigate: (view: string) => void;
}

export default function OrderTrackingView({
  order,
  onNavigate,
}: OrderTrackingViewProps) {
  const [showItems, setShowItems] = useState(false);

  // Active status calculations for stepper colors
  const getStatusColor = (stageCompleted: boolean) => {
    return stageCompleted ? 'bg-primary text-white' : 'bg-surface-container-high text-outline-variant';
  };

  const getLineColor = (stageCompleted: boolean) => {
    return stageCompleted ? 'bg-primary' : 'bg-outline-variant/30';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 mb-24 text-left space-y-8">
      {/* Top action app bar */}
      <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('home')}
            className="active:scale-95 duration-150 hover:bg-surface-container-low transition-colors rounded-full p-2 text-primary"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-headline-md text-primary font-bold">Track Order {order.id}</h1>
        </div>
        <span className="bg-primary/15 text-primary px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider">
          {order.status}
        </span>
      </div>

      {/* Hero success message */}
      <div className="bg-primary-container text-on-primary-container rounded-3xl p-6 md:p-8 flex items-center gap-5 border border-primary/20 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,_rgba(255,255,255,0.15)_0%,_transparent_100%)]"></div>
        <CheckCircle2 className="w-12 h-12 text-primary shrink-0 stroke-[2.5px]" />
        <div>
          <h2 className="font-headline-md text-lg md:text-xl font-bold text-primary-fixed">Order Confirmed!</h2>
          <p className="text-xs md:text-sm text-primary-fixed/90 leading-relaxed mt-0.5">
            Your fresh box is being managed by our growers. Estimated arrival at your doorstep: <strong className="text-white">{order.deliveryTimeSlot}</strong>
          </p>
        </div>
      </div>

      {/* Main Grid: Map & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive map mockup */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-md border border-outline-variant/30 aspect-[4/3] md:aspect-[16/10] bg-surface-container-low">
            {/* Custom high-fidelity drawing vector style map */}
            <div className="absolute inset-0 bg-emerald-50">
              {/* Grid roads */}
              <div className="absolute top-1/4 left-0 w-full h-8 bg-white border-y border-outline-variant/20 -rotate-1"></div>
              <div className="absolute top-2/3 left-0 w-full h-10 bg-white border-y border-outline-variant/20 rotate-2"></div>
              <div className="absolute left-1/3 top-0 w-8 h-full bg-white border-x border-outline-variant/20 -rotate-2"></div>
              <div className="absolute left-2/3 top-0 w-10 h-full bg-white border-x border-outline-variant/20 rotate-1"></div>
              
              {/* Organic Farm zone overlay */}
              <div className="absolute top-4 left-6 bg-emerald-600/10 border border-emerald-600/20 px-4 py-2 rounded-2xl flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-ping"></span>
                <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Verdant Hub</span>
              </div>

              {/* Transit green route highlight */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M 120, 80 L 190, 180 L 320, 190 Q 380, 240 420, 310" 
                  fill="none" 
                  stroke="#2d5a27" 
                  strokeWidth="6" 
                  strokeLinecap="round"
                  strokeDasharray="10, 8"
                  className="animate-[dash_20s_linear_infinite]"
                />
              </svg>

              {/* Delivery destination marker */}
              <div className="absolute top-[310px] left-[420px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                <div className="bg-primary text-white p-2.5 rounded-full shadow-lg border-2 border-white animate-bounce">
                  <MapPin className="w-5 h-5 text-white" fill="currentColor" />
                </div>
                <div className="bg-white px-2 py-0.5 rounded-md shadow text-[9px] font-bold text-primary mt-1 border border-outline-variant/20 whitespace-nowrap">
                  Home (You)
                </div>
              </div>

              {/* Moving Courier Rider */}
              <div className="absolute top-[180px] left-[190px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                <div className="bg-secondary text-white p-2 rounded-full shadow-lg border-2 border-white">
                  🛵
                </div>
                <div className="bg-secondary text-white px-2.5 py-0.5 rounded-full shadow text-[9px] font-bold mt-1 whitespace-nowrap">
                  Courier En-route
                </div>
              </div>
            </div>

            {/* Rider overlay panel */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between border border-outline-variant/30 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-surface-container rounded-full flex items-center justify-center font-bold text-xs text-primary ring-2 ring-primary/10">
                  {order.customerAvatar || 'ES'}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface">Jack Thompson</h4>
                  <p className="text-[10px] text-on-surface-variant font-medium mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span> Eco-Rider • 4.9⭐ (1.2k trips)
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => alert("Calling Jack (+1-800-ORGANIC)...")}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container-low hover:bg-surface-container transition-colors active:scale-90"
                >
                  <PhoneCall className="w-4 h-4 text-on-surface-variant" />
                </button>
                <button 
                  onClick={() => alert("Opening chat with Jack...")}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-on-primary hover:bg-primary-container transition-colors active:scale-90"
                >
                  <MessageSquare className="w-4 h-4 text-on-primary" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Detailed timelines status stepper */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-outline-variant/30 shadow-sm space-y-6">
            <h3 className="font-bold text-base text-on-surface">Timeline Tracker</h3>
            
            <div className="relative pl-6 space-y-6">
              {/* Stepper line */}
              <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-outline-variant/30 z-0"></div>

              {order.timeline.map((step, idx) => {
                const nextStep = order.timeline[idx + 1];
                const lineActive = step.completed && (nextStep ? nextStep.completed : false);
                
                return (
                  <div key={idx} className="relative z-10 flex gap-4 text-left">
                    {/* Circle bullet */}
                    <div className="absolute -left-[23px] top-1">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] border border-white shadow-sm ${getStatusColor(step.completed)}`}>
                        {step.completed ? '✓' : idx + 1}
                      </div>
                    </div>

                    <div className="flex-grow">
                      <div className="flex justify-between items-baseline">
                        <h4 className={`font-bold text-sm ${step.completed ? 'text-primary' : 'text-on-surface-variant'}`}>
                          {step.stage}
                        </h4>
                        <span className="text-[10px] text-on-surface-variant font-bold">{step.time}</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Collapsible Order items */}
          <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
            <button
              onClick={() => setShowItems(!showItems)}
              className="w-full px-5 py-4 flex items-center justify-between font-bold text-sm text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <span className="flex items-center gap-2">
                <ShoppingCart className="w-4.5 h-4.5 text-primary" />
                Review Purchased Items
              </span>
              {showItems ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showItems && (
              <div className="px-5 pb-5 pt-2 border-t border-outline-variant/10 divide-y divide-outline-variant/20 space-y-3">
                {order.items.map((it, index) => (
                  <div key={index} className="flex justify-between items-center text-xs pt-3 first:pt-0">
                    <div>
                      <p className="font-bold text-on-surface">{it.productName}</p>
                      <p className="text-[11px] text-on-surface-variant font-medium">Qty: {it.quantity} x ${it.price.toFixed(2)}</p>
                    </div>
                    <span className="font-bold text-primary">${(it.quantity * it.price).toFixed(2)}</span>
                  </div>
                ))}
                <div className="pt-3 flex justify-between items-center text-xs font-bold text-primary">
                  <span>Grand Total</span>
                  <span className="text-sm">${order.total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Continue Shopping Button */}
          <button
            onClick={() => onNavigate('home')}
            className="w-full bg-secondary-container text-on-secondary-container py-4 rounded-full font-bold text-sm hover:brightness-95 transition-all active:scale-95 duration-150 border border-secondary-container/20"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
