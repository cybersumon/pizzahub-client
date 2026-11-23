"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  CreditCard,
  House,
  LayoutDashboard,
  Menu,
  Pizza,
  ShieldCheck,
  ShoppingBag,
  Store,
  UserRound,
  X,
} from "lucide-react";

const links = [
  { label: "Overview", href: "/dashboard/vendor", icon: LayoutDashboard, exact: true },
  { label: "Restaurant Profile", href: "/dashboard/vendor/restaurant", icon: Store },
  { label: "Manage Menu", href: "/dashboard/vendor/menu", icon: Pizza },
  { label: "Manage Orders", href: "/dashboard/vendor/orders", icon: ShoppingBag },
  { label: "Subscriptions", href: "/dashboard/vendor/subscription", icon: CreditCard },
  { label: "My Profile", href: "/dashboard/vendor/profile", icon: UserRound },
];

interface VendorSidebarProps {
  children: ReactNode;
}

export default function VendorSidebar({ children }: VendorSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function renderNavigation() {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-white/10 px-5 py-5">
          <Link href="/dashboard/vendor" onClick={() => setMobileOpen(false)} className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-[#F04438] to-[#C91D27] text-white shadow-lg shadow-red-950/20">
              <Pizza size={23} />
            </span>
            <span>
              <span className="block text-xl font-black tracking-tight text-white">Pizza<span className="text-[#FF6B5E]">Hub</span></span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.17em] text-stone-400">Vendor Workspace</span>
            </span>
          </Link>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-6">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">Restaurant Management</p>
          <nav aria-label="Vendor navigation" className="mt-4 space-y-1.5">
            {links.map(({ label, href, icon: Icon, exact }) => {
              const selected = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={selected ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-xl px-3.5 py-3.5 text-sm font-semibold transition-all ${selected ? "bg-linear-to-r from-[#D62828] to-[#E64536] text-white shadow-lg shadow-red-950/20" : "text-stone-300 hover:bg-white/10 hover:text-white"}`}
                >
                  <Icon size={19} className="shrink-0" />
                  <span className="min-w-0 flex-1">{label}</span>
                  <ChevronRight size={15} className={selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"} />
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-2xl border border-white/10 bg-linear-to-br from-white/10 to-white/3 p-4">
            <div className="flex items-center gap-2 text-[#FFB36D]">
              <ShieldCheck size={18} />
              <span className="text-xs font-bold text-white">Your Restaurant Hub</span>
            </div>
            <p className="mt-2 text-xs leading-6 text-stone-400">Manage menus, customers and billing from one workspace.</p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-stone-300">
              <CalendarDays size={12} /> Reservations: Coming Soon
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 p-4">
          <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-stone-300 hover:bg-white/10 hover:text-white">
            <House size={18} /> <span className="flex-1">Back to Website</span> <ArrowUpRight size={16} />
          </Link>
          <p className="mt-3 px-3 text-[11px] text-stone-500">PizzaHub Vendor Portal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full bg-[#FFF9F2] lg:min-h-[calc(100vh-68px)]">
      <aside className="fixed inset-y-0 left-0 z-60 hidden w-66.25 border-r border-white/10 bg-[#191716] lg:block">
        {renderNavigation()}
      </aside>
      <div aria-hidden="true" className="hidden w-66.25 shrink-0 lg:block" />

      {mobileOpen && (
        <button type="button" aria-label="Close vendor navigation overlay" className="fixed inset-0 z-70 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <aside
        id="vendor-mobile-sidebar"
        aria-label="Mobile vendor navigation"
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
        className={`fixed inset-y-0 left-0 z-80 w-71.25 max-w-[85vw] bg-[#191716] shadow-2xl transition-transform duration-300 lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="relative h-full">
          <button type="button" aria-label="Close vendor menu" onClick={() => setMobileOpen(false)} className="absolute right-3 top-4 z-10 rounded-lg bg-white/10 p-2 text-white hover:bg-white/20"><X size={19} /></button>
          {renderNavigation()}
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-orange-100 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <button type="button" onClick={() => setMobileOpen(true)} aria-expanded={mobileOpen} aria-controls="vendor-mobile-sidebar" className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-sm font-bold text-stone-800"><Menu size={19} /> Workspace Menu</button>
          <span className="text-xs font-bold uppercase tracking-wider text-[#D62828]">Vendor</span>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
