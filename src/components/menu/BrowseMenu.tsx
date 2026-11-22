"use client";

import { useMemo, useState } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  Search,
  SlidersHorizontal,
  Pizza,
  RotateCcw,
  LoaderCircle,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import MenuItemCard from "@/components/menu/MenuItemCard";
import usePublicMenu from "@/hooks/usePublicMenu";

import { menuCategories } from "@/data/menu-items";

type SortOption =
  | "default"
  | "price-low"
  | "price-high";

// ============================================
// BROWSE MENU
// ============================================

export default function BrowseMenu() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // MongoDB API থেকে menu items।
  const {
    items: menuItems,
    loading,
    error,
    refresh,
  } = usePublicMenu();

  // Existing filters।
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("all");

  const [sort, setSort] =
    useState<SortOption>("default");

  const category =
    searchParams.get("category") || "all";

  // ==========================================
  // DYNAMIC LOCATIONS
  // ==========================================

  // Location list এখন MongoDB items থেকে আসবে।
  const menuLocations = useMemo(() => {
    return Array.from(
      new Set(
        menuItems
          .map((item) => item.location)
          .filter(Boolean)
      )
    ).sort();
  }, [menuItems]);

  // ==========================================
  // CATEGORY CHANGE
  // ==========================================

  function handleCategoryChange(value: string) {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }

    const queryString = params.toString();

    const nextUrl = queryString
      ? `/menu?${queryString}`
      : "/menu";

    router.replace(nextUrl, {
      scroll: false,
    });
  }

  // ==========================================
  // RESET FILTERS
  // ==========================================

  function resetFilters() {
    setSearch("");
    setLocation("all");
    setSort("default");

    router.replace("/menu", {
      scroll: false,
    });
  }

  // ==========================================
  // SEARCH + FILTER + SORT
  // ==========================================

  const filteredItems = useMemo(() => {
    let results = [...menuItems];

    const keyword = search.trim().toLowerCase();

    // Search by item name / restaurant।
    if (keyword) {
      results = results.filter(
        (item) =>
          item.name
            .toLowerCase()
            .includes(keyword) ||
          item.vendorName
            .toLowerCase()
            .includes(keyword)
      );
    }

    // Category filter।
    if (category !== "all") {
      results = results.filter(
        (item) => item.category === category
      );
    }

    // Restaurant location filter।
    if (location !== "all") {
      results = results.filter(
        (item) => item.location === location
      );
    }

    // Price sorting।
    if (sort === "price-low") {
      results.sort(
        (a, b) => a.price - b.price
      );
    }

    if (sort === "price-high") {
      results.sort(
        (a, b) => b.price - a.price
      );
    }

    return results;
  }, [
    menuItems,
    search,
    category,
    location,
    sort,
  ]);

  // ==========================================
  // UI — ORIGINAL DESIGN
  // ==========================================

  return (
    <div className="bg-white">

      {/* Page heading area। */}
      <section className="bg-[#FFF7ED] px-5 py-16 text-center lg:py-20">
        <div className="mx-auto max-w-3xl">

          {/* Small heading। */}
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-[#D62828]">
            Explore Our Menu
          </p>

          {/* Main heading। */}
          <h1 className="text-4xl font-extrabold tracking-tight text-[#1C1917] sm:text-6xl">
            Find Your Perfect{" "}
            <span className="text-[#D62828]">
              Slice
            </span>
          </h1>

          {/* Description। */}
          <p className="mx-auto mt-5 max-w-2xl leading-8 text-stone-600">
            Discover delicious pizzas, tasty sides and
            amazing flavors from your favorite local
            restaurants.
          </p>

        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">

        {/* Filter section title। */}
        <div className="mb-6 flex items-center gap-2">
          <SlidersHorizontal
            size={20}
            className="text-[#D62828]"
          />

          <h2 className="text-xl font-bold text-stone-900">
            Search & Filter
          </h2>
        </div>

        {/* Original filter layout। */}
        <div className="grid gap-4 rounded-3xl border border-orange-100 bg-[#FFF7ED] p-5 md:grid-cols-2 lg:grid-cols-4">

          {/* Search field। */}
          <div>
            <label
              htmlFor="pizza-search"
              className="mb-2 block text-sm font-semibold text-stone-700"
            >
              Search Pizza
            </label>

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />

              <Input
                id="pizza-search"
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search pizzas..."
                className="h-11 border-orange-100 bg-white pl-10"
              />
            </div>
          </div>

          {/* Category dropdown। */}
          <div>
            <label
              htmlFor="pizza-category"
              className="mb-2 block text-sm font-semibold text-stone-700"
            >
              Category
            </label>

            <select
              id="pizza-category"
              value={category}
              onChange={(event) =>
                handleCategoryChange(
                  event.target.value
                )
              }
              className="h-11 w-full rounded-md border border-orange-100 bg-white px-3 text-sm text-stone-800"
            >
              <option value="all">
                All Categories
              </option>

              {menuCategories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic location dropdown। */}
          <div>
            <label
              htmlFor="pizza-location"
              className="mb-2 block text-sm font-semibold text-stone-700"
            >
              Location
            </label>

            <select
              id="pizza-location"
              value={location}
              onChange={(event) =>
                setLocation(event.target.value)
              }
              className="h-11 w-full rounded-md border border-orange-100 bg-white px-3 text-sm text-stone-800"
            >
              <option value="all">
                All Locations
              </option>

              {menuLocations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Price sorting dropdown। */}
          <div>
            <label
              htmlFor="pizza-sort"
              className="mb-2 block text-sm font-semibold text-stone-700"
            >
              Sort By
            </label>

            <select
              id="pizza-sort"
              value={sort}
              onChange={(event) =>
                setSort(
                  event.target.value as SortOption
                )
              }
              className="h-11 w-full rounded-md border border-orange-100 bg-white px-3 text-sm text-stone-800"
            >
              <option value="default">
                Default Order
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>
            </select>
          </div>
        </div>

        {/* Results count and Reset button। */}
        <div className="my-8 flex flex-wrap items-center justify-between gap-4">

          <p className="text-sm text-stone-600">
            Showing{" "}
            <strong className="text-stone-900">
              {loading
                ? "..."
                : filteredItems.length}
            </strong>{" "}
            menu items
          </p>

          <Button
            type="button"
            variant="outline"
            onClick={resetFilters}
            className="gap-2 rounded-full"
          >
            <RotateCcw size={16} />
            Reset Filters
          </Button>
        </div>

        {/* ====================================
            LOADING STATE
            ==================================== */}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoaderCircle
              size={36}
              className="animate-spin text-[#D62828]"
            />

            <p className="mt-4 text-sm font-medium text-stone-500">
              Loading delicious menu items...
            </p>
          </div>
        ) : error ? (

          /* API Error State। */
          <div className="rounded-3xl border border-red-100 bg-red-50 px-5 py-16 text-center">
            <h3 className="text-xl font-bold text-red-800">
              Unable to Load Menu
            </h3>

            <p className="mt-3 text-sm text-red-700">
              {error}
            </p>

            <Button
              type="button"
              onClick={refresh}
              className="mt-6 rounded-full bg-[#D62828] hover:bg-[#B91C1C]"
            >
              <RotateCcw size={16} />
              Try Again
            </Button>
          </div>
        ) : filteredItems.length > 0 ? (

          /* Original Menu Card Grid। */
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">

            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
              />
            ))}

          </div>
        ) : (

          /* Original Empty State। */
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-orange-200 bg-orange-50/50 px-5 py-20 text-center">

            <Pizza
              size={52}
              className="mb-5 text-[#D62828]"
            />

            <h3 className="text-2xl font-bold text-stone-900">
              No pizzas found
            </h3>

            <p className="mt-3 max-w-md text-stone-600">
              Try another search term or clear your
              filters to discover more delicious options.
            </p>

            <Button
              onClick={resetFilters}
              className="mt-6 rounded-full bg-[#D62828] hover:bg-[#B91C1C]"
            >
              Clear All Filters
            </Button>
          </div>
        )}

      </section>
    </div>
  );
}