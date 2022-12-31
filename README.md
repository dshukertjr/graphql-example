# SupabaseGraphQLTODOリスト

SupabaseのGraphQL用エクステンションであるpg_graphqlを使って作ったTODOリストサンプルアプリです。

```sql
create table if not exists tasks (
    id uuid primary key not null default gen_random_uuid(),
    user_id uuid not null references auth.users(id) default auth.uid(),
    title text not null,
    is_completed boolean not null default false,
    created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;
create policy "Users can select their own tasks" on public.tasks for select using (auth.uid() = user_id);
create policy "Users can insert their own tasks" on public.tasks for insert with check (auth.uid() = user_id);
create policy "Users can update their own tasks" on public.tasks for update  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own tasks" on public.tasks for delete using (auth.uid() = user_id);
```

1. run `npm install`
1. run `npm run compile` to generate types
