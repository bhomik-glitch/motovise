'use client';

interface ShowcaseFeature {
  label: string;
  d: string;
}

interface ShowcaseProduct {
  slug: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  price: string;
  emi: string;
  features: ShowcaseFeature[];
}

const PRODUCTS: ShowcaseProduct[] = [
  {
    slug: 'duo-connectx',
    badge: 'Top Spec',
    title: 'Duo ConnectX\nWireless Adapter',
    subtitle: 'Zero-wire. Zero-lag. Full CarPlay.',
    description:
      'Plug in once — connect forever. The Duo ConnectX auto-pairs every time you start your car, delivering HD wireless CarPlay and Android Auto without a single cable.',
    image: '/bg-remove-product-thumbnail/remove-bg-product-1.png',
    price: '₹4,999',
    emi: '₹417/mo with no-cost EMI',
    features: [
      { label: 'Fast Connect', d: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' },
      { label: 'Stable Signal', d: 'M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z' },
      { label: 'Plug & Play', d: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z' },
      { label: 'Wireless', d: 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0' },
      { label: 'HD Output', d: 'M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z' },
      { label: 'Auto Pair', d: 'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244' },
    ],
  },
  {
    slug: 'dashcam-pro',
    badge: 'Best Seller',
    title: 'Dashcam Pro\nSafety Kit',
    subtitle: 'See everything. Miss nothing.',
    description:
      'Complete front & rear coverage with 4K resolution, advanced night vision, and G-sensor accident detection. Your undeniable shield on every road.',
    image: '/bg-remove-product-thumbnail/remove-bg-product-3.png',
    price: '₹13,999',
    emi: '₹1,167/mo with no-cost EMI',
    features: [
      { label: '4K Clarity', d: 'M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z' },
      { label: 'Night Vision', d: 'M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z' },
      { label: 'G-Sensor', d: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' },
      { label: 'Loop Rec', d: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99' },
      { label: 'WiFi', d: 'M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z' },
      { label: 'Wide Angle', d: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z' },
    ],
  },
  {
    slug: 'playbox-max',
    badge: 'Premium',
    title: 'Playbox Max\nVideo Box',
    subtitle: 'Your car screen, reimagined.',
    description:
      'The ultimate car upgrade — 10.26" UHD display with 4K loop recording, wireless CarPlay, Android Auto, and real-time GPS navigation.',
    image: '/bg-remove-product-thumbnail/remove-bg-product-2.png',
    price: '₹19,999',
    emi: '₹1,667/mo with no-cost EMI',
    features: [
      { label: '4K Record', d: 'M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z' },
      { label: 'CarPlay', d: 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0' },
      { label: 'GPS Nav', d: 'M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c-.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z' },
      { label: 'Night Vision', d: 'M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z' },
    ],
  },
];

// ─── Shared helpers ───────────────────────────────────────────────────────────

function FeatureIcon({ feature }: { feature: ShowcaseFeature }) {
  return (
    <div className="flex flex-col items-center gap-1.5 opacity-80">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(0,139,250,0.12)', border: '1px solid rgba(0,139,250,0.2)' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="#60c0ff"
          className="w-4 h-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={feature.d} />
        </svg>
      </div>
      <span
        className="text-[10px] font-medium text-center leading-tight"
        style={{ color: 'rgba(237,235,228,0.65)' }}
      >
        {feature.label}
      </span>
    </div>
  );
}

const CARD_BASE_STYLE: React.CSSProperties = {
  backgroundImage: "url('/hero-section-product-bg-img.jpeg')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  borderRadius: '20px',
  transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease',
  boxShadow: '0 0 0 1px rgba(0,139,250,0.08)',
};

const OVERLAY: React.CSSProperties = {
  background: 'linear-gradient(160deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.38) 100%)',
};

function hoverOn(el: HTMLDivElement) {
  el.style.transform = 'scale(1.02)';
  el.style.boxShadow = '0 0 48px rgba(0,139,250,0.2), 0 0 0 1px rgba(0,139,250,0.22)';
}
function hoverOff(el: HTMLDivElement) {
  el.style.transform = 'scale(1)';
  el.style.boxShadow = '0 0 0 1px rgba(0,139,250,0.08)';
}

// ─── Primary card (large, left column) ───────────────────────────────────────

function PrimaryCard({ product }: { product: ShowcaseProduct }) {
  return (
    <div
      className="relative overflow-hidden border border-white/10"
      style={{ ...CARD_BASE_STYLE, height: '100%', minHeight: '560px' }}
      onMouseEnter={(e) => hoverOn(e.currentTarget)}
      onMouseLeave={(e) => hoverOff(e.currentTarget)}
    >
      <div className="absolute inset-0" style={OVERLAY} />

      <div className="relative z-10 grid grid-cols-2 items-center gap-8 px-10 py-12 lg:px-14 lg:py-14">
        {/* Image */}
        <div className="flex items-center justify-center">
          <img
            src={product.image}
            alt={product.title.replace('\n', ' ')}
            className="w-full object-contain"
            style={{ maxWidth: '400px', filter: 'drop-shadow(0 32px 48px rgba(0,139,250,0.22))' }}
          />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-5">
          <span
            className="inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(0,139,250,0.18)', color: '#60c0ff', border: '1px solid rgba(0,139,250,0.3)' }}
          >
            {product.badge}
          </span>

          <h2
            className="text-4xl lg:text-5xl font-semibold leading-tight"
            style={{ color: 'var(--color-text-inverse)', letterSpacing: '-0.02em', whiteSpace: 'pre-line' }}
          >
            {product.title}
          </h2>

          <p className="text-base font-semibold" style={{ color: '#60c0ff' }}>
            {product.subtitle}
          </p>

          <p className="text-sm leading-relaxed" style={{ color: 'rgba(237,235,228,0.72)', maxWidth: '360px' }}>
            {product.description}
          </p>

          <div className="grid grid-cols-3 gap-4" style={{ maxWidth: '320px' }}>
            {product.features.map((f) => <FeatureIcon key={f.label} feature={f} />)}
          </div>

          <div className="flex flex-col gap-2 mt-1">
            <span className="text-3xl font-bold" style={{ color: 'var(--color-text-inverse)' }}>
              {product.price}
            </span>
            <p className="text-xs" style={{ color: 'rgba(237,235,228,0.5)' }}>
              {product.emi}
            </p>
            <div className="flex gap-3 mt-2">
              <a
                href="/products"
                className="inline-flex items-center justify-center h-11 rounded-xl px-8 text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                style={{ background: 'var(--color-accent)', color: '#fff', boxShadow: '0 4px 20px rgba(0,139,250,0.35)' }}
              >
                Buy Now
              </a>
              <a
                href={`/product/${product.slug}`}
                className="inline-flex items-center justify-center h-11 rounded-xl px-8 text-sm font-semibold transition-all duration-200 hover:bg-white/10 active:scale-[0.98]"
                style={{ color: 'var(--color-text-inverse)', border: '1px solid rgba(237,235,228,0.25)' }}
              >
                View Details
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Secondary card (compact, right column) ───────────────────────────────────

function SecondaryCard({ product }: { product: ShowcaseProduct }) {
  return (
    <div
      className="relative overflow-hidden border border-white/10 flex-1"
      style={{ ...CARD_BASE_STYLE, minHeight: 0 }}
      onMouseEnter={(e) => hoverOn(e.currentTarget)}
      onMouseLeave={(e) => hoverOff(e.currentTarget)}
    >
      <div className="absolute inset-0" style={OVERLAY} />

      <div className="relative z-10 flex items-center gap-6 px-7 py-7 h-full">
        {/* Image */}
        <div className="flex-shrink-0">
          <img
            src={product.image}
            alt={product.title.replace('\n', ' ')}
            className="object-contain"
            style={{
              width: '120px',
              height: '120px',
              filter: 'drop-shadow(0 12px 20px rgba(0,139,250,0.2))',
            }}
          />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-2.5 min-w-0">
          <span
            className="inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest"
            style={{ background: 'rgba(0,139,250,0.18)', color: '#60c0ff', border: '1px solid rgba(0,139,250,0.3)' }}
          >
            {product.badge}
          </span>

          <h3
            className="text-xl font-semibold leading-tight"
            style={{ color: 'var(--color-text-inverse)', letterSpacing: '-0.02em', whiteSpace: 'pre-line' }}
          >
            {product.title}
          </h3>

          <p className="text-xs font-semibold" style={{ color: '#60c0ff' }}>
            {product.subtitle}
          </p>

          <div className="flex flex-wrap gap-1.5 mt-0.5">
            {product.features.slice(0, 4).map((f) => (
              <span
                key={f.label}
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: 'rgba(0,139,250,0.1)',
                  color: 'rgba(237,235,228,0.7)',
                  border: '1px solid rgba(0,139,250,0.15)',
                }}
              >
                {f.label}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-1">
            <span className="text-xl font-bold" style={{ color: 'var(--color-text-inverse)' }}>
              {product.price}
            </span>
            <a
              href={`/product/${product.slug}`}
              className="inline-flex items-center justify-center h-8 rounded-lg px-4 text-xs font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{ background: 'var(--color-accent)', color: '#fff', boxShadow: '0 4px 12px rgba(0,139,250,0.3)' }}
            >
              Shop Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Banner card (full-width bottom) ─────────────────────────────────────────

function BannerCard() {
  const features = ['Plug & Play', 'Stable Connection', 'Compact Design', 'Seamless Performance'];
  return (
    <div
      className="relative overflow-hidden w-full"
      style={{
        ...CARD_BASE_STYLE,
        minHeight: '280px',
      }}
      onMouseEnter={(e) => hoverOn(e.currentTarget)}
      onMouseLeave={(e) => hoverOff(e.currentTarget)}
    >
      {/* Background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/Motovise Imges/sleek metallic wireless adapter device (1).png')",
          backgroundSize: 'cover',
          backgroundPosition: 'right center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Left-to-right dark gradient so text is readable */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to right, rgba(4,8,20,0.92) 0%, rgba(4,8,20,0.75) 45%, rgba(4,8,20,0.15) 75%, transparent 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center gap-6 px-10 py-12 lg:px-14" style={{ maxWidth: '560px' }}>
        {/* Badge */}
        <span
          className="inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest"
          style={{ background: 'rgba(0,139,250,0.18)', color: '#60c0ff', border: '1px solid rgba(0,139,250,0.3)' }}
        >
          Featured
        </span>

        {/* Title */}
        <h2
          className="text-3xl lg:text-4xl font-semibold leading-tight"
          style={{ color: 'var(--color-text-inverse)', letterSpacing: '-0.02em' }}
        >
          Wireless Connectivity<br />Made Simple
        </h2>

        {/* Feature bullets */}
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {features.map((f) => (
            <div key={f} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#60c0ff' }} />
              <span className="text-sm" style={{ color: 'rgba(237,235,228,0.75)' }}>{f}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div>
          <a
            href="/products"
            className="inline-flex items-center justify-center h-10 rounded-xl px-7 text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'var(--color-accent)', color: '#fff', boxShadow: '0 4px 20px rgba(0,139,250,0.35)' }}
          >
            Shop Now
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Bento grid ───────────────────────────────────────────────────────────────

export function ProductScrollShowcase() {
  const [primary, secondary1, secondary2] = PRODUCTS;

  return (
    <section className="w-full px-3 sm:px-4 py-10">

      {/* Mobile: single column stack */}
      <div className="flex flex-col gap-3 lg:hidden">
        <div className="h-auto">
          <PrimaryCard product={primary} />
        </div>
        <SecondaryCard product={secondary1} />
        <SecondaryCard product={secondary2} />
        <BannerCard />
      </div>

      {/* Desktop: full-bleed bento grid */}
      <div
        className="hidden lg:grid gap-3 items-stretch w-full"
        style={{
          gridTemplateColumns: '2fr 1fr',
          gridTemplateRows: 'auto auto auto',
        }}
      >
        {/* Primary card: spans both rows on the left */}
        <div style={{ gridRow: '1 / 3', minHeight: 0 }}>
          <PrimaryCard product={primary} />
        </div>

        {/* Secondary cards: each takes one row on the right */}
        <SecondaryCard product={secondary1} />
        <SecondaryCard product={secondary2} />

        {/* Banner: spans full width (both columns) */}
        <div style={{ gridColumn: '1 / -1' }}>
          <BannerCard />
        </div>
      </div>

    </section>
  );
}
