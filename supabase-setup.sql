-- ============================================================
-- Forum App - Supabase 数据库初始化脚本
-- 在 Supabase Dashboard -> SQL Editor 中执行此脚本
-- ============================================================

-- 1. 用户资料表（关联 auth.users）
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  email text,
  created_at timestamptz default now()
);

-- 2. 帖子表
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  category text not null default '闲聊',
  view_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. 评论表
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- 开启行级安全（RLS）
-- ============================================================
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;

-- ============================================================
-- profiles 策略
-- ============================================================
-- 所有人可以查看用户资料
create policy "profiles: anyone can read"
  on public.profiles for select using (true);

-- 用户只能更新自己的资料
create policy "profiles: users can update own"
  on public.profiles for update using (auth.uid() = id);

-- ============================================================
-- posts 策略
-- ============================================================
-- 所有人可以查看帖子
create policy "posts: anyone can read"
  on public.posts for select using (true);

-- 登录用户可以发帖
create policy "posts: authenticated users can insert"
  on public.posts for insert with check (auth.uid() = author_id);

-- 作者可以更新自己的帖子
create policy "posts: authors can update own"
  on public.posts for update using (auth.uid() = author_id);

-- 作者可以删除自己的帖子
create policy "posts: authors can delete own"
  on public.posts for delete using (auth.uid() = author_id);

-- ============================================================
-- comments 策略
-- ============================================================
-- 所有人可以查看评论
create policy "comments: anyone can read"
  on public.comments for select using (true);

-- 登录用户可以发评论
create policy "comments: authenticated users can insert"
  on public.comments for insert with check (auth.uid() = author_id);

-- 作者可以删除自己的评论
create policy "comments: authors can delete own"
  on public.comments for delete using (auth.uid() = author_id);

-- ============================================================
-- 自动创建用户资料的触发器
-- 新用户注册后自动在 profiles 表插入记录
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 绑定触发器到 auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 插入示例数据（可选）
-- ============================================================
-- 注意：需要先有真实用户才能插入帖子，此处仅作参考
-- insert into public.posts (title, content, author_id, category)
-- values ('欢迎来到论坛！', '这是第一篇帖子，欢迎大家！', '<your-user-id>', '公告');
