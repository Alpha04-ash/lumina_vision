-- Create a table for narrative sessions
create table public.sessions (
  id text primary key,
  messages jsonb not null default '[]'::jsonb,
  timestamp timestamptz not null default now(),
  user_id uuid references auth.users(id) -- Optional: for future authentication
);

-- Enable Row Level Security (RLS)
alter table public.sessions enable row level security;

-- Create a policy that allows anyone to insert/select/update/delete for now (Hackathon mode)
-- WARNING: In production, you should restrict this to authenticated users.
create policy "Public Access" on public.sessions
  for all using (true) with check (true);
