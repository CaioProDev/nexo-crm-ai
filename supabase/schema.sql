create extension if not exists "pgcrypto";

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  company text not null check (char_length(company) between 2 and 120),
  email text not null,
  phone text not null,
  value numeric(12, 2) not null default 0 check (value >= 0),
  stage text not null default 'Novo' check (stage in ('Novo', 'Qualificado', 'Proposta', 'Negociação', 'Ganho')),
  score integer not null default 50 check (score between 0 and 100),
  source text not null,
  last_contact timestamptz not null default now(),
  next_action text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.leads enable row level security;

-- The MVP accesses this table only through server routes using the service role.
-- No public RLS policy is intentionally created.

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at before update on public.leads
for each row execute function public.set_updated_at();
