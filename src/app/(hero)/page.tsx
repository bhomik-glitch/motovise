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
        className="py-20 md:py-28 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #02060a 0%, #040d14 60%, #02060a 100%)',
        }}
      >
        <div className="max-w-6xl mx-auto px-8">
          <div className="mb-12 md:mb-14">
            <h2
              className="text-center text-2xl md:text-4xl font-bold"
              style={{
                letterSpacing: '-0.025em',
                lineHeight: '1.2',
                color: 'var(--color-text-inverse)',
                opacity: 0.9,
              }}
            >
              What Drivers Say
            </h2>
          </div>
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
              transition: transform 0.3s cubic-bezier(0.2, 0, 0.2, 1), box-shadow 0.3s ease, border-color 0.3s ease;
              border: 1px solid rgba(255, 255, 255, 0.06);
            }
            .testimonial-card:hover {
              transform: translateY(-3px);
              box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 139, 250, 0.2);
              border-color: rgba(0, 139, 250, 0.2);
            }
          `}} />

          {/* Left edge fade */}
          <div
            className="pointer-events-none absolute left-0 top-0 h-full w-16 md:w-32 z-10"
            style={{ background: 'linear-gradient(to right, #02060a 0%, transparent 100%)' }}
          />
          {/* Right edge fade */}
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-16 md:w-32 z-10"
            style={{ background: 'linear-gradient(to left, #02060a 0%, transparent 100%)' }}
          />

          <div className="testimonial-track overflow-hidden">
            <div className="flex gap-4 animate-infinite-scroll w-max px-4 py-6">
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
                  className="testimonial-card w-[272px] md:w-[320px] flex-shrink-0 p-6 rounded-3xl"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <div className="flex gap-1 mb-4" style={{ color: 'var(--color-accent)', opacity: 0.8 }}>
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <p
                    className="text-sm mb-5 italic"
                    style={{ color: 'var(--color-text-inverse)', opacity: 0.55, lineHeight: '1.7' }}
                  >
                    {`"${review.text}"`}
                  </p>

                  <div className="flex flex-col gap-1">
                    <span
                      className="font-semibold text-sm"
                      style={{ color: 'var(--color-text-inverse)', opacity: 0.9 }}
                    >
                      {review.name}
                    </span>
                    <span
                      className="text-xs font-mono uppercase"
                      style={{ color: 'var(--color-text-inverse)', opacity: 0.3, letterSpacing: '0.08em' }}
                    >
                      {review.subtitle}
                    </span>
                  </div>
                </div>
              ))}
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
