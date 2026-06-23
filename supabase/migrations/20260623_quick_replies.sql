-- Quick replies table
-- Saved text snippets accessible via "/" in the message composer.

create table if not exists public.quick_replies (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references public.accounts(id) on delete cascade,
  shortcut    text not null,
  title       text not null,
  content     text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists quick_replies_account_idx on public.quick_replies (account_id);

drop trigger if exists set_updated_at on public.quick_replies;
create trigger set_updated_at
  before update on public.quick_replies
  for each row execute function update_updated_at_column();

alter table public.quick_replies enable row level security;

drop policy if exists "account members can read quick_replies" on public.quick_replies;
create policy "account members can read quick_replies"
  on public.quick_replies for select
  using (is_account_member(account_id));

drop policy if exists "admins can insert quick_replies" on public.quick_replies;
create policy "admins can insert quick_replies"
  on public.quick_replies for insert
  with check (is_account_member(account_id, 'admin'));

drop policy if exists "admins can update quick_replies" on public.quick_replies;
create policy "admins can update quick_replies"
  on public.quick_replies for update
  using (is_account_member(account_id, 'admin'));

drop policy if exists "admins can delete quick_replies" on public.quick_replies;
create policy "admins can delete quick_replies"
  on public.quick_replies for delete
  using (is_account_member(account_id, 'admin'));
