
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Crown,
  Loader2,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";

type Plan = "premium" | "premium_plus";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:7000";

const plans = [
  {
    id: "premium" as Plan,
    name: "Premium",
    subtitle: "Everything you need to grow.",
    description:
      "Unlock more control, flexibility and a better restaurant experience.",
    icon: Zap,
    features: [
      "Unlimited approved menu items",
      "Restaurant menu management",
      "Customer order management",
      "Premium restaurant details",
    ],
    featured: false,
  },
  {
    id: "premium_plus" as Plan,
    name: "Premium+",
    subtitle: "The ultimate restaurant experience.",
    description:
      "Make your restaurant stand out with an exclusive digital experience.",
    icon: Crown,
    features: [
      "Everything included in Premium",
      "Premium+ restaurant details",
      "Table reservation experience",
      "Advanced restaurant presentation",
    ],
    featured: true,
  },
];

export default function VendorSubscriptionPage() {
  const [loadingPlan, setLoadingPlan] =
    useState<Plan | null>(null);

  const [error, setError] = useState("");

  async function startCheckout(plan: Plan) {
    if (loadingPlan) return;

    setLoadingPlan(plan);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/subscriptions/checkout`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ plan }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to start checkout."
        );
      }

      const checkoutUrl = result.data?.url;

      if (
        typeof checkoutUrl !== "string" ||
        !checkoutUrl.startsWith(
          "https://checkout.stripe.com/"
        )
      ) {
        throw new Error(
          "Invalid Stripe Checkout URL."
        );
      }

      window.location.assign(checkoutUrl);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
      setLoadingPlan(null);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FAF8F5] px-4 py-10 text-[#231B18] sm:px-6 lg:py-16">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute -left-32 top-32 h-80 w-80 rounded-full bg-orange-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-60 h-96 w-96 rounded-full bg-red-100/40 blur-3xl" />

      <div className="relative mx-auto max-w-5xl">
        {/* Back navigation */}
        <Link
          href="/dashboard/vendor"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#736760] transition hover:text-red-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Page header */}
        <div className="mx-auto mb-12 mt-10 max-w-2xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.17em] text-red-600">
            <Sparkles className="h-3.5 w-3.5" />
            PizzaHub Membership
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-[#231B18] sm:text-5xl">
            More than just a{" "}
            <span className="text-red-600">
              restaurant.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#857B75] sm:text-base">
            Give your restaurant the tools it
            deserves. Choose the perfect plan to
            unlock new possibilities.
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div
            role="alert"
            className="mx-auto mb-8 max-w-xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Pricing cards */}
        <div className="grid items-stretch gap-6 md:grid-cols-2 lg:gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isFeatured = plan.featured;

            return (
              <div
                key={plan.id}
                className={[
                  "group relative flex h-full flex-col overflow-hidden rounded-[28px] border p-7 transition-all duration-300 sm:p-9",
                  "hover:-translate-y-1.5",
                  isFeatured
                    ? "border-[#373132] bg-gradient-to-br from-[#292526] via-[#201D1F] to-[#121113] text-white shadow-[0_24px_65px_rgba(25,20,20,0.18)]"
                    : "border-[#EEE8E3] bg-white text-[#231B18] shadow-[0_16px_55px_rgba(51,35,25,0.05)] hover:shadow-[0_25px_65px_rgba(51,35,25,0.10)]",
                ].join(" ")}
              >
                {/* Featured glow */}
                {isFeatured && (
                  <>
                    <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
                    <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-red-500/5 blur-3xl" />
                  </>
                )}

                {/* Top row */}
                <div className="relative flex items-start justify-between gap-3">
                  <div
                    className={[
                      "flex h-14 w-14 items-center justify-center rounded-2xl",
                      isFeatured
                        ? "border border-amber-300/20 bg-amber-300/10 text-amber-300"
                        : "bg-red-50 text-red-600",
                    ].join(" ")}
                  >
                    <Icon
                      className="h-7 w-7"
                      strokeWidth={1.8}
                    />
                  </div>

                  {isFeatured ? (
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      <Star className="h-3 w-3 fill-current" />
                      Most Popular
                    </div>
                  ) : (
                    <span className="rounded-full bg-[#F7F5F2] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#86796F]">
                      Essential
                    </span>
                  )}
                </div>

                {/* Plan name */}
                <div className="relative mt-8">
                  <p
                    className={[
                      "text-xs font-semibold",
                      isFeatured
                        ? "text-amber-300"
                        : "text-red-600",
                    ].join(" ")}
                  >
                    {plan.subtitle}
                  </p>

                  <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                    {plan.name}
                  </h2>

                  <p
                    className={[
                      "mt-4 min-h-14 text-sm leading-7",
                      isFeatured
                        ? "text-white/55"
                        : "text-[#8A8079]",
                    ].join(" ")}
                  >
                    {plan.description}
                  </p>
                </div>

                {/* Pricing note */}
                <div
                  className={[
                    "relative mt-7 rounded-2xl border px-5 py-5",
                    isFeatured
                      ? "border-white/10 bg-white/[0.04]"
                      : "border-[#F0EBE6] bg-[#FAF8F6]",
                  ].join(" ")}
                >
                  <p
                    className={[
                      "text-[10px] font-bold uppercase tracking-[0.14em]",
                      isFeatured
                        ? "text-white/45"
                        : "text-[#A39A92]",
                    ].join(" ")}
                  >
                    Subscription
                  </p>

                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-xl font-extrabold tracking-tight">
                      Monthly Plan
                    </span>

                    <span
                      className={[
                        "mb-0.5 text-xs",
                        isFeatured
                          ? "text-white/45"
                          : "text-[#9A8F87]",
                      ].join(" ")}
                    >
                      / recurring
                    </span>
                  </div>

                  <p
                    className={[
                      "mt-2 text-xs leading-5",
                      isFeatured
                        ? "text-white/45"
                        : "text-[#9A8F87]",
                    ].join(" ")}
                  >
                    Final price is shown securely
                    during Stripe Checkout.
                  </p>
                </div>

                {/* Features */}
                <div className="relative mt-8 flex-1">
                  <div className="mb-5 flex items-center gap-3">
                    <span
                      className={[
                        "text-xs font-bold uppercase tracking-widest",
                        isFeatured
                          ? "text-white/75"
                          : "text-[#4C403A]",
                      ].join(" ")}
                    >
                      What&apos;s included
                    </span>

                    <div
                      className={[
                        "h-px flex-1",
                        isFeatured
                          ? "bg-white/10"
                          : "bg-[#F0EBE6]",
                      ].join(" ")}
                    />
                  </div>

                  <ul className="space-y-5">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm"
                      >
                        <span
                          className={[
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                            isFeatured
                              ? "bg-amber-300/15 text-amber-300"
                              : "bg-green-50 text-emerald-600",
                          ].join(" ")}
                        >
                          <Check
                            className="h-3.5 w-3.5"
                            strokeWidth={2.5}
                          />
                        </span>

                        <span
                          className={
                            isFeatured
                              ? "text-white/75"
                              : "text-[#685F59]"
                          }
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Checkout button */}
                <button
                  type="button"
                  disabled={loadingPlan !== null}
                  onClick={() =>
                    startCheckout(plan.id)
                  }
                  className={[
                    "relative mt-10 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-bold transition-all duration-200",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                    isFeatured
                      ? "bg-gradient-to-r from-amber-300 to-amber-400 text-[#211B16] shadow-[0_10px_25px_rgba(251,191,36,0.12)] hover:from-amber-200 hover:to-amber-300"
                      : "bg-red-600 text-white shadow-[0_10px_25px_rgba(220,38,38,0.12)] hover:bg-red-700",
                  ].join(" ")}
                >
                  {loadingPlan === plan.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    <>
                      Choose {plan.name}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                <div
                  className={[
                    "relative mt-4 flex items-center justify-center gap-2 text-[11px]",
                    isFeatured
                      ? "text-white/40"
                      : "text-[#A69B93]",
                  ].join(" ")}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure Stripe Checkout
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 flex flex-col items-center justify-center gap-3 text-center">
          <div className="flex items-center gap-2 text-sm font-medium text-[#6B625B]">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Simple plans. Powerful possibilities.
          </div>

          <p className="max-w-lg text-xs leading-6 text-[#A19891]">
            Subscription access is activated only
            after successful payment verification.
          </p>
        </div>
      </div>
    </main>
  );
}
