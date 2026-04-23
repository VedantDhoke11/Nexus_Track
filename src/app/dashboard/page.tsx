"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Trophy, Users, Upload, LogOut, Menu,
  Plus, Hash, CheckCircle, ExternalLink, Bell, BarChart3
} from "lucide-react";
import { getCurrentUser, logout } from "@/lib/auth";
import {
  Hackathon, Team, Submission, Round, NotificationItem, ScoreEntry, LeaderboardConfig
} from "@/lib/data";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    upcoming: "bg-amber-500/10 text-amber-400 border-amber-500/40",
    ongoing: "bg-emerald-500/10 text-emerald-400 border-emerald-500/40",
    completed: "bg-slate-700/30 text-slate-300 border-slate-700",
    submitted: "bg-blue-500/10 text-blue-400 border-blue-500/40",
    "under-review": "bg-amber-500/10 text-amber-400 border-amber-500/40",
    accepted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/40",
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${map[status] ?? "bg-slate-700/30 text-slate-300 border-slate-700"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
    </span>
  );
}

type Tab = "home" | "explore" | "team" | "submit" | "notifications" | "leaderboard";

export default function ParticipantDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hacks, setHacks] = useState<Hackathon[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [leaderboardConfig, setLeaderboardConfig] = useState<LeaderboardConfig>({ visible: true });
  const [userEmail, setUserEmail] = useState("");
  const [exploreQuery, setExploreQuery] = useState("");
  const [exploreStatus, setExploreStatus] = useState<"all" | "upcoming" | "ongoing" | "completed">("all");

  // team state
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [teamNameInput, setTeamNameInput] = useState("");
  const [joinCodeInput, setJoinCodeInput] = useState("");

  // submission form
  const [subForm, setSubForm] = useState({ title: "", description: "", pptUrl: "", repoUrl: "", demoUrl: "", hackathonId: "", roundId: "" });
  const [subSaved, setSubSaved] = useState(false);
  const [subError, setSubError] = useState<string | null>(null);

  // registered hackathons (stored per user)
  const [registered, setRegistered] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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

        // Find my team
        const mt = t.find(team => team.memberEmails.includes(user!.email));
        if (mt) setMyTeam(mt);

        // Registered hacks based on team membership
        const reg = t.filter(team => team.memberEmails.includes(user!.email)).map(team => team.hackathonId);
        setRegistered(reg);

        const draftKey = `nexustrack_submission_draft_${user!.email}`;
        const draftRaw = localStorage.getItem(draftKey);
        if (draftRaw) setSubForm(JSON.parse(draftRaw));
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);


  useEffect(() => {
    if (!userEmail) return;
    localStorage.setItem(`nexustrack_submission_draft_${userEmail}`, JSON.stringify(subForm));
  }, [subForm, userEmail]);

  const handleLogout = () => { logout(); router.push("/login"); };

  const registerHack = async (hackId: string) => {
    // In Supabase version, registration usually means creating/joining a team.
    // For now, we'll just update the local state to show intent, but ideally 
    // it should check if there's a team for this hack.
    const updated = [...registered, hackId];
    setRegistered(updated);
  };

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
      const updated = [...teams, team];
      setTeams(updated);
      setMyTeam(team);
      setRegistered([...registered, team.hackathonId]);
      setTeamNameInput("");
    } catch (err) {
      alert("Failed to create team");
    }
  };

  const joinTeam = async () => {
    const found = teams.find((t) => t.code === joinCodeInput.trim().toUpperCase());
    if (!found) return alert("Team not found. Check the code.");
    if (!found.memberEmails.includes(userEmail)) {
      const patched = { ...found, memberEmails: [...found.memberEmails, userEmail] };
      try {
        await db.updateTeam(patched);
        const updated = teams.map((team) => (team.id === patched.id ? patched : team));
        setTeams(updated);
        setMyTeam(patched);
        setRegistered([...registered, patched.hackathonId]);
        setJoinCodeInput("");
      } catch (err) {
        alert("Failed to join team");
      }
      return;
    }
    setMyTeam(found);
    setJoinCodeInput("");
  };

  const submitProject = async () => {
    setSubError(null);
    if (!subForm.title || !subForm.hackathonId || !subForm.roundId || !myTeam) {
      setSubError("Please fill all required fields before submitting.");
      return;
    }
    const urlFields = [subForm.pptUrl, subForm.repoUrl, subForm.demoUrl].filter(Boolean);
    const hasInvalidUrl = urlFields.some((value) => {
      try {
        new URL(value);
        return false;
      } catch {
        return true;
      }
    });
    if (hasInvalidUrl) {
      setSubError("Please enter valid URLs (including http:// or https://).");
      return;
    }
    const sub: Submission = {
      id: `sub-${Date.now()}`,
      teamId: myTeam.id,
      hackathonId: subForm.hackathonId,
      roundId: subForm.roundId,
      title: subForm.title,
      description: subForm.description,
      pptUrl: subForm.pptUrl || undefined,
      repoUrl: subForm.repoUrl || undefined,
      demoUrl: subForm.demoUrl || undefined,
      status: "submitted",
    };
    
    try {
      await db.createSubmission(sub);
      const updated = [...subs, sub];
      setSubs(updated);
      setSubForm({ title: "", description: "", pptUrl: "", repoUrl: "", demoUrl: "", hackathonId: "", roundId: "" });
      localStorage.removeItem(`nexustrack_submission_draft_${userEmail}`);
      setSubSaved(true);
      setTimeout(() => setSubSaved(false), 3000);
    } catch (err) {
      setSubError("Failed to submit project");
    }
  };

  const clearDraft = () => {
    setSubForm({ title: "", description: "", pptUrl: "", repoUrl: "", demoUrl: "", hackathonId: "", roundId: "" });
    setSubError(null);
    if (userEmail) localStorage.removeItem(`nexustrack_submission_draft_${userEmail}`);
  };

  const myHacks = hacks.filter((h) => registered.includes(h.id));
  const mySubs = subs.filter((s) => s.teamId === myTeam?.id);
  const myNotes = notifications.filter((n) => Array.isArray(n.roles) && n.roles.includes("participant"));
  const exploreHacks = hacks.filter((h) => {
    const matchesQuery =
      h.title.toLowerCase().includes(exploreQuery.toLowerCase()) ||
      h.description.toLowerCase().includes(exploreQuery.toLowerCase());
    const matchesStatus = exploreStatus === "all" ? true : h.status === exploreStatus;
    return matchesQuery && matchesStatus;
  });
  const leaderboard = teams
    .filter((team) => myHacks.some((hack) => hack.id === team.hackathonId))
    .map((team) => {
      const total = scores.filter((s) => s.teamId === team.id).reduce((sum, score) => sum + score.total, 0);
      return { team, total };
    })
    .sort((a, b) => b.total - a.total);

  const nav: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "home", label: "Home", icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: "explore", label: "Explore", icon: <Trophy className="h-4 w-4" /> },
    { id: "team", label: "My Team", icon: <Users className="h-4 w-4" /> },
    { id: "submit", label: "Submit", icon: <Upload className="h-4 w-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
    { id: "leaderboard", label: "Leaderboard", icon: <BarChart3 className="h-4 w-4" /> },
  ];

  const Sidebar = () => (
    <aside className="flex h-full w-56 flex-col border-r border-slate-800 bg-slate-950 p-4">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10 border border-blue-500/40">
          <Trophy className="h-4 w-4 text-blue-400" />
        </div>
        <span className="text-sm font-semibold text-slate-50">NexusTrack</span>
      </div>
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Participant</p>
      <nav className="flex-1 space-y-1">
        {nav.map((n) => (
          <button key={n.id} onClick={() => { setTab(n.id); setSidebarOpen(false); }}
            className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
              tab === n.id ? "bg-blue-500/10 text-blue-400 font-medium" : "text-slate-400 hover:bg-slate-800 hover:text-slate-50"
            }`}>
            {n.icon} {n.label}
          </button>
        ))}
      </nav>
      <button onClick={handleLogout}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors">
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </aside>
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden">
      <div className="hidden md:flex md:flex-col"><Sidebar /></div>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="flex flex-col w-56"><Sidebar /></div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-slate-400" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base font-semibold capitalize">{tab === "home" ? "Dashboard" : tab}</h1>
          </div>
          <span className="text-xs text-slate-400">{userEmail}</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">

          {/* HOME */}
          {tab === "home" && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-slate-400 text-sm">Welcome back 👋</p>
                  <p className="text-lg font-semibold mt-1">{userEmail}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Registered in <span className="text-blue-400">{registered.length}</span> hackathon(s) ·{" "}
                    Team: <span className="text-blue-400">{myTeam?.name ?? "None"}</span>
                  </p>
                </CardContent>
              </Card>

              {myHacks.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-slate-400 text-sm">
                    You haven't registered for any hackathons yet.{" "}
                    <button onClick={() => setTab("explore")} className="text-blue-400 hover:underline">Explore now →</button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {myHacks.map((h) => (
                    <Card key={h.id}>
                      <CardHeader>
                        <CardTitle className="text-sm">{h.title}</CardTitle>
                        <CardDescription>{h.startDate} → {h.endDate}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 pb-4">
                        <StatusBadge status={h.status} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {mySubs.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold mb-2 text-slate-300">My Submissions</h2>
                  {mySubs.map((s) => (
                    <Card key={s.id} className="mb-2">
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-medium text-sm">{s.title}</p>
                          <p className="text-xs text-slate-400">{s.description}</p>
                        </div>
                        <StatusBadge status={s.status} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EXPLORE */}
          {tab === "explore" && (
            <div className="space-y-3">
              <div className="grid gap-2 md:grid-cols-3">
                <Input
                  placeholder="Search hackathons..."
                  value={exploreQuery}
                  onChange={(e) => setExploreQuery(e.target.value)}
                />
                <select
                  className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50"
                  value={exploreStatus}
                  onChange={(e) => setExploreStatus(e.target.value as "all" | "upcoming" | "ongoing" | "completed")}
                >
                  <option value="all">All statuses</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              {exploreHacks.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center text-sm text-slate-400">
                    No hackathons match your filters.
                  </CardContent>
                </Card>
              )}
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {exploreHacks.map((h) => (
                <Card key={h.id} className="flex flex-col justify-between">
                  <CardHeader>
                    <CardTitle className="text-sm">{h.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{h.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Prize</span>
                      <span className="text-blue-400 font-medium">{h.prize}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Dates</span>
                      <span className="text-slate-300">{h.startDate} → {h.endDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <StatusBadge status={h.status} />
                      {registered.includes(h.id) ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-400">
                          <CheckCircle className="h-3.5 w-3.5" /> Registered
                        </span>
                      ) : (
                        <Button size="sm" onClick={() => registerHack(h.id)}>Register</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            </div>
          )}

          {/* TEAM */}
          {tab === "team" && (
            <div className="space-y-4 max-w-lg">
              {myTeam ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{myTeam.name}</CardTitle>
                    <CardDescription>Your current team</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2">
                      <Hash className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-mono text-blue-400">{myTeam.code}</span>
                      <span className="text-xs text-slate-500">#{myTeam.teamNumber}</span>
                      <span className="text-xs text-slate-500 ml-auto">Share this code</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Members</p>
                      {myTeam.memberEmails.map((m) => (
                        <div key={m} className="flex items-center gap-2 py-1">
                          <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-400 font-semibold">
                            {m[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm text-slate-300">{m}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Create a Team</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input
                        placeholder="Team name"
                        value={teamNameInput}
                        onChange={(e) => setTeamNameInput(e.target.value)}
                      />
                      <Button className="w-full" onClick={createTeam}>
                        <Plus className="mr-1.5 h-4 w-4" /> Create Team
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Join a Team</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input
                        placeholder="Enter team code (e.g. VEL123)"
                        value={joinCodeInput}
                        onChange={(e) => setJoinCodeInput(e.target.value)}
                      />
                      <Button variant="outline" className="w-full" onClick={joinTeam}>
                        Join Team
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* SUBMIT */}
          {tab === "submit" && (
            <div className="mx-auto w-full max-w-lg space-y-4">
              {subSaved && (
                <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/40 px-4 py-2 text-sm text-emerald-400">
                  <CheckCircle className="h-4 w-4" /> Submission saved successfully!
                </div>
              )}
              {subError && (
                <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-400">
                  {subError}
                </div>
              )}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Submit Your Project</CardTitle>
                  <CardDescription>Submit PPT, repository, and demo links per round.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">Hackathon</label>
                    <select
                      className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={subForm.hackathonId}
                      onChange={(e) => setSubForm((f) => ({ ...f, hackathonId: e.target.value, roundId: "" }))}
                    >
                      <option value="">Select hackathon</option>
                      {hacks.filter((h) => registered.includes(h.id)).map((h) => (
                        <option key={h.id} value={h.id}>{h.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">Round</label>
                    <select
                      className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={subForm.roundId}
                      onChange={(e) => setSubForm((f) => ({ ...f, roundId: e.target.value }))}
                    >
                      <option value="">Select round</option>
                      {rounds.filter((r) => r.hackathonId === subForm.hackathonId).map((r) => (
                        <option key={r.id} value={r.id}>{r.title} ({r.submissionType})</option>
                      ))}
                    </select>
                  </div>
                  {[
                    { label: "Project Title", key: "title", placeholder: "My awesome project" },
                    { label: "Description", key: "description", placeholder: "What does it do?" },
                    { label: "PPT URL", key: "pptUrl", placeholder: "https://slides.com/..." },
                    { label: "GitHub / Repo URL", key: "repoUrl", placeholder: "https://github.com/..." },
                    { label: "Demo URL", key: "demoUrl", placeholder: "https://demo.example.com" },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label className="mb-1 block text-xs font-medium text-slate-300">{label}</label>
                      <Input
                        placeholder={placeholder}
                        value={(subForm as Record<string, string>)[key]}
                        onChange={(e) => setSubForm((f) => ({ ...f, [key]: e.target.value }))}
                      />
                    </div>
                  ))}
                  <Button className="w-full" onClick={submitProject}>
                    <ExternalLink className="mr-1.5 h-4 w-4" /> Submit Project
                  </Button>
                  <Button variant="outline" className="w-full" onClick={clearDraft}>
                    Clear Draft
                  </Button>
                </CardContent>
              </Card>

              {mySubs.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-2">Previous submissions</p>
                  {mySubs.map((s) => (
                    <Card key={s.id} className="mb-2">
                      <CardContent className="flex items-center justify-between p-3">
                        <p className="text-sm font-medium">{s.title}</p>
                        <StatusBadge status={s.status} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "notifications" && (
            <div className="space-y-3 max-w-3xl">
              {myNotes.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center text-sm text-slate-400">
                    No notifications yet.
                  </CardContent>
                </Card>
              )}
              {myNotes.map((n) => (
                <Card key={n.id}>
                  <CardContent className="space-y-1 p-4">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-slate-400">{n.message}</p>
                    <p className="text-[11px] text-slate-500">{new Date(n.createdAt).toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {tab === "leaderboard" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Leaderboard</CardTitle>
                {!leaderboardConfig.visible && (
                  <p className="text-xs text-amber-400">Leaderboard is currently hidden by admin.</p>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {leaderboardConfig.visible ? (
                  leaderboard.length > 0 ? (
                    leaderboard.map((item, index) => (
                      <div key={item.team.id} className="flex items-center justify-between rounded-md border border-slate-800 px-3 py-2">
                        <p className="text-sm">#{index + 1} {item.team.name} <span className="text-slate-500">#{item.team.teamNumber}</span></p>
                        <p className="text-sm font-semibold text-blue-400">{item.total}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">No ranked teams yet.</p>
                  )
                ) : <p className="text-sm text-slate-400">Wait for admin to publish rankings.</p>}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
