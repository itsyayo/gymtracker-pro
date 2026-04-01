import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Link from "next/link";
import { redirect } from "next/navigation";


export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-50 p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-6">
          GymTracker Pro
        </h1>
        
        <div className="space-y-4">
          <p className="text-zinc-400 mb-6">Bienvenido. Inicia sesión para continuar.</p>
          <Link 
            href="/api/auth/signin"
            className="block w-full bg-emerald-500 hover:bg-emerald-600 text-white transition-colors py-2 rounded-lg font-bold shadow-lg shadow-emerald-500/20"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </main>
  );
}