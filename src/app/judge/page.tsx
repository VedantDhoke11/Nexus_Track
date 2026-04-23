"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, BarChart2, LogOut, Menu, Star, CheckCircle, X, Bell } from "lucide-react";
import { getCurrentUser, logout } from "@/lib/auth";
import {
  Submission, Hackathon, Team, ScoreEntry, JudgeAssignment, ScoringCriterion, NotificationItem, LeaderboardConfig
} from "@/lib/data";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function ScoreModal({
  sub, criteria, existing, judgeEmail, onClose, onSave,
}: {
  sub: Submission;
  criteria: ScoringCriterion[];
  existing?: ScoreEntry;
  judgeEmail: string;
  onClose: () => void;
  onSave: (s: ScoreEntry) => void;
}) {
  const [scoreMap, setScoreMap] = useState<Record<string, number>>(
    Object.fromEntries(criteria.map((c) => [c.id, existing?.scores.find((s) => s.criterionId === c.id)?.value ?? 0]))
  );
  const [comments, setComments] = useState(existing?.comments ?? "");
  const total = criteria.reduce((sum, c) => {
    const raw = scoreMap[c.id] ?? 0;
    return sum + (raw / Math.max(c.maxScore, 1)) * c.weightage;
  }, 0);

  const handleSave = () => {
    onSave({
      id: existing?.id ?? `score-${Date.now()}`,
      submissionId: sub.id,
      roundId: sub.roundId,
      teamId: sub.teamId,
      hackathonId: sub.hackathonId,
      judgeEmail,
      scores: criteria.map((c) => ({ criterionId: c.id, value: scoreMap[c.id] ?? 0 })),
      comments,
      total: Number(total.toFixed(2)),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
          <h2 className="font-semibold text-slate-50">Score: {sub.title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-50">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          {criteria.map((criterion) => (
            <div key={criterion.id}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">{criterion.name}</label>
                <span className="text-sm font-semibold text-blue-400">{scoreMap[criterion.id] ?? 0}/{criterion.maxScore}</span>
              </div>
              <input
                type="range" min={0} max={criterion.maxScore} step={1}
                value={scoreMap[criterion.id] ?? 0}
                onChange={(e) => setScoreMap((f) => ({ ...f, [criterion.id]: Number(e.target.value) }))}
                className="w-full accent-blue-500"
              />
            </div>
          ))}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Comments</label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Optional feedback..."
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="rounded-md bg-slate-800 px-4 py-2 text-center">
            <span className="text-xs text-slate-400">Total Score: </span>
            <span className="text-xl font-bold text-blue-400">{total}</span>
            <span className="text-xs text-slate-400">/100</span>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-700 px-5 py-4">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave}>
            <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Submit Score
          </Button>
        </div>
      </div>
    </div>
  );
}

type Tab = "submissions" | "leaderboard";

