"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bird, LogIn, Eye, EyeOff } from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
import { useCaptions } from "@/components/LanguageProvider";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useCaptions();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      name,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) {
      router.push("/courses");
      router.refresh();
    } else {
      setError(t.login.error);
    }
  }

  return (
    <div className="relative min-h-dvh bg-base-900 flex items-center justify-center px-4">
      <div className="absolute top-4 right-4 pt-[env(safe-area-inset-top)]">
        <LanguageToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center bg-gradient-to-br from-accent to-accent-dark shadow-xl shadow-accent/30 ring-1 ring-white/10">
            <Bird size={40} strokeWidth={2.2} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            <span className="text-accent">Ni</span>do
          </h1>
          <p className="text-slate-400 text-sm">{t.app.tagline}</p>
        </div>

        <form onSubmit={submit} className="card p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-slate-400 font-medium">{t.login.name}</label>
            <input
              className="input"
              placeholder={t.login.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-slate-400 font-medium">{t.login.password}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="input w-full pr-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-200"
                aria-label={showPassword ? t.login.hidePassword : t.login.showPassword}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !name || !password}
            className="btn-primary flex items-center justify-center gap-2 py-2.5 disabled:opacity-50 mt-1"
          >
            <LogIn size={16} />
            {loading ? t.login.submitting : t.login.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
