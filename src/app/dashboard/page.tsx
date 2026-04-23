"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import {
  LayoutDashboard,
  Trophy,
  Users,
  Upload,
  Bell,
  BarChart3,
  LogOut,
  Menu,
  CheckCircle,
  Hash,
  ArrowRight,
  Plus,
  Compass,
  Zap,
  Activity,
  Calendar,
  Settings,
  ChevronRight,
  ExternalLink,
  Target,
  Circle,
  Rocket,
  Sparkles,
  Clock
} from "lucide-react";
import { getCurrentUser, logout } from "@/lib/auth";
import {
  Submission,
  Hackathon,
  Team,
  NotificationItem,
  ScoreEntry,
  LeaderboardConfig,
  Round
} from "@/lib/data";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";

type Tab = "home" | "explore" | "team" | "submit" | "notifications" | "leaderboard";

export default function ParticipantDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [hacks, setHacks] = useState<Hackathon[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [leaderboardConfig, setLeaderboardConfig] = useState<LeaderboardConfig>({ visible: true });

  const [registered, setRegistered] = useState<string[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [teamNameInput, setTeamNameInput] = useState("");
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [exploreQuery, setExploreQuery] = useState("");

  const [subForm, setSubForm] = useState({
    title: "",
    description: "",
    pptUrl: "",
    repoUrl: "",
    demoUrl: "",
    hackathonId: "",
    roundId: "",
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "participant") { router.push("/login"); return; }
    setUserEmail(user.email);

    async function fetchData() {
      try {
        const [h, t, s, r, sc, n, lc] = await Promise.all([
          db.getHackathons(),
          db.getTeams(),
          db.getSubmissions(),
          db.getRounds(),
          db.getScoreEntries(),
          db.getNotifications(),
          db.getLeaderboardConfig()
        ]);
        setHacks(h);
        setTeams(t);
        setSubs(s);
        setRounds(r);
        setScores(sc);
        setNotifications(n);
        setLeaderboardConfig(lc);

        const profile = await db.getProfileByEmail(user!.email);
        if (profile) setUserName(profile.name);

        const mt = t.find(team => team.memberEmails.includes(user!.email));
        if (mt) setMyTeam(mt);

        const reg = t.filter(team => team.memberEmails.includes(user!.email)).map(team => team.hackathonId);
        setRegistered(reg);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    }
    fetchData();
  }, [router]);

  const handleLogout = () => { logout(); router.push("/login"); };

  const createTeam = async () => {
    if (!teamNameInput.trim()) return;
    const code = teamNameInput.slice(0, 3).toUpperCase() + Math.floor(Math.random() * 900 + 100);
    const team: Team = {
      id: `team-${Date.now()}`,
      name: teamNameInput,
      code,
      teamNumber: Math.floor(Math.random() * 900) + 100,
      hackathonId: registered[0] ?? hacks[0]?.id ?? "",
      memberEmails: [userEmail],
    };
    
    try {
      await db.createTeam(team);
      setTeams([...teams, team]);
      setMyTeam(team);
      setRegistered([...registered, team.hackathonId]);
      setTeamNameInput("");
    } catch (err) {
      alert("Failed to create team");
    }
  };

  const joinTeam = async () => {
    if (!joinCodeInput.trim()) return;
    const found = teams.find((t) => t.code === joinCodeInput.trim().toUpperCase());
    if (!found) return alert("Security code invalid. Node not found.");
    
    if (found.memberEmails.includes(userEmail)) {
      setMyTeam(found);
      setRegistered(prev => Array.from(new Set([...prev, found.hackathonId])));
      setTab("home");
      return;
    }

    const patched = { ...found, memberEmails: [...found.memberEmails, userEmail] };
    try {
      await db.updateTeam(patched);
      setTeams(teams.map((team) => (team.id === patched.id ? patched : team)));
      setMyTeam(patched);
      setRegistered(prev => Array.from(new Set([...prev, patched.hackathonId])));
      setJoinCodeInput("");
      setTab("home");
      alert("Synchronization successful. Welcome to the squad.");
    } catch (err) { alert("Data corruption: Join failed."); }
  };


  const myHacks = hacks.filter((h) => registered.includes(h.id));
  const mySubs = subs.filter((s) => s.teamId === myTeam?.id);

  const Sidebar = () => (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border/60 p-6 flex flex-col z-30">
      <div className="flex items-center gap-2.5 mb-10 pl-2 group cursor-pointer" onClick={() => router.push("/")}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-sm border border-primary/20 group-hover:scale-110 transition-transform">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="text-xl font-black tracking-tight text-foreground font-sans italic">NexusTrack</span>
      </div>

      <nav className="flex-1 space-y-1">
        {[
          { id: "home", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
          { id: "explore", label: "Explore Market", icon: <Compass className="h-4 w-4" /> },
          { id: "team", label: "Operations Hub", icon: <Users className="h-4 w-4" /> },
          { id: "submit", label: "Project Logic", icon: <Upload className="h-4 w-4" /> },
          { id: "notifications", label: "Notice Feed", icon: <Bell className="h-4 w-4" /> },
          { id: "leaderboard", label: "Global Rank", icon: <BarChart3 className="h-4 w-4" /> },
        ].map((n) => (
          <button
            key={n.id}
            onClick={() => { setTab(n.id as Tab); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              tab === n.id ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {n.icon} {n.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:bg-slate-50">
          <Settings className="h-4 w-4" /> Preferences
        </button>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50">
          <LogOut className="h-4 w-4" /> Terminate Session
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex selection:bg-primary/20">
      {/* Sidebar Desktop */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-10 border-b border-border/60 bg-card/70 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 hover:bg-muted rounded-xl" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex flex-col">
               <h1 className="text-sm font-black text-foreground tracking-widest uppercase">
                 Internal System Node
               </h1>
               <span className="text-[10px] font-bold text-muted-foreground capitalize flex items-center gap-1.5 mt-0.5">
                  <Activity className="w-2.5 h-2.5 text-primary" />
                  Active Session: 04-2026-{tab}
               </span>
            </div>
          </div>
          <div className="flex items-center gap-4 pl-6 border-l border-border">
             <ThemeToggle />
             <div className="flex flex-col items-end">
                <span className="text-sm font-black text-foreground leading-none mb-0.5">{userName || userEmail}</span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Protocol Participant</span>
             </div>
             <div className="w-10 h-10 rounded-2xl bg-primary shadow-md border border-primary/10 flex items-center justify-center text-xs font-black text-white">
               {userName[0]?.toUpperCase() || userEmail[0]?.toUpperCase()}
             </div>
          </div>
        </header>

        {/* Console Hub */}
        <main className="p-10 max-w-7xl mx-auto w-full space-y-12">
          
          {tab === "home" && (
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h2 className="text-4xl font-black text-foreground tracking-tighter">Command Center</h2>
                  <p className="text-muted-foreground font-medium mt-1">Status overview of your current development cycles.</p>
                </div>
                <Button size="sm" className="rounded-xl px-6" onClick={() => setTab("explore")}>Discover New Nodes <ChevronRight className="ml-2 w-4 h-4" /></Button>
              </div>

              {/* High-Impact Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                   { label: "Active Squad", value: myTeam?.name ?? "Independent", icon: <Users className="w-4 h-4" />, color: "bg-indigo-50 text-indigo-600" },
                   { label: "Mission Load", value: myHacks.length, icon: <Trophy className="w-4 h-4" />, color: "bg-slate-900 text-white" },
                   { label: "Artifacts Deployed", value: mySubs.length, icon: <Upload className="w-4 h-4" />, color: "bg-emerald-50 text-emerald-600" },
                   { label: "Sector Rank", value: "#14", icon: <Target className="w-4 h-4" />, color: "bg-amber-50 text-amber-600" },
                 ].map((stat, i) => (
                   <Card key={i} className="p-6 premium-card border-none flex flex-col justify-between h-32">
                     <div className="flex justify-between items-start">
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color} shadow-sm`}>
                          {stat.icon}
                        </div>
                     </div>
                     <p className="text-2xl font-black text-foreground tracking-tighter">{stat.value}</p>
                   </Card>
                 ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-10">
                 {/* Main Operation Feed */}
                 <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                       <Rocket className="w-5 h-5 text-indigo-500" />
                       <h3 className="text-xl font-black text-foreground tracking-tight italic">Assigned Operations</h3>
                    </div>
                    
                    <div className="space-y-4">
                       {myHacks.length > 0 ? (
                         myHacks.map(hack => (
                           <Card key={hack.id} className="p-6 premium-card flex flex-col md:flex-row items-center justify-between group">
                              <div className="flex items-center gap-6">
                                 <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                                   <Circle className={`w-4 h-4 ${hack.status === 'ongoing' ? 'fill-emerald-500 text-emerald-500' : 'text-slate-300'}`} />
                                 </div>
                                 <div>
                                   <h4 className="text-lg font-black text-foreground group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{hack.title}</h4>
                                   <div className="flex items-center gap-3 mt-1">
                                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{hack.startDate}</span>
                                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded-full">{hack.mode}</span>
                                   </div>
                                 </div>
                              </div>
                              <Button variant="ghost" size="sm" className="font-bold text-indigo-600 hover:bg-indigo-50 mt-4 md:mt-0" asChild>
                                 <Link href={`/hackathon/${hack.id}`}>Access Node <ExternalLink className="ml-2 w-3.5 h-3.5" /></Link>
                              </Button>
                           </Card>
                         ))
                       ) : (
                         <div className="bg-white border-2 border-dashed border-slate-100 rounded-3xl p-20 text-center flex flex-col items-center">
                            <Sparkles className="w-12 h-12 text-slate-200 mb-6" />
                            <p className="text-base font-bold text-slate-400 dark:text-slate-500">Registry is currently clear of active assignments.</p>
                            <Button variant="outline" size="sm" className="mt-8 rounded-xl h-11 px-8 border-slate-200" onClick={() => setTab("explore")}>Initialize Discovery</Button>
                         </div>
                       )}
                    </div>
                 </div>

                 {/* Side Notification Feed */}
                 <div className="space-y-8">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                       <Bell className="w-5 h-5 text-indigo-500" />
                       <h3 className="text-xl font-black text-foreground tracking-tight italic">Notice Log</h3>
                    </div>
                    <div className="space-y-4">
                       {notifications.slice(0, 3).map(note => (
                         <div key={note.id} className="p-5 bg-white border border-slate-100 rounded-2xl relative overflow-hidden group hover:border-indigo-200 transition-colors">
                            <div className="absolute top-0 left-0 bottom-0 w-1 bg-indigo-500 group-hover:w-1.5 transition-all"></div>
                            <h5 className="text-sm font-black text-foreground mb-1 uppercase tracking-tight">{note.title}</h5>
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed italic">{note.message}</p>
                         </div>
                       ))}
                       <Button variant="ghost" className="w-full text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-indigo-600 hover:bg-transparent" onClick={() => setTab("notifications")}>Secure full history →</Button>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* OPERATIONS HUB (SQUAD COMMAND) */}
          {tab === "team" && (
            <div className="max-w-4xl mx-auto space-y-12">
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h2 className="text-4xl font-black text-foreground tracking-tighter">Operations Hub</h2>
                    <p className="text-muted-foreground font-medium mt-1">Manage your tactical units and squad synchronization.</p>
                  </div>
                  {myTeam && (
                    <div className="px-6 py-3 bg-primary/10 rounded-2xl border border-primary/20">
                       <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Operational Code</span>
                       <p className="text-xl font-black tracking-widest text-primary leading-none mt-1">{myTeam.code}</p>
                    </div>
                  )}
               </div>

               {myTeam ? (
                 <div className="grid md:grid-cols-3 gap-8">
                    <Card className="md:col-span-2 premium-card p-10 border-none shadow-xl space-y-8">
                       <div className="flex items-center gap-4 border-b border-border/40 pb-6">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-500/20">
                             <Users className="w-6 h-6" />
                          </div>
                          <div>
                             <h3 className="text-xl font-black text-foreground italic uppercase tracking-tight">{myTeam.name}</h3>
                             <p className="text-xs font-bold text-muted-foreground uppercase opacity-60">Strategic Squad Alpha</p>
                          </div>
                       </div>
                       
                       <div className="space-y-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Member Registry</p>
                          <div className="grid grid-cols-1 gap-3">
                             {myTeam.memberEmails.map((email, idx) => (
                               <div key={idx} className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-2xl group hover:border-primary/20 transition-all">
                                  <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-xs font-black text-foreground italic group-hover:scale-110 transition-transform">
                                        {email[0].toUpperCase()}
                                     </div>
                                     <div>
                                        <p className="text-sm font-black text-foreground">{email}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Tactical Member</p>
                                     </div>
                                  </div>
                                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40"></div>
                               </div>
                             ))}
                          </div>
                       </div>
                    </Card>

                    <div className="space-y-8">
                       <Card className="premium-card p-8 bg-indigo-600 text-white border-none shadow-xl shadow-indigo-100 dark:shadow-none">
                          <Zap className="w-8 h-8 mb-4 opacity-50" />
                          <h4 className="text-sm font-black uppercase tracking-tight mb-2">Invite Logic</h4>
                          <p className="text-xs font-medium opacity-80 leading-relaxed mb-6">Share your tactical code with reliable assets to expand your operational unit.</p>
                          <Button variant="outline" className="w-full h-11 rounded-xl bg-white/10 border-white/20 hover:bg-white/20 text-white font-bold border-0" onClick={() => {
                             navigator.clipboard.writeText(myTeam?.code || "");
                             alert("Security code copied to synaptic buffer.");
                          }}>Copy Squad Code</Button>
                       </Card>

                       <Card className="premium-card p-8 border-none shadow-xl space-y-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Mission Status</p>
                          <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                             <span className="text-sm font-black text-foreground italic uppercase">Synchronized</span>
                          </div>
                       </Card>
                    </div>
                 </div>
               ) : (
                 <div className="grid md:grid-cols-2 gap-8">
                    <Card className="premium-card p-10 border-none shadow-xl space-y-8">
                       <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-500/20">
                          <Plus className="w-6 h-6" />
                       </div>
                       <div>
                          <h3 className="text-xl font-black text-foreground italic uppercase tracking-tight">Establish New Node</h3>
                          <p className="text-sm text-muted-foreground font-medium mt-1">Initialize a unique squad for this mission profile.</p>
                       </div>
                       <div className="space-y-4 pt-4">
                          <Input placeholder="Enter Squad Identifier..." value={teamNameInput} onChange={e => setTeamNameInput(e.target.value)} className="h-12 rounded-2xl" />
                          <Button className="w-full h-14 rounded-2xl font-black shadow-md" onClick={createTeam}>Initialize Squad</Button>
                       </div>
                    </Card>

                    <Card className="premium-card p-10 border-none shadow-xl space-y-8">
                       <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                          <Users className="w-6 h-6" />
                       </div>
                       <div>
                          <h3 className="text-xl font-black text-foreground italic uppercase tracking-tight">Sync Existing Squad</h3>
                          <p className="text-sm text-muted-foreground font-medium mt-1">Join an operational unit using a security code.</p>
                       </div>
                       <div className="space-y-4 pt-4">
                          <Input placeholder="Security Code (e.g. VEL772)" value={joinCodeInput} onChange={e => setJoinCodeInput(e.target.value)} className="h-12 rounded-2xl tracking-[0.3em] uppercase" />
                          <Button variant="outline" className="w-full h-14 rounded-2xl font-black shadow-sm" onClick={joinTeam}>Synchronize Squad</Button>
                       </div>
                    </Card>
                 </div>
               )}
            </div>
          )}

          {/* EXPLORE PAGE */}
          {tab === "explore" && (
            <div className="space-y-12">
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                 <div>
                   <h2 className="text-4xl font-black text-foreground tracking-tighter">Global Registry</h2>
                   <p className="text-muted-foreground font-medium mt-1">Select an organizational node to commit your development cycle.</p>
                 </div>
                 <div className="relative group">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600" />
                    <Input placeholder="SCANNING REGISTRY..." value={exploreQuery} onChange={(e) => setExploreQuery(e.target.value)} className="pl-12 w-full md:w-80 h-12 rounded-2xl text-[11px] font-black tracking-widest bg-white border-slate-200" />
                 </div>
               </div>

               <div className="grid md:grid-cols-2 gap-8">
                  {hacks.filter(h => h.title.toLowerCase().includes(exploreQuery.toLowerCase())).map(h => (
                    <Card key={h.id} className="premium-card p-10 border-none shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-125 transition-transform duration-700">
                         <Rocket className="w-40 h-40" />
                       </div>
                       
                       <div className="flex justify-between items-start mb-8">
                          <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${
                            h.status === 'upcoming' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                            {h.status}
                          </div>
                          <span className="text-lg font-black text-indigo-600 tracking-tighter">{h.prize}</span>
                       </div>
                       
                       <h4 className="text-2xl font-black text-foreground mb-3 uppercase tracking-tight italic">{h.title}</h4>
                       <p className="text-sm text-muted-foreground leading-relaxed font-medium mb-10 line-clamp-2">{h.description}</p>
                       
                       <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Protocol Start</span>
                             <span className="text-sm font-bold text-foreground italic">{h.startDate}</span>
                          </div>
                          {registered.includes(h.id) ? (
                            <span className="text-[11px] font-black text-emerald-600 uppercase flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full"><CheckCircle className="w-4 h-4" /> Ready for Launch</span>
                          ) : (
                            <Button className="rounded-xl px-8 h-12 shadow-lg shadow-indigo-100" onClick={() => setTab("team")}>Initialize Mission</Button>
                          )}
                       </div>
                    </Card>
                  ))}
               </div>
            </div>
          )}
          {/* NOTICE FEED (TACTICAL COMMS) */}
          {tab === "notifications" && (
            <div className="max-w-4xl mx-auto space-y-12">
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h2 className="text-4xl font-black text-foreground tracking-tighter">Notice Feed</h2>
                    <p className="text-muted-foreground font-medium mt-1">Real-time tactical broadcasts and mission updates.</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl border border-border">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                     <span className="text-[10px] font-black uppercase tracking-widest">Signal Active</span>
                  </div>
               </div>

               <div className="space-y-6">
                  {notifications.length > 0 ? (
                    notifications.map((note, idx) => (
                      <Card key={note.id} className="premium-card p-8 border-none shadow-xl flex items-start gap-8 relative overflow-hidden group">
                         <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-indigo-600"></div>
                         <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-500/20 flex-shrink-0 group-hover:scale-110 transition-transform">
                            <Bell className="w-6 h-6" />
                         </div>
                         <div className="flex-1 space-y-3">
                            <div className="flex justify-between items-center">
                               <h4 className="text-xl font-black text-foreground tracking-tight italic uppercase">{note.title}</h4>
                               <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 flex items-center gap-2">
                                  <Clock className="w-3 h-3" /> {new Date(note.createdAt).toLocaleDateString()}
                               </span>
                            </div>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed italic">
                               {note.message}
                            </p>
                            <div className="pt-4 flex items-center gap-4">
                               {note.roles.map(role => (
                                 <span key={role} className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] bg-muted text-slate-400 border border-border">
                                    Target: {role}
                                 </span>
                               ))}
                            </div>
                         </div>
                      </Card>
                    ))
                  ) : (
                    <Card className="p-20 text-center bg-card border-none shadow-xl border-dashed flex flex-col items-center">
                       <Zap className="w-16 h-16 text-slate-100 mb-8" />
                       <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">No Active Signals</h3>
                       <p className="text-sm text-slate-500 font-medium mt-2">The communication frequency is currently clear.</p>
                    </Card>
                  )}
               </div>
            </div>
          )}

          {tab === "submit" && (
            <div className="max-w-2xl mx-auto space-y-12">
               <div className="text-center">
                 <h2 className="text-4xl font-black text-foreground dark:text-white tracking-tighter">Project Submission</h2>
                 <p className="text-muted-foreground font-medium mt-1">Deploy your project artifacts to the evaluation nodes.</p>
               </div>

               {!myTeam ? (
                 <Card className="p-12 text-center bg-card border-none shadow-xl border-dashed">
                    <Sparkles className="w-12 h-12 text-slate-200 mx-auto mb-6" />
                    <p className="text-base font-bold text-slate-400 dark:text-slate-500">You must be part of an active squad to submit.</p>
                    <Button variant="outline" className="mt-8 rounded-xl h-11 px-8" onClick={() => setTab("team")}>Join a Squad</Button>
                 </Card>
               ) : (
                 <Card className="premium-card p-10 border-none shadow-2xl space-y-8">
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Project Title</label>
                          <Input placeholder="Operation: Nexus Evolution" value={subForm.title} onChange={(e) => setSubForm({...subForm, title: e.target.value})} className="h-12 rounded-2xl" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Brief Description</label>
                          <Input placeholder="Explain the project logic..." value={subForm.description} onChange={(e) => setSubForm({...subForm, description: e.target.value})} className="h-12 rounded-2xl" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Presentation URI (PPT)</label>
                             <Input placeholder="https://..." value={subForm.pptUrl} onChange={(e) => setSubForm({...subForm, pptUrl: e.target.value})} className="h-12 rounded-2xl" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Repository URI</label>
                             <Input placeholder="https://github.com/..." value={subForm.repoUrl} onChange={(e) => setSubForm({...subForm, repoUrl: e.target.value})} className="h-12 rounded-2xl" />
                          </div>
                       </div>
                    </div>
                    <Button className="w-full h-14 rounded-2xl font-black text-base shadow-md shadow-primary/5" onClick={async () => {
                       if(!subForm.title) return alert("Title required.");
                       const sub: Submission = {
                         id: `sub-${Date.now()}`,
                         teamId: myTeam.id,
                         hackathonId: myTeam.hackathonId,
                         roundId: "initial",
                         title: subForm.title,
                         description: subForm.description,
                         pptUrl: subForm.pptUrl,
                         repoUrl: subForm.repoUrl,
                         demoUrl: subForm.demoUrl,
                         status: "submitted",
                         score: 0
                       };
                       try {
                         await db.createSubmission(sub);
                         setSubs([...subs, sub]);
                         setSubForm({ title: "", description: "", pptUrl: "", repoUrl: "", demoUrl: "", hackathonId: "", roundId: "" });
                         setTab("home");
                         alert("Project deployed successfully. Evaluation node synchronized.");
                       } catch (err) { alert("Transmission failed."); }
                    }}>Deploy Project Artifacts</Button>
                 </Card>
               )}
            </div>
          )}
        </main>
      </div>

      {/* Sidebar Mobile Navigation */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-white transition-transform duration-500"><Sidebar /></div>
        </div>
      )}
    </div>
  );
}

function SearchIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
  );
}
