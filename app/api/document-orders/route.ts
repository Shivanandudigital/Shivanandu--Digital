import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

export const runtime = "nodejs";

const allowedDocuments = new Set(["ration_card", "voter_epic", "ayushman_card", "driving_licence"]);
const allowedPrintTypes = new Set(["colour_print", "print_lamination", "pvc_size_print"]);
const allowedDelivery = new Set(["shop_pickup", "home_delivery"]);
const allowedMime = new Set(["application/pdf", "image/jpeg", "image/png"]);

function serverClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function textValue(form: FormData, key: string, max = 300) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validFileSignature(bytes: Uint8Array, mime: string) {
  if (mime === "application/pdf") return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
  if (mime === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === "image/png") return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  return false;
}

export async function POST(request: NextRequest) {
  const supabase = serverClient();
  if (!supabase) return NextResponse.json({ error: "Order service is being configured. Please contact Shivanandu Digital." }, { status: 503 });

  try {
    const form = await request.formData();
    const documentType = textValue(form, "documentType", 30);
    const printType = textValue(form, "printType", 30);
    const deliveryMethod = textValue(form, "deliveryMethod", 30);
    const customerName = textValue(form, "customerName", 80);
    const phone = textValue(form, "phone", 10);
    const address = textValue(form, "address", 300);
    const pincode = textValue(form, "pincode", 6);
    const consent = textValue(form, "consent", 3);
    const copies = Number(textValue(form, "copies", 2));
    const file = form.get("document");

    if (!allowedDocuments.has(documentType) || !allowedPrintTypes.has(printType) || !allowedDelivery.has(deliveryMethod)) return NextResponse.json({ error: "Please select valid order options." }, { status: 400 });
    if (!customerName || !/^[6-9]\d{9}$/.test(phone) || consent !== "yes") return NextResponse.json({ error: "Please provide valid customer details and consent." }, { status: 400 });
    if (!Number.isInteger(copies) || copies < 1 || copies > 20) return NextResponse.json({ error: "Copies must be between 1 and 20." }, { status: 400 });
    if (deliveryMethod === "home_delivery" && (!address || !/^[1-9]\d{5}$/.test(pincode))) return NextResponse.json({ error: "Please provide a valid delivery address and PIN code." }, { status: 400 });
    if (!(file instanceof File) || file.size === 0 || file.size > 10 * 1024 * 1024 || !allowedMime.has(file.type)) return NextResponse.json({ error: "Upload a PDF, JPG or PNG file up to 10 MB." }, { status: 400 });

    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!validFileSignature(bytes, file.type)) return NextResponse.json({ error: "The uploaded file does not match its stated format." }, { status: 400 });

    const orderId = `SDP-${randomBytes(4).toString("hex").toUpperCase()}`;
    const extension = file.type === "application/pdf" ? "pdf" : file.type === "image/png" ? "png" : "jpg";
    const storagePath = `${new Date().getUTCFullYear()}/${orderId}/${randomBytes(12).toString("hex")}.${extension}`;
    const upload = await supabase.storage.from("document-orders").upload(storagePath, bytes, { contentType: file.type, upsert: false });
    if (upload.error) throw upload.error;

    const insert = await supabase.from("document_print_orders").insert({
      order_id: orderId,
      document_type: documentType,
      print_type: printType,
      copies,
      customer_name: customerName,
      phone,
      delivery_method: deliveryMethod,
      delivery_address: deliveryMethod === "home_delivery" ? address : null,
      pincode: deliveryMethod === "home_delivery" ? pincode : null,
      storage_path: storagePath,
      original_file_name: file.name.slice(0, 150),
      file_mime_type: file.type,
      status: "Order Received",
      consented_at: new Date().toISOString(),
    });

    if (insert.error) {
      await supabase.storage.from("document-orders").remove([storagePath]);
      throw insert.error;
    }

    return NextResponse.json({ orderId }, { status: 201 });
  } catch (error) {
    console.error("Document order failed", error);
    return NextResponse.json({ error: "The order could not be submitted. Please try again." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const supabase = serverClient();
  if (!supabase) return NextResponse.json({ error: "Tracking service is being configured." }, { status: 503 });

  const orderId = (request.nextUrl.searchParams.get("orderId") || "").trim().toUpperCase();
  const phone = (request.nextUrl.searchParams.get("phone") || "").trim();
  if (!/^SDP-[A-F0-9]{8}$/.test(orderId) || !/^[6-9]\d{9}$/.test(phone)) return NextResponse.json({ error: "Enter a valid Order ID and mobile number." }, { status: 400 });

  const result = await supabase.from("document_print_orders").select("order_id,document_type,status,created_at,updated_at").eq("order_id", orderId).eq("phone", phone).maybeSingle();
  if (result.error) return NextResponse.json({ error: "Tracking is temporarily unavailable." }, { status: 500 });
  if (!result.data) return NextResponse.json({ error: "No matching order was found." }, { status: 404 });

  return NextResponse.json({
    orderId: result.data.order_id,
    documentType: result.data.document_type,
    status: result.data.status,
    createdAt: result.data.created_at,
    updatedAt: result.data.updated_at,
  });
}
