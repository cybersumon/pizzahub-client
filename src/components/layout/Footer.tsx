
import Link from "next/link";

import {
  Pizza,
  Mail,
  Globe,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Menu", href: "/menu" },
  { label: "Sign In", href: "/sign-in" },
  { label: "Sign Up", href: "/sign-up" },
];

export default function Footer() {
  const currentYear = 2026;

  return (
    <footer className="bg-[#1C1917] text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D62828]">
              <Pizza size={27} />
            </span>
            <span className="text-3xl font-extrabold">
              Pizza<span className="text-orange-400">Hub</span>
            </span>
          </Link>
          <p className="mt-6 max-w-md text-sm leading-8 text-stone-400">
            PizzaHub connects pizza lovers with local restaurants.
            Discover amazing flavors, order your favorites and
            make every occasion special.
          </p>

          <div className="mt-7 flex items-center gap-3">

            <span
              aria-label="Facebook profile not configured"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-800 text-stone-400"
            >
              <Globe size={18} />
            </span>
            <span
              aria-label="Instagram profile not configured"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-800 text-stone-400"
            >
              <Globe size={18} />
            </span>
          </div>
        </div>

        <div>
          <h3 className="mb-6 text-lg font-bold">Quick Links</h3>

          <ul className="space-y-4">

            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex items-center gap-2 text-sm text-stone-400 transition hover:text-orange-400"
                >
                  <ArrowUpRight size={14} />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-6 text-lg font-bold">Contact</h3>
          <div className="space-y-5 text-sm text-stone-400">

            <div className="flex items-start gap-3">
              <MapPin size={18} className="shrink-0 text-orange-400" />
              <span>Serving restaurants in Dhaka, Bangladesh</span>
            </div>


            <div className="flex items-start gap-3">
              <Mail size={18} className="shrink-0 text-orange-400" />
              <span>Customer support details coming soon</span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-stone-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-center text-sm text-stone-400 sm:flex-row lg:px-8">

          <p>© {currentYear} PizzaHub. All rights reserved.</p>

          <p>Fresh Pizza. Great Moments.</p>
        </div>
      </div>
    </footer>
  );
}