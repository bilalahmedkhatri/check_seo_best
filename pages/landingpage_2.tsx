import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../animation_component';
import { useTheme } from '../contexts/ThemeContext';
import anime from 'animejs';

// --- Reusable Icon Components ---
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>;
const ArrowUpIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>;
const StarIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>;

// --- Custom Hooks for Advanced Functionality ---
const useTypingEffect = (text: string, duration: number) => {
    const [typedText, setTypedText] = useState('');
    useEffect(() => {
        if (typedText.length < text.length) {
            const timeout = setTimeout(() => {
                setTypedText(text.slice(0, typedText.length + 1));
            }, duration);
            return () => clearTimeout(timeout);
        }
    }, [typedText, text, duration]);
    return typedText;
};

const useCountUp = (target: number, duration = 2000) => {
    const [count, setCount] = useState(0);
    const countRef = useScrollAnimation<HTMLSpanElement>();

    useEffect(() => {
        const element = countRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    let start = 0;
                    const end = target;
                    if (start === end) return;

                    const incrementTime = (duration / end);
                    const timer = setInterval(() => {
                        start += 1;
                        setCount(start);
                        if (start === end) clearInterval(timer);
                    }, incrementTime);
                    observer.disconnect();
                }
            }, { threshold: 0.7 }
        );
        observer.observe(element);
        return () => observer.disconnect();
    }, [target, duration, countRef]);

    return [count, countRef] as const;
};

// --- Particle Canvas Component ---
const ParticleCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: any[] = [];
        const particleCount = 50;

        const setCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createParticles = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: Math.random() * 0.5 - 0.25,
                    vy: Math.random() * 0.5 - 0.25,
                    radius: Math.random() * 1.5 + 0.5,
                });
            }
        };
        
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(animate);
        };
        
        setCanvasSize();
        createParticles();
        animate();
        
        window.addEventListener('resize', setCanvasSize);
        window.addEventListener('resize', createParticles);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', setCanvasSize);
            window.removeEventListener('resize', createParticles);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />;
};


// --- UI Components ---
const ScrollProgressBar = () => {
    const [scroll, setScroll] = useState(0);

    const onScroll = () => {
        const doc = document.documentElement;
        const winScroll = doc.scrollTop;
        const height = doc.scrollHeight - doc.clientHeight;
        const scrolled = (winScroll / height) * 100;
        setScroll(scrolled);
    };

    useEffect(() => {
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return <div className="fixed top-0 left-0 z-50 h-1 bg-brand-primary" style={{ width: `${scroll}%` }}></div>;
};

const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-8 right-8 z-50 p-3 rounded-full bg-brand-primary text-white shadow-lg hover:bg-brand-secondary transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            aria-label="Scroll to top"
        >
            <ArrowUpIcon className="h-6 w-6 transform -rotate-45" />
        </button>
    );
};


// --- Section Components ---
const HeroSection: React.FC = () => {
    const sectionRef = useScrollAnimation<HTMLDivElement>();
    const typedSubtitle = useTypingEffect("Automate your SEO workflow from keyword research to content optimization.", 50);

    return (
        <section ref={sectionRef} className="relative bg-gray-900 text-white min-h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-gray-900 to-emerald-900 animate-gradient-bg"></div>
            <ParticleCanvas />
            <div className="relative z-10 text-center w-full max-w-4xl px-4">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight animate-on-scroll fade-in">
                    <span className="inline-block animate-wave" style={{ animationDelay: '0s' }}>A</span>
                    <span className="inline-block animate-wave" style={{ animationDelay: '0.1s' }}>I</span>
                    <span className="inline-block animate-wave" style={{ animationDelay: '0.2s' }}>-</span>
                    <span className="inline-block animate-wave" style={{ animationDelay: '0.3s' }}>P</span>
                    <span className="inline-block animate-wave" style={{ animationDelay: '0.4s' }}>o</span>
                    <span className="inline-block animate-wave" style={{ animationDelay: '0.5s' }}>w</span>
                    <span className="inline-block animate-wave" style={{ animationDelay: '0.6s' }}>e</span>
                    <span className="inline-block animate-wave" style={{ animationDelay: '0.7s' }}>r</span>
                    <span className="inline-block animate-wave" style={{ animationDelay: '0.8s' }}>e</span>
                    <span className="inline-block animate-wave" style={{ animationDelay: '0.9s' }}>d</span>
                    &nbsp;
                    <span className="text-brand-primary">SEO Studio</span>
                </h1>
                <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto h-14 animate-on-scroll fade-in delay-200">
                    {typedSubtitle}
                    <span className="inline-block w-0.5 h-6 bg-brand-primary ml-1 animate-pulse"></span>
                </p>
                <div className="mt-8 animate-on-scroll fade-in delay-400">
                    <Link to="/keywordResearch" className="inline-block bg-brand-primary hover:bg-brand-secondary text-white font-bold py-4 px-10 text-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-brand-primary transition-all duration-300 transform hover:scale-105 btn-pulse">
                        Get Started for Free
                    </Link>
                </div>
            </div>
        </section>
    );
};

const StatsSection: React.FC = () => {
    const sectionRef = useScrollAnimation<HTMLDivElement>();
    const [users, usersRef] = useCountUp(10000);
    const [keywords, keywordsRef] = useCountUp(50);
    const [audits, auditsRef] = useCountUp(25000);
    const [roi, roiRef] = useCountUp(300);

    return (
        <section ref={sectionRef} className="py-16 bg-white dark:bg-gray-900">
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div className="animate-on-scroll fade-in">
                        <span ref={usersRef} className="text-4xl font-bold text-brand-primary">{users}+</span>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Happy Users</p>
                    </div>
                    <div className="animate-on-scroll fade-in delay-100">
                        <span ref={keywordsRef} className="text-4xl font-bold text-brand-primary">{keywords}M+</span>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Keywords Analyzed</p>
                    </div>
                    <div className="animate-on-scroll fade-in delay-200">
                        <span ref={auditsRef} className="text-4xl font-bold text-brand-primary">{audits}+</span>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Audits Performed</p>
                    </div>
                    <div className="animate-on-scroll fade-in delay-300">
                        <span ref={roiRef} className="text-4xl font-bold text-brand-primary">{roi}%</span>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Average ROI Increase</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

// ... Rest of the components would follow a similar structure ...

const LandingPage2: React.FC = () => {
    return (
        <div className="bg-white dark:bg-gray-900">
             <style>{`
                @keyframes gradient-bg {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient-bg {
                    background-size: 200% 200%;
                    animation: gradient-bg 15s ease infinite;
                }
                @keyframes wave {
                    0%, 40%, 100% { transform: translateY(0); }
                    20% { transform: translateY(-10px); }
                }
                .animate-wave {
                    animation: wave 2s ease-in-out infinite;
                }
                .card-3d {
                    transition: transform 0.1s ease, box-shadow 0.2s ease;
                    will-change: transform;
                }
            `}</style>
            <ScrollProgressBar />
            <ScrollToTopButton />
            {/* Header would go here if needed, or use the existing one */}
            <main>
                <HeroSection />
                <StatsSection />
                 {/* Placeholder for other sections */}
            </main>
            {/* Footer would go here */}
        </div>
    );
};

export default LandingPage2;
