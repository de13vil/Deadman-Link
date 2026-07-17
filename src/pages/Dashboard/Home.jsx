import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { CreateLinkForm } from '../../components/links/CreateLinkForm';
import { APP_BASE_URL } from '../../config/appUrl';
import api from '../../services/api';
import { Zap, Link as LinkIcon, Gauge, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardHome = () => {
  const navigate = useNavigate();

  const [shortUrl, setShortUrl] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    clicks: 0,
    loading: true,
  });

  const handleLinkCreated = (link) => {
    const generatedShort = `${APP_BASE_URL}/${link.slug}`;
    setShortUrl(generatedShort);
  };

  const handleCopyShortUrl = async () => {
    if (!shortUrl) return;
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast.success('Secure link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy.');
    }
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        setStats((s) => ({ ...s, loading: true }));
        const res = await api.get('/links');
        const links = Array.isArray(res.data) ? res.data : [];

        const total = links.length;
        const active = links.filter((l) => l.status !== 'expired').length;
        const clicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);

        setStats({ total, active, clicks, loading: false });
      } catch (err) {
        setStats({ total: 0, active: 0, clicks: 0, loading: false });
      }
    };
    loadStats();
  }, []);

  return (
    <div className="h-full w-full space-y-8 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent pointer-events-none -z-10 blur-3xl"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">Command Center</h1>
        <p className="text-lg text-slate-400 font-light tracking-wide">Orchestrate your intelligent routing protocols.</p>
        <div className="absolute top-0 right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-glow"></div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Deployed Links', value: stats.loading ? '…' : stats.total, icon: LinkIcon, delay: 0.1 },
          { label: 'Active Protocols', value: stats.loading ? '…' : stats.active, icon: Zap, delay: 0.2 },
          { label: 'Total Interceptions', value: stats.loading ? '…' : stats.clicks.toLocaleString(), icon: Gauge, delay: 0.3 },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item.delay }}
              key={item.label}
              className="bg-obsidian-900/80 backdrop-blur-md border border-white/10 p-6 rounded-3xl shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-colors"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-emerald-400 transition-colors">
                  {item.label}
                </span>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-emerald-500/30 transition-colors">
                  <Icon className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </div>
              </div>
              <p className="text-4xl font-black text-white relative z-10">{item.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Link Creator */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="relative"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-50"></div>
        <div className="bg-obsidian-900/90 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Zap className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-wide">
                Initialize Deadman Link
              </h2>
              <p className="text-sm text-slate-400 mt-1 font-light">Configure destination payload and destruction constraints.</p>
            </div>
          </div>

          <CreateLinkForm onSuccess={handleLinkCreated} />

          {/* Show result only when we have a short URL */}
          {shortUrl && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-8 border border-emerald-500/50 rounded-2xl p-6 bg-emerald-950/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(16,185,129,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer pointer-events-none"></div>
              <p className="text-emerald-400 font-bold mb-4 flex items-center gap-3 relative z-10 text-lg uppercase tracking-wide">
                <CheckCircle className="w-6 h-6" />
                Protocol Deployed Successfully
              </p>
              <div className="flex flex-col md:flex-row gap-4 md:items-center relative z-10">
                <div className="flex-1 bg-obsidian-950 border border-emerald-500/30 px-5 py-4 rounded-xl text-emerald-50 font-mono text-sm shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] overflow-x-auto whitespace-nowrap scrollbar-hide">
                  {shortUrl}
                </div>
                <Button
                  type="button"
                  onClick={handleCopyShortUrl}
                  className="md:w-auto w-full px-8 py-4 bg-emerald-500 text-obsidian-950 hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] font-black uppercase tracking-widest text-xs transition-all"
                >
                  Copy Link
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Empty State Action */}
      {(stats.loading || stats.total === 0) && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-obsidian-900/50 border border-dashed border-white/20 p-12 rounded-3xl text-center relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/10 group-hover:border-emerald-500/50 transition-colors">
              <LinkIcon className="w-10 h-10 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h3 className="text-white text-2xl font-black mb-3">
              {stats.loading ? 'Synchronizing Intel...' : 'Awaiting First Deployment'}
            </h3>
            <p className="text-slate-400 text-base mb-8 max-w-md mx-auto font-light">
              {stats.loading
                ? 'Establishing secure connection to the tracking database.'
                : 'Your routing network is currently empty. Initialize your first deadman link above.'}
            </p>
            {!stats.loading && (
              <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold tracking-wide flex items-center gap-2 mx-auto">
                Scroll to Command Center <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardHome;
