"use client";

// ===============================================
// IMPORTS
// ===============================================

// React-এর useState hook import করছি।
// কেন? Modal খোলা বা বন্ধ থাকার state manage করার জন্য।
import { useState } from "react";

// Next.js Image component।
// এটি optimized restaurant/food image render করে।
import Image from "next/image";

// Next.js Link component।
// Sign In page-এ client-side navigation করার জন্য।
import Link from "next/link";

// Lucide React icons।
// এগুলো modal-এর বিভিন্ন information ও buttons-এ ব্যবহার করব।
import {
  ArrowRight,
  BadgeCheck,
  Crown,
  MapPin,
  Phone,
  ShoppingBag,
  Store,
} from "lucide-react";

// ShadCN Dialog components import করছি।
// Dialog = Modal-এর open/close state পরিচালনা করে।
// DialogContent = Popup-এর main container।
// DialogTitle = Accessible popup heading।
// DialogDescription = Screen reader-এর description।
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

// Premium+ vendor-এর special designed component।
// সেখানে pizza-slice corner এবং Reserve button রয়েছে।
import PremiumPlusDetails from "./PremiumPlusDetails";

// TypeScript-এর type-only imports।
// Runtime JavaScript-এ এই types প্রয়োজন হয় না।
import type { MenuItem, VendorPlan } from "./MenuItemCard";

// ===============================================
// PROPS INTERFACE
// ===============================================

// এই component একটি pizza item-এর তথ্য গ্রহণ করবে।
interface MenuDetailsDialogProps {
  item: MenuItem;
}

// ===============================================
// MAIN DIALOG COMPONENT
// ===============================================

