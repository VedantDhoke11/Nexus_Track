"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Rocket, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { hackathons as initialHackathons, Hackathon } from "@/lib/data";

const STORAGE_KEY = "nexustrack_hackathons";

export default function Home() {
  const [hackathons, setHackathons] = useState<Hackathon[]>(initialHackathons);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHackathons(JSON.parse(raw));
    } catch {}
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/10 border border-blue-500/40">
              <Rocket className="h-4 w-4 text-blue-400" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-slate-50">
              NexusTrack
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="#hackathons"
              className="text-xs sm:text-sm text-slate-300 hover:text-slate-50"
            >
              View hackathons
            </Link>
            <Link href="/login">
              <Button size="sm">Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-16 text-center md:flex-row md:items-start md:text-left">
          <div className="flex-1 space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-xs text-slate-300">
              <Calendar className="h-3 w-3 text-blue-400" />
              Manage hackathons, teams & judging in one place.
            </p>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                Run hackathons with clarity,
                <span className="text-blue-400"> not chaos.</span>
              </h1>
              <p className="max-w-xl text-sm text-slate-300 sm:text-base">
                NexusTrack helps admins, participants, and judges coordinate
                hackathons from one streamlined dashboard — no extra tooling or
                backend setup required.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="#hackathons" className="flex items-center gap-2">
                  View Hackathons
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Sign in as test user</Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                No backend required — localStorage only.
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3 text-slate-500" />
                Admin · Participant · Judge views.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hackathon cards */}
      <section
        id="hackathons"
        className="bg-slate-950/60 py-10 border-b border-slate-800/80"
      >
        <div className="mx-auto max-w-6xl px-4 space-y-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Live & upcoming hackathons
              </h2>
              <p className="text-sm text-slate-400">
                Explore a few sample events wired to local mock data.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {hackathons.map((hack) => (
              <Card key={hack.id} className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">
                    {hack.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {hack.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs sm:text-sm">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>
                      {hack.startDate} → {hack.endDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Prize pool</span>
                    <span className="font-medium text-blue-400">
                      {hack.prize}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Status</span>
                    <span
                      className={
                        hack.status === "upcoming"
                          ? "rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400 border border-amber-500/40"
                          : hack.status === "ongoing"
                          ? "rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/40"
                          : "rounded-full bg-slate-700/30 px-2 py-0.5 text-xs font-medium text-slate-200 border border-slate-700"
                      }
                    >
                      {hack.status === "upcoming"
                        ? "Upcoming"
                        : hack.status === "ongoing"
                        ? "In progress"
                        : "Completed"}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    {/* ✅ Points to src/app/hackathon/[id]/page.tsx */}
                    <Link href={`/hackathon/${hack.id}`}>View details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
