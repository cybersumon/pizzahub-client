"use client";

import { useEffect, useState } from "react";
import type {
  MenuItem,
  VendorPlan,
} from "@/components/menu/MenuItemCard";

// Express backend।
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:7000";

// Backend-এর সম্ভাব্য restaurant information।
interface ApiRestaurant {
  name?: string;
  address?: string;
  phone?: string;
  plan?: string;
  description?: string;
}

// Backend-এর menu item format।
interface ApiMenuItem {
  id?: string;
  _id?: string | { $oid: string };

  name?: string;
  itemName?: string;
  category?: string;
  description?: string;
  price?: number | string;

  image?: string;
  images?: string[];
  location?: string;

  vendorName?: string;
  phone?: string;

  subscriptionPlan?: string;
  plan?: string;
  isPremium?: boolean;

  restaurant?: ApiRestaurant;

  restaurantLogo?: string | null;
  restaurantImage?: string;
  galleryImages?: string[];

  isActive?: boolean;
  approvalStatus?: string;
}

// API Response।
interface PublicMenuResponse {
  success?: boolean;
  message?: string;

  data?: ApiMenuItem[] | {
    items?: ApiMenuItem[];
  };

  items?: ApiMenuItem[];
}

// ============================================
// NORMALIZE SUBSCRIPTION PLAN
// ============================================

function normalizePlan(value?: string): VendorPlan {
  const plan = (value ?? "free")
    .trim()
    .toLowerCase()
    .replace(/[\s+-]+/g, "_");

  if (
    plan === "premium_plus" ||
    plan === "premiumplus"
  ) {
    return "premium_plus";
  }

  if (plan === "premium") {
    return "premium";
  }

  return "free";
}

// ============================================
// NORMALIZE MENU ID
// ============================================

function getMenuId(item: ApiMenuItem): string {
  if (item.id) return item.id;

  if (typeof item._id === "string") {
    return item._id;
  }

  return item._id?.$oid ?? "";
}

// ============================================
// BACKEND ITEM -> EXISTING CARD FORMAT
// ============================================

function normalizeItem(item: ApiMenuItem): MenuItem {
  const plan = normalizePlan(
    item.subscriptionPlan ??
    item.plan ??
    item.restaurant?.plan
  );

  const mainImage =
    item.image ||
    item.images?.[0] ||
    "/images/pizzas/margherita.jpg";

  return {
    id: getMenuId(item),

    name:
      item.name ??
      item.itemName ??
      "Unnamed Menu Item",

    category: item.category ?? "Classic Pizzas",

    price: Number(item.price ?? 0),

    image: mainImage,

    vendorName:
      item.vendorName ??
      item.restaurant?.name ??
      "Restaurant",

    location:
      item.location ??
      item.restaurant?.address ??
      "Dhaka",

    description: item.description,

    phone:
      item.phone ??
      item.restaurant?.phone,

    subscriptionPlan: plan,

    isPremium: plan !== "free",

    restaurantLogo: item.restaurantLogo,
    restaurantImage: item.restaurantImage,

    galleryImages:
      item.galleryImages ??
      item.images ??
      [mainImage],

    restaurantDescription:
      item.restaurant?.description,
  };
}

// ============================================
// CUSTOM HOOK
// ============================================

export default function usePublicMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchMenu() {
      try {
        const response = await fetch(
          `${API_URL}/api/menu/public`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load menu (HTTP ${response.status})`
          );
        }

        const result: PublicMenuResponse =
          await response.json();

        if (result.success === false) {
          throw new Error(
            result.message || "Unable to load menu."
          );
        }

        // Backend response format অনুযায়ী items।
        const rawItems = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.data?.items)
            ? result.data.items
            : Array.isArray(result.items)
              ? result.items
              : [];

        // Card-এর জন্য valid ID থাকা item।
        const normalizedItems = rawItems
          .filter((item) => Boolean(getMenuId(item)))
          .map(normalizeItem);

        if (controller.signal.aborted) return;

        setItems(normalizedItems);
        setError("");
        setLoading(false);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to connect to the menu server."
        );

        setLoading(false);
      }
    }

    void fetchMenu();

    return () => controller.abort();
  }, [refreshKey]);

  function refresh() {
    setLoading(true);
    setError("");

    setRefreshKey((previous) => previous + 1);
  }

  return {
    items,
    loading,
    error,
    refresh,
  };
}