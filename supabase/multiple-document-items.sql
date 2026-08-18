create table if not exists public.document_print_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.document_print_orders(order_id) on delete cascade,
  item_number smallint not null check (item_number between 1 and 10),
  holder_name text not null,
  document_number text not null,
  document_type text not null check (document_type in ('ration_card', 'voter_epic', 'ayushman_card', 'driving_licence')),
  print_type text not null check (print_type in ('colour_print', 'print_lamination', 'pvc_size_print')),
  copies smallint not null check (copies between 1 and 20),
  storage_path text unique not null,
  original_file_name text not null,
  file_mime_type text not null,
  created_at timestamptz not null default now(),
  unique (order_id, item_number)
);

alter table public.document_print_order_items enable row level security;
revoke all on public.document_print_order_items from anon, authenticated;
create index if not exists document_print_order_items_order_id_idx on public.document_print_order_items(order_id);
