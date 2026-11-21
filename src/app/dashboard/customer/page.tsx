"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pizza, ShoppingBag, UserRound, LogOut } from "lucide-react";

import { authClient } from "@/lib/auth-client";

import {
  getUserProfile,
  type UserProfile,
} from "@/lib/user-profile";

export default function CustomerDashboardPage() {
  // Current user profile।
  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const user = await getUserProfile();

        if (user.role !== "customer") {
          setError("Customer access required.");
          return;
        }

        setProfile(user);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load profile."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

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
        Loading Customer Dashboard...
      </main>
    );
  }

  // Unauthorized access।
  if (!profile) {
    return (
      <main className="p-12 text-center">
        <p className="text-red-600">{error}</p>

        <Link
          href="/sign-in"
          className="mt-4 inline-block text-red-600"
        >
          Sign In
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF9F2] px-4 py-8">

      <div className="mx-auto max-w-6xl">

        {/* Dashboard header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">

          <div>
            <Link
              href="/"
              className="text-xl font-extrabold text-[#D62828]"
            >
              PizzaHub
            </Link>

            <h1 className="mt-3 text-3xl font-extrabold">
              Customer Dashboard
            </h1>

            <p className="mt-2 text-stone-500">
              Welcome back, {profile.name}!
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-600"
          >
            <LogOut size={17} />
            Logout
          </button>

        </div>

        {error && (
          <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </p>
        )}

        {/* Customer dashboard cards */}
        <div className="grid gap-5 md:grid-cols-3">

          {/* Account information */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <UserRound className="mb-4 text-red-600" />

            <h2 className="font-extrabold">
              My Account
            </h2>

            <p className="mt-3 font-semibold">
              {profile.name}
            </p>

            <p className="mt-1 break-all text-sm text-stone-500">
              {profile.email}
            </p>
          </div>

          {/* Customer Orders */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <ShoppingBag className="mb-4 text-red-600" />

            <h2 className="font-extrabold">
              My Orders
            </h2>

            <p className="mt-3 text-sm text-stone-500">
              Order tracking will be available after
              order management is implemented.
            </p>
          </div>

          {/* Browse Menu */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <Pizza className="mb-4 text-red-600" />

            <h2 className="font-extrabold">
              Discover Pizzas
            </h2>

            <p className="mt-3 text-sm text-stone-500">
              Explore your favorite pizzas and restaurants.
            </p>

            <Link
              href="/menu"
              className="mt-4 inline-block rounded-xl bg-[#D62828] px-5 py-3 text-sm font-bold text-white"
            >
              Browse Menu
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}