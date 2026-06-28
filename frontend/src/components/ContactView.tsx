import { useState } from 'react';
import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import { contactApi } from '../api.js';

export default function ContactView() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('');
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (form.message.trim().length < 10) {
      setError('Message must be at least 10 characters.');
      return;
    }
    const res = await contactApi.submit(form);
    setStatus(res.message);
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div className="mx-auto mb-16 max-w-6xl px-4 py-10 text-left">
      <section className="rounded-[36px] border border-outline-variant/30 bg-white p-8 shadow-sm md:p-12 animate-rise-in">
        <p className="text-[11px] font-black uppercase tracking-wider text-primary">Contact Us</p>
        <h1 className="mt-2 font-display text-4xl font-black text-on-surface">We are here to help.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-on-surface-variant">
          Questions about orders, delivery, refunds, partnerships, or organic sourcing? Send us a message and our support team will respond soon.
        </p>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <form onSubmit={submit} className="rounded-[32px] border border-outline-variant/30 bg-white p-6 shadow-sm lg:col-span-3">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              ['name', 'Name'],
              ['email', 'Email'],
              ['phone', 'Phone'],
              ['subject', 'Subject']
            ].map(([key, label]) => (
              <input
                key={key}
                required={key !== 'phone'}
                value={(form as any)[key]}
                onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
                placeholder={label}
                className="rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm font-bold outline-none focus:border-primary"
              />
            ))}
          </div>
          <textarea
            required
            value={form.message}
            onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
            placeholder="Message"
            rows={6}
            className="mt-4 w-full rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm font-bold outline-none focus:border-primary"
          />
          {error && <p className="mt-3 text-xs font-bold text-error">{error}</p>}
          {status && <p className="mt-3 text-xs font-bold text-secondary">{status}</p>}
          <button className="mt-5 rounded-full bg-primary px-6 py-3 text-xs font-black uppercase tracking-wider text-white">
            <Send className="mr-2 inline h-4 w-4" /> Send Message
          </button>
        </form>

        <aside className="space-y-4 lg:col-span-2">
          <div className="rounded-[32px] border border-outline-variant/30 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-primary">Office</h2>
            <Info icon={MapPin} text="452 Organic Meadows Lane, San Francisco, CA 94103" />
            <Info icon={Phone} text="+1 800 FRESH FM" />
            <Info icon={Mail} text="support@freshorganicmarket.com" />
            <Info icon={Clock} text="Mon-Sat, 8:00 AM - 9:00 PM" />
          </div>
          <div className="flex aspect-video items-center justify-center rounded-[32px] border border-dashed border-outline-variant bg-surface-container-low text-sm font-black text-on-surface-variant">
            Google Maps Location Placeholder
          </div>
        </aside>
      </div>
    </div>
  );
}

function Info({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="mt-4 flex items-start gap-3 text-sm font-semibold text-on-surface-variant">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <span>{text}</span>
    </div>
  );
}
