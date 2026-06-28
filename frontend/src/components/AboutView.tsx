import { Award, Leaf, ShieldCheck, Sprout, Users } from 'lucide-react';

export default function AboutView() {
  const values = ['Certified organic sourcing', 'Cold-chain freshness', 'Fair farm partnerships', 'Transparent quality checks'];
  const stats = [
    ['12K+', 'Happy customers'],
    ['80+', 'Local farms'],
    ['24 min', 'Avg express delivery'],
    ['99.2%', 'Quality acceptance']
  ];

  return (
    <div className="mx-auto mb-16 max-w-6xl px-4 py-10 text-left">
      <section className="rounded-[36px] border border-outline-variant/30 bg-white p-8 shadow-sm md:p-12 animate-rise-in">
        <p className="text-[11px] font-black uppercase tracking-wider text-primary">About Fresh Organic Market</p>
        <h1 className="mt-2 font-display text-4xl font-black leading-tight text-on-surface md:text-5xl">
          Organic groceries, handled with care from farm to doorstep.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-on-surface-variant">
          Fresh Organic Market connects households with responsibly grown produce, pantry staples, and daily essentials through a fast, transparent, and quality-first grocery experience.
        </p>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(([value, label]) => (
          <div key={label} className="rounded-3xl border border-outline-variant/30 bg-white p-5 shadow-sm">
            <p className="text-2xl font-black text-primary">{value}</p>
            <p className="mt-1 text-xs font-bold text-on-surface-variant">{label}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Info icon={Leaf} title="Mission" text="Make fresh organic food easier to access while supporting growers who care about soil health and responsible farming." />
        <Info icon={Sprout} title="Vision" text="Build the most trusted local grocery network for clean food, sustainable delivery, and transparent sourcing." />
        <Info icon={ShieldCheck} title="Quality Assurance" text="Every batch is checked for freshness, packaging integrity, source authenticity, and safe handling." />
      </section>

      <section className="mt-6 rounded-[32px] border border-outline-variant/30 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-black text-primary">Why Customers Choose Us</h2>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          {values.map((value) => (
            <div key={value} className="flex items-center gap-3 rounded-2xl bg-surface-container-low p-4">
              <Award className="h-5 w-5 text-secondary" />
              <span className="text-sm font-bold text-on-surface">{value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-[32px] border border-outline-variant/30 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-black text-primary">Our Team</h2>
        <p className="mt-3 text-sm leading-7 text-on-surface-variant">
          Our team includes sourcing specialists, quality managers, logistics coordinators, delivery partners, and customer support professionals working together to make grocery delivery dependable and delightful.
        </p>
        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-primary/5 p-4 text-primary">
          <Users className="h-6 w-6" />
          <span className="text-sm font-black">Built by people who care about food, farmers, and families.</span>
        </div>
      </section>
    </div>
  );
}

function Info({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return (
    <article className="rounded-[32px] border border-outline-variant/30 bg-white p-6 shadow-sm">
      <Icon className="mb-4 h-7 w-7 text-primary" />
      <h2 className="text-lg font-black text-on-surface">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-on-surface-variant">{text}</p>
    </article>
  );
}
