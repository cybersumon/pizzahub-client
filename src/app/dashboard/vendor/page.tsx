"use client";

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
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

import {
  getUserProfile,
  type UserProfile,
} from "@/lib/user-profile";

export default function VendorDashboardPage() {
  // Backend থেকে পাওয়া verified profile।
  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Page open হলে user profile load হবে।
  useEffect(() => {
    async function loadProfile() {
      try {
        const user = await getUserProfile();

        // Vendor account ছাড়া dashboard access নয়।
        if (user.role !== "vendor") {
          setError("Vendor access required.");
          return;
        }

        setProfile(user);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  // Logout function।
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

  // Loading state।
  if (loading) {
    return (
      <main className="p-12 text-center">
        Loading Vendor Dashboard...
      </main>
    );
  }

  // Unauthorized অথবা API error।
  if (!profile || !profile.restaurant) {
    return (
      <main className="p-12 text-center">
        <h1 className="text-xl font-bold text-red-600">
          {error || "Restaurant not available."}
        </h1>

        <Link
          href="/sign-in"
          className="mt-4 inline-block text-red-600"
        >
          Sign In
        </Link>
      </main>
    );
  }

  // Verified restaurant information।
  const restaurant = profile.restaurant;

  // Subscription অনুযায়ী menu limit।
  const menuLimit =
    restaurant.plan === "free" ? "3" : "Unlimited";

  // Plan display name।
  const planName =
    restaurant.plan === "premium_plus"
      ? "Premium+"
      : restaurant.plan === "premium"
        ? "Premium"
        : "Free";

  // Dashboard overview cards।
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

  return (
    <main className="min-h-screen bg-[#FFF9F2] px-4 py-8">
      <div className="mx-auto max-w-6xl">

        {/* Dashboard Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="text-xl font-extrabold text-[#D62828]"
            >
              PizzaHub
            </Link>

            <h1 className="mt-3 text-3xl font-extrabold">
              Vendor Dashboard
            </h1>

            <p className="mt-2 text-sm text-stone-500">
              Welcome back, {profile.name}.
            </p>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-600"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>

        {/* API error message */}
        {error && (
          <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </p>
        )}

        {/* Pending restaurant notice */}
        {restaurant.status === "pending" && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
            <Clock3 size={24} />

            <div>
              <h2 className="font-bold">
                Waiting for Admin Approval
              </h2>

              <p className="mt-1 text-sm">
                Your restaurant application is under review.
                Menu management will become available after
                approval.
              </p>
            </div>
          </div>
        )}

        {/* Rejected restaurant notice */}
        {restaurant.status === "rejected" && (
          <div className="mb-6 rounded-2xl bg-red-50 p-5 text-red-700">
            Your restaurant application was rejected.
            Please contact PizzaHub support.
          </div>
        )}

        {/* Dashboard statistics */}
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

              <h2 className="mt-2 text-xl font-extrabold capitalize">
                {stat.value}
              </h2>
            </article>
          ))}
        </div>

        {/* Restaurant management features */}
        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-extrabold">
            Restaurant Management
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">

            {/* Menu Management */}
            <div className="rounded-xl border border-stone-200 p-5">
              <Pizza className="mb-3 text-red-600" />

              <h3 className="font-bold">Manage Menu</h3>

              <p className="mt-2 text-sm text-stone-500">
                {profile.canManageMenu
                  ? "Menu management module coming next."
                  : "Restaurant approval required."}
              </p>
            </div>

            {/* Customer Orders */}
            <div className="rounded-xl border border-stone-200 p-5">
              <ShoppingBag className="mb-3 text-red-600" />

              <h3 className="font-bold">Manage Orders</h3>

              <p className="mt-2 text-sm text-stone-500">
                Order management module coming next.
              </p>
            </div>

            {/* Subscription */}
            <div className="rounded-xl border border-stone-200 p-5">
              <Crown className="mb-3 text-orange-600" />

              <h3 className="font-bold">Subscription</h3>

              <p className="mt-2 text-sm text-stone-500">
                Current plan: {planName}
              </p>
            </div>

            {/* Premium+ exclusive feature */}
            <div className="rounded-xl border border-stone-200 p-5">
              <CalendarDays className="mb-3 text-red-600" />

              <h3 className="font-bold">
                Event &amp; Table Booking
              </h3>

              <p className="mt-2 text-sm text-stone-500">
                {profile.canManageMenu &&
                restaurant.plan === "premium_plus"
                  ? "Reservation module coming soon."
                  : "Available for approved Premium+ vendors."}
              </p>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}