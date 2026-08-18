"use client";

import { FormEvent, useMemo, useState } from "react";

const documentTypes = [
  { value: "ration_card", label: "Ration Card" },
  { value: "voter_epic", label: "Voter e-EPIC" },
  { value: "ayushman_card", label: "Ayushman Bharat Card" },
  { value: "driving_licence", label: "Driving Licence" },
] as const;

const printTypes = [
  { value: "colour_print", label: "Colour Print", help: "High-quality colour document print" },
  { value: "print_lamination", label: "Print + Lamination", help: "Colour print with protective lamination" },
  { value: "pvc_size_print", label: "PVC-size Print", help: "Wallet-size print from your supplied document" },
] as const;

type TrackResult = {
  orderId: string;
  documentType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const statusSteps = ["Order Received", "Verified", "Printing", "Ready / Shipped", "Delivered"];

function friendlyError(value: unknown) {
  return value instanceof Error ? value.message : "Something went wrong. Please try again.";
}

export default function DocumentPrintingOrder() {
  const [mode, setMode] = useState<"order" | "track">("order");
  const [documentType, setDocumentType] = useState("");
  const [printType, setPrintType] = useState("colour_print");
  const [deliveryMethod, setDeliveryMethod] = useState("shop_pickup");
  const [copies, setCopies] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [newOrderId, setNewOrderId] = useState("");
  const [trackOrderId, setTrackOrderId] = useState("");
  const [trackPhone, setTrackPhone] = useState("");
  const [tracking, setTracking] = useState(false);
  const [trackResult, setTrackResult] = useState<TrackResult | null>(null);

  const selectedDocument = useMemo(
    () => documentTypes.find((item) => item.value === documentType),
    [documentType],
  );

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setNewOrderId("");

    try {
      const form = event.currentTarget;
      const data = new FormData(form);
      data.set("documentType", documentType);
      data.set("printType", printType);
      data.set("deliveryMethod", deliveryMethod);
      data.set("copies", String(copies));

      const response = await fetch("/api/document-orders", { method: "POST", body: data });
      const result = (await response.json()) as { orderId?: string; error?: string };

      if (!response.ok || !result.orderId) {
        throw new Error(result.error || "The order could not be submitted.");
      }

      setNewOrderId(result.orderId);
      setTrackOrderId(result.orderId);
      form.reset();
      setDocumentType("");
      setPrintType("colour_print");
      setDeliveryMethod("shop_pickup");
      setCopies(1);
    } catch (error) {
      setMessage(friendlyError(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function trackOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTracking(true);
    setMessage("");
    setTrackResult(null);

    try {
      const params = new URLSearchParams({ orderId: trackOrderId, phone: trackPhone });
      const response = await fetch(`/api/document-orders?${params.toString()}`);
      const result = (await response.json()) as TrackResult & { error?: string };

      if (!response.ok) throw new Error(result.error || "Order not found.");
      setTrackResult(result);
    } catch (error) {
      setMessage(friendlyError(error));
    } finally {
      setTracking(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      <div className="bg-gradient-to-r from-[#29205F] to-[#009B83] px-5 py-7 text-white sm:px-8">
        <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">
          Secure order service
        </span>
        <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">Print Your Document Safely</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/85 sm:text-base">
          Upload only your own valid document. We print the supplied file exactly as received and never edit identity details.
        </p>
      </div>

      <div className="border-b border-slate-200 bg-slate-50 p-3 sm:px-8">
        <div className="grid grid-cols-2 rounded-xl bg-slate-200 p-1 sm:max-w-md">
          {(["order", "track"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => { setMode(item); setMessage(""); }}
              className={`rounded-lg px-4 py-2.5 text-sm font-bold transition ${mode === item ? "bg-white text-[#29205F] shadow" : "text-slate-600"}`}
            >
              {item === "order" ? "Place an Order" : "Track Order"}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 sm:p-8">
        {mode === "order" ? (
          <form onSubmit={submitOrder} className="space-y-7">
            <fieldset>
              <legend className="text-lg font-extrabold text-slate-900">1. Select document</legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {documentTypes.map((item) => (
                  <label key={item.value} className={`cursor-pointer rounded-2xl border p-4 text-center transition ${documentType === item.value ? "border-[#009B83] bg-emerald-50 ring-2 ring-[#009B83]/20" : "border-slate-200 hover:border-slate-300"}`}>
                    <input className="sr-only" type="radio" name="documentChoice" value={item.value} required checked={documentType === item.value} onChange={() => setDocumentType(item.value)} />
                    <span className="block text-2xl" aria-hidden="true">🪪</span>
                    <span className="mt-2 block text-sm font-bold text-slate-800">{item.label}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                <strong>Aadhaar and PAN are not accepted.</strong> Please do not upload either document.
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-lg font-extrabold text-slate-900">2. Print requirements</legend>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {printTypes.map((item) => (
                  <label key={item.value} className={`cursor-pointer rounded-2xl border p-4 transition ${printType === item.value ? "border-[#29205F] bg-violet-50" : "border-slate-200"}`}>
                    <input className="sr-only" type="radio" name="printChoice" value={item.value} checked={printType === item.value} onChange={() => setPrintType(item.value)} />
                    <span className="block font-bold text-slate-900">{item.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-600">{item.help}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-bold text-slate-700">Number of copies
                  <input className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#009B83]" type="number" min="1" max="20" value={copies} onChange={(e) => setCopies(Number(e.target.value))} />
                </label>
                <label className="text-sm font-bold text-slate-700">Document file
                  <input className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal file:mr-3 file:rounded-lg file:border-0 file:bg-[#29205F] file:px-3 file:py-2 file:font-bold file:text-white" type="file" name="document" accept="application/pdf,image/jpeg,image/png" required />
                  <span className="mt-1 block text-xs font-normal text-slate-500">PDF, JPG or PNG · Maximum 10 MB</span>
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-lg font-extrabold text-slate-900">3. Customer details</legend>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-bold text-slate-700">Full name<input className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#009B83]" name="customerName" required maxLength={80} /></label>
                <label className="text-sm font-bold text-slate-700">Mobile number<input className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#009B83]" name="phone" inputMode="numeric" pattern="[6-9][0-9]{9}" placeholder="10-digit mobile number" required /></label>
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-lg font-extrabold text-slate-900">4. Delivery</legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className={`cursor-pointer rounded-2xl border p-4 ${deliveryMethod === "shop_pickup" ? "border-[#009B83] bg-emerald-50" : "border-slate-200"}`}><input type="radio" name="deliveryChoice" value="shop_pickup" checked={deliveryMethod === "shop_pickup"} onChange={() => setDeliveryMethod("shop_pickup")} /> <span className="ml-2 font-bold">Collect from shop</span></label>
                <label className={`cursor-pointer rounded-2xl border p-4 ${deliveryMethod === "home_delivery" ? "border-[#009B83] bg-emerald-50" : "border-slate-200"}`}><input type="radio" name="deliveryChoice" value="home_delivery" checked={deliveryMethod === "home_delivery"} onChange={() => setDeliveryMethod("home_delivery")} /> <span className="ml-2 font-bold">Home delivery</span></label>
              </div>
              {deliveryMethod === "home_delivery" && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-bold text-slate-700 sm:col-span-2">Full delivery address<textarea className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#009B83]" name="address" required maxLength={300} /></label>
                  <label className="text-sm font-bold text-slate-700">PIN code<input className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#009B83]" name="pincode" inputMode="numeric" pattern="[1-9][0-9]{5}" required /></label>
                </div>
              )}
            </fieldset>

            <label className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              <input className="mt-1 h-4 w-4 accent-[#009B83]" type="checkbox" name="consent" value="yes" required />
              <span>I confirm that this is my document or I have the holder’s permission. It is not Aadhaar or PAN, and I consent to secure processing solely for this print order.</span>
            </label>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              Final price and delivery charge will be confirmed before printing. No payment is collected on this page yet.
            </div>

            {selectedDocument && <p className="text-sm font-semibold text-slate-600">Selected: {selectedDocument.label}</p>}
            {message && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{message}</p>}
            {newOrderId && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
                <h3 className="font-extrabold">Order submitted successfully</h3>
                <p className="mt-2 text-sm">Save your Order ID: <strong className="text-base">{newOrderId}</strong></p>
              </div>
            )}
            <button disabled={submitting} className="w-full rounded-xl bg-[#29205F] px-5 py-3.5 font-extrabold text-white transition hover:bg-[#009B83] disabled:cursor-wait disabled:opacity-60" type="submit">
              {submitting ? "Submitting securely…" : "Submit Print Order"}
            </button>
          </form>
        ) : (
          <form onSubmit={trackOrder} className="mx-auto max-w-xl space-y-5">
            <div className="text-center"><h2 className="text-2xl font-extrabold text-slate-900">Track Your Order</h2><p className="mt-2 text-sm text-slate-600">Enter the Order ID and the mobile number used for the order.</p></div>
            <label className="block text-sm font-bold text-slate-700">Order ID<input className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 uppercase outline-none focus:border-[#009B83]" value={trackOrderId} onChange={(e) => setTrackOrderId(e.target.value.toUpperCase())} placeholder="SDP-XXXXXXXX" required /></label>
            <label className="block text-sm font-bold text-slate-700">Mobile number<input className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#009B83]" value={trackPhone} onChange={(e) => setTrackPhone(e.target.value)} inputMode="numeric" pattern="[6-9][0-9]{9}" required /></label>
            {message && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{message}</p>}
            <button disabled={tracking} className="w-full rounded-xl bg-[#29205F] px-5 py-3.5 font-extrabold text-white hover:bg-[#009B83] disabled:opacity-60" type="submit">{tracking ? "Checking…" : "Track Order"}</button>
            {trackResult && (
              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-[#29205F]">{trackResult.orderId}</strong><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">{trackResult.status}</span></div>
                <ol className="mt-5 space-y-3">
                  {statusSteps.map((step) => {
                    const current = Math.max(0, statusSteps.indexOf(trackResult.status));
                    const done = statusSteps.indexOf(step) <= current;
                    return <li key={step} className={`flex items-center gap-3 text-sm font-semibold ${done ? "text-emerald-700" : "text-slate-400"}`}><span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${done ? "bg-emerald-600 text-white" : "bg-slate-200"}`}>{done ? "✓" : "•"}</span>{step}</li>;
                  })}
                </ol>
              </div>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
