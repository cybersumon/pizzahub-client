
"use client";

// ============================================
// PIZZAHUB — CUSTOMER MY ORDERS DASHBOARD
// LESSON 19 — STEP 3
// ============================================

// React Hooks।
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

// Next.js Components।
import Image from "next/image";
import Link from "next/link";

// Lucide Icons।
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  MessageSquare,
  RefreshCw,
  Search,
  ShoppingBag,
  Store,
  XCircle,
  Ban,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  PackageCheck,
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

// Order-এর সম্ভাব্য Status।
type OrderStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled";

// Filter করার জন্য All Status।
type OrderFilter = "all" | OrderStatus;

// Backend থেকে আসা Order Data।
interface CustomerOrder {
  id: string;

  customerId: string;
  vendorId: string;

  restaurantId: string;
  menuItemId: string;

  itemName: string;
  itemImage: string;
  itemPrice: number;
  restaurantName: string;

  deliveryDate: string;
  deliveryAddress: string;
  message: string;

  status: OrderStatus;

  createdAt: string;
  updatedAt: string;

  reviewedAt?: string | null;
  cancelledAt?: string | null;
}

// GET /api/orders/my Response।
interface OrdersApiResponse {
  success: boolean;
  message?: string;
  data?: CustomerOrder[];
  total?: number;
}

// PATCH /api/orders/:id/cancel Response।
interface CancelOrderResponse {
  success: boolean;
  message?: string;
  data?: CustomerOrder;
}

// ============================================
// HELPER — DATE FORMATTING
// ============================================

// Database Date-কে সহজভাবে দেখানো।
function formatDate(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  });
}

