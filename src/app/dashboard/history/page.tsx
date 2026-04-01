"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface SetLog {
  id: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  rpe: number | null;
  estimated1RM: number | null;
  exercise: {
    name: string;
    muscleGroup: string;
  };
}

interface WorkoutSession {
  id: string;
  startedAt: string;
  endedAt: string | null;
  athleteNotes: string | null;
  sets: SetLog[];
}

export default function HistoryDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    } else if (status === "authenticated") {
      fetchHistory();
    }
  }, [status, router]);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/workouts");
      if (res.ok) {
        const data = await res.json();
        setWorkouts(data);
      }
    } catch (error) {
      console.error("Error cargando historial:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) return <p className="text-white p-8">Cargando bitácora...</p>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="border-b border-zinc-800 pb-4">
          <h1 className="text-3xl font-bold">Mi Historial</h1>
          <p className="text-zinc-400 mt-1">Revisa tus entrenamientos pasados y métricas de progreso.</p>
        </div>

        {workouts.length === 0 ? (
          <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 text-center shadow-lg">
            <span className="text-4xl block mb-4">🏋️‍♂️</span>
            <p className="text-zinc-400 font-medium">No has registrado ningún entrenamiento aún.</p>
            <button 
              onClick={() => router.push("/dashboard/train")}
              className="mt-6 bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-lg font-bold transition-colors"
            >
              Ir a Entrenar
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {workouts.map((workout) => {
              const setsByExercise = workout.sets.reduce((acc, currentSet) => {
                const exName = currentSet.exercise.name;
                if (!acc[exName]) acc[exName] = [];
                acc[exName].push(currentSet);
                return acc;
              }, {} as Record<string, SetLog[]>);

              return (
                <div key={workout.id} className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-lg">
                  {/* Cabecera del Entrenamiento */}
                  <div className="bg-zinc-800/50 p-4 border-b border-zinc-800 flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold text-emerald-400">
                        {new Date(workout.endedAt || workout.startedAt).toLocaleDateString('es-ES', { 
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                        }).replace(/^\w/, c => c.toUpperCase())}
                      </h2>
                      <p className="text-xs text-zinc-500 mt-1">
                        Notas: {workout.athleteNotes || "Sin notas"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-white">{workout.sets.length}</span>
                      <span className="block text-[10px] font-bold text-zinc-500 uppercase">Series Totales</span>
                    </div>
                  </div>

                  {/* Detalle de los Ejercicios */}
                  <div className="p-4 space-y-6">
                    {Object.entries(setsByExercise).map(([exerciseName, sets]) => (
                      <div key={exerciseName}>
                        <h3 className="font-bold text-zinc-300 mb-3 flex items-center">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                          {exerciseName}
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="text-xs text-zinc-500 bg-zinc-950/50 uppercase">
                              <tr>
                                <th className="px-3 py-2 rounded-l-lg">Serie</th>
                                <th className="px-3 py-2">Peso (kg)</th>
                                <th className="px-3 py-2">Reps</th>
                                <th className="px-3 py-2">RPE</th>
                                <th className="px-3 py-2 rounded-r-lg text-emerald-400">1RM Est.</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sets.map((set) => (
                                <tr key={set.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors">
                                  <td className="px-3 py-2 font-medium text-zinc-400">{set.setNumber}</td>
                                  <td className="px-3 py-2 font-bold text-white">{set.weightKg}</td>
                                  <td className="px-3 py-2">{set.reps}</td>
                                  <td className="px-3 py-2 text-zinc-500">{set.rpe || "-"}</td>
                                  <td className="px-3 py-2 font-bold text-emerald-500">{set.estimated1RM || "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}