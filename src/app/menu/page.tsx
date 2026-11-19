import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BrowseMenu from "@/components/menu/BrowseMenu";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Browse Menu | PizzaHub",
  description: "Discover delicious pizzas from local restaurants.",
};

function MenuLoading() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-16">
      <Skeleton className="mb-8 h-12 w-72 max-w-full" />
      <Skeleton className="mb-10 h-24 w-full rounded-2xl" />
      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <Skeleton
            key={item}
            className="h-96 rounded-3xl"
          />
        ))}
      </div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <>
      <Navbar />
      <main>
        <Suspense fallback={<MenuLoading />}>
          <BrowseMenu />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}