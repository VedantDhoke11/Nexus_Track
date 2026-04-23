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
  X,
  CheckCircle,
  Menu,
  Bell,
  SlidersHorizontal
} from "lucide-react";
import { getCurrentUser, logout } from "@/lib/auth";
import {
  Hackathon,
  HackathonStatus,
  Round,
  SubmissionType,
  RoundStatus,
  ScoringCriterion,
  NotificationItem,
  LeaderboardConfig,
} from "@/lib/data";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function StatusBadge({ status }: { status: HackathonStatus }) {
  const map = {
    upcoming: "bg-amber-500/10 text-amber-400 border-amber-500/40",
    ongoing: "bg-emerald-500/10 text-emerald-400 border-emerald-500/40",
    completed: "bg-slate-700/30 text-slate-300 border-slate-700",
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${map[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

interface ModalProps {
  hack: Partial<Hackathon> | null;
  onClose: () => void;
  onSave: (h: Hackathon) => void;
}

function HackathonModal({ hack, onClose, onSave }: ModalProps) {
  const [form, setForm] = useState<Partial<Hackathon>>(
    hack ?? { status: "upcoming", mode: "hybrid" }
  );

  const set = (k: keyof Hackathon, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title || !form.startDate || !form.endDate) return;
    onSave({
      id: form.id ?? `hack-${Date.now()}`,
      title: form.title!,
      description: form.description ?? "",
      startDate: form.startDate!,
      endDate: form.endDate!,
      mode: (form.mode as Hackathon["mode"]) ?? "hybrid",
      prize: form.prize ?? "TBD",
      status: form.status as HackathonStatus ?? "upcoming",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
          <h2 className="font-semibold text-slate-50">
            {hack?.id ? "Edit Hackathon" : "Add Hackathon"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-50">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3 p-5">
          {[
            { label: "Title", key: "title", type: "text" },
            { label: "Description", key: "description", type: "text" },
            { label: "Start Date", key: "startDate", type: "date" },
            { label: "End Date", key: "endDate", type: "date" },
            { label: "Mode (online/offline/hybrid)", key: "mode", type: "text" },
            { label: "Prize Pool", key: "prize", type: "text" },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-medium text-slate-300">{label}</label>
              <Input
                type={type}
                value={(form as Record<string, string>)[key] ?? ""}
                onChange={(e) => set(key as keyof Hackathon, e.target.value)}
                placeholder={label}
              />
            </div>
          ))}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Status</label>
            <select
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.status ?? "upcoming"}
              onChange={(e) => set("status", e.target.value)}
            >
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-700 px-5 py-4">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave}>
            <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Save
          </Button>
        </div>
      </div>
    </div>
  );
}

type Tab = "overview" | "hackathons" | "rounds" | "criteria" | "notifications";

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [hacks, setHacks] = useState<Hackathon[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [criteria, setCriteria] = useState<ScoringCriterion[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [leaderboardConfig, setLeaderboardConfig] = useState<LeaderboardConfig>({ visible: true });
  const [modal, setModal] = useState<Partial<Hackathon> | null | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roundForm, setRoundForm] = useState({
    hackathonId: "",
    title: "",
    submissionType: "mixed" as SubmissionType,
    status: "upcoming" as RoundStatus,
  });
  const [criteriaForm, setCriteriaForm] = useState({
    hackathonId: "",
    roundId: "",
    name: "",
    maxScore: "10",
    weightage: "25",
  });
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    roles: ["participant"] as Array<"admin" | "participant" | "judge">,
  });
  const hackathonWithoutRounds = hacks.filter((h) => !rounds.some((r) => r.hackathonId === h.id)).length;
  const roundsWithoutCriteria = rounds.filter((r) => !criteria.some((c) => c.roundId === r.id)).length;

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") router.push("/login");
    
    async function fetchData() {
      try {
        const [h, r, c, n, lc] = await Promise.all([
          db.getHackathons(),
          db.getRounds(),
          db.getScoringCriteria(),
          db.getNotifications(),
          db.getLeaderboardConfig()
        ]);
        setHacks(h);
        setRounds(r);
        setCriteria(c);
        setNotifications(n);
        setLeaderboardConfig(lc);
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
      }
    }
    fetchData();
  }, [router]);

  const handleLogout = () => { logout(); router.push("/login"); };

  const saveHack = async (h: Hackathon) => {
    try {
      await db.saveHackathon(h);
      const updated = hacks.find((x) => x.id === h.id)
        ? hacks.map((x) => (x.id === h.id ? h : x))
        : [...hacks, h];
      setHacks(updated);
      setModal(undefined);
    } catch (err) {
      alert("Failed to save hackathon");
    }
  };

  const deleteHack = async (id: string) => {
    try {
      await db.deleteHackathon(id);
      const updated = hacks.filter((h) => h.id !== id);
      setHacks(updated);
    } catch (err) {
      alert("Failed to delete hackathon");
    }
  };

  const addRound = async () => {
    if (!roundForm.hackathonId || !roundForm.title.trim()) return;
    const next: Round = {
      id: `round-${Date.now()}`,
      hackathonId: roundForm.hackathonId,
      title: roundForm.title.trim(),
      submissionType: roundForm.submissionType,
      status: roundForm.status,
    };
    try {
      await db.createRound(next);
      const updated = [...rounds, next];
      setRounds(updated);
      setRoundForm((f) => ({ ...f, title: "" }));
    } catch (err) {
      alert("Failed to add round");
    }
  };

  const addCriterion = async () => {
    if (!criteriaForm.hackathonId || !criteriaForm.roundId || !criteriaForm.name.trim()) return;
    const next: ScoringCriterion = {
      id: `crit-${Date.now()}`,
      hackathonId: criteriaForm.hackathonId,
      roundId: criteriaForm.roundId,
      name: criteriaForm.name.trim(),
      maxScore: Number(criteriaForm.maxScore) || 10,
      weightage: Number(criteriaForm.weightage) || 0,
    };
    try {
      await db.createScoringCriterion(next);
      const updated = [...criteria, next];
      setCriteria(updated);
      setCriteriaForm((f) => ({ ...f, name: "" }));
    } catch (err) {
      alert("Failed to add criterion");
    }
  };

  const addNotification = async () => {
    if (!notificationForm.title.trim() || !notificationForm.message.trim()) return;
    const next: NotificationItem = {
      id: `note-${Date.now()}`,
      title: notificationForm.title.trim(),
      message: notificationForm.message.trim(),
      roles: notificationForm.roles,
      createdAt: new Date().toISOString(),
    };
    try {
      await db.createNotification(next);
      const updated = [next, ...notifications];
      setNotifications(updated);
      setNotificationForm({ title: "", message: "", roles: ["participant"] });
    } catch (err) {
      alert("Failed to publish notification");
    }
  };

  const toggleRole = (role: "admin" | "participant" | "judge") => {
    setNotificationForm((f) => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter((r) => r !== role) : [...f.roles, role],
    }));
  };

  const toggleLeaderboardVisibility = async () => {
    const updated = { visible: !leaderboardConfig.visible };
    try {
      await db.updateLeaderboardConfig(updated);
      setLeaderboardConfig(updated);
    } catch (err) {
      alert("Failed to update leaderboard visibility");
    }
  };


  const exportJson = (filename: string, payload: unknown) => {
    if (typeof window === "undefined") return;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const nav: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: "hackathons", label: "Hackathons", icon: <Trophy className="h-4 w-4" /> },
    { id: "rounds", label: "Rounds", icon: <FileText className="h-4 w-4" /> },
    { id: "criteria", label: "Criteria", icon: <SlidersHorizontal className="h-4 w-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
  ];

  const Sidebar = () => (
    <aside className="flex h-full w-56 flex-col border-r border-slate-800 bg-slate-950 p-4">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10 border border-blue-500/40">
          <Trophy className="h-4 w-4 text-blue-400" />
        </div>
        <span className="text-sm font-semibold text-slate-50">NexusTrack</span>
      </div>
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Admin</p>
      <nav className="flex-1 space-y-1">
        {nav.map((n) => (
          <button
            key={n.id}
            onClick={() => { setTab(n.id); setSidebarOpen(false); }}
            className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
              tab === n.id
                ? "bg-blue-500/10 text-blue-400 font-medium"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-50"
            }`}
          >
            {n.icon} {n.label}
          </button>
        ))}
      </nav>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
      >
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </aside>
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="flex flex-col w-56"><Sidebar /></div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-slate-400" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base font-semibold capitalize">{tab}</h1>
          </div>
          <span className="text-xs text-slate-400">admin@test.com</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">

          {/* OVERVIEW */}
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { label: "Hackathons", value: hacks.length, color: "text-blue-400" },
                  { label: "Rounds", value: rounds.length, color: "text-emerald-400" },
                  { label: "Criteria", value: criteria.length, color: "text-amber-400" },
                  { label: "Notifications", value: notifications.length, color: "text-purple-400" },
                ].map((s) => (
                  <Card key={s.label}>
                    <CardContent className="p-4">
                      <p className="text-xs text-slate-400">{s.label}</p>
                      <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card>
                <CardHeader><CardTitle className="text-sm">All Hackathons</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-800 text-xs text-slate-400">
                      <tr>
                        {["Title", "Start", "End", "Prize", "Status"].map((h) => (
                          <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {hacks.map((h) => (
                        <tr key={h.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                          <td className="px-4 py-2 font-medium">{h.title}</td>
                          <td className="px-4 py-2 text-slate-400">{h.startDate}</td>
                          <td className="px-4 py-2 text-slate-400">{h.endDate}</td>
                          <td className="px-4 py-2 text-slate-400 capitalize">{h.mode}</td>
                          <td className="px-4 py-2 text-blue-400">{h.prize}</td>
                          <td className="px-4 py-2"><StatusBadge status={h.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Leaderboard Visibility</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Participants can {leaderboardConfig.visible ? "see" : "not see"} the leaderboard.
                  </p>
                  <Button size="sm" variant="outline" onClick={toggleLeaderboardVisibility}>
                    {leaderboardConfig.visible ? "Hide Leaderboard" : "Show Leaderboard"}
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Data Health</CardTitle></CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-md border border-slate-800 px-3 py-2">
                    <p className="text-xs text-slate-400">Hackathons missing rounds</p>
                    <p className="text-lg font-semibold text-amber-400">{hackathonWithoutRounds}</p>
                  </div>
                  <div className="rounded-md border border-slate-800 px-3 py-2">
                    <p className="text-xs text-slate-400">Rounds missing criteria</p>
                    <p className="text-lg font-semibold text-amber-400">{roundsWithoutCriteria}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Export Local Data</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => exportJson("nexustrack-hackathons.json", hacks)}>Hackathons</Button>
                  <Button size="sm" variant="outline" onClick={() => exportJson("nexustrack-rounds.json", rounds)}>Rounds</Button>
                  <Button size="sm" variant="outline" onClick={() => exportJson("nexustrack-criteria.json", criteria)}>Criteria</Button>
                  <Button size="sm" variant="outline" onClick={() => exportJson("nexustrack-notifications.json", notifications)}>Notifications</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* HACKATHONS */}
          {tab === "hackathons" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setModal({})}>
                  <Plus className="mr-1.5 h-4 w-4" /> Add Hackathon
                </Button>
              </div>
              <Card>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-800 text-xs text-slate-400">
                      <tr>
                        {["Title", "Dates", "Mode", "Prize", "Status", "Actions"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {hacks.map((h) => (
                        <tr key={h.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                          <td className="px-4 py-3">
                            <p className="font-medium">{h.title}</p>
                            <p className="text-xs text-slate-400 line-clamp-1">{h.description}</p>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">{h.startDate} → {h.endDate}</td>
                          <td className="px-4 py-3 text-xs text-slate-400 capitalize">{h.mode}</td>
                          <td className="px-4 py-3 text-blue-400 font-medium">{h.prize}</td>
                          <td className="px-4 py-3"><StatusBadge status={h.status} /></td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => setModal(h)} className="text-slate-400 hover:text-blue-400">
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button onClick={() => deleteHack(h.id)} className="text-slate-400 hover:text-red-400">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}

          {tab === "rounds" && (
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-sm">Add Round</CardTitle></CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-4">
                  <select className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                    value={roundForm.hackathonId}
                    onChange={(e) => setRoundForm((f) => ({ ...f, hackathonId: e.target.value }))}>
                    <option value="">Select hackathon</option>
                    {hacks.map((h) => <option key={h.id} value={h.id}>{h.title}</option>)}
                  </select>
                  <Input placeholder="Round title" value={roundForm.title}
                    onChange={(e) => setRoundForm((f) => ({ ...f, title: e.target.value }))} />
                  <select className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                    value={roundForm.submissionType}
                    onChange={(e) => setRoundForm((f) => ({ ...f, submissionType: e.target.value as SubmissionType }))}>
                    <option value="ppt">ppt</option><option value="github">github</option>
                    <option value="demo">demo</option><option value="mixed">mixed</option>
                  </select>
                  <Button onClick={addRound}><Plus className="mr-1.5 h-4 w-4" /> Add Round</Button>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-800 text-xs text-slate-400">
                      <tr>{["Hackathon", "Round", "Type", "Status"].map((h) => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {rounds.map((r) => (
                        <tr key={r.id} className="border-b border-slate-800/50">
                          <td className="px-4 py-3 text-slate-300">{hacks.find((h) => h.id === r.hackathonId)?.title ?? "Unknown"}</td>
                          <td className="px-4 py-3 font-medium">{r.title}</td>
                          <td className="px-4 py-3 text-slate-400">{r.submissionType}</td>
                          <td className="px-4 py-3 text-slate-400">{r.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}

          {tab === "criteria" && (
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-sm">Add Scoring Criteria</CardTitle></CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-5">
                  <select className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                    value={criteriaForm.hackathonId}
                    onChange={(e) => setCriteriaForm((f) => ({ ...f, hackathonId: e.target.value, roundId: "" }))}>
                    <option value="">Hackathon</option>
                    {hacks.map((h) => <option key={h.id} value={h.id}>{h.title}</option>)}
                  </select>
                  <select className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                    value={criteriaForm.roundId}
                    onChange={(e) => setCriteriaForm((f) => ({ ...f, roundId: e.target.value }))}>
                    <option value="">Round</option>
                    {rounds.filter((r) => r.hackathonId === criteriaForm.hackathonId).map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
                  </select>
                  <Input placeholder="Criterion name" value={criteriaForm.name}
                    onChange={(e) => setCriteriaForm((f) => ({ ...f, name: e.target.value }))} />
                  <Input placeholder="Max score" type="number" value={criteriaForm.maxScore}
                    onChange={(e) => setCriteriaForm((f) => ({ ...f, maxScore: e.target.value }))} />
                  <Input placeholder="Weightage %" type="number" value={criteriaForm.weightage}
                    onChange={(e) => setCriteriaForm((f) => ({ ...f, weightage: e.target.value }))} />
                </CardContent>
              </Card>
              <div className="flex justify-end"><Button onClick={addCriterion}>Save Criterion</Button></div>
              <Card>
                <CardContent className="space-y-2 p-4">
                  {criteria.map((c) => (
                    <div key={c.id} className="rounded-md border border-slate-800 px-3 py-2 text-sm">
                      <span className="font-medium text-slate-200">{c.name}</span>
                      <span className="ml-2 text-slate-400">({c.maxScore} max, {c.weightage}%)</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {tab === "notifications" && (
            <div className="space-y-4 max-w-3xl">
              <Card>
                <CardHeader><CardTitle className="text-sm">Create Notification</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Input placeholder="Title" value={notificationForm.title}
                    onChange={(e) => setNotificationForm((f) => ({ ...f, title: e.target.value }))} />
                  <textarea
                    rows={3}
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm((f) => ({ ...f, message: e.target.value }))}
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                    placeholder="Message"
                  />
                  <div className="flex gap-2">
                    {(["admin", "participant", "judge"] as const).map((role) => (
                      <Button key={role} size="sm" variant={notificationForm.roles.includes(role) ? "default" : "outline"}
                        onClick={() => toggleRole(role)}>{role}</Button>
                    ))}
                  </div>
                  <Button onClick={addNotification}><Bell className="mr-1.5 h-4 w-4" /> Publish</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Recent Notifications</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {notifications.length === 0 && (
                    <p className="text-sm text-slate-400">No notifications published yet.</p>
                  )}
                  {notifications.map((n) => (
                    <div key={n.id} className="rounded-md border border-slate-800 px-3 py-2">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-slate-400">{n.message}</p>
                      <p className="text-[11px] text-slate-500 mt-1">Roles: {Array.isArray(n.roles) ? n.roles.join(", ") : "all"}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {modal !== undefined && (
        <HackathonModal
          hack={modal}
          onClose={() => setModal(undefined)}
          onSave={saveHack}
        />
      )}
    </div>
  );
}
