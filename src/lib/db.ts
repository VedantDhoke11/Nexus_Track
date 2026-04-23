import { supabase } from './supabase';
import { 
  Hackathon, Team, User, Submission, Round, ScoringCriterion, 
  JudgeAssignment, NotificationItem, ScoreEntry, LeaderboardConfig 
} from './data';

export const db = {
  // Hackathons
  async getHackathons(): Promise<Hackathon[]> {
    const { data, error } = await supabase
      .from('hackathons')
      .select('*')
      .order('start_date', { ascending: false });
    if (error) throw error;
    return (data || []).map(h => ({
      ...h,
      startDate: h.start_date,
      endDate: h.end_date
    })) as Hackathon[];
  },

  async saveHackathon(hack: Hackathon): Promise<void> {
    const { error } = await supabase
      .from('hackathons')
      .upsert({
        id: hack.id,
        title: hack.title,
        description: hack.description,
        start_date: hack.startDate,
        end_date: hack.endDate,
        mode: hack.mode,
        prize: hack.prize,
        status: hack.status
      });
    if (error) throw error;
  },

  async deleteHackathon(id: string): Promise<void> {
    const { error } = await supabase
      .from('hackathons')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Profiles (Users)
  async getProfiles(): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    if (error) throw error;
    return data as User[];
  },

  async createProfile(user: User): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    if (error) throw error;
  },

  async getProfileByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    if (error) return null;
    return data as User;
  },

  // Teams
  async getTeams(): Promise<Team[]> {
    const { data, error } = await supabase
      .from('teams')
      .select('*');
    if (error) throw error;
    return (data || []).map(t => ({
      ...t,
      teamNumber: t.team_number,
      hackathonId: t.hackathon_id,
      memberEmails: t.member_emails
    })) as Team[];
  },

  async createTeam(team: Team): Promise<void> {
    const { error } = await supabase
      .from('teams')
      .insert({
        id: team.id,
        name: team.name,
        code: team.code,
        team_number: team.teamNumber,
        hackathon_id: team.hackathonId,
        member_emails: team.memberEmails
      });
    if (error) throw error;
  },

  async updateTeam(team: Team): Promise<void> {
    const { error } = await supabase
      .from('teams')
      .update({
        name: team.name,
        code: team.code,
        team_number: team.teamNumber,
        hackathon_id: team.hackathonId,
        member_emails: team.memberEmails
      })
      .eq('id', team.id);
    if (error) throw error;
  },

  // Rounds
  async getRounds(): Promise<Round[]> {
    const { data, error } = await supabase
      .from('rounds')
      .select('*');
    if (error) throw error;
    return (data || []).map(r => ({
      ...r,
      hackathonId: r.hackathon_id,
      submissionType: r.submission_type
    })) as Round[];
  },

  async createRound(round: Round): Promise<void> {
    const { error } = await supabase
      .from('rounds')
      .insert({
        id: round.id,
        hackathon_id: round.hackathonId,
        title: round.title,
        submission_type: round.submissionType,
        status: round.status
      });
    if (error) throw error;
  },

  // Submissions
  async getSubmissions(): Promise<Submission[]> {
    const { data, error } = await supabase
      .from('submissions')
      .select('*');
    if (error) throw error;
    return (data || []).map(s => ({
      ...s,
      teamId: s.team_id,
      hackathonId: s.hackathon_id,
      roundId: s.round_id,
      pptUrl: s.ppt_url,
      repoUrl: s.repo_url,
      demoUrl: s.demo_url
    })) as Submission[];
  },

  async createSubmission(sub: Submission): Promise<void> {
    const { error } = await supabase
      .from('submissions')
      .insert({
        id: sub.id,
        team_id: sub.teamId,
        hackathon_id: sub.hackathonId,
        round_id: sub.roundId,
        title: sub.title,
        description: sub.description,
        ppt_url: sub.pptUrl,
        repo_url: sub.repoUrl,
        demo_url: sub.demoUrl,
        status: sub.status,
        score: sub.score
      });
    if (error) throw error;
  },

  // Scoring Criteria
  async getScoringCriteria(): Promise<ScoringCriterion[]> {
    const { data, error } = await supabase
      .from('scoring_criteria')
      .select('*');
    if (error) throw error;
    return (data || []).map(c => ({
      ...c,
      hackathonId: c.hackathon_id,
      roundId: c.round_id
    })) as ScoringCriterion[];
  },

  async createScoringCriterion(c: ScoringCriterion): Promise<void> {
    const { error } = await supabase
      .from('scoring_criteria')
      .insert({
        id: c.id,
        hackathon_id: c.hackathonId,
        round_id: c.roundId,
        name: c.name,
        max_score: c.maxScore,
        weightage: c.weightage
      });
    if (error) throw error;
  },

  // Judge Assignments
  async getJudgeAssignments(): Promise<JudgeAssignment[]> {
    const { data, error } = await supabase
      .from('judge_assignments')
      .select('*');
    if (error) throw error;
    return (data || []).map(a => ({
      ...a,
      judgeEmail: a.judge_email,
      teamId: a.team_id,
      hackathonId: a.hackathon_id
    })) as JudgeAssignment[];
  },

  // Score Entries
  async getScoreEntries(): Promise<ScoreEntry[]> {
    const { data, error } = await supabase
      .from('score_entries')
      .select('*');
    if (error) throw error;
    return (data || []).map(e => ({
      ...e,
      submissionId: e.submission_id,
      roundId: e.round_id,
      teamId: e.team_id,
      hackathonId: e.hackathon_id,
      judgeEmail: e.judge_email
    })) as ScoreEntry[];
  },

  async createScoreEntry(entry: ScoreEntry): Promise<void> {
    const { error } = await supabase
      .from('score_entries')
      .insert({
        id: entry.id,
        submission_id: entry.submissionId,
        round_id: entry.roundId,
        team_id: entry.teamId,
        hackathon_id: entry.hackathonId,
        judge_email: entry.judgeEmail,
        scores: entry.scores,
        comments: entry.comments,
        total: entry.total
      });
    if (error) throw error;
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(n => ({
      ...n,
      createdAt: n.created_at
    })) as NotificationItem[];
  },

  async createNotification(n: NotificationItem): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .insert({
        id: n.id,
        title: n.title,
        message: n.message,
        roles: n.roles,
        created_at: n.createdAt
      });
    if (error) throw error;
  },

  // Leaderboard Config
  async getLeaderboardConfig(): Promise<LeaderboardConfig> {
    const { data, error } = await supabase
      .from('leaderboard_config')
      .select('*')
      .single();
    if (error) return { visible: true };
    return data as LeaderboardConfig;
  },

  async updateLeaderboardConfig(config: LeaderboardConfig): Promise<void> {
    const { error } = await supabase
      .from('leaderboard_config')
      .update({ visible: config.visible })
      .eq('id', 1);
    if (error) throw error;
  }
};
