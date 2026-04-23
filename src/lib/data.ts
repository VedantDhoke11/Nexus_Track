export type HackathonStatus = 'upcoming' | 'ongoing' | 'completed';

export interface Hackathon {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  mode: "online" | "offline" | "hybrid";
  prize: string;
  status: HackathonStatus;
}

export type UserRole = 'admin' | 'participant' | 'judge';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  teamNumber: number;
  hackathonId: string;
  memberEmails: string[];
}

export type SubmissionStatus = 'submitted' | 'under-review' | 'accepted' | 'rejected';

export interface Submission {
  id: string;
  teamId: string;
  hackathonId: string;
  roundId: string;
  title: string;
  description: string;
  pptUrl?: string;
  repoUrl?: string;
  demoUrl?: string;
  status: SubmissionStatus;
  score?: number;
}

export type RoundStatus = "upcoming" | "open" | "closed";
export type SubmissionType = "ppt" | "github" | "demo" | "mixed";

export interface Round {
  id: string;
  hackathonId: string;
  title: string;
  submissionType: SubmissionType;
  status: RoundStatus;
}

export interface ScoringCriterion {
  id: string;
  hackathonId: string;
  roundId: string;
  name: string;
  maxScore: number;
  weightage: number;
}

export interface JudgeAssignment {
  id: string;
  judgeEmail: string;
  teamId: string;
  hackathonId: string;
}

export interface ScoreEntry {
  id: string;
  submissionId: string;
  roundId: string;
  teamId: string;
  hackathonId: string;
  judgeEmail: string;
  scores: { criterionId: string; value: number }[];
  comments: string;
  total: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  roles: UserRole[];
  createdAt: string;
}

export interface LeaderboardConfig {
  visible: boolean;
}

export const hackathons: Hackathon[] = [
  {
    id: 'hack-1',
    title: 'AI Innovation Sprint',
    description: 'Build AI-powered tools that augment human productivity.',
    startDate: '2026-03-10',
    endDate: '2026-03-12',
    mode: 'hybrid',
    prize: '$5,000',
    status: 'upcoming'
  },
  {
    id: 'hack-2',
    title: 'Web3 Builder Jam',
    description: 'Create practical blockchain applications with real-world impact.',
    startDate: '2026-02-20',
    endDate: '2026-02-22',
    mode: 'online',
    prize: '$3,000',
    status: 'completed'
  },
  {
    id: 'hack-3',
    title: 'SaaS Performance Challenge',
    description: 'Optimize and reimagine high-performance SaaS experiences.',
    startDate: '2026-03-01',
    endDate: '2026-03-03',
    mode: 'offline',
    prize: '$4,000',
    status: 'ongoing'
  }
];

export const users: User[] = [
  {
    id: 'user-admin-1',
    name: 'Nexus Admin',
    email: 'admin@test.com',
    role: 'admin'
  },
  {
    id: 'user-participant-1',
    name: 'Alice Johnson',
    email: 'user@test.com',
    role: 'participant'
  },
  {
    id: 'user-participant-2',
    name: 'Bob Smith',
    email: 'participant2@test.com',
    role: 'participant'
  },
  {
    id: 'user-judge-1',
    name: 'Judge Rivera',
    email: 'judge@test.com',
    role: 'judge'
  },
  {
    id: 'user-judge-2',
    name: 'Judge Chen',
    email: 'judge2@test.com',
    role: 'judge'
  }
];

export const teams: Team[] = [
  {
    id: 'team-1',
    name: 'Velocity Labs',
    code: 'VEL123',
    teamNumber: 101,
    hackathonId: 'hack-1',
    memberEmails: ['user@test.com']
  },
  {
    id: 'team-2',
    name: 'ChainBuilders',
    code: 'CHAIN9',
    teamNumber: 202,
    hackathonId: 'hack-2',
    memberEmails: ['participant2@test.com']
  },
  {
    id: 'team-3',
    name: 'PerfMasters',
    code: 'PERF77',
    teamNumber: 303,
    hackathonId: 'hack-3',
    memberEmails: ['user@test.com', 'participant2@test.com']
  }
];

