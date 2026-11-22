
"use client";

// ============================================
// PIZZAHUB — CUSTOMER ORDER FORM
// LESSON 19 — STEP 6B
// PROFILE MOBILE NUMBER AUTO-FILL
// ============================================

// React Hooks এবং Form Type।
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

// Next.js Link।
import Link from "next/link";

// Lucide Icons।
import {
  CalendarDays,
  MapPin,
  Phone,
  MessageSquareText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
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

// Parent Component থেকে Pizza Information।
interface CustomerOrderFormProps {
  menuItemId: string;
  itemName: string;

  // Order সফল হলে Parent-কে জানানো হবে।
  onSuccess?: (orderId: string) => void;
}

// Order Create API-এর Response।
interface OrderApiResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    status: string;
  };
}

// Profile Phone API-এর Response।
interface ProfilePhoneResponse {
  success: boolean;
  message?: string;
  data?: {
    phone?: string;
  };
}

// ============================================
// HELPER — BANGLADESH CURRENT DATE
// ============================================

// বাংলাদেশের আজকের তারিখ YYYY-MM-DD Format।
function getTodayInBangladesh(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return [
    getPart("year"),
    getPart("month"),
    getPart("day"),
  ].join("-");
}

// ============================================
// HELPER — MOBILE NUMBER NORMALIZATION
// ============================================

// +88017XXXXXXXX -> 017XXXXXXXX
// 88017XXXXXXXX  -> 017XXXXXXXX
function normalizeBDPhone(value: string): string {
  const cleaned = value
    .trim()
    .replace(/[\s()-]/g, "");

  if (cleaned.startsWith("+880")) {
    return `0${cleaned.slice(4)}`;
  }

  if (cleaned.startsWith("880")) {
    return `0${cleaned.slice(3)}`;
  }

  return cleaned;
}

// বাংলাদেশের প্রচলিত Mobile Number যাচাই।
function isValidBDPhone(value: string): boolean {
  return /^01[3-9]\d{8}$/.test(value);
}

// ============================================
// MAIN CUSTOMER ORDER FORM
// ============================================

export default function CustomerOrderForm({
  menuItemId,
  itemName,
  onSuccess,
}: CustomerOrderFormProps) {
  // ==========================================
  // FORM STATES
  // ==========================================

  // Customer Mobile Number।
  const [customerPhone, setCustomerPhone] =
    useState("");

  // Saved Number পাওয়া গেছে কি না।
  const [hasSavedPhone, setHasSavedPhone] =
    useState(false);

  // Profile থেকে Number আনা হচ্ছে কি না।
  const [loadingPhone, setLoadingPhone] =
    useState(true);

  // Customer নিজে Phone Field পরিবর্তন করেছেন কি না।
  // API দেরিতে Response দিলে তাঁর লেখা মুছে যাবে না।
  const phoneEditedRef = useRef(false);

  // Delivery Date।
  const [deliveryDate, setDeliveryDate] =
    useState("");

  // Delivery Address।
  const [deliveryAddress, setDeliveryAddress] =
    useState("");

  // Special Instructions।
  const [message, setMessage] =
    useState("");

  // Order Submit Loading।
  const [loading, setLoading] =
    useState(false);

  // Error Message।
  const [error, setError] =
    useState("");

  // সফল Order-এর ID।
  const [orderId, setOrderId] =
    useState<string | null>(null);

  // বাংলাদেশের আজকের তারিখ।
  const today = getTodayInBangladesh();

  // ==========================================
  // AUTO-FILL SAVED MOBILE NUMBER
  // ==========================================

  useEffect(() => {
    // Component বন্ধ হলে Request Cancel।
    const controller = new AbortController();

    async function loadSavedPhone() {
      try {
        // নিজের Profile-এর Saved Mobile Number।
        const response = await fetch(
          `${API_URL}/api/profile/phone`,
          {
            method: "GET",

            // Better Auth Login Cookie পাঠানো।
            credentials: "include",

            cache: "no-store",

            signal: controller.signal,
          }
        );

        // API কাজ না করলেও Order Form বন্ধ হবে না।
        if (!response.ok) {
          return;
        }

        const result: ProfilePhoneResponse =
          await response.json();

        if (
          !result.success ||
          !result.data?.phone ||
          controller.signal.aborted
        ) {
          return;
        }

        // Saved Phone Number Normalize করা।
        const savedPhone = normalizeBDPhone(
          result.data.phone
        );

        // Database-এ ভুল Number থাকলে Auto-fill নয়।
        if (!isValidBDPhone(savedPhone)) {
          return;
        }

        // Customer ইতোমধ্যে নিজের Number লিখলে
        // API Response দিয়ে তা Overwrite করা হবে না।
        if (phoneEditedRef.current) {
          return;
        }

        // আগের Input খালি থাকলেই Saved Number বসবে।
        setCustomerPhone((previous) =>
          previous.trim() ? previous : savedPhone
        );

        setHasSavedPhone(true);
      } catch (error) {
        // Request Cancel হলে Ignore।
        if (controller.signal.aborted) return;

        // Profile API ব্যর্থ হলেও Customer নিজে
        // Mobile Number লিখে Order দিতে পারবেন।
        console.error(
          "Unable to auto-fill saved mobile number:",
          error
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoadingPhone(false);
        }
      }
    }

    void loadSavedPhone();

    // Cleanup।
    return () => {
      controller.abort();
    };
  }, []);

  // ==========================================
  // HANDLE PHONE INPUT
  // ==========================================

  function handlePhoneChange(value: string) {
    // Customer নিজে Input পরিবর্তন করছেন।
    phoneEditedRef.current = true;

    setCustomerPhone(value);

    // এখন Number-টি User-edited।
    setHasSavedPhone(false);
  }

  // ==========================================
  // SUBMIT CUSTOMER ORDER
  // ==========================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    // একই Order বারবার Submit আটকানো।
    if (loading || orderId) {
      return;
    }

    setError("");

    // ========================================
    // MENU ITEM VALIDATION
    // ========================================

    if (!menuItemId) {
      setError("Menu item ID is missing.");
      return;
    }

    // ========================================
    // MOBILE NUMBER VALIDATION
    // ========================================

    const normalizedPhone = normalizeBDPhone(
      customerPhone
    );

    if (!isValidBDPhone(normalizedPhone)) {
      setError(
        "Enter a valid Bangladeshi mobile number (e.g. 01712345678)."
      );
      return;
    }

    // ========================================
    // DELIVERY DATE VALIDATION
    // ========================================

    if (!deliveryDate || deliveryDate < today) {
      setError("Select a valid delivery date.");
      return;
    }

    // ========================================
    // DELIVERY ADDRESS VALIDATION
    // ========================================

    const address = deliveryAddress.trim();

    if (
      address.length < 10 ||
      address.length > 500
    ) {
      setError(
        "Delivery address must contain 10 to 500 characters."
      );
      return;
    }

    // ========================================
    // SPECIAL INSTRUCTIONS VALIDATION
    // ========================================

    const instructions = message.trim();

    if (instructions.length > 1000) {
      setError(
        "Special instructions cannot exceed 1000 characters."
      );
      return;
    }

    // ========================================
    // START ORDER REQUEST
    // ========================================

    setLoading(true);

    try {
      // Express Backend-এর Order API।
      const response = await fetch(
        `${API_URL}/api/orders`,
        {
          method: "POST",

          // Better Auth Session Cookie।
          credentials: "include",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            menuItemId,

            // Auto-filled অথবা Customer-edited Number।
            customerPhone: normalizedPhone,

            deliveryDate,

            deliveryAddress: address,

            message: instructions,
          }),
        }
      );

      // API Response।
      const result: OrderApiResponse =
        await response.json();

      // Backend Validation / Authentication Error।
      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to place order."
        );
      }

      // Order ID ফেরত এসেছে কি না।
      if (!result.data?.id) {
        throw new Error(
          "The server did not return an order ID."
        );
      }

      // Order সফল হয়েছে।
      setOrderId(result.data.id);

      // Parent Dialog-কে Order Success জানানো।
      onSuccess?.(result.data.id);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to place order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // ORDER SUCCESS SCREEN
  // ==========================================

  if (orderId) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center"
      >
        {/* Success Icon। */}
        <CheckCircle2
          size={44}
          className="mx-auto text-emerald-600"
        />

        <h3 className="mt-4 text-xl font-extrabold text-stone-900">
          Order Placed Successfully!
        </h3>

        {/* Order Item Name। */}
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Your order for{" "}
          <span className="font-bold">
            {itemName}
          </span>{" "}
          has been submitted to the restaurant.
        </p>

        {/* নতুন Order Pending থাকবে। */}
        <p className="mt-3 text-sm font-semibold text-amber-700">
          Status: Pending
        </p>

        {/* Customer My Orders Dashboard। */}
        <Link
          href="/dashboard/customer/orders"
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#D62828] px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
        >
          <ShoppingBag size={17} />
          View My Orders
        </Link>
      </div>
    );
  }

  // ==========================================
  // CUSTOMER ORDER FORM UI
  // ==========================================

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6"
    >
      {/* ======================================
          ORDER FORM HEADER
          ====================================== */}

      <div>
        <div className="flex items-center gap-2">
          <ShoppingBag
            size={22}
            className="text-[#D62828]"
          />

          <h3 className="text-xl font-extrabold text-stone-900">
            Place Your Order
          </h3>
        </div>

        <p className="mt-2 text-sm text-stone-500">
          Ordering:{" "}
          <span className="font-bold text-stone-800">
            {itemName}
          </span>
        </p>
      </div>

      {/* ======================================
          CUSTOMER MOBILE NUMBER — AUTO-FILL
          ====================================== */}

      <div>
        <label
          htmlFor="order-customer-phone"
          className="mb-2 flex items-center gap-2 text-sm font-bold text-stone-700"
        >
          <Phone size={17} />
          Mobile Number
          <span className="text-red-600">*</span>
        </label>

        <div className="relative">
          <input
            id="order-customer-phone"
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel"
            value={customerPhone}
            onChange={(event) =>
              handlePhoneChange(event.target.value)
            }
            placeholder="01712345678"
            maxLength={20}
            className="h-12 w-full rounded-xl border border-stone-200 bg-white px-4 pr-12 text-sm text-stone-800 outline-none transition focus:border-[#D62828] focus:ring-1 focus:ring-[#D62828]"
          />

          {/* Profile Number Loading Indicator। */}
          {loadingPhone && (
            <Loader2
              size={17}
              className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-stone-400"
            />
          )}

          {/* Saved Phone Loaded Indicator। */}
          {!loadingPhone && hasSavedPhone && (
            <CheckCircle2
              size={17}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600"
            />
          )}
        </div>

        {/* Auto-fill Status Message। */}
        {!loadingPhone && hasSavedPhone ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700">
            <CheckCircle2 size={14} />
            Mobile number loaded from your profile.
          </p>
        ) : (
          <p className="mt-2 text-xs text-stone-400">
            Enter your 11-digit Bangladeshi mobile number.
          </p>
        )}

        {/* Profile Update Link। */}
        <p className="mt-2 text-xs text-stone-500">
          Want to update your saved number?{" "}
          <Link
            href="/profile"
            className="font-bold text-[#D62828] hover:underline"
          >
            Edit Profile
          </Link>
        </p>
      </div>

      {/* ======================================
          DELIVERY DATE
          ====================================== */}

      <div>
        <label
          htmlFor="order-delivery-date"
          className="mb-2 flex items-center gap-2 text-sm font-bold text-stone-700"
        >
          <CalendarDays size={17} />
          Delivery Date
          <span className="text-red-600">*</span>
        </label>

        <input
          id="order-delivery-date"
          type="date"
          required
          min={today}
          value={deliveryDate}
          onChange={(event) =>
            setDeliveryDate(event.target.value)
          }
          className="h-12 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm text-stone-800 outline-none transition focus:border-[#D62828] focus:ring-1 focus:ring-[#D62828]"
        />
      </div>

      {/* ======================================
          DELIVERY ADDRESS
          ====================================== */}

      <div>
        <label
          htmlFor="order-delivery-address"
          className="mb-2 flex items-center gap-2 text-sm font-bold text-stone-700"
        >
          <MapPin size={17} />
          Delivery Address
          <span className="text-red-600">*</span>
        </label>

        <textarea
          id="order-delivery-address"
          required
          rows={3}
          minLength={10}
          maxLength={500}
          value={deliveryAddress}
          onChange={(event) =>
            setDeliveryAddress(event.target.value)
          }
          placeholder="House, road, area and city..."
          className="w-full resize-y rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-800 outline-none transition focus:border-[#D62828] focus:ring-1 focus:ring-[#D62828]"
        />

        <p className="mt-1 text-xs text-stone-400">
          Enter at least 10 characters.
        </p>
      </div>

      {/* ======================================
          SPECIAL INSTRUCTIONS
          ====================================== */}

      <div>
        <label
          htmlFor="order-message"
          className="mb-2 flex items-center gap-2 text-sm font-bold text-stone-700"
        >
          <MessageSquareText size={17} />
          Special Instructions (Optional)
        </label>

        <textarea
          id="order-message"
          rows={3}
          maxLength={1000}
          value={message}
          onChange={(event) =>
            setMessage(event.target.value)
          }
          placeholder="Extra cheese, less spicy, delivery notes..."
          className="w-full resize-y rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-800 outline-none transition focus:border-[#D62828] focus:ring-1 focus:ring-[#D62828]"
        />
      </div>

      {/* ======================================
          ERROR MESSAGE
          ====================================== */}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <span>{error}</span>
        </div>
      )}

      {/* ======================================
          CONFIRM ORDER BUTTON
          ====================================== */}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#D62828] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2
              size={18}
              className="animate-spin"
            />
            Placing Order...
          </>
        ) : (
          <>
            <ShoppingBag size={18} />
            Confirm Order
          </>
        )}
      </button>

      {/* Order Payment Information। */}
      <p className="text-center text-xs leading-5 text-stone-400">
        Your restaurant will review the order before
        accepting it. No online payment is required.
      </p>
    </form>
  );
}
