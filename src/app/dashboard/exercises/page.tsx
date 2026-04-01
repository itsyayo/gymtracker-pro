"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ExercisesDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [exercises, setExercises] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("CHEST");
  const [activityType, setActivityType] = useState("STRENGTH");
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "COACH") {
      router.push("/");
    } else if (status === "authenticated") {
      fetchExercises();
    }
  }, [status, session, router]);

  const fetchExercises = async () => {
    const res = await fetch("/api/exercises");
    if (res.ok) {
      const data = await res.json();
      setExercises(data);
    }
  };

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, muscleGroup, activityType, videoUrl }), 
    });

    if (res.ok) {
      setName("");
      setVideoUrl("");
      fetchExercises();
    } else {
      alert("Error al crear el ejercicio");
    }
  };

  if (status === "loading") return <p className="text-white p-8">Cargando seguridad...</p>;

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'SWIMMING': return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
      case 'CARDIO': return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
      default: return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="border-b border-zinc-800 pb-4">
          <h1 className="text-3xl font-bold">Gestión de Ejercicios</h1>
          <p className="text-zinc-400 mt-1">Administra tu catálogo multideporte y añade videos demostrativos.</p>
        </div>
        
        {/* Formulario de Creación */}
        <form onSubmit={handleCreateExercise} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl space-y-5">
          <h2 className="text-xl font-semibold text-emerald-400">Añadir Nuevo Ejercicio</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Nombre</label>
              <input 
                type="text" placeholder="Ej: Nado Estilo Libre" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Tipo de Actividad</label>
              <select 
                value={activityType} onChange={(e) => setActivityType(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="STRENGTH">Fuerza / Pesas (Kilos x Reps)</option>
                <option value="SWIMMING">Natación (Metros x Minutos)</option>
                <option value="CARDIO">Cardio General (Metros x Minutos)</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Grupo Muscular</label>
              <select 
                value={muscleGroup} onChange={(e) => setMuscleGroup(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="CHEST">Pecho</option>
                <option value="BACK">Espalda</option>
                <option value="LEGS">Piernas</option>
                <option value="SHOULDERS">Hombros</option>
                <option value="ARMS">Brazos</option>
                <option value="CORE">Core (Abdomen)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">URL de Video (Opcional)</label>
              <input 
                type="url" placeholder="https://youtube.com/..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <button type="submit" className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-lg shadow-emerald-900">
            Guardar en Catálogo
          </button>
        </form>

        {/* Lista de Ejercicios */}
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center justify-between">
            <span>Catálogo Actual</span>
            <span className="bg-zinc-800 text-zinc-400 text-sm py-1 px-3 rounded-full">
              {exercises.length} registrados
            </span>
          </h2>
          
          {exercises.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">No hay ejercicios registrados.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exercises.map((ex) => (
                <li key={ex.id} className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-lg text-zinc-200">{ex.name}</span>
                      <span className={`text-[10px] font-black px-2 py-1 rounded border uppercase tracking-widest ${getActivityColor(ex.activityType)}`}>
                        {ex.activityType}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 font-bold uppercase">{ex.muscleGroup}</p>
                  </div>
                  
                  <div className="mt-4 border-t border-zinc-800/50 pt-3">
                    {ex.videoUrl ? (
                      <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-500 hover:text-cyan-400 flex items-center font-medium transition-colors">
                        ▶ Ver Técnica
                      </a>
                    ) : (
                      <span className="text-sm text-zinc-600 flex items-center italic">Sin video</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}