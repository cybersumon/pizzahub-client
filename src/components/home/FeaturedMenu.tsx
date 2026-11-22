"use client";

import { useMemo } from "react";
import Link from "next/link";

import {
  ArrowRight,
  Flame,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";

import MenuItemCard from "@/components/menu/MenuItemCard";
import usePublicMenu from "@/hooks/usePublicMenu";

// ============================================
// FEATURED MENU
// ============================================

export default function FeaturedMenu() {
  // MongoDB API থেকে menu items।
  const {
    items,
    loading,
    error,
    refresh,
  } = usePublicMenu();

  // ==========================================
  // FEATURED ITEMS
  // ==========================================

  const featuredItems = useMemo(() => {
    // Homepage-এর Featured Pizzas section-এ
    // শুধুমাত্র Pizza categories দেখাব।
    const pizzas = items.filter(
      (item) =>
        item.category.toLowerCase().includes("pizza")
    );

    // Premium+ -> Premium -> Free।
    const getPriority = (plan?: string) => {
      if (plan === "premium_plus") return 3;
      if (plan === "premium") return 2;
      return 1;
    };

    return pizzas
      .sort(
        (a, b) =>
          getPriority(b.subscriptionPlan) -
          getPriority(a.subscriptionPlan)
      )
      .slice(0, 6);
  }, [items]);

  // ==========================================
  // ORIGINAL FEATURED MENU DESIGN
  // ==========================================

  return (
    <section className="bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">

        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">

          <div className="max-w-2xl">

            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-[#D62828]">
              <Flame size={16} />
              Fresh From The Oven
            </span>

            <h2 className="text-4xl font-extrabold tracking-tight text-[#1C1917] sm:text-5xl">
              Our Featured{" "}
              <span className="text-[#D62828]">
                Pizzas
              </span>
            </h2>

            <p className="mt-4 leading-7 text-stone-600">
              Handpicked favorites from local restaurants.
              Discover irresistible flavors made just for you.
            </p>
          </div>

          <Link
            href="/menu"
            className="inline-flex items-center gap-2 font-bold text-[#D62828] hover:text-[#B91C1C]"
          >
            View All Pizzas
            <ArrowRight size={19} />
          </Link>
        </div>

        {/* Loading State। */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoaderCircle
              size={36}
              className="animate-spin text-[#D62828]"
            />

            <p className="mt-4 text-sm text-stone-500">
              Loading featured pizzas...
            </p>
          </div>
        ) : error ? (

          /* API Error। */
          <div className="rounded-3xl border border-red-100 bg-red-50 px-5 py-12 text-center">

            <p className="text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={refresh}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#D62828] px-5 py-3 text-sm font-bold text-white hover:bg-[#B91C1C]"
            >
              <RotateCcw size={16} />
              Try Again
            </button>
          </div>
        ) : featuredItems.length > 0 ? (

          /* Original Card Grid। */
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">

            {featuredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
              />
            ))}

          </div>
        ) : (

          /* Empty State। */
          <div className="rounded-3xl border border-dashed border-orange-200 bg-orange-50/50 px-5 py-16 text-center">
            <p className="font-semibold text-stone-600">
              No featured pizzas available right now.
            </p>
          </div>
        )}

      </div>
    </section>
  );
}