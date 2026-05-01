"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ShoppingCart, CheckSquare, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { apiPath } from "@/lib/api";
import type { ActivityItem } from "@/app/api/activity/route";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const STORAGE_KEY = "nido_lastSeenAt";

function getLastSeen(): number {
  if (typeof window === "undefined") return 0;
  const v = localStorage.getItem(STORAGE_KEY);
  return v ? parseInt(v, 10) : 0;
}

function formatRelative(iso: string) {
  const diffSec = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (diffSec < 60) return "à l'instant";
  if (diffSec < 3600) return `il y a ${Math.floor(diffSec / 60)} min`;
  if (diffSec < 86400) return `il y a ${Math.floor(diffSec / 3600)} h`;
  return new Date(iso).toLocaleDateString("fr-CA", { day: "numeric", month: "short" });
}

export default function NotificationsBell() {
  const { data: session } = useSession();
  const me = session?.user?.name ?? null;

  const { data } = useSWR<ActivityItem[]>(apiPath("/api/activity"), fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
  });

  const [open, setOpen] = useState(false);
  const [lastSeenAt, setLastSeenAt] = useState<number>(0);
  const lastFiredRef = useRef<number>(0);

  useEffect(() => {
    setLastSeenAt(getLastSeen());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const items = data ?? [];
  const fromOthers = items.filter((i) => i.updatedBy && i.updatedBy !== me);
  const unseen = fromOthers.filter(
    (i) => new Date(i.updatedAt).getTime() > lastSeenAt
  );
  const count = unseen.length;

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const nav = navigator as Navigator & {
      setAppBadge?: (count?: number) => Promise<void>;
      clearAppBadge?: () => Promise<void>;
    };
    if (count > 0 && nav.setAppBadge) {
      nav.setAppBadge(count).catch(() => {});
    } else if (count === 0 && nav.clearAppBadge) {
      nav.clearAppBadge().catch(() => {});
    }
  }, [count]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    if (document.visibilityState === "visible") return;
    if (unseen.length === 0) return;
    const newest = unseen[0];
    const ts = new Date(newest.updatedAt).getTime();
    if (ts <= lastFiredRef.current) return;
    lastFiredRef.current = ts;

    const verbe = newest.isNew ? "a ajouté" : "a modifié";
    const cible = newest.type === "course" ? "un article" : "une tâche";
    new Notification(`${newest.updatedBy} ${verbe} ${cible}`, {
      body: newest.nom,
      tag: "nido-activity",
      icon: apiPath("/favicon.ico"),
    });
  }, [unseen]);

  function markAllSeen() {
    const now = Date.now();
    localStorage.setItem(STORAGE_KEY, now.toString());
    setLastSeenAt(now);
  }

  function toggleOpen() {
    if (!open) markAllSeen();
    setOpen((v) => !v);
  }

  return (
    <div className="relative">
      <button
        onClick={toggleOpen}
        className="btn-ghost p-2 text-slate-400 hover:text-accent relative"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={18} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-base-900">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-1.5rem)] card overflow-hidden z-50"
            >
              <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Activité récente</span>
                <span className="text-xs text-slate-500">24 dernières h</span>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {items.length === 0 && (
                  <div className="p-6 text-center text-sm text-slate-500">
                    Rien de neuf
                  </div>
                )}
                {items.map((item) => {
                  const isUnseen =
                    item.updatedBy !== me &&
                    new Date(item.updatedAt).getTime() > lastSeenAt;
                  const Icon = item.type === "course" ? ShoppingCart : CheckSquare;
                  const mine = item.updatedBy === me;
                  return (
                    <div
                      key={`${item.type}-${item.id}-${item.updatedAt}`}
                      className={`px-4 py-2.5 border-b border-slate-700/30 last:border-0 flex items-start gap-3 ${
                        isUnseen ? "bg-accent/5" : ""
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          item.type === "course"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-indigo-500/15 text-indigo-400"
                        }`}
                      >
                        {item.isNew ? <Sparkles size={14} /> : <Icon size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200 leading-snug">
                          <span
                            className={`font-medium ${
                              mine ? "text-slate-400" : "text-accent"
                            }`}
                          >
                            {mine ? "Toi" : item.updatedBy ?? "Quelqu'un"}
                          </span>
                          <span className="text-slate-400">
                            {" "}
                            {item.isNew ? "a ajouté" : "a modifié"}
                            {" "}
                          </span>
                          <span className="text-slate-100 font-medium">
                            {item.nom}
                          </span>
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {formatRelative(item.updatedAt)}
                        </p>
                      </div>
                      {isUnseen && (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-accent mt-2" />
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
