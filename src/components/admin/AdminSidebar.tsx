
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ArrowUpRight,
  ChevronRight,
  CreditCard,
  House,
  LayoutDashboard,
  Menu,
  Pizza,
  ShieldCheck,
  Store,
  Users,
  X,
} from "lucide-react";

// ============================================
// PIZZAHUB ADMIN SIDEBAR
// ============================================

const navigation = [
  {
    label: "Restaurant Approvals",
    href: "/admin/restaurants",
    icon: Store,
  },
  {
    label: "Menu Approval",
    href: "/admin/menu",
    icon: Pizza,
  },
  {
    label: "Manage Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Subscriptions",
    href: "/admin/subscriptions",
    icon: CreditCard,
  },
];

interface AdminSidebarProps {
  children: React.ReactNode;
}

export default function AdminSidebar({
  children,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  function isActive(href: string) {
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  function closeSidebar() {
    setMobileOpen(false);
  }

  // ============================================
  // SHARED SIDEBAR CONTENT
  // ============================================

  function SidebarContent() {
    return (
      <div className="flex h-full flex-col">
        {/* Brand section */}
        <div className="border-b border-white/10 px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-[#F04438] to-[#C91D27] shadow-lg shadow-red-950/20">
              <Pizza
                size={24}
                className="text-white"
              />
            </div>

            <div>
              <p className="text-xl font-black tracking-tight text-white">
                Pizza
                <span className="text-[#FF6B5E]">
                  Hub
                </span>
              </p>

              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
                Admin Workspace
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-6">
          <div className="px-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
              Management
            </p>
          </div>

          <nav
            aria-label="Admin navigation"
            className="mt-4 space-y-1.5"
          >
            {navigation.map((item) => {
              const active = isActive(item.href);

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSidebar}
                  aria-current={
                    active ? "page" : undefined
                  }
                  className={[
                    "group relative flex items-center gap-3 rounded-xl px-3.5 py-3.5 text-sm font-semibold transition-all duration-200",
                    active
                      ? "bg-linear-to-r from-[#D62828] to-[#E64536] text-white shadow-lg shadow-red-950/20"
                      : "text-stone-300 hover:bg-white/10 hover:text-white",
                  ].join(" ")}
                >
                  <Icon
                    size={19}
                    className="shrink-0"
                  />

                  <span className="flex-1">
                    {item.label}
                  </span>

                  {active ? (
                    <ChevronRight size={16} />
                  ) : (
                    <ChevronRight
                      size={16}
                      className="opacity-0 transition group-hover:opacity-100"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Admin information */}
          <div className="mt-9 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={18}
                className="text-emerald-400"
              />

              <p className="text-xs font-bold text-white">
                Admin Workspace
              </p>
            </div>

            <p className="mt-2 text-xs leading-6 text-stone-400">
              Manage restaurants, review menus,
              control user access and monitor
              subscriptions.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-4">
          <Link
            href="/"
            onClick={closeSidebar}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-stone-300 transition hover:bg-white/10 hover:text-white"
          >
            <House size={18} />

            <span className="flex-1">
              Back to Website
            </span>

            <ArrowUpRight size={16} />
          </Link>

          <p className="mt-4 px-3 text-[11px] text-stone-500">
            PizzaHub Administration
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full bg-[#FFF9F2] lg:min-h-[calc(100vh-68px)]">
      {/* Desktop sidebar - fixed full screen height */}
<aside className="fixed inset-y-0 left-0 z-60 hidden w-66.25 border-r border-stone-800 bg-[#191716] lg:block">
  <SidebarContent />
</aside>

{/* Reserve space for the fixed sidebar */}
<div
  aria-hidden="true"
  className="hidden w-66.25 shrink-0 lg:block"
/>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={closeSidebar}
          className="fixed inset-0 z-70 bg-black/50 lg:hidden"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        id="mobile-admin-navigation"
        aria-label="Mobile admin navigation"
        aria-hidden={!mobileOpen}
        className={[
          "fixed inset-y-0 left-0 z-80 w-71.25 max-w-[85vw] bg-[#191716] shadow-2xl transition-transform duration-300 lg:hidden",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full",
        ].join(" ")}
        inert={!mobileOpen}
      >
        <div className="relative h-full">
          <button
            type="button"
            aria-label="Close admin menu"
            onClick={closeSidebar}
            className="absolute right-3 top-4 z-10 rounded-lg bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X size={19} />
          </button>

          <SidebarContent />
        </div>
      </aside>

      {/* Main area */}
      <div className="min-w-0 flex-1">
        {/* Mobile navigation bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-orange-100 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open admin menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-admin-navigation"
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-sm font-bold text-stone-800"
          >
            <Menu size={19} />
            Menu
          </button>

          <div className="flex items-center gap-2">
            <LayoutDashboard
              size={17}
              className="text-[#D62828]"
            />

            <span className="text-sm font-bold text-stone-900">
              Admin Panel
            </span>
          </div>
        </div>

        {/* Preserve existing page components */}
        <div className="min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
