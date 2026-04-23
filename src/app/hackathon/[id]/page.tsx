"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Rocket,
  Calendar,
  Trophy,
  Users,
  Clock,
  Tag,
  Globe,
  CheckCircle2,
  Circle,
  ChevronRight,
  Zap,
  Activity,
  ArrowRight,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Hackathon } from "@/lib/data";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HackathonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [hack, setHack] = useState<Hackathon | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getCurrentUser());
    async function fetchHack() {
      try {
        const hacks = await db.getHackathons();
        const found = hacks.find((h) => h.id === params.id);
        setHack(found ?? null);
      } catch (err) {
        console.error("Failed to fetch hackathon:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHack();
  }, [params.id]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary font-black italic tracking-widest animate-pulse">SYNCHRONIZING HUB...</div>;

  if (!hack) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto">
             <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black tracking-tighter uppercase italic">Registry Node Not Found</h2>
          <Button variant="outline" className="rounded-xl h-11 px-8" onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Registry
          </Button>
        </div>
      </main>
    );
  }

  const teamSize = "1–4 members";
  const mode = hack.mode || "Online";
  const timeline = [
    { label: "Registrations open", date: hack.startDate, done: hack.status !== "upcoming" },
    { label: "Hackathon starts", date: hack.startDate, done: hack.status === "completed" || hack.status === "ongoing" },
    { label: "Submissions close", date: hack.endDate || "2026-03-12", done: hack.status === "completed" },
    { label: "Results announced", date: hack.endDate || "2026-03-12", done: hack.status === "completed" },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Navbar */}
      <header className="h-20 flex items-center justify-between px-6 md:px-12 border-b border-border/60 bg-card/70 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push("/")}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-sm border border-primary/20 group-hover:scale-110 transition-transform">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-foreground font-sans italic">
            Nexus<span className="text-indigo-600">Track.</span>
          </span>
        </div>

        <div className="flex items-center gap-6">
          <ThemeToggle />
          {user ? (
            <Link href="/dashboard" className="flex items-center gap-3 py-2 px-4 bg-muted rounded-xl hover:bg-primary/5 transition-all group">
               <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-xs font-black text-foreground leading-none">{user.name || user.email}</span>
                  <span className="text-[9px] font-bold text-primary uppercase tracking-widest mt-0.5">Active Session</span>
               </div>
               <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-[10px] font-black text-white italic group-hover:scale-110 transition-transform">
                 {user.email[0].toUpperCase()}
               </div>
            </Link>
          ) : (
            <Button size="sm" className="rounded-xl px-6" asChild>
               <Link href="/login">Initialize Access</Link>
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 border-b border-border/40 overflow-hidden">
         <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-20%,rgba(99,102,241,0.05),transparent_50%)]"></div>
         
         <div className="mx-auto max-w-7xl px-6 md:px-12 space-y-8">
            <nav className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <Link href="/" className="hover:text-primary transition-colors">Registry</Link>
              <ChevronRight className="h-3 w-3 opacity-40" />
              <span className="text-foreground">{hack.title}</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-12">
               <div className="max-w-3xl space-y-6">
                  <div className="flex items-center gap-3">
                     <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${
                        hack.status === 'upcoming' ? 'bg-indigo-50/50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20' : 
                        hack.status === 'ongoing' ? 'bg-emerald-50/50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' : 
                        'bg-slate-50/50 text-slate-400 border-slate-100 dark:bg-slate-500/10 dark:border-slate-500/20'
                      }`}>
                        {hack.status}
                     </span>
                     <span className="text-xs font-bold text-primary uppercase flex items-center gap-1.5 ml-2">
                        <Activity className="w-3.5 h-3.5" />
                        Live Synchronized Node
                     </span>
                  </div>
                  
                  <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground leading-[0.9] italic">
                     {hack.title}
                  </h1>
                  
                  <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed italic border-l-4 border-primary/20 pl-6">
                     {hack.description}
                  </p>

                  <div className="flex flex-wrap gap-3 pt-4 font-bold">
                     {["AI/ML", "Web3 Infrastructure", "SaaS Optimization"].map(tag => (
                        <span key={tag} className="text-[10px] uppercase tracking-widest px-3 py-1.5 bg-muted rounded-lg border border-border text-muted-foreground">
                           {tag}
                        </span>
                     ))}
                  </div>
               </div>

               <div className="flex-shrink-0 flex flex-col gap-4">
                  <Card className="premium-card p-10 border-none shadow-2xl bg-card/40 backdrop-blur-sm min-w-[320px]">
                     <div className="space-y-6">
                        <div className="flex items-center justify-between">
                           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Prize Allocation</p>
                           <Trophy className="w-5 h-5 text-amber-500" />
                        </div>
                        <p className="text-5xl font-black tracking-tighter text-foreground italic">{hack.prize}</p>
                        <hr className="border-border/40" />
                        <Button className="w-full h-14 rounded-2xl font-black text-base shadow-xl shadow-primary/10" disabled={hack.status === "completed"} asChild={hack.status !== "completed"}>
                           {hack.status === "completed" ? (
                             "MISSION COMPLETED"
                           ) : (
                             <Link href="/register">INITIALIZE REGISTRATION <ArrowRight className="ml-2 w-4 h-4" /></Link>
                           )}
                        </Button>
                     </div>
                  </Card>
               </div>
            </div>
         </div>
      </section>

      {/* Key Info Grid */}
      <section className="mx-auto max-w-7xl px-6 md:px-12 py-20">
         <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
               {/* Metrics */}
               <div className="grid sm:grid-cols-3 gap-6">
                  {[
                    { label: "Tactical Start", value: hack.startDate, icon: <Calendar className="w-4 h-4 text-primary" /> },
                    { label: "Squad Capacity", value: teamSize, icon: <Users className="w-4 h-4 text-primary" /> },
                    { label: "Mission Mode", value: mode, icon: <Globe className="w-4 h-4 text-primary" /> },
                  ].map((item, i) => (
                    <Card key={i} className="premium-card p-6 border-none shadow-xl flex flex-col justify-between h-32">
                       <div className="flex justify-between items-center opacity-60">
                          <p className="text-[10px] font-black uppercase tracking-widest">{item.label}</p>
                          {item.icon}
                       </div>
                       <p className="text-base font-black italic uppercase tracking-tight">{item.value}</p>
                    </Card>
                  ))}
               </div>

               {/* Timeline Node */}
               <Card className="premium-card p-10 border-none shadow-2xl space-y-8">
                  <div className="flex items-center gap-3 border-b border-border/40 pb-6">
                     <Clock className="w-5 h-5 text-primary" />
                     <h3 className="text-xl font-black italic uppercase tracking-tight">Mission Timeline</h3>
                  </div>
                  <div className="space-y-6">
                     {timeline.map((step, idx) => (
                        <div key={idx} className="flex items-center justify-between group">
                           <div className="flex items-center gap-4">
                              <div className={`w-2.5 h-2.5 rounded-full ${step.done ? "bg-emerald-500 shadow-lg shadow-emerald-500/40" : "bg-muted border border-border"}`}></div>
                              <span className={`text-sm font-bold italic uppercase tracking-tight transition-all ${step.done ? "text-foreground" : "text-muted-foreground opacity-40 group-hover:opacity-100"}`}>
                                 {step.label}
                              </span>
                           </div>
                           <span className="text-[11px] font-black text-muted-foreground opacity-60 tracking-widest">{step.date}</span>
                        </div>
                     ))}
                  </div>
               </Card>
            </div>

            <div className="space-y-12">
               <Card className="premium-card p-10 border-none shadow-2xl space-y-8 bg-muted/20">
                  <div className="flex items-center gap-3 border-b border-border/40 pb-6">
                     <Tag className="w-5 h-5 text-primary" />
                     <h3 className="text-xl font-black italic uppercase tracking-tight">Operational Tracks</h3>
                  </div>
                  <div className="space-y-4">
                     {["DeFi Optimization", "Security & Auditing", "UX Orchestration"].map((t, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-background border border-border rounded-2xl group hover:border-primary/20 transition-all">
                           <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary font-black text-xs italic">0{idx+1}</div>
                           <span className="text-sm font-bold text-foreground italic uppercase tracking-tight">{t}</span>
                        </div>
                     ))}
                  </div>
               </Card>

               <Card className="premium-card p-8 border-none shadow-xl flex flex-col items-center text-center space-y-6">
                  <Sparkles className="w-10 h-10 text-indigo-200" />
                  <div>
                    <h4 className="text-base font-black italic uppercase tracking-tight">Need a Tactical Unit?</h4>
                    <p className="text-xs font-medium text-muted-foreground mt-2 px-6">Synchronize with other participants in the Global Registry hub.</p>
                  </div>
                  <Button variant="outline" className="w-full rounded-2xl h-12" onClick={() => router.push("/register")}>Visit Squad Registry</Button>
               </Card>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-muted/10">
         <div className="mx-auto max-w-7xl px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3 opacity-40">
               <Zap className="h-4 w-4" />
               <span className="text-sm font-black tracking-widest italic uppercase">NexusTrack Protocol v2.4</span>
            </div>
            <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
               <a href="#" className="hover:text-primary transition-colors">Privacy Node</a>
               <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
               <a href="#" className="hover:text-primary transition-colors">Contact Root</a>
            </div>
         </div>
      </footer>
    </main>
  );
}
