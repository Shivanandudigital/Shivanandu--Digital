import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const documentTypes = new Set(["ration_card", "voter_epic", "ayushman_card", "driving_licence"]);
const printTypes = new Set(["colour_print", "print_lamination", "pvc_size_print"]);
const mimeTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);

function serverClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
}

function field(form: FormData, key: string, max = 300) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validFile(bytes: Uint8Array, mime: string) {
  if (mime === "application/pdf") return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
  if (mime === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  return mime === "image/png" && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
}

export async function POST(request: NextRequest) {
  const supabase = serverClient();
  if (!supabase) return NextResponse.json({ error: "Order service is being configured." }, { status: 503 });
  const uploaded: string[] = [];
  let orderId = "";
  try {
    const form = await request.formData();
    const count = Number(field(form, "itemsCount", 2));
    const customerName = field(form, "customerName", 80);
    const phone = field(form, "phone", 10);
    const deliveryMethod = field(form, "deliveryMethod", 20);
    const address = field(form, "address");
    const pincode = field(form, "pincode", 6);
    if (!Number.isInteger(count) || count < 1 || count > 10) return NextResponse.json({ error: "Add 1 to 10 documents." }, { status: 400 });
    if (!customerName || !/^[6-9]\d{9}$/.test(phone) || field(form, "consent", 3) !== "yes") return NextResponse.json({ error: "Enter valid customer details and consent." }, { status: 400 });
    if (!new Set(["shop_pickup", "home_delivery"]).has(deliveryMethod)) return NextResponse.json({ error: "Select a delivery method." }, { status: 400 });
    if (deliveryMethod === "home_delivery" && (!address || !/^[1-9]\d{5}$/.test(pincode))) return NextResponse.json({ error: "Enter a valid delivery address." }, { status: 400 });

    const items: Array<{ holderName: string; documentNumber: string; documentType: string; printType: string; copies: number; file: File; bytes: Uint8Array }> = [];
    let totalSize = 0;
    for (let index = 0; index < count; index += 1) {
      const holderName = field(form, `holderName_${index}`, 80);
      const documentNumber = field(form, `documentNumber_${index}`, 40).toUpperCase();
      const documentType = field(form, `documentType_${index}`, 30);
      const printType = field(form, `printType_${index}`, 30);
      const copies = Number(field(form, `copies_${index}`, 2));
      const file = form.get(`document_${index}`);
      if (!holderName || documentNumber.length < 4 || !documentTypes.has(documentType) || !printTypes.has(printType) || !Number.isInteger(copies) || copies < 1 || copies > 20) return NextResponse.json({ error: `Check Document ${index + 1} details.` }, { status: 400 });
      if (!(file instanceof File) || !mimeTypes.has(file.type) || file.size === 0) return NextResponse.json({ error: `Upload a valid file for Document ${index + 1}.` }, { status: 400 });
      totalSize += file.size;
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (!validFile(bytes, file.type)) return NextResponse.json({ error: `Document ${index + 1} file format is invalid.` }, { status: 400 });
      items.push({ holderName, documentNumber, documentType, printType, copies, file, bytes });
    }
    if (totalSize > 4 * 1024 * 1024) return NextResponse.json({ error: "All files together must be 4 MB or less." }, { status: 400 });

    orderId = `SDP-${randomBytes(4).toString("hex").toUpperCase()}`;
    const rows = [];
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      const extension = item.file.type === "application/pdf" ? "pdf" : item.file.type === "image/png" ? "png" : "jpg";
      const storagePath = `${new Date().getUTCFullYear()}/${orderId}/${randomBytes(12).toString("hex")}.${extension}`;
      const upload = await supabase.storage.from("document-orders").upload(storagePath, item.bytes, { contentType: item.file.type });
      if (upload.error) throw upload.error;
      uploaded.push(storagePath);
      rows.push({ order_id: orderId, item_number: index + 1, holder_name: item.holderName, document_number: item.documentNumber, document_type: item.documentType, print_type: item.printType, copies: item.copies, storage_path: storagePath, original_file_name: item.file.name.slice(0, 150), file_mime_type: item.file.type });
    }

    const first = rows[0];
    const orderInsert = await supabase.from("document_print_orders").insert({ order_id: orderId, document_type: first.document_type, print_type: first.print_type, copies: first.copies, customer_name: customerName, phone, delivery_method: deliveryMethod, delivery_address: deliveryMethod === "home_delivery" ? address : null, pincode: deliveryMethod === "home_delivery" ? pincode : null, storage_path: first.storage_path, original_file_name: first.original_file_name, file_mime_type: first.file_mime_type, status: "Order Received", consented_at: new Date().toISOString() });
    if (orderInsert.error) throw orderInsert.error;
    const itemInsert = await supabase.from("document_print_order_items").insert(rows);
    if (itemInsert.error) throw itemInsert.error;
    return NextResponse.json({ orderId, documentCount: rows.length }, { status: 201 });
  } catch (error) {
    console.error("Document order error", error);
    if (orderId) await supabase.from("document_print_orders").delete().eq("order_id", orderId);
    if (uploaded.length) await supabase.storage.from("document-orders").remove(uploaded);
    return NextResponse.json({ error: "The order could not be submitted. Please try again." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const supabase = serverClient();
  if (!supabase) return NextResponse.json({ error: "Tracking is being configured." }, { status: 503 });
  const orderId = (request.nextUrl.searchParams.get("orderId") || "").trim().toUpperCase();
  const phone = (request.nextUrl.searchParams.get("phone") || "").trim();
  if (!/^SDP-[A-F0-9]{8}$/.test(orderId) || !/^[6-9]\d{9}$/.test(phone)) return NextResponse.json({ error: "Enter a valid Order ID and mobile number." }, { status: 400 });
  const order = await supabase.from("document_print_orders").select("order_id,status").eq("order_id", orderId).eq("phone", phone).maybeSingle();
  if (!order.data) return NextResponse.json({ error: "No matching order was found." }, { status: 404 });
  const items = await supabase.from("document_print_order_items").select("id", { count: "exact", head: true }).eq("order_id", orderId);
  return NextResponse.json({ orderId: order.data.order_id, status: order.data.status, documentCount: items.count || 1 });
}