export const submissions: Submission[] = [
  {
    id: 'sub-1',
    teamId: 'team-2',
    hackathonId: 'hack-2',
    roundId: 'round-3',
    title: 'On-chain Access Control',
    description: 'A Web3-powered access control layer for SaaS products.',
    pptUrl: 'https://example.com/onchain-slides',
    repoUrl: 'https://github.com/example/onchain-access',
    demoUrl: 'https://example.com/onchain-demo',
    status: 'accepted',
    score: 36
  },
  {
    id: 'sub-2',
    teamId: 'team-3',
    hackathonId: 'hack-3',
    roundId: 'round-5',
    title: 'Latency Lens',
    description: 'Real-time performance insights dashboard for SaaS teams.',
    pptUrl: 'https://example.com/latency-lens-slides',
    repoUrl: 'https://github.com/example/latency-lens',
    demoUrl: 'https://example.com/latency-lens-demo',
    status: 'under-review'
  }
];

export const rounds: Round[] = [
  { id: "round-1", hackathonId: "hack-1", title: "Idea Pitch", submissionType: "ppt", status: "upcoming" },
  { id: "round-2", hackathonId: "hack-1", title: "Prototype Demo", submissionType: "mixed", status: "open" },
  { id: "round-3", hackathonId: "hack-2", title: "Final Review", submissionType: "mixed", status: "closed" },
  { id: "round-4", hackathonId: "hack-3", title: "Architecture Round", submissionType: "github", status: "closed" },
  { id: "round-5", hackathonId: "hack-3", title: "Product Demo", submissionType: "demo", status: "open" }
];

export const scoringCriteria: ScoringCriterion[] = [
  { id: "crit-1", hackathonId: "hack-1", roundId: "round-2", name: "Innovation", maxScore: 10, weightage: 30 },
  { id: "crit-2", hackathonId: "hack-1", roundId: "round-2", name: "Execution", maxScore: 10, weightage: 30 },
  { id: "crit-3", hackathonId: "hack-1", roundId: "round-2", name: "Pitch", maxScore: 10, weightage: 40 },
  { id: "crit-4", hackathonId: "hack-3", roundId: "round-5", name: "Technical Depth", maxScore: 10, weightage: 35 },
  { id: "crit-5", hackathonId: "hack-3", roundId: "round-5", name: "Impact", maxScore: 10, weightage: 35 },
  { id: "crit-6", hackathonId: "hack-3", roundId: "round-5", name: "Demo Quality", maxScore: 10, weightage: 30 }
];

export const judgeAssignments: JudgeAssignment[] = [
  { id: "assign-1", judgeEmail: "judge@test.com", teamId: "team-1", hackathonId: "hack-1" },
  { id: "assign-2", judgeEmail: "judge@test.com", teamId: "team-3", hackathonId: "hack-3" },
  { id: "assign-3", judgeEmail: "judge2@test.com", teamId: "team-2", hackathonId: "hack-2" }
];

export const notifications: NotificationItem[] = [
  {
    id: "note-1",
    title: "Round 2 opens tomorrow",
    message: "Prepare your repo and demo links before submissions open.",
    roles: ["participant"],
    createdAt: "2026-03-08T10:00:00.000Z"
  },
  {
    id: "note-2",
    title: "Judging rubric updated",
    message: "Please review updated criteria weightage for final demo rounds.",
    roles: ["judge"],
    createdAt: "2026-03-08T12:00:00.000Z"
  },
  {
    id: "note-3",
    title: "Leaderboard visibility enabled",
    message: "Public leaderboard is now visible for active hackathons.",
    roles: ["admin", "participant", "judge"],
    createdAt: "2026-03-08T13:00:00.000Z"
  }
];

export const scoreEntries: ScoreEntry[] = [];

export const leaderboardConfig: LeaderboardConfig = {
  visible: true
};

