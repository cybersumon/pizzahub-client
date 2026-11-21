"use client";

// React hooks।
import { useCallback, useEffect, useState } from "react";

// Next.js navigation।
import Link from "next/link";

// UI icons।
import {
  CheckCircle2,
  Clock3,
  Store,
  XCircle,
} from "lucide-react";

// Better Auth session।
import { authClient } from "@/lib/auth-client";

// Express backend URL।
const API_URL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
  "http://localhost:7000";

// Restaurant document-এর frontend type।
interface Restaurant {
  _id: string;
  ownerId: string;
  name: string;
  address: string;
  phone: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  plan: string;
}

// Admin API-এর response type।
interface RestaurantListResponse {
  success: boolean;
  message?: string;
  data?: Restaurant[];
}

// Admin Restaurant Approval page।
export default function AdminRestaurantsPage() {
  // Current Better Auth session।
  const { data: session, isPending } = authClient.useSession();

  // API-এর restaurant list।
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  // Page state।
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // =======================================
  // LOAD PENDING RESTAURANTS
  // =======================================
  const loadRestaurants = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Server নিজে Admin permission যাচাই করবে।
      const response = await fetch(
        `${API_URL}/api/admin/restaurants?status=pending`,
        {
          credentials: "include",
        }
      );

      const result: RestaurantListResponse =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load restaurants."
        );
      }

      setRestaurants(result.data ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to server."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // User logged-in থাকলে list load করব।
  useEffect(() => {
    if (!isPending && session?.user) {
      void loadRestaurants();
    } else if (!isPending) {
      setLoading(false);
    }
  }, [isPending, session?.user, loadRestaurants]);

  // =======================================
  // APPROVE / REJECT ACTION
  // =======================================
  async function reviewRestaurant(
    restaurantId: string,
    status: "approved" | "rejected"
  ) {
    setUpdatingId(restaurantId);
    setError("");
    setMessage("");

    try {
      // Admin authorization backend-এ হবে।
      const response = await fetch(
        `${API_URL}/api/admin/restaurants/${restaurantId}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const result: {
        success: boolean;
        message?: string;
      } = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to update restaurant."
        );
      }

      // Successful review-এর পরে pending list থেকে সরাব।
      setRestaurants((current) =>
        current.filter((item) => item._id !== restaurantId)
      );

      setMessage(
        result.message || "Restaurant updated successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update restaurant."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  // Session load হওয়ার সময়।
  if (isPending) {
    return (
      <main className="p-8 text-center">
        Checking your session...
      </main>
    );
  }

  // Not logged in।
  if (!session?.user) {
    return (
      <main className="min-h-screen bg-[#FFF9F2] p-8 text-center">
        <h1 className="text-2xl font-bold">
          Please Sign In
        </h1>

        <Link href="/sign-in" className="mt-4 inline-block text-red-600">
          Sign In
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF9F2] px-4 py-10">
      <div className="mx-auto max-w-5xl">

        {/* Admin dashboard heading। */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-lg font-extrabold text-[#D62828]"
          >
            PizzaHub
          </Link>

          <h1 className="mt-4 text-3xl font-extrabold text-stone-900">
            Restaurant Approvals
          </h1>

          <p className="mt-2 text-stone-500">
            Review and manage pending restaurant applications.
          </p>
        </div>

        {/* Success message। */}
        {message && (
          <div role="status" className="mb-5 rounded-2xl bg-green-50 p-4 text-green-800">
            {message}
          </div>
        )}

        {/* API permission অথবা network error। */}
        {error && (
          <div role="alert" className="mb-5 rounded-2xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Loading state। */}
        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center">
            Loading restaurants...
          </div>
        ) : restaurants.length === 0 && !error ? (
          // Pending restaurant না থাকলে।
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
            <CheckCircle2
              size={38}
              className="mx-auto text-green-600"
            />

            <h2 className="mt-4 text-xl font-bold">
              All caught up!
            </h2>

            <p className="mt-2 text-stone-500">
              No pending restaurant applications.
            </p>
          </div>
        ) : (
          // Pending restaurant cards।
          <div className="grid gap-5">
            {restaurants.map((restaurant) => (
              <article
                key={restaurant._id}
                className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">

                  <div>
                    <div className="flex items-center gap-2">
                      <Store size={21} className="text-[#D62828]" />

                      <h2 className="text-xl font-extrabold text-stone-900">
                        {restaurant.name}
                      </h2>
                    </div>

                    <p className="mt-3 text-sm text-stone-600">
                      {restaurant.address}
                    </p>

                    <p className="mt-1 text-sm text-stone-600">
                      {restaurant.phone}
                    </p>

                    {restaurant.description && (
                      <p className="mt-3 text-sm text-stone-500">
                        {restaurant.description}
                      </p>
                    )}
                  </div>

                  {/* Pending status badge। */}
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-2 text-xs font-bold text-amber-800">
                    <Clock3 size={14} />
                    Pending
                  </span>
                </div>

                {/* Admin approval buttons। */}
                <div className="mt-6 flex flex-wrap gap-3 border-t border-stone-100 pt-5">

                  <button
                    type="button"
                    disabled={updatingId !== null}
                    onClick={() =>
                      void reviewRestaurant(
                        restaurant._id,
                        "approved"
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle2 size={17} />
                    Approve
                  </button>

                  <button
                    type="button"
                    disabled={updatingId !== null}
                    onClick={() => {
                      // Reject করার আগে confirmation।
                      if (
                        window.confirm(
                          `Reject ${restaurant.name}?`
                        )
                      ) {
                        void reviewRestaurant(
                          restaurant._id,
                          "rejected"
                        );
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
                  >
                    <XCircle size={17} />
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}