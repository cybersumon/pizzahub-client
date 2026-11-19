import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Store, ArrowLeft, CheckCircle2 } from "lucide-react";
import { menuItems } from "@/data/menu-items";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const instant = false;

interface ItemDetailsPageProps {
  params: Promise<{ id: string }>;
}
export default async function ItemDetailsPage({
  params,
}: ItemDetailsPageProps) {
  const { id } = await params;
  const item = menuItems.find((pizza) => pizza.id === id);

  if (!item) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FFF7ED] py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Link
            href="/menu"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-[#D62828]"
          >
            <ArrowLeft size={18} />
            Back to Menu
          </Link>
          <div className="grid items-start gap-10 lg:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-orange-100 shadow-lg">
              <Image
                src={item.image}
                alt={item.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-9">
              <span className="inline-block rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-[#D62828]">
                {item.category}
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-tight text-stone-900 sm:text-5xl">
                {item.name}
              </h1>
              <p className="mt-5 text-4xl font-extrabold text-[#D62828]">
                ৳{item.price.toLocaleString("en-BD")}
              </p>

              <p className="mt-6 leading-8 text-stone-600">
                Discover a delicious pizza prepared with
                carefully selected ingredients by a local restaurant.
                Perfect for your next pizza craving.
              </p>
              <div className="mt-8 space-y-4 border-t border-stone-100 pt-6">

                <div className="flex items-center gap-3 text-stone-700">
                  <Store size={20} className="text-[#D62828]" />
                  <span className="font-semibold">
                    {item.vendorName}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-stone-600">
                  <MapPin size={20} className="text-[#D62828]" />
                  <span>{item.location}</span>
                </div>

                {item.isPremium && (
                  <div className="flex items-center gap-3 text-orange-600">
                    <CheckCircle2 size={20} />
                    <span className="font-semibold">
                      Premium Restaurant
                    </span>
                  </div>
                )}
              </div>

              <Link
                href="/sign-in"
                className="mt-9 flex h-14 w-full items-center justify-center rounded-full bg-[#D62828] px-6 text-base font-bold text-white transition hover:bg-[#B91C1C]"
              >
                Sign In to Order
              </Link>

              <p className="mt-4 text-center text-sm text-stone-500">
                Sign in as a customer to place your order.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}