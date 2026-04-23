"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Mail, Lock, User, AlertCircle, Zap, ShieldCheck, ChevronRight } from "lucide-react";
import { login } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("user@test.com");
  const [password, setPassword] = useState("user123");
  const [role, setRole] = useState("participant");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const success = await login(email, password, role as any);
      if (success) {
        if (role === "admin") router.push("/admin");
        else if (role === "judge") router.push("/judge");
        else router.push("/dashboard");
      } else {
        setError("Account credentials verification failed.");
      }
    } catch (err) {
      setError("Protocols interrupted. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFB] flex flex-col items-center justify-center p-6 antialiased selection:bg-indigo-100">
      {/* Background Geometric Pattern */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(#E2E8F0_0.5px,transparent_0.5px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]"></div>

      <div className="w-full max-w-md">
        {/* Premium Brand Node */}
        <div className="flex flex-col items-center gap-4 mb-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-200 border border-indigo-400 group cursor-pointer" onClick={() => router.push("/")}>
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground font-sans italic">
            NexusTrack<span className="text-indigo-600">.</span>
          </h1>
        </div>

        <Card className="premium-card border-none shadow-2xl shadow-slate-200/60 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400"></div>
          <CardHeader className="space-y-2 pt-10 pb-8 text-center">
            <CardTitle className="text-3xl font-black text-foreground tracking-tighter">Sign into Hub</CardTitle>
            <CardDescription className="font-medium text-muted-foreground">
              Access your organizational development nodes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100/50 text-rose-600 rounded-2xl text-xs font-bold flex items-center gap-3 animate-shake">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1" htmlFor="email">
                    Node Identifier (Email)
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="alice@nexus.tech"
                      className="pl-12 h-12 rounded-2xl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]" htmlFor="password">
                      Secret Key
                    </label>
                    <Link href="#" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">
                      Recover Key
                    </Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      className="pl-12 h-12 rounded-2xl"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1" htmlFor="role">
                    Access Permission
                  </label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <select
                      id="role"
                      className="flex h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 py-2 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none transition-all shadow-sm"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="participant">Participant Protocol</option>
                      <option value="judge">Official Evaluation Node</option>
                      <option value="admin">System Administration</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full h-14 rounded-2xl font-black text-base shadow-xl shadow-indigo-100" disabled={loading}>
                  {loading ? "Authenticating Node..." : "Initiate Access"}
                  {!loading && <ChevronRight className="ml-2 w-5 h-5" />}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-6 pb-10 pt-6">
             <div className="text-center">
               <span className="text-xs font-medium text-muted-foreground">New node in the network?</span>{" "}
               <Link href="/register" className="text-xs font-black text-indigo-600 hover:underline">
                 Initialize Hub Profile
               </Link>
             </div>
          </CardFooter>
        </Card>

        {/* Development Environment Legend */}
        <div className="mt-12 p-8 bg-white/40 backdrop-blur-sm border border-slate-200/60 rounded-3xl">
           <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 text-center">Development Environment Logins</h4>
           <div className="space-y-4">
              {[
                { r: "Participant", e: "user@test.com", p: "user123" },
                { r: "Judge", e: "judge@test.com", p: "judge123" },
                { r: "Admin", e: "admin@test.com", p: "admin123" },
              ].map(x => (
                <div key={x.r} className="flex items-center justify-between group">
                   <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{x.r}</span>
                   <code className="text-[10px] font-bold text-indigo-600 bg-white border border-slate-100 px-3 py-1.5 rounded-xl shadow-sm group-hover:border-indigo-200 transition-colors">{x.e} / {x.p}</code>
                </div>
              ))}
           </div>
        </div>
        
        <p className="mt-12 text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
           NexusTrack Global Operations Node v.2.4.0
        </p>
      </div>
    </div>
  );
}
