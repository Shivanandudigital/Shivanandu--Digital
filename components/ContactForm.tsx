"use client";

import { FormEvent, useState } from "react";

export default function ContactForm() {
  const [isSending, setIsSending] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);

    const form = new FormData(event.currentTarget);

    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const message = String(form.get("message") || "").trim();

    const whatsappMessage = [
      "Hello Shivanandu Digital,",
      "",
      "I want to enquire about your services.",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      "",
      "Message:",
      message,
    ].join("\n");

    const whatsappUrl = `https://api.whatsapp.com/send?phone=919064637690&text=${encodeURIComponent(
  whatsappMessage
)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    setTimeout(() => {
      setIsSending(false);
    }, 800);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-10 max-w-2xl space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-8"
    >
      <div className="text-left">
        <label
          htmlFor="contact-name"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Your Name
        </label>

        <input
          id="contact-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Enter your name"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#009B83] focus:ring-2 focus:ring-[#009B83]/20"
        />
      </div>

      <div className="text-left">
        <label
          htmlFor="contact-email"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Your Email
        </label>

        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Enter your email address"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#009B83] focus:ring-2 focus:ring-[#009B83]/20"
        />
      </div>

      <div className="text-left">
        <label
          htmlFor="contact-phone"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Your Phone Number
        </label>

        <input
          id="contact-phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          placeholder="Enter your phone number"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#009B83] focus:ring-2 focus:ring-[#009B83]/20"
        />
      </div>

      <div className="text-left">
        <label
          htmlFor="contact-message"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Your Message
        </label>

        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          placeholder="Tell us how we can help you"
          className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#009B83] focus:ring-2 focus:ring-[#009B83]/20"
        />
      </div>

      <button
        type="submit"
        disabled={isSending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#29205F] px-8 py-3 font-semibold text-white transition hover:bg-[#009B83] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        <span aria-hidden="true">💬</span>

        {isSending
          ? "Opening WhatsApp..."
          : "Send via WhatsApp"}
      </button>

      <p className="text-center text-xs leading-5 text-slate-500 sm:text-sm">
        Clicking the button will open WhatsApp with your message ready to send.
      </p>
    </form>
  );
}