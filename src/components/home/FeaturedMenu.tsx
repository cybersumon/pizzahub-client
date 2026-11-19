import MenuItemCard, {
  type MenuItem,
} from "@/components/menu/MenuItemCard";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";

const featuredItems: MenuItem[] = [
  {
    id: "1", 
    name: "Classic Margherita", 
    category: "Classic Pizzas", 
    price: 599, 
    image: "/images/pizzas/margherita.jpg", 
    vendorName: "Pizza Palace", 
    location: "Dhanmondi, Dhaka", 
    isPremium: true, 
  },
  {
    id: "2",
    name: "Pepperoni Feast",
    category: "Meat Lovers",
    price: 799,
    image: "/images/pizzas/pepperoni.jpg",
    vendorName: "Urban Slice",
    location: "Gulshan, Dhaka",
    isPremium: false,
  },
  {
    id: "3",
    name: "Garden Fresh Veggie",
    category: "Vegetarian Pizzas",
    price: 649,
    image: "/images/pizzas/veggie.jpg",
    vendorName: "Green Oven",
    location: "Banani, Dhaka",
    isPremium: true,
  },
  {
    id: "4",
    name: "BBQ Chicken Supreme",
    category: "Specialty / Gourmet Pizzas",
    price: 899,
    image: "/images/pizzas/bbq-chicken.jpg",
    vendorName: "Firewood Kitchen",
    location: "Uttara, Dhaka",
    isPremium: true,
  },
  {
    id: "5",
    name: "Ultimate Meat Lovers",
    category: "Meat Lovers",
    price: 999,
    image: "/images/pizzas/meat-lovers.jpg",
    vendorName: "Pizza Factory",
    location: "Mirpur, Dhaka",
    isPremium: false,
  },
  {
    id: "6",
    name: "Four Cheese Delight",
    category: "Specialty / Gourmet Pizzas",
    price: 849,
    image: "/images/pizzas/four-cheese.jpg",
    vendorName: "Cheese House",
    location: "Mohammadpur, Dhaka",
    isPremium: true,
  },
];

export default function FeaturedMenu() {
  
  return (
    <section className="bg-white py-20 lg:py-10">
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
            <p className="mt-4 text-base leading-7 text-stone-600">
              Handpicked favorites from local restaurants.
              Discover irresistible flavors made just for you.
            </p>
          </div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 font-bold text-[#D62828] transition-colors hover:text-[#B91C1C]"
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