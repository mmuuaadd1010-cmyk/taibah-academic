create schema if not exists analytics_private;
revoke all on schema analytics_private from public;
grant usage on schema analytics_private to anon, authenticated;
create table if not exists analytics_private.sessions (
 day date not null, session_id uuid not null, visitor_id uuid not null,
 user_id uuid, first_seen timestamptz not null default now(), last_seen timestamptz not null default now(),
 primary key(day,session_id)
);
create index if not exists analytics_sessions_visitor on analytics_private.sessions(visitor_id,day);
create table if not exists analytics_private.accounts (
 day date not null,user_id uuid not null,first_seen timestamptz not null default now(),last_seen timestamptz not null default now(),
 primary key(day,user_id)
);
alter table analytics_private.sessions enable row level security;
alter table analytics_private.accounts enable row level security;
revoke all on all tables in schema analytics_private from public,anon,authenticated;
create or replace function analytics_private.track(p_visitor uuid,p_session uuid) returns void
language plpgsql security definer set search_path='' as $$
declare d date := (now() at time zone 'Asia/Riyadh')::date; u uuid := auth.uid();
begin
 if p_visitor is null or p_session is null then raise exception 'Missing visitor/session';end if;
 insert into analytics_private.sessions(day,session_id,visitor_id,user_id) values(d,p_session,p_visitor,u)
 on conflict(day,session_id) do update set last_seen=now(),user_id=coalesce(excluded.user_id,analytics_private.sessions.user_id)
 where analytics_private.sessions.visitor_id=excluded.visitor_id;
 if u is not null then
  insert into analytics_private.accounts(day,user_id) values(d,u)
  on conflict(day,user_id) do update set last_seen=now();
 end if;
end $$;
revoke all on function analytics_private.track(uuid,uuid) from public;
grant execute on function analytics_private.track(uuid,uuid) to anon,authenticated;
create or replace function public.tu_track_visit(p_visitor uuid,p_session uuid) returns void
language sql security invoker set search_path='' as $$select analytics_private.track(p_visitor,p_session)$$;
revoke all on function public.tu_track_visit(uuid,uuid) from public;
grant execute on function public.tu_track_visit(uuid,uuid) to anon,authenticated;
create or replace function analytics_private.report() returns jsonb
language plpgsql security definer set search_path='' as $$
declare d date := (now() at time zone 'Asia/Riyadh')::date; result jsonb;
begin
 if auth.uid() is null or not public.tu_is_admin() then raise exception 'Admin required' using errcode='42501';end if;
 with days as (select generate_series(d-29,d,interval '1 day')::date as day),
 daily as (
 select x.day,
 (select count(*) from analytics_private.sessions s where s.day=x.day) as visits,
 (select count(*) from analytics_private.accounts a where a.day=x.day) as accounts,
 (select count(distinct s.visitor_id) from analytics_private.sessions s where s.day=x.day and not exists(select 1 from analytics_private.sessions k where k.day=s.day and k.visitor_id=s.visitor_id and k.user_id is not null)) as anonymous
 from days x
 )
 select jsonb_build_object('today',d,'timezone','Asia/Riyadh','since',(select min(first_seen) from analytics_private.sessions),
 'days',(select jsonb_agg(to_jsonb(t) order by t.day desc) from daily t),
 'total_visits',(select count(*) from analytics_private.sessions),
 'total_accounts',(select count(distinct user_id) from analytics_private.accounts),
 'total_anonymous',(select count(distinct s.visitor_id) from analytics_private.sessions s where not exists(select 1 from analytics_private.sessions k where k.visitor_id=s.visitor_id and k.user_id is not null)),
 'hours',(select jsonb_agg(jsonb_build_object('hour',h,'visits',(select count(*) from analytics_private.sessions s where s.day=d and extract(hour from s.first_seen at time zone 'Asia/Riyadh')=h),'accounts',(select count(*) from analytics_private.accounts a where a.day=d and extract(hour from a.first_seen at time zone 'Asia/Riyadh')=h)) order by h) from generate_series(0,23) h),
 'people',(select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) from (select a.user_id,p.name,p.username,a.first_seen,a.last_seen from analytics_private.accounts a left join public.profiles p on p.user_id=a.user_id where a.day=d order by a.last_seen desc limit 200) t)
 ) into result;
 return result;
end $$;
revoke all on function analytics_private.report() from public;
grant execute on function analytics_private.report() to authenticated;
create or replace function public.tu_visit_report() returns jsonb language sql security invoker set search_path='' as $$select analytics_private.report()$$;
revoke all on function public.tu_visit_report() from public,anon;
grant execute on function public.tu_visit_report() to authenticated;
