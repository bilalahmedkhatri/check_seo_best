import React from 'react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../animation_component';
import Footer from '../components/Footer';
import Header from '../components/Header';

// --- Reusable Icon Components ---
const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
);

// --- Hero Section Component ---
const HeroSection: React.FC = () => {
  const sectionRef = useScrollAnimation<HTMLDivElement>();
  return (
    <section ref={sectionRef} className="relative bg-gray-900 text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animated-dots"></div>
      <div className="relative w-full mx-auto max-w-6xl px-4 sm:px-6 md:px-8 min-h-screen flex items-center justify-center text-center">
        <div className="py-16">
          <div className="mb-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 animate-on-scroll fade-in">
            {['Capterra', 'G2', 'Google'].map((platform) => (
              <div key={platform} className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, j) => <StarIcon key={j} className="h-4 w-4" />)}
                </div>
                <span className="text-sm">4.9 on {platform}</span>
              </div>
            ))}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight animate-on-scroll fade-in delay-100">
            AI-Powered <span className="text-brand-primary">SEO & Content</span> Studio
          </h1>
          
          <p className="mt-6 text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto animate-on-scroll fade-in delay-200">
            Automate your SEO workflow from keyword research to content optimization. Outrank your competitors and drive measurable results with our all-in-one AI toolkit.
          </p>

          <div className="mt-8 w-full max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 animate-on-scroll fade-in delay-300">
            <input
              type="url"
              placeholder="Enter your website URL"
              className="w-full sm:w-80 bg-white/10 border border-gray-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors placeholder-gray-400"
            />
            <Link to="/seoAudit" className="w-full sm:w-auto bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-brand-primary transition-colors duration-200 btn-pulse flex-shrink-0">
              Get Your Free Audit
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Logo Carousel Component ---
const LogoCarousel: React.FC = () => {
    const logos = ['Asana', 'Mailchimp', 'Canva', 'Zapier', 'Zendesk', 'Buffer', 'Trello'];
    const duplicatedLogos = [...logos, ...logos]; // Duplicate for seamless scroll
  return (
    <section className="bg-gray-50 dark:bg-gray-800 py-12">
      <div className="w-full mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
        <p className="text-center text-gray-500 dark:text-gray-400 font-semibold mb-6">TRUSTED BY TEAMS AT LEADING COMPANIES</p>
        <div className="logo-carousel-container">
            <div className="logo-carousel">
                {duplicatedLogos.map((logo, index) => (
                    <div key={index} className="flex-shrink-0 mx-8 flex items-center justify-center h-12">
                        <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">{logo}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </section>
  );
};

// --- Features Grid Component ---
const features = [
  { icon: '🔍', title: 'Keyword Research', description: 'Uncover thousands of profitable keywords your competitors are missing.' },
  { icon: '📈', title: 'SERP Monitoring', description: 'Analyze top rankings and get AI-driven insights to climb to the top spot.' },
  { icon: '✍️', title: 'Content Briefs', description: 'Generate perfect, SEO-optimized content briefs for your writers in seconds.' },
  { icon: '🚀', title: 'On-Page Optimizer', description: 'Score your content and get actionable advice to improve your on-page SEO.' },
];

const FeaturesGrid: React.FC = () => {
  const sectionRef = useScrollAnimation<HTMLDivElement>();
  return (
    <section ref={sectionRef} className="py-20 bg-white dark:bg-gray-900">
      <div className="w-full mx-auto max-w-6xl px-4 sm:px-6 md:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 animate-on-scroll fade-in">The All-In-One SEO Toolkit</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12 animate-on-scroll fade-in delay-100">Everything you need to dominate the search results is right here.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={feature.title} className={`bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-on-scroll fade-in delay-${index * 100 + 200}`}>
              <div className="text-5xl mb-4" style={{ animation: `float 3s ease-in-out ${index * 0.2}s infinite` }}>{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Showcase Section Component ---
const ShowcaseSection: React.FC<{
  title: string;
  description: string;
  imageSide: 'left' | 'right';
}> = ({ title, description, imageSide }) => {
  const sectionRef = useScrollAnimation<HTMLDivElement>();
  const isImageLeft = imageSide === 'left';
  return (
    <section ref={sectionRef} className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="w-full mx-auto max-w-6xl px-4 sm:px-6 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className={`animate-on-scroll ${isImageLeft ? 'slide-in-left' : 'slide-in-right'} ${isImageLeft ? 'md:order-1' : 'md:order-2'}`}>
          <div className="bg-gray-200 dark:bg-gray-700 w-full h-80 rounded-lg shadow-2xl flex items-center justify-center">
             <span className="text-gray-400 dark:text-gray-500">Dashboard Screenshot</span>
          </div>
        </div>
        <div className={`animate-on-scroll ${isImageLeft ? 'slide-in-right' : 'slide-in-left'} ${isImageLeft ? 'md:order-2' : 'md:order-1'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">{description}</p>
        </div>
      </div>
    </section>
  );
};

// --- Testimonials Section ---
const testimonials = [
  { name: 'Sarah J.', role: 'Content Manager @ Shopify', quote: 'This tool has become indispensable for our content team. The AI-generated briefs are a huge time-saver and have dramatically improved our content quality.' },
  { name: 'Mike R.', role: 'SEO Specialist @ HubSpot', quote: 'The keyword strategist is a game-changer. We can now build topic clusters that actually establish authority and drive traffic for competitive terms.' },
  { name: 'Laura B.', role: 'Digital Marketer', quote: 'I was able to identify and fix critical SEO issues on my client sites within minutes. The audit tool is incredibly comprehensive yet easy to understand.' },
];
const Testimonials: React.FC = () => {
  const sectionRef = useScrollAnimation<HTMLDivElement>();
  return (
    <section ref={sectionRef} className="py-20 bg-white dark:bg-gray-900">
      <div className="w-full mx-auto max-w-6xl px-4 sm:px-6 md:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12 animate-on-scroll fade-in">Loved by Marketers Worldwide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <div key={t.name} className={`bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-lg animate-on-scroll scale-in delay-${index * 100 + 100}`}>
              <p className="text-gray-600 dark:text-gray-300 mb-6">"{t.quote}"</p>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{t.name}</p>
                <p className="text-sm text-brand-primary">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- CTA Section ---
const CTASection: React.FC = () => {
    const sectionRef = useScrollAnimation<HTMLDivElement>();
    return (
        <section ref={sectionRef} className="relative bg-gray-900 text-white overflow-hidden py-20">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animated-dots"></div>
            <div className="relative w-full mx-auto max-w-4xl px-4 sm:px-6 md:px-8 text-center">
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 animate-on-scroll fade-in">Ready to Boost Your SEO?</h2>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8 animate-on-scroll fade-in delay-100">
                    Stop guessing and start ranking. Get instant access to our full suite of AI-powered SEO tools and see the results for yourself.
                </p>
                <div className="animate-on-scroll fade-in delay-200">
                    <Link to="/keywordResearch" className="inline-block bg-brand-primary hover:bg-brand-secondary text-white font-bold py-4 px-10 text-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-brand-primary transition-all duration-300 transform hover:scale-105 btn-pulse">
                        Start Your Free 7-Day Trial
                    </Link>
                    <p className="mt-4 text-sm text-gray-400">No credit card required.</p>
                </div>
            </div>
        </section>
    );
};

// --- Main Landing Page Component ---
const LandingPage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900">
      <Header />
      <main>
        <HeroSection />
        <LogoCarousel />
        <FeaturesGrid />
        <ShowcaseSection 
          title="Discover Your Competitors' Secrets"
          description="Our SERP analysis tool deconstructs the top-ranking pages for any keyword, revealing their content strategies, backlink profiles, and on-page tactics. Use this data to reverse-engineer their success and create content that is destined to rank."
          imageSide="right"
        />
        <ShowcaseSection 
          title="Craft Content That Ranks, Every Time"
          description="Move beyond simple keyword stuffing. Our On-Page Optimizer and AI Content Brief generator work together to help you create comprehensive, high-quality content that satisfies both search engines and your audience. Establish topical authority and watch your rankings soar."
          imageSide="left"
        />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;