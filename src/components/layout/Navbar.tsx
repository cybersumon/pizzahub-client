"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Pizza, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Menu", href: "/menu" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-orange-100 bg-[#FFF7ED]/95 backdrop-blur-md">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D62828] text-white">
            <Pizza size={25} />
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-[#1C1917]">
            Pizza<span className="text-[#D62828]">Hub</span>
          </span>
        </Link>

        <div className="hidden items-center gap-9 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-stone-700 transition-colors hover:text-[#D62828]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/sign-in">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="rounded-full bg-[#D62828] px-6 text-white hover:bg-[#B91C1C]">
              Sign Up <ArrowUpRight size={16} />
            </Button>
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-stone-800 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {menuOpen && (
        <div
          id="mobile-navigation"
          className="space-y-3 border-t border-orange-100 bg-[#FFF7ED] px-5 py-5 md:hidden"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-3 py-2 font-semibold text-stone-800 hover:bg-orange-100"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/sign-in" onClick={() => setMenuOpen(false)} className="block px-3 py-2">
            Sign In
          </Link>
          <Link
            href="/sign-up"
            onClick={() => setMenuOpen(false)}
            className="block rounded-xl bg-[#D62828] px-4 py-3 text-center font-semibold text-white"
          >
            Sign Up
          </Link>
        </div>
      )}
    </header>
  );
}