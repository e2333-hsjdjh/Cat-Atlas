create extension if not exists pgcrypto;

create type public.user_role as enum ('user', 'staff', 'admin');
create type public.cat_status as enum ('pending', 'official', 'merged', 'rejected', 'adopted');
create type public.post_type as enum ('sighting', 'update', 'story', 'health');
create type public.review_status as enum ('pending', 'approved', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role public.user_role not null default 'user',
  is_banned boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  is_active boolean not null default true
);

create table public.cats (
  id uuid primary key default gen_random_uuid(),
  location_id uuid references public.locations(id),
  slug text unique not null,
  name text not null,
  sex text not null default '未知',
  estimated_age text,
  coat text not null,
  distinctive_features text not null,
  area_public text not null,
  temperament text,
  health_status text,
  neutered boolean,
  intro text,
  cover_path text,
  status public.cat_status not null default 'pending',
  merged_into uuid references public.cats(id),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cat_aliases (
  id uuid primary key default gen_random_uuid(),
  cat_id uuid not null references public.cats(id) on delete cascade,
  alias text not null,
  unique(cat_id, alias)
);

create table public.cat_applications (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references public.profiles(id),
  proposed_name text not null,
  coat text not null,
  distinctive_features text not null,
  area_public text not null,
  notes text,
  temporary_cat_id uuid references public.cats(id),
  status public.review_status not null default 'pending',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  decision_note text,
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id),
  cat_id uuid references public.cats(id),
  type public.post_type not null default 'sighting',
  title text not null check (char_length(title) between 1 and 60),
  body text not null check (char_length(body) between 1 and 2000),
  area_public text not null,
  occurred_at date not null,
  image_path text,
  is_featured boolean not null default false,
  is_hidden boolean not null default false,
  corrected_from_cat_id uuid references public.cats(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  cat_id uuid not null references public.cats(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  event_type text not null,
  title text not null,
  detail text,
  occurred_at date not null,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id),
  post_id uuid not null references public.posts(id) on delete cascade,
  reason text not null,
  detail text,
  status public.review_status not null default 'pending',
  handled_by uuid references public.profiles(id),
  handled_at timestamptz,
  created_at timestamptz not null default now(),
  unique(reporter_id, post_id)
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id),
  title text not null,
  summary text not null,
  cover_path text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.campaign_submissions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  submitter_id uuid not null references public.profiles(id),
  cat_id uuid references public.cats(id),
  title text not null,
  body text not null,
  image_path text,
  contact_private text not null,
  consent_granted boolean not null default false,
  status public.review_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index cats_status_idx on public.cats(status);
create index posts_cat_occurred_idx on public.posts(cat_id, occurred_at desc);
create index posts_unidentified_idx on public.posts(created_at desc) where cat_id is null and is_hidden = false;
create index reports_status_idx on public.reports(status);
create index submissions_campaign_idx on public.campaign_submissions(campaign_id, created_at desc);

create or replace function public.is_staff() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role in ('staff','admin') and not is_banned)
$$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin' and not is_banned)
$$;

alter table public.profiles enable row level security;
alter table public.cats enable row level security;
alter table public.cat_aliases enable row level security;
alter table public.cat_applications enable row level security;
alter table public.posts enable row level security;
alter table public.timeline_events enable row level security;
alter table public.reports enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_submissions enable row level security;

