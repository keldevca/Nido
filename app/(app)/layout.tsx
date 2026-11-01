import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Navigation from "@/components/Navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <main>
      <Navigation />
      <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-4 pb-28">{children}</div>
    </main>
  );
}
