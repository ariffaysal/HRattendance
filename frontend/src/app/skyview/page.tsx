'use client';


import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Wifi,
  Zap,
  Shield,
  Clock,
  Globe,
  Headphones,
  ChevronRight,
  Check,
  Activity,
  Server,
  Signal,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  Cable,
} from 'lucide-react';
import Link from 'next/link';

// Custom Cursor Component
function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [role="button"]')) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = () => {
      setIsHovering(false);
    };

    window.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <motion.div
        className="fixed w-4 h-4 bg-neon-blue rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{
          left: position.x - 8,
          top: position.y - 8,
        }}
        animate={{
          scale: isHovering ? 2 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 28,
          mass: 0.5,
        }}
      />
      <motion.div
        className="fixed w-8 h-8 border border-neon-blue/50 rounded-full pointer-events-none z-[9998]"
        style={{
          left: position.x - 16,
          top: position.y - 16,
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 150,
          damping: 15,
          mass: 0.8,
        }}
      />
    </>
  );
}

// Animated Grid Background
function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-midnight" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 240, 255, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 240, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite',
          transform: 'perspective(500px) rotateX(60deg)',
          transformOrigin: 'center top',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-midnight/50 to-midnight" />
    </div>
  );
}

// Glass Card Component
function GlassCard({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
      className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Glow Effect Text
function GlowText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`relative ${className}`}>
      <span className="relative z-10">{children}</span>
      <span
        className="absolute inset-0 blur-lg opacity-50 animate-glow"
        style={{
          background: 'linear-gradient(90deg, #00f0ff, #a855f7, #ec4899)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {children}
      </span>
    </span>
  );
}

// Feature Card
function FeatureCard({ icon: Icon, title, description, delay = 0 }: { icon: any; title: string; description: string; delay?: number }) {
  return (
    <GlassCard delay={delay} className="p-6 group hover:bg-white/10 transition-all duration-500">
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 animate-float">
        <Icon className="w-7 h-7 text-neon-blue" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </GlassCard>
  );
}

// Stat Counter
function StatCounter({ end, suffix = '', label, delay = 0 }: { end: number; suffix?: string; label: string; delay?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 2000;
          const startTime = performance.now();
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * end));
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          setTimeout(() => requestAnimationFrame(animate), delay * 1000);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, delay, hasAnimated]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-5xl md:text-6xl font-bold text-white mb-2">
        {count}
        <span className="text-neon-blue">{suffix}</span>
      </div>
      <div className="text-slate-400 text-sm uppercase tracking-wider">{label}</div>
    </div>
  );
}

// Package Toggle
function PackageToggle({ isYearly, onToggle }: { isYearly: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-12">
      <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-white' : 'text-slate-500'}`}>
        Monthly
      </span>
      <button
        onClick={onToggle}
        className="relative w-20 h-10 rounded-full bg-white/10 border border-white/20 p-1"
        style={{ perspective: '1000px' }}
      >
        <motion.div
          className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple shadow-lg shadow-neon-blue/50"
          animate={{
            x: isYearly ? 40 : 0,
            rotateY: isYearly ? 180 : 0,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ transformStyle: 'preserve-3d' }}
        />
      </button>
      <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-white' : 'text-slate-500'}`}>
        Yearly
        <span className="ml-2 text-neon-green text-xs">Save 20%</span>
      </span>
    </div>
  );
}

