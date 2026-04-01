"use client";

import { useState } from "react";
import Link from "next/link";

export default function ClientDashboardLayout({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isCoach = session.user.role === "COACH";

  return (
    <div className="min-h-screen bg-zinc-950 flex font-sans overflow-hidden md:h-screen">
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div 
        className={`fixed md:static inset-y-0 left-0 z-30 h-full bg-zinc-900 flex-shrink-0 transition-all duration-300 ease-in-out shadow-2xl overflow-hidden ${
          isSidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full md:translate-x-0"
        }`}
      >
        <aside className="w-64 h-full border-r border-zinc-800 flex flex-col">
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 tracking-tight">
                GymTracker
              </h2>
              <div className="mt-2 flex flex-col">
                <span className="text-sm font-bold text-white">{session.user.name}</span>
                <span className="text-xs font-semibold text-emerald-500 uppercase tracking-widest mt-1">
                  {session.user.role}
                </span>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <Link href="/dashboard" className="block px-4 py-3 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all">
              Inicio
            </Link>

            {isCoach ? (
              <>
                <div className="pt-4 pb-2">
                  <p className="px-4 text-xs font-bold text-zinc-600 uppercase tracking-wider">Gestión</p>
                </div>
                <Link href="/dashboard/exercises" className="block px-4 py-3 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all">
                  Catálogo de Ejercicios
                </Link>
                <Link href="/dashboard/routines" className="block px-4 py-3 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all">
                  Plantillas de Rutinas
                </Link>
                <Link href="/dashboard/athletes" className="block px-4 py-3 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all">
                  Mis Atletas
                </Link>
              </>
            ) : (
              <>
                <div className="pt-4 pb-2">
                  <p className="px-4 text-xs font-bold text-emerald-400 uppercase tracking-wider">Entrenamiento</p>
                </div>
                <Link href="/dashboard/train" className="block px-4 py-3 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all">
                  Iniciar Entrenamiento
                </Link>
                <Link href="/dashboard/plans" className="block px-4 py-3 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all">
                  Mi Plan
                </Link>
                <Link href="/dashboard/history" className="block px-4 py-3 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all">
                  Mi Historial
                </Link>
                <Link href="/dashboard/chat" className="block px-4 py-3 rounded-lg text-sm font-medium text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 transition-all flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                  Coach Virtual (IA)
                </Link>
              </>
            )}
          </nav>

          <div className="p-4 border-t border-zinc-800">
            <Link href="/api/auth/signout" className="block w-full text-center px-4 py-2 rounded-lg text-sm font-bold text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-colors">
              Cerrar Sesión
            </Link>
          </div>
        </aside>
      </div>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-zinc-950 relative w-full">
        <div className="bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between z-10">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors flex items-center justify-center"
            title={isSidebarOpen ? "Ocultar menú" : "Mostrar menú"}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {!isSidebarOpen && (
             <span className="md:hidden text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
               GymTracker
             </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

    </div>
  );
}