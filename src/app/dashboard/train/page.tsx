"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Exercise {
  id: string;
  name: string;
  activityType: string;
}

interface LoggedSet {
  exerciseId: string;
  exerciseName: string;
  activityType: string;
  weightKg?: string;
  reps?: string;
  rpe?: string;
  estimated1RM?: number;
  distanceMeters?: string;
  durationSeconds?: string;
}

interface AssignedRoutine {
  id: string;
  name: string;
  exercises: {
    id: string;
    targetSets: number;
    targetReps: string;
    targetRPE: number | null;
    exercise: { id: string; name: string; activityType: string };
  }[];
}

export default function WorkoutLoggerMobile() {
  const { status } = useSession();
  const router = useRouter();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentSets, setCurrentSets] = useState<LoggedSet[]>([]);
  const [assignedRoutines, setAssignedRoutines] = useState<AssignedRoutine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<AssignedRoutine | null>(null);
  
  const [selectedEx, setSelectedEx] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [rpe, setRpe] = useState("");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetchExercises();
      fetchAssignedRoutines();
    }
  }, [status, router]);

  const fetchExercises = async () => {
    const res = await fetch("/api/exercises");
    if (res.ok) {
      const data = await res.json();
      setExercises(data);
      if (data.length > 0) setSelectedEx(data[0].id);
    }
  };

  const fetchAssignedRoutines = async () => {
    const res = await fetch("/api/routines/assigned");
    if (res.ok) {
      const data = await res.json();
      setAssignedRoutines(data);
      if (data.length === 1) setSelectedRoutine(data[0]);
    }
  };

  const currentExerciseObj = exercises.find(e => e.id === selectedEx);
  const isStrength = !currentExerciseObj || currentExerciseObj.activityType === "STRENGTH";

  const handleAddSet = () => {
    const exName = currentExerciseObj?.name || "Desconocido";
    const actType = currentExerciseObj?.activityType || "STRENGTH";

    if (isStrength) {
      if (!weight || !reps) return alert("Falta peso o repeticiones");
      
      const w = parseFloat(weight);
      const r = parseInt(reps);
      const calculated1RM = r === 1 ? w : w * (1 + r / 30);
      
      setCurrentSets([...currentSets, { 
        exerciseId: selectedEx, exerciseName: exName, activityType: actType,
        weightKg: weight, reps, rpe, estimated1RM: parseFloat(calculated1RM.toFixed(2))
      }]);
      
      setReps(""); setRpe("");
    } else {
      if (!distance || !duration) return alert("Falta distancia o tiempo");
      
      setCurrentSets([...currentSets, { 
        exerciseId: selectedEx, exerciseName: exName, activityType: actType,
        distanceMeters: distance, 
        durationSeconds: (parseFloat(duration) * 60).toString() 
      }]);
      
      setDistance(""); setDuration("");
    }
  };

  const handleFinishWorkout = async () => {
    if (currentSets.length === 0) return alert("No has registrado ninguna serie.");
    
    setIsSaving(true);
    const res = await fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        athleteNotes: selectedRoutine ? `Rutina: ${selectedRoutine.name}` : "Entrenamiento libre",
        sets: currentSets
      }),
    });

    if (res.ok) {
      alert("¡Entrenamiento guardado con éxito!");
      setCurrentSets([]);
      router.push("/dashboard/history"); 
    } else {
      alert("Error al guardar");
    }
    setIsSaving(false);
  };

  if (status === "loading") return <p className="p-4 text-white">Cargando...</p>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4 z-10 shadow-md">
        <h1 className="text-2xl font-black text-emerald-400">Entrenamiento Activo</h1>
        <p className="text-sm text-zinc-400">Registra tus marcas en tiempo real</p>
      </div>

      <div className="p-4 space-y-6">
        
        {assignedRoutines.length > 0 && (
          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 shadow-lg flex flex-col max-h-[40vh]">
            <label className="block text-sm font-bold text-zinc-300 mb-2 shrink-0">Plan de hoy</label>
            <select 
              value={selectedRoutine?.id || ""}
              onChange={(e) => {
                const routine = assignedRoutines.find(r => r.id === e.target.value) || null;
                setSelectedRoutine(routine);
              }}
              className="w-full bg-zinc-800 border-2 border-zinc-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-cyan-500 focus:outline-none mb-2 shrink-0"
            >
              <option value="">Entrenamiento Libre</option>
              {assignedRoutines.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>

            {selectedRoutine && selectedRoutine.exercises && (
              <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1 mt-2">
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2">Toca un ejercicio para registrarlo</p>
                {selectedRoutine.exercises.map((item, index) => (
                  <button 
                    key={item.id}
                    onClick={() => setSelectedEx(item.exercise.id)} 
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center ${
                      selectedEx === item.exercise.id 
                        ? "bg-emerald-500/10 border-emerald-500/50" 
                        : "bg-zinc-950 border-zinc-800 hover:border-zinc-600"
                    }`}
                  >
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 shrink-0 ${
                      selectedEx === item.exercise.id ? "bg-emerald-500 text-zinc-900" : "bg-zinc-800 text-zinc-400"
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${selectedEx === item.exercise.id ? "text-emerald-400" : "text-zinc-200"}`}>
                        {item.exercise.name}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {item.targetSets}x{item.targetReps} {item.targetRPE ? `| RPE: ${item.targetRPE}` : ""}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 shadow-lg relative">
          <label className="block text-sm font-bold text-zinc-300 mb-2">Registrando</label>
          <select 
            value={selectedEx} 
            onChange={(e) => setSelectedEx(e.target.value)}
            className="w-full bg-zinc-800 border-2 border-zinc-700 rounded-xl px-4 py-3 text-lg text-white mb-4 focus:border-emerald-500 focus:outline-none"
          >
            {exercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
          </select>

          {isStrength ? (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1 text-center">Peso (Kg)</label>
                <input type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-zinc-800 border-2 border-zinc-700 rounded-xl px-2 py-3 text-center text-xl font-bold text-white focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1 text-center">Reps</label>
                <input type="number" inputMode="numeric" value={reps} onChange={(e) => setReps(e.target.value)} className="w-full bg-zinc-800 border-2 border-zinc-700 rounded-xl px-2 py-3 text-center text-xl font-bold text-white focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1 text-center">RPE</label>
                <input type="number" inputMode="decimal" value={rpe} onChange={(e) => setRpe(e.target.value)} className="w-full bg-zinc-800 border-2 border-zinc-700 rounded-xl px-2 py-3 text-center text-xl font-bold text-zinc-300 focus:border-emerald-500 focus:outline-none" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1 text-center">Distancia (Metros)</label>
                <input type="number" inputMode="decimal" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="Ej: 500" className="w-full bg-zinc-800 border-2 border-zinc-700 rounded-xl px-4 py-3 text-center text-xl font-bold text-cyan-400 focus:border-cyan-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1 text-center">Tiempo (Minutos)</label>
                <input type="number" inputMode="decimal" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Ej: 15.5" className="w-full bg-zinc-800 border-2 border-zinc-700 rounded-xl px-4 py-3 text-center text-xl font-bold text-cyan-400 focus:border-cyan-500 focus:outline-none" />
              </div>
            </div>
          )}

          <button 
            onClick={handleAddSet}
            className={`w-full text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-lg ${isStrength ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900' : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900'}`}
          >
            + Registrar {isStrength ? "Serie" : "Marca"}
          </button>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-zinc-300 border-b border-zinc-800 pb-2">Bitácora de hoy</h2>
          {currentSets.length === 0 ? (
            <p className="text-zinc-500 text-center py-4">Aún no has registrado marcas.</p>
          ) : (
            currentSets.map((set, i) => (
              <div key={i} className={`flex justify-between items-center bg-zinc-900 border p-4 rounded-xl ${set.activityType === 'STRENGTH' ? 'border-zinc-800' : 'border-cyan-900/50'}`}>
                <div className="flex flex-col">
                  <span className={`text-xs font-bold ${set.activityType === 'STRENGTH' ? 'text-emerald-400' : 'text-cyan-400'}`}>
                    {set.activityType === 'STRENGTH' ? `Serie ${i + 1}` : `Set ${i + 1} (Natación/Cardio)`}
                  </span>
                  <span className="font-bold text-lg">{set.exerciseName}</span>
                </div>
                
                {set.activityType === 'STRENGTH' ? (
                  <div className="text-right">
                    <span className="font-black text-xl">{set.weightKg}kg</span>
                    <span className="text-zinc-400 ml-1">x {set.reps}</span>
                    <div className="text-xs text-emerald-500 font-semibold mt-1">
                      1RM Est: {set.estimated1RM}kg
                    </div>
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="font-black text-xl text-cyan-400">{set.distanceMeters}m</span>
                    <div className="text-xs text-zinc-400 font-semibold mt-1">
                      {parseFloat((parseInt(set.durationSeconds || "0") / 60).toFixed(2))} min
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {currentSets.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-950 to-transparent">
          <button 
            onClick={handleFinishWorkout}
            disabled={isSaving}
            className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-black py-4 rounded-xl text-xl shadow-2xl shadow-red-900 disabled:opacity-50"
          >
            {isSaving ? "Guardando..." : "Terminar Entrenamiento"}
          </button>
        </div>
      )}
    </div>
  );
}