// Pricing Card
function PricingCard({ 
  name, 
  monthlyPrice, 
  yearlyPrice, 
  features, 
  isPopular = false, 
  isYearly,
  delay = 0 
}: { 
  name: string; 
  monthlyPrice: number; 
  yearlyPrice: number; 
  features: string[]; 
  isPopular?: boolean;
  isYearly: boolean;
  delay?: number;
}) {
  const price = isYearly ? yearlyPrice : monthlyPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: -15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
      className={`relative backdrop-blur-xl rounded-2xl p-8 ${
        isPopular 
          ? 'bg-gradient-to-b from-neon-blue/20 to-neon-purple/10 border-2 border-neon-blue/50' 
          : 'bg-white/5 border border-white/10'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1 bg-gradient-to-r from-neon-blue to-neon-purple text-white text-xs font-semibold rounded-full">
            Most Popular
          </span>
        </div>
      )}
      <h3 className="text-xl font-semibold text-white mb-2">{name}</h3>
      <div className="mb-6">
        <span className="text-4xl font-bold text-white">${price}</span>
        <span className="text-slate-400">/month</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-slate-300">
            <Check className="w-5 h-5 text-neon-green flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href="/register"
        className={`block w-full py-3 rounded-xl font-semibold text-center transition-all duration-300 ${
          isPopular
            ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white hover:shadow-lg hover:shadow-neon-blue/30'
            : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
        }`}
      >
        Get Started
      </Link>
    </motion.div>
  );
}

// Main Page Component
export default function SkyviewLanding() {
  const [isYearly, setIsYearly] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const features = [
    {
      icon: Zap,
      title: 'Ultra High-Speed',
      description: 'Experience blazing fast speeds up to 10Gbps with our fiber-optic network infrastructure.',
    },
    {
      icon: Headphones,
      title: '24/7 Expert Support',
      description: 'Our dedicated support team is available round the clock to assist you with any issues.',
    },
    {
      icon: Activity,
      title: 'Low Latency Gaming',
      description: 'Sub-5ms latency for competitive gaming and real-time applications.',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Advanced DDoS protection and enterprise-grade security for your peace of mind.',
    },
    {
      icon: Globe,
      title: 'Global CDN',
      description: 'Access content faster with our distributed content delivery network worldwide.',
    },
    {
      icon: Cable,
      title: '99.9% Uptime SLA',
      description: 'Guaranteed reliability with our redundant network infrastructure and SLA.',
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      monthlyPrice: 49,
      yearlyPrice: 39,
      features: ['100 Mbps Download', '50 Mbps Upload', 'Unlimited Data', 'Basic Support', '1 Static IP'],
    },
    {
      name: 'Pro',
      monthlyPrice: 99,
      yearlyPrice: 79,
      features: ['500 Mbps Download', '250 Mbps Upload', 'Unlimited Data', 'Priority Support', '5 Static IPs', 'DDoS Protection'],
      isPopular: true,
    },
    {
      name: 'Enterprise',
      monthlyPrice: 199,
      yearlyPrice: 159,
      features: ['1 Gbps Download', '500 Mbps Upload', 'Unlimited Data', '24/7 Dedicated Support', '10 Static IPs', 'Advanced Security', 'SLA Guarantee'],
    },
  ];

  return (
    <div className="min-h-screen bg-midnight text-white overflow-x-hidden">
      <CustomCursor />
      
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-midnight/50 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/skyview" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                <Wifi className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Skyview
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</Link>
              <Link href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</Link>
              <Link href="#network" className="text-sm text-slate-400 hover:text-white transition-colors">Network</Link>
              <Link href="#contact" className="text-sm text-slate-400 hover:text-white transition-colors">Contact</Link>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-neon-blue/30 transition-all"
              >
                Get Started
              </Link>
            </div>

            <button
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10 bg-midnight/95 backdrop-blur-xl"
            >
              <div className="px-4 py-4 space-y-3">
                <Link href="#features" className="block py-2 text-slate-400 hover:text-white">Features</Link>
                <Link href="#pricing" className="block py-2 text-slate-400 hover:text-white">Pricing</Link>
                <Link href="#network" className="block py-2 text-slate-400 hover:text-white">Network</Link>
                <Link href="#contact" className="block py-2 text-slate-400 hover:text-white">Contact</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <AnimatedGrid />
        
        {/* Spline 3D Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-full max-w-4xl max-h-[80vh] opacity-30">
            <div className="w-full h-full rounded-3xl bg-gradient-to-br from-neon-blue/10 via-neon-purple/10 to-transparent border border-white/5 flex items-center justify-center">
              <div className="text-center">
                <Sparkles className="w-16 h-16 text-neon-blue/50 mx-auto mb-4 animate-pulse" />
                <p className="text-slate-500 text-sm">3D Spline Scene Placeholder</p>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-5xl mx-auto px-4 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="text-sm text-slate-300">Now serving 50,000+ customers</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          >
            <GlowText>The Future of</GlowText>
            <br />
            <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">
              Gigabit Fiber
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-10"
          >
            Experience the next generation of internet connectivity with Skyview Online.
            Lightning-fast speeds, unmatched reliability.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/register"
              className="group px-8 py-4 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-neon-blue/30 transition-all flex items-center gap-2 animate-pulse-neon"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#network"
              className="px-8 py-4 bg-white/5 border border-white/20 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Server className="w-5 h-5" />
              View Network Status
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
          >
            <motion.div className="w-1 h-2 bg-white/50 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Network Stats Section */}
      <section id="network" className="relative py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <GlowText>Network Statistics</GlowText>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Real-time performance metrics from our global infrastructure
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCounter end={99} suffix=".9%" label="Uptime SLA" delay={0} />
            <StatCounter end={10} suffix="Gbps" label="Max Speed" delay={0.1} />
            <StatCounter end={50} suffix="K+" label="Happy Customers" delay={0.2} />
            <StatCounter end={24} suffix="/7" label="Support" delay={0.3} />
          </div>

          {/* Network Status Bar */}
          <GlassCard delay={0.4} className="mt-16 p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-neon-green/20 flex items-center justify-center">
                  <Signal className="w-6 h-6 text-neon-green" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">All Systems Operational</h3>
                  <p className="text-slate-400 text-sm">Last updated: Just now</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">12ms</div>
                  <div className="text-xs text-slate-500">Avg. Latency</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">0</div>
                  <div className="text-xs text-slate-500">Outages</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-neon-green">100%</div>
                  <div className="text-xs text-slate-500">Health</div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <GlowText>Why Choose Skyview?</GlowText>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Cutting-edge technology meets exceptional service. Experience internet like never before.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={i * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <GlowText>Simple, Transparent Pricing</GlowText>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Choose the plan that fits your needs. No hidden fees, no surprises.
            </p>
          </motion.div>

          <PackageToggle isYearly={isYearly} onToggle={() => setIsYearly(!isYearly)} />

          <div className="grid md:grid-cols-3 gap-8" style={{ perspective: '1000px' }}>
            {pricingPlans.map((plan, i) => (
              <PricingCard
                key={plan.name}
                {...plan}
                isYearly={isYearly}
                delay={i * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="relative py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                  <Wifi className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Skyview Online</span>
              </div>
              <p className="text-slate-400 max-w-sm">
                The future of internet connectivity. Ultra-fast, reliable, and secure fiber optic network for homes and businesses.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">Press</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">Status Page</Link></li>
                <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">API Docs</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © 2025 Skyview Online. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-neon-green/10 border border-neon-green/30">
                <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                <span className="text-neon-green text-xs font-medium">All Systems Online</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
