"use client";

export default function SponsorCard() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-center gap-5 group hover:border-zinc-700 transition-colors">
      
      <span className="absolute top-2 right-3 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
        Patrocinado
      </span>

      <div className="w-16 h-16 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl flex items-center justify-center shrink-0 border border-zinc-700/50 shadow-inner">
        <span className="text-3xl filter drop-shadow-md">⚡</span>
      </div>

      <div className="flex-1 text-center sm:text-left">
        <h4 className="text-white font-bold text-sm">ProTech Nutrition Labs</h4>
        <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed">
          Potencia tu recuperación después de entrenar. Obtén un <span className="text-emerald-400 font-bold">20% de descuento</span> en tu primera proteína aislada usando el código <span className="bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800 font-mono text-cyan-400">GYMTRACKER20</span>.
        </p>
      </div>

      <a 
        href="#" 
        onClick={(e) => e.preventDefault()} 
        className="w-full sm:w-auto bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold py-2.5 px-5 rounded-lg transition-colors border border-zinc-800 text-center whitespace-nowrap mt-2 sm:mt-0 shadow-sm"
      >
        Canjear Código
      </a>
    </div>
  );
}