"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  Menu, ChevronLeft, Star, Clock, Zap, Save, CheckCircle, 
  Github, ExternalLink, FileText, Info 
} from "lucide-react";
import { getCurrentUser, logout } from "@/lib/auth";
import { Submission, Hackathon, Team, ScoreEntry, ScoringCriterion } from "@/lib/data";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SubmissionReviewPage() {
  const router = useRouter();
  const params = useParams();
  const subId = params.id as string;

  const [sub, setSub] = useState<Submission | null>(null);
  const [hack, setHack] = useState<Hackathon | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [criteria, setCriteria] = useState<ScoringCriterion[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "judge") { router.push("/login"); return; }
    setUserEmail(user.email);

    async function fetchData() {
      try {
        const [subs, hacks, teams, crit, existingScores] = await Promise.all([
          db.getSubmissions(),
          db.getHackathons(),
          db.getTeams(),
          db.getScoringCriteria(),
          db.getScoreEntries()
        ]);

        const currentSub = subs.find(s => s.id === subId);
        if (!currentSub) { router.push("/judge"); return; }
        
        setSub(currentSub);
        setHack(hacks.find(h => h.id === currentSub.hackathonId) || null);
        setTeam(teams.find(t => t.id === currentSub.teamId) || null);
        setCriteria(crit.filter(c => c.hackathonId === currentSub.hackathonId));

        const ex = existingScores.find(e => e.submissionId === subId && e.judgeEmail === user!.email);
        if (ex) {
          const scoreMap: Record<string, number> = {};
          ex.scores.forEach(s => {
            scoreMap[s.criterionId] = s.value;
          });
          setScores(scoreMap);
          setComments(ex.comments);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchData();
  }, [subId, router]);

  const saveScore = async () => {
    if (!sub) return;
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    const entry: ScoreEntry = {
      id: `score-${Date.now()}`,
      submissionId: sub.id,
      roundId: sub.roundId,
      teamId: sub.teamId,
      hackathonId: sub.hackathonId,
      judgeEmail: userEmail,
      scores: Object.entries(scores).map(([k, v]) => ({ criterionId: k, value: v })),
      comments,
      total
    };
    try {
      await db.createScoreEntry(entry);
      alert("Evaluation saved to secure nodes.");
      router.push("/judge");
    } catch (err) { alert("Saving failed. Signal interruption."); }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary font-black italic tracking-widest">LOADING ARTIFACT...</div>;
  if (!sub) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 antialiased">
      <header className="h-20 flex items-center justify-between px-10 border-b border-border/60 bg-card/70 backdrop-blur-md sticky top-0 z-20">
         <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" onClick={() => router.push("/judge")} className="rounded-xl hover:bg-muted">
               <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex flex-col">
               <h1 className="text-sm font-black text-foreground tracking-widest uppercase italic">Evaluation Node</h1>
               <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">Artifact Alpha-01</span>
            </div>
         </div>
         <div className="flex items-center gap-6">
            <ThemeToggle />
            <Button className="h-11 rounded-xl px-8 shadow-xl shadow-primary/20" onClick={saveScore}>
               <Save className="mr-2 w-4 h-4" /> Commit Review
            </Button>
         </div>
      </header>

      <main className="flex-1 p-10 max-w-7xl mx-auto w-full grid lg:grid-cols-3 gap-10">
         {/* Artifact Details */}
         <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-primary" />
                  <h2 className="text-4xl font-black tracking-tighter italic uppercase">{sub.title}</h2>
               </div>
               <p className="text-lg text-muted-foreground font-medium italic leading-relaxed">
                  {sub.description}
               </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
               <Card className="premium-card p-6 border-none shadow-xl flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-500/20 group-hover:scale-110 transition-transform">
                     <Github className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Source Code</p>
                     <Link href={sub.repoUrl || "#"} target="_blank" className="text-xs font-bold hover:text-primary transition-colors flex items-center gap-1">Open Repository <ExternalLink className="w-3 h-3" /></Link>
                  </div>
               </Card>
               <Card className="premium-card p-6 border-none shadow-xl flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 group-hover:scale-110 transition-transform">
                     <FileText className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Presentation</p>
                     <Link href={sub.pptUrl || "#"} target="_blank" className="text-xs font-bold hover:text-primary transition-colors flex items-center gap-1">Review PPT <ExternalLink className="w-3 h-3" /></Link>
                  </div>
               </Card>
               <Card className="premium-card p-6 border-none shadow-xl flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/20 group-hover:scale-110 transition-transform">
                     <ExternalLink className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Deployment</p>
                     <Link href={sub.demoUrl || "#"} target="_blank" className="text-xs font-bold hover:text-primary transition-colors flex items-center gap-1">Live Demo <ExternalLink className="w-3 h-3" /></Link>
                  </div>
               </Card>
            </div>

            <Card className="premium-card p-10 border-none shadow-2xl relative overflow-hidden bg-card/40 backdrop-blur-sm">
               <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                  <Info className="w-40 h-40" />
               </div>
               <h3 className="text-xl font-black italic uppercase tracking-tight mb-8">Judge Feedback Log</h3>
               <textarea 
                  className="w-full h-40 bg-muted/30 border border-border rounded-2xl p-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400"
                  placeholder="Input detailed technical observations and critique..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
               ></textarea>
            </Card>
         </div>

         {/* Metrics & Scoring */}
         <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-border/40 pb-4">
               <Star className="w-5 h-5 text-primary" />
               <h3 className="text-xl font-black italic uppercase tracking-tight">Logic Scoring</h3>
            </div>
            
            <div className="space-y-4">
               {criteria.map((c) => (
                 <Card key={c.id} className="p-6 premium-card border-none shadow-xl space-y-4 group">
                    <div className="flex justify-between items-start">
                       <div>
                          <p className="text-sm font-black uppercase tracking-tight text-foreground">{c.name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Weightage: {c.weightage}%</p>
                       </div>
                       <span className="text-xs font-black text-primary">MAX {c.maxScore}</span>
                    </div>
                    <Input 
                       type="number" 
                       max={c.maxScore} 
                       min={0}
                       placeholder="Rate..."
                       className="h-12 rounded-2xl font-black text-lg bg-muted/20"
                       value={scores[c.id] || ""}
                       onChange={(e) => setScores({...scores, [c.id]: Number(e.target.value)})}
                    />
                 </Card>
               ))}
            </div>

            <Card className="p-8 bg-primary rounded-3xl shadow-2xl shadow-primary/30 text-white flex flex-col items-center gap-2">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-70 leading-none">Aggregated Logical Score</p>
               <p className="text-5xl font-black tracking-tighter leading-none">
                  {Object.values(scores).reduce((a, b) => a + b, 0)}
                  <span className="text-xl opacity-40 ml-1">/100</span>
               </p>
            </Card>
         </div>
      </main>
    </div>
  );
}

function Link({ href, children, target, className }: any) {
  return (
    <a href={href} target={target} className={className}>
      {children}
    </a>
  );
}
