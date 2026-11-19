// এই component-এ React state ও browser interaction আছে।
// তাই Next.js-কে Client Component হিসেবে চালাতে বলছি।
"use client";

// useState = Search input-এর current value রাখবে।
// useMemo = Filtered results calculate করবে।
import { useMemo, useState } from "react";

// Next.js navigation hooks।
// useSearchParams = URL-এর category parameter পড়বে।
// useRouter = URL update করবে।
import { useRouter, useSearchParams } from "next/navigation";

// Search, Filter এবং Empty State-এর icons।
import { Search, SlidersHorizontal, Pizza, RotateCcw } from "lucide-react";

// ShadCN Input component।
import { Input } from "@/components/ui/input";

// ShadCN Button component।
import { Button } from "@/components/ui/button";

// আগে তৈরি করা reusable card।
import MenuItemCard from "@/components/menu/MenuItemCard";

// Shared sample data এবং filter options।
import {
  menuItems,
  menuCategories,
  menuLocations,
} from "@/data/menu-items";

// Sort-এর valid options TypeScript দিয়ে নির্ধারণ করছি।
type SortOption = "default" | "price-low" | "price-high";

// Browse Menu component।
export default function BrowseMenu() {
  // Next.js router ব্যবহার করে URL change করব।
  const router = useRouter();

  // Browser URL-এর query parameters পড়ছি।
  const searchParams = useSearchParams();

  // Search text React state-এ রাখছি।
  // User input দিলে page reload ছাড়াই result update হবে।
  const [search, setSearch] = useState("");

  // Location filter-এর current value।
  const [location, setLocation] = useState("all");

  // Price sort-এর current selection।
  const [sort, setSort] = useState<SortOption>("default");

  // URL থেকে selected category পড়ছি।
  // Example: /menu?category=Meat%20Lovers
  // Category না থাকলে "all" নির্বাচন করব।
  const category = searchParams.get("category") || "all";

  // Category পরিবর্তন করার function।
  // কখন চলবে? User category dropdown পরিবর্তন করলে।
  function handleCategoryChange(value: string) {
    // Existing query parameters-এর copy করছি।
    const params = new URLSearchParams(searchParams.toString());

    // All Categories হলে URL থেকে category সরিয়ে দেব।
    if (value === "all") {
      params.delete("category");
    } else {
      // অন্যথায় selected category URL-এ রাখব।
      params.set("category", value);
    }

    // নতুন URL তৈরি করছি।
    const queryString = params.toString();
    const nextUrl = queryString ? `/menu?${queryString}` : "/menu";

    // নতুন URL-এ navigate করবে, browser reload ছাড়াই।
    // scroll:false দিলে filter change-এ page top-এ যাবে না।
    router.replace(nextUrl, { scroll: false });
  }

  // Reset button-এর function।
  // Search, Category, Location এবং Sort সব reset করবে।
  function resetFilters() {
    setSearch("");
    setLocation("all");
    setSort("default");
    router.replace("/menu", { scroll: false });
  }

  // useMemo শুধু dependency পরিবর্তন হলে results calculate করবে।
  // Search, category, location বা sort বদলালে এটি আবার চলবে।
  const filteredItems = useMemo(() => {
    // Original array-এর copy নিচ্ছি।
    // Sort করার সময় original data যেন পরিবর্তিত না হয়।
    let results = [...menuItems];

    // Search text-এর দুই পাশের extra space বাদ দিচ্ছি।
    // lowercase করলে case-insensitive search করা যায়।
    const keyword = search.trim().toLowerCase();

    // Search text থাকলে matching items রাখব।
    if (keyword) {
      results = results.filter((item) =>
        // Pizza name অথবা restaurant name দিয়ে search হবে।
        item.name.toLowerCase().includes(keyword) ||
        item.vendorName.toLowerCase().includes(keyword)
      );
    }

    // Specific category selected হলে category filter করব।
    if (category !== "all") {
      results = results.filter(
        (item) => item.category === category
      );
    }

    // Specific location selected হলে location filter করব।
    if (location !== "all") {
      results = results.filter(
        (item) => item.location === location
      );
    }

    // Low to High = ছোট price আগে।
    if (sort === "price-low") {
      results.sort((a, b) => a.price - b.price);
    }

    // High to Low = বড় price আগে।
    if (sort === "price-high") {
      results.sort((a, b) => b.price - a.price);
    }

    // Final filtered এবং sorted array return করছি।
    return results;
  }, [search, category, location, sort]);

  return (
    // Browser-এর Browse Menu main content।
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
            <span className="text-[#D62828]">Slice</span>
          </h1>

          {/* Description। */}
          <p className="mx-auto mt-5 max-w-2xl leading-8 text-stone-600">
            Discover delicious pizzas, tasty sides and amazing flavors
            from your favorite local restaurants.
          </p>
        </div>
      </section>

      {/* Menu filters এবং cards। */}
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">

        {/* Filter section-এর title। */}
        <div className="mb-6 flex items-center gap-2">
          <SlidersHorizontal size={20} className="text-[#D62828]" />
          <h2 className="text-xl font-bold text-stone-900">
            Search & Filter
          </h2>
        </div>

        {/* Filter controls-এর responsive layout। */}
        <div className="grid gap-4 rounded-3xl border border-orange-100 bg-[#FFF7ED] p-5 md:grid-cols-2 lg:grid-cols-4">

          {/* Search field। */}
          <div>
            <label
              htmlFor="pizza-search"
              className="mb-2 block text-sm font-semibold text-stone-700"
            >
              Search Pizza
            </label>

            {/* Search icon ও Input একসঙ্গে। */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />

              {/* User টাইপ করার সঙ্গে সঙ্গে state পরিবর্তন। */}
              <Input
                id="pizza-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
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

            {/* Native select ব্যবহার করছি। */}
            {/* কেন? ShadCN version compatibility নিয়ে extra error এড়াতে। */}
            <select
              id="pizza-category"
              value={category}
              onChange={(event) =>
                handleCategoryChange(event.target.value)
              }
              className="h-11 w-full rounded-md border border-orange-100 bg-white px-3 text-sm text-stone-800"
            >
              <option value="all">All Categories</option>

              {/* Category array থেকে options তৈরি করছি। */}
              {menuCategories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Location dropdown। */}
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
              onChange={(event) => setLocation(event.target.value)}
              className="h-11 w-full rounded-md border border-orange-100 bg-white px-3 text-sm text-stone-800"
            >
              <option value="all">All Locations</option>

              {/* Unique restaurant locations দেখাচ্ছি। */}
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
                setSort(event.target.value as SortOption)
              }
              className="h-11 w-full rounded-md border border-orange-100 bg-white px-3 text-sm text-stone-800"
            >
              <option value="default">Default Order</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Results count এবং Reset button। */}
        <div className="my-8 flex flex-wrap items-center justify-between gap-4">

          {/* Filtered items-এর সংখ্যা দেখাচ্ছি। */}
          <p className="text-sm text-stone-600">
            Showing{" "}
            <strong className="text-stone-900">
              {filteredItems.length}
            </strong>{" "}
            menu items
          </p>

          {/* সব filters reset করার button। */}
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

        {/* Items থাকলে grid, না থাকলে Empty State। */}
        {filteredItems.length > 0 ? (
          // Responsive menu cards grid।
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">

            {/* প্রতিটি filtered pizza থেকে একটি card। */}
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
              />
            ))}
          </div>
        ) : (
          // কোনো item না মিললে helpful message দেখাব।
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-orange-200 bg-orange-50/50 px-5 py-20 text-center">

            {/* Empty State icon। */}
            <Pizza size={52} className="mb-5 text-[#D62828]" />

            {/* Empty State heading। */}
            <h3 className="text-2xl font-bold text-stone-900">
              No pizzas found
            </h3>

            {/* User-কে filter পরিবর্তনের পরামর্শ। */}
            <p className="mt-3 max-w-md text-stone-600">
              Try another search term or clear your filters
              to discover more delicious options.
            </p>

            {/* Reset button দিয়ে আবার সব items দেখাবে। */}
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