// src/components/analytics/AIInsights.jsx
import React, { useEffect, useState } from 'react';
import { BrainCircuit, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

export const AIInsights = () => {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/insights');
        if (isMounted) {
          setInsight(res.data.insight);
          setError(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch AI insights', err);
          setError(true);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchInsights();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="w-full h-48 bg-obsidian-950/60 backdrop-blur-xl border border-emerald-500/20 rounded-3xl flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
        <p className="text-xs font-black text-emerald-500/80 uppercase tracking-[0.2em]">Consulting Neural Network...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 bg-red-950/20 border border-red-500/30 rounded-3xl flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-red-400 mb-1">Neural Disconnect</h4>
          <p className="text-xs text-slate-400">Unable to reach the AI analytics engine. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-3xl blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
      <div className="relative w-full p-8 bg-obsidian-950/90 backdrop-blur-2xl border border-slate-700 rounded-3xl overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_95%,rgba(16,185,129,0.05)_100%)] bg-[length:100%_20px] pointer-events-none"></div>
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
            <BrainCircuit className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white font-display tracking-wide flex items-center gap-2">
              Deep Analytics Core <Sparkles className="w-4 h-4 text-cyan-400" />
            </h3>
            <p className="text-[10px] text-emerald-500/80 uppercase tracking-widest font-bold">Automated Pattern Recognition</p>
          </div>
        </div>

        <div className="relative z-10 prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed">
          {insight.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="mb-4 last:mb-0">{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
};
