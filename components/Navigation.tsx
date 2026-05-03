"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, CheckSquare, LogOut, Bird } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { apiPath } from "@/lib/api";
import NotificationsBell from "./NotificationsBell";
import PushToggle from "./PushToggle";

const tabs = [
  { href: "/courses", label: "Courses", icon: ShoppingCart },
  { href: "/taches", label: "Tâches", icon: CheckSquare },
];

export default function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const prenom = session?.user?.name;

  return (
    <>
      <header className="sticky top-0 z-40 bg-base-900/85 backdrop-blur-xl border-b border-slate-800 pt-[env(safe-area-inset-top)]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/courses" className="flex items-center gap-2 group">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-accent to-accent-dark shadow-lg shadow-accent/30 ring-1 ring-white/10 group-active:scale-95 transition-transform">
              <Bird size={20} strokeWidth={2.4} className="text-white" />
            </span>
            <span className="text-xl font-bold text-white tracking-tight">
              <span className="text-accent">Ni</span>do
            </span>
          </Link>

          <div className="flex items-center gap-1.5">
            {prenom && (
              <div className="flex items-center gap-1.5 mr-1 px-2 py-1 rounded-full bg-base-700/60 border border-slate-700/60">
                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-accent to-accent-dark text-white text-[11px] font-bold flex items-center justify-center">
                  {prenom.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm text-white font-medium pr-0.5">
                  {prenom}
                </span>
              </div>
            )}
            <NotificationsBell />
            <PushToggle />
            <button
              onClick={() => signOut({ callbackUrl: apiPath("/login") })}
              className="btn-ghost p-2 text-slate-400 hover:text-red-400"
              title="Se déconnecter"
              aria-label="Se déconnecter"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <nav
        className="fixed bottom-0 inset-x-0 z-40 bg-base-900/90 backdrop-blur-xl border-t border-slate-800 pb-[env(safe-area-inset-bottom)]"
      >
        <div className="max-w-2xl mx-auto grid grid-cols-2">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 transition-colors ${
                  active ? "text-accent" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.4 : 2} />
                <span className={`text-xs ${active ? "font-semibold" : "font-medium"}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
