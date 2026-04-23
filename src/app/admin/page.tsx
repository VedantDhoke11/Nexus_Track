"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Trophy,
  Users,
  FileText,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Menu,
  Bell,
  Settings,
  Zap,
  MoreVertical,
  Activity,
  Calendar,
  Filter,
  Download,
  ShieldAlert,
  ChevronRight,
  Globe
} from "lucide-react";
import { getCurrentUser, logout } from "@/lib/auth";
import {
  Hackathon,
  HackathonStatus,
  Round,
  ScoringCriterion,
  NotificationItem,
  LeaderboardConfig,
} from "@/lib/data";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hacks, setHacks] = useState<Hackathon[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newHack, setNewHack] = useState({
    title: "",
    description: "",
    startDate: "",
    mode: "Online",
    prize: "$0",
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") { router.push("/login"); return; }
    
    async function fetchData() {
      try {
        const [h, r] = await Promise.all([db.getHackathons(), db.getRounds()]);
        setHacks(h);
        setRounds(r);
        setUserEmail(user!.email);
        const profile = await db.getProfileByEmail(user!.email);
        if (profile) setUserName(profile.name);
      } catch (err) { console.error(err); }
    }
    fetchData();
  }, [router]);

  const handleLogout = () => { logout(); router.push("/login"); };

  const createHackathon = async () => {
    if (!newHack.title) return alert("Title is mission-critical.");
    const hack: Hackathon = {
      id: `hack-${Date.now()}`,
      title: newHack.title,
      description: newHack.description,
      startDate: newHack.startDate || new Date().toISOString().split('T')[0],
      endDate: "",
      mode: newHack.mode as any,
      prize: newHack.prize,
      status: "upcoming"
    };
    try {
      await db.saveHackathon(hack);
      setHacks([hack, ...hacks]);
      setShowCreateForm(false);
      setNewHack({ title: "", description: "", startDate: "", mode: "Online", prize: "$0" });
      alert("New organizational node established.");
    } catch (err) { alert("Initialization failed."); }
  };

  const Sidebar = () => (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border/60 p-6 flex flex-col z-30">
      <div className="flex items-center gap-2.5 mb-10 pl-2 group cursor-pointer" onClick={() => router.push("/")}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-sm border border-border/40 group-hover:scale-110 transition-transform">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="text-xl font-black tracking-tight text-foreground font-sans italic">NexusTrack</span>
      </div>
      
      <p className="pl-2 mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Oversight</p>
      <nav className="flex-1 space-y-1">
        {[
          { id: "overview", label: "Protocol Hub", icon: <LayoutDashboard className="h-4 w-4" /> },
          { id: "hacks", label: "Mission Registry", icon: <Trophy className="h-4 w-4" /> },
          { id: "ops", label: "Operational Log", icon: <Activity className="h-4 w-4" /> },
          { id: "security", label: "Access Rules", icon: <ShieldAlert className="h-4 w-4" /> },
        ].map((n) => (
          <button key={n.id} onClick={() => { setTab(n.id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              tab === n.id ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}>
            {n.icon} {n.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-border/60">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors">
          <LogOut className="h-4 w-4" /> Terminate Link
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex selection:bg-primary/20">
      <div className="hidden lg:block w-64 flex-shrink-0"><Sidebar /></div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 flex items-center justify-between px-10 border-b border-border/60 bg-card/70 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 hover:bg-muted rounded-xl" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5 text-muted-foreground" /></button>
            <h1 className="text-sm font-black text-foreground tracking-widest uppercase italic">Administrator Priority Link</h1>
          </div>
          <div className="flex items-center gap-4 pl-6 border-l border-border">
             <ThemeToggle />
             <div className="flex flex-col items-end">
                <span className="text-sm font-black text-foreground leading-none mb-0.5">{userName || userEmail}</span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Global Root</span>
             </div>
             <div className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-white dark:text-foreground flex items-center justify-center text-xs font-black text-white shadow-xl">R</div>
          </div>
        </header>

        <main className="p-10 max-w-7xl mx-auto w-full space-y-12">
          
          {tab === "overview" && (
            <div className="space-y-12">
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h2 className="text-4xl font-black tracking-tighter italic">Command Hub</h2>
                    <p className="text-muted-foreground font-medium mt-1">Live synchronized status of the NexusTrack ecosystem.</p>
                  </div>
                  <Button size="sm" className="h-12 rounded-xl px-8 shadow-md shadow-primary/5" onClick={() => setTab("hacks")}>
                    <Plus className="mr-2 w-4 h-4" /> Initialize Mission
                  </Button>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: "Active Nodes", value: hacks.length, icon: <Trophy className="w-4 h-4" /> },
                    { label: "Phase Cycles", value: rounds.length, icon: <Activity className="w-4 h-4" /> },
                    { label: "Human Units", value: "842", icon: <Users className="w-4 h-4" /> },
                    { label: "Signal Density", value: "92%", icon: <Globe className="w-4 h-4" /> },
                  ].map((stat, i) => (
                    <Card key={i} className="p-6 premium-card border-none flex flex-col justify-between h-32">
                      <div className="flex justify-between items-start">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</p>
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">{stat.icon}</div>
                      </div>
                      <p className="text-2xl font-black tracking-tighter">{stat.value}</p>
                    </Card>
                  ))}
               </div>

               <Card className="premium-card border-none shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 py-6 px-8">
                     <CardTitle className="text-base font-black italic uppercase tracking-tight">Active Operation Log</CardTitle>
                     <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5">Refresh Nodes</Button>
                  </CardHeader>
                  <CardContent className="p-0">
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                           <thead className="bg-muted/50 border-b border-border/40">
                              <tr>
                                 {["Identifier", "Timeline", "Protocol Status", "Actions"].map(h => (
                                   <th key={h} className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{h}</th>
                                 ))}
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-border/40">
                              {hacks.map(h => (
                                <tr key={h.id} className="hover:bg-muted/30 transition-colors group">
                                  <td className="px-8 py-5 font-black text-foreground group-hover:text-primary transition-colors italic">{h.title}</td>
                                  <td className="px-8 py-5 text-muted-foreground font-medium">{h.startDate}</td>
                                  <td className="px-8 py-5">
                                     <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${
                                       h.status === 'upcoming' ? 'bg-indigo-50/50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20' : 
                                       h.status === 'ongoing' ? 'bg-emerald-50/50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' : 
                                       'bg-slate-50/50 text-slate-400 border-slate-100 dark:bg-slate-500/10 dark:border-slate-500/20'
                                     }`}>
                                       {h.status}
                                     </span>
                                  </td>
                                  <td className="px-8 py-5">
                                     <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary"><Edit2 className="w-4 h-4" /></Button>
                                  </td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </CardContent>
               </Card>
            </div>
          )}

          {tab === "hacks" && (
            <div className="space-y-12">
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h2 className="text-4xl font-black tracking-tighter italic">Mission Registry</h2>
                    <p className="text-muted-foreground font-medium mt-1">Configure and deploy new organization nodes.</p>
                  </div>
                  <Button className="h-12 rounded-xl px-8 shadow-md shadow-primary/5" onClick={() => setShowCreateForm(!showCreateForm)}>
                    {showCreateForm ? "Cancel Operation" : "Provision New Node"}
                  </Button>
               </div>

               {showCreateForm && (
                 <Card className="premium-card p-10 border-none shadow-2xl space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Signal Identifier (Title)</label>
                             <Input placeholder="AI Innovation Sprint" value={newHack.title} onChange={e => setNewHack({...newHack, title: e.target.value})} className="h-12 rounded-2xl" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Mission Parameters (Description)</label>
                             <Input placeholder="Describe the mission goal..." value={newHack.description} onChange={e => setNewHack({...newHack, description: e.target.value})} className="h-12 rounded-2xl" />
                          </div>
                       </div>
                       <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Start Protocol</label>
                                <Input type="date" value={newHack.startDate} onChange={e => setNewHack({...newHack, startDate: e.target.value})} className="h-12 rounded-2xl" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Prize Node</label>
                                <Input placeholder="$10,000" value={newHack.prize} onChange={e => setNewHack({...newHack, prize: e.target.value})} className="h-12 rounded-2xl" />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Operational Mode</label>
                             <select 
                                className="flex h-12 w-full rounded-2xl border border-border bg-card px-4 py-2 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all"
                                value={newHack.mode} onChange={e => setNewHack({...newHack, mode: e.target.value})}
                             >
                                <option>Online</option>
                                <option>Hybrid</option>
                                <option>In-Person</option>
                             </select>
                          </div>
                       </div>
                    </div>
                    <Button className="w-full h-14 rounded-2xl font-black text-base shadow-xl" onClick={createHackathon}>Broadcast New Mission</Button>
                 </Card>
               )}

               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {hacks.map(h => (
                    <Card key={h.id} className="premium-card p-8 border-none flex flex-col group">
                       <div className="flex justify-between items-start mb-6">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${
                              h.status === 'upcoming' ? 'bg-indigo-50/50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20' : 
                              h.status === 'ongoing' ? 'bg-emerald-50/50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' : 
                              'bg-slate-50/50 text-slate-400 border-slate-100 dark:bg-slate-500/10 dark:border-slate-500/20'
                            }`}>
                              {h.status}
                          </span>
                          <span className="text-xs font-black text-primary uppercase tracking-widest">{h.mode}</span>
                       </div>
                       <h4 className="text-xl font-black tracking-tight italic mb-3 group-hover:text-primary transition-colors">{h.title}</h4>
                       <p className="text-xs font-medium text-muted-foreground line-clamp-2 mb-8">{h.description}</p>
                       <div className="mt-auto flex justify-between items-center pt-6 border-t border-border/40">
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black text-muted-foreground uppercase">Launch</span>
                             <span className="text-sm font-bold italic">{h.startDate}</span>
                          </div>
                          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 text-primary transition-all group-hover:translate-x-1"><ChevronRight className="w-5 h-5" /></Button>
                       </div>
                    </Card>
                  ))}
               </div>
            </div>
          )}
        </main>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-card transition-transform duration-500"><Sidebar /></div>
        </div>
      )}
    </div>
  );
}
