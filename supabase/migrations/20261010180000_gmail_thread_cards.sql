alter table public.creator_campaigns
  add column if not exists action_url text,
  add column if not exists next_step text,
  add column if not exists parser_model text;

alter table public.user_email_integrations
  add column if not exists gmail_sync_cursor_ms bigint,
  add column if not exists gmail_sync_page_token text;

create table if not exists public.parser_provider_alerts (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  kind text not null,
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists parser_provider_alerts_recent
  on public.parser_provider_alerts (provider, kind, created_at desc);

alter table public.parser_provider_alerts enable row level security;

drop policy if exists "Admins read parser provider alerts" on public.parser_provider_alerts;
create policy "Admins read parser provider alerts"
  on public.parser_provider_alerts
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'ADMIN'
    )
  );

grant select on table public.parser_provider_alerts to authenticated;
grant all on table public.parser_provider_alerts to service_role;
