import { useEffect, useState } from 'react';
import { Mail, Phone, RefreshCw } from 'lucide-react';
import { contactApi } from '../api.js';
import { ContactMessage } from '../types';

export default function AdminContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  const load = async () => {
    const res = await contactApi.getAll();
    setMessages(res.data);
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const updateStatus = async (id: string, status: ContactMessage['status']) => {
    const res = await contactApi.updateStatus(id, status);
    setMessages((prev) => prev.map((message) => (message.id === id ? res.data : message)));
  };

  return (
    <div className="space-y-6 pb-16 text-left">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-primary">Customer Support</p>
          <h1 className="font-display text-3xl font-black text-on-surface">Contact Messages</h1>
          <p className="mt-1 text-sm text-on-surface-variant">Messages submitted from the Contact Us page.</p>
        </div>
        <button onClick={load} className="rounded-full border border-outline-variant/30 bg-white p-3 text-primary">
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {messages.map((message) => (
          <article key={message.id} className="rounded-[28px] border border-outline-variant/30 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-black text-primary">{message.subject}</p>
                <p className="mt-1 text-sm font-bold text-on-surface">{message.name}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-on-surface-variant">
                  <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {message.email}</span>
                  {message.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {message.phone}</span>}
                </div>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase text-primary">{message.status}</span>
            </div>
            <p className="mt-4 rounded-2xl bg-surface-container-low p-4 text-sm leading-relaxed text-on-surface-variant">{message.message}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(['Read', 'Resolved'] as ContactMessage['status'][]).map((status) => (
                <button key={status} onClick={() => updateStatus(message.id, status)} className="rounded-full bg-primary px-4 py-2 text-[10px] font-black uppercase text-white">
                  Mark {status}
                </button>
              ))}
            </div>
          </article>
        ))}
        {messages.length === 0 && (
          <div className="rounded-3xl border border-dashed border-outline-variant/50 bg-white p-10 text-center text-sm font-bold text-on-surface-variant">
            No contact messages yet.
          </div>
        )}
      </div>
    </div>
  );
}
