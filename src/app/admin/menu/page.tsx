"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import {
  CheckCircle2,
  XCircle,
  Clock3,
  ListFilter,
  Search,
  RefreshCw,
  Trash2,
  Store,
  MapPin,
  AlertCircle,
  Pizza,
  RotateCcw,
} from "lucide-react";

// ============================================
// BACKEND CONFIGURATION
// ============================================

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:7000"
).replace(/\/$/, "");

// ============================================
// TYPES
// ============================================

type ApprovalStatus =
  | "pending"
  | "approved"
  | "rejected";

type FilterStatus = "all" | ApprovalStatus;

interface AdminMenuItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  image: string;
  isActive: boolean;
  approvalStatus: ApprovalStatus;
  vendorName: string;
  location: string;
  restaurantStatus: string;
  subscriptionPlan: string;
  createdAt?: string;
}

interface MenuStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface MenuApiResponse {
  success: boolean;
  message?: string;
  data?: AdminMenuItem[];
  stats?: MenuStats;
}

interface ActionApiResponse {
  success: boolean;
  message?: string;
}

// ============================================
// HELPERS
// ============================================

const filters: {
  value: FilterStatus;
  label: string;
}[] = [
  { value: "all", label: "All Items" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function getStatusStyle(status: ApprovalStatus) {
  switch (status) {
    case "approved":
      return "bg-green-50 text-green-700";

    case "rejected":
      return "bg-red-50 text-red-700";

    default:
      return "bg-amber-50 text-amber-700";
  }
}

function getPlanLabel(plan: string) {
  if (plan === "premium_plus") return "Premium+";
  if (plan === "premium") return "Premium";
  return "Free";
}

function formatPrice(price: number) {
  return `৳${Number(price).toLocaleString("en-BD")}`;
}

// ============================================
// ADMIN MENU MANAGEMENT PAGE
// ============================================

export default function AdminMenuPage() {
  // ==========================================
  // STATES
  // ==========================================

  const [items, setItems] = useState<AdminMenuItem[]>([]);

  const [status, setStatus] =
    useState<FilterStatus>("pending");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  // কোন Item-এর action চলছে।
  const [actionId, setActionId] = useState<string | null>(
    null
  );

  // Delete confirmation state।
  const [deleteId, setDeleteId] = useState<string | null>(
    null
  );

  // Backend-এর actual statistics।
  const [stats, setStats] = useState<MenuStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // ==========================================
  // LOAD MENU ITEMS
  // ==========================================

  useEffect(() => {
    const controller = new AbortController();

    async function fetchMenuItems() {
      try {
        const response = await fetch(
          `${API_URL}/api/admin/menu?status=${status}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const result: MenuApiResponse =
          await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Unable to load menu items."
          );
        }

        if (controller.signal.aborted) return;

        setItems(
          Array.isArray(result.data) ? result.data : []
        );

        if (result.stats) {
          setStats(result.stats);
        }

        setError("");
        setLoading(false);
      } catch (err) {
        if (controller.signal.aborted) return;

        setItems([]);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to connect to PizzaHub server."
        );

        setLoading(false);
      }
    }

    // Async API call।
    // Effect-এর ভিতরে synchronous setState নেই।
    void fetchMenuItems();

    return () => {
      controller.abort();
    };
  }, [status, refreshKey]);

  // ==========================================
  // FILTER CHANGE
  // ==========================================

  function changeStatus(nextStatus: FilterStatus) {
    if (nextStatus === status) return;

    setLoading(true);
    setError("");
    setSuccess("");
    setDeleteId(null);
    setStatus(nextStatus);
  }

  // ==========================================
  // REFRESH
  // ==========================================

  function refreshMenu() {
    setLoading(true);
    setError("");
    setDeleteId(null);

    setRefreshKey((previous) => previous + 1);
  }

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return items;

    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword) ||
        item.vendorName.toLowerCase().includes(keyword) ||
        item.location.toLowerCase().includes(keyword)
    );
  }, [items, search]);

  // ==========================================
  // APPROVE / REJECT
  // ==========================================

  async function updateApproval(
    item: AdminMenuItem,
    nextStatus: "approved" | "rejected"
  ) {
    if (actionId !== null) return;

    setActionId(item.id);
    setError("");
    setSuccess("");
    setDeleteId(null);

    try {
      const response = await fetch(
        `${API_URL}/api/admin/menu/${item.id}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const result: ActionApiResponse =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to update menu approval."
        );
      }

      setSuccess(
        result.message ||
          `${item.name} ${nextStatus} successfully.`
      );

      // Updated list আবার load করব।
      setLoading(true);
      setRefreshKey((previous) => previous + 1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update menu approval."
      );
    } finally {
      setActionId(null);
    }
  }

  // ==========================================
  // DELETE MENU ITEM
  // ==========================================

  async function deleteMenuItem(item: AdminMenuItem) {
    if (actionId !== null) return;

    setActionId(item.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/menu/${item.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const result: ActionApiResponse =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to delete menu item."
        );
      }

      setSuccess(
        `${item.name} deleted successfully.`
      );

      setDeleteId(null);
      setLoading(true);
      setRefreshKey((previous) => previous + 1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete menu item."
      );
    } finally {
      setActionId(null);
    }
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <main className="bg-[#FFF9F2] px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl">

        {/* =====================================
            PAGE HEADER
            ===================================== */}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-[#D62828]">
              PizzaHub Administration
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">
              Menu Approval
            </h1>

            <p className="mt-3 text-sm leading-6 text-stone-500">
              Review restaurant menu submissions,
              approve published items and manage
              menu availability.
            </p>
          </div>

          <button
            type="button"
            onClick={refreshMenu}
            disabled={loading || actionId !== null}
            className="inline-flex items-center gap-2 rounded-xl border border-orange-100 bg-white px-5 py-3 text-sm font-bold text-stone-700 shadow-sm transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />

            Refresh
          </button>
        </div>

        {/* =====================================
            STATISTICS CARDS
            ===================================== */}

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: "Total Items",
              value: stats.total,
              icon: Pizza,
              color: "text-[#D62828]",
            },
            {
              label: "Pending",
              value: stats.pending,
              icon: Clock3,
              color: "text-amber-600",
            },
            {
              label: "Approved",
              value: stats.approved,
              icon: CheckCircle2,
              color: "text-green-600",
            },
            {
              label: "Rejected",
              value: stats.rejected,
              icon: XCircle,
              color: "text-red-600",
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"
              >
                <Icon
                  size={25}
                  className={stat.color}
                />

                <p className="mt-4 text-sm text-stone-500">
                  {stat.label}
                </p>

                <p className="mt-2 text-3xl font-extrabold text-stone-900">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* =====================================
            MAIN MANAGEMENT SECTION
            ===================================== */}

        <section className="mt-8 rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">

          {/* Section Heading */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-stone-900">
                Menu Submissions
              </h2>

              <p className="mt-1 text-sm text-stone-500">
                Manage submitted pizzas, sides,
                appetizers and beverages.
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-bold text-[#D62828]">
              <ListFilter size={15} />
              Admin Review
            </span>
          </div>

          {/* ===================================
              STATUS FILTER TABS
              =================================== */}

          <div className="mt-6 flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                disabled={actionId !== null}
                onClick={() =>
                  changeStatus(filter.value)
                }
                className={
                  status === filter.value
                    ? "rounded-full bg-[#D62828] px-5 py-2.5 text-sm font-bold text-white transition"
                    : "rounded-full bg-stone-100 px-5 py-2.5 text-sm font-bold text-stone-600 transition hover:bg-stone-200"
                }
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* ===================================
              SEARCH FIELD
              =================================== */}

          <div className="relative mt-6">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by menu item, restaurant, category or location..."
              className="h-12 w-full rounded-xl border border-stone-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#D62828] focus:ring-1 focus:ring-[#D62828]"
            />
          </div>

          {/* ===================================
              SUCCESS MESSAGE
              =================================== */}

          {success && (
            <div
              role="status"
              className="mt-5 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700"
            >
              <CheckCircle2
                size={18}
                className="shrink-0"
              />

              {success}
            </div>
          )}

          {/* ===================================
              ERROR MESSAGE
              =================================== */}

          {error && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle
                size={18}
                className="shrink-0"
              />

              {error}
            </div>
          )}

          {/* ===================================
              LOADING
              =================================== */}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw
                size={30}
                className="animate-spin text-[#D62828]"
              />

              <p className="mt-4 text-sm font-medium text-stone-500">
                Loading menu submissions...
              </p>
            </div>
          ) : error && items.length === 0 ? (

            <div className="py-12 text-center">
              <p className="text-sm text-stone-500">
                Unable to display menu items.
              </p>

              <button
                type="button"
                onClick={refreshMenu}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#D62828] px-5 py-3 text-sm font-bold text-white"
              >
                <RotateCcw size={16} />
                Try Again
              </button>
            </div>
          ) : filteredItems.length === 0 ? (

            /* =================================
                EMPTY STATE
                ================================= */

            <div className="py-20 text-center">
              <Pizza
                size={46}
                className="mx-auto text-orange-200"
              />

              <h3 className="mt-4 text-xl font-extrabold text-stone-900">
                No Menu Items Found
              </h3>

              <p className="mt-2 text-sm text-stone-500">
                No items match your current
                search or status filter.
              </p>
            </div>
          ) : (

            /* =================================
                MENU ITEMS GRID
                ================================= */

            <>
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                {filteredItems.map((item) => {
                  const isUpdating =
                    actionId === item.id;

                  const isPending =
                    item.approvalStatus === "pending";

                  return (
                    <article
                      key={item.id}
                      className="flex h-full flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white transition hover:shadow-md"
                    >

                      {/* MENU IMAGE */}
                      <div className="relative h-48 overflow-hidden bg-orange-50">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Pizza
                              size={42}
                              className="text-orange-200"
                            />
                          </div>
                        )}

                        {/* APPROVAL BADGE */}
                        <span
                          className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold capitalize shadow-sm ${getStatusStyle(
                            item.approvalStatus
                          )}`}
                        >
                          {item.approvalStatus}
                        </span>

                        {/* PLAN BADGE */}
                        <span className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-stone-800 shadow-sm">
                          {getPlanLabel(
                            item.subscriptionPlan
                          )}
                        </span>
                      </div>

                      {/* ITEM DETAILS */}
                      <div className="flex flex-1 flex-col p-5">

                        {/* CATEGORY */}
                        <p className="text-xs font-bold uppercase tracking-wide text-[#D62828]">
                          {item.category}
                        </p>

                        {/* NAME */}
                        <h3 className="mt-2 text-xl font-extrabold text-stone-900">
                          {item.name}
                        </h3>

                        {/* DESCRIPTION */}
                        {item.description && (
                          <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-500">
                            {item.description}
                          </p>
                        )}

                        {/* RESTAURANT */}
                        <div className="mt-5 flex items-center gap-2 text-sm text-stone-600">
                          <Store
                            size={16}
                            className="shrink-0 text-[#D62828]"
                          />

                          <span className="font-semibold">
                            {item.vendorName}
                          </span>
                        </div>

                        {/* LOCATION */}
                        <div className="mt-3 flex items-start gap-2 text-sm text-stone-500">
                          <MapPin
                            size={16}
                            className="mt-0.5 shrink-0"
                          />

                          <span>{item.location}</span>
                        </div>

                        {/* AVAILABILITY */}
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span
                            className={
                              item.isActive
                                ? "rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700"
                                : "rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-500"
                            }
                          >
                            {item.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>

                          {item.restaurantStatus !==
                            "approved" && (
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                              Restaurant Not Approved
                            </span>
                          )}
                        </div>

                        {/* PRICE */}
                        <div className="mt-auto pt-5">
                          <div className="border-t border-stone-100 pt-4">
                            <p className="text-2xl font-extrabold text-[#D62828]">
                              {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>

                        {/* =================================
                            APPROVE / REJECT
                            ================================= */}

                        <div className="mt-5 grid grid-cols-2 gap-2">

                          {/* APPROVE */}
                          {item.approvalStatus !==
                            "approved" && (
                            <button
                              type="button"
                              disabled={
                                actionId !== null ||
                                item.restaurantStatus !==
                                  "approved"
                              }
                              onClick={() =>
                                void updateApproval(
                                  item,
                                  "approved"
                                )
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-3 py-3 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <CheckCircle2 size={16} />

                              {isUpdating
                                ? "Updating..."
                                : "Approve"}
                            </button>
                          )}

                          {/* REJECT */}
                          {item.approvalStatus !==
                            "rejected" && (
                            <button
                              type="button"
                              disabled={actionId !== null}
                              onClick={() =>
                                void updateApproval(
                                  item,
                                  "rejected"
                                )
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <XCircle size={16} />

                              {isUpdating
                                ? "Updating..."
                                : "Reject"}
                            </button>
                          )}
                        </div>

                        {/* =================================
                            DELETE CONFIRMATION
                            ================================= */}

                        {deleteId === item.id ? (
                          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">

                            <p className="text-xs font-semibold text-red-700">
                              Delete this menu item
                              permanently?
                            </p>

                            <div className="mt-3 flex gap-2">
                              <button
                                type="button"
                                disabled={
                                  actionId !== null
                                }
                                onClick={() =>
                                  void deleteMenuItem(
                                    item
                                  )
                                }
                                className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                              >
                                Confirm Delete
                              </button>

                              <button
                                type="button"
                                disabled={
                                  actionId !== null
                                }
                                onClick={() =>
                                  setDeleteId(null)
                                }
                                className="flex-1 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-700"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={actionId !== null}
                            onClick={() =>
                              setDeleteId(item.id)
                            }
                            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 size={15} />
                            Delete Item
                          </button>
                        )}

                      </div>
                    </article>
                  );
                })}
              </div>

              {/* RESULT COUNT */}
              <div className="mt-6 border-t border-stone-100 pt-5">
                <p className="text-sm text-stone-500">
                  Showing{" "}
                  <strong className="text-stone-800">
                    {filteredItems.length}
                  </strong>{" "}
                  menu items
                </p>
              </div>
            </>
          )}

        </section>
      </div>
    </main>
  );
}