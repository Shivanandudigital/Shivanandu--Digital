-- Run once in Supabase SQL Editor before enabling Document Printing orders.
create extension if not exists pgcrypto;

create table if not exists public.document_print_orders (
  id uuid primary key default gen_random_uuid(),
  order_id text unique not null check (order_id ~ '^SDP-[A-F0-9]{8}$'),
  document_type text not null check (document_type in ('ration_card', 'voter_epic', 'ayushman_card', 'driving_licence')),
  print_type text not null check (print_type in ('colour_print', 'print_lamination', 'pvc_size_print')),
  copies smallint not null check (copies between 1 and 20),
  customer_name text not null,
  phone text not null,
  delivery_method text not null check (delivery_method in ('shop_pickup', 'home_delivery')),
  delivery_address text,
  pincode text,
  storage_path text unique not null,
  original_file_name text not null,
  file_mime_type text not null,
  status text not null default 'Order Received' check (status in ('Order Received', 'Verified', 'Printing', 'Ready / Shipped', 'Delivered', 'Rejected', 'Cancelled')),
  admin_note text,
  consented_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.document_print_orders enable row level security;
revoke all on public.document_print_orders from anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('document-orders', 'document-orders', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png'])
on conflict (id) do update set public = false, file_size_limit = 10485760, allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.set_document_order_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists document_order_updated_at on public.document_print_orders;
create trigger document_order_updated_at before update on public.document_print_orders
for each row execute function public.set_document_order_updated_at();

comment on table public.document_print_orders is 'Private customer print orders. Delete uploaded documents after fulfilment and the configured retention period.';
