-- Sallys BücherWahn – Datenbankschema
-- Diesen Code im Supabase-Dashboard unter "SQL Editor" ausführen.

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  isbn text,
  title text not null,
  authors text[] not null default '{}',
  cover_url text,
  description text,
  publisher text,
  published_date text,
  page_count integer,
  categories text[] not null default '{}',
  status text not null default 'owned'
    check (status in ('wishlist', 'owned', 'reading', 'read')),
  rating integer check (rating between 0 and 5),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists books_user_id_idx on public.books (user_id);

-- Row Level Security: jede:r sieht und bearbeitet nur die eigenen Bücher
alter table public.books enable row level security;

drop policy if exists "Eigene Bücher lesen" on public.books;
create policy "Eigene Bücher lesen"
  on public.books for select
  using (auth.uid() = user_id);

drop policy if exists "Eigene Bücher anlegen" on public.books;
create policy "Eigene Bücher anlegen"
  on public.books for insert
  with check (auth.uid() = user_id);

drop policy if exists "Eigene Bücher ändern" on public.books;
create policy "Eigene Bücher ändern"
  on public.books for update
  using (auth.uid() = user_id);

drop policy if exists "Eigene Bücher löschen" on public.books;
create policy "Eigene Bücher löschen"
  on public.books for delete
  using (auth.uid() = user_id);
