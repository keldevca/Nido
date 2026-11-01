"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { apiPath } from "@/lib/api";
import { useCaptions } from "./LanguageProvider";
import NotificationsBell from "./NotificationsBell";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function Pill({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 pl-1 pr-1.5 py-0.5 rounded-full bg-base-700/60 border border-slate-700/60">
      <NotificationsBell />
      {children}
    </div>
  );
}

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
  const { t } = useCaptions();
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

  if (status === "unsupported") return <Pill />;

  // États bloqués : un seul indicateur clair
  if (status === "needs-pwa") {
    return (
      <Pill>
        <button
          className="flex p-1 text-amber-400"
          title={t.push.needsPwaTitle}
          aria-label={t.push.needsPwaLabel}
          onClick={() => alert(t.push.needsPwaAlert)}
        >
          <AlertTriangle size={16} />
        </button>
      </Pill>
    );
  }

  if (status === "denied") {
    return (
      <Pill>
        <button
          className="flex p-1 text-red-400"
          title={t.push.deniedTitle}
          aria-label={t.push.deniedLabel}
          onClick={() => alert(t.push.deniedAlert)}
        >
          <AlertTriangle size={16} />
        </button>
      </Pill>
    );
  }

  // Toggle clair on/off
  const isOn = status === "on";
  const loading = status === "loading" || busy;

  return (
    <Pill>
      <button
        onClick={isOn ? disable : enable}
        disabled={loading}
        role="switch"
        aria-checked={isOn}
        aria-label={isOn ? t.push.disable : t.push.enable}
        title={isOn ? t.push.onTitle : t.push.enable}
        className="flex disabled:opacity-50"
      >
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
    </Pill>
  );
}
