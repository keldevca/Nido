"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, CheckSquare, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { apiPath } from "@/lib/api";
import NotificationsBell from "./NotificationsBell";

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
          <span className="text-xl font-bold text-white tracking-tight">
            <span className="text-accent">Ni</span>do
          </span>

          <div className="flex items-center gap-1">
            {prenom && (
              <span className="hidden sm:inline text-sm text-slate-300 mr-2">
                Salut, <span className="text-white font-medium">{prenom}</span>
              </span>
            )}
            <NotificationsBell />
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
