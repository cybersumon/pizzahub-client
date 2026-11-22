
"use client";

// React Hooks।
import { useEffect, useMemo, useState } from "react";

// Next.js Navigation।
import Link from "next/link";

// Reusable Block / Unblock Component।
import UserBlockButton from "@/components/admin/UserBlockButton";

// Icons।
import {
  Users,
  Store,
  ShieldCheck,
  Search,
  RefreshCw,
  ArrowLeft,
  Mail,
  CalendarDays,
  Ban,
  CheckCircle2,
} from "lucide-react";

// ============================================
// BACKEND CONFIGURATION
// ============================================

// Express Backend API URL।
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:7000";

// ============================================
// TYPES
// ============================================

type UserRole = "customer" | "vendor" | "admin";

// Role Filter-এর Options।
type FilterType = "all" | UserRole;

// Restaurant Information।
interface UserRestaurant {
  id: string;
  name: string;
  status: "pending" | "approved" | "rejected";
  plan: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified?: boolean;
  createdAt?: string;
  role: UserRole;
  isBlocked?: boolean;

  restaurant: UserRestaurant | null;
}

// GET /api/admin/users Response।
interface UsersApiResponse {
  success: boolean;
  message?: string;
  data?: AdminUser[];
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getRoleClass(role: UserRole) {
  switch (role) {
    case "admin":
      return "bg-purple-50 text-purple-700";

    case "vendor":
      return "bg-orange-50 text-orange-700";

    default:
      return "bg-blue-50 text-blue-700";
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case "approved":
      return "bg-green-50 text-green-700";

    case "rejected":
      return "bg-red-50 text-red-700";

    default:
      return "bg-amber-50 text-amber-700";
  }
}

// ============================================
// ADMIN USERS PAGE
// ============================================

export default function AdminUsersPage() {
  // ==========================================
  // STATES
  // ==========================================

  const [users, setUsers] = useState<AdminUser[]>([]);

  // Search Input।
  const [search, setSearch] = useState("");

  // Role Filter।
  const [filter, setFilter] =
    useState<FilterType>("all");

  // API Loading State।
  const [loading, setLoading] = useState(true);

  // API Error Message।
  const [error, setError] = useState("");

  // Refresh trigger।
  const [refreshKey, setRefreshKey] = useState(0);

  const [success, setSuccess] = useState("");

  // ==========================================
  // FETCH USERS FROM BACKEND
  // ==========================================

  useEffect(() => {
    const controller = new AbortController();

    async function fetchUsers() {
      try {
        const response = await fetch(
          `${API_URL}/api/admin/users`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        // JSON Response।
        const result: UsersApiResponse =
          await response.json();

        // Backend Error Handle।
        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load users."
          );
        }

        if (!controller.signal.aborted) {
          setUsers(
            Array.isArray(result.data)
              ? result.data
              : []
          );

          setError("");
          setLoading(false);
        }
      } catch (err) {
        // Cancelled Request Ignore।
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to connect to PizzaHub server."
        );

        setUsers([]);
        setLoading(false);
      }
    }

    // Async Fetch start
    void fetchUsers();

    // Cleanup।
    return () => {
      controller.abort();
    };
  }, [refreshKey]);

  // ==========================================
  // REFRESH USERS
  // ==========================================

  function refreshUsers() {
    setLoading(true);
    setError("");

    setRefreshKey((previous) => previous + 1);
  }

  // ==========================================
  // AFTER BLOCK / UNBLOCK SUCCESS
  // ==========================================

  function handleUserStatusUpdated() {
    // Success Notification।
    setSuccess("User account status updated successfully.");

    refreshUsers();
  }

  // ==========================================
  // USER STATISTICS
  // ==========================================

  // মোট Registered Users।
  const totalUsers = users.length;

  // Customer Count।
  const totalCustomers = users.filter(
    (user) => user.role === "customer"
  ).length;

  // Vendor Count।
  const totalVendors = users.filter(
    (user) => user.role === "vendor"
  ).length;

  // Admin Count।
  const totalAdmins = users.filter(
    (user) => user.role === "admin"
  ).length;

  const totalBlocked = users.filter(
    (user) => user.isBlocked === true
  ).length;

  // ==========================================
  // SEARCH + ROLE FILTER
  // ==========================================

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return users.filter((user) => {
      // Selected Role match।
      const matchesRole =
        filter === "all" || user.role === filter;

      // Name / Email / Restaurant Search।
      const matchesSearch =
        !keyword ||
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        (user.restaurant?.name ?? "")
          .toLowerCase()
          .includes(keyword);

      return matchesRole && matchesSearch;
    });
  }, [users, search, filter]);

  // ==========================================
  // USER INTERFACE
  // ==========================================

  return (
    <main className="min-h-screen bg-[#FFF9F2] px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl">

        {/* =====================================
            PAGE HEADER
            ===================================== */}

        <div className="mb-8">

          {/* Restaurant Approvals Navigation */}
          <Link
            href="/admin/restaurants"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#D62828] transition hover:text-red-700"
          >
            <ArrowLeft size={17} />
            Restaurant Approvals
          </Link>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">

            <div>
              <h1 className="text-3xl font-extrabold text-stone-900 sm:text-4xl">
                User Management
              </h1>

              <p className="mt-2 text-sm text-stone-500">
                View and manage registered customers,
                vendors and administrators.
              </p>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => {
                setSuccess("");
                refreshUsers();
              }}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-bold text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />

              {loading ? "Loading..." : "Refresh"}
            </button>

          </div>
        </div>

        {/* =====================================
            SUMMARY CARDS
            ===================================== */}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">

          {[
            {
              label: "Total Users",
              value: totalUsers,
              icon: Users,
            },
            {
              label: "Customers",
              value: totalCustomers,
              icon: Users,
            },
            {
              label: "Vendors",
              value: totalVendors,
              icon: Store,
            },
            {
              label: "Admins",
              value: totalAdmins,
              icon: ShieldCheck,
            },
            {
              label: "Blocked Users",
              value: totalBlocked,
              icon: Ban,
            },
          ].map((stat) => (
            <div
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

              <p className="mt-2 text-3xl font-extrabold text-stone-900">
                {loading ? "—" : stat.value}
              </p>
            </div>
          ))}

        </div>

        {/* =====================================
            USERS MANAGEMENT SECTION
            ===================================== */}

        <section className="mt-8 rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">

          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>
              <h2 className="text-xl font-extrabold text-stone-900">
                Registered Users
              </h2>

              <p className="mt-1 text-sm text-stone-500">
                Search accounts, filter by role and manage access.
              </p>
            </div>

            {/* Existing Role Filter */}
            <div className="flex flex-wrap gap-2">

              {(
                [
                  ["all", "All Users"],
                  ["customer", "Customers"],
                  ["vendor", "Vendors"],
                  ["admin", "Admins"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={
                    filter === value
                      ? "rounded-full bg-[#D62828] px-4 py-2 text-xs font-bold text-white"
                      : "rounded-full bg-stone-100 px-4 py-2 text-xs font-bold text-stone-600 transition hover:bg-stone-200"
                  }
                >
                  {label}
                </button>
              ))}

            </div>
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
              placeholder="Search by name, email or restaurant..."
              className="h-12 w-full rounded-xl border border-stone-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#D62828] focus:ring-1 focus:ring-[#D62828]"
            />

          </div>

          {/* ===================================
              SUCCESS MESSAGE
              =================================== */}

          {success && (
            <div
              role="status"
              className="mt-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700"
            >
              <CheckCircle2 size={18} />
              {success}
            </div>
          )}

          {/* ===================================
              ERROR MESSAGE
              =================================== */}

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* ===================================
              LOADING / EMPTY / TABLE
              =================================== */}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">

              <RefreshCw
                size={27}
                className="animate-spin text-[#D62828]"
              />

              <p className="mt-4 text-sm font-medium text-stone-500">
                Loading registered users...
              </p>

            </div>
          ) : error ? null : filteredUsers.length === 0 ? (

            // Empty State।
            <div className="py-16 text-center">

              <Users
                size={43}
                className="mx-auto text-stone-300"
              />

              <h3 className="mt-4 text-xl font-extrabold text-stone-900">
                No Users Found
              </h3>

              <p className="mt-2 text-sm text-stone-500">
                No accounts match your current search or filter.
              </p>

            </div>
          ) : (

            // =================================
            // USERS TABLE
            // =================================

            <div className="mt-6 overflow-x-auto">

              <table className="w-full min-w-250 text-left text-sm">

                {/* Table Header */}
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-stone-600">

                    <th className="p-4 font-bold">
                      User
                    </th>

                    <th className="p-4 font-bold">
                      Role
                    </th>

                    <th className="p-4 font-bold">
                      Restaurant
                    </th>

                    <th className="p-4 font-bold">
                      Restaurant Status
                    </th>

                    <th className="p-4 font-bold">
                      Account Status
                    </th>

                    <th className="p-4 font-bold">
                      Joined
                    </th>
                    <th className="p-4 font-bold">
                      Actions
                    </th>

                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>

                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-stone-100 align-top transition hover:bg-orange-50/40"
                    >

                      {/* USER NAME + EMAIL */}
                      <td className="p-4">

                        <p className="font-bold text-stone-900">
                          {user.name}
                        </p>

                        <p className="mt-1 flex items-center gap-1.5 break-all text-xs text-stone-500">
                          <Mail size={13} className="shrink-0" />
                          {user.email}
                        </p>

                      </td>

                      {/* ROLE BADGE */}
                      <td className="p-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold capitalize ${getRoleClass(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>

                      </td>

                      {/* RESTAURANT NAME */}
                      <td className="p-4">

                        {user.restaurant ? (
                          <div>
                            <p className="font-semibold text-stone-800">
                              {user.restaurant.name}
                            </p>

                            <p className="mt-1 text-xs capitalize text-stone-500">
                              {user.restaurant.plan} Plan
                            </p>
                          </div>
                        ) : (
                          <span className="text-stone-400">
                            —
                          </span>
                        )}

                      </td>

                      {/* RESTAURANT STATUS */}
                      <td className="p-4">

                        {user.restaurant ? (
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold capitalize ${getStatusClass(
                              user.restaurant.status
                            )}`}
                          >
                            {user.restaurant.status}
                          </span>
                        ) : (
                          <span className="text-stone-400">
                            —
                          </span>
                        )}

                      </td>

                      {/* ===================================
                          ACCOUNT STATUS — NEW
                          =================================== */}

                      <td className="p-4">

                        {user.isBlocked === true ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">
                            <Ban size={13} />
                            Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                            <CheckCircle2 size={13} />
                            Active
                          </span>
                        )}

                      </td>

                      {/* JOIN DATE */}
                      <td className="p-4">

                        <div className="flex items-center gap-2 text-stone-500">
                          <CalendarDays size={15} className="shrink-0" />

                          <span>
                            {user.createdAt
                              ? new Date(
                                  user.createdAt
                                ).toLocaleDateString("en-GB")
                              : "—"}
                          </span>
                        </div>

                      </td>

                      {/* ===================================
                          BLOCK / UNBLOCK BUTTON — NEW
                          =================================== */}

                      <td className="p-4">

                        <UserBlockButton
                          userId={user.id}
                          userName={user.name}
                          isBlocked={user.isBlocked === true}
                          role={user.role}
                          onUpdated={handleUserStatusUpdated}
                        />

                      </td>

                    </tr>
                  ))}

                </tbody>
              </table>

              {/* Table Footer */}
              <div className="mt-5 border-t border-stone-100 pt-4 text-sm text-stone-500">
                Showing{" "}
                <span className="font-bold text-stone-800">
                  {filteredUsers.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-stone-800">
                  {totalUsers}
                </span>{" "}
                registered users.
              </div>

            </div>
          )}

        </section>

      </div>
    </main>
  );
}