export default function JudgeDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("submissions");
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
  const [scoringModal, setScoringModal] = useState<Submission | null>(null);
  const [savedAlert, setSavedAlert] = useState(false);
  const [hackFilter, setHackFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState<"all" | "scored" | "pending">("all");
  const [searchText, setSearchText] = useState("");

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
      } catch (err) {
        console.error("Failed to fetch judge data:", err);
      }
    }
    fetchData();
  }, [router]);

  const handleLogout = () => { logout(); router.push("/login"); };

  const saveScore = async (score: ScoreEntry) => {
    try {
      await db.createScoreEntry(score);
      const updated = scores.find((s) => s.submissionId === score.submissionId && s.judgeEmail === score.judgeEmail)
        ? scores.map((s) => (s.submissionId === score.submissionId && s.judgeEmail === score.judgeEmail ? score : s))
        : [...scores, score];
      setScores(updated);
      setScoringModal(null);
      setSavedAlert(true);
      setTimeout(() => setSavedAlert(false), 3000);
    } catch (err) {
      alert("Failed to submit score");
    }
  };


  const myTeamIds = assignments.filter((a) => a.judgeEmail === judgeEmail).map((a) => a.teamId);
  const assignedSubs = subs.filter((s) => myTeamIds.includes(s.teamId));
  const myNotes = notifications.filter((n) => Array.isArray(n.roles) && n.roles.includes("judge"));
  const getScore = (subId: string) => scores.find((s) => s.submissionId === subId && s.judgeEmail === judgeEmail);
  const filteredAssignedSubs = assignedSubs.filter((s) => {
    const byHack = hackFilter === "all" ? true : s.hackathonId === hackFilter;
    const scored = !!getScore(s.id);
    const byScore = scoreFilter === "all" ? true : scoreFilter === "scored" ? scored : !scored;
    const bySearch =
      s.title.toLowerCase().includes(searchText.toLowerCase()) ||
      s.description.toLowerCase().includes(searchText.toLowerCase());
    return byHack && byScore && bySearch;
  });
  const scoredCount = assignedSubs.filter((s) => !!getScore(s.id)).length;
  const avgScore = scoredCount === 0
    ? 0
    : assignedSubs
        .map((s) => getScore(s.id)?.total ?? 0)
        .filter((v) => v > 0)
        .reduce((sum, value) => sum + value, 0) / scoredCount;

  const leaderboard = filteredAssignedSubs
    .map((s) => {
      const score = getScore(s.id);
      const team = teams.find((t) => t.id === s.teamId);
      const hack = hacks.find((h) => h.id === s.hackathonId);
      return { sub: s, score, team, hack, total: score?.total ?? 0 };
    })
    .sort((a, b) => b.total - a.total);

  const nav = [
    { id: "submissions" as Tab, label: "Submissions", icon: <FileText className="h-4 w-4" /> },
    { id: "leaderboard" as Tab, label: "Leaderboard", icon: <BarChart2 className="h-4 w-4" /> },
  ];

  const Sidebar = () => (
    <aside className="flex h-full w-56 flex-col border-r border-slate-800 bg-slate-950 p-4">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10 border border-blue-500/40">
          <Star className="h-4 w-4 text-blue-400" />
        </div>
        <span className="text-sm font-semibold text-slate-50">NexusTrack</span>
      </div>
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Judge</p>
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
            <h1 className="text-base font-semibold capitalize">{tab}</h1>
          </div>
          <span className="text-xs text-slate-400">judge@test.com</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {savedAlert && (
            <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/40 px-4 py-2 text-sm text-emerald-400">
              <CheckCircle className="h-4 w-4" /> Score submitted successfully!
            </div>
          )}

          {/* SUBMISSIONS */}
          {tab === "submissions" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {[
                  { label: "Assigned", value: assignedSubs.length, color: "text-blue-400" },
                  { label: "Scored", value: scoredCount, color: "text-emerald-400" },
                  { label: "Average", value: avgScore.toFixed(1), color: "text-amber-400" }
                ].map((item) => (
                  <Card key={item.label}>
                    <CardContent className="p-4">
                      <p className="text-xs text-slate-400">{item.label}</p>
                      <p className={`mt-1 text-2xl font-bold ${item.color}`}>{item.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="grid gap-2 md:grid-cols-3">
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search submissions..."
                  className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                />
                <select
                  value={hackFilter}
                  onChange={(e) => setHackFilter(e.target.value)}
                  className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <option value="all">All hackathons</option>
                  {hacks.map((h) => (
                    <option key={h.id} value={h.id}>{h.title}</option>
                  ))}
                </select>
                <select
                  value={scoreFilter}
                  onChange={(e) => setScoreFilter(e.target.value as "all" | "scored" | "pending")}
                  className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <option value="all">All statuses</option>
                  <option value="scored">Scored</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              {filteredAssignedSubs.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center text-slate-400 text-sm">
                    No submissions match your filters.
                  </CardContent>
                </Card>
              )}
              {filteredAssignedSubs.map((s) => {
                const hack = hacks.find((h) => h.id === s.hackathonId);
                const team = teams.find((t) => t.id === s.teamId);
                const scored = getScore(s.id);
                return (
                  <Card key={s.id}>
                    <CardContent className="flex items-start justify-between gap-4 p-4">
                      <div className="space-y-1 flex-1">
                        <p className="font-medium">{s.title}</p>
                        <p className="text-xs text-slate-400">{s.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2 text-xs text-slate-500">
                          <span>Hackathon: <span className="text-slate-300">{hack?.title ?? "Unknown"}</span></span>
                          <span>·</span>
                          <span>Team: <span className="text-slate-300">{team?.name ?? s.teamId}</span></span>
                        </div>
                        {s.repoUrl && (
                          <a href={s.repoUrl} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:underline block mt-1">{s.repoUrl}</a>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {scored ? (
                          <>
                            <span className="text-xs text-emerald-400 flex items-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5" /> Scored
                            </span>
                            <span className="text-2xl font-bold text-blue-400">{scored.total}<span className="text-xs text-slate-400">/40</span></span>
                            <Button size="sm" variant="outline" onClick={() => setScoringModal(s)}>Edit</Button>
                          </>
                        ) : (
                          <Button size="sm" onClick={() => setScoringModal(s)}>
                            <Star className="mr-1.5 h-3.5 w-3.5" /> Score
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* LEADERBOARD */}
          {tab === "leaderboard" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Leaderboard</CardTitle>
                <CardDescription>Rankings based on judge scores</CardDescription>
                {!leaderboardConfig.visible && <p className="text-xs text-amber-400">Hidden by admin.</p>}
              </CardHeader>
              <CardContent className="p-0">
                {leaderboardConfig.visible ? leaderboard.length > 0 ? <table className="w-full text-sm">
                  <thead className="border-b border-slate-800 text-xs text-slate-400">
                    <tr>
                      {["Rank", "Project", "Team", "Hackathon", "Score"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((item, i) => (
                      <tr key={item.sub.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                        <td className="px-4 py-3">
                          <span className={`font-bold text-base ${
                            i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-600" : "text-slate-500"
                          }`}>
                            #{i + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">{item.sub.title}</td>
                        <td className="px-4 py-3 text-slate-400">{item.team?.name ?? item.sub.teamId}</td>
                        <td className="px-4 py-3 text-slate-400">{item.hack?.title ?? "Unknown"}</td>
                        <td className="px-4 py-3">
                          {item.score ? (
                            <span className="font-bold text-blue-400">{item.total}/40</span>
                          ) : (
                            <span className="text-xs text-slate-500">Not scored</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table> : <div className="p-4 text-sm text-slate-400">No scored submissions yet.</div> : <div className="p-4 text-sm text-slate-400">Leaderboard is currently unavailable.</div>}
              </CardContent>
            </Card>
          )}
          {tab === "submissions" && myNotes.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Bell className="h-4 w-4" />Notifications</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {myNotes.map((note) => (
                  <div key={note.id} className="rounded-md border border-slate-800 px-3 py-2">
                    <p className="text-sm font-medium">{note.title}</p>
                    <p className="text-xs text-slate-400">{note.message}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {tab === "submissions" && myNotes.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-sm text-slate-400">
                No notifications for judges yet.
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {scoringModal && (
        <ScoreModal
          sub={scoringModal}
          criteria={criteria.filter((c) => c.roundId === scoringModal.roundId)}
          judgeEmail={judgeEmail}
          existing={getScore(scoringModal.id)}
          onClose={() => setScoringModal(null)}
          onSave={saveScore}
        />
      )}
    </div>
  );
}
