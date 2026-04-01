import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import AICoachWidget from "@/components/AICoachWidget";
import SponsorCard from "@/components/SponsorCard";
import Link from "next/link";

export default async function DashboardHome() {
  const session = await getServerSession(authOptions);
  const isCoach = session?.user?.role === "COACH";

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">
          Hola, {session?.user?.name?.split(' ')[0]}
        </h1>
      </div>
      
      {!isCoach && (
        <Link href="/dashboard/chat" className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between hover:scale-[1.02] transition-transform">
          <div>
            <h2 className="text-xl font-bold">Habla con tu Coach Virtual</h2>
            <p className="text-emerald-100 text-sm mt-1">Pregúntame sobre dietas, rutinas o cómo adaptar tu entrenamiento de hoy.</p>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          </div>
        </Link>
      )}
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg">
      </div>
      
      <div className="pt-4">
        <SponsorCard />
      </div>

    </div>
  );
}