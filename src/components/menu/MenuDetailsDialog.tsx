
"use client";

// ============================================
// PIZZAHUB — MENU DETAILS DIALOG
// FREE / PREMIUM / PREMIUM+
// LESSON 19 — ORDER INTEGRATION
// ============================================

// React State।
import { useState } from "react";

// Next.js Image।
import Image from "next/image";

// Login Redirect-এর জন্য Router।
import { useRouter } from "next/navigation";

// Lucide Icons।
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Crown,
  Loader2,
  MapPin,
  Phone,
  ShoppingBag,
  Store,
} from "lucide-react";

// Shadcn Dialog।
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

// Premium+ Restaurant-এর Custom Design।
import PremiumPlusDetails from "./PremiumPlusDetails";

// Customer Order Form।
import CustomerOrderForm from
  "@/components/orders/CustomerOrderForm";

// Existing Menu Types।
import type {
  MenuItem,
  VendorPlan,
} from "./MenuItemCard";

// ============================================
// BACKEND CONFIGURATION
// ============================================

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:7000";

// ============================================
// COMPONENT PROPS
// ============================================

interface MenuDetailsDialogProps {
  item: MenuItem;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function MenuDetailsDialog({
  item,
}: MenuDetailsDialogProps) {
  // ==========================================
  // NEXT.JS ROUTER
  // ==========================================

  const router = useRouter();

  // ==========================================
  // STATES
  // ==========================================

  // Popup খোলা আছে কি না।
  const [open, setOpen] = useState(false);

  // Order Form দেখানো হচ্ছে কি না।
  const [showOrderForm, setShowOrderForm] =
    useState(false);

  // Login Session যাচাই চলছে কি না।
  const [checkingSession, setCheckingSession] =
    useState(false);

  // Session Error।
  const [sessionError, setSessionError] =
    useState("");

  // ==========================================
  // SUBSCRIPTION PLAN
  // ==========================================

  // Restaurant-এর Subscription Plan।
  const plan: VendorPlan =
    item.subscriptionPlan ?? "free";

  // Premium+ Restaurant।
  const isPremiumPlus =
    plan === "premium_plus";

  // Premium Restaurant।
  const isPremium =
    plan === "premium";

  // Restaurant Phone।
  const restaurantPhone =
    item.phone?.trim();

  // Existing Rule: শুধু Premium Plan-এ
  // এই Regular Popup-এর Call Now Active।
  const canCall =
    plan === "premium";

  // ==========================================
  // HANDLE DIALOG OPEN / CLOSE
  // ==========================================

  function handleDialogChange(nextOpen: boolean) {
    setOpen(nextOpen);

    // Popup বন্ধ হলে Details View-এ Reset।
    if (!nextOpen) {
      setShowOrderForm(false);
      setSessionError("");
    }
  }

  // ==========================================
  // VIEW DETAILS
  // ==========================================

  function handleViewDetails() {
    // আগের Order Form থেকে ফিরে আসলেও
    // নতুন করে Details দেখানো হবে।
    setShowOrderForm(false);
    setSessionError("");
    setOpen(true);
  }

  // ==========================================
  // ORDER NOW — SESSION CHECK
  // ==========================================

  async function handleOrderNow() {
    // Duplicate Session Request বন্ধ।
    if (checkingSession) return;

    setCheckingSession(true);
    setSessionError("");

    try {
      // Better Auth Session যাচাই।
      const response = await fetch(
        `${API_URL}/api/auth/get-session`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to verify your login session."
        );
      }

      // Better Auth থেকে User ID পাওয়া।
      const result: {
        user?: {
          id?: string;
        } | null;
      } | null = await response.json();

      // =====================================
      // LOGIN না থাকলে Sign In
      // =====================================

      if (!result?.user?.id) {
        setOpen(false);
        router.push("/sign-in");
        return;
      }

      // =====================================
      // LOGIN থাকলে Order Form
      // =====================================

      // Free, Premium এবং Premium+
      // তিন ধরনের Restaurant-এর একই
      // Customer Order Form ব্যবহার হবে।
      setShowOrderForm(true);
    } catch (error) {
      setSessionError(
        error instanceof Error
          ? error.message
          : "Unable to verify your session."
      );
    } finally {
      setCheckingSession(false);
    }
  }

  // ==========================================
  // BACK TO DETAILS
  // ==========================================

