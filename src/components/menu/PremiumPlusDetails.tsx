
"use client";

// ============================================
// PIZZAHUB — PREMIUM+ RESTAURANT DETAILS
// ============================================

// Next.js Image এবং Link।
import Image from "next/image";
import Link from "next/link";

// Popup-এর Icon।
import {
  BadgeCheck,
  CalendarDays,
  CarFront,
  Crown,
  MapPin,
  Phone,
  Pizza,
  Route,
  Star,
  Store,
  Utensils,
  ChefHat,
  ShoppingBag,
  Loader2,
} from "lucide-react";

// Menu Item-এর Type।
import type { MenuItem } from "./MenuItemCard";

// ============================================
// COMPONENT PROPS
// ============================================

interface PremiumPlusDetailsProps {
  // যে Pizza-এর Details দেখানো হবে।
  item: MenuItem;

  // Parent Dialog থেকে Order Form খোলার Function।
  onOrderNow: () => void;

  // Login Session যাচাই চলছে কি না।
  checkingSession?: boolean;
}

// ============================================
// PREMIUM+ DETAILS COMPONENT
// ============================================

export default function PremiumPlusDetails({
  item,
  onOrderNow,
  checkingSession = false,
}: PremiumPlusDetailsProps) {
  // Restaurant-এর প্রকৃত Phone Number।
  const restaurantPhone = item.phone?.trim();

  return (
    <div className="pizzahub-slice-shape grid bg-[#FFF9F2] text-[#2A1B15] lg:grid-cols-[1.15fr_0.95fr]">

      {/* =====================================
          বাম পাশ — Restaurant Information
          ===================================== */}

      <div className="p-5 sm:p-7 lg:p-8">

        {/* Premium+ Restaurant Badge। */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D99C47] bg-gradient-to-r from-[#A61515] to-[#C42A22] px-4 py-2 text-sm font-bold text-white shadow-sm">
            <Crown size={16} />
            Premium+ Restaurant
          </span>
        </div>

        {/* =====================================
            Restaurant Brand এবং Header
            ===================================== */}

        <div className="mb-5 flex items-start gap-4">

          {/* PizzaHub Signature Logo Box। */}
          <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-[24px] bg-gradient-to-br from-[#29110D] to-[#5A271A] text-white shadow-sm">
            <Pizza
              size={28}
              className="mb-1 text-[#FFB347]"
            />

            <p className="text-center text-sm font-extrabold leading-tight">
              PizzaHub
            </p>

            <p className="text-center text-xs font-semibold text-[#FFD589]">
              Signature
            </p>
          </div>

          {/* Restaurant Name এবং Badge। */}
          <div className="min-w-0 flex-1">

            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-[#2A1B15] sm:text-4xl">
                {item.vendorName}
              </h2>

              {/* আগের Verified Indicator রাখা হয়েছে। */}
              <BadgeCheck
                className="text-[#E11D48]"
                size={26}
              />
            </div>

            {/* Existing Restaurant Description। */}
            <p className="mt-2 text-lg text-stone-600">
              Italian • Pizza • Fine Dining
            </p>

            {/* =================================
                Premium+ Information Chips
                ================================= */}

            <div className="mt-4 flex flex-wrap gap-2">

              {/* Existing Demo Rating। */}
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F3E2C2] px-3 py-2 text-sm font-semibold text-[#5A3212]">
                <Star
                  size={15}
                  className="fill-[#D99C47] text-[#D99C47]"
                />
                4.8 (2,450+ reviews)
              </span>

              {/* Dining Category। */}
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F8ECDC] px-3 py-2 text-sm font-semibold text-[#5A3212]">
                <Utensils size={15} />
                Fine Dining
              </span>

              {/* Subscription Badge। */}
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F7E2B5] px-3 py-2 text-sm font-semibold text-[#B06D08]">
                <Crown size={15} />
                Premium+
              </span>

            </div>
          </div>
        </div>

        {/* =====================================
            Restaurant Description
            ===================================== */}

        <p className="mb-6 text-lg leading-9 text-stone-700">
          An exclusive dining experience with authentic
          Italian pizzas, modern ambience, and premium
          hospitality.
        </p>

        {/* =====================================
            Restaurant Feature Cards
            ===================================== */}

        <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">

          {/* Exclusive Menu। */}
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-orange-100">
            <Store
              className="mx-auto mb-3 text-[#D75A00]"
              size={26}
            />

            <p className="text-sm font-bold text-[#2A1B15]">
              Exclusive Menu
            </p>
          </div>

          {/* Table Reservation। */}
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-orange-100">
            <CalendarDays
              className="mx-auto mb-3 text-[#D75A00]"
              size={26}
            />

            <p className="text-sm font-bold text-[#2A1B15]">
              Table Reserve
            </p>
          </div>

          {/* Valet Parking। */}
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-orange-100">
            <CarFront
              className="mx-auto mb-3 text-[#D75A00]"
              size={26}
            />

            <p className="text-sm font-bold text-[#2A1B15]">
              Valet Parking
            </p>
          </div>

          {/* Live Kitchen। */}
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-orange-100">
            <ChefHat
              className="mx-auto mb-3 text-[#D75A00]"
              size={26}
            />

            <p className="text-sm font-bold text-[#2A1B15]">
              Live Kitchen
            </p>
          </div>

        </div>

        {/* =====================================
            Restaurant Location
            ===================================== */}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

          <div className="flex items-center gap-3">
            <MapPin
              className="text-[#E11D48]"
              size={24}
            />

            <p className="text-2xl font-bold text-[#2A1B15]">
              {item.location}
            </p>
          </div>

          {/* Existing Navigate Button।
              Map Navigation এখনো implement হয়নি। */}
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-[#FFE7E5] px-5 py-3 text-sm font-bold text-[#E33B44]"
          >
            <Route size={16} />
            Navigate
          </button>
        </div>

        {/* =====================================
            Existing Opening Hours Display
            ===================================== */}

        <div className="mb-7 flex flex-wrap items-center gap-3 text-lg">
          <span className="font-bold text-green-600">
            Open Now
          </span>

          <span className="text-stone-400">
            •
          </span>

          <span className="font-semibold text-stone-700">
            11:00 AM – 11:30 PM
          </span>
        </div>

        {/* =====================================
            Premium+ Action Buttons
            ===================================== */}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">

          {/* =================================
              Reserve a Table — আগের Link
              ================================= */}

          <Link
            href="/sign-in"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#E11D3A] px-6 text-base font-bold text-white shadow-sm transition hover:bg-[#C91531]"
          >
            <CalendarDays size={18} />
            Reserve a Table
          </Link>

          {/* =================================
              Order Now — সংশোধিত Button
              =================================

              আগে এটি /sign-in Link ছিল।

              এখন Parent MenuDetailsDialog-এর
              handleOrderNow() Function চালাবে।

              Customer Login করা থাকলে Order Form
              খুলবে; না থাকলে Sign In-এ যাবে।
          */}

          <button
            type="button"
            onClick={onOrderNow}
            disabled={checkingSession}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#D62828] px-6 text-base font-bold text-white shadow-sm transition hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-60"
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
              Call Now — Restaurant Phone
              =================================

              আগে এখানে Demo Number ছিল।
              এখন Database থেকে পাওয়া Phone ব্যবহার
              করা হচ্ছে।
          */}

          {restaurantPhone ? (
            <a
              href={`tel:${restaurantPhone}`}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-[#F2A67F] bg-white px-6 text-base font-bold text-[#B03022] transition hover:bg-[#FFF1EA] sm:col-span-2 xl:col-span-1"
            >
              <Phone size={18} />
              Call Now
            </a>
          ) : (
            <button
              type="button"
              disabled
              title="Restaurant phone number not available"
              className="inline-flex h-14 cursor-not-allowed items-center justify-center gap-2 rounded-full border border-stone-200 bg-stone-100 px-6 text-base font-bold text-stone-400 sm:col-span-2 xl:col-span-1"
            >
              <Phone size={18} />
              Call Now
            </button>
          )}

        </div>
      </div>

      {/* =====================================
          ডান পাশ — Restaurant Image Gallery
          ===================================== */}

      <div className="p-5 pt-0 sm:p-7 sm:pt-0 lg:p-8 lg:pl-0">

        <div className="h-full rounded-[34px] bg-[#5B281A] p-3">

          {/* =================================
              বড় Pizza Preview Image
              ================================= */}

          <div className="relative mb-4 h-80 overflow-hidden rounded-[28px] sm:h-105">
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>

          {/* =================================
              নিচের Image Thumbnails
              ================================= */}

          <div className="grid grid-cols-4 gap-3">

            {/* Thumbnail 1। */}
            <div className="relative h-24 overflow-hidden rounded-[22px] ring-2 ring-white/70">
              <Image
                src={item.image}
                alt={`${item.name} thumbnail 1`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </div>

            {/* Thumbnail 2। */}
            <div className="relative h-24 overflow-hidden rounded-[22px] ring-2 ring-white/70">
              <Image
                src={item.image}
                alt={`${item.name} thumbnail 2`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </div>

            {/* Thumbnail 3। */}
            <div className="relative h-24 overflow-hidden rounded-[22px] ring-2 ring-white/70">
              <Image
                src={item.image}
                alt={`${item.name} thumbnail 3`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </div>

            {/* Existing More Photos Display। */}
            <div className="flex h-24 flex-col items-center justify-center rounded-[22px] border-2 border-white/80 bg-white/10 text-center text-white backdrop-blur-sm">
              <p className="text-3xl font-extrabold leading-none">
                +12
              </p>

              <p className="mt-1 text-base font-semibold">
                Photos
              </p>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
