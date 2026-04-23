"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Users, Shield, Zap, CheckCircle2, BarChart3, Clock, Sparkles, Target, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Hackathon } from "@/lib/data";
import { db } from "@/lib/db";

export default function Home() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);

  useEffect(() => {
    async function fetchHacks() {
      try {
        const hacks = await db.getHackathons();
        setHackathons(hacks);
      } catch (err) {
        console.error("Failed to fetch hackathons:", err);
      }
    }
    fetchHacks();
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-indigo-100">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(circle_at_50%_-20%,rgba(99,102,241,0.1),transparent_50%)]"></div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-card/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-sm border border-border/40 group-hover:scale-110 transition-transform duration-300">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-foreground font-sans">
              Nexus<span className="text-indigo-600">Track.</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-semibold text-muted-foreground hover:text-indigo-600 transition-colors">Features</Link>
            <Link href="#hackathons" className="text-sm font-semibold text-muted-foreground hover:text-indigo-600 transition-colors">Hackathons</Link>
             <Link href="#" className="text-sm font-semibold text-muted-foreground hover:text-indigo-600 transition-colors">Documentation</Link>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login" className="text-sm font-semibold text-muted-foreground hover:text-indigo-600 transition-colors">Log in</Link>
            <Button asChild size="sm" className="rounded-full px-6">
              <Link href="/register">Join the Network</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 px-6 flex flex-col items-center text-center overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-10 animate-bounce cursor-default">
           <Sparkles className="w-3.5 h-3.5" />
           <span>Enterprise ready platform</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-foreground mb-8 max-w-5xl leading-[0.9]">
          Management <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-400">
            Engineered for Innovation.
          </span>
        </h1>
        
        <p className="max-w-2xl text-xl text-muted-foreground mb-12 font-medium leading-relaxed mx-auto italic">
          The ultimate control center for high-stakes hackathons. 
          Scalable, reliable, and exceptionally intuitive.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-6">
          <Button asChild size="lg" className="rounded-2xl h-14 px-10 shadow-xl shadow-indigo-500/25">
            <Link href="/register" className="flex items-center gap-2">
              Launch your event
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="rounded-2xl h-14 px-10 border-slate-200" asChild>
            <Link href="#hackathons">
              Explore Active Missions
            </Link>
          </Button>
        </div>
      </section>

      {/* Stats Board */}
      <div className="max-w-7xl mx-auto px-6 mb-40">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-12 border-y border-slate-200/60 bg-white/40 rounded-3xl backdrop-blur-sm shadow-sm px-10">
           {[
             { label: "Active Nodes", value: "2.4K+", color: "text-indigo-600" },
             { label: "Total Transactions", value: "$4.1M", color: "text-foreground" },
             { label: "Uptime Protocol", value: "99.98%", color: "text-green-600" },
             { label: "Global Reach", value: "82+", color: "text-indigo-400" },
           ].map((stat, i) => (
             <div key={i} className="text-center">
                <p className={`text-4xl font-black tracking-tighter mb-1 ${stat.color}`}>{stat.value}</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
             </div>
           ))}
        </div>
      </div>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 mb-40">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black tracking-tight mb-4">Core Infrastructure</h2>
          <p className="text-muted-foreground font-medium">Built to withstand the most intense development cycles.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Adaptive Pipelines",
              desc: "Automated submission and review workflows that scale with your event density.",
              icon: <Target className="h-6 w-6 text-indigo-600" />
            },
            {
              title: "Unified Registry",
              desc: "Centralized team management with real-time sync across all organizational nodes.",
              icon: <Users className="h-6 w-6 text-indigo-600" />
            },
            {
              title: "Encrypted Scoring",
              desc: "Multi-layered validation protocols for transparent and fair judge evaluations.",
              icon: <Shield className="h-6 w-6 text-indigo-600" />
            }
          ].map((f, i) => (
            <div key={i} className="p-10 premium-card group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-8 border border-indigo-100 group-hover:scale-110 group-hover:bg-indigo-600 transition-all duration-300">
                <div className="group-hover:text-white transition-colors">
                  {f.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Live Hub */}
      <section id="hackathons" className="max-w-7xl mx-auto px-6 pb-40">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-4xl font-black tracking-tight mb-4">Live Hub</h2>
            <p className="text-muted-foreground font-medium">Currently active and upcoming missions across the network.</p>
          </div>
          <Button variant="ghost" size="sm" className="font-bold text-indigo-600 hover:text-indigo-700 hover:bg-transparent" asChild>
            <Link href="/register">View Full Registry <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {hackathons.map((hack) => (
            <Card key={hack.id} className="premium-card flex flex-col group overflow-hidden border-none shadow-xl shadow-slate-200/50">
              <div className="h-4 bg-gradient-to-r from-indigo-600 to-indigo-400 group-hover:h-6 transition-all duration-300"></div>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-4">
                   <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                     hack.status === 'upcoming' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                     hack.status === 'ongoing' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                     'bg-slate-50 text-slate-400 border-slate-100'
                   }`}>
                     {hack.status}
                   </div>
                   <div className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50/50 px-2.5 py-1 rounded-full">
                      <Rocket className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-bold">{hack.mode}</span>
                   </div>
                </div>
                <CardTitle className="text-2xl font-black text-foreground leading-tight">
                  {hack.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 mt-2 font-medium">
                  {hack.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 text-sm space-y-4 pt-4">
                 <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground">
                       <Calendar className="w-4 h-4" />
                       <span className="text-xs font-bold uppercase tracking-wider">Start Date</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">{hack.startDate}</span>
                 </div>
                 <div className="flex justify-between items-center px-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prize Allocation</span>
                    <span className="text-base font-black text-indigo-600 tracking-tighter">{hack.prize}</span>
                 </div>
              </CardContent>
              <CardFooter className="pt-6">
                <Button className="w-full rounded-2xl h-12 shadow-lg shadow-indigo-100" asChild>
                  <Link href={`/hackathon/${hack.id}`}>Secure Intel</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/60 py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
           <div className="space-y-6 max-w-xs">
             <div className="flex items-center gap-2.5">
               <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900">
                 <Zap className="h-4 w-4 text-white" />
               </div>
               <span className="text-xl font-black tracking-tight text-foreground">NexusTrack</span>
             </div>
             <p className="text-sm text-muted-foreground font-medium leading-relaxed">
               The architectural standard for hackathon operations. Powering the world's most ambitious sprints.
             </p>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-3 gap-20">
              <div className="space-y-4">
                 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Network</h4>
                 <ul className="space-y-3">
                    <li><Link href="#" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Nodes</Link></li>
                    <li><Link href="#" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Protocols</Link></li>
                    <li><Link href="#" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Registry</Link></li>
                 </ul>
              </div>
              <div className="space-y-4">
                 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Operations</h4>
                 <ul className="space-y-3">
                    <li><Link href="#" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Support</Link></li>
                    <li><Link href="#" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Security</Link></li>
                    <li><Link href="#" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Docs</Link></li>
                 </ul>
              </div>
              <div className="space-y-4 hidden md:block">
                 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Security</h4>
                 <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100">
                    <Shield className="h-6 w-6 text-slate-400" />
                 </div>
              </div>
           </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-100 flex justify-between items-center">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">© 2026 NEXUSTRACK GLOBAL OPERATIONS.</p>
           <div className="flex gap-6">
              <Zap className="h-4 w-4 text-slate-200" />
              <BarChart3 className="h-4 w-4 text-slate-200" />
              <Users className="h-4 w-4 text-slate-200" />
           </div>
        </div>
      </footer>
    </main>
  );
}
