
"use client";

// ============================================
// PIZZAHUB — VENDOR DASHBOARD
// ============================================

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Store,
  ShieldCheck,
  Crown,
  Pizza,
  Clock3,
  LogOut,
  ShoppingBag,
  CalendarDays,
  ArrowRight,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

import {
  getUserProfile,
  type UserProfile,
} from "@/lib/user-profile";

// ============================================
// VENDOR DASHBOARD COMPONENT
// ============================================

export default function VendorDashboardPage() {
  // ==========================================
  // STATES
  // ==========================================

  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD VENDOR PROFILE
  // ==========================================

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const user = await getUserProfile();

        if (!active) return;

        if (user.role !== "vendor") {
          setError("Vendor access required.");
          return;
        }

        setProfile(user);
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  // ==========================================
  // LOGOUT
  // ==========================================

  async function handleLogout() {
    try {
      const result = await authClient.signOut();

      if (result.error) {
        setError("Unable to sign out.");
        return;
      }

      window.location.replace("/");
    } catch {
      setError("Unable to sign out.");
    }
  }

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFF9F2]">
        <p className="text-sm font-medium text-stone-600">
          Loading Vendor Dashboard...
        </p>
      </main>
    );
  }

  // ==========================================
  // PROFILE VALIDATION
  // ==========================================

  if (!profile || !profile.restaurant) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#FFF9F2] px-4 text-center">
        <h1 className="text-xl font-bold text-red-600">
          {error || "Restaurant not available."}
        </h1>

        <Link
          href="/sign-in"
          className="mt-4 inline-block text-sm font-bold text-red-600 hover:underline"
        >
          Sign In
        </Link>
      </main>
    );
  }

  // ==========================================
  // RESTAURANT INFORMATION
  // ==========================================

  const restaurant = profile.restaurant;

  const isApproved =
    restaurant.status === "approved";

  const canManageMenu =
    isApproved && profile.canManageMenu;

  const canManageOrders = isApproved;

  const isPremiumPlus =
    restaurant.plan === "premium_plus";

  // ==========================================
  // SUBSCRIPTION DETAILS
  // ==========================================

  const menuLimit =
    restaurant.plan === "free"
      ? "3"
      : "Unlimited";

  const planName =
    restaurant.plan === "premium_plus"
      ? "Premium+"
      : restaurant.plan === "premium"
        ? "Premium"
        : "Free";

  // ==========================================
  // DASHBOARD STATISTICS
  // ==========================================

  const stats = [
    {
      label: "Restaurant",
      value: restaurant.name,
      icon: Store,
    },
    {
      label: "Account Status",
      value: restaurant.status,
      icon: ShieldCheck,
    },
    {
      label: "Current Plan",
      value: planName,
      icon: Crown,
    },
    {
      label: "Menu Item Limit",
      value: menuLimit,
      icon: Pizza,
    },
  ];

  // ==========================================
  // MAIN DASHBOARD UI
  // ==========================================

  return (
    <main className="min-h-screen bg-[#FFF9F2] px-4 py-8">
      <div className="mx-auto max-w-6xl">

        {/* =====================================
            DASHBOARD HEADER
            ===================================== */}

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="text-xl font-extrabold text-[#D62828]"
            >
              PizzaHub
            </Link>

            <h1 className="mt-3 text-3xl font-extrabold text-stone-900">
              Vendor Dashboard
            </h1>

            <p className="mt-2 text-sm text-stone-500">
              Welcome back, {profile.name}.
            </p>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>

        {/* =====================================
            ERROR MESSAGE
            ===================================== */}

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {/* =====================================
            PENDING RESTAURANT NOTICE
            ===================================== */}

        {restaurant.status === "pending" && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
            <Clock3
              size={24}
              className="shrink-0"
            />

            <div>
              <h2 className="font-bold">
                Waiting for Admin Approval
              </h2>

              <p className="mt-1 text-sm leading-6">
                Your restaurant application is under review.
                Menu and order management will become
                available after approval.
              </p>
            </div>
          </div>
        )}

        {/* =====================================
            REJECTED RESTAURANT NOTICE
            ===================================== */}

        {restaurant.status === "rejected" && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            Your restaurant application was rejected.
            Please contact PizzaHub support.
          </div>
        )}

        {/* =====================================
            DASHBOARD STATISTICS
            ===================================== */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"
            >
              <stat.icon
                size={25}
                className="text-[#D62828]"
              />

              <p className="mt-4 text-sm text-stone-500">
                {stat.label}
              </p>

              <h2 className="mt-2 text-xl font-extrabold capitalize text-stone-900">
                {stat.value}
              </h2>
            </article>
          ))}
        </div>

        {/* =====================================
            RESTAURANT MANAGEMENT
            ===================================== */}

        <section className="mt-8 rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">

          <h2 className="text-xl font-extrabold text-stone-900">
            Restaurant Management
          </h2>

          <p className="mt-2 text-sm text-stone-500">
            Manage your restaurant, incoming orders
            and subscription features.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">

            {/* =================================
                MANAGE MENU CARD
                ================================= */}

            <div className="flex flex-col rounded-xl border border-stone-200 p-5 transition hover:border-orange-200 hover:shadow-sm">

              <Pizza
                size={25}
                className="mb-3 text-red-600"
              />

              <h3 className="font-bold text-stone-900">
                Manage Menu
              </h3>

              <p className="mt-2 text-sm text-stone-500">
                {canManageMenu
                  ? "Add, edit and manage your restaurant menu items."
                  : "Restaurant approval required."}
              </p>

              <div className="mt-auto pt-5">

                {canManageMenu ? (
                  <Link
                    href="/dashboard/vendor/menu"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D62828] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#B91C1C]"
                  >
                    Manage Menu
                    <ArrowRight size={17} />
                  </Link>
                ) : (
                  <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-stone-100 px-5 py-3 text-sm font-bold text-stone-400">
                    <Pizza size={17} />
                    Unavailable
                  </span>
                )}

              </div>
            </div>

            {/* =================================
                MANAGE ORDERS CARD
                ================================= */}

            <div className="flex flex-col rounded-xl border border-stone-200 p-5 transition hover:border-orange-200 hover:shadow-sm">

              <ShoppingBag
                size={25}
                className="mb-3 text-red-600"
              />

              <h3 className="font-bold text-stone-900">
                Manage Orders
              </h3>

              <p className="mt-2 text-sm text-stone-500">
                {canManageOrders
                  ? "View incoming customer orders and accept or reject requests."
                  : "Restaurant approval required."}
              </p>

              <div className="mt-auto pt-5">

                {canManageOrders ? (
                  <Link
                    href="/dashboard/vendor/orders"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D62828] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#B91C1C]"
                  >
                    Manage Orders
                    <ArrowRight size={17} />
                  </Link>
                ) : (
                  <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-stone-100 px-5 py-3 text-sm font-bold text-stone-400">
                    <ShoppingBag size={17} />
                    Unavailable
                  </span>
                )}

              </div>
            </div>

            {/* =================================
                SUBSCRIPTION CARD
                ================================= */}

            <div className="flex flex-col rounded-xl border border-stone-200 p-5 transition hover:border-orange-200 hover:shadow-sm">

              <Crown
                size={25}
                className="mb-3 text-orange-600"
              />

              <h3 className="font-bold text-stone-900">
                Subscription
              </h3>

              <p className="mt-2 text-sm text-stone-500">
                Current plan:{" "}
                <span className="font-bold text-stone-800">
                  {planName}
                </span>
              </p>

              <p className="mt-2 text-xs leading-5 text-stone-400">
                {restaurant.plan === "free"
                  ? "Upgrade to unlock unlimited menu items and premium features."
                  : "Manage your restaurant subscription and premium benefits."}
              </p>

              <div className="mt-auto pt-5">
                <span className="inline-flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2.5 text-xs font-bold text-orange-700">
                  <Crown size={15} />
                  {planName} Plan
                </span>
              </div>
            </div>

            {/* =================================
                PREMIUM+ EVENT & TABLE BOOKING
                ================================= */}

            <div className="flex flex-col rounded-xl border border-stone-200 p-5 transition hover:border-orange-200 hover:shadow-sm">

              <CalendarDays
                size={25}
                className="mb-3 text-red-600"
              />

              <h3 className="font-bold text-stone-900">
                Event &amp; Table Booking
              </h3>

              <p className="mt-2 text-sm text-stone-500">
                {isApproved && isPremiumPlus
                  ? "Premium+ reservation management is coming soon."
                  : "Available for approved Premium+ vendors."}
              </p>

              <div className="mt-auto pt-5">
                <span className="inline-flex items-center gap-2 rounded-xl bg-stone-100 px-4 py-2.5 text-xs font-semibold text-stone-500">
                  <Clock3 size={15} />
                  Coming Soon
                </span>
              </div>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}
