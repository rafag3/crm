-- Business profile table
-- Stores business info per account for helping agents respond consistently.
-- One row per account (upsert on account_id).

create table if not exists public.business_profile (
  id              uuid primary key default gen_random_uuid(),
  account_id      uuid not null references public.accounts(id) on delete cascade,
  segment         text,
  business_name   text,
  phone           text,
  address         text,
  hours           text,
  website         text,
  description     text,
  faqs            jsonb not null default '[]'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (account_id)
);

drop trigger if exists set_updated_at on public.business_profile;
create trigger set_updated_at
  before update on public.business_profile
  for each row execute function update_updated_at_column();

alter table public.business_profile enable row level security;

drop policy if exists "account members can read business_profile" on public.business_profile;
create policy "account members can read business_profile"
  on public.business_profile for select
  using (is_account_member(account_id));

drop policy if exists "owners and admins can upsert business_profile" on public.business_profile;
create policy "owners and admins can upsert business_profile"
  on public.business_profile for insert
  with check (is_account_member(account_id, 'admin'));

drop policy if exists "owners and admins can update business_profile" on public.business_profile;
create policy "owners and admins can update business_profile"
  on public.business_profile for update
  using (is_account_member(account_id, 'admin'));