create policy "public profiles readable" on public.profiles for select using (true);
create policy "user updates own profile" on public.profiles for update using (auth.uid() = id);
create policy "admin manages roles" on public.profiles for update using (public.is_admin());
create policy "public cats readable" on public.cats for select using (status in ('official','pending','adopted'));
create policy "staff manages cats" on public.cats for all using (public.is_staff()) with check (public.is_staff());
create policy "aliases readable" on public.cat_aliases for select using (true);
create policy "staff manages aliases" on public.cat_aliases for all using (public.is_staff()) with check (public.is_staff());
create policy "users submit applications" on public.cat_applications for insert with check (auth.uid() = applicant_id);
create policy "users read own applications" on public.cat_applications for select using (auth.uid() = applicant_id or public.is_staff());
create policy "staff reviews applications" on public.cat_applications for update using (public.is_staff());
create policy "visible posts readable" on public.posts for select using (not is_hidden or auth.uid() = author_id or public.is_staff());
create policy "users create posts" on public.posts for insert with check (auth.uid() = author_id and not exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_banned));
create policy "owners edit posts" on public.posts for update using (auth.uid() = author_id or public.is_staff());
create policy "owners delete posts" on public.posts for delete using (auth.uid() = author_id or public.is_staff());
create policy "public events readable" on public.timeline_events for select using (is_public or public.is_staff());
create policy "staff manages events" on public.timeline_events for all using (public.is_staff()) with check (public.is_staff());
create policy "users create reports" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "reporter or staff reads report" on public.reports for select using (auth.uid() = reporter_id or public.is_staff());
create policy "staff handles reports" on public.reports for update using (public.is_staff());
create policy "published campaigns readable" on public.campaigns for select using (is_published or public.is_staff());
create policy "staff manages campaigns" on public.campaigns for all using (public.is_staff()) with check (public.is_staff());
create policy "users submit campaigns" on public.campaign_submissions for insert with check (auth.uid() = submitter_id and consent_granted);
create policy "private submissions" on public.campaign_submissions for select using (auth.uid() = submitter_id or public.is_staff());
create policy "staff reviews submissions" on public.campaign_submissions for update using (public.is_staff());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cat-photos', 'cat-photos', false, 8388608, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy "authenticated upload cat photos" on storage.objects for insert to authenticated with check (bucket_id='cat-photos' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "owners and staff read private photos" on storage.objects for select to authenticated using (bucket_id='cat-photos' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_staff()));

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles(id, display_name) values(new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1))); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

insert into public.locations(id, name, slug) values ('00000000-0000-4000-8000-000000000001', '示范校园', 'demo-campus') on conflict do nothing;
insert into public.cats(id, location_id, slug, name, sex, estimated_age, coat, distinctive_features, area_public, temperament, health_status, neutered, intro, status) values
('10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','tangyuan','汤圆','公猫','约 3 岁','橘色虎斑','右耳有小缺口，尾巴末端颜色较深','图书馆南侧','亲人但不喜欢被抱','状态良好',true,'常在午后晒太阳的橘猫。','official'),
('10000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','captain','队长','公猫','约 5 岁','黑白奶牛','白鼻梁，四只白袜子','第二食堂附近','稳重、警觉','需控制体重',true,'每天按固定路线巡视食堂与操场。','official'),
('10000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000001','xiaohua','小花','母猫','约 2 岁','三花','左眼周围有橘色花纹','艺术楼庭院','温柔、慢热','状态良好',true,'喜欢安静地坐在花坛边观察来往的人。','official'),
('10000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000001','wuyun','乌云','母猫','约 4 岁','纯灰短毛','金色眼睛，左前爪有浅色斑','行政楼北侧','独立、安静','春季轻微皮肤敏感',true,'雨前经常出现在连廊。','official'),
('10000000-0000-4000-8000-000000000005','00000000-0000-4000-8000-000000000001','mitao','蜜桃','未知','约 1 岁','奶油色','浅色尾巴，粉色鼻尖','东门草坪','待观察','待确认',null,'新近出现的小猫，档案仍在确认中。','pending') on conflict do nothing;
insert into public.campaigns(id, title, summary, starts_at, ends_at, is_published) values
('20000000-0000-4000-8000-000000000001','征集：我和校园猫的第一次见面','把第一次遇见它的故事写下来，也许会成为猫咪档案里最温柔的一页。','2026-08-01','2026-09-15 23:59:59+08',true),
('20000000-0000-4000-8000-000000000002','寻找蜜桃的旧照片','如果你在东门附近拍到过这只奶油色小猫，请提供时间和照片帮助我们完善档案。','2026-08-01','2026-08-31 23:59:59+08',true) on conflict do nothing;
