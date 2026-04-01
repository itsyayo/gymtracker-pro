"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function WorkoutDetailDashboard({ 
  params 
}: { 
  params: Promise<{ workoutId?: string, id?: string }> 
}) {
  const { status }= useSession();
  const router = useRouter();
  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const unwrappedParams = use(params);
  const resolvedId = unwrappedParams.workoutId || unwrappedParams.id;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    } 
    else if (status === "authenticated" && resolvedId) {
      fetchWorkoutDetail();
    }
  }, [status, router, resolvedId]); 

  const fetchWorkoutDetail = async () => {
    try {
      const res = await fetch(`/api/workouts/${resolvedId}`);
      if (res.ok) {
        const data = await res.json();
        setWorkout(data);
      } else {
        alert("Error de acceso o entrenamiento no encontrado.");
        router.push("/dashboard/history");
      }
    } catch (error) {
      console.error("Error:", error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><p className="text-emerald-500 animate-pulse font-bold text-xl">Generando reporte de sesión...</p></div>;
  if (!workout) return null;

  const setsByExercise = workout.sets.reduce((acc: any, currentSet: any) => {
    const exName = currentSet.exercise.name;
    if (!acc[exName]) {
      acc[exName] = { 
        muscleGroup: currentSet.exercise.muscleGroup, 
        activityType: currentSet.exercise.activityType || 'STRENGTH',
        sets: [] 
      };
    }
    acc[exName].sets.push(currentSet);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navegación y Cabecera */}
        <div className="border-b border-zinc-800 pb-6">
          <button 
            onClick={() => router.back()} 
            className="text-zinc-500 hover:text-emerald-400 font-medium mb-4 transition-colors flex items-center bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800"
          >
            ← Volver
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-3xl font-black text-white mb-1">Reporte de Sesión</h1>
              <p className="text-zinc-400 font-medium">
                Atleta: <span className="text-emerald-400">{workout.athlete?.name || "Desconocido"}</span>
              </p>
            </div>
            <div className="text-left md:text-right">
              <span className="block text-xl font-bold text-zinc-300">
                {new Date(workout.endedAt || workout.startedAt).toLocaleDateString('es-ES', { 
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                }).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Resumen de la sesión */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
          <div className="pr-4">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">Notas de la Sesión</h3>
            <p className="text-zinc-300 italic">"{workout.athleteNotes || "Entrenamiento completado sin comentarios adicionales."}"</p>
          </div>
          <div className="text-center bg-zinc-950 p-4 rounded-xl border border-zinc-800 shadow-inner shrink-0">
            <span className="block text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              {workout.sets.length}
            </span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1 block">Registros Totales</span>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-emerald-400 border-b border-zinc-800 pb-2">Desglose Técnico</h2>
          
          {Object.entries(setsByExercise).map(([exerciseName, data]: [string, any]) => {
            const isStrength = data.activityType === "STRENGTH";
            
            return (
              <div key={exerciseName} className={`bg-zinc-900 border rounded-xl overflow-hidden shadow-lg ${isStrength ? 'border-zinc-800' : 'border-cyan-900/50'}`}>
                <div className="bg-zinc-950/50 p-4 border-b border-zinc-800 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-white">{exerciseName}</h3>
                    {!isStrength && (
                      <span className="text-[10px] font-black bg-cyan-900 text-cyan-300 px-2 py-0.5 rounded uppercase tracking-widest border border-cyan-700">
                        {data.activityType === 'SWIMMING' ? 'Natación' : 'Cardio'}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full border border-zinc-700 uppercase tracking-wider">
                    {data.muscleGroup}
                  </span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-zinc-500 bg-zinc-950 uppercase border-b border-zinc-800">
                      <tr>
                        <th className="px-6 py-3">{isStrength ? "Serie" : "Marca"}</th>
                        <th className="px-6 py-3">{isStrength ? "Peso (kg)" : "Distancia (m)"}</th>
                        <th className="px-6 py-3">{isStrength ? "Repeticiones" : "Tiempo (min)"}</th>
                        {isStrength && <th className="px-6 py-3">RPE</th>}
                        {isStrength && <th className="px-6 py-3 text-emerald-400">1RM Estimado</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {data.sets.map((set: any, index: number) => (
                        <tr key={set.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                          <td className="px-6 py-4 font-medium text-zinc-400">
                            {isStrength ? 'Set' : 'Reg'} {set.setNumber || index + 1}
                          </td>
                          <td className={`px-6 py-4 font-black ${isStrength ? 'text-white' : 'text-cyan-400'}`}>
                            {isStrength ? set.weightKg : set.distanceMeters}
                          </td>
                          <td className="px-6 py-4 font-bold text-zinc-300">
                            {isStrength 
                              ? set.reps 
                              : (parseFloat(set.durationSeconds || "0") / 60).toFixed(2)}
                          </td>
                          {isStrength && <td className="px-6 py-4 text-zinc-500">{set.rpe || "-"}</td>}
                          {isStrength && <td className="px-6 py-4 font-black text-emerald-500">{set.estimated1RM || "-"} kg</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
        
      </div>
    </div>
  );
}