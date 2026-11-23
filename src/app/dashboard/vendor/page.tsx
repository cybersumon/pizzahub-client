
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
  cancelAtPeriodEnd?: boolean;
  accessEndsAt?: string | null;
  currentPeriodEnd?: string | null;
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
  const [portalAction, setPortalAction] = useState<"upgrade" | "downgrade-premium" | "downgrade-free" | "billing" | null>(null);
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

  async function openBillingPortal(action: "upgrade" | "downgrade-premium" | "downgrade-free" | "billing") {
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

  // Display authentication or authorization errors separately.
  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFF9F2] px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <ShieldCheck size={36} className="mx-auto text-red-600" />
          <h1 className="mt-5 text-xl font-extrabold text-stone-900">
            Vendor Dashboard Unavailable
          </h1>
          <p role="alert" className="mt-3 text-sm leading-6 text-red-600">
            {error || "Unable to load vendor profile."}
          </p>
          <Link
            href="/sign-in"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#D62828] px-5 py-3 text-sm font-bold text-white hover:bg-[#B91C1C]"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  // An assigned vendor may not have created a restaurant yet.
  if (!profile.restaurant) {
    return (
      <main className="min-h-screen bg-[#FFF9F2] px-4 py-12 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="text-xl font-extrabold text-[#D62828]">
              PizzaHub
            </Link>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={17} /> Sign Out
            </button>
          </div>

          <section className="relative overflow-hidden rounded-3xl border border-orange-100 bg-white p-7 shadow-[0_18px_60px_rgba(100,54,22,0.07)] sm:p-11">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-orange-100/70 blur-3xl" />
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-br from-red-500 to-[#B91C1C] text-white shadow-[0_12px_24px_rgba(214,40,40,0.20)]">
              <Store size={38} strokeWidth={1.8} />
            </div>
            <div className="relative mt-7 text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#D62828]">
                PizzaHub Vendor Onboarding
              </p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">
                Welcome to PizzaHub!
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-stone-500">
                Your vendor account is ready, {profile.name}. Set up your restaurant
                profile and submit it for admin approval to start managing your menu and orders.
              </p>
            </div>

            <div className="relative mt-8 space-y-3 rounded-2xl border border-orange-100 bg-[#FFF9F2] p-5 sm:p-6">
              <div className="flex items-center gap-3 text-sm font-semibold text-emerald-700">
                <CheckCircle2 size={20} className="shrink-0" />
                Vendor role activated
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-stone-700">
                <Store size={20} className="shrink-0 text-orange-600" />
                Create your restaurant profile
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-stone-700">
                <Clock3 size={20} className="shrink-0 text-orange-600" />
                Wait for admin approval
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-stone-700">
                <Pizza size={20} className="shrink-0 text-orange-600" />
                Start managing your menu and orders
              </div>
            </div>

            {error && (
              <p role="alert" className="mt-5 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <Link
              href="/dashboard/vendor/restaurant"
              className="relative mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#D62828] px-6 py-4 text-sm font-bold text-white shadow-[0_10px_20px_rgba(214,40,40,0.15)] transition hover:bg-[#B91C1C]"
            >
              Set Up My Restaurant <ArrowRight size={18} />
            </Link>
            <p className="mt-4 text-center text-xs leading-5 text-stone-400">
              Your restaurant will remain pending until an admin approves it.
            </p>
          </section>
        </div>
      </main>
    );
  }

  // ==========================================
  // RESTAURANT INFORMATION
  // ==========================================

  const restaurant = profile.restaurant;
  const restaurantLogo: unknown = (restaurant as typeof restaurant & { logo?: unknown }).logo;

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
    <main className="min-h-[calc(100vh-68px)] bg-[#FFF9F2] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <div className="w-full max-w-none">

        {/* =====================================
            DASHBOARD HEADER
            ===================================== */}

        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#D62828]">Restaurant Management / Overview</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">Vendor Dashboard</h1>
            <p className="mt-2 text-sm text-stone-500">Welcome back, {profile.name}. Here is your restaurant workspace.</p>
          </div>
          <button type="button" onClick={() => void handleLogout()} className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50">
            <LogOut size={17} /> Sign Out
          </button>
        </div>

        {/* Verified membership hero */}
        <section className="relative mb-7 overflow-hidden rounded-[28px] bg-[#191716] p-6 text-white shadow-[0_20px_48px_rgba(28,25,23,0.12)] sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#D62828]/25 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-16 h-36 w-36 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white/10">
                {typeof restaurantLogo === "string" && restaurantLogo ? (
                  <img src={restaurantLogo} alt={`${restaurant.name} logo`} className="h-full w-full object-contain p-1" />
                ) : (
                  <Store size={30} className="text-[#FF9A7A]" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.17em] text-stone-400">Your Restaurant</p>
                <h2 className="mt-1 wrap-break-word text-xl font-extrabold sm:text-2xl">{restaurant.name}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className={`rounded-full px-2.5 py-1 font-bold capitalize ${isApproved ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-200"}`}>{restaurant.status}</span>
                  {verifiedPlan && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 font-bold text-amber-200"><Crown size={12} /> {planName} Plan</span>
                  )}
                </div>
              </div>
            </div>
            <Link href="/dashboard/vendor/restaurant" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/20">
              <Store size={16} /> Edit Restaurant <ArrowRight size={16} />
            </Link>
          </div>
          <p className="relative mt-5 text-xs leading-6 text-stone-400">Subscription privileges are verified by the PizzaHub backend and Stripe.</p>
        </section>

        {/* Stripe-confirmed scheduled cancellation notice */}
        {subscription?.cancelAtPeriodEnd && subscription.subscriptionStatus === "active" && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            <div>
              <p className="font-bold">Your subscription is scheduled to end</p>
              <p className="mt-1">Premium features stay active until {subscription.accessEndsAt ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dhaka" }).format(new Date(subscription.accessEndsAt)) : "the end of your billing period"}.</p>
            </div>
            <Link href="/dashboard/vendor/subscription" className="rounded-xl border border-amber-300 bg-white px-4 py-2 font-bold text-amber-900 hover:bg-amber-100">View Subscription</Link>
          </div>
        )}

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
              className="group rounded-2xl border border-orange-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-[#D62828] transition group-hover:bg-[#D62828] group-hover:text-white">
                <stat.icon size={24} />
              </div>

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

        <section className="mt-7 rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7">

          <h2 className="text-xl font-extrabold text-stone-900">
            Restaurant Management
          </h2>

          <p className="mt-2 text-sm text-stone-500">
            Manage your restaurant, incoming orders
            and subscription features.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">


            {/* Restaurant Profile Management */}
            <div className="flex flex-col rounded-xl border border-stone-200 p-5 transition hover:border-orange-200 hover:shadow-sm">
              <Store
                size={25}
                className="mb-3 text-red-600"
              />

              <h3 className="font-bold text-stone-900">
                Restaurant Profile
              </h3>

              <p className="mt-2 text-sm text-stone-500">
                Update your restaurant name, logo,
                address, phone and description.
              </p>

              <div className="mt-auto pt-5">
                <Link
                  href="/dashboard/vendor/restaurant"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D62828] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#B91C1C]"
                >
                  Edit Restaurant
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>

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

            <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-orange-200/80 bg-linear-to-br from-white via-[#fffaf5] to-[#fff0e5] p-5 shadow-[0_12px_32px_rgba(163,65,29,0.07)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(163,65,29,0.11)]">
              <div className="pointer-events-none absolute -right-12 -top-14 h-48 w-48 rounded-full bg-orange-200/40 blur-3xl" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-[#ef4535] to-[#c92328] text-white shadow-[0_8px_20px_rgba(214,40,40,0.22)]">
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
                  {subscription?.cancelAtPeriodEnd && subscription.subscriptionStatus === "active" ? (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1.5 text-[11px] font-bold text-amber-700">Cancellation Scheduled</span>
                  ) : subscription?.subscriptionStatus === "active" ? (
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
                  <div className={`h-full rounded-full bg-linear-to-br from-[#eb3535] to-[#f4a33e] transition-all ${verifiedPlan === "premium_plus" ? "w-full" : verifiedPlan === "premium" ? "w-2/3" : "w-1/3"}`} />
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
                    <Link href="/dashboard/vendor/subscription" className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-br from-[#df292d] to-[#f04d32] px-4 py-3 text-sm font-bold text-white shadow-[0_7px_16px_rgba(214,40,40,0.18)] transition hover:-translate-y-0.5 hover:shadow-lg">
                      <ArrowUpRight size={16} /> Upgrade to Premium
                    </Link>
                    <Link href="/dashboard/vendor/subscription" className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm font-bold text-stone-800 transition hover:border-amber-300 hover:bg-amber-50">
                      <Crown size={16} className="text-amber-600" /> Upgrade to Premium+
                    </Link>
                  </>
                )}

                {isApproved && verifiedPlan === "premium" && (
                  <>
                    <button type="button" disabled={portalLoading} onClick={() => void openBillingPortal("upgrade")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-br
                     from-[#db292c] via-[#e53d32] to-[#f26c35] px-4 py-3 text-sm font-bold text-white shadow-[0_7px_18px_rgba(214,40,40,0.18)] transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60">
                      {portalAction === "upgrade" ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      Upgrade to Premium+ <ArrowUpRight size={16} />
                    </button>
                    <button type="button" disabled={portalLoading} onClick={() => void openBillingPortal("downgrade-free")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white/90 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-white disabled:opacity-60">
                      {portalAction === "downgrade-free" ? <Loader2 size={16} className="animate-spin" /> : <ArrowDownRight size={16} />} Downgrade to Free
                    </button>
                    <button type="button" disabled={portalLoading} onClick={() => void openBillingPortal("billing")} className="inline-flex items-center justify-center gap-2 py-2 text-xs font-semibold text-stone-500 transition hover:text-red-600 disabled:opacity-60">
                      <Wallet size={15} /> Manage Billing
                    </button>
                  </>
                )}

                {isApproved && verifiedPlan === "premium_plus" && (
                  <>
                    <button type="button" disabled={portalLoading} onClick={() => void openBillingPortal("downgrade-premium")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm font-bold text-stone-800 transition hover:bg-amber-50 disabled:opacity-60">
                      {portalAction === "downgrade-premium" ? <Loader2 size={16} className="animate-spin" /> : <ArrowDownRight size={16} />} Downgrade to Premium
                    </button>
                    <button type="button" disabled={portalLoading} onClick={() => void openBillingPortal("downgrade-free")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-60">
                      {portalAction === "downgrade-free" ? <Loader2 size={16} className="animate-spin" /> : <ArrowDownRight size={16} />} Downgrade to Free
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
