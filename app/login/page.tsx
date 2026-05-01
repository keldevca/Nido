"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShoppingCart, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
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
      setError("Nom ou mot de passe incorrect.");
    }
  }

  return (
    <div className="min-h-dvh bg-base-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center">
            <ShoppingCart size={28} className="text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            <span className="text-accent">Ni</span>do
          </h1>
          <p className="text-slate-400 text-sm">Courses & tâches partagées</p>
        </div>

        <form onSubmit={submit} className="card p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-slate-400 font-medium">Nom</label>
            <input
              className="input"
              placeholder="Votre nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-slate-400 font-medium">Mot de passe</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
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
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
