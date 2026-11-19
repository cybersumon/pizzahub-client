"use client";

import Image from "next/image";
import Link from "next/link";

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
} from "lucide-react";

import type { MenuItem } from "./MenuItemCard";

// Props type
interface PremiumPlusDetailsProps {
  item: MenuItem;
}

// Premium+ custom dialog body
export default function PremiumPlusDetails({
  item,
}: PremiumPlusDetailsProps) {
  return (
    <div className="pizzahub-slice-shape grid bg-[#FFF9F2] text-[#2A1B15] lg:grid-cols-[1.15fr_0.95fr]">
      {/* =========================
          LEFT SIDE CONTENT
         ========================= */}
      <div className="p-5 sm:p-7 lg:p-8">
        {/* Premium+ badge */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D99C47] bg-gradient-to-r from-[#A61515] to-[#C42A22] px-4 py-2 text-sm font-bold text-white shadow-sm">
            <Crown size={16} />
            Premium+ Restaurant
          </span>
        </div>

        {/* Brand/Header row */}
        <div className="mb-5 flex items-start gap-4">
          {/* Demo brand/logo box */}
          <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-[24px] bg-gradient-to-br from-[#29110D] to-[#5A271A] text-white shadow-sm">
            <Pizza size={28} className="mb-1 text-[#FFB347]" />
            <p className="text-center text-sm font-extrabold leading-tight">
              PizzaHub
            </p>
            <p className="text-center text-xs font-semibold text-[#FFD589]">
              Signature
            </p>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-[#2A1B15] sm:text-4xl">
                {item.vendorName}
              </h2>

              {/* Verified indicator */}
              <BadgeCheck className="text-[#E11D48]" size={26} />
            </div>

            <p className="mt-2 text-lg text-stone-600">
              Italian • Pizza • Fine Dining
            </p>

            {/* small chips */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F3E2C2] px-3 py-2 text-sm font-semibold text-[#5A3212]">
                <Star size={15} className="fill-[#D99C47] text-[#D99C47]" />
                4.8 (2,450+ reviews)
              </span>

              <span className="inline-flex items-center gap-1 rounded-full bg-[#F8ECDC] px-3 py-2 text-sm font-semibold text-[#5A3212]">
                <Utensils size={15} />
                Fine Dining
              </span>

              <span className="inline-flex items-center gap-1 rounded-full bg-[#F7E2B5] px-3 py-2 text-sm font-semibold text-[#B06D08]">
                <Crown size={15} />
                Premium+
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="mb-6 text-lg leading-9 text-stone-700">
          An exclusive dining experience with authentic Italian pizzas,
          modern ambience, and premium hospitality.
        </p>

        {/* Feature cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-orange-100">
            <Store className="mx-auto mb-3 text-[#D75A00]" size={26} />
            <p className="text-sm font-bold text-[#2A1B15]">
              Exclusive Menu
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-orange-100">
            <CalendarDays
              className="mx-auto mb-3 text-[#D75A00]"
              size={26}
            />
            <p className="text-sm font-bold text-[#2A1B15]">
              Table Reserve
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-orange-100">
            <CarFront className="mx-auto mb-3 text-[#D75A00]" size={26} />
            <p className="text-sm font-bold text-[#2A1B15]">
              Valet Parking
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-orange-100">
            <ChefHat className="mx-auto mb-3 text-[#D75A00]" size={26} />
            <p className="text-sm font-bold text-[#2A1B15]">
              Live Kitchen
            </p>
          </div>
        </div>

        {/* Location row */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <MapPin className="text-[#E11D48]" size={24} />
            <p className="text-2xl font-bold text-[#2A1B15]">
              {item.location}
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-[#FFE7E5] px-5 py-3 text-sm font-bold text-[#E33B44]"
          >
            <Route size={16} />
            Navigate
          </button>
        </div>

        {/* Opening info */}
        <div className="mb-7 flex flex-wrap items-center gap-3 text-lg">
          <span className="font-bold text-green-600">Open Now</span>
          <span className="text-stone-400">•</span>
          <span className="font-semibold text-stone-700">
            11:00 AM – 11:30 PM
          </span>
        </div>

        {/* CTA buttons */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {/* Reserve button */}
          <Link
            href="/sign-in"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#E11D3A] px-6 text-base font-bold text-white shadow-sm transition hover:bg-[#C91531]"
          >
            <CalendarDays size={18} />
            Reserve a Table
          </Link>

          {/* Order button */}
          <Link
            href="/sign-in"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#D62828] px-6 text-base font-bold text-white shadow-sm transition hover:bg-[#B91C1C]"
          >
            <ShoppingBag size={18} />
            Order Now
          </Link>

          {/* Call button */}
          <Link
            href="tel:+8801000000000"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-[#F2A67F] bg-white px-6 text-base font-bold text-[#B03022] transition hover:bg-[#FFF1EA] sm:col-span-2 xl:col-span-1"
          >
            <Phone size={18} />
            Call Now
          </Link>
        </div>
      </div>

      {/* =========================
          RIGHT SIDE IMAGE PANEL
         ========================= */}
      <div className="p-5 pt-0 sm:p-7 sm:pt-0 lg:p-8 lg:pl-0">
        <div className="h-full rounded-[34px] bg-[#5B281A] p-3">
          {/* Big preview image */}
          <div className="relative mb-4 h-[320px] overflow-hidden rounded-[28px] sm:h-[420px]">
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>

          {/* Thumbnail row */}
          <div className="grid grid-cols-4 gap-3">
            <div className="relative h-24 overflow-hidden rounded-[22px] ring-2 ring-white/70">
              <Image
                src={item.image}
                alt={`${item.name} thumbnail 1`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </div>

            <div className="relative h-24 overflow-hidden rounded-[22px] ring-2 ring-white/70">
              <Image
                src={item.image}
                alt={`${item.name} thumbnail 2`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </div>

            <div className="relative h-24 overflow-hidden rounded-[22px] ring-2 ring-white/70">
              <Image
                src={item.image}
                alt={`${item.name} thumbnail 3`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </div>

            {/* More photos tile */}
            <div className="flex h-24 flex-col items-center justify-center rounded-[22px] border-2 border-white/80 bg-white/10 text-center text-white backdrop-blur-sm">
              <p className="text-3xl font-extrabold leading-none">+12</p>
              <p className="mt-1 text-base font-semibold">Photos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}