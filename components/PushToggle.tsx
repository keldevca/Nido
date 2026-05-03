"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2, AlertTriangle } from "lucide-react";
import { apiPath } from "@/lib/api";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

type Status =
  | "loading"
  | "unsupported"
  | "needs-pwa"
  | "denied"
  | "off"
  | "on"
  | "error";

export default function PushToggle() {
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);

  function isIosSafari() {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent;
    return /iPhone|iPad|iPod/i.test(ua) && /Safari/i.test(ua);
  }

  function isStandalone() {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true
    );
  }

  async function refresh() {
    if (typeof window === "undefined") return;

    if (
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      setStatus("unsupported");
      return;
    }

    if (isIosSafari() && !isStandalone()) {
      setStatus("needs-pwa");
      return;
    }

    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }

    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      setStatus(sub ? "on" : "off");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function enable() {
    if (!VAPID_PUBLIC_KEY) {
      setStatus("error");
      return;
    }
    setBusy(true);
    try {
      const swUrl = apiPath("/sw.js");
      const scope = apiPath("/") || "/";
      const reg =
        (await navigator.serviceWorker.getRegistration(scope)) ||
        (await navigator.serviceWorker.register(swUrl, { scope }));
      await navigator.serviceWorker.ready;

      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setStatus(perm === "denied" ? "denied" : "off");
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const res = await fetch(apiPath("/api/push/subscribe"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setStatus("on");
    } catch {
      setStatus("error");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch(apiPath("/api/push/unsubscribe"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {});
        await sub.unsubscribe().catch(() => {});
      }
      setStatus("off");
    } catch {
      setStatus("error");
    } finally {
      setBusy(false);
    }
  }

  if (status === "unsupported") return null;

  // États bloqués : un seul indicateur clair
  if (status === "needs-pwa") {
    return (
      <button
        className="btn-ghost p-2 text-amber-400"
        title="Sur iPhone : Partager → Ajouter à l'écran d'accueil pour activer les notifications"
        aria-label="Installer en PWA pour activer les notifications"
        onClick={() =>
          alert(
            "Sur iPhone, les notifications en arrière-plan exigent que Nido soit installé via Safari : Partager → Ajouter à l'écran d'accueil. Ouvre ensuite l'app depuis l'écran d'accueil et reviens ici."
          )
        }
      >
        <AlertTriangle size={18} />
      </button>
    );
  }

  if (status === "denied") {
    return (
      <button
        className="btn-ghost p-2 text-red-400"
        title="Notifications bloquées dans les réglages du navigateur"
        aria-label="Notifications bloquées"
        onClick={() =>
          alert(
            "Les notifications sont bloquées. Va dans les réglages de ton navigateur (ou de l'app sur iPhone) pour les autoriser à nouveau."
          )
        }
      >
        <AlertTriangle size={18} />
      </button>
    );
  }

  // Toggle clair on/off
  const isOn = status === "on";
  const loading = status === "loading" || busy;

  return (
    <button
      onClick={isOn ? disable : enable}
      disabled={loading}
      role="switch"
      aria-checked={isOn}
      aria-label={isOn ? "Désactiver les notifications push" : "Activer les notifications push"}
      title={
        isOn
          ? "Notifications activées — toucher pour désactiver"
          : "Activer les notifications push"
      }
      className={`flex items-center gap-2 px-2 py-1 rounded-full transition-colors disabled:opacity-50 ${
        isOn ? "bg-accent/15" : "bg-slate-700/40 hover:bg-slate-700/70"
      }`}
    >
      <Bell
        size={14}
        className={isOn ? "text-accent" : "text-slate-400"}
      />
      <span
        className={`relative inline-block w-8 h-4 rounded-full transition-colors ${
          isOn ? "bg-accent" : "bg-slate-600"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform flex items-center justify-center ${
            isOn ? "translate-x-4" : "translate-x-0"
          }`}
        >
          {loading && <Loader2 size={8} className="animate-spin text-slate-500" />}
        </span>
      </span>
    </button>
  );
}