// Homepage ও Browse Menu থেকে এই component ব্যবহার করা হবে।
export default function MenuDetailsDialog({
  item,
}: MenuDetailsDialogProps) {

  // শুরুতে modal বন্ধ থাকবে।
  // true হলে open, false হলে closed।
  const [open, setOpen] = useState(false);

  // Vendor-এর subscription plan নির্ধারণ করছি।
  // কোনো plan না থাকলে Free হিসেবে গণ্য করব।
  const plan: VendorPlan = item.subscriptionPlan ?? "free";

  // Vendor Premium+ কি না যাচাই করছি।
  // Premium+ হলে exclusive design দেখানো হবে।
  const isPremiumPlus = plan === "premium_plus";

  // Vendor Premium কি না যাচাই করছি।
  // Free/Premium regular popup-এ Premium badge দেখানোর জন্য।
  const isPremium = plan === "premium";

  // Restaurant-এর real phone number থাকলে Call button কাজ করবে।
  // এখনকার sample data-তে phone নেই, তাই optional field check করছি।
  const restaurantPhone = item.phone?.trim();
  const canCall = plan === "premium";

  // ===============================================
  // COMPONENT UI
  // ===============================================

  return (
    <>
      {/* ===========================================
          VIEW DETAILS TRIGGER BUTTON
          =========================================== */}

      {/* User click করলে modal open state true হবে। */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#D62828] px-5 text-sm font-bold text-white transition-colors hover:bg-[#B91C1C]"
      >
        View Details
        <ArrowRight size={16} />
      </button>

      {/* ===========================================
          MAIN POPUP DIALOG
          =========================================== */}

      {/* open ও onOpenChange দিয়ে Dialog control করছি।
          Escape, overlay অথবা close button click করলে
          Modal state update হবে। */}
      <Dialog open={open} onOpenChange={setOpen}>

        {/* Plan অনুযায়ী modal-এর style পরিবর্তন করছি।
            Premium+ = wider special modal।
            Free/Premium = normal rounded rectangle।

            DialogContent-এর default close button থাকবে। */}
        <DialogContent
          className={
            isPremiumPlus
              ? "pizzahub-premium-dialog-shell max-h-[92dvh] w-[calc(100vw-24px)] max-w-[1150px]! gap-0 overflow-y-auto border-0 bg-transparent p-0 shadow-none sm:max-w-[1150px]!"
              : "pizzahub-regular-dialog-shell max-h-[92dvh] w-[calc(100vw-24px)] max-w-[850px]! gap-0 overflow-y-auto rounded-[30px] border-0 bg-white p-0 shadow-2xl sm:max-w-[850px]!"
          }
        >

          {/* Screen reader-এর জন্য Dialog title।
              Hidden রাখা হচ্ছে, কারণ visually custom heading আছে। */}
          <DialogTitle className="sr-only">
            {item.name} Details
          </DialogTitle>

          {/* Accessible dialog description। */}
          <DialogDescription className="sr-only">
            View {item.name} from {item.vendorName}.
          </DialogDescription>

          {/* ===========================================
              PREMIUM+ VENDOR
              =========================================== */}

          {/* Premium+ হলে exclusive design component render করব।
              এই component-এর ভিতরে Reserve a Table,
              Order Now এবং Call Now থাকবে। */}
          {isPremiumPlus ? (
            <PremiumPlusDetails item={item} />
          ) : (

            /* ===========================================
               FREE & PREMIUM VENDOR
               =========================================== */

            // Normal restaurant details popup।
            <div className="grid overflow-hidden bg-white lg:grid-cols-[0.95fr_1.05fr]">

              {/* =====================================
                  LEFT: PIZZA IMAGE PANEL
                  ===================================== */}

              {/* Mobile-এ image উপরে থাকবে।
                  Desktop-এ image বাম পাশে থাকবে। */}
              <div className="relative h-64 overflow-hidden bg-orange-100 sm:h-80 lg:h-full lg:min-h-[490px]">

                {/* Current item-এর image দেখাচ্ছি। */}
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />

                {/* Image-এর নিচে soft dark gradient।
                    এতে overlay badge readable থাকবে। */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Food category badge। */}
                <span className="absolute bottom-5 left-5 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-[#D62828] shadow-sm">
                  {item.category}
                </span>

                {/* শুধু Premium vendor-এর badge দেখাব।
                    Free vendor-এর কোনো Premium badge থাকবে না। */}
                {isPremium && (
                  <span className="absolute bottom-5 right-5 inline-flex items-center gap-1 rounded-full bg-[#F77F00] px-3 py-2 text-xs font-bold text-white shadow-sm">
                    <Crown size={14} />
                    Premium
                  </span>
                )}
              </div>

              {/* =====================================
                  RIGHT: FOOD DETAILS
                  ===================================== */}

              {/* Information area-এর spacing। */}
              <div className="flex flex-col p-6 sm:p-8">

                {/* Food item title। */}
                <h2 className="pr-8 text-3xl font-extrabold leading-tight tracking-tight text-[#2A1B15] sm:text-4xl">
                  {item.name}
                </h2>

                {/* Restaurant name এবং Premium status। */}
                <div className="mt-4 flex flex-wrap items-center gap-3">

                  {/* Restaurant icon ও name। */}
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700">
                    <Store size={17} className="text-[#D62828]" />
                    {item.vendorName}
                  </span>

                  {/* Premium status badge। */}
                  {isPremium && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                      <BadgeCheck size={14} />
                      Premium Restaurant
                    </span>
                  )}
                </div>

                {/* Food description।
                    Real description না থাকলে generic text দেখাবে। */}
                <p className="mt-6 text-sm leading-7 text-stone-600">
                  {item.description ??
                    "Discover this delicious menu item from a local restaurant. Explore the details and place your order."}
                </p>

                {/* Food price। */}
                <div className="mt-6">
                  <p className="text-sm font-medium text-stone-500">
                    Price
                  </p>

                  {/* toLocaleString price formatting করে। */}
                  <p className="mt-1 text-4xl font-extrabold text-[#D62828]">
                    ৳{item.price.toLocaleString("en-BD")}
                  </p>
                </div>

                {/* =====================================
                    RESTAURANT INFORMATION
                    ===================================== */}

                {/* Restaurant ও Location cards। */}
                <div className="mt-7 grid gap-3 sm:grid-cols-2">

                  {/* Restaurant name card। */}
                  <div className="rounded-2xl border border-orange-100 bg-[#FFF9F2] p-4">

                    <div className="mb-2 flex items-center gap-2 text-sm text-stone-500">
                      <Store size={17} className="text-[#D62828]" />
                      Restaurant
                    </div>

                    <p className="font-bold text-[#2A1B15]">
                      {item.vendorName}
                    </p>
                  </div>

                  {/* Location card। */}
                  <div className="rounded-2xl border border-orange-100 bg-[#FFF9F2] p-4">

                    <div className="mb-2 flex items-center gap-2 text-sm text-stone-500">
                      <MapPin size={17} className="text-[#D62828]" />
                      Location
                    </div>

                    <p className="font-bold text-[#2A1B15]">
                      {item.location}
                    </p>
                  </div>
                </div>

                {/* =====================================
                    ACTION BUTTONS
                    ===================================== */}

                {/* mt-auto দিয়ে buttons নিচের দিকে রাখছি।
                    Free এবং Premium vendor-এ দুটি button থাকবে।
                    Reserve a Table এখানে নেই। */}
                <div className="mt-auto grid gap-3 pt-8 sm:grid-cols-2">

                  {/* ORDER NOW BUTTON।
                      Authentication setup না হওয়ায় Sign In page-এ যাবে।
                      পরবর্তীতে role check করে order form খুলব। */}
                  <Link
                    href="/sign-in"
                    className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#D62828] px-5 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-[#B91C1C]"
                  >
                    <ShoppingBag size={18} />
                    Order Now
                  </Link>

                  {/* ==========================================
    CALL NOW — PREMIUM ONLY
    ========================================== */}

{/* Premium subscription এবং valid phone number
    দুটো থাকলেই Call Now button enabled হবে। */}

{canCall && restaurantPhone ? (
  // Premium vendor এবং phone number পাওয়া গেলে
  // tel: link দিয়ে phone dialer খুলবে।
  <a
    href={`tel:${restaurantPhone}`}
    className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-[#F2A67F] bg-white px-5 py-3 text-center text-sm font-bold text-[#B03022] transition-colors hover:bg-[#FFF1EA]"
  >
    <Phone size={18} />
    Call Now
  </a>
) : (
  // Free vendor অথবা phone number না থাকলে
  // button disabled থাকবে।
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

                {/* User-এর জন্য ছোট instruction। */}
                <p className="mt-4 text-center text-xs text-stone-500">
                  Sign in as a customer to place an order.
                </p>

              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}