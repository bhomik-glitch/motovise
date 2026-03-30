'use client';

import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/ScrollReveal';

export function TrustSection() {
  const reviews = [
    {
      id: 1,
      name: 'James L.',
      text: 'The difference in handling is night and day. Premium quality that actually delivers on the track.',
      rating: 5,
    },
    {
      id: 2,
      name: 'Sarah M.',
      text: 'Beautifully engineered components. You can feel the precision the moment you install them.',
      rating: 5,
    },
    {
      id: 3,
      name: 'David R.',
      text: 'Worth every penny. The build quality exceeds OEM specs and looks incredible.',
      rating: 5,
    }
  ];

  return (
    <section className="py-32 relative bg-black/60 overflow-hidden isolate" id="trust">
      <div className="absolute inset-0 z-[-1] pointer-events-none p-[1px] bg-gradient-to-b from-transparent via-[var(--color-accent)]/5 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />
      
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <ScrollReveal className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent)] mb-4 block">Trusted by Enthusiasts</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--color-text-inverse)] uppercase tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            10,000+ Drivers Upgraded
          </h2>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <StaggerItem key={review.id} className="relative p-[1px] rounded-2xl bg-gradient-to-b from-[var(--color-border)] to-transparent overflow-hidden group">
              <div className="absolute inset-0 bg-[var(--color-accent)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="bg-[var(--color-surface-strong)] h-full p-8 rounded-2xl flex flex-col justify-between hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-shadow">
                <div>
                  <div className="flex gap-1 text-[var(--color-accent)] mb-6 text-sm">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-lg text-[var(--color-text-inverse)] mb-8 leading-relaxed font-medium">{`"${review.text}"`}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-border)] to-[var(--color-surface-dim)] flex items-center justify-center text-[var(--color-text-muted)] font-bold text-xs uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
                    {review.name[0]}
                  </div>
                  <span className="text-sm font-semibold text-[var(--color-text-muted)] tracking-wider uppercase">{review.name}</span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
