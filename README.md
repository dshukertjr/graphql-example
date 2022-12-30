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
```