"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ExerciseData {
  id: string;
  name: string;
  muscleGroup: string;
}

interface RoutineExercise {
  id: string;
  orderIndex: number;
  targetSets: number;
  targetReps: string;
  targetRPE: number | null;
  exercise: ExerciseData;
}

interface Routine {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  exercises: RoutineExercise[];
}

export default function RoutinesDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    } else if (status === "authenticated" && session?.user?.role !== "COACH") {
      router.push("/");
    } else if (status === "authenticated") {
      fetchRoutines();
    }
  }, [status, session, router]);

  const fetchRoutines = async () => {
    try {
      const res = await fetch("/api/routines");
      if (res.ok) {
        const data = await res.json();
        setRoutines(data);
      }
    } catch (error) {
      console.error("Error cargando rutinas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) return <p className="text-white p-8">Cargando rutinas...</p>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <h1 className="text-3xl font-bold">Mis Plantillas de Rutinas</h1>
          <Link
            href="/dashboard/routines/new"
            className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded font-semibold transition-colors"
          >
            + Nueva Rutina
          </Link>
        </div>

        {routines.length === 0 ? (
          <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 text-center">
            <p className="text-zinc-500">No tienes rutinas creadas aún. Usa el botón de arriba para empezar.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {routines.map((routine) => (
              <div key={routine.id} className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex flex-col">
                <h2 className="text-xl font-bold text-emerald-400 mb-2">{routine.name}</h2>
                {routine.description && <p className="text-sm text-zinc-400 mb-4">{routine.description}</p>}

                <div className="flex-1 bg-zinc-950 rounded-lg p-4 border border-zinc-800/50">
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                    Ejercicios ({routine.exercises.length})
                  </h3>
                  <ul className="space-y-3">
                    {routine.exercises.map((item) => (
                      <li key={item.id} className="flex flex-col text-sm border-b border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                        <span className="font-medium text-zinc-200">
                          {item.orderIndex + 1}. {item.exercise.name}
                        </span>
                        <span className="text-xs text-zinc-500 mt-1">
                          {item.targetSets} sets x {item.targetReps} reps {item.targetRPE ? `| RPE: ${item.targetRPE}` : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center">
                  <span className="text-xs text-zinc-600">
                    Creada: {new Date(routine.createdAt).toLocaleDateString()}
                  </span>
                  <button className="text-sm text-emerald-500 hover:text-emerald-400 font-medium">
                    Asignar a Atleta →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}