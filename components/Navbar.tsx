"use client";

import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed left-0 top-0 z-50 w-full bg-white/95 shadow-md backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <a
          href="#home"
          className="flex shrink-0 items-center gap-2.5"
          aria-label="Shivanandu Digital home"
        >
          <Image
            src="/icon.png"
            alt="SND Logo"
            width={48}
            height={48}
            priority
            className="h-10 w-10 object-contain sm:h-12 sm:w-12"
          />

          <div className="leading-tight">
            <span className="block text-base font-extrabold text-[#29205F] sm:text-xl">
              Shivanandu
            </span>

            <span className="block text-xs font-bold uppercase tracking-[0.18em] text-[#009B83] sm:text-sm">
              Digital
            </span>
          </div>
        </a>

        {/* Desktop Menu */}
        <ul className="hidden items-center gap-5 font-medium lg:flex xl:gap-8">
          <li>
            <a className="transition hover:text-[#009B83]" href="#home">
              Home
            </a>
          </li>

          <li>
            <a className="transition hover:text-[#009B83]" href="#about">
              About
            </a>
          </li>

          <li>
            <a className="transition hover:text-[#009B83]" href="#tools">
              Tools
            </a>
          </li>

          <li>
            <a className="transition hover:text-[#009B83]" href="#portfolio">
              Portfolio
            </a>
          </li>

          <li>
            <a className="transition hover:text-[#009B83]" href="#contact">
              Contact
            </a>
          </li>
        </ul>

        <a
          href="#contact"
          className="hidden rounded-lg bg-[#29205F] px-5 py-2 text-white transition hover:bg-[#009B83] lg:block"
        >
          Get Quote
        </a>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-3xl text-[#29205F] transition hover:bg-slate-100 lg:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {isOpen ? "×" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t border-slate-100 bg-white shadow-lg lg:hidden">
          <ul className="flex flex-col px-4 py-4 font-medium">
            <li>
              <a
                className="block rounded-lg px-4 py-3 hover:bg-slate-50"
                href="#home"
                onClick={() => setIsOpen(false)}
              >
                Home
              </a>
            </li>

            <li>
              <a
                className="block rounded-lg px-4 py-3 hover:bg-slate-50"
                href="#about"
                onClick={() => setIsOpen(false)}
              >
                About
              </a>
            </li>

            <li>
              <a
                className="block rounded-lg px-4 py-3 hover:bg-slate-50"
                href="#tools"
                onClick={() => setIsOpen(false)}
              >
                Tools
              </a>
            </li>

            <li>
              <a
                className="block rounded-lg px-4 py-3 hover:bg-slate-50"
                href="#portfolio"
                onClick={() => setIsOpen(false)}
              >
                Portfolio
              </a>
            </li>

            <li>
              <a
                className="block rounded-lg px-4 py-3 hover:bg-slate-50"
                href="#contact"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </a>
            </li>

            <li>
              <a
                href="#contact"
                className="mt-2 block rounded-lg bg-[#29205F] px-5 py-3 text-center text-white"
                onClick={() => setIsOpen(false)}
              >
                Get Quote
              </a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}