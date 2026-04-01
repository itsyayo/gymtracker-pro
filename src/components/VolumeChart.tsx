"use client";

import { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface VolumeChartProps {
  workouts: any[];
}

export default function VolumeChart({ workouts }: VolumeChartProps) {
  const chartData = useMemo(() => {
    if (!workouts || workouts.length === 0) return [];

    const data = workouts.map(session => {
      const date = new Date(session.endedAt || session.startedAt).toLocaleDateString('es-ES', { 
        month: 'short', day: 'numeric' 
      });
      
      let totalVolume = 0;
      session.sets.forEach((set: any) => {
        const isStrength = !set.exercise?.activityType || set.exercise?.activityType === 'STRENGTH';
        if (isStrength && set.weightKg && set.reps) {
          totalVolume += (set.weightKg * set.reps);
        }
      });

      return {
        date,
        volumen: totalVolume
      };
    });

    return data.filter(d => d.volumen > 0).reverse();
  }, [workouts]);

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-zinc-500 border border-zinc-800 rounded-xl bg-zinc-900/50 p-6 text-center">
        <svg className="w-8 h-8 mb-2 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        No hay datos de fuerza suficientes para graficar. Registra series con peso y repeticiones.
      </div>
    );
  }

  return (
    <div className="h-72 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorVolumen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="date" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} dy={10} />
          <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}kg`} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '0.5rem', color: '#fff' }}
            itemStyle={{ color: '#34d399', fontWeight: 'bold' }}
            formatter={(value) => [`${value} kg`, 'Volumen Total']}
          />
          <Area type="monotone" dataKey="volumen" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorVolumen)" activeDot={{ r: 6, fill: '#10b981', stroke: '#059669' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}