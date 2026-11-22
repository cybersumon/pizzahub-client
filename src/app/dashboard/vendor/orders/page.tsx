
"use client";

// ============================================
// PIZZAHUB — VENDOR INCOMING ORDERS
// LESSON 19 — STEP 5C
// CUSTOMER CONTACT INTEGRATION
// ============================================

// React Hooks।
import { useEffect, useMemo, useState } from "react";

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
  MessageSquareText,
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
  ClipboardList,
  UserRound,
  Mail,
  Phone,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react";

// ============================================
// BACKEND CONFIGURATION
// ============================================

// Express Backend API-এর ঠিকানা।
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:7000";

// ============================================
// TYPES
// ============================================

// Order-এর Status।
type OrderStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled";

// Status অনুযায়ী Filter।
type OrderFilter = "all" | OrderStatus;

// Backend থেকে আসা Order Document।
interface VendorOrder {
  id: string;

  customerId: string;

  // নতুন: Customer Contact Information।
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;

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

// GET /api/orders/vendor Response।
interface OrdersApiResponse {
  success: boolean;
  message?: string;
  total?: number;
  data?: VendorOrder[];
}

// PATCH Order Status Response।
interface UpdateOrderResponse {
  success: boolean;
  message?: string;
  data?: VendorOrder;
}

// ============================================
// HELPER — DATE FORMAT
// ============================================

// Order Created / Reviewed Date দেখানো।
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

// Delivery Date-এর Calendar Day ঠিক রাখা।
function formatDeliveryDate(value: string): string {
  if (!value) return "—";

  const date = new Date(
    `${value.slice(0, 10)}T00:00:00.000Z`
  );

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

// বাংলাদেশের টাকায় Price Format।
function formatPrice(price: number): string {
  return `৳${Number(price || 0).toLocaleString("en-BD")}`;
}

// ============================================
// HELPER — CUSTOMER CONTACT VALIDATION
// ============================================

// পুরোনো Order-এ Field না থাকলে
// অথবা Not Provided হলে Empty String ফেরত।
function getContactValue(
  value?: string | null
): string {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    value.trim().toLowerCase() === "not provided"
  ) {
    return "";
  }

  return value.trim();
}

// Customer Mobile Number যাচাই।
// শুধুমাত্র Valid Bangladesh Mobile হলে
// Call Customer Button Active হবে।
function getCustomerPhone(
  value?: string | null
): string {
  const phone = getContactValue(value);
  const cleaned = phone.replace(/[\s()-]/g, "");

  if (/^01[3-9]\d{8}$/.test(cleaned)) {
    return cleaned;
  }

  return "";
}

// Email Address Valid হলে
// Email Customer Button দেখানো হবে।
function getCustomerEmail(
  value?: string | null
): string {
  const email = getContactValue(value);

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return email;
  }

  return "";
}

// ============================================
// HELPER — STATUS DESIGN
// ============================================

function getStatusStyle(status: OrderStatus) {
  switch (status) {
    case "accepted":
      return {
        label: "Accepted",
        icon: CheckCircle2,
        badge:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
      };

    case "rejected":
      return {
        label: "Rejected",
        icon: XCircle,
        badge:
          "border-red-200 bg-red-50 text-red-700",
      };

    case "cancelled":
      return {
        label: "Cancelled",
        icon: Ban,
        badge:
          "border-stone-200 bg-stone-100 text-stone-600",
      };

    default:
      return {
        label: "Pending",
        icon: Clock3,
        badge:
          "border-amber-200 bg-amber-50 text-amber-700",
      };
  }
}

// ============================================
// VENDOR ORDERS PAGE
// ============================================

