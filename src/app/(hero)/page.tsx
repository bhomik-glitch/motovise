import { BlogSection } from "@/components/BlogSection";
import { ComparisonTable } from "@/components/ComparisonTable";
import { CredibilitySection } from "@/components/CredibilitySection";
import { FaqSection } from "@/components/FaqSection";
import { FormulaStrip } from "@/components/FormulaStrip";
import { HeroSection } from "@/components/HeroSection";
import { NewsletterSection } from "@/components/NewsletterSection";
import { PreviewRow } from "@/components/PreviewRow";
import { VarietyPackSection } from "@/components/VarietyPackSection";
import { ProductScrollShowcase } from "@/components/home/ProductScrollShowcase";

import { landingContent } from "@/data/landingContent";

export default function HomePage() {
  return (
    <div className="pageShell">
      <HeroSection {...landingContent.hero} />
      <FormulaStrip {...landingContent.formulaStrip} />
      <PreviewRow
        eyebrow="Product Preview"
        title="Quick picks for steady momentum."
        description="Swipe the capsule lineup to explore flavors, formats, and the utility of each pouch."
      />

      {/* Product Scroll Showcase */}
      <ProductScrollShowcase />

      {/* Testimonial Section */}
      <section
        className="py-24 md:py-32 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #fdfcfb 0%, var(--color-surface) 100%)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-14 md:mb-16">
            <h2
              className="text-center text-2xl md:text-4xl font-bold"
              style={{
                letterSpacing: '-0.025em',
                lineHeight: '1.2',
                background: 'linear-gradient(135deg, var(--color-primary) 55%, var(--color-accent) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              What Drivers Say
            </h2>
          </div>

          <div className="relative">
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes infiniteScroll {
                0%   { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .animate-infinite-scroll {
                animation: infiniteScroll 40s linear infinite;
                will-change: transform;
              }
              .testimonial-track:hover .animate-infinite-scroll {
                animation-play-state: paused;
              }
              .testimonial-card {
                transition: transform 0.3s cubic-bezier(0.2, 0, 0.2, 1), box-shadow 0.3s ease;
                border: 1px solid rgba(1, 39, 62, 0.04);
              }
              .testimonial-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 15px 35px rgba(1, 39, 62, 0.09);
                border-color: rgba(1, 39, 62, 0.08);
              }
            `}} />

            {/* Left fade - Subtle Edge Fade */}
            <div
              className="pointer-events-none absolute left-0 top-0 h-full w-12 md:w-20 z-10"
              style={{ background: 'linear-gradient(to right, var(--color-surface), transparent)', opacity: 0.5 }}
            />
            {/* Right fade - Subtle Edge Fade */}
            <div
              className="pointer-events-none absolute right-0 top-0 h-full w-12 md:w-20 z-10"
              style={{ background: 'linear-gradient(to left, var(--color-surface), transparent)', opacity: 0.5 }}
            />

            <div className="testimonial-track overflow-hidden">
              <div className="flex gap-5 animate-infinite-scroll w-max px-2 py-4">
                {[
                  { name: "Rajesh Khanna", text: "Seamless connection every time. Finally free from the mess of wires in my Fortuner!", subtitle: "Toyota Fortuner / Delhi" },
                  { name: "Anita Sharma", text: "Truly a game changer. My Creta feels like a luxury car now with wireless CarPlay.", subtitle: "Hyundai Creta / Mumbai" },
                  { name: "Vikram Das", text: "The setup was so fast, literally took 10 seconds. Highly impressed with the zero lag.", subtitle: "Mahindra XUV700 / Bangalore" },
                  { name: "Sameer Patel", text: "Works perfectly with my Android Auto. Very stable and high build quality.", subtitle: "Tata Nexon / Ahmedabad" },
                  { name: "Priya Malhotra", text: "Best tech upgrade I've bought for my car. Fast shipping and excellent support.", subtitle: "Jeep Compass / Chandigarh" },
                  { name: "Rahul Verma", text: "Compact design and flawless performance. My Kia Seltos is wire-free now!", subtitle: "Kia Seltos / Pune" },
                  { name: "Arjun Singh", text: "The auto-connect feature is magic. By the time I start my engine, it's ready.", subtitle: "MG Hector / Gurgaon" },
                  { name: "Sneha Rao", text: "Highly recommended for every car owner. It just works as advertised. 5 stars!", subtitle: "Honda City / Chennai" },
                  // Duplicated for seamless infinite loop
                  { name: "Rajesh Khanna", text: "Seamless connection every time. Finally free from the mess of wires in my Fortuner!", subtitle: "Toyota Fortuner / Delhi" },
                  { name: "Anita Sharma", text: "Truly a game changer. My Creta feels like a luxury car now with wireless CarPlay.", subtitle: "Hyundai Creta / Mumbai" },
                  { name: "Vikram Das", text: "The setup was so fast, literally took 10 seconds. Highly impressed with the zero lag.", subtitle: "Mahindra XUV700 / Bangalore" },
                  { name: "Sameer Patel", text: "Works perfectly with my Android Auto. Very stable and high build quality.", subtitle: "Tata Nexon / Ahmedabad" },
                  { name: "Priya Malhotra", text: "Best tech upgrade I've bought for my car. Fast shipping and excellent support.", subtitle: "Jeep Compass / Chandigarh" },
                  { name: "Rahul Verma", text: "Compact design and flawless performance. My Kia Seltos is wire-free now!", subtitle: "Kia Seltos / Pune" },
                  { name: "Arjun Singh", text: "The auto-connect feature is magic. By the time I start my engine, it's ready.", subtitle: "MG Hector / Gurgaon" },
                  { name: "Sneha Rao", text: "Highly recommended for every car owner. It just works as advertised. 5 stars!", subtitle: "Honda City / Chennai" },
                ].map((review, idx) => (
                  <div
                    key={idx}
                    className="testimonial-card w-[272px] md:w-[330px] flex-shrink-0 p-6 rounded-2xl"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.78)',
                      backdropFilter: 'blur(6px)',
                      borderColor: 'var(--color-border)',
                      boxShadow: '0 0 24px rgba(1, 39, 62, 0.07)',
                    }}
                  >
                    <div className="flex gap-1 mb-3" style={{ color: 'var(--color-accent)' }}>
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    <p
                      className="text-sm md:text-base mb-5 leading-relaxed italic"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      "{review.text}"
                    </p>

                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
                        {review.name}
                      </span>
                      <span
                        className="text-xs font-mono uppercase"
                        style={{ color: 'var(--color-text-muted)', letterSpacing: '0.07em' }}
                      >
                        {review.subtitle}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <CredibilitySection {...landingContent.credibility} />
      <ComparisonTable {...landingContent.comparison} />
      <FaqSection {...landingContent.faq} />
      <div id="newsletter-section" style={{ scrollMarginTop: "68px" }}>
        <NewsletterSection {...landingContent.newsletter} />
      </div>
    </div>

  );
}
