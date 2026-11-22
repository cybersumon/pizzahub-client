"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Store,
  Users,
  CheckCircle2,
  XCircle,
  Clock3,
  RefreshCw,
  MapPin,
  Phone,
  ArrowRight,
} from "lucide-react";

// ============================================
// PIZZAHUB BACKEND CONFIGURATION
// ============================================

// Express Backend API URL।
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
  "http://localhost:7000";

// ============================================
// TYPES
// ============================================

// Restaurant approval status।
type RestaurantStatus =
  | "pending"
  | "approved"
  | "rejected";

// Restaurant database structure।
interface Restaurant {
  _id?: string;
  id?: string;
  name: string;
  address: string;
  phone: string;
  description?: string;
  status: RestaurantStatus;
  plan: string;
  ownerId?: string;
  createdAt?: string;
}

// API response structure।
interface RestaurantsResponse {
  success: boolean;
  message?: string;
  data?: Restaurant[];
  restaurants?: Restaurant[];
}

// ============================================
// ADMIN RESTAURANT APPROVAL PAGE
// ============================================

export default function AdminRestaurantsPage() {
  // ==========================================
  // STATES
  // ==========================================

  // Database restaurants।
  const [restaurants, setRestaurants] = useState<
    Restaurant[]
  >([]);

  // Default filter: Pending।
  const [status, setStatus] =
    useState<RestaurantStatus>("pending");

  // API loading state।
  const [loading, setLoading] = useState(true);

  // Approve/Reject action loading।
  const [actionId, setActionId] = useState<string | null>(
    null
  );

  // Notification states।
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Refresh trigger।
  const [refreshKey, setRefreshKey] = useState(0);

  // ==========================================
  // FETCH RESTAURANTS FROM BACKEND
  // ==========================================

  useEffect(() => {
    const controller = new AbortController();

    async function fetchRestaurants() {
      try {
        // Admin API request with Better Auth cookie।
        const response = await fetch(
          `${API_URL}/api/admin/restaurants?status=${status}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        // Backend response।
        const result: RestaurantsResponse =
          await response.json();

        // Backend error handling।
        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Unable to load restaurants."
          );
        }

        // Backend data array।
        const restaurantList =
          result.data ?? result.restaurants ?? [];

        // Request cancel না হলে state update।
        if (!controller.signal.aborted) {
          setRestaurants(
            Array.isArray(restaurantList)
              ? restaurantList
              : []
          );

          setError("");
          setLoading(false);
        }
      } catch (err) {
        // Cancelled request ignore।
        if (controller.signal.aborted) return;

        setRestaurants([]);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to connect to PizzaHub server."
        );

        setLoading(false);
      }
    }

    // Asynchronous API call।
    void fetchRestaurants();

    // Cleanup।
    return () => {
      controller.abort();
    };
  }, [status, refreshKey]);

  // ==========================================
  // CHANGE RESTAURANT STATUS FILTER
  // ==========================================

  function changeStatus(nextStatus: RestaurantStatus) {
    if (nextStatus === status) return;

    setLoading(true);
    setError("");
    setSuccess("");
    setRestaurants([]);

    setStatus(nextStatus);
  }

  // ==========================================
  // REFRESH RESTAURANTS
  // ==========================================

  function refreshRestaurants() {
    setLoading(true);
    setError("");
    setSuccess("");

    setRefreshKey((previous) => previous + 1);
  }

  // ==========================================
  // APPROVE / REJECT RESTAURANT
  // ==========================================

  async function updateRestaurantStatus(
    restaurant: Restaurant,
    newStatus: "approved" | "rejected"
  ) {
    const restaurantId =
      restaurant.id ?? restaurant._id;

    if (!restaurantId) {
      setError("Restaurant ID is missing.");
      return;
    }

    // Action processing।
    setActionId(restaurantId);
    setError("");
    setSuccess("");

    try {
      // Secure Admin API endpoint।
      const response = await fetch(
        `${API_URL}/api/admin/restaurants/${restaurantId}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      // Backend response।
      const result: {
        success: boolean;
        message?: string;
      } = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to update restaurant status."
        );
      }

      // Success notification।
      setSuccess(
        newStatus === "approved"
          ? `${restaurant.name} approved successfully.`
          : `${restaurant.name} rejected successfully.`
      );

      // Current list refresh।
      setLoading(true);
      setRefreshKey((previous) => previous + 1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update restaurant status."
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

        {/* ====================================
            PAGE HEADER
            ==================================== */}

        <div className="flex flex-wrap items-center justify-between gap-4">

          <div>
            <h1 className="text-3xl font-extrabold text-stone-900">
              Restaurant Approvals
            </h1>

            <p className="mt-2 text-sm text-stone-500">
              Review registered restaurants and manage
              their approval requests.
            </p>
          </div>

          {/* Admin Users Management Link */}
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 rounded-xl bg-[#D62828] px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
          >
            <Users size={18} />
            Manage Users
            <ArrowRight size={17} />
          </Link>

        </div>

        {/* ====================================
            SUMMARY CARDS
            ==================================== */}

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">

          {/* Restaurants Count */}
          <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <Store
              size={25}
              className="text-[#D62828]"
            />

            <p className="mt-3 text-sm text-stone-500">
              Restaurants in View
            </p>

            <p className="mt-2 text-3xl font-extrabold">
              {loading ? "—" : restaurants.length}
            </p>
          </div>

          {/* Selected Filter */}
          <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <Clock3
              size={25}
              className="text-amber-600"
            />

            <p className="mt-3 text-sm text-stone-500">
              Current Filter
            </p>

            <p className="mt-2 text-lg font-extrabold capitalize">
              {status}
            </p>
          </div>

          {/* Approval Module */}
          <div className="col-span-2 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:col-span-1">
            <CheckCircle2
              size={25}
              className="text-green-600"
            />

            <p className="mt-3 text-sm text-stone-500">
              Approval Management
            </p>

            <p className="mt-2 text-lg font-extrabold">
              Active
            </p>
          </div>

        </div>

        {/* ====================================
            RESTAURANT MANAGEMENT SECTION
            ==================================== */}

        <section className="mt-8 rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">

          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>
              <h2 className="text-xl font-extrabold text-stone-900">
                Restaurant Applications
              </h2>

              <p className="mt-1 text-sm text-stone-500">
                View and review restaurant registration requests.
              </p>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={refreshRestaurants}
              disabled={loading || actionId !== null}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-bold text-stone-600 transition hover:bg-stone-50 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />

              {loading ? "Loading..." : "Refresh"}
            </button>

          </div>

          {/* ==================================
              STATUS FILTER
              ================================== */}

          <div className="mt-6 flex flex-wrap gap-2">

            {(
              [
                ["pending", "Pending"],
                ["approved", "Approved"],
                ["rejected", "Rejected"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => changeStatus(value)}
                disabled={actionId !== null}
                className={
                  status === value
                    ? "rounded-full bg-[#D62828] px-5 py-2.5 text-sm font-bold text-white"
                    : "rounded-full bg-stone-100 px-5 py-2.5 text-sm font-bold text-stone-600 transition hover:bg-stone-200"
                }
              >
                {label}
              </button>
            ))}

          </div>

          {/* ==================================
              ERROR MESSAGE
              ================================== */}

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* ==================================
              SUCCESS MESSAGE
              ================================== */}

          {success && (
            <div
              role="status"
              className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
            >
              {success}
            </div>
          )}

          {/* ==================================
              RESTAURANTS LIST
              ================================== */}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">

              <RefreshCw
                size={27}
                className="animate-spin text-[#D62828]"
              />

              <p className="mt-4 text-sm font-medium text-stone-500">
                Loading restaurants...
              </p>

            </div>
          ) : error ? null : restaurants.length === 0 ? (

            // Empty State।
            <div className="py-16 text-center">

              <Store
                size={42}
                className="mx-auto text-orange-300"
              />

              <h3 className="mt-4 text-xl font-extrabold text-stone-900">
                No Restaurants Found
              </h3>

              <p className="mt-2 text-sm text-stone-500">
                No {status} restaurant applications
                are available.
              </p>

            </div>
          ) : (

            // Restaurant Cards।
            <div className="mt-6 grid gap-5 md:grid-cols-2">

              {restaurants.map((restaurant) => {
                // Restaurant database ID।
                const restaurantId =
                  restaurant.id ?? restaurant._id ?? "";

                const isUpdating =
                  actionId === restaurantId;

                return (
                  <article
                    key={restaurantId}
                    className="rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-orange-200 hover:shadow-sm"
                  >

                    {/* =================================
                        RESTAURANT HEADER
                        ================================= */}

                    <div className="flex items-start justify-between gap-3">

                      <div>
                        <h3 className="text-xl font-extrabold text-stone-900">
                          {restaurant.name}
                        </h3>

                        <p className="mt-2 text-sm text-stone-500">
                          Subscription:{" "}
                          <span className="font-bold capitalize">
                            {restaurant.plan}
                          </span>
                        </p>
                      </div>

                      {/* Approval Status */}
                      <span
                        className={
                          restaurant.status === "approved"
                            ? "rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700"
                            : restaurant.status === "rejected"
                              ? "rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700"
                              : "rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700"
                        }
                      >
                        {restaurant.status}
                      </span>

                    </div>

                    {/* =================================
                        RESTAURANT INFORMATION
                        ================================= */}

                    {/* Address */}
                    <div className="mt-5 flex items-start gap-2 text-sm text-stone-600">
                      <MapPin
                        size={17}
                        className="shrink-0 text-[#D62828]"
                      />

                      <span>{restaurant.address}</span>
                    </div>

                    {/* Phone */}
                    <div className="mt-3 flex items-center gap-2 text-sm text-stone-600">
                      <Phone
                        size={17}
                        className="shrink-0 text-[#D62828]"
                      />

                      <span>{restaurant.phone}</span>
                    </div>

                    {/* Description */}
                    {restaurant.description && (
                      <p className="mt-4 text-sm leading-6 text-stone-500">
                        {restaurant.description}
                      </p>
                    )}

                    {/* Registration Date */}
                    {restaurant.createdAt && (
                      <p className="mt-4 text-xs text-stone-400">
                        Registered:{" "}
                        {new Date(
                          restaurant.createdAt
                        ).toLocaleDateString("en-GB")}
                      </p>
                    )}

                    {/* =================================
                        APPROVE / REJECT ACTIONS
                        ================================= */}

                    {restaurant.status === "pending" && (
                      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-stone-100 pt-5">

                        {/* Approve Button */}
                        <button
                          type="button"
                          disabled={actionId !== null}
                          onClick={() =>
                            void updateRestaurantStatus(
                              restaurant,
                              "approved"
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700 disabled:opacity-50"
                        >
                          <CheckCircle2 size={17} />

                          {isUpdating
                            ? "Updating..."
                            : "Approve"}
                        </button>

                        {/* Reject Button */}
                        <button
                          type="button"
                          disabled={actionId !== null}
                          onClick={() =>
                            void updateRestaurantStatus(
                              restaurant,
                              "rejected"
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                        >
                          <XCircle size={17} />

                          {isUpdating
                            ? "Updating..."
                            : "Reject"}
                        </button>

                      </div>
                    )}

                  </article>
                );
              })}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}