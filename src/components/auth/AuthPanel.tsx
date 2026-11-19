import Image from "next/image";
import type { ReactNode } from "react";
import { Pizza } from "lucide-react";

// Shared authentication layout props।
interface AuthPanelProps {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}

export default function AuthPanel({
  children,
  eyebrow,
  title,
  description,
}: AuthPanelProps) {
  return (
    <main className="w-full bg-[#FFF9F2]">

      <div className="grid w-full overflow-hidden md:grid-cols-2">

        {/*  LEFT — PIZZA BRANDING PANEL */}

        <div className="relative hidden min-h-120 bg-[#431B16] md:block">

          {/* Existing PizzaHub pizza image। */}
          <Image
            src="/images/pizzas/pepperoni.jpg"
            alt="Delicious Pizza"
            fill
            sizes="480px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-black/60" />

          <div className="absolute inset-0 flex flex-col justify-between p-8 text-white">

            {/* PizzaHub Logo/Brand */}
            <div className="flex items-center gap-2 text-2xl font-extrabold">
              <Pizza size={28} className="text-orange-300" />
              PizzaHub
            </div>

            {/* Bottom promotional content */}
            <div>
              <h2 className="text-3xl font-extrabold leading-tight">
                Every Slice,
                <span className="block text-orange-300">
                  A Happy Moment.
                </span>
              </h2>

              <p className="mt-4 text-sm leading-7 text-white/85">
                Discover delicious pizzas from your favorite
                local restaurants.
              </p>
            </div>
          </div>
        </div>

        {/* ====================================
            RIGHT — AUTHENTICATION CONTENT
            ==================================== */}
        <section className="min-w-0 bg-[#FFFCF8] px-6 py-5 sm:px-9 sm:py-6">

          {/* Mobile screen-এ branding */}
          <div className="mb-4 flex items-center gap-2 text-xl font-extrabold text-[#D62828] md:hidden">
            <Pizza size={24} />
            PizzaHub
          </div>

          {/* Small eyebrow text */}
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#D62828]">
            {eyebrow}
          </p>

          {/* Title */}
          <h1 className="mt-2 text-3xl font-extrabold text-stone-900">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="mt-2 text-sm leading-5 text-stone-500">
            {description}
          </p>

          <div className="mt-4">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}