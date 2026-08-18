"use client";

import { FormEvent, useState } from "react";

const documentTypes = [
  ["ration_card", "Ration Card"],
  ["voter_epic", "Voter e-EPIC"],
  ["ayushman_card", "Ayushman Bharat Card"],
  ["driving_licence", "Driving Licence"],
] as const;

const printTypes = [
  ["colour_print", "Colour Print"],
  ["print_lamination", "Print + Lamination"],
  ["pvc_size_print", "PVC-size Print"],
] as const;

type Item = { id: number; documentType: string; printType: string; copies: number };
type TrackResult = { orderId: string; status: string; documentCount: number };
const steps = ["Order Received", "Verified", "Printing", "Ready / Shipped", "Delivered"];

const inputClass = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-[#009B83]";

export default function DocumentPrintingOrder() {
  const [tab, setTab] = useState<"order" | "track">("order");
  const [items, setItems] = useState<Item[]>([{ id: 1, documentType: "ration_card", printType: "pvc_size_print", copies: 1 }]);
  const [nextId, setNextId] = useState(2);
  const [delivery, setDelivery] = useState("shop_pickup");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState("");
  const [trackId, setTrackId] = useState("");
  const [trackPhone, setTrackPhone] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);

  function update(id: number, changes: Partial<Item>) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item));
  }

  function addAnother() {
    if (items.length === 10) return;
    setItems((current) => [...current, { id: nextId, documentType: "ration_card", printType: "pvc_size_print", copies: 1 }]);
    setNextId((id) => id + 1);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage(""); setOrderId("");
    try {
      const data = new FormData(event.currentTarget);
      data.set("itemsCount", String(items.length));
      data.set("deliveryMethod", delivery);
      items.forEach((item, index) => {
        data.set(`documentType_${index}`, item.documentType);
        data.set(`printType_${index}`, item.printType);
        data.set(`copies_${index}`, String(item.copies));
      });
      const response = await fetch("/api/document-orders", { method: "POST", body: data });
      const json = await response.json() as { orderId?: string; error?: string };
      if (!response.ok || !json.orderId) throw new Error(json.error || "Order submission failed.");
      setOrderId(json.orderId); setTrackId(json.orderId);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Something went wrong."); }
    finally { setBusy(false); }
  }

  async function track(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(""); setResult(null);
    try {
      const query = new URLSearchParams({ orderId: trackId, phone: trackPhone });
      const response = await fetch(`/api/document-orders?${query}`);
      const json = await response.json() as TrackResult & { error?: string };
      if (!response.ok) throw new Error(json.error || "Order not found.");
      setResult(json);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Something went wrong."); }
    finally { setBusy(false); }
  }

  return <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
    <header className="bg-gradient-to-r from-[#29205F] to-[#009B83] px-5 py-7 text-white sm:px-8">
      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase">Secure order service</span>
      <h2 className="mt-4 text-2xl font-extrabold sm:text-3xl">Multiple Document Print Order</h2>
      <p className="mt-2 text-sm text-white/85 sm:text-base">Enter each person separately, then use Add Another for the next document.</p>
    </header>
    <div className="border-b bg-slate-50 p-3 sm:px-8"><div className="grid grid-cols-2 rounded-xl bg-slate-200 p-1 sm:max-w-md">
      <button type="button" onClick={() => { setTab("order"); setMessage(""); }} className={`rounded-lg py-2.5 text-sm font-bold ${tab === "order" ? "bg-white text-[#29205F] shadow" : "text-slate-600"}`}>Place an Order</button>
      <button type="button" onClick={() => { setTab("track"); setMessage(""); }} className={`rounded-lg py-2.5 text-sm font-bold ${tab === "track" ? "bg-white text-[#29205F] shadow" : "text-slate-600"}`}>Track Order</button>
    </div></div>
    <div className="p-5 sm:p-8">
      {tab === "order" ? <form onSubmit={submit} className="space-y-7">
        <div className="flex items-center justify-between gap-3"><h3 className="text-lg font-extrabold">Documents</h3><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-[#29205F]">{items.length} / 10</span></div>
        <div className="space-y-4">{items.map((item, index) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <div className="flex justify-between"><h4 className="font-extrabold text-[#29205F]">Document {index + 1}</h4>{items.length > 1 && <button type="button" onClick={() => setItems((all) => all.filter((entry) => entry.id !== item.id))} className="text-xs font-bold text-red-600">Remove</button>}</div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold text-slate-700">Document Type<select value={item.documentType} onChange={(e) => update(item.id, { documentType: e.target.value })} className={inputClass}>{documentTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="text-sm font-bold text-slate-700">Document Number<input name={`documentNumber_${index}`} required minLength={4} maxLength={40} autoComplete="off" className={inputClass} /></label>
            <label className="text-sm font-bold text-slate-700">Person Name<input name={`holderName_${index}`} required maxLength={80} className={inputClass} /></label>
            <label className="text-sm font-bold text-slate-700">Print Option<select value={item.printType} onChange={(e) => update(item.id, { printType: e.target.value })} className={inputClass}>{printTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="text-sm font-bold text-slate-700">Copies<input type="number" min="1" max="20" value={item.copies} onChange={(e) => update(item.id, { copies: Number(e.target.value) })} className={inputClass} /></label>
            <label className="text-sm font-bold text-slate-700">PDF / Image<input type="file" name={`document_${index}`} accept="application/pdf,image/jpeg,image/png" required className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal file:mr-2 file:rounded-lg file:border-0 file:bg-[#29205F] file:px-3 file:py-2 file:font-bold file:text-white" /></label>
          </div>
        </article>)}</div>
        <button type="button" onClick={addAnother} disabled={items.length >= 10} className="w-full rounded-xl border-2 border-dashed border-[#009B83] py-3 font-extrabold text-[#007c6a] hover:bg-emerald-50 disabled:opacity-40">＋ Add Another Document</button>
        <p className="text-xs text-slate-500">All PDF/JPG/PNG files together must be 4 MB or less.</p>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><b>Aadhaar and PAN are not accepted.</b></div>
        <fieldset><legend className="text-lg font-extrabold">Customer Details</legend><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold text-slate-700">Order Placed By<input name="customerName" required maxLength={80} className={inputClass} /></label><label className="text-sm font-bold text-slate-700">Mobile Number<input name="phone" required pattern="[6-9][0-9]{9}" inputMode="numeric" className={inputClass} /></label></div></fieldset>
        <fieldset><legend className="text-lg font-extrabold">Delivery</legend><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className={`rounded-xl border p-4 ${delivery === "shop_pickup" ? "border-[#009B83] bg-emerald-50" : "border-slate-200"}`}><input type="radio" checked={delivery === "shop_pickup"} onChange={() => setDelivery("shop_pickup")} /> <b className="ml-2">Collect from Shop</b></label><label className={`rounded-xl border p-4 ${delivery === "home_delivery" ? "border-[#009B83] bg-emerald-50" : "border-slate-200"}`}><input type="radio" checked={delivery === "home_delivery"} onChange={() => setDelivery("home_delivery")} /> <b className="ml-2">Home Delivery</b></label></div>{delivery === "home_delivery" && <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold text-slate-700 sm:col-span-2">Full Address<textarea name="address" required className={inputClass} /></label><label className="text-sm font-bold text-slate-700">PIN Code<input name="pincode" required pattern="[1-9][0-9]{5}" className={inputClass} /></label></div>}</fieldset>
        <label className="flex gap-3 rounded-xl bg-slate-50 p-4 text-sm leading-6"><input type="checkbox" name="consent" value="yes" required className="mt-1" /><span>I have permission from every person and none of these documents is Aadhaar or PAN.</span></label>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">Final price will be confirmed before printing.</div>
        {message && <p className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">{message}</p>}{orderId && <div className="rounded-xl bg-emerald-50 p-5 text-emerald-900"><b>Order submitted successfully</b><p className="mt-2">Order ID: <strong>{orderId}</strong></p></div>}
        <button disabled={busy} className="w-full rounded-xl bg-[#29205F] py-3.5 font-extrabold text-white hover:bg-[#009B83] disabled:opacity-60">{busy ? "Uploading Securely…" : `Submit ${items.length} Document${items.length > 1 ? "s" : ""}`}</button>
      </form> : <form onSubmit={track} className="mx-auto max-w-xl space-y-5"><h2 className="text-center text-2xl font-extrabold">Track Your Order</h2><label className="block text-sm font-bold">Order ID<input value={trackId} onChange={(e) => setTrackId(e.target.value.toUpperCase())} required className={inputClass} /></label><label className="block text-sm font-bold">Mobile Number<input value={trackPhone} onChange={(e) => setTrackPhone(e.target.value)} pattern="[6-9][0-9]{9}" required className={inputClass} /></label>{message && <p className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">{message}</p>}<button disabled={busy} className="w-full rounded-xl bg-[#29205F] py-3.5 font-extrabold text-white">Track Order</button>{result && <div className="rounded-2xl border p-5"><div className="flex justify-between"><b>{result.orderId}</b><span>{result.status}</span></div><p className="mt-2 text-sm">Documents: {result.documentCount}</p><ol className="mt-4 space-y-2">{steps.map((step) => <li key={step} className={steps.indexOf(step) <= Math.max(0, steps.indexOf(result.status)) ? "text-emerald-700" : "text-slate-400"}>✓ {step}</li>)}</ol></div>}</form>}
    </div>
  </section>;
}