export default function VendorOrdersPage() {
  // ==========================================
  // STATES
  // ==========================================

  // Vendor-এর Orders।
  const [orders, setOrders] = useState<VendorOrder[]>([]);

  // API Loading State।
  const [loading, setLoading] = useState(true);

  // Refresh Trigger।
  const [refreshKey, setRefreshKey] = useState(0);

  // Search।
  const [search, setSearch] = useState("");

  // Status Filter।
  const [filter, setFilter] =
    useState<OrderFilter>("all");

  // Notification।
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Expanded Order Details।
  const [expandedOrderId, setExpandedOrderId] =
    useState<string | null>(null);

  // Accept / Reject Request চলছে।
  const [actionId, setActionId] =
    useState<string | null>(null);

  // Confirmation Panel।
  const [confirmation, setConfirmation] = useState<{
    orderId: string;
    status: "accepted" | "rejected";
  } | null>(null);

  // কোন Order-এর Phone Copy করা হয়েছে।
  const [copiedPhoneId, setCopiedPhoneId] =
    useState<string | null>(null);

  // ==========================================
  // FETCH VENDOR ORDERS
  // ==========================================

  useEffect(() => {
    // Component Unmount হলে Request বাতিল।
    const controller = new AbortController();

    async function fetchOrders() {
      try {
        // Better Auth Session Cookie সহ API Call।
        const response = await fetch(
          `${API_URL}/api/orders/vendor`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const result: OrdersApiResponse =
          await response.json();

        // Server Error Handle।
        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Unable to load incoming orders."
          );
        }

        // Cancelled Request হলে State Update নয়।
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

    return () => {
      controller.abort();
    };
  }, [refreshKey]);

  // ==========================================
  // REFRESH ORDERS
  // ==========================================

  function refreshOrders() {
    setLoading(true);
    setError("");

    setRefreshKey((previous) => previous + 1);
  }

  // ==========================================
  // ACCEPT / REJECT ORDER
  // ==========================================

  async function updateOrderStatus(
    orderId: string,
    newStatus: "accepted" | "rejected"
  ) {
    if (actionId !== null) return;

    setActionId(orderId);
    setError("");
    setSuccess("");

    try {
      // Order Status Update API।
      const response = await fetch(
        `${API_URL}/api/orders/${orderId}/status`,
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

      const result: UpdateOrderResponse =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to update order status."
        );
      }

      // Action সফল হলে Confirmation বন্ধ।
      setConfirmation(null);

      // Backend Response থেকে Order Update।
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
        refreshOrders();
      }

      setSuccess(
        newStatus === "accepted"
          ? "Order accepted successfully."
          : "Order rejected successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update order status."
      );
    } finally {
      setActionId(null);
    }
  }

  // ==========================================
  // COPY CUSTOMER PHONE
  // ==========================================

  async function copyCustomerPhone(
    orderId: string,
    phone: string
  ) {
    try {
      // Browser Clipboard API।
      await navigator.clipboard.writeText(phone);

      setCopiedPhoneId(orderId);
      setError("");
    } catch {
      setError(
        "Unable to copy mobile number. Please copy it manually."
      );
    }
  }

  // ==========================================
  // ORDER SUMMARY
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
  // SEARCH + FILTER
  // ==========================================

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        filter === "all" || order.status === filter;

      // Order, Restaurant এবং Customer Search।
      const matchesSearch =
        !keyword ||
        order.itemName.toLowerCase().includes(keyword) ||
        order.restaurantName.toLowerCase().includes(keyword) ||
        order.id.toLowerCase().includes(keyword) ||
        (order.customerName ?? "").toLowerCase().includes(keyword) ||
        (order.customerEmail ?? "").toLowerCase().includes(keyword) ||
        (order.customerPhone ?? "").includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [orders, search, filter]);

  // ==========================================
  // EXPAND ORDER DETAILS
  // ==========================================

  function toggleDetails(orderId: string) {
    setExpandedOrderId((previous) =>
      previous === orderId ? null : orderId
    );
  }

  // ==========================================
  // PAGE UI
  // ==========================================

  return (
    <main className="min-h-screen bg-[#FFF9F2] px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl">

        {/* ===================================
            PAGE HEADER
            =================================== */}

        <div className="mb-8">

          <Link
            href="/dashboard/vendor/menu"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#D62828] transition hover:text-red-700"
          >
            <ArrowLeft size={17} />
            Back to Vendor Menu
          </Link>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-extrabold uppercase tracking-widest text-[#D62828]">
                PizzaHub Vendor Dashboard
              </p>

              <h1 className="text-3xl font-extrabold tracking-tight text-[#2A1B15] sm:text-4xl">
                Incoming Orders
              </h1>

              <p className="mt-2 text-sm leading-6 text-stone-500">
                Review orders, contact customers and manage
                your restaurant requests.
              </p>
            </div>

            {/* Backend থেকে নতুন Data আনা। */}
            <button
              type="button"
              onClick={() => {
                setSuccess("");
                refreshOrders();
              }}
              disabled={loading || actionId !== null}
              className="inline-flex items-center gap-2 rounded-xl border border-orange-100 bg-white px-5 py-3 text-sm font-bold text-stone-700 shadow-sm transition hover:bg-orange-50 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              {loading ? "Loading..." : "Refresh Orders"}
            </button>
          </div>
        </div>

        {/* ===================================
            SUMMARY CARDS
            =================================== */}

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
              <stat.icon size={25} className={stat.color} />

              <p className="mt-4 text-sm text-stone-500">
                {stat.label}
              </p>

              <p className="mt-2 text-3xl font-extrabold text-stone-900">
                {loading ? "—" : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* ===================================
            RESTAURANT ORDERS SECTION
            =================================== */}

        <section className="mt-8 rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">

          {/* Section Header এবং Filter। */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-[#2A1B15]">
                Restaurant Orders
              </h2>

              <p className="mt-1 text-sm text-stone-500">
                Manage incoming customer orders and delivery contacts.
              </p>
            </div>

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
                    setConfirmation(null);
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
              SEARCH INPUT
              =================================== */}

          <div className="relative mt-6">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search pizza, customer, mobile or order ID..."
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
              LOADING / EMPTY / ORDER LIST
              =================================== */}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2
                size={32}
                className="animate-spin text-[#D62828]"
              />
              <p className="mt-4 text-sm text-stone-500">
                Loading incoming orders...
              </p>
            </div>
          ) : error && orders.length === 0 ? (
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
            <div className="py-16 text-center">
              <ClipboardList
                size={46}
                className="mx-auto text-orange-300"
              />

              <h3 className="mt-4 text-xl font-extrabold text-stone-900">
                {orders.length === 0
                  ? "No Incoming Orders Yet"
                  : "No Matching Orders"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
                {orders.length === 0
                  ? "Customer orders for your restaurant will appear here."
                  : "No orders match your current search or filter."}
              </p>

              <Link
                href="/dashboard/vendor/menu"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#D62828] px-6 py-3 text-sm font-bold text-white hover:bg-red-700"
              >
                Manage Your Menu
                <ArrowRight size={17} />
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-5">

              {/* প্রতিটি Order-এর Card। */}
              {filteredOrders.map((order) => {
                const statusStyle = getStatusStyle(order.status);
                const StatusIcon = statusStyle.icon;

                const isExpanded =
                  expandedOrderId === order.id;

                const isUpdating =
                  actionId === order.id;

                const currentConfirmation =
                  confirmation?.orderId === order.id
                    ? confirmation
                    : null;

                // নতুন Customer Contact Information।
                const customerName =
                  getContactValue(order.customerName);

                const customerEmail =
                  getCustomerEmail(order.customerEmail);

                const customerPhone =
                  getCustomerPhone(order.customerPhone);

                const hasCustomerContact =
                  Boolean(customerEmail || customerPhone);

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

                        {/* Pizza Image। */}
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

                        {/* Pizza ও Restaurant Information। */}
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

                              {/* নতুন: Customer Name। */}
                              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-stone-700">
                                <UserRound
                                  size={16}
                                  className="shrink-0 text-[#D62828]"
                                />
                                {customerName || "Customer not identified"}
                              </p>
                            </div>

                            {/* Order Status। */}
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${statusStyle.badge}`}
                            >
                              <StatusIcon size={15} />
                              {statusStyle.label}
                            </span>
                          </div>

                          {/* Price। */}
                          <p className="mt-4 text-2xl font-extrabold text-[#D62828]">
                            {formatPrice(order.itemPrice)}
                          </p>

                          {/* Delivery Date এবং Order Date। */}
                          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-stone-500">
                            <span className="inline-flex items-center gap-2">
                              <CalendarDays size={15} />
                              Delivery:{" "}
                              {formatDeliveryDate(order.deliveryDate)}
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
                          ORDER ACTION BUTTONS
                          =========================== */}

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">

                        <button
                          type="button"
                          onClick={() => {
                            toggleDetails(order.id);
                          }}
                          aria-expanded={isExpanded}
                          className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2.5 text-sm font-bold text-stone-700 hover:bg-stone-50"
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

                        {/* শুধু Pending Order Review করা যাবে। */}
                        {order.status === "pending" && (
                          <div className="flex flex-wrap gap-2">

                            {/* Accept Order। */}
                            <button
                              type="button"
                              disabled={actionId !== null}
                              onClick={() => {
                                setConfirmation({
                                  orderId: order.id,
                                  status: "accepted",
                                });

                                setError("");
                                setSuccess("");
                              }}
                              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              <CheckCircle2 size={17} />
                              Accept
                            </button>

                            {/* Reject Order। */}
                            <button
                              type="button"
                              disabled={actionId !== null}
                              onClick={() => {
                                setConfirmation({
                                  orderId: order.id,
                                  status: "rejected",
                                });

                                setError("");
                                setSuccess("");
                              }}
                              className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
                            >
                              <XCircle size={17} />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>

                      {/* ===========================
                          ACCEPT/REJECT CONFIRMATION
                          =========================== */}

                      {currentConfirmation &&
                        order.status === "pending" && (
                          <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4">

                            <p className="text-sm font-extrabold text-stone-900">
                              {currentConfirmation.status === "accepted"
                                ? "Accept this order?"
                                : "Reject this order?"}
                            </p>

                            <p className="mt-2 text-xs text-stone-600">
                              The customer will see the updated order status.
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">

                              <button
                                type="button"
                                disabled={actionId !== null}
                                onClick={() => {
                                  void updateOrderStatus(
                                    order.id,
                                    currentConfirmation.status
                                  );
                                }}
                                className={
                                  currentConfirmation.status === "accepted"
                                    ? "inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                                    : "inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                                }
                              >
                                {isUpdating ? (
                                  <Loader2
                                    size={15}
                                    className="animate-spin"
                                  />
                                ) : currentConfirmation.status ===
                                  "accepted" ? (
                                  <CheckCircle2 size={15} />
                                ) : (
                                  <XCircle size={15} />
                                )}

                                {isUpdating
                                  ? "Updating..."
                                  : currentConfirmation.status === "accepted"
                                    ? "Confirm Accept"
                                    : "Confirm Reject"}
                              </button>

                              <button
                                type="button"
                                disabled={actionId !== null}
                                onClick={() => setConfirmation(null)}
                                className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-50"
                              >
                                Go Back
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

                          {/* =====================
                              CUSTOMER INFORMATION
                              ===================== */}

                          <div className="rounded-2xl border border-orange-100 bg-white p-5">

                            <h4 className="flex items-center gap-2 text-sm font-extrabold text-stone-900">
                              <UserRound
                                size={18}
                                className="text-[#D62828]"
                              />
                              Customer Information
                            </h4>

                            {/* Customer Name। */}
                            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-stone-400">
                              Customer Name
                            </p>

                            <p className="mt-1 wrap-break-word text-sm font-bold text-stone-800">
                              {customerName || "Not Provided"}
                            </p>

                            {/* Customer Email। */}
                            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-stone-400">
                              Email Address
                            </p>

                            <p className="mt-1 wrap-break-word text-sm font-medium text-stone-700">
                              {customerEmail || "Not Provided"}
                            </p>

                            {/* Customer Mobile Number। */}
                            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-stone-400">
                              Mobile Number
                            </p>

                            <p className="mt-1 text-lg font-extrabold text-[#2A1B15]">
                              {customerPhone || "Not Provided"}
                            </p>

                            {/* =====================
                                CUSTOMER CONTACT
                                ===================== */}

                            {hasCustomerContact && (
                              <div className="mt-5 flex flex-wrap gap-2">

                                {/* মোবাইল নম্বর থাকলে Call Button। */}
                                {customerPhone && (
                                  <a
                                    href={`tel:${customerPhone}`}
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#D62828] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#B91C1C]"
                                  >
                                    <Phone size={16} />
                                    Call Customer
                                  </a>
                                )}

                                {/* Email থাকলে Mail App খুলবে। */}
                                {customerEmail && (
                                  <a
                                    href={`mailto:${customerEmail}`}
                                    className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 transition hover:bg-stone-50"
                                  >
                                    <Mail size={16} />
                                    Email Customer
                                  </a>
                                )}

                                {/* Mobile Number Copy। */}
                                {customerPhone && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      void copyCustomerPhone(
                                        order.id,
                                        customerPhone
                                      );
                                    }}
                                    className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-xs font-bold text-orange-800 hover:bg-orange-100"
                                  >
                                    {copiedPhoneId === order.id ? (
                                      <>
                                        <Check size={16} />
                                        Copied
                                      </>
                                    ) : (
                                      <>
                                        <Copy size={16} />
                                        Copy Number
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Customer ID। */}
                            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-stone-400">
                              Customer ID
                            </p>

                            <p className="mt-1 wrap-break-word text-xs text-stone-500">
                              {order.customerId}
                            </p>
                          </div>

                          {/* =====================
                              DELIVERY INFORMATION
                              ===================== */}

                          <div className="rounded-2xl border border-orange-100 bg-white p-5">

                            <h4 className="flex items-center gap-2 text-sm font-extrabold text-stone-900">
                              <MapPin
                                size={18}
                                className="text-[#D62828]"
                              />
                              Delivery Information
                            </h4>

                            {/* Delivery Address। */}
                            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-stone-400">
                              Delivery Address
                            </p>

                            <p className="mt-1 wrap-break-word text-sm leading-6 text-stone-700">
                              {order.deliveryAddress}
                            </p>

                            {/* Delivery Date। */}
                            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-stone-400">
                              Delivery Date
                            </p>

                            <p className="mt-1 text-sm font-bold text-stone-700">
                              {formatDeliveryDate(order.deliveryDate)}
                            </p>

                            {/* Special Instructions। */}
                            <p className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
                              <MessageSquareText size={14} />
                              Special Instructions
                            </p>

                            <p className="mt-1 wrap-break-word text-sm leading-6 text-stone-700">
                              {order.message ||
                                "No special instructions."}
                            </p>

                            {/* Order Status। */}
                            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-stone-400">
                              Order Status
                            </p>

                            <span
                              className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${statusStyle.badge}`}
                            >
                              <StatusIcon size={15} />
                              {statusStyle.label}
                            </span>

                            {/* Order Timeline। */}
                            <div className="mt-5 space-y-2 border-t border-stone-100 pt-4">
                              <p className="flex items-center gap-2 text-xs text-stone-500">
                                <Clock3 size={14} />
                                Placed: {formatDate(order.createdAt)}
                              </p>

                              {order.reviewedAt && (
                                <p className="flex items-center gap-2 text-xs text-stone-500">
                                  <ShieldCheck size={14} />
                                  Reviewed: {formatDate(order.reviewedAt)}
                                </p>
                              )}

                              {order.cancelledAt && (
                                <p className="flex items-center gap-2 text-xs text-stone-500">
                                  <Ban size={14} />
                                  Cancelled: {formatDate(order.cancelledAt)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Order Identifier। */}
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

              {/* Order Results Count। */}
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
