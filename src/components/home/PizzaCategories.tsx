import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
interface PizzaCategory {
  id: number;
  name: string;
  image: string;
  slug: string;
}

const categories: PizzaCategory[] = [
  {
    id: 1,
    name: "Classic Pizzas",
    image: "/images/categories/classic.jpg",
    slug: "Classic Pizzas",
  },
  {
    id: 2,
    name: "Vegetarian Pizzas",
    image: "/images/categories/vegetarian.jpg",
    slug: "Vegetarian Pizzas",
  },
  {
    id: 3,
    name: "Meat Lovers",
    image: "/images/categories/meat-lovers.jpg",
    slug: "Meat Lovers",
  },
  {
    id: 4,
    name: "Specialty / Gourmet",
    image: "/images/categories/gourmet.jpg",
    slug: "Specialty / Gourmet Pizzas",
  },
  {
    id: 5,
    name: "Sides & Appetizers",
    image: "/images/categories/sides.jpg",
    slug: "Sides & Appetizers",
  },
  {
    id: 6,
    name: "Beverages & Desserts",
    image: "/images/categories/beverages.jpg",
    slug: "Beverages & Desserts",
  },
];

export default function PizzaCategories() {
  return (
    <section className="bg-[#FFF7ED] py-20 lg:py-10">

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">

          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-[#D62828]">
            Explore Our Categories
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-[#1C1917] sm:text-5xl">
            Find Your Favorite{" "}
            <span className="text-[#D62828]">Flavor</span>
          </h2>


          <p className="mt-4 text-base leading-7 text-stone-600">
            From timeless classics to delicious new creations,
            there is something for every pizza lover.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-5">
          {categories.map((category) => (

            <Link
              key={category.id}
              href={`/menu?category=${encodeURIComponent(category.slug)}`}
              className="group relative flex flex-col items-center rounded-3xl border border-orange-100 bg-white p-4 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl"
            >

              <div className="relative mb-4 aspect-square w-full max-w-40 overflow-hidden rounded-full bg-orange-50">

                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 180px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              <h3 className="min-h-12 text-sm font-bold leading-5 text-stone-900 sm:text-base">
                {category.name}
              </h3>

              <span className="mt-3 flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-[#D62828] transition-colors group-hover:bg-[#D62828] group-hover:text-white">
                <ArrowUpRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}