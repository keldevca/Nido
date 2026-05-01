import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Navigation from "@/components/Navigation";
import TachesList from "@/components/taches/TachesList";

export default async function TachesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <main>
      <Navigation />
      <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-4 pb-28">
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Tâches</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Triées par priorité • Sync 5s</p>
        </div>
        <TachesList />
      </div>
    </main>
  );
}
