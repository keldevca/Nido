"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ShoppingCart, ShoppingBag, CheckSquare, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { apiPath } from "@/lib/api";
import type { ActivityItem } from "@/app/api/activity/route";
import type { Captions } from "@/lib/captions";
import { useCaptions } from "./LanguageProvider";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const STORAGE_KEY = "nido_lastSeenAt";

const TYPE_STYLES = {
  course: { icon: ShoppingCart, className: "bg-emerald-500/15 text-emerald-400" },
  purchase: { icon: ShoppingBag, className: "bg-amber-500/15 text-amber-400" },
  tache: { icon: CheckSquare, className: "bg-indigo-500/15 text-indigo-400" },
};

function getLastSeen(): number {
  if (typeof window === "undefined") return 0;
  const v = localStorage.getItem(STORAGE_KEY);
  return v ? parseInt(v, 10) : 0;
}

function formatRelative(iso: string, t: Captions) {
  const diffSec = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (diffSec < 60) return t.activity.justNow;
  if (diffSec < 3600) return t.activity.minutesAgo(Math.floor(diffSec / 60));
  if (diffSec < 86400) return t.activity.hoursAgo(Math.floor(diffSec / 3600));
  return new Date(iso).toLocaleDateString(t.locale, { day: "numeric", month: "short" });
}

export default function NotificationsBell() {
  const { t } = useCaptions();
  const { data: session } = useSession();
  const me = session?.user?.name ?? null;

  const { data } = useSWR<ActivityItem[]>(apiPath("/api/activity"), fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
  });

  const [open, setOpen] = useState(false);
  const [lastSeenAt, setLastSeenAt] = useState(getLastSeen);
  const lastFiredRef = useRef<number>(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    function closeOnOutsideClick(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [open]);

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

    const verb = newest.isNew ? t.activity.added : t.activity.updated;
    const target = newest.type === "tache" ? t.activity.aTask : t.activity.anItem;
    new Notification(`${newest.updatedBy} ${verb} ${target}`, {
      body: newest.nom,
      tag: "nido-activity",
      icon: apiPath("/favicon.ico"),
    });
  }, [unseen, t]);

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
    <div ref={rootRef}>
      <button
        onClick={toggleOpen}
        className="relative flex p-1 rounded-full text-slate-300 hover:text-accent transition-colors"
        aria-label="Notifications"
        aria-expanded={open}
        title="Notifications"
      >
        <Bell size={16} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none flex items-center justify-center ring-2 ring-base-900">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-4 top-full mt-2 w-80 max-w-[calc(100%-2rem)] card overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
              <span className="text-sm font-semibold text-white">{t.activity.title}</span>
              <span className="text-xs text-slate-500">{t.activity.window}</span>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 && (
                <div className="p-6 text-center text-sm text-slate-500">
                  {t.activity.empty}
                </div>
              )}
              {items.map((item) => {
                const isUnseen =
                  item.updatedBy !== me &&
                  new Date(item.updatedAt).getTime() > lastSeenAt;
                const { icon: Icon, className: typeClassName } = TYPE_STYLES[item.type];
                const mine = item.updatedBy === me;
                return (
                  <div
                    key={`${item.type}-${item.id}-${item.updatedAt}`}
                    className={`px-4 py-2.5 border-b border-slate-700/30 last:border-0 flex items-start gap-3 ${
                      isUnseen ? "bg-accent/5" : ""
                    }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${typeClassName}`}>
                      {item.isNew ? <Sparkles size={14} /> : <Icon size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 leading-snug break-words">
                        <span
                          className={`font-medium ${
                            mine ? "text-slate-400" : "text-accent"
                          }`}
                        >
                          {mine ? t.activity.you : item.updatedBy ?? t.activity.someone}
                        </span>
                        <span className="text-slate-400">
                          {" "}
                          {item.isNew ? t.activity.added : t.activity.updated}
                          {" "}
                        </span>
                        <span className="text-slate-100 font-medium">
                          {item.nom}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatRelative(item.updatedAt, t)}
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
        )}
      </AnimatePresence>
    </div>
  );
}
