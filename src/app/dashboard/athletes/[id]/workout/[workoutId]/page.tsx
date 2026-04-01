"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function WorkoutDetailDashboard({ 
  params 
}: { 
  params: { id: string, workoutId: string } 
}) {
  const { status } = useSession();
  const router = useRouter();
  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/api/auth/signin");
    else if (status === "authenticated") fetchWorkoutDetail();
  }, [status, router]);

  const fetchWorkoutDetail = async () => {
    try {
      const res = await fetch(`/api/workouts/${params.workoutId}`);
      if (res.ok) {
        const data = await res.json();
        setWorkout(data);
      } else {
        alert("Error de acceso o entrenamiento no encontrado.");
        router.back();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-white p-8">Generando reporte de sesión...</p>;
  if (!workout) return null;

  const setsByExercise = workout.sets.reduce((acc: any, currentSet: any) => {
    const exName = currentSet.exercise.name;
    if (!acc[exName]) acc[exName] = { muscleGroup: currentSet.exercise.muscleGroup, sets: [] };
    acc[exName].sets.push(currentSet);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navegación y Cabecera */}
        <div className="border-b border-zinc-800 pb-6">
          <button 
            onClick={() => router.back()} 
            className="text-zinc-500 hover:text-emerald-400 font-medium mb-4 transition-colors flex items-center"
          >
            ← Volver al Perfil del Atleta
          </button>
          
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">Reporte de Sesión</h1>
              <p className="text-zinc-400 font-medium">
                Atleta: <span className="text-emerald-400">{workout.athlete.name}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="block text-xl font-bold text-zinc-300">
                {new Date(workout.endedAt || workout.startedAt).toLocaleDateString('es-ES', { 
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                }).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Resumen de la sesión */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1">Notas del Atleta</h3>
            <p className="text-zinc-200 text-lg italic">"{workout.athleteNotes || "Sin comentarios."}"</p>
          </div>
          <div className="text-center bg-zinc-950 p-4 rounded-lg border border-zinc-800">
            <span className="block text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              {workout.sets.length}
            </span>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1 block">Series Totales</span>
          </div>
        </div>

        {/* Desglose Analítico por Ejercicio */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-emerald-400 border-b border-zinc-800 pb-2">Desglose Técnico</h2>
          
          {Object.entries(setsByExercise).map(([exerciseName, data]: [string, any]) => (
            <div key={exerciseName} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
              <div className="bg-zinc-800/50 p-4 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="font-bold text-lg text-white">{exerciseName}</h3>
                <span className="text-xs font-bold bg-zinc-950 text-zinc-400 px-3 py-1 rounded-full border border-zinc-700">
                  {data.muscleGroup}
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 bg-zinc-950 uppercase">
                    <tr>
                      <th className="px-6 py-3">Serie</th>
                      <th className="px-6 py-3">Peso (kg)</th>
                      <th className="px-6 py-3">Reps</th>
                      <th className="px-6 py-3">RPE</th>
                      <th className="px-6 py-3 text-emerald-400">1RM Estimado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sets.map((set: any) => (
                      <tr key={set.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-zinc-400">Set {set.setNumber}</td>
                        <td className="px-6 py-4 font-black text-white">{set.weightKg}</td>
                        <td className="px-6 py-4 font-bold text-zinc-300">{set.reps}</td>
                        <td className="px-6 py-4 text-zinc-500">{set.rpe || "-"}</td>
                        <td className="px-6 py-4 font-black text-emerald-500">{set.estimated1RM || "-"} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}