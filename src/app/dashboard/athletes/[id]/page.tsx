"use client";

import { useState, useEffect, use } from "react"; 
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import VolumeChart from "@/components/VolumeChart";
import OneRepMaxChart from "@/components/OneRepMaxChart";

export default function AthleteDetailDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const unwrappedParams = use(params);
  const athleteId = unwrappedParams.id;

  const [athlete, setAthlete] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [routines, setRoutines] = useState<any[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (status === "authenticated" && session?.user?.role !== "COACH") router.push("/dashboard");
    else if (status === "authenticated") {
      fetchAthleteDetails();
      fetchCoachRoutines();
    }
  }, [status, session, router]);

  const handleAssignRoutine = async () => {
    if (!selectedRoutine) return;
    setIsAssigning(true);

    const res = await fetch(`/api/athletes/${athleteId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routineId: selectedRoutine }),
    });

    setIsAssigning(false);

    if (res.ok) {
      alert("Rutina asignada exitosamente al atleta.");
      fetchAthleteDetails(); 
    } else {
      alert("Error al asignar la rutina.");
    }
  };

  const fetchCoachRoutines = async () => {
    const res = await fetch("/api/routines");
    if (res.ok) {
      const data = await res.json();
      setRoutines(data);
      if (data.length > 0) setSelectedRoutine(data[0].id);
    }
  };

  const fetchAthleteDetails = async () => {
    try {
      const res = await fetch(`/api/athletes/${athleteId}`);
      if (res.ok) {
        const data = await res.json();
        setAthlete(data);
      } else {
        router.push("/dashboard/athletes");
      }
    } catch (error) {
      console.error("Error cargando detalles:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex justify-center items-center"><p className="text-emerald-500 animate-pulse font-bold text-xl">Cargando expediente...</p></div>;
  if (!athlete) return null;

  const totalWorkouts = athlete.workoutSessions?.length || 0;
  const totalSets = athlete.workoutSessions?.reduce((acc: number, session: any) => acc + session.sets.length, 0) || 0;

  const profile = athlete.profile;

  const getGoalLabel = (goal?: string) => {
    switch(goal) {
      case 'PERDIDA_PESO': return 'Pérdida de Peso';
      case 'HIPERTROFIA': return 'Ganancia Muscular';
      case 'FUERZA': return 'Aumento de Fuerza';
      case 'RESISTENCIA': return 'Resistencia (Cardio)';
      case 'SALUD': return 'Salud General';
      default: return 'No definida';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Cabecera de Navegación y Asignación */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-6 gap-4">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.back()} className="text-zinc-500 hover:text-white transition-colors bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
              ← Volver
            </button>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Expediente del Atleta
            </h1>
          </div>
          
          <div className="flex items-center space-x-2 bg-zinc-900 p-2 rounded-xl border border-zinc-800 shadow-lg">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-2 hidden md:inline">Plan:</span>
            <select
              value={selectedRoutine}
              onChange={(e) => setSelectedRoutine(e.target.value)}
              className="bg-zinc-800 text-sm text-white rounded-lg px-3 py-2 border border-zinc-700 focus:outline-none focus:border-emerald-500 w-full md:w-auto"
            >
              {routines.length === 0 ? <option value="">Sin rutinas creadas</option> : null}
              {routines.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <button
              onClick={handleAssignRoutine}
              disabled={isAssigning || routines.length === 0}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-emerald-900"
            >
              {isAssigning ? "..." : "Asignar"}
            </button>
          </div>
        </div>

        {/* PERFIL MÉDICO Y BIOMÉTRICO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center text-center shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-emerald-900/40 to-transparent"></div>
            <div className="h-24 w-24 rounded-full bg-zinc-950 border-4 border-emerald-500 flex items-center justify-center text-emerald-400 font-black text-4xl mb-4 shadow-2xl relative z-10">
              {(athlete.name || athlete.email).charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold relative z-10">{athlete.name || "Sin Nombre"}</h2>
            <p className="text-zinc-400 text-sm mb-4 relative z-10">{athlete.email}</p>
            <div className="w-full bg-zinc-950/50 rounded-xl p-3 border border-zinc-800/50 mt-auto">
              <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Miembro desde</span>
              <p className="text-zinc-300 font-medium">{new Date(athlete.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="lg:col-span-2 bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-cyan-400 border-b border-zinc-800 pb-3 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Ficha Biométrica y Objetivos
            </h3>
            
            {!profile ? (
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-center">
                <p className="text-zinc-500 text-sm">El atleta aún no ha completado su perfil médico (Onboarding).</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-center">
                  <span className="block text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Edad</span>
                  <span className="text-xl font-black text-white">{profile.age || "--"} <span className="text-xs text-zinc-600 font-normal">años</span></span>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-center">
                  <span className="block text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Estatura</span>
                  <span className="text-xl font-black text-white">{profile.heightCm || "--"} <span className="text-xs text-zinc-600 font-normal">cm</span></span>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-center">
                  <span className="block text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Peso Actual</span>
                  <span className="text-xl font-black text-emerald-400">{profile.currentWeightKg || "--"} <span className="text-xs text-emerald-700 font-normal">kg</span></span>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-center">
                  <span className="block text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Peso Meta</span>
                  <span className="text-xl font-black text-cyan-400">{profile.targetWeightKg || "--"} <span className="text-xs text-cyan-700 font-normal">kg</span></span>
                </div>

                <div className="col-span-2 md:col-span-2 bg-zinc-950 border border-zinc-800 p-3 rounded-xl">
                  <span className="block text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Objetivo Principal</span>
                  <span className="text-sm font-bold text-white bg-zinc-800 px-2 py-1 rounded inline-block">
                    {getGoalLabel(profile.primaryGoal)}
                  </span>
                </div>
                <div className="col-span-2 md:col-span-2 bg-zinc-950 border border-red-900/30 p-3 rounded-xl">
                  <span className="block text-[10px] text-red-500/70 uppercase font-bold tracking-widest mb-1">Condiciones Médicas / Lesiones</span>
                  <p className="text-sm text-zinc-300 italic">
                    {profile.medicalConditions || "Ninguna registrada."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Estadísticas de Entrenamientos */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-center shadow-xl">
            <span className="text-zinc-500 font-bold uppercase tracking-wider text-xs mb-1">Sesiones Completadas</span>
            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
              {totalWorkouts}
            </span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-center shadow-xl">
            <span className="text-zinc-500 font-bold uppercase tracking-wider text-xs mb-1">Series Totales</span>
            <span className="text-5xl font-black text-white">
              {totalSets}
            </span>
          </div>
        </div>

        {/* Gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl overflow-hidden">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-emerald-400">Progresión de Volumen (Pesas)</h3>
            </div>
            <p className="text-sm text-zinc-400 mb-2">Excluye Natación/Cardio.</p>
            <VolumeChart workouts={athlete.workoutSessions} />
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl overflow-hidden">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-cyan-400">Proyección de Fuerza (1RM)</h3>
            </div>
            <p className="text-sm text-zinc-400 mb-2">Estimación Epley según peso y repeticiones.</p>
            <OneRepMaxChart workouts={athlete.workoutSessions} />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-xl font-bold text-emerald-400 mb-6">Actividad Reciente</h3>

          {totalWorkouts === 0 ? (
            <p className="text-zinc-500 italic">El atleta no ha registrado ningún entrenamiento todavía.</p>
          ) : (
            <div className="space-y-4">
              {athlete.workoutSessions.slice(0, 5).map((session: any) => (
                <div key={session.id} className="flex justify-between items-center bg-zinc-950 p-4 rounded-xl border border-zinc-800/50 hover:border-emerald-500/30 transition-colors">
                  <div>
                    <p className="font-bold text-lg text-zinc-200">
                      {new Date(session.endedAt || session.startedAt).toLocaleDateString('es-ES', { weekday: 'short', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">{session.sets.length} series/marcas registradas</p>
                  </div>
                  <Link
                    // 6. AQUÍ USAMOS athleteId EN VEZ DE params.id PARA EVITAR EL ERROR DEL LINK
                    href={`/dashboard/athletes/${athleteId}/workout/${session.id}`}
                    className="text-sm font-medium text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg transition-colors border border-emerald-500/20"
                  >
                    Revisar Detalle
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}