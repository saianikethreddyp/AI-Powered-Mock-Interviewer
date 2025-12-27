-- AI Mock Interview Platform Database Schema
-- Run this SQL in Supabase SQL Editor to set up the database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Drop existing tables if they exist (for clean re-run)
drop table if exists public.analysis cascade;
drop table if exists public.responses cascade;
drop table if exists public.interviews cascade;

-- Interviews table
create table public.interviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  job_role text not null,
  job_description text,
  resume_text text,
  question_count integer default 8,
  status text default 'setup' check (status in ('setup', 'in_progress', 'completed', 'cancelled')),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.interviews enable row level security;

-- Interviews policies
create policy "Users can view their own interviews"
  on public.interviews for select
  using (auth.uid() = user_id);

create policy "Users can create their own interviews"
  on public.interviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own interviews"
  on public.interviews for update
  using (auth.uid() = user_id);

create policy "Users can delete their own interviews"
  on public.interviews for delete
  using (auth.uid() = user_id);

-- Responses table (stores Q&A during interview)
create table public.responses (
  id uuid default uuid_generate_v4() primary key,
  interview_id uuid references public.interviews(id) on delete cascade not null,
  question_number integer not null,
  question text not null,
  user_response text not null,
  ai_feedback text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.responses enable row level security;

-- Responses policies - allow users to manage responses for their interviews
create policy "Users can view responses for their interviews"
  on public.responses for select
  using (
    exists (
      select 1 from public.interviews
      where interviews.id = responses.interview_id
      and interviews.user_id = auth.uid()
    )
  );

create policy "Users can create responses for their interviews"
  on public.responses for insert
  with check (
    exists (
      select 1 from public.interviews
      where interviews.id = interview_id
      and interviews.user_id = auth.uid()
    )
  );

create policy "Users can update responses for their interviews"
  on public.responses for update
  using (
    exists (
      select 1 from public.interviews
      where interviews.id = responses.interview_id
      and interviews.user_id = auth.uid()
    )
  );

-- Analysis table (stores interview analysis results)
create table public.analysis (
  id uuid default uuid_generate_v4() primary key,
  interview_id uuid references public.interviews(id) on delete cascade unique not null,
  overall_score integer check (overall_score >= 0 and overall_score <= 100),
  category_scores jsonb,
  strengths text[],
  areas_for_improvement text[],
  detailed_feedback text,
  question_feedback jsonb,
  hiring_recommendation text,
  interview_tips text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.analysis enable row level security;

-- Analysis policies - allow users to manage analysis for their interviews
create policy "Users can view analysis for their interviews"
  on public.analysis for select
  using (
    exists (
      select 1 from public.interviews
      where interviews.id = analysis.interview_id
      and interviews.user_id = auth.uid()
    )
  );

create policy "Users can create analysis for their interviews"
  on public.analysis for insert
  with check (
    exists (
      select 1 from public.interviews
      where interviews.id = interview_id
      and interviews.user_id = auth.uid()
    )
  );

create policy "Users can update analysis for their interviews"
  on public.analysis for update
  using (
    exists (
      select 1 from public.interviews
      where interviews.id = analysis.interview_id
      and interviews.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
create index if not exists interviews_user_id_idx on public.interviews(user_id);
create index if not exists interviews_status_idx on public.interviews(status);
create index if not exists responses_interview_id_idx on public.responses(interview_id);
create index if not exists analysis_interview_id_idx on public.analysis(interview_id);
