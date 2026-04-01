// src/app/dashboard/layout.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma"; // IMPORTANTE: Agregar Prisma
import ClientDashboardLayout from "./ClientDashboardLayout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // 1. Si no hay sesión, al login
  if (!session) {
    redirect("/login");
  }

  // 2. REGLA DE NEGOCIO (Onboarding Médico): 
  // Si es un Atleta, verificamos si ya llenó su expediente.
  if (session.user.role === "ATHLETE") {
    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id }
    });

    // Si no existe el perfil, lo expulsamos del dashboard hacia el onboarding
    if (!profile) {
      redirect("/onboarding");
    }
  }

  // 3. Si todo está bien, renderizamos el menú y el contenido
  return (
    <ClientDashboardLayout session={session}>
      {children}
    </ClientDashboardLayout>
  );
}