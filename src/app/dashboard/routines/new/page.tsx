"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  activityType: string;
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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "COACH") {
      router.push("/dashboard");
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
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="border-b border-zinc-800 pb-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-emerald-400">Constructor de Rutina</h1>
          <button onClick={() => router.back()} className="text-zinc-400 hover:text-white transition-colors bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
            Cancelar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos Generales */}
          <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
            <h2 className="text-xl font-semibold text-white">Información General</h2>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Nombre de la Rutina</label>
              <input
                type="text"
                required
                placeholder="Ej: Día 1 - Pierna Pesada / Nado 500m"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Descripción y Notas del Coach (Opcional)</label>
              <textarea
                placeholder="Enfoque principal, tiempos de descanso, calentamiento previo..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                rows={2}
              />
            </div>
          </div>

          {/* Bloques de Ejercicios */}
          <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Bloques de Entrenamiento</h2>
              <button
                type="button"
                onClick={addExerciseRow}
                className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm px-4 py-2 rounded-lg transition-colors font-bold text-emerald-400"
              >
                + Añadir Ejercicio
              </button>
            </div>

            {selectedExercises.length === 0 ? (
              <p className="text-zinc-500 text-center py-8 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/50">
                La rutina está vacía. Añade un ejercicio para empezar a construirla.
              </p>
            ) : (
              <div className="space-y-4">
                {selectedExercises.map((ex, index) => {
                  const currentExObj = availableExercises.find(e => e.id === ex.exerciseId);
                  const isStrength = !currentExObj || currentExObj.activityType === "STRENGTH";

                  return (
                    <div key={index} className={`flex flex-wrap lg:flex-nowrap gap-3 items-end bg-zinc-950 p-4 rounded-xl border relative ${isStrength ? 'border-zinc-800' : 'border-cyan-900/50 shadow-inner shadow-cyan-900/10'}`}>
                      
                      {!isStrength && (
                        <span className="absolute -top-2.5 right-4 bg-cyan-900 text-cyan-300 text-[10px] font-black px-2 py-0.5 rounded border border-cyan-700 uppercase tracking-widest">
                          {currentExObj?.activityType === 'SWIMMING' ? 'Natación' : 'Cardio'}
                        </span>
                      )}

                      <div className="w-full lg:w-1/3">
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                          Bloque {index + 1}
                        </label>
                        <select
                          value={ex.exerciseId}
                          onChange={(e) => updateExerciseRow(index, "exerciseId", e.target.value)}
                          className={`w-full bg-zinc-800 border-2 rounded-lg px-3 py-2.5 text-sm font-bold text-white focus:outline-none ${isStrength ? 'border-zinc-700 focus:border-emerald-500' : 'border-cyan-900/80 focus:border-cyan-500'}`}
                        >
                          {availableExercises.map((catEx) => (
                            <option key={catEx.id} value={catEx.id}>
                              {catEx.name} ({catEx.muscleGroup})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="w-1/4 lg:w-1/6">
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                          {isStrength ? "Series" : "Rondas"}
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={ex.targetSets}
                          onChange={(e) => updateExerciseRow(index, "targetSets", Number(e.target.value))}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-center text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="w-2/4 lg:w-1/3">
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isStrength ? 'text-zinc-500' : 'text-cyan-600'}`}>
                          {isStrength ? "Repeticiones" : "Objetivo (Distancia/Tiempo)"}
                        </label>
                        <input
                          type="text"
                          placeholder={isStrength ? "Ej: 8-12" : "Ej: 500m en 15 min"}
                          value={ex.targetReps}
                          onChange={(e) => updateExerciseRow(index, "targetReps", e.target.value)}
                          className={`w-full bg-zinc-800 border rounded-lg px-3 py-2.5 text-sm text-center text-white focus:outline-none ${isStrength ? 'border-zinc-700 focus:border-emerald-500' : 'border-cyan-800 focus:border-cyan-500'}`}
                        />
                      </div>

                      <div className="w-1/4 lg:w-1/6">
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1" title="Rate of Perceived Exertion (Intensidad)">
                          {isStrength ? "RPE" : "Esfuerzo"}
                        </label>
                        <input
                          type="number"
                          min="1" max="10" step="0.5"
                          placeholder="1-10"
                          value={ex.targetRPE}
                          onChange={(e) => updateExerciseRow(index, "targetRPE", e.target.value !== "" ? Number(e.target.value) : "")}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-center text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="w-auto pb-1.5 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeExerciseRow(index)}
                          className="text-zinc-600 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                          title="Eliminar bloque"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || selectedExercises.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg py-4 rounded-xl font-black shadow-xl shadow-emerald-900 transition-all active:scale-[0.98]"
          >
            {isSubmitting ? "Construyendo rutina..." : "Guardar y Publicar Rutina"}
          </button>
        </form>
      </div>
    </div>
  );
}