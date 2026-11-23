"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Menu, Pizza, X } from "lucide-react";
import NavbarAuth from "@/components/auth/NavbarAuth";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Menu", href: "/menu" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Only administration and vendor workspace routes have the dark theme.
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const isVendor = pathname === "/dashboard/vendor" || pathname.startsWith("/dashboard/vendor/");
  const isWorkspace = isAdmin || isVendor;
  const workspaceTitle = isAdmin ? "Admin Workspace" : "Vendor Workspace";

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b backdrop-blur-md ${isWorkspace ? "border-white/10 bg-[#191716]" : "border-orange-100 bg-[#FFF7ED]/95"}`}
    >
      <nav className={`flex items-center justify-between gap-4 px-5 lg:px-8 ${isWorkspace ? "h-17 w-full lg:pl-72.25" : "mx-auto h-20 max-w-7xl"}`}>
        {isWorkspace ? (
          <Link href={isAdmin ? "/admin/restaurants" : "/dashboard/vendor"} onClick={() => setMenuOpen(false)} className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-[#FF6258]"><LayoutDashboard size={20} /></span>
            <span className="flex flex-col">
              <span className="text-sm font-extrabold text-white sm:text-base">{workspaceTitle}</span>
              <span className="hidden text-[10px] text-stone-400 sm:block">PizzaHub Management</span>
            </span>
          </Link>
        ) : (
          <Link href="/" onClick={() => setMenuOpen(false)} className="flex shrink-0 items-center gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D62828] text-white"><Pizza size={25} /></span>
            <span className="text-2xl font-extrabold tracking-tight text-[#1C1917]">Pizza<span className="text-[#D62828]">Hub</span></span>
          </Link>
        )}

        <div className="hidden items-center gap-7 md:flex lg:gap-9">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={`text-sm font-semibold transition-colors ${isWorkspace ? "text-stone-300 hover:text-[#FF6258]" : "text-stone-700 hover:text-[#D62828]"}`}>{link.label}</Link>
          ))}
        </div>

        <div className={`hidden shrink-0 md:block ${isWorkspace ? "rounded-full bg-white text-stone-900" : ""}`}>
          <NavbarAuth />
        </div>

        <button type="button" className={`rounded-lg p-2 md:hidden ${isWorkspace ? "text-white hover:bg-white/10" : "text-stone-800 hover:bg-orange-100"}`} onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {menuOpen && (
        <div id="mobile-navigation" className={`space-y-2 border-t px-5 py-4 md:hidden ${isWorkspace ? "border-white/10 bg-[#191716]" : "border-orange-100 bg-[#FFF7ED]"}`}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className={`block rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${isWorkspace ? "text-stone-200 hover:bg-white/10" : "text-stone-800 hover:bg-orange-100"}`}>{link.label}</Link>
          ))}
          <div className={`border-t pt-3 ${isWorkspace ? "border-white/10" : "border-orange-100"}`}>
            <div className="inline-block rounded-full bg-white text-stone-900"><NavbarAuth /></div>
          </div>
        </div>
      )}
    </header>
  );
}
