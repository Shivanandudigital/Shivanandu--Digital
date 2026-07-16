"use client";

import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md shadow-md z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-bold text-blue-700">
          Shivanandu Digital
        </h1>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-8 font-medium">
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#portfolio">Portfolio</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>

        <a
          href="#contact"
          className="hidden md:block bg-blue-700 text-white px-5 py-2 rounded-lg hover:bg-blue-800"
        >
          Get Quote
        </a>

        {/* Mobile Button */}
        <button
          className="md:hidden text-3xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <ul className="flex flex-col items-center py-4 gap-4">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#portfolio">Portfolio</a></li>
            <li><a href="#contact">Contact</a></li>

            <li>
              <a
                href="#contact"
                className="bg-blue-700 text-white px-5 py-2 rounded-lg"
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