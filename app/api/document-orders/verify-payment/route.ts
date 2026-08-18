import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!url || !serviceKey || !razorpaySecret) return NextResponse.json({ error: "Payment verification is not configured." }, { status: 503 });

  const body = await request.json() as { orderId?: string; razorpayOrderId?: string; razorpayPaymentId?: string; razorpaySignature?: string };
  if (!body.orderId || !body.razorpayOrderId || !body.razorpayPaymentId || !body.razorpaySignature) return NextResponse.json({ error: "Missing payment details." }, { status: 400 });
  const expected = createHmac("sha256", razorpaySecret).update(`${body.razorpayOrderId}|${body.razorpayPaymentId}`).digest("hex");
  const received = Buffer.from(body.razorpaySignature, "utf8");
  const valid = received.length === expected.length && timingSafeEqual(received, Buffer.from(expected, "utf8"));
  if (!valid) return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const update = await supabase.from("document_print_orders").update({ payment_status: "Paid", razorpay_payment_id: body.razorpayPaymentId, paid_at: new Date().toISOString() }).eq("order_id", body.orderId).eq("razorpay_order_id", body.razorpayOrderId).eq("payment_status", "Pending").select("order_id").maybeSingle();
  if (update.error || !update.data) return NextResponse.json({ error: "Payment could not be linked to the order." }, { status: 400 });
  return NextResponse.json({ success: true, orderId: update.data.order_id });
}
