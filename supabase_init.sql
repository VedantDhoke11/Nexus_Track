-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Hackathons
create table hackathons (
  id text primary key,
  title text not null,
  description text,
  start_date date,
  end_date date,
  mode text check (mode in ('online', 'offline', 'hybrid')),
  prize text,
  status text check (status in ('upcoming', 'ongoing', 'completed'))
);

-- 2. Profiles (Users metadata)
create table profiles (
  id text primary key,
  name text not null,
  email text unique not null,
  role text check (role in ('admin', 'participant', 'judge'))
);

-- 3. Teams
create table teams (
  id text primary key,
  name text not null,
  code text unique not null,
  team_number integer,
  hackathon_id text references hackathons(id) on delete cascade,
  member_emails text[]
);

-- 4. Rounds
create table rounds (
  id text primary key,
  hackathon_id text references hackathons(id) on delete cascade,
  title text not null,
  submission_type text check (submission_type in ('ppt', 'github', 'demo', 'mixed')),
  status text check (status in ('upcoming', 'open', 'closed'))
);

-- 5. Submissions
create table submissions (
  id text primary key,
  team_id text references teams(id) on delete cascade,
  hackathon_id text references hackathons(id) on delete cascade,
  round_id text references rounds(id) on delete cascade,
  title text not null,
  description text,
  ppt_url text,
  repo_url text,
  demo_url text,
  status text check (status in ('submitted', 'under-review', 'accepted', 'rejected')),
  score float
);

-- 6. Scoring Criteria
create table scoring_criteria (
  id text primary key,
  hackathon_id text references hackathons(id) on delete cascade,
  round_id text references rounds(id) on delete cascade,
  name text not null,
  max_score integer,
  weightage integer
);

-- 7. Judge Assignments
create table judge_assignments (
  id text primary key,
  judge_email text,
  team_id text references teams(id) on delete cascade,
  hackathon_id text references hackathons(id) on delete cascade
);

-- 8. Score Entries
create table score_entries (
  id text primary key,
  submission_id text references submissions(id) on delete cascade,
  round_id text references rounds(id) on delete cascade,
  team_id text references teams(id) on delete cascade,
  hackathon_id text references hackathons(id) on delete cascade,
  judge_email text,
  scores jsonb, 
  comments text,
  total float
);

-- 9. Notifications
create table notifications (
  id text primary key,
  title text not null,
  message text,
  roles text[],
  created_at timestamp with time zone default now()
);

-- 10. Leaderboard Config
create table leaderboard_config (
  id integer primary key default 1,
  visible boolean default true,
  constraint single_row check (id = 1)
);

-- SEED DATA

insert into hackathons (id, title, description, start_date, end_date, mode, prize, status) values
('hack-1', 'AI Innovation Sprint', 'Build AI-powered tools that augment human productivity.', '2026-03-10', '2026-03-12', 'hybrid', '$5,000', 'upcoming'),
('hack-2', 'Web3 Builder Jam', 'Create practical blockchain applications with real-world impact.', '2026-02-20', '2026-02-22', 'online', '$3,000', 'completed'),
('hack-3', 'SaaS Performance Challenge', 'Optimize and reimagine high-performance SaaS experiences.', '2026-03-01', '2026-03-03', 'offline', '$4,000', 'ongoing');

insert into profiles (id, name, email, role) values
('user-admin-1', 'Nexus Admin', 'admin@test.com', 'admin'),
('user-participant-1', 'Alice Johnson', 'user@test.com', 'participant'),
('user-participant-2', 'Bob Smith', 'participant2@test.com', 'participant'),
('user-judge-1', 'Judge Rivera', 'judge@test.com', 'judge'),
('user-judge-2', 'Judge Chen', 'judge2@test.com', 'judge');

insert into teams (id, name, code, team_number, hackathon_id, member_emails) values
('team-1', 'Velocity Labs', 'VEL123', 101, 'hack-1', ARRAY['user@test.com']),
('team-2', 'ChainBuilders', 'CHAIN9', 202, 'hack-2', ARRAY['participant2@test.com']),
('team-3', 'PerfMasters', 'PERF77', 303, 'hack-3', ARRAY['user@test.com', 'participant2@test.com']);

insert into rounds (id, hackathon_id, title, submission_type, status) values
('round-1', 'hack-1', 'Idea Pitch', 'ppt', 'upcoming'),
('round-2', 'hack-1', 'Prototype Demo', 'mixed', 'open'),
('round-3', 'hack-2', 'Final Review', 'mixed', 'closed'),
('round-4', 'hack-3', 'Architecture Round', 'github', 'closed'),
('round-5', 'hack-3', 'Product Demo', 'demo', 'open');

insert into submissions (id, team_id, hackathon_id, round_id, title, description, ppt_url, repo_url, demo_url, status, score) values
('sub-1', 'team-2', 'hack-2', 'round-3', 'On-chain Access Control', 'A Web3-powered access control layer for SaaS products.', 'https://example.com/onchain-slides', 'https://github.com/example/onchain-access', 'https://example.com/onchain-demo', 'accepted', 36),
('sub-2', 'team-3', 'hack-3', 'round-5', 'Latency Lens', 'Real-time performance insights dashboard for SaaS teams.', 'https://example.com/latency-lens-slides', 'https://github.com/example/latency-lens', 'https://example.com/latency-lens-demo', 'under-review', null);

insert into scoring_criteria (id, hackathon_id, round_id, name, max_score, weightage) values
('crit-1', 'hack-1', 'round-2', 'Innovation', 10, 30),
('crit-2', 'hack-1', 'round-2', 'Execution', 10, 30),
('crit-3', 'hack-1', 'round-2', 'Pitch', 10, 40),
('crit-4', 'hack-3', 'round-5', 'Technical Depth', 10, 35),
('crit-5', 'hack-3', 'round-5', 'Impact', 10, 35),
('crit-6', 'hack-3', 'round-5', 'Demo Quality', 10, 30);

insert into judge_assignments (id, judge_email, team_id, hackathon_id) values
('assign-1', 'judge@test.com', 'team-1', 'hack-1'),
('assign-2', 'judge@test.com', 'team-3', 'hack-3'),
('assign-3', 'judge2@test.com', 'team-2', 'hack-2');

insert into notifications (id, title, message, roles, created_at) values
('note-1', 'Round 2 opens tomorrow', 'Prepare your repo and demo links before submissions open.', ARRAY['participant'], '2026-03-08T10:00:00.000Z'),
('note-2', 'Judging rubric updated', 'Please review updated criteria weightage for final demo rounds.', ARRAY['judge'], '2026-03-08T12:00:00.000Z'),
('note-3', 'Leaderboard visibility enabled', 'Public leaderboard is now visible for active hackathons.', ARRAY['admin', 'participant', 'judge'], '2026-03-08T13:00:00.000Z');

insert into leaderboard_config (id, visible) values (1, true);
