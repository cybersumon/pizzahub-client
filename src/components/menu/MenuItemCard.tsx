import Image from "next/image";
import Link from "next/link";
import { MapPin, Store, ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MenuItem {
    id: string;
    name: string;
    category: string;
    price: number;
    image: string;
    vendorName: string;
    location: string;
    isPremium?: boolean;
}

interface MenuItemCardProps {
    item: MenuItem;
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

            <div className="relative h-56 overflow-hidden bg-orange-50">

                <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-stone-800 shadow-sm">
                    {item.category}
                </span>

                {item.isPremium && (
                    <span className="absolute right-4 top-4 rounded-full bg-[#F77F00] px-3 py-1 text-xs font-bold text-white">
                        Premium
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col p-5">

                <div className="mb-3 flex items-center gap-1 text-xs text-stone-500">
                    <MapPin size={14} />
                    <span>{item.location}</span>
                </div>

                <h3 className="mb-3 text-xl font-bold text-stone-900">
                    {item.name}
                </h3>

                <div className="mb-5 flex items-center gap-2 text-sm text-stone-500">
                    <Store size={15} />
                    <span>{item.vendorName}</span>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-stone-100 pt-4">

                    <p className="text-2xl font-extrabold text-[#D62828]">
                        ৳{item.price.toLocaleString("en-BD")}
                    </p>
                  

<Link

  href={`/menu/${item.id}`}
  className={cn(
    buttonVariants({ variant: "default" }),
    "gap-2 rounded-full bg-[#D62828] px-5 text-white hover:bg-[#B91C1C]"
  )}
>
  View Details
  <ArrowUpRight size={16} />
</Link>
                </div>
            </div>
        </article>
    );
}