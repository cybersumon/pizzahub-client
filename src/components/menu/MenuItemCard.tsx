
import Image from "next/image";
import { Crown, MapPin, Store } from "lucide-react";
import MenuDetailsDialog from "./MenuDetailsDialog";

// ============================================
// MENU ITEM TYPES
// ============================================

export type VendorPlan =
  | "free"
  | "premium"
  | "premium_plus";

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  vendorName: string;
  location: string;
  description?: string;
  phone?: string;

  restaurantLogo?: string | null;
  restaurantImage?: string;
  galleryImages?: string[];

  cuisine?: string;
  rating?: number;
  reviewCount?: number;
  restaurantDescription?: string;
  facilities?: string[];
  isPremium?: boolean;

  subscriptionPlan?: VendorPlan;
}

interface MenuItemCardProps {
  item: MenuItem;
}

// ============================================
// RESTAURANT LOGO
// ============================================

function RestaurantLogo({
  name,
  logo,
}: {
  name: string;
  logo?: string | null;
}) {
  if (!logo) {
    return (
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-[#D62828]">
        <Store size={20} />
      </span>
    );
  }

  return (
    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-orange-100 bg-white p-1 shadow-sm">
      <Image
        src={logo}
        alt={`${name} restaurant logo`}
        fill
        sizes="48px"
        className="object-contain p-1"
      />
    </span>
  );
}

// ============================================
// REUSABLE MENU CARD
// ============================================

export default function MenuItemCard({
  item,
}: MenuItemCardProps) {
  const plan: VendorPlan =
    item.subscriptionPlan ?? "free";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Pizza image area */}
      <div className="relative h-56 overflow-hidden bg-orange-50">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Category badge */}
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-stone-800 shadow-sm">
          {item.category}
        </span>

        {/* Premium/Premium+ badge */}
        {plan !== "free" && (
          <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-[#F77F00] px-3 py-1 text-xs font-bold text-white">
            <Crown size={13} />
            {plan === "premium_plus"
              ? "Premium+"
              : "Premium"}
          </span>
        )}
      </div>

      {/* Card details area */}
      <div className="flex flex-1 flex-col p-5">
        {/* Restaurant location */}
        <div className="mb-3 flex items-center gap-1 text-xs text-stone-500">
          <MapPin size={14} className="shrink-0" />
          <span>{item.location}</span>
        </div>

        {/* Menu item name */}
        <h3 className="mb-3 text-xl font-bold text-stone-900">
          {item.name}
        </h3>

        {/* Restaurant branding */}
        <div className="mb-5 flex min-w-0 items-center gap-2.5">
          <RestaurantLogo
            name={item.vendorName}
            logo={item.restaurantLogo}
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-stone-700">
              {item.vendorName}
            </p>

            {plan !== "free" && (
              <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-orange-600">
                <Crown size={11} />
                {plan === "premium_plus"
                  ? "Premium+ Restaurant"
                  : "Premium Restaurant"}
              </p>
            )}
          </div>
        </div>

        {/* Price and original details dialog */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
          <p className="text-2xl font-extrabold text-[#D62828]">
            ৳{item.price.toLocaleString("en-BD")}
          </p>

          <MenuDetailsDialog item={item} />
        </div>
      </div>
    </article>
  );
}
