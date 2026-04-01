"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    age: "",
    heightCm: "",
    currentWeightKg: "",
    medicalConditions: "",
    primaryGoal: "HIPERTROFIA",
    targetWeightKg: "",
    targetWaistCm: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      alert("Hubo un error al guardar tu perfil. Intenta de nuevo.");
      setIsSaving(false);
    }
  };

  if (status === "loading") return <p className="p-8 text-white">Cargando...</p>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-10 shadow-2xl">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
            ¡Bienvenido, {session?.user?.name?.split(' ')[0] || "Atleta"}!
          </h1>
          <p className="text-zinc-400">
            Para que tu entrenador y nuestro sistema puedan personalizar tu experiencia, necesitamos conocer tu punto de partida.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* SECCIÓN 1: Biometría y Salud */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b border-zinc-800 pb-2 text-emerald-400">1. Biometría y Salud</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Edad</label>
                <input type="number" required value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none" placeholder="Años" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Estatura (cm)</label>
                <input type="number" required value={formData.heightCm} onChange={e => setFormData({...formData, heightCm: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none" placeholder="Ej: 175" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Peso Actual (kg)</label>
                <input type="number" step="0.1" required value={formData.currentWeightKg} onChange={e => setFormData({...formData, currentWeightKg: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none" placeholder="Ej: 75.5" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Condiciones Médicas / Lesiones (Opcional)</label>
              <textarea value={formData.medicalConditions} onChange={e => setFormData({...formData, medicalConditions: e.target.value})} rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 focus:border-emerald-500 focus:outline-none" placeholder="Ej: Asma, lesión en rodilla derecha hace 2 años..." />
            </div>
          </div>

          {/* SECCIÓN 2: Metas */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b border-zinc-800 pb-2 text-cyan-400">2. Tus Metas</h2>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Objetivo Principal</label>
              <select value={formData.primaryGoal} onChange={e => setFormData({...formData, primaryGoal: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 focus:border-cyan-500 focus:outline-none">
                <option value="PERDIDA_PESO">Pérdida de Peso / Definición</option>
                <option value="HIPERTROFIA">Ganancia Muscular (Hipertrofia)</option>
                <option value="FUERZA">Aumento de Fuerza Máxima</option>
                <option value="RESISTENCIA">Resistencia Cardiovascular</option>
                <option value="SALUD">Salud General y Movilidad</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Peso Objetivo (kg) - Opcional</label>
                <input type="number" step="0.1" value={formData.targetWeightKg} onChange={e => setFormData({...formData, targetWeightKg: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 focus:border-cyan-500 focus:outline-none" placeholder="Ej: 70.0" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Meta de Cintura (cm) - Opcional</label>
                <input type="number" step="0.1" value={formData.targetWaistCm} onChange={e => setFormData({...formData, targetWaistCm: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 focus:border-cyan-500 focus:outline-none" placeholder="Ej: 85.0" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={isSaving} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-lg py-4 rounded-xl transition-colors shadow-lg shadow-emerald-900 mt-4">
            {isSaving ? "Guardando Perfil..." : "Comenzar mi Entrenamiento →"}
          </button>
        </form>
      </div>
    </div>
  );
}
