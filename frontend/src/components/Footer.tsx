import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const links = [
    ['About Us', 'about'],
    ['Contact Us', 'contact'],
    ['FAQs', 'contact'],
    ['Help Center', 'contact'],
    ['Privacy Policy', 'about'],
    ['Terms & Conditions', 'about'],
    ['Refund Policy', 'about'],
    ['Careers', 'contact']
  ];

  return (
    <footer className="mt-12 border-t border-outline-variant/30 bg-[#102513] text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-5 py-10 md:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-fixed font-black text-primary">V</div>
            <div>
              <p className="text-lg font-black">Verdant Harvest</p>
              <p className="text-xs text-white/60">Fresh Organic Market</p>
            </div>
          </div>
          <p className="text-sm leading-6 text-white/65">
            Organic groceries, fast delivery, trusted sourcing, and caring support for every household.
          </p>
          <div className="flex gap-2">
            {[Instagram, Facebook, Twitter, Linkedin].map((Icon, index) => (
              <span key={index} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
                <Icon className="h-4 w-4" />
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-primary-fixed">Company</h3>
          <div className="grid grid-cols-1 gap-2">
            {links.map(([label, view]) => (
              <button key={label} onClick={() => onNavigate(view)} className="w-fit text-sm font-semibold text-white/65 transition hover:text-white">
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-primary-fixed">Contact</h3>
          <div className="space-y-3 text-sm text-white/70">
            <p className="flex gap-2"><MapPin className="h-4 w-4 text-primary-fixed" /> 452 Organic Meadows Lane, San Francisco, CA</p>
            <p className="flex gap-2"><Phone className="h-4 w-4 text-primary-fixed" /> +1 800 FRESH FM</p>
            <p className="flex gap-2"><Mail className="h-4 w-4 text-primary-fixed" /> support@freshorganicmarket.com</p>
            <p>Business Hours: Mon-Sat, 8 AM - 9 PM</p>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-primary-fixed">Newsletter</h3>
          <p className="mb-4 text-sm text-white/65">Get seasonal produce drops, offers, and healthy recipes.</p>
          <div className="flex overflow-hidden rounded-full bg-white">
            <input placeholder="Email address" className="min-w-0 flex-1 px-4 py-3 text-sm font-bold text-on-surface outline-none" />
            <button className="bg-primary px-5 text-xs font-black uppercase text-white">Join</button>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-4 text-center text-xs font-semibold text-white/50">
        Copyright 2026 Fresh Organic Market. All rights reserved.
      </div>
    </footer>
  );
}
