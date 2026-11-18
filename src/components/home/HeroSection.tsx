import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#FFF7ED]">
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl" />

      <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700">
            <Star size={16} className="fill-orange-500 text-orange-500" />
            Freshly Baked, Happily Delivered
          </div>

          <h1 className="max-w-2xl text-5xl font-extrabold leading-[1.08] tracking-tight text-[#1C1917] sm:text-6xl xl:text-7xl">
            Every Slice
            <br />
            Tells a
            <span className="text-[#D62828]"> Delicious </span>
            Story.
          </h1>

          <p className="max-w-lg text-base leading-8 text-stone-600 sm:text-lg">
            Discover freshly baked pizzas from your favorite local
            restaurants. Explore amazing flavors and enjoy every bite.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/menu">
              <Button className="h-13 rounded-full bg-[#D62828] px-7 text-base font-bold text-white shadow-lg shadow-red-200 hover:bg-[#B91C1C]">
                Explore Pizza Menu <ArrowRight size={18} />
              </Button>
            </Link>

            <Link
              href="/sign-up"
              className="inline-flex h-13 items-center rounded-full border border-stone-300 px-7 font-semibold text-stone-800 transition hover:border-[#D62828] hover:text-[#D62828]"
            >
              Become a Vendor
            </Link>
          </div>

          <div className="flex flex-wrap gap-5 pt-3 text-sm font-medium text-stone-600">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-600" />
              Fresh Ingredients
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-600" />
              Trusted Restaurants
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[570px]">
          <div className="absolute inset-8 rounded-full bg-orange-300/40 blur-3xl" />

          <div className="relative overflow-hidden rounded-[3rem] border-8 border-white bg-orange-100 shadow-2xl">
            <Image
              src="/images/hero-pizza.jpg"
              alt="Freshly baked pepperoni pizza"
              width={900}
              height={900}
              priority
              className="aspect-square w-full object-cover"
            />
          </div>

          <div className="absolute -bottom-5 left-0 rounded-2xl border border-orange-100 bg-white px-5 py-4 shadow-xl sm:-left-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-2xl">
                🍕
              </span>
              <div>
                <p className="text-sm font-bold text-stone-900">
                  Made with Love
                </p>
                <p className="text-xs text-stone-500">
                  Fresh & Delicious
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}