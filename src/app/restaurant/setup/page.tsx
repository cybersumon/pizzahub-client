"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, MapPin, Phone, FileText } from "lucide-react";

import { authClient } from "@/lib/auth-client";

// Backend API URL।
const API_URL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
  "http://localhost:7000";

export default function RestaurantSetupPage() {
  const router = useRouter();

  // Better Auth current session।
  const { data: session, isPending } = authClient.useSession();

  // Form state।
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");

  // Submit status।
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/sign-in");
    }
  }, [isPending, session, router]);

  // Restaurant registration submit।
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      //API request with Better Auth session cookie ।
      const response = await fetch(
        `${API_URL}/api/restaurants`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            address,
            phone,
            description,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.message || "Restaurant registration failed."
        );
        return;
      }

      setSuccess(
        "Restaurant registration submitted successfully!"
      );
    } catch {
      setError("Could not connect to the backend server.");
    } finally {
      setLoading(false);
    }
  }

  // Session loading indicator।
  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Checking your account...</p>
      </main>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#FFF9F2] px-4 py-12">

      <div className="mx-auto max-w-xl rounded-3xl border border-orange-100 bg-white p-7 shadow-lg sm:p-9">

        <Link
          href="/"
          className="text-xl font-extrabold text-[#D62828]"
        >
          PizzaHub
        </Link>

        <h1 className="mt-5 text-3xl font-extrabold text-stone-900">
          Register Your Restaurant
        </h1>

        <p className="mt-2 text-sm text-stone-500">
          Tell us about your restaurant to get started.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">

          {/* Restaurant Name */}
          <div>
            <label htmlFor="restaurant-name" className="mb-2 block text-sm font-semibold">
              Restaurant Name
            </label>

            <div className="relative">
              <Store className="absolute left-3 top-3.5 text-stone-400" size={18} />

              <input
                id="restaurant-name"
                required
                minLength={3}
                maxLength={120}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your restaurant name"
                className="h-12 w-full rounded-xl border border-stone-200 pl-10 pr-3 outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Restaurant Address */}
          <div>
            <label htmlFor="restaurant-address" className="mb-2 block text-sm font-semibold">
              Address
            </label>

            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 text-stone-400" size={18} />

              <input
                id="restaurant-address"
                required
                minLength={5}
                maxLength={250}
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Street, area and city"
                className="h-12 w-full rounded-xl border border-stone-200 pl-10 pr-3 outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Restaurant Phone */}
          <div>
            <label htmlFor="restaurant-phone" className="mb-2 block text-sm font-semibold">
              Phone Number
            </label>

            <div className="relative">
              <Phone className="absolute left-3 top-3.5 text-stone-400" size={18} />

              <input
                id="restaurant-phone"
                type="tel"
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+8801XXXXXXXXX"
                className="h-12 w-full rounded-xl border border-stone-200 pl-10 pr-3 outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Restaurant Description */}
          <div>
            <label htmlFor="restaurant-description" className="mb-2 block text-sm font-semibold">
              Description
            </label>

            <div className="relative">
              <FileText className="absolute left-3 top-3.5 text-stone-400" size={18} />

              <textarea
                id="restaurant-description"
                rows={3}
                maxLength={1000}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Tell customers about your restaurant"
                className="w-full resize-none rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-red-500"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {success && (
            <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-800">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || Boolean(success)}
            className="h-12 w-full rounded-xl bg-[#D62828] font-bold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Register Restaurant"}
          </button>

        </form>
      </div>
    </main>
  );
}