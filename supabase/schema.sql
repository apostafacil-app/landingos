-- ============================================================
-- LandingOS — Schema Completo do Banco de Dados
-- Supabase / PostgreSQL
-- ============================================================
-- Executar no SQL Editor do Supabase na ordem abaixo.
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- HELPER: atualiza updated_at automaticamente
-- ============================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- HELPER: retorna o workspace_id do usuário autenticado
-- ============================================================
create or replace function auth_workspace_id()
returns uuid as $$
  select workspace_id
  from public.workspace_members
  where user_id = auth.uid()
  limit 1;
$$ language sql security definer stable;

-- ============================================================
-- HELPER: verifica se o usuário é admin da plataforma
-- ============================================================
create or replace function is_platform_admin()
returns boolean as $$
  select exists (
    select 1 from public.workspace_members
    where user_id = auth.uid()
    and role = 'platform_admin'
  );
$$ language sql security definer stable;

-- ============================================================
-- TABELA: workspaces (tenant de cada cliente)
-- ============================================================
create table public.workspaces (
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (char_length(name) between 1 and 100),
  slug            text not null unique check (slug ~ '^[a-z0-9-]{2,60}$'),
  plan            text not null default 'trial'
                  check (plan in ('trial', 'starter', 'pro', 'suspended')),
  ai_credits_limit   integer not null default 10,
  ai_credits_used    integer not null default 0
                     check (ai_credits_used >= 0),
  status          text not null default 'active'
                  check (status in ('active', 'inactive', 'suspended')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger trg_workspaces_updated_at
  before update on public.workspaces
  for each row execute function set_updated_at();

-- ============================================================
-- TABELA: workspace_members (usuários por workspace)
-- ============================================================
create table public.workspace_members (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  role          text not null default 'owner'
                check (role in ('owner', 'member', 'platform_admin')),
  name          text check (char_length(name) <= 100),
  email         text check (char_length(email) <= 254),
  created_at    timestamptz not null default now(),
  unique(workspace_id, user_id)
);

-- ============================================================
-- TABELA: pages (landing pages)
-- ============================================================
create table public.pages (
  id                uuid primary key default gen_random_uuid(),
  workspace_id      uuid not null references public.workspaces(id) on delete cascade,
  name              text not null check (char_length(name) between 1 and 100),
  slug              text not null check (slug ~ '^[a-z0-9-]{1,60}$'),
  status            text not null default 'draft'
                    check (status in ('draft', 'published')),

  -- conteúdo do editor GrapesJS
  content           jsonb,         -- JSON do GrapesJS (para edição)
  html              text,          -- HTML sanitizado (para publicação)
  css               text,

  -- SEO / meta
  meta_title        text check (char_length(meta_title) <= 160),
  meta_description  text check (char_length(meta_description) <= 320),
  favicon_url       text check (char_length(favicon_url) <= 2000),
  og_image_url      text check (char_length(og_image_url) <= 2000),

  -- integrações de analytics (por página)
  fb_pixel_id       text check (char_length(fb_pixel_id) <= 100),
  fb_api_token      text check (char_length(fb_api_token) <= 500),
  ga_id             text check (char_length(ga_id) <= 50),
  gtm_id            text check (char_length(gtm_id) <= 50),

  -- timestamps
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  published_at      timestamptz,

  unique(workspace_id, slug)
);

create index idx_pages_workspace_id on public.pages(workspace_id);
create index idx_pages_status on public.pages(status);

create trigger trg_pages_updated_at
  before update on public.pages
  for each row execute function set_updated_at();

-- ============================================================
-- TABELA: page_views (visitas — inserção pública anônima)
-- ============================================================
create table public.page_views (
  id          uuid primary key default gen_random_uuid(),
  page_id     uuid not null references public.pages(id) on delete cascade,
  workspace_id uuid not null,
  device      text check (device in ('mobile', 'desktop', 'tablet')),
  country     text check (char_length(country) <= 2),
  referral    text check (char_length(referral) <= 2000),
  utm_source  text check (char_length(utm_source) <= 200),
  utm_medium  text check (char_length(utm_medium) <= 200),
  utm_campaign text check (char_length(utm_campaign) <= 200),
  created_at  timestamptz not null default now()
);

create index idx_page_views_page_id on public.page_views(page_id);
create index idx_page_views_workspace_id on public.page_views(workspace_id);
create index idx_page_views_created_at on public.page_views(created_at);

-- ============================================================
-- TABELA: leads (conversões capturadas pelos formulários)
-- ============================================================
create table public.leads (
  id              uuid primary key default gen_random_uuid(),
  workspace_id    uuid not null references public.workspaces(id) on delete cascade,
  page_id         uuid not null references public.pages(id) on delete cascade,

  -- dados do lead
  name            text check (char_length(name) <= 100),
  email           text check (char_length(email) <= 254),
  phone           text check (char_length(phone) <= 20),
  custom_fields   jsonb,   -- campos extras do formulário

  -- contexto da visita
  device          text check (device in ('mobile', 'desktop', 'tablet')),
  ip              text check (char_length(ip) <= 45),   -- IPv6 max
  country         text check (char_length(country) <= 2),
  region          text check (char_length(region) <= 100),
  city            text check (char_length(city) <= 100),
  referral_source text check (char_length(referral_source) <= 2000),
  page_url        text check (char_length(page_url) <= 2000),

  -- UTMs
  utm_source      text check (char_length(utm_source) <= 200),
  utm_medium      text check (char_length(utm_medium) <= 200),
  utm_campaign    text check (char_length(utm_campaign) <= 200),
  utm_term        text check (char_length(utm_term) <= 200),
  utm_content     text check (char_length(utm_content) <= 200),

  created_at      timestamptz not null default now()
);

create index idx_leads_workspace_id on public.leads(workspace_id);
create index idx_leads_page_id on public.leads(page_id);
create index idx_leads_created_at on public.leads(created_at);

-- ============================================================
-- TABELA: domains (domínios customizados)
-- ============================================================
create table public.domains (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  subdomain     text not null check (char_length(subdomain) between 1 and 63),
  root_domain   text not null check (char_length(root_domain) between 4 and 253),
  full_domain   text generated always as (subdomain || '.' || root_domain) stored,
  page_id       uuid references public.pages(id) on delete set null,
  verified      boolean not null default false,
  ssl_active    boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique(full_domain)
);

create index idx_domains_workspace_id on public.domains(workspace_id);
create index idx_domains_full_domain on public.domains(full_domain);

create trigger trg_domains_updated_at
  before update on public.domains
  for each row execute function set_updated_at();

-- ============================================================
-- TABELA: ai_generations (histórico de gerações com IA)
-- ============================================================
create table public.ai_generations (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  page_id       uuid references public.pages(id) on delete set null,
  user_id       uuid references auth.users(id) on delete set null,
  prompt_data   jsonb not null,   -- perguntas respondidas pelo usuário
  status        text not null default 'pending'
                check (status in ('pending', 'completed', 'failed')),
  credits_used  integer not null default 1 check (credits_used > 0),
  error_message text check (char_length(error_message) <= 500),
  created_at    timestamptz not null default now(),
  completed_at  timestamptz
);

create index idx_ai_generations_workspace_id on public.ai_generations(workspace_id);

-- ============================================================
-- TABELA: security_events (log de auditoria)
-- ============================================================
create table public.security_events (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete set null,
  workspace_id  uuid,
  event         text not null check (char_length(event) <= 100),
  resource      text check (char_length(resource) <= 100),
  action        text check (char_length(action) <= 100),
  result        text check (result in ('success', 'denied', 'error')),
  ip            text check (char_length(ip) <= 45),
  user_agent    text check (char_length(user_agent) <= 500),
  metadata      jsonb,
  created_at    timestamptz not null default now()
);

create index idx_security_events_user_id on public.security_events(user_id);
create index idx_security_events_workspace_id on public.security_events(workspace_id);
create index idx_security_events_created_at on public.security_events(created_at);

-- ============================================================
-- ROW LEVEL SECURITY — ativar em todas as tabelas
-- ============================================================
alter table public.workspaces         enable row level security;
alter table public.workspace_members  enable row level security;
alter table public.pages              enable row level security;
alter table public.page_views         enable row level security;
alter table public.leads              enable row level security;
alter table public.domains            enable row level security;
alter table public.ai_generations     enable row level security;
alter table public.security_events    enable row level security;

-- ============================================================
-- RLS: workspaces
-- ============================================================
-- Membro pode ver o próprio workspace
create policy "workspace: member pode ver o seu"
  on public.workspaces for select
  using (id = auth_workspace_id());

-- Membro pode atualizar o próprio workspace (exceto plano/status)
create policy "workspace: member pode atualizar o seu"
  on public.workspaces for update
  using (id = auth_workspace_id());

-- Platform admin vê todos
create policy "workspace: admin vê todos"
  on public.workspaces for all
  using (is_platform_admin());

-- ============================================================
-- RLS: workspace_members
-- ============================================================
create policy "members: ver membros do próprio workspace"
  on public.workspace_members for select
  using (workspace_id = auth_workspace_id());

create policy "members: admin vê todos"
  on public.workspace_members for all
  using (is_platform_admin());

-- ============================================================
-- RLS: pages
-- ============================================================
create policy "pages: member vê as do seu workspace"
  on public.pages for select
  using (workspace_id = auth_workspace_id());

create policy "pages: member cria no seu workspace"
  on public.pages for insert
  with check (workspace_id = auth_workspace_id());

create policy "pages: member edita as do seu workspace"
  on public.pages for update
  using (workspace_id = auth_workspace_id());

create policy "pages: member deleta as do seu workspace"
  on public.pages for delete
  using (workspace_id = auth_workspace_id());

create policy "pages: admin acessa todas"
  on public.pages for all
  using (is_platform_admin());

-- ============================================================
-- RLS: page_views (inserção pública — visitantes anônimos)
-- ============================================================
create policy "page_views: qualquer um pode inserir"
  on public.page_views for insert
  with check (true);

create policy "page_views: member vê as do seu workspace"
  on public.page_views for select
  using (workspace_id = auth_workspace_id());

create policy "page_views: admin vê todas"
  on public.page_views for select
  using (is_platform_admin());

-- ============================================================
-- RLS: leads (inserção pública — visitantes anônimos)
-- ============================================================
create policy "leads: qualquer um pode inserir"
  on public.leads for insert
  with check (true);

create policy "leads: member vê os do seu workspace"
  on public.leads for select
  using (workspace_id = auth_workspace_id());

create policy "leads: member deleta os do seu workspace"
  on public.leads for delete
  using (workspace_id = auth_workspace_id());

create policy "leads: admin acessa todos"
  on public.leads for all
  using (is_platform_admin());

-- ============================================================
-- RLS: domains
-- ============================================================
create policy "domains: member vê os do seu workspace"
  on public.domains for select
  using (workspace_id = auth_workspace_id());

create policy "domains: member cria no seu workspace"
  on public.domains for insert
  with check (workspace_id = auth_workspace_id());

create policy "domains: member edita os do seu workspace"
  on public.domains for update
  using (workspace_id = auth_workspace_id());

create policy "domains: member deleta os do seu workspace"
  on public.domains for delete
  using (workspace_id = auth_workspace_id());

create policy "domains: admin acessa todos"
  on public.domains for all
  using (is_platform_admin());

-- ============================================================
-- RLS: ai_generations
-- ============================================================
create policy "ai_gen: member vê as do seu workspace"
  on public.ai_generations for select
  using (workspace_id = auth_workspace_id());

create policy "ai_gen: member cria no seu workspace"
  on public.ai_generations for insert
  with check (workspace_id = auth_workspace_id());

create policy "ai_gen: admin acessa todas"
  on public.ai_generations for all
  using (is_platform_admin());

-- ============================================================
-- RLS: security_events (append-only para autenticados)
-- ============================================================
create policy "sec_events: autenticado pode inserir"
  on public.security_events for insert
  with check (auth.uid() is not null);

create policy "sec_events: admin lê todos"
  on public.security_events for select
  using (is_platform_admin());

-- ============================================================
-- FUNÇÃO: decrementar crédito de IA (atômico, com lock)
-- Retorna true se bem-sucedido, false se sem crédito
-- ============================================================
create or replace function consume_ai_credit(p_workspace_id uuid)
returns boolean as $$
declare
  v_updated integer;
begin
  update public.workspaces
  set ai_credits_used = ai_credits_used + 1
  where id = p_workspace_id
    and ai_credits_used < ai_credits_limit
    and status = 'active';

  get diagnostics v_updated = row_count;
  return v_updated > 0;
end;
$$ language plpgsql security definer;

-- ============================================================
-- FUNÇÃO: criar workspace + membro ao registrar usuário
-- ============================================================
create or replace function handle_new_user()
returns trigger as $$
declare
  v_workspace_id uuid;
  v_slug text;
begin
  -- gerar slug único baseado no email
  v_slug := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9]', '-', 'g'));
  v_slug := v_slug || '-' || substring(gen_random_uuid()::text, 1, 6);

  -- criar workspace
  insert into public.workspaces (name, slug)
  values (split_part(new.email, '@', 1), v_slug)
  returning id into v_workspace_id;

  -- criar membro como owner
  insert into public.workspace_members (workspace_id, user_id, role, email)
  values (v_workspace_id, new.id, 'owner', new.email);

  return new;
end;
$$ language plpgsql security definer;

-- trigger: executar ao criar usuário no Supabase Auth
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- VIEWS úteis (somente leitura)
-- ============================================================

-- métricas por página (para o dashboard do cliente)
create or replace view public.page_metrics as
select
  p.id as page_id,
  p.workspace_id,
  p.name,
  p.slug,
  p.status,
  p.published_at,
  count(distinct pv.id) filter (where pv.created_at >= now() - interval '7 days') as views_7d,
  count(distinct pv.id) as views_total,
  count(distinct l.id) filter (where l.created_at >= now() - interval '7 days') as leads_7d,
  count(distinct l.id) as leads_total,
  case
    when count(distinct pv.id) filter (where pv.created_at >= now() - interval '7 days') = 0 then 0
    else round(
      count(distinct l.id) filter (where l.created_at >= now() - interval '7 days')::numeric
      / count(distinct pv.id) filter (where pv.created_at >= now() - interval '7 days') * 100, 2
    )
  end as conversion_rate_7d
from public.pages p
left join public.page_views pv on pv.page_id = p.id
left join public.leads l on l.page_id = p.id
group by p.id, p.workspace_id, p.name, p.slug, p.status, p.published_at;
