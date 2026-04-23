"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, User as UserIcon, UserPlus } from "lucide-react";
import { User, UserRole } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";


export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("participant");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill all required fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    async function createAccount() {
      try {
        const existingProfile = await db.getProfileByEmail(email.trim());
        if (existingProfile) {
          setError("An account with this email already exists.");
          setIsSubmitting(false);
          return;
        }

        const nextUser: User = {
          id: `user-${Date.now()}`,
          name: name.trim(),
          email: email.trim(),
          role
        };
        await db.createProfile(nextUser);

        setSuccess("Account created successfully! Please sign in.");
        setTimeout(() => router.push("/login"), 900);
      } catch (err) {
        setError("Could not create account. Please try again.");
        setIsSubmitting(false);
      }
    }
    createAccount();
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md px-4">
        <Card className="border-slate-800/80 bg-slate-900/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserPlus className="h-5 w-5 text-blue-500" />
              Create your account
            </CardTitle>
            <CardDescription>
              Join NexusTrack to set up your profile and explore dashboards.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-slate-400" />
                  Full name
                </label>
                <Input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>

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
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-200">Confirm password</label>
                <Input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-200">Role</label>
                <select
                  className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                >
                  <option value="participant">Participant</option>
                  <option value="judge">Judge</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/60 px-3 py-2 rounded-md">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-sm text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-3 py-2 rounded-md">
                  {success}
                </p>
              )}

              <Button
                type="submit"
                className="w-full mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <div className="text-xs text-slate-400 border-t border-slate-800 pt-4 text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
