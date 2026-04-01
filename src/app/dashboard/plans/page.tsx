"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AssignedRoutine {
  id: string;
  name: string;
  description: string | null;
  author: { name: string };
  exercises: {
    id: string;
    targetSets: number;
    targetReps: string;
    targetRPE: number | null;
    exercise: { name: string; muscleGroup: string };
  }[];
}

export default function MyPlansDashboard() {
  const { status } = useSession();
  const router = useRouter();
  const [routines, setRoutines] = useState<AssignedRoutine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/api/auth/signin");
    else if (status === "authenticated") fetchAssignedRoutines();
  }, [status, router]);

  const fetchAssignedRoutines = async () => {
    try {
      const res = await fetch("/api/routines/assigned");
      if (res.ok) {
        const data = await res.json();
        setRoutines(data);
      }
    } catch (error) {
      console.error("Error cargando planes:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) return <p className="text-white p-4">Cargando tu plan...</p>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="border-b border-zinc-800 pb-4">
          <h1 className="text-3xl font-black text-emerald-400">Mi Plan de Entrenamiento</h1>
          <p className="text-zinc-400 mt-1">Rutinas asignadas por tu entrenador.</p>
        </div>

        {routines.length === 0 ? (
          <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 text-center shadow-lg">
            <span className="text-4xl block mb-4">📋</span>
            <h2 className="text-xl font-bold text-white mb-2">Aún no tienes rutinas asignadas</h2>
            <p className="text-zinc-400 text-sm">Pídele a tu entrenador que te asigne un plan de trabajo desde su panel de control.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {routines.map((routine) => (
              <div key={routine.id} className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
                {/* Cabecera de la Rutina */}
                <div className="bg-zinc-800/50 p-5 border-b border-zinc-800">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-white leading-tight">{routine.name}</h2>
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider ml-2">
                      Plan Activo
                    </span>
                  </div>
                  {routine.description && <p className="text-sm text-zinc-400 mb-3">{routine.description}</p>}
                  <p className="text-xs text-zinc-500 font-medium">Asignado por Coach: <span className="text-zinc-300">{routine.author.name}</span></p>
                </div>

                {/* Lista de Ejercicios */}
                <div className="p-0">
                  <ul className="divide-y divide-zinc-800/50">
                    {routine.exercises.map((item, index) => (
                      <li key={item.id} className="p-4 hover:bg-zinc-800/30 transition-colors flex items-center">
                        <div className="h-8 w-8 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 mr-4 shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-zinc-200 truncate">{item.exercise.name}</p>
                          <div className="flex space-x-3 mt-1 text-xs text-zinc-500 font-medium">
                            <span className="flex items-center"><span className="text-emerald-500 mr-1">{item.targetSets}</span> series</span>
                            <span className="flex items-center"><span className="text-emerald-500 mr-1">{item.targetReps}</span> reps</span>
                            {item.targetRPE && <span className="flex items-center">RPE <span className="text-zinc-300 ml-1">{item.targetRPE}</span></span>}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-zinc-950 border-t border-zinc-800">
                  <Link 
                    href="/dashboard/train"
                    className="block w-full text-center bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-emerald-900"
                  >
                    Ir a Entrenar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}