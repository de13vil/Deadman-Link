import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ChevronRight, Eye, Activity, Globe, FileText, UserCheck, Flame, AlertTriangle, Zap, Lock, ScanLine, Terminal, Code, Cpu } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { motion, useScroll, useTransform } from 'framer-motion';

const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 200]);

  const [counter, setCounter] = useState(1337420);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(prev => prev + Math.floor(Math.random() * 5));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-200 selection:bg-emerald-500/30 overflow-x-hidden font-sans relative">
      <div className="fixed inset-0 cinematic-noise z-0 pointer-events-none opacity-40 mix-blend-overlay"></div>
      
      {/* Extreme ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div style={{ y: y1 }} className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent blur-[120px] animate-pulse-glow"></motion.div>
        <motion.div style={{ y: y2 }} className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent blur-[120px]"></motion.div>
      </div>
      
      {/* --- Navigation --- */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-obsidian-950/40 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-white font-black text-2xl tracking-tighter font-display drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] group">
            <Shield className="w-8 h-8 text-emerald-400 group-hover:rotate-180 transition-transform duration-700" />
            <span>DEAD<span className="text-emerald-500">MAN</span></span>
          </Link>
          <div className="flex items-center gap-8">
            <Link to="/login" className="hidden md:flex text-sm font-bold text-slate-400 hover:text-emerald-400 transition-colors relative group uppercase tracking-widest">
              <span>Access Terminal</span>
              <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link to="/register">
              <Button className="w-auto px-6 py-3 text-xs uppercase tracking-widest font-black bg-emerald-500 text-obsidian-950 hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-all duration-300 rounded-xl">
                Initialize
              </Button>
            </Link>
            <Link to="/admin/login">
              <Button className="hidden sm:flex w-auto px-5 py-3 text-[10px] uppercase tracking-widest font-black bg-white/5 text-slate-300 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] border border-white/10 transition-all duration-300 rounded-xl">
                [ADMIN]
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Cyber Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" 
             style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)', backgroundSize: '40px 40px', maskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)' }}>
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-20 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] mb-12 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Deadman Protocol Active
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
            className="text-6xl md:text-8xl lg:text-[140px] font-black text-white tracking-tighter mb-8 leading-[0.9] font-display uppercase"
          >
            Links That <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-[length:200%_auto] animate-[shine_4s_linear_infinite] drop-shadow-[0_0_40px_rgba(16,185,129,0.5)]">
              Self-Destruct
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-lg md:text-2xl text-slate-400 mb-16 max-w-3xl mx-auto leading-relaxed font-light tracking-wide"
          >
            The ultimate cryptographic router. Create conditional, password-protected links that vanish instantly after deployment. Unbreachable, untraceable, and totally under your command.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link to="/register" className="w-full sm:w-auto relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-100 transition duration-500"></div>
              <button className="relative h-16 px-12 text-sm uppercase tracking-widest bg-obsidian-950 text-white font-black hover:bg-emerald-500 hover:text-obsidian-950 transition-all duration-300 rounded-xl w-full border border-emerald-500/50 flex items-center justify-center gap-3">
                Deploy Now <ChevronRight className="w-5 h-5" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>


      {/* --- The Protocol (How it works) --- */}
      <section className="py-32 px-6 relative z-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-sm font-black text-emerald-500 uppercase tracking-[0.5em] mb-4">The Protocol</h2>
            <h3 className="text-5xl md:text-7xl font-black text-white font-display tracking-tight">How Deadman <span className="text-slate-500">Operates</span></h3>
          </div>

          <div className="space-y-32">
            <ProtocolStep 
              number="01"
              title="Encrypt & Arm"
              desc="Inject your destination payload. Wrap it in password hashes, click limits, and geographic constraints."
              icon={Lock}
            />
            <ProtocolStep 
              number="02"
              title="Deploy Link"
              desc="Distribute the untraceable smart URL. The system constantly monitors the visitor's integrity in real-time."
              icon={Globe}
              reverse
            />
            <ProtocolStep 
              number="03"
              title="Vaporize"
              desc="Upon reaching the access limit or timestamp, the routing logic permanently destructs. The path is gone forever."
              icon={Flame}
              color="text-orange-500"
            />
          </div>
        </div>
      </section>


      {/* --- User Features Grid --- */}
      <section id="features" className="py-32 px-6 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-sm font-black text-emerald-500 uppercase tracking-[0.5em] mb-4">Capabilities</h2>
            <h3 className="text-5xl md:text-7xl font-black text-white font-display tracking-tight">Field Agent <span className="text-slate-500">Arsenal</span></h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={Zap} title="Instant Routing" desc="Generate shareable short links from any URL instantly. Zero latency deployment." />
            <FeatureCard icon={Flame} title="Destruct Timer" desc="Set exact TTL. The link incinerates itself and returns 404 permanently after expiry." />
            <FeatureCard icon={Eye} title="Burn After Reading" desc="The link invalidates cryptographically after the first successful GET request." />
            <FeatureCard icon={Lock} title="Vault Protection" desc="Links are hashed. Visitors must inject the correct decryption key to proceed." />
            <FeatureCard icon={Activity} title="Dynamic Paths" desc="Change destinations logically based on device fingerprint or time of day." />
            <FeatureCard icon={Shield} title="Neural Scan" desc="Heuristic checks flag suspicious destinations preventing you from sharing malicious intel." />
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="border-t border-white/5 py-12 bg-black text-center relative z-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <div className="flex items-center gap-3 text-white font-black text-xl mb-6 font-display opacity-50 hover:opacity-100 transition-opacity">
            <Shield className="w-6 h-6 text-emerald-500" />
            DEADMAN LINK
          </div>
          <p className="text-xs text-slate-600 font-mono uppercase tracking-widest">
            © 2025 Deadman. Encrypted in transit.
          </p>
        </div>
      </footer>
    </div>
  );
};

const ProtocolStep = ({ number, title, desc, icon: Icon, reverse, color = "text-emerald-500" }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8 }}
    className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-24`}
  >
    <div className="flex-1 w-full relative group">
      <div className="absolute inset-0 bg-white/5 rounded-3xl transform rotate-3 group-hover:rotate-6 transition-transform duration-500"></div>
      <div className="relative aspect-square rounded-3xl bg-obsidian-900 border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
        <Icon className={`w-32 h-32 ${color} drop-shadow-[0_0_30px_currentColor] group-hover:scale-110 transition-transform duration-700`} />
      </div>
    </div>
    <div className="flex-1 text-center md:text-left">
      <div className={`text-[120px] font-black leading-none ${color} opacity-20 font-display mb-4 tracking-tighter`}>{number}</div>
      <h4 className="text-4xl md:text-5xl font-black text-white mb-6 font-display tracking-tight">{title}</h4>
      <p className="text-xl text-slate-400 font-light leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 p-10 rounded-3xl group transition-colors duration-500 relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/50 transition-all duration-500">
      <Icon className="w-6 h-6 text-slate-400 group-hover:text-emerald-400" />
    </div>
    <h3 className="text-2xl font-black text-white mb-4 font-display tracking-wide">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed font-light">{desc}</p>
  </motion.div>
);

const AdminFeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="bg-obsidian-800 border border-white/5 hover:border-red-500/50 p-10 rounded-[2rem] group transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_20px_40px_rgba(239,68,68,0.15)] relative overflow-hidden">
    <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-red-600 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
    <div className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
      <Icon className="w-7 h-7 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
    </div>
    <h3 className="text-xl font-bold text-white mb-3 font-display">{title}</h3>
    <p className="text-slate-400 text-base leading-relaxed font-light">{desc}</p>
  </div>
);

export default LandingPage;
