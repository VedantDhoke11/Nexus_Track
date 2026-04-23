"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, LogIn, Mail } from "lucide-react";
import { login } from "@/lib/auth";
import type { UserRole } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const ROLES: { label: string; value: UserRole }[] = [
  { label: "Admin", value: "admin" },
  { label: "Participant", value: "participant" },
  { label: "Judge", value: "judge" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("user@test.com");
  const [password, setPassword] = useState("user123");
  const [role, setRole] = useState<UserRole>("participant");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);

    const user = login(email, password, role);

    if (!user) {
      setError("Invalid credentials or role. Use one of the test accounts.");
      setIsSubmitting(false);
      return;
    }

    if (user.role === "admin") {
      router.push("/admin");
    } else if (user.role === "judge") {
      router.push("/judge");
    } else {
      router.push("/dashboard");
    }
  };

  const showPlaceholder = () => {
    setError(null);
    setInfo("Password reset is simulated in this frontend demo.");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md px-4">
        <Card className="border-slate-800/80 bg-slate-900/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <LogIn className="h-5 w-5 text-blue-500" />
              Sign in to NexusTrack
            </CardTitle>
            <CardDescription>
              Use one of the test accounts to explore the different dashboards.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  Email
                </label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-slate-400" />
                  Password
                </label>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-200">
                  Role
                </label>
                <select
                  className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/60 px-3 py-2 rounded-md">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            {info && (
              <p className="text-sm text-blue-300 bg-blue-950/40 border border-blue-900/60 px-3 py-2 rounded-md">
                {info}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={showPlaceholder}
                className="hover:text-slate-100 transition-colors"
              >
                Forgot password?
              </button>
              <Link
                href="/register"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Create account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

