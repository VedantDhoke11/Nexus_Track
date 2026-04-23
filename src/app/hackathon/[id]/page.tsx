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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hackathons as initialHackathons, Hackathon } from "@/lib/data";

const STORAGE_KEY = "nexustrack_hackathons";

function StatusBadge({ status }: { status: Hackathon["status"] }) {
  if (status === "upcoming")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400 border border-amber-500/40">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        Upcoming
      </span>
    );
  if (status === "ongoing")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/40">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
        In Progress
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-700/30 px-3 py-1 text-xs font-medium text-slate-300 border border-slate-700">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Completed
    </span>
  );
}

export default function HackathonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [hackathons, setHackathons] = useState<Hackathon[]>(initialHackathons);
  const [hack, setHack] = useState<Hackathon | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHackathons(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    const found = hackathons.find((h) => h.id === params.id);
    setHack(found ?? null);
  }, [hackathons, params.id]);

  if (!hack) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-slate-400 text-sm">Hackathon not found.</p>
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            Go back
          </Button>
        </div>
      </main>
    );
  }

  // Derived / fallback fields — extend your Hackathon type as needed
  const themes: string[] = (hack as any).themes ?? [];
  const tracks: string[] = (hack as any).tracks ?? [];
  const teamSize: string = (hack as any).teamSize ?? "1–4 members";
  const mode: string = (hack as any).mode ?? "Online";
  const registrationDeadline: string =
    (hack as any).registrationDeadline ?? hack.startDate;
  const organizer: string = (hack as any).organizer ?? "NexusTrack";
  const website: string | null = (hack as any).website ?? null;
  const timeline: { label: string; date: string; done: boolean }[] =
    (hack as any).timeline ?? [
      { label: "Registrations open", date: registrationDeadline, done: hack.status !== "upcoming" },
      { label: "Hackathon starts", date: hack.startDate, done: hack.status === "completed" || hack.status === "ongoing" },
      { label: "Submissions close", date: hack.endDate, done: hack.status === "completed" },
      { label: "Results announced", date: hack.endDate, done: hack.status === "completed" },
    ];
  const prizes: { rank: string; amount: string }[] =
    (hack as any).prizes ?? [
      { rank: "1st Place", amount: hack.prize },
      { rank: "2nd Place", amount: "TBA" },
      { rank: "3rd Place", amount: "TBA" },
    ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-20">
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
            <Link href="/" className="text-xs sm:text-sm text-slate-300 hover:text-slate-50 flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> All hackathons
            </Link>
            <Link href="/login">
              <Button size="sm">Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero banner */}
      <section className="border-b border-slate-800/80 bg-gradient-to-b from-slate-900/80 to-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-12 space-y-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-300">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-300">{hack.title}</span>
          </nav>

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3 flex-1">
              <StatusBadge status={hack.status} />
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                {hack.title}
              </h1>
              <p className="max-w-2xl text-sm text-slate-300 sm:text-base leading-relaxed">
                {hack.description}
              </p>
              {themes.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {themes.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-xs text-blue-300"
                    >
                      <Tag className="h-2.5 w-2.5" />
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="flex-shrink-0 flex flex-col gap-2 md:items-end">
              <Button size="lg" disabled={hack.status === "completed"}>
                {hack.status === "completed" ? "Registrations closed" : "Register now"}
              </Button>
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
                >
                  <Globe className="h-3 w-3" /> Official website
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left column — details */}
          <div className="md:col-span-2 space-y-6">

            {/* Key stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  icon: <Calendar className="h-4 w-4 text-blue-400" />,
                  label: "Start date",
                  value: hack.startDate,
                },
                {
                  icon: <Calendar className="h-4 w-4 text-rose-400" />,
                  label: "End date",
                  value: hack.endDate,
                },
                {
                  icon: <Users className="h-4 w-4 text-violet-400" />,
                  label: "Team size",
                  value: teamSize,
                },
                {
                  icon: <Globe className="h-4 w-4 text-emerald-400" />,
                  label: "Mode",
                  value: mode,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 space-y-1.5"
                >
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    {item.icon}
                    {item.label}
                  </div>
                  <p className="text-sm font-medium text-slate-100 truncate">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Tracks */}
            {tracks.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Tag className="h-4 w-4 text-blue-400" /> Tracks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {tracks.map((t) => (
                      <span
                        key={t}
                        className="rounded-md border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs text-slate-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" /> Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {timeline.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        {step.done ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Circle className="h-4 w-4 text-slate-600" />
                        )}
                      </div>
                      <div className="flex-1 flex items-center justify-between gap-2">
                        <span
                          className={`text-sm ${
                            step.done ? "text-slate-300" : "text-slate-500"
                          }`}
                        >
                          {step.label}
                        </span>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {step.date}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Right column — prize + meta */}
          <div className="space-y-6">

            {/* Prize breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-400" /> Prizes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {prizes.map((p, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between rounded-md px-3 py-2 text-sm ${
                      idx === 0
                        ? "bg-amber-500/10 border border-amber-500/20"
                        : "bg-slate-800/50 border border-slate-800"
                    }`}
                  >
                    <span
                      className={
                        idx === 0 ? "text-amber-300 font-medium" : "text-slate-400"
                      }
                    >
                      {p.rank}
                    </span>
                    <span
                      className={
                        idx === 0
                          ? "font-bold text-amber-300"
                          : "font-medium text-blue-400"
                      }
                    >
                      {p.amount}
                    </span>
                  </div>
                ))}
                <p className="pt-1 text-xs text-slate-500">
                  Total prize pool:{" "}
                  <span className="text-blue-400 font-medium">{hack.prize}</span>
                </p>
              </CardContent>
            </Card>

            {/* Quick info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {[
                  { label: "Organizer", value: organizer },
                  { label: "Registration deadline", value: registrationDeadline },
                  { label: "Team size", value: teamSize },
                  { label: "Mode", value: mode },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between border-b border-slate-800/60 pb-2 last:border-0 last:pb-0"
                  >
                    <span className="text-slate-500 text-xs">{item.label}</span>
                    <span className="text-slate-200 text-xs font-medium">
                      {item.value}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                className="w-full"
                size="sm"
                disabled={hack.status === "completed"}
              >
                {hack.status === "completed" ? "Registrations closed" : "Register now"}
              </Button>
              <Button variant="outline" className="w-full" size="sm" asChild>
                <Link href="/">← Back to all hackathons</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
