
"use client";

// ============================================
// PIZZAHUB — CUSTOMER DASHBOARD
// ============================================

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Pizza,
  ShoppingBag,
  UserRound,
  LogOut,
  ArrowRight,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

import {
  getUserProfile,
  type UserProfile,
} from "@/lib/user-profile";

// ============================================
// MAIN CUSTOMER DASHBOARD
// ============================================

export default function CustomerDashboardPage() {
  // ==========================================
  // STATES
  // ==========================================

  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD CUSTOMER PROFILE
  // ==========================================

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const user = await getUserProfile();

        if (!active) return;

        if (user.role !== "customer") {
          setError("Customer access required.");
          return;
        }

        setProfile(user);
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load profile."
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
          Loading Customer Dashboard...
        </p>
      </main>
    );
  }

  // ==========================================
  // UNAUTHORIZED ACCESS
  // ==========================================

  if (!profile) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#FFF9F2] px-4 text-center">
        <p className="text-lg font-bold text-red-600">
          {error || "Customer profile unavailable."}
        </p>

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
  // CUSTOMER DASHBOARD UI
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
              Customer Dashboard
            </h1>

            <p className="mt-2 text-stone-500">
              Welcome back, {profile.name}!
            </p>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
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
            className="mb-4 rounded-xl bg-red-50 p-4 text-red-700"
          >
            {error}
          </p>
        )}

        {/* =====================================
            CUSTOMER DASHBOARD CARDS
            ===================================== */}

        <div className="grid gap-5 md:grid-cols-3">

          {/* =================================
              MY ACCOUNT CARD
              ================================= */}

          <div className="flex flex-col rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">

            <UserRound
              size={25}
              className="mb-4 text-red-600"
            />

            <h2 className="font-extrabold text-stone-900">
              My Account
            </h2>

            <p className="mt-3 font-semibold text-stone-800">
              {profile.name}
            </p>

            <p className="mt-1 break-all text-sm text-stone-500">
              {profile.email}
            </p>

            {/* Profile Management Link */}
            <div className="mt-auto pt-5">
              <Link
                href="/profile"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-[#D62828] transition hover:bg-red-50"
              >
                Edit Profile
                <ArrowRight size={17} />
              </Link>
            </div>

          </div>

          {/* =================================
              MY ORDERS CARD
              ================================= */}

          <div className="flex flex-col rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">

            <ShoppingBag
              size={25}
              className="mb-4 text-red-600"
            />

            <h2 className="font-extrabold text-stone-900">
              My Orders
            </h2>

            <p className="mt-3 text-sm leading-6 text-stone-500">
              View your order history, track delivery
              status and cancel pending orders.
            </p>

            {/* Active Customer Orders Dashboard Link */}
            <div className="mt-auto pt-5">
              <Link
                href="/dashboard/customer/orders"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D62828] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#B91C1C]"
              >
                View My Orders
                <ArrowRight size={17} />
              </Link>
            </div>

          </div>

          {/* =================================
              DISCOVER PIZZAS CARD
              ================================= */}

          <div className="flex flex-col rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">

            <Pizza
              size={25}
              className="mb-4 text-red-600"
            />

            <h2 className="font-extrabold text-stone-900">
              Discover Pizzas
            </h2>

            <p className="mt-3 text-sm leading-6 text-stone-500">
              Explore your favorite pizzas and restaurants.
            </p>

            {/* Browse Menu Link */}
            <div className="mt-auto pt-5">
              <Link
                href="/menu"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D62828] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#B91C1C]"
              >
                Browse Menu
                <ArrowRight size={17} />
              </Link>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}