  function handleBackToDetails() {
    // Order Form থেকে আগের Popup।
    setShowOrderForm(false);
    setSessionError("");
  }

  // ==========================================
  // COMPONENT UI
  // ==========================================

  return (
    <>
      {/* =====================================
          VIEW DETAILS TRIGGER
          ===================================== */}

      <button
        type="button"
        onClick={handleViewDetails}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#D62828] px-5 text-sm font-bold text-white transition-colors hover:bg-[#B91C1C]"
      >
        View Details
        <ArrowRight size={16} />
      </button>

      {/* =====================================
          MAIN DIALOG
          ===================================== */}

      <Dialog
        open={open}
        onOpenChange={handleDialogChange}
      >
        <DialogContent
          className={
            showOrderForm
              ? "pizzahub-order-dialog-shell max-h-[92dvh] w-[calc(100vw-24px)] max-w-[650px]! gap-0 overflow-y-auto rounded-[30px] border-0 bg-[#FFF9F2] p-0 shadow-2xl sm:max-w-[650px]!"
              : isPremiumPlus
                ? "pizzahub-premium-dialog-shell max-h-[92dvh] w-[calc(100vw-24px)] max-w-[1150px]! gap-0 overflow-y-auto border-0 bg-transparent p-0 shadow-none sm:max-w-[1150px]!"
                : "pizzahub-regular-dialog-shell max-h-[92dvh] w-[calc(100vw-24px)] max-w-[850px]! gap-0 overflow-y-auto rounded-[30px] border-0 bg-white p-0 shadow-2xl sm:max-w-[850px]!"
          }
        >

          {/* Accessibility-এর জন্য Dialog Title। */}
          <DialogTitle className="sr-only">
            {showOrderForm
              ? `Place Order — ${item.name}`
              : `${item.name} Details`}
          </DialogTitle>

          {/* Screen Reader-এর জন্য Description। */}
          <DialogDescription className="sr-only">
            {showOrderForm
              ? `Complete the order form for ${item.name}.`
              : `View ${item.name} from ${item.vendorName}.`}
          </DialogDescription>

          {/* ===================================
              CUSTOMER ORDER FORM
              =================================== */}

          {showOrderForm ? (
            <div className="p-5 sm:p-8">

              {/* আগের Restaurant Details-এ ফেরা। */}
              <button
                type="button"
                onClick={handleBackToDetails}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-4 py-2 text-sm font-bold text-stone-700 transition hover:bg-orange-50"
              >
                <ArrowLeft size={17} />
                Back to Details
              </button>

              {/* Customer Order Form।
                  Mobile Number, Delivery Date,
                  Address ও Instructions থাকবে। */}
              <CustomerOrderForm
                key={item.id}
                menuItemId={item.id}
                itemName={item.name}
              />

            </div>

          ) : isPremiumPlus ? (

            /* ===================================
               PREMIUM+ RESTAURANT DETAILS
               =================================== */

            <div className="flex flex-col">

              {/* আগের Premium+ Custom UI।
                  শুধু Order Now Callback যুক্ত হয়েছে।

                  নিচে আর আলাদা Order Button নেই।
                  তাই Duplicate Button আসবে না। */}
              <PremiumPlusDetails
                item={item}
                onOrderNow={() => {
                  void handleOrderNow();
                }}
                checkingSession={checkingSession}
              />

              {/* Premium+ Popup-এর Session Error। */}
              {sessionError && (
                <div
                  role="alert"
                  className="mx-5 mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:mx-8"
                >
                  {sessionError}
                </div>
              )}

            </div>

          ) : (

            /* ===================================
               FREE & PREMIUM RESTAURANT DETAILS
               =================================== */

            <div className="grid overflow-hidden bg-white lg:grid-cols-[0.95fr_1.05fr]">

              {/* ================================
                  বাম পাশ — Pizza Image
                  ================================ */}

              <div className="relative h-64 overflow-hidden bg-orange-100 sm:h-80 lg:h-full lg:min-h-[490px]">

                {/* Pizza Image। */}
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />

                {/* Image-এর নিচে Gradient। */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Food Category Badge। */}
                <span className="absolute bottom-5 left-5 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-[#D62828] shadow-sm">
                  {item.category}
                </span>

                {/* Premium Badge। */}
                {isPremium && (
                  <span className="absolute bottom-5 right-5 inline-flex items-center gap-1 rounded-full bg-[#F77F00] px-3 py-2 text-xs font-bold text-white shadow-sm">
                    <Crown size={14} />
                    Premium
                  </span>
                )}

              </div>

              {/* ================================
                  ডান পাশ — Pizza Details
                  ================================ */}

              <div className="flex flex-col p-6 sm:p-8">

                {/* Pizza Name। */}
                <h2 className="pr-8 text-3xl font-extrabold leading-tight tracking-tight text-[#2A1B15] sm:text-4xl">
                  {item.name}
                </h2>

                {/* Restaurant Name এবং Badge। */}
                <div className="mt-4 flex flex-wrap items-center gap-3">

                  {/* Restaurant Name। */}
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700">
                    <Store
                      size={17}
                      className="text-[#D62828]"
                    />
                    {item.vendorName}
                  </span>

                  {/* Premium Restaurant Badge। */}
                  {isPremium && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                      <BadgeCheck size={14} />
                      Premium Restaurant
                    </span>
                  )}

                </div>

                {/* Pizza Description। */}
                <p className="mt-6 text-sm leading-7 text-stone-600">
                  {item.description ??
                    "Discover this delicious menu item from a local restaurant. Explore the details and place your order."}
                </p>

                {/* ============================
                    PRICE
                    ============================ */}

                <div className="mt-6">

                  <p className="text-sm font-medium text-stone-500">
                    Price
                  </p>

                  <p className="mt-1 text-4xl font-extrabold text-[#D62828]">
                    ৳{item.price.toLocaleString("en-BD")}
                  </p>

                </div>

                {/* ============================
                    RESTAURANT INFORMATION
                    ============================ */}

                <div className="mt-7 grid gap-3 sm:grid-cols-2">

                  {/* Restaurant Name Card। */}
                  <div className="rounded-2xl border border-orange-100 bg-[#FFF9F2] p-4">

                    <div className="mb-2 flex items-center gap-2 text-sm text-stone-500">
                      <Store
                        size={17}
                        className="text-[#D62828]"
                      />
                      Restaurant
                    </div>

                    <p className="font-bold text-[#2A1B15]">
                      {item.vendorName}
                    </p>

                  </div>

                  {/* Restaurant Location Card। */}
                  <div className="rounded-2xl border border-orange-100 bg-[#FFF9F2] p-4">

                    <div className="mb-2 flex items-center gap-2 text-sm text-stone-500">
                      <MapPin
                        size={17}
                        className="text-[#D62828]"
                      />
                      Location
                    </div>

                    <p className="font-bold text-[#2A1B15]">
                      {item.location}
                    </p>

                  </div>

                </div>

                {/* ============================
                    ACTION BUTTONS
                    ============================ */}

                <div className="mt-auto grid gap-3 pt-8 sm:grid-cols-2">

                  {/* Order Now — আগের মতোই।
                      Login থাকলে Order Form খুলবে। */}
                  <button
                    type="button"
                    onClick={() => {
                      void handleOrderNow();
                    }}
                    disabled={checkingSession}
                    className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#D62828] px-5 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {checkingSession ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                        Checking...
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={18} />
                        Order Now
                      </>
                    )}
                  </button>

                  {/* =================================
                      CALL NOW — PREMIUM ONLY
                      ================================= */}

                  {canCall && restaurantPhone ? (
                    <a
                      href={`tel:${restaurantPhone}`}
                      className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-[#F2A67F] bg-white px-5 py-3 text-center text-sm font-bold text-[#B03022] transition-colors hover:bg-[#FFF1EA]"
                    >
                      <Phone size={18} />
                      Call Now
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      title={
                        !canCall
                          ? "Call Now is available for Premium restaurants"
                          : "Restaurant phone number not available"
                      }
                      className="inline-flex min-h-13 cursor-not-allowed items-center justify-center gap-2 rounded-full border border-stone-200 bg-stone-100 px-5 py-3 text-sm font-bold text-stone-400"
                    >
                      <Phone size={18} />
                      Call Now
                    </button>
                  )}

                </div>

                {/* Login Information। */}
                <p className="mt-4 text-center text-xs text-stone-500">
                  Sign in as a customer to place an order.
                </p>

                {/* Session Error। */}
                {sessionError && (
                  <div
                    role="alert"
                    className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  >
                    {sessionError}
                  </div>
                )}

              </div>
            </div>
          )}

        </DialogContent>
      </Dialog>
    </>
  );
}
