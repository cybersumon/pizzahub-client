
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
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Loader2,
  Sparkles,
  CheckCircle2,
  Wallet,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

import {
  getUserProfile,
  type UserProfile,
} from "@/lib/user-profile";

// ============================================
// SUBSCRIPTION API TYPES
// ============================================

type SubscriptionPlan = "free" | "premium" | "premium_plus";

type SubscriptionInfo = {
  plan: SubscriptionPlan;
  subscriptionStatus: string;
  hasSubscription: boolean;
  features: {
    unlimitedMenu: boolean;
    premiumDetails: boolean;
    premiumPlusDetails: boolean;
    tableReservation: boolean;
  };
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000";

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
  const [subscription, setSubscription] =
    useState<SubscriptionInfo | null>(null);
  const [portalAction, setPortalAction] = useState<"upgrade" | "downgrade" | "billing" | null>(null);
  const portalLoading = portalAction !== null;

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

        if (user.restaurant?.status === "approved") {
          // Load effective, Stripe-verified access from the backend.
          const subscriptionResponse = await fetch(
            `${API_URL}/api/subscriptions/my`,
            { credentials: "include", cache: "no-store" }
          );
          const subscriptionText = await subscriptionResponse.text();
          let subscriptionResult: { success?: boolean; message?: string; data?: unknown };
          try {
            subscriptionResult = JSON.parse(subscriptionText);
          } catch {
            throw new Error(`Subscription API returned HTTP ${subscriptionResponse.status} instead of JSON. Check backend port 7000 and /api/subscriptions/my.`);
          }

          if (!subscriptionResponse.ok || !subscriptionResult.success) {
            throw new Error(
              subscriptionResult.message || "Unable to verify subscription."
            );
          }

          const data = subscriptionResult.data as SubscriptionInfo | undefined;
          if (
            !data ||
            !["free", "premium", "premium_plus"].includes(data.plan)
          ) {
            throw new Error("Invalid subscription response.");
          }
          if (active) {
            setSubscription(data as SubscriptionInfo);
          }
        }
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
  // OPEN STRIPE BILLING PORTAL
  // ==========================================

  async function openBillingPortal(action: "upgrade" | "downgrade" | "billing") {
    if (portalLoading) return;

    setPortalAction(action);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/subscriptions/portal`, {
        method: "POST",
        credentials: "include",
      });
      const responseText = await response.text();
      let result: { success?: boolean; message?: string; data?: { url?: unknown } };
      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Billing portal API returned HTTP ${response.status} instead of JSON. Restart the backend and verify POST /api/subscriptions/portal is registered.`
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to open billing portal.");
      }

      const url: unknown = result.data?.url;
      if (typeof url !== "string") {
        throw new Error("Stripe did not return a billing portal URL.");
      }

      const parsedUrl = new URL(url);
      if (
        parsedUrl.protocol !== "https:" ||
        !(parsedUrl.hostname === "billing.stripe.com" ||
          parsedUrl.hostname.endsWith(".billing.stripe.com"))
      ) {
        throw new Error("Invalid Stripe billing portal URL.");
      }

      window.location.assign(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to open billing portal."
      );
      setPortalAction(null);
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

  // Never grant paid access based only on the profile's plan field.
  const verifiedPlan = subscription?.plan ?? null;
  const isPremiumPlus = verifiedPlan === "premium_plus";

  // ==========================================
  // SUBSCRIPTION DETAILS
  // ==========================================

  const menuLimit = !isApproved || !verifiedPlan
    ? "Unavailable"
    : verifiedPlan === "free"
      ? "3"
      : "Unlimited";

  const planName = !isApproved || !verifiedPlan
    ? "Unavailable"
    : verifiedPlan === "premium_plus"
      ? "Premium+"
      : verifiedPlan === "premium"
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
                SUBSCRIPTION CARD — MODERN UPGRADE CENTER
                ================================= */}

            <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-orange-200/80 bg-gradient-to-br from-white via-[#fffaf5] to-[#fff0e5] p-5 shadow-[0_12px_32px_rgba(163,65,29,0.07)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(163,65,29,0.11)]">
              <div className="pointer-events-none absolute -right-12 -top-14 h-48 w-48 rounded-full bg-orange-200/40 blur-3xl" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ef4535] to-[#c92328] text-white shadow-[0_8px_20px_rgba(214,40,40,0.22)]">
                  <Crown size={23} />
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  <Sparkles size={12} /> Membership
                </span>
              </div>

              <h3 className="relative mt-4 text-lg font-extrabold text-stone-900">
                Subscription
              </h3>
              <div className="relative mt-3 rounded-xl border border-white bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-medium text-stone-500">Your current plan</p>
                    <p className="mt-1 text-2xl font-black tracking-tight text-stone-900">{planName}</p>
                  </div>
                  {subscription?.subscriptionStatus === "active" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 size={13} /> Active
                    </span>
                  ) : subscription && (
                    <span className="rounded-full bg-stone-100 px-2.5 py-1.5 text-[11px] font-semibold capitalize text-stone-600">
                      {subscription.subscriptionStatus.replaceAll("_", " ")}
                    </span>
                  )}
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-orange-100">
                  <div className={`h-full rounded-full bg-gradient-to-r from-[#eb3535] to-[#f4a33e] transition-all ${verifiedPlan === "premium_plus" ? "w-full" : verifiedPlan === "premium" ? "w-2/3" : "w-1/3"}`} />
                </div>
                <p className="mt-2 text-[11px] text-stone-500">
                  {verifiedPlan === "premium_plus"
                    ? "All premium membership benefits unlocked"
                    : verifiedPlan === "premium"
                      ? "Unlimited menus unlocked · Premium+ available"
                      : "Choose a plan to unlock premium benefits"}
                </p>
              </div>

              <div className="relative mt-auto flex flex-col gap-2.5 pt-5">
                {isApproved && verifiedPlan === "free" && !subscription?.hasSubscription && (
                  <>
                    <Link href="/dashboard/vendor/subscription" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#df292d] to-[#f04d32] px-4 py-3 text-sm font-bold text-white shadow-[0_7px_16px_rgba(214,40,40,0.18)] transition hover:-translate-y-0.5 hover:shadow-lg">
                      <ArrowUpRight size={16} /> Upgrade to Premium
                    </Link>
                    <Link href="/dashboard/vendor/subscription" className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm font-bold text-stone-800 transition hover:border-amber-300 hover:bg-amber-50">
                      <Crown size={16} className="text-amber-600" /> Upgrade to Premium+
                    </Link>
                  </>
                )}

                {isApproved && verifiedPlan === "premium" && (
                  <>
                    <button type="button" disabled={portalLoading} onClick={() => void openBillingPortal("upgrade")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#db292c] via-[#e53d32] to-[#f26c35] px-4 py-3 text-sm font-bold text-white shadow-[0_7px_18px_rgba(214,40,40,0.18)] transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60">
                      {portalAction === "upgrade" ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      Upgrade to Premium+ <ArrowUpRight size={16} />
                    </button>
                    <button type="button" disabled={portalLoading} onClick={() => void openBillingPortal("downgrade")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white/90 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-white disabled:opacity-60">
                      {portalAction === "downgrade" ? <Loader2 size={16} className="animate-spin" /> : <ArrowDownRight size={16} />} Downgrade to Free
                    </button>
                    <button type="button" disabled={portalLoading} onClick={() => void openBillingPortal("billing")} className="inline-flex items-center justify-center gap-2 py-2 text-xs font-semibold text-stone-500 transition hover:text-red-600 disabled:opacity-60">
                      <Wallet size={15} /> Manage Billing
                    </button>
                  </>
                )}

                {isApproved && verifiedPlan === "premium_plus" && (
                  <>
                    <button type="button" disabled={portalLoading} onClick={() => void openBillingPortal("downgrade")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm font-bold text-stone-800 transition hover:bg-amber-50 disabled:opacity-60">
                      {portalAction === "downgrade" ? <Loader2 size={16} className="animate-spin" /> : <ArrowDownRight size={16} />} Downgrade to Premium
                    </button>
                    <button type="button" disabled={portalLoading} onClick={() => void openBillingPortal("downgrade")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-60">
                      {portalAction === "downgrade" ? <Loader2 size={16} className="animate-spin" /> : <ArrowDownRight size={16} />} Downgrade to Free
                    </button>
                    <button type="button" disabled={portalLoading} onClick={() => void openBillingPortal("billing")} className="inline-flex items-center justify-center gap-2 py-2 text-xs font-semibold text-stone-500 transition hover:text-red-600 disabled:opacity-60">
                      <CreditCard size={15} /> Manage Billing
                    </button>
                  </>
                )}

                {isApproved && verifiedPlan === "free" && subscription?.hasSubscription && (
                  <button type="button" disabled={portalLoading} onClick={() => void openBillingPortal("billing")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-700 transition hover:bg-stone-50 disabled:opacity-60">
                    <CreditCard size={16} /> Manage Existing Subscription
                  </button>
                )}
                {!subscription && isApproved && (
                  <p className="text-xs text-stone-500">Subscription details unavailable. Verify the API connection before managing billing.</p>
                )}
                <p className="mt-1 text-center text-[10px] leading-5 text-stone-400">Plan changes are confirmed securely in Stripe.</p>
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
