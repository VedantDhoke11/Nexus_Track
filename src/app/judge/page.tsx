"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Trophy,
  Users,
  Search,
  LogOut,
  Star,
  CheckCircle,
  Menu,
  ChevronRight,
  ClipboardList,
  Filter,
  Eye,
  Github,
  Monitor,
  Zap,
  MoreHorizontal
} from "lucide-react";
import { getCurrentUser, logout } from "@/lib/auth";
import {
  Submission,
  Hackathon,
  Team,
  NotificationItem,
  ScoreEntry,
  LeaderboardConfig,
  ScoringCriterion,
  JudgeAssignment,
} from "@/lib/data";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Tab = "evaluations" | "stats";

export default function JudgeDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("evaluations");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [hacks, setHacks] = useState<Hackathon[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [assignments, setAssignments] = useState<JudgeAssignment[]>([]);
  const [criteria, setCriteria] = useState<ScoringCriterion[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [leaderboardConfig, setLeaderboardConfig] = useState<LeaderboardConfig>({ visible: true });
  const [judgeEmail, setJudgeEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [hackFilter, setHackFilter] = useState("all");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "judge") { router.push("/login"); return; }
    setJudgeEmail(user.email);

    async function fetchData() {
      try {
        const [s, h, t, sc, a, cr, n, lc] = await Promise.all([
          db.getSubmissions(),
          db.getHackathons(),
          db.getTeams(),
          db.getScoreEntries(),
          db.getJudgeAssignments(),
          db.getScoringCriteria(),
          db.getNotifications(),
          db.getLeaderboardConfig()
        ]);
        setSubs(s);
        setHacks(h);
        setTeams(t);
        setScores(sc);
        setAssignments(a);
        setCriteria(cr);
        setNotifications(n);
        setLeaderboardConfig(lc);

        const profile = await db.getProfileByEmail(user!.email);
        if (profile) setUserName(profile.name);
      } catch (err) {
        console.error("Failed to fetch judge data:", err);
      }
    }
    fetchData();
  }, [router]);

  const handleLogout = () => { logout(); router.push("/login"); };

  const myAssignments = assignments.filter(a => a.judgeEmail === judgeEmail);
  const assignedSubs = subs.filter(s => myAssignments.some(a => a.teamId === s.teamId && a.hackathonId === s.hackathonId));
  
  const displaySubs = assignedSubs.filter(s => {
    const matchHack = hackFilter === "all" ? true : s.hackathonId === hackFilter;
    return matchHack;
  });

  const getScoreForSub = (subId: string) => scores.find(s => s.submissionId === subId && s.judgeEmail === judgeEmail);

  const Sidebar = () => (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 p-6 flex flex-col z-30">
       <div className="flex items-center gap-2 mb-10 pl-2">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-[#4A6CF7]">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold text-slate-900 tracking-tight">NexusTrack</span>
      </div>
      
      <p className="pl-2 mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Judge Console</p>
      <nav className="flex-1 space-y-1">
        {[
          { id: "evaluations", label: "Evaluations queue", icon: <ClipboardList className="h-4 w-4" /> },
          { id: "stats", label: "Event performance", icon: <LayoutDashboard className="h-4 w-4" /> },
        ].map((n) => (
          <button key={n.id} onClick={() => { setTab(n.id as Tab); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === n.id ? "bg-slate-100 text-primary" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}>
            {n.icon} {n.label}
          </button>
        ))}
      </nav>
      <div className="mt-auto border-t border-slate-100 pt-6">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-900 flex">
      <div className="hidden lg:block w-64 flex-shrink-0"><Sidebar /></div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-1.5 hover:bg-slate-100 rounded-md" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5 text-slate-600" /></button>
            <h1 className="text-sm font-semibold text-slate-700 capitalize">{tab} Hub</h1>
          </div>
          <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
             <span className="text-sm font-medium text-slate-900">{userName || judgeEmail}</span>
             <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 ring-2 ring-emerald-500/10">J</div>
          </div>
        </header>

        <main className="p-8 max-w-5xl mx-auto w-full space-y-10">
          
          {tab === "evaluations" && (
            <div className="space-y-8">
               <div className="flex items-end justify-between">
                 <div>
                   <h2 className="text-2xl font-bold text-slate-900">Assigned Evaluations</h2>
                   <p className="text-sm text-slate-500 mt-1">Review, test, and provide scores for the following submissions.</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="relative">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                       <Input placeholder="Filter queue..." className="pl-9 h-9 w-64 text-xs" />
                    </div>
                    <Button variant="outline" size="sm" className="h-9"><Filter className="mr-2 w-4 h-4" /> Sort</Button>
                 </div>
               </div>

               <div className="space-y-3">
                  {displaySubs.length > 0 ? (
                    displaySubs.map(sub => {
                       const score = getScoreForSub(sub.id);
                       const hack = hacks.find(h => h.id === sub.hackathonId);
                       const team = teams.find(t => t.id === sub.teamId);
                       return (
                         <Card key={sub.id} className="p-5 flex items-center gap-6">
                            <div className="w-12 h-12 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold shrink-0">
                               {sub.title[0]}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                               <div className="flex items-center gap-2 mb-0.5">
                                  <h4 className="font-bold text-slate-900 truncate">{sub.title}</h4>
                                  <span className="text-[10px] font-bold text-primary uppercase px-1.5 py-0.5 bg-blue-50 border border-blue-100 rounded">{hack?.title[0]}</span>
                               </div>
                               <p className="text-[11px] text-slate-500 font-medium">Team: {team?.name} • Assigned: Nov 12</p>
                            </div>

                            <div className="flex items-center gap-6 shrink-0 border-l border-slate-100 pl-6">
                               {score ? (
                                 <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Score</p>
                                    <p className="text-lg font-bold text-primary">{score.total}<span className="text-[10px] text-slate-300 ml-0.5">/100</span></p>
                                 </div>
                               ) : (
                                 <span className="text-[10px] font-bold text-amber-600 px-2 py-1 bg-amber-50 rounded border border-amber-100">UNREVIEWED</span>
                               )}
                               <Button size="sm" onClick={() => router.push(`/submission/${sub.id}`)}>
                                 {score ? "Edit" : "Review"} <ChevronRight className="ml-1 w-3.5 h-3.5" />
                               </Button>
                               <button className="text-slate-300 hover:text-slate-500 transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                            </div>
                         </Card>
                       );
                    })
                  ) : (
                    <div className="p-20 text-center bg-white border border-dashed border-slate-200 rounded-xl">
                       <CheckCircle className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                       <p className="text-sm text-slate-400">All evaluations have been successfully completed.</p>
                    </div>
                  )}
               </div>
            </div>
          )}
        </main>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-white"><Sidebar /></div>
        </div>
      )}
    </div>
  );
}