// Delivery Date YYYY-MM-DD ফরম্যাটে আসবে।
function formatDeliveryDate(value: string): string {
  if (!value) return "—";

  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

// বাংলাদেশি টাকা দেখানো।
function formatPrice(price: number): string {
  return `৳${Number(price || 0).toLocaleString("en-BD")}`;
}

// ============================================
// HELPER — STATUS CONFIGURATION
// ============================================

// প্রতিটি Status-এর UI Color এবং Label।
function getStatusStyle(status: OrderStatus) {
  switch (status) {
    case "accepted":
      return {
        label: "Accepted",
        badge:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        icon: CheckCircle2,
        description:
          "Your restaurant has accepted the order.",
      };

    case "rejected":
      return {
        label: "Rejected",
        badge: "border-red-200 bg-red-50 text-red-700",
        icon: XCircle,
        description:
          "Your restaurant has rejected the order.",
      };

    case "cancelled":
      return {
        label: "Cancelled",
        badge:
          "border-stone-200 bg-stone-100 text-stone-600",
        icon: Ban,
        description: "You cancelled this order.",
      };

    default:
      return {
        label: "Pending",
        badge:
          "border-amber-200 bg-amber-50 text-amber-700",
        icon: Clock3,
        description:
          "Waiting for the restaurant to review your order.",
      };
  }
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function CustomerOrdersPage() {
  // ==========================================
  // STATES
  // ==========================================

  // Customer-এর সব Orders।
  const [orders, setOrders] = useState<CustomerOrder[]>([]);

  // API Loading State।
  const [loading, setLoading] = useState(true);

  // Refresh Button-এর জন্য State।
  const [refreshKey, setRefreshKey] = useState(0);

  // Search Input।
  const [search, setSearch] = useState("");

  // Order Status Filter।
  const [filter, setFilter] =
    useState<OrderFilter>("all");

  // Error এবং Success Messages।
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // কোন Order-এর Details খোলা আছে।
  const [expandedOrderId, setExpandedOrderId] =
    useState<string | null>(null);

  // কোন Order Cancel করা হচ্ছে।
  const [cancellingId, setCancellingId] =
    useState<string | null>(null);

  // Cancel Confirmation-এর Order ID।
  const [confirmCancelId, setConfirmCancelId] =
    useState<string | null>(null);

  // ==========================================
  // FETCH CUSTOMER ORDERS
  // ==========================================

  useEffect(() => {
    // Component Unmount হলে Request Cancel।
    const controller = new AbortController();

    async function fetchOrders() {
      try {
        // Better Auth Cookie সহ API Request।
        const response = await fetch(
          `${API_URL}/api/orders/my`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const result: OrdersApiResponse =
          await response.json();

        // API Error Handling।
        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Unable to load your orders."
          );
        }

        // Request Cancel না হলে Data Update।
        if (!controller.signal.aborted) {
          setOrders(
            Array.isArray(result.data)
              ? result.data
              : []
          );

          setError("");
          setLoading(false);
        }
      } catch (err) {
        // Abort Error উপেক্ষা করা।
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to connect to PizzaHub server."
        );

        setLoading(false);
      }
    }

    void fetchOrders();

    // Cleanup।
    return () => {
      controller.abort();
    };
  }, [refreshKey]);

  // ==========================================
  // REFRESH ORDERS
  // ==========================================

  const refreshOrders = useCallback(() => {
    // নতুন API Request শুরু।
    setLoading(true);
    setError("");

    // useEffect আবার চালানো।
    setRefreshKey((previous) => previous + 1);
  }, []);

  // ==========================================
  // CANCEL PENDING ORDER
  // ==========================================

  async function cancelOrder(orderId: string) {
    // একসঙ্গে একাধিক Cancel Request বন্ধ।
    if (cancellingId !== null) return;

    setCancellingId(orderId);
    setError("");
    setSuccess("");

    try {
      // শুধু Pending Order Cancel করা যাবে।
      const response = await fetch(
        `${API_URL}/api/orders/${orderId}/cancel`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result: CancelOrderResponse =
        await response.json();

      // Backend Error Handle।
      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to cancel this order."
        );
      }

      // Local State Update।
      // এতে পুরো Page Reload করতে হবে না।
      if (result.data) {
        const updatedOrder = result.data;

        setOrders((previous) =>
          previous.map((order) =>
            order.id === orderId
              ? updatedOrder
              : order
          )
        );
      } else {
        // Backend Updated Order না দিলে Refetch।
        refreshOrders();
      }

      // Confirmation Panel বন্ধ।
      setConfirmCancelId(null);

      // Success Message।
      setSuccess(
        "Your order has been cancelled successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to cancel the order."
      );
    } finally {
      setCancellingId(null);
    }
  }

  // ==========================================
  // SUMMARY STATISTICS
  // ==========================================

  const stats = useMemo(() => {
    return {
      total: orders.length,

      pending: orders.filter(
        (order) => order.status === "pending"
      ).length,

      accepted: orders.filter(
        (order) => order.status === "accepted"
      ).length,

      rejected: orders.filter(
        (order) => order.status === "rejected"
      ).length,

      cancelled: orders.filter(
        (order) => order.status === "cancelled"
      ).length,
    };
  }, [orders]);

  // ==========================================
  // SEARCH + STATUS FILTER
  // ==========================================

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return orders.filter((order) => {
      // Selected Status Match।
      const matchesStatus =
        filter === "all" || order.status === filter;

      // Pizza, Restaurant অথবা Order ID Search।
      const matchesSearch =
        !keyword ||
        order.itemName.toLowerCase().includes(keyword) ||
        order.restaurantName
          .toLowerCase()
          .includes(keyword) ||
        order.id.toLowerCase().includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [orders, search, filter]);

  // ==========================================
  // EXPAND / COLLAPSE ORDER DETAILS
  // ==========================================

  function toggleDetails(orderId: string) {
    setExpandedOrderId((previous) =>
      previous === orderId ? null : orderId
    );
  }

  // ==========================================
  // MAIN PAGE UI
  // ==========================================

  return (
    <main className="min-h-screen bg-[#FFF9F2] px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl">

        {/* =====================================
            PAGE HEADER
            ===================================== */}

        <div className="mb-8">

          {/* Browse Menu-তে ফিরে যাওয়ার Link। */}
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#D62828] transition hover:text-red-700"
          >
            <ArrowLeft size={17} />
            Back to Browse Menu
          </Link>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">

            <div>
              <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#D62828]">
                PizzaHub Customer Dashboard
              </p>

              <h1 className="text-3xl font-extrabold tracking-tight text-[#2A1B15] sm:text-4xl">
                My Orders
              </h1>

              <p className="mt-2 text-sm leading-6 text-stone-500">
                Track your pizza orders, review delivery
                information and manage pending requests.
              </p>
            </div>

            {/* Refresh Button। */}
            <button
              type="button"
              onClick={() => {
                setSuccess("");
                refreshOrders();
              }}
              disabled={loading || cancellingId !== null}
              className="inline-flex items-center gap-2 rounded-xl border border-orange-100 bg-white px-5 py-3 text-sm font-bold text-stone-700 shadow-sm transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />

              {loading ? "Loading..." : "Refresh Orders"}
            </button>

          </div>
        </div>

        {/* =====================================
            ORDER SUMMARY CARDS
            ===================================== */}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">

          {[
            {
              label: "Total Orders",
              value: stats.total,
              icon: ShoppingBag,
              color: "text-[#D62828]",
            },
            {
              label: "Pending",
              value: stats.pending,
              icon: Clock3,
              color: "text-amber-600",
            },
            {
              label: "Accepted",
              value: stats.accepted,
              icon: CheckCircle2,
              color: "text-emerald-600",
            },
            {
              label: "Rejected",
              value: stats.rejected,
              icon: XCircle,
              color: "text-red-600",
            },
            {
              label: "Cancelled",
              value: stats.cancelled,
              icon: Ban,
              color: "text-stone-500",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"
            >
              <stat.icon
                size={25}
                className={stat.color}
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
            MAIN ORDERS SECTION
            ===================================== */}

        <section className="mt-8 rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">

          {/* SECTION HEADER। */}
          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>
              <h2 className="text-xl font-extrabold text-[#2A1B15]">
                Order History
              </h2>

              <p className="mt-1 text-sm text-stone-500">
                All your recent and previous pizza orders.
              </p>
            </div>

            {/* STATUS FILTER। */}
            <div className="flex flex-wrap gap-2">

              {(
                [
                  ["all", "All Orders"],
                  ["pending", "Pending"],
                  ["accepted", "Accepted"],
                  ["rejected", "Rejected"],
                  ["cancelled", "Cancelled"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setFilter(value);
                    setConfirmCancelId(null);
                  }}
                  className={
                    filter === value
                      ? "rounded-full bg-[#D62828] px-4 py-2.5 text-xs font-bold text-white"
                      : "rounded-full bg-stone-100 px-4 py-2.5 text-xs font-bold text-stone-600 transition hover:bg-stone-200"
                  }
                >
                  {label}
                </button>
              ))}

            </div>
          </div>

          {/* ===================================
              SEARCH
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
              placeholder="Search pizza, restaurant or order ID..."
              className="h-12 w-full rounded-xl border border-stone-200 bg-white pl-11 pr-4 text-sm text-stone-800 outline-none transition focus:border-[#D62828] focus:ring-1 focus:ring-[#D62828]"
            />
          </div>

          {/* ===================================
              SUCCESS MESSAGE
              =================================== */}

          {success && (
            <div
              role="status"
              className="mt-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700"
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
              className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>{error}</span>
            </div>
          )}

          {/* ===================================
              LOADING STATE
              =================================== */}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">

              <Loader2
                size={32}
                className="animate-spin text-[#D62828]"
              />

              <p className="mt-4 text-sm font-medium text-stone-500">
                Loading your orders...
              </p>

            </div>
          ) : error && orders.length === 0 ? (

            // API Failure State।
            <div className="py-16 text-center">

              <AlertCircle
                size={42}
                className="mx-auto text-red-300"
              />

              <h3 className="mt-4 text-xl font-bold text-stone-900">
                Unable to Load Orders
              </h3>

              <button
                type="button"
                onClick={refreshOrders}
                className="mt-5 rounded-full bg-[#D62828] px-6 py-3 text-sm font-bold text-white hover:bg-red-700"
              >
                Try Again
              </button>

            </div>
          ) : filteredOrders.length === 0 ? (

            // =================================
            // EMPTY STATE
            // =================================

            <div className="py-16 text-center">

              <ShoppingBag
                size={46}
                className="mx-auto text-orange-300"
              />

              <h3 className="mt-4 text-xl font-extrabold text-stone-900">
                {orders.length === 0
                  ? "No Orders Yet"
                  : "No Matching Orders"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
                {orders.length === 0
                  ? "You haven't placed an order yet. Explore our delicious menu and find your next favorite pizza."
                  : "No orders match your current search or status filter."}
              </p>

              {orders.length === 0 && (
                <Link
                  href="/menu"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#D62828] px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                >
                  Browse Pizza Menu
                  <ArrowRight size={17} />
                </Link>
              )}

            </div>
          ) : (

            // =================================
            // CUSTOMER ORDER CARDS
            // =================================

            <div className="mt-6 space-y-5">

              {filteredOrders.map((order) => {
                // প্রতিটি Order-এর Status Design।
                const statusStyle = getStatusStyle(
                  order.status
                );

                const StatusIcon = statusStyle.icon;

                // Details বর্তমানে খোলা আছে কি না।
                const isExpanded =
                  expandedOrderId === order.id;

                // Cancel Confirmation দেখাবে কি না।
                const isConfirming =
                  confirmCancelId === order.id;

                // এই Order Cancel হচ্ছে কি না।
                const isCancelling =
                  cancellingId === order.id;

                return (
                  <article
                    key={order.id}
                    className="overflow-hidden rounded-2xl border border-orange-100 bg-white transition hover:border-orange-200 hover:shadow-sm"
                  >

                    {/* ===========================
                        ORDER MAIN INFORMATION
                        =========================== */}

                    <div className="p-4 sm:p-5">

                      <div className="flex flex-col gap-5 md:flex-row">

                        {/* FOOD IMAGE */}
                        <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-xl bg-orange-50 md:h-35 md:w-40">

                          {order.itemImage ? (
                            <Image
                              src={order.itemImage}
                              alt={order.itemName}
                              fill
                              sizes="(max-width: 768px) 100vw, 160px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <ShoppingBag
                                size={34}
                                className="text-orange-300"
                              />
                            </div>
                          )}

                        </div>

                        {/* ORDER DETAILS */}
                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-start justify-between gap-3">

                            <div className="min-w-0">

                              <h3 className="text-lg font-extrabold text-[#2A1B15] sm:text-xl">
                                {order.itemName}
                              </h3>

                              <p className="mt-2 flex items-center gap-2 text-sm text-stone-500">
                                <Store
                                  size={16}
                                  className="shrink-0 text-[#D62828]"
                                />
                                {order.restaurantName}
                              </p>

                            </div>

                            {/* ORDER STATUS BADGE */}
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${statusStyle.badge}`}
                            >
                              <StatusIcon size={15} />
                              {statusStyle.label}
                            </span>

                          </div>

                          {/* PRICE */}
                          <p className="mt-4 text-2xl font-extrabold text-[#D62828]">
                            {formatPrice(order.itemPrice)}
                          </p>

                          {/* DELIVERY & ORDER DATE */}
                          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-stone-500">

                            <span className="inline-flex items-center gap-2">
                              <CalendarDays size={15} />
                              Delivery:{" "}
                              {formatDeliveryDate(
                                order.deliveryDate
                              )}
                            </span>

                            <span className="inline-flex items-center gap-2">
                              <Clock3 size={15} />
                              Ordered:{" "}
                              {formatDate(order.createdAt)}
                            </span>

                          </div>

                        </div>
                      </div>

                      {/* ===========================
                          ACTION BUTTONS
                          =========================== */}

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">

                        <button
                          type="button"
                          onClick={() =>
                            toggleDetails(order.id)
                          }
                          aria-expanded={isExpanded}
                          className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2.5 text-sm font-bold text-stone-700 transition hover:bg-stone-50"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp size={17} />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <ChevronDown size={17} />
                              View Details
                            </>
                          )}
                        </button>

                        {/* শুধু Pending Order Cancel। */}
                        {order.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmCancelId(
                                isConfirming
                                  ? null
                                  : order.id
                              );
                              setError("");
                              setSuccess("");
                            }}
                            disabled={cancellingId !== null}
                            className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                          >
                            <XCircle size={17} />
                            Cancel Order
                          </button>
                        )}

                      </div>

                      {/* ===========================
                          CANCEL CONFIRMATION
                          =========================== */}

                      {isConfirming &&
                        order.status === "pending" && (
                          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">

                            <p className="text-sm font-extrabold text-stone-900">
                              Cancel this order?
                            </p>

                            <p className="mt-2 text-xs leading-5 text-stone-600">
                              The restaurant will no longer
                              be able to accept this pending
                              order.
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">

                              <button
                                type="button"
                                onClick={() => {
                                  void cancelOrder(order.id);
                                }}
                                disabled={isCancelling}
                                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                              >
                                {isCancelling ? (
                                  <Loader2
                                    size={15}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Ban size={15} />
                                )}

                                {isCancelling
                                  ? "Cancelling..."
                                  : "Confirm Cancel"}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmCancelId(null)
                                }
                                disabled={isCancelling}
                                className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-stone-600 transition hover:bg-stone-50 disabled:opacity-50"
                              >
                                Keep Order
                              </button>

                            </div>
                          </div>
                        )}

                    </div>

                    {/* ===========================
                        EXPANDED ORDER DETAILS
                        =========================== */}

                    {isExpanded && (
                      <div className="border-t border-orange-100 bg-[#FFFCF8] p-4 sm:p-6">

                        <div className="grid gap-5 md:grid-cols-2">

                          {/* DELIVERY INFORMATION */}
                          <div className="rounded-2xl border border-orange-100 bg-white p-5">

                            <h4 className="flex items-center gap-2 text-sm font-extrabold text-stone-900">
                              <MapPin
                                size={18}
                                className="text-[#D62828]"
                              />
                              Delivery Information
                            </h4>

                            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-stone-400">
                              Delivery Address
                            </p>

                            <p className="mt-1 wrap-break-word text-sm leading-6 text-stone-700">
                              {order.deliveryAddress}
                            </p>

                            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-stone-400">
                              Delivery Date
                            </p>

                            <p className="mt-1 text-sm font-bold text-stone-700">
                              {formatDeliveryDate(
                                order.deliveryDate
                              )}
                            </p>

                            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-stone-400">
                              Special Instructions
                            </p>

                            <p className="mt-1 flex items-start gap-2 wrap-break-word text-sm leading-6 text-stone-700">
                              <MessageSquare
                                size={16}
                                className="mt-1 shrink-0 text-stone-400"
                              />

                              {order.message ||
                                "No special instructions."}
                            </p>

                          </div>

                          {/* ORDER STATUS TIMELINE */}
                          <div className="rounded-2xl border border-orange-100 bg-white p-5">

                            <h4 className="flex items-center gap-2 text-sm font-extrabold text-stone-900">
                              <PackageCheck
                                size={18}
                                className="text-[#D62828]"
                              />
                              Order Timeline
                            </h4>

                            {/* ORDER PLACED */}
                            <div className="mt-5 flex items-start gap-3">

                              <CheckCircle2
                                size={20}
                                className="shrink-0 text-emerald-600"
                              />

                              <div>
                                <p className="text-sm font-bold text-stone-900">
                                  Order Placed
                                </p>

                                <p className="mt-1 text-xs text-stone-500">
                                  {formatDate(
                                    order.createdAt
                                  )}
                                </p>
                              </div>

                            </div>

                            {/* ORDER REVIEW STATUS */}
                            <div className="ml-2.5 h-7 border-l-2 border-dashed border-stone-200" />

                            <div className="flex items-start gap-3">

                              <StatusIcon
                                size={20}
                                className={
                                  order.status === "accepted"
                                    ? "shrink-0 text-emerald-600"
                                    : order.status === "pending"
                                      ? "shrink-0 text-amber-500"
                                      : order.status === "rejected"
                                        ? "shrink-0 text-red-600"
                                        : "shrink-0 text-stone-500"
                                }
                              />

                              <div>
                                <p className="text-sm font-bold text-stone-900">
                                  {statusStyle.label}
                                </p>

                                <p className="mt-1 text-xs leading-5 text-stone-500">
                                  {statusStyle.description}
                                </p>

                                {order.reviewedAt && (
                                  <p className="mt-1 text-xs text-stone-400">
                                    Reviewed:{" "}
                                    {formatDate(
                                      order.reviewedAt
                                    )}
                                  </p>
                                )}

                                {order.cancelledAt && (
                                  <p className="mt-1 text-xs text-stone-400">
                                    Cancelled:{" "}
                                    {formatDate(
                                      order.cancelledAt
                                    )}
                                  </p>
                                )}
                              </div>

                            </div>

                          </div>

                        </div>

                        {/* ORDER IDENTIFIER */}
                        <div className="mt-5 rounded-xl bg-orange-50 px-4 py-3 text-xs text-stone-500">
                          <span className="font-bold text-stone-700">
                            Order ID:
                          </span>{" "}
                          <span className="wrap-break-word">
                            {order.id}
                          </span>
                        </div>

                      </div>
                    )}

                  </article>
                );
              })}

              {/* RESULTS COUNT */}
              <div className="border-t border-stone-100 pt-5 text-sm text-stone-500">
                Showing{" "}
                <span className="font-bold text-stone-800">
                  {filteredOrders.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-stone-800">
                  {orders.length}
                </span>{" "}
                orders.
              </div>

            </div>
          )}

        </section>

      </div>
    </main>
  );
}
