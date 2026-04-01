"use client";

import { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

interface OneRepMaxChartProps {
  workouts: any[];
}

export default function OneRepMaxChart({ workouts }: OneRepMaxChartProps) {
  const availableExercises = useMemo(() => {
    const exercises = new Set<string>();
    workouts.forEach(session => {
      session.sets.forEach((set: any) => {
        const isStrength = !set.exercise?.activityType || set.exercise?.activityType === 'STRENGTH';
        if (set.estimated1RM && isStrength) {
          exercises.add(set.exercise.name);
        }
      });
    });
    return Array.from(exercises).sort();
  }, [workouts]);

  const [selectedExercise, setSelectedExercise] = useState<string>(
    availableExercises.length > 0 ? availableExercises[0] : ""
  );

  const chartData = useMemo(() => {
    if (!selectedExercise || workouts.length === 0) return [];

    const data: any[] = [];

    [...workouts].reverse().forEach(session => {
      const date = new Date(session.endedAt || session.startedAt).toLocaleDateString('es-ES', { 
        month: 'short', day: 'numeric' 
      });
      
      const setsForExercise = session.sets.filter((s: any) => s.exercise.name === selectedExercise);
      
      if (setsForExercise.length > 0) {
        const dailyMax1RM = Math.max(...setsForExercise.map((s: any) => s.estimated1RM || 0));
        
        data.push({
          date,
          max1RM: dailyMax1RM
        });
      }
    });

    return data;
  }, [workouts, selectedExercise]);

  if (availableExercises.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-zinc-500 border border-zinc-800 rounded-xl bg-zinc-900/50 p-6 text-center">
        <svg className="w-8 h-8 mb-2 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        El atleta no ha registrado series de fuerza con proyección de 1RM.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 text-sm text-white rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 transition-colors"
        >
          {availableExercises.map(ex => (
            <option key={ex} value={ex}>{ex}</option>
          ))}
        </select>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="date" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}kg`} domain={['dataMin - 5', 'dataMax + 5']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '0.5rem', color: '#fff' }}
              itemStyle={{ color: '#22d3ee', fontWeight: 'bold' }}
              formatter={(value) => [`${value} kg`, '1RM Estimado']}
            />
            <Line type="monotone" dataKey="max1RM" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4, fill: '#0891b2', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#06b6d4', stroke: '#fff' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}