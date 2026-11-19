
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import MenuItemCard from "@/components/menu/MenuItemCard";
import { menuItems } from "@/data/menu-items";
export default function FeaturedMenu() {
  const featuredItems = menuItems.slice(0, 6);
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
              <span className="text-[#D62828]">Pizzas</span>
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
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {featuredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
            />
          ))}
        </div>
      </div>
    </section>
  );
}