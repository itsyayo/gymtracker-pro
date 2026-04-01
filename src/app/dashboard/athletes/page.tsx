"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Athlete {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  _count: {
    workoutSessions: number;
  };
}

export default function AthletesDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    } else if (status === "authenticated" && session?.user?.role !== "COACH") {
      router.push("/dashboard");
    } else if (status === "authenticated") {
      fetchAthletes();
    }
  }, [status, session, router]);

  const fetchAthletes = async () => {
    try {
      const res = await fetch("/api/athletes");
      if (res.ok) {
        const data = await res.json();
        setAthletes(data);
      }
    } catch (error) {
      console.error("Error al cargar atletas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) return <p className="text-white p-8">Cargando portafolio de atletas...</p>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="border-b border-zinc-800 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold">Mis Atletas</h1>
            <p className="text-zinc-400 mt-1">Supervisa el progreso y asigna rutinas a tus clientes.</p>
          </div>
          <button className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded font-semibold transition-colors">
            + Invitar Atleta
          </button>
        </div>

        {athletes.length === 0 ? (
          <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 text-center">
            <p className="text-zinc-500 mb-4">Aún no tienes atletas asignados a tu cuenta.</p>
            <p className="text-sm text-zinc-600">
              Cuando un usuario se registre e ingrese tu código de entrenador, aparecerá aquí.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {athletes.map((athlete) => (
              <div key={athlete.id} className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-900 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 font-bold text-xl">
                      {(athlete.name || athlete.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white truncate">{athlete.name || "Sin Nombre"}</h2>
                      <p className="text-xs text-zinc-400 truncate">{athlete.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/50 text-center">
                      <span className="block text-2xl font-black text-emerald-400">
                        {athlete._count.workoutSessions}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        Entrenamientos
                      </span>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/50 text-center">
                      <span className="block text-xl font-bold text-zinc-300 mt-1">
                        {new Date(athlete.createdAt).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-1 block">
                        Ingreso
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid border-t border-zinc-800">
                  <Link
                    href={`/dashboard/athletes/${athlete.id}`}
                    className="py-3 text-center text-sm font-medium text-emerald-500 hover:text-emerald-400 hover:bg-zinc-800 transition-colors block"
                  >
                    Ver Bitácora →
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