"use client";

import { useState, useEffect } from "react";

export default function AICoachWidget() {
  const [advice, setAdvice] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getAdvice() {
      try {
        const res = await fetch("/api/ai-coach");
        const data = await res.json();
        setAdvice(data.advice);
      } catch (err) {
        setAdvice("Mantente enfocado en tus metas.");
      } finally {
        setLoading(false);
      }
    }
    getAdvice();
  }, []);

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-black border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
      {/* Efecto visual de fondo */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
      
      <div className="flex items-start space-x-4 relative z-10">
        <div className="bg-emerald-500/20 p-3 rounded-xl border border-emerald-500/40">
          <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        
        <div className="flex-1">
          <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-1">Coach Virtual IA</h3>
          {loading ? (
            <div className="space-y-2">
              <div className="h-4 bg-zinc-800 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-zinc-800 rounded w-1/2 animate-pulse"></div>
            </div>
          ) : (
            <p className="text-zinc-200 text-sm leading-relaxed italic">
              "{advice}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
}