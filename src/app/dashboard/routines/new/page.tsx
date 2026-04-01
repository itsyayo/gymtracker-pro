"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
}

interface SelectedExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: string;
  targetRPE: number | "";
}

export default function NewRoutineBuilder() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Protección de ruta y carga de catálogo
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    } else if (status === "authenticated" && session?.user?.role !== "COACH") {
      router.push("/");
    } else if (status === "authenticated") {
      fetchCatalog();
    }
  }, [status, session, router]);

  const fetchCatalog = async () => {
    const res = await fetch("/api/exercises");
    if (res.ok) {
      const data = await res.json();
      setAvailableExercises(data);
    }
  };

  // Manejo de la lista dinámica de ejercicios
  const addExerciseRow = () => {
    if (availableExercises.length === 0) return;
    setSelectedExercises([
      ...selectedExercises,
      { exerciseId: availableExercises[0].id, targetSets: 4, targetReps: "8-12", targetRPE: 8 }
    ]);
  };

  const removeExerciseRow = (index: number) => {
    const updated = [...selectedExercises];
    updated.splice(index, 1);
    setSelectedExercises(updated);
  };

  const updateExerciseRow = (index: number, field: keyof SelectedExercise, value: any) => {
    const updated = [...selectedExercises];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedExercises(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedExercises.length === 0) {
      alert("Debes agregar al menos un ejercicio a la rutina.");
      return;
    }

    setIsSubmitting(true);
    const res = await fetch("/api/routines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, exercises: selectedExercises }),
    });

    setIsSubmitting(false);

    if (res.ok) {
      router.push("/dashboard/routines");
    } else {
      alert("Error al guardar la rutina");
    }
  };

  if (status === "loading") return <p className="text-white p-8">Cargando constructor...</p>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="border-b border-zinc-800 pb-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Constructor de Rutina</h1>
          <button onClick={() => router.back()} className="text-zinc-400 hover:text-white transition-colors">
            Cancelar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos Generales */}
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-4">
            <h2 className="text-xl font-semibold text-emerald-400">Información General</h2>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Nombre de la Rutina</label>
              <input
                type="text"
                required
                placeholder="Ej: Empuje Pesado (Fuerza)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Descripción (Opcional)</label>
              <textarea
                placeholder="Enfoque principal, tiempos de descanso, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                rows={2}
              />
            </div>
          </div>

          {/* Bloques de Ejercicios */}
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-emerald-400">Ejercicios</h2>
              <button
                type="button"
                onClick={addExerciseRow}
                className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm px-3 py-1 rounded transition-colors font-medium"
              >
                + Añadir Ejercicio
              </button>
            </div>

            {selectedExercises.length === 0 ? (
              <p className="text-zinc-500 text-center py-4 border border-dashed border-zinc-800 rounded">
                La rutina está vacía. Añade un ejercicio para empezar.
              </p>
            ) : (
              <div className="space-y-3">
                {selectedExercises.map((ex, index) => (
                  <div key={index} className="flex flex-wrap md:flex-nowrap gap-3 items-end bg-zinc-950 p-4 rounded-lg border border-zinc-800/50">
                    <div className="w-full md:w-2/5">
                      <label className="block text-xs text-zinc-500 mb-1">Ejercicio {index + 1}</label>
                      <select
                        value={ex.exerciseId}
                        onChange={(e) => updateExerciseRow(index, "exerciseId", e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      >
                        {availableExercises.map((catEx) => (
                          <option key={catEx.id} value={catEx.id}>
                            {catEx.name} ({catEx.muscleGroup})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="w-1/3 md:w-1/6">
                      <label className="block text-xs text-zinc-500 mb-1">Series</label>
                      <input
                        type="number"
                        min="1"
                        value={ex.targetSets}
                        onChange={(e) => updateExerciseRow(index, "targetSets", Number(e.target.value))}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-center text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="w-1/3 md:w-1/5">
                      <label className="block text-xs text-zinc-500 mb-1">Reps</label>
                      <input
                        type="text"
                        placeholder="Ej: 8-12"
                        value={ex.targetReps}
                        onChange={(e) => updateExerciseRow(index, "targetReps", e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-center text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="w-1/4 md:w-1/6">
                      <label className="block text-xs text-zinc-500 mb-1">RPE</label>
                      <input
                        type="number"
                        min="1" max="10" step="0.5"
                        value={ex.targetRPE}
                        onChange={(e) => updateExerciseRow(index, "targetRPE", e.target.value !== "" ? Number(e.target.value) : "")}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-center text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="w-auto md:w-auto pb-1">
                      <button
                        type="button"
                        onClick={() => removeExerciseRow(index)}
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded transition-colors"
                        title="Eliminar"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || selectedExercises.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg py-3 rounded-lg font-bold shadow-lg shadow-emerald-500/20 transition-all"
          >
            {isSubmitting ? "Guardando..." : "Guardar Rutina Completa"}
          </button>
        </form>
      </div>
    </div>
  );
}