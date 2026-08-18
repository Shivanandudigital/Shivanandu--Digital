alter table public.document_print_orders
  add column if not exists card_quantity smallint,
  add column if not exists unit_price numeric(10,2),
  add column if not exists card_subtotal numeric(10,2),
  add column if not exists delivery_charge numeric(10,2),
  add column if not exists total_amount numeric(10,2),
  add column if not exists payment_status text not null default 'Pending',
  add column if not exists razorpay_order_id text unique,
  add column if not exists razorpay_payment_id text unique,
  add column if not exists paid_at timestamptz;

alter table public.document_print_orders
  drop constraint if exists document_print_orders_payment_status_check;

alter table public.document_print_orders
  add constraint document_print_orders_payment_status_check
  check (payment_status in ('Pending', 'Paid', 'Failed', 'Refunded'));
