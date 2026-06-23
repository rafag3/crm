-- Widget config table
-- One row per account, stores the floating WhatsApp button configuration.

create table if not exists public.widget_config (
  id              uuid primary key default gen_random_uuid(),
  account_id      uuid not null references public.accounts(id) on delete cascade,
  enabled         boolean not null default true,
  phone_number    text not null default '',
  button_text     text not null default 'Fale conosco',
  welcome_message text not null default 'Olá! Como podemos ajudar?',
  position        text not null default 'right',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (account_id)
);

drop trigger if exists set_updated_at on public.widget_config;
create trigger set_updated_at
  before update on public.widget_config
  for each row execute function update_updated_at_column();

alter table public.widget_config enable row level security;

drop policy if exists "account members can read widget_config" on public.widget_config;
create policy "account members can read widget_config"
  on public.widget_config for select
  using (is_account_member(account_id));

drop policy if exists "admins can upsert widget_config" on public.widget_config;
create policy "admins can upsert widget_config"
  on public.widget_config for insert
  with check (is_account_member(account_id, 'admin'));

drop policy if exists "admins can update widget_config" on public.widget_config;
create policy "admins can update widget_config"
  on public.widget_config for update
  using (is_account_member(account_id, 'admin'));
