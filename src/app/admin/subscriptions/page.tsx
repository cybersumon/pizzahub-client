
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Crown,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
  Users,
  XCircle,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:7000";

type Plan = "free" | "premium" | "premium_plus";
type PlanFilter = "all" | Plan;

interface SubscriptionRecord {
  restaurantId: string;
  restaurantName: string;
  restaurantStatus: string;
  plan: Plan;
  subscriptionStatus: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  updatedAt: string | null;
}

interface SubscriptionStats {
  totalRestaurants: number;
  free: number;
  premium: number;
  premiumPlus: number;
  activeSubscriptions: number;
}

interface SubscriptionResponse {
  success: boolean;
  message?: string;
  stats?: SubscriptionStats;
  data?: SubscriptionRecord[];
}

function planLabel(plan: Plan): string {
  if (plan === "premium_plus") return "Premium+";
  if (plan === "premium") return "Premium";
  return "Free";
}

function planClass(plan: Plan): string {
  if (plan === "premium_plus") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }

  if (plan === "premium") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-stone-100 text-stone-600 border-stone-200";
}

function formatDate(value: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatStatus(value: string): string {
  return value.replaceAll("_", " ");
}

export default function AdminSubscriptionsPage() {
  const [records, setRecords] =
    useState<SubscriptionRecord[]>([]);

  const [stats, setStats] =
    useState<SubscriptionStats | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<PlanFilter>("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch the admin-only subscription API.
  useEffect(() => {
    const controller = new AbortController();

    async function fetchSubscriptions() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/api/admin/subscriptions`,
          {
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const text = await response.text();

        let result: SubscriptionResponse;

        try {
          result = JSON.parse(text) as SubscriptionResponse;
        } catch {
          throw new Error(
            `Subscription API returned HTTP ${response.status} instead of JSON.`
          );
        }

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Unable to load subscriptions."
          );
        }

        if (controller.signal.aborted) return;

        setRecords(
          Array.isArray(result.data) ? result.data : []
        );

        setStats(result.stats ?? null);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to connect to the backend."
        );

        setRecords([]);
        setStats(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchSubscriptions();

    return () => controller.abort();
  }, [refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  // Apply search and plan filters on the client.
  const filteredRecords = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesPlan =
        filter === "all" || record.plan === filter;

      const matchesSearch =
        !keyword ||
        record.restaurantName
          .toLowerCase()
          .includes(keyword) ||
        record.owner.name
          .toLowerCase()
          .includes(keyword) ||
        record.owner.email
          .toLowerCase()
          .includes(keyword) ||
        (record.stripeSubscriptionId ?? "")
          .toLowerCase()
          .includes(keyword);

      return matchesPlan && matchesSearch;
    });
  }, [records, filter, search]);

  const summaryCards = [
    {
      label: "Total Restaurants",
      value: stats?.totalRestaurants ?? 0,
      icon: Store,
    },
    {
      label: "Free Plans",
      value: stats?.free ?? 0,
      icon: Users,
    },
    {
      label: "Premium Plans",
      value: stats?.premium ?? 0,
      icon: Crown,
    },
    {
      label: "Premium+ Plans",
      value: stats?.premiumPlus ?? 0,
      icon: ShieldCheck,
    },
    {
      label: "Active Subscriptions",
      value: stats?.activeSubscriptions ?? 0,
      icon: CreditCard,
    },
  ];

  return (
    <main className="min-h-screen bg-[#FFF9F2] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
  <div className="w-full max-w-none">
        {/* Page header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <Link
              href="/admin/restaurants"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#D62828] hover:underline"
            >
              <ArrowLeft size={17} />
              Restaurant Approvals
            </Link>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#D62828]">
              PizzaHub Admin
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-stone-900 sm:text-4xl">
              Subscription Management
            </h1>

            <p className="mt-2 text-sm text-stone-500">
              Monitor restaurant plans, Stripe
              subscriptions and billing status.
            </p>
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-5 py-3 text-sm font-bold text-stone-700 shadow-sm transition hover:bg-orange-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Subscription statistics */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-[#D62828]">
                <card.icon size={22} />
              </div>

              <p className="mt-4 text-xs font-medium text-stone-500">
                {card.label}
              </p>

              <p className="mt-2 text-3xl font-extrabold text-stone-900">
                {loading ? "—" : card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Subscription management table */}
        <section className="mt-8 rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-stone-900">
                Restaurant Subscriptions
              </h2>

              <p className="mt-1 text-sm text-stone-500">
                Verified plans and current Stripe status.
              </p>
            </div>

            <span className="rounded-full bg-red-50 px-4 py-2 text-xs font-bold text-[#D62828]">
              {filteredRecords.length} Records
            </span>
          </div>

          {/* Search and plan filters */}
          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search restaurant, owner, email..."
                className="h-12 w-full rounded-xl border border-stone-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-red-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", "All"],
                  ["free", "Free"],
                  ["premium", "Premium"],
                  ["premium_plus", "Premium+"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                    filter === value
                      ? "bg-[#D62828] text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* Loading and table */}
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-20 text-stone-500">
              <RefreshCw
                size={20}
                className="animate-spin text-[#D62828]"
              />
              Loading subscriptions...
            </div>
          ) : error ? null : filteredRecords.length === 0 ? (
            <div className="py-20 text-center">
              <Store
                size={38}
                className="mx-auto text-stone-300"
              />

              <h3 className="mt-4 font-bold text-stone-900">
                No Subscriptions Found
              </h3>

              <p className="mt-2 text-sm text-stone-500">
                No restaurants match the selected filters.
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-262.5 text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-stone-600">
                    <th className="p-4">Restaurant</th>
                    <th className="p-4">Owner</th>
                    <th className="p-4">Plan</th>
                    <th className="p-4">Subscription</th>
                    <th className="p-4">Restaurant Status</th>
                    <th className="p-4">Stripe Reference</th>
                    <th className="p-4">Updated</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.restaurantId}
                      className="border-b border-stone-100 align-top transition hover:bg-orange-50/40"
                    >
                      <td className="p-4">
                        <p className="font-bold text-stone-900">
                          {record.restaurantName}
                        </p>
                      </td>

                      <td className="p-4">
                        <p className="font-semibold text-stone-800">
                          {record.owner.name}
                        </p>
                        <p className="mt-1 break-all text-xs text-stone-500">
                          {record.owner.email}
                        </p>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${planClass(
                            record.plan
                          )}`}
                        >
                          {planLabel(record.plan)}
                        </span>
                      </td>

                      <td className="p-4">
                        {record.subscriptionStatus === "active" ? (
                          <span className="inline-flex items-center gap-1.5 font-semibold text-green-700">
                            <CheckCircle2 size={15} />
                            Active
                          </span>
                        ) : record.subscriptionStatus === "none" ? (
                          <span className="text-stone-400">
                            No Subscription
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 capitalize text-amber-700">
                            <XCircle size={15} />
                            {formatStatus(
                              record.subscriptionStatus
                            )}
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="capitalize text-stone-700">
                          {record.restaurantStatus}
                        </span>
                      </td>

                      <td className="p-4">
                        {record.stripeSubscriptionId ? (
                          <div className="space-y-1 font-mono text-xs text-stone-500">
                            <p className="max-w-45 truncate" title={record.stripeSubscriptionId}>
                              {record.stripeSubscriptionId}
                            </p>
                            <p className="max-w-45 truncate" title={record.stripeCustomerId ?? ""}>
                              {record.stripeCustomerId}
                            </p>
                          </div>
                        ) : (
                          <span className="text-stone-400">
                            —
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-xs text-stone-500">
                        {formatDate(record.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
