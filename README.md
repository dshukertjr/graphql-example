# Supabase GraphQL Todo List App

![Supabase GraphQL Todo List App](https://raw.githubusercontent.com/dshukertjr/graphql-example/main/misc/screenrecording.gif)

Simple Next.js todo list app built with the GraphQL extension of Supabase, pg_graphql. 

- Read and write to Supabase database via GraphQL
- Works with Row Level Security using Supabase auth

## Tech Stack

- [Supabase](https://supabase.com) - provides auth and database
- [pg_graphql](https://github.com/supabase/pg_graphql) - GraphQL extension for Postgres
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Apollo Client](https://www.apollographql.com/docs/react/) - GraphQL client

## Running the app

1. Clone the repo
1. Run `npm install`
1. Run `npm run compile` to generate types
1. Run the following SQL in your Supabase project from the SQL editor
1. Create a `.env.local` file with the following variables
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
1. Run `npm run dev` to start the app


```sql
create table if not exists tasks (
    id uuid primary key not null default gen_random_uuid(),
    user_id uuid not null references auth.users(id) default auth.uid(),
    title text not null constraint title_length_check check (char_length(title) > 0),
    is_completed boolean not null default false,
    created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;
create policy "Users can select their own tasks" on public.tasks for select using (auth.uid() = user_id);
create policy "Users can insert their own tasks" on public.tasks for insert with check (auth.uid() = user_id);
create policy "Users can update their own tasks" on public.tasks for update  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own tasks" on public.tasks for delete using (auth.uid() = user_id);
```

