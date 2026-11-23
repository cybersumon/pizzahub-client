
"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  MapPin,
  Phone,
  FileText,
  ImagePlus,
  Loader2,
  ArrowLeft,
  Save,
  CheckCircle2,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:7000";

type Restaurant = {
  _id?: string;
  id?: string;
  name: string;
  address: string;
  phone: string;
  description?: string;
  logo?: string | null;
  status: "pending" | "approved" | "rejected";
  plan: "free" | "premium" | "premium_plus";
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

async function parseApiResponse<T>(
  response: Response
): Promise<ApiResponse<T>> {
  const text = await response.text();

  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    throw new Error(
      `Server returned HTTP ${response.status} instead of JSON.`
    );
  }
}

export default function RestaurantSetupPage() {
  const router = useRouter();

  const { data: session, isPending } =
    authClient.useSession();

  const [checking, setChecking] = useState(true);
  const [existing, setExisting] =
    useState<Restaurant | null>(null);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isEdit = existing !== null;

  // Load the current restaurant when the session is ready.
  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/sign-in");
      return;
    }

    const controller = new AbortController();

    async function loadRestaurant() {
      setChecking(true);

      try {
        const response = await fetch(
          `${API_URL}/api/restaurants/me`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const result =
          await parseApiResponse<Restaurant | null>(
            response
          );

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Unable to load restaurant."
          );
        }

        if (controller.signal.aborted) return;

        const restaurant = result.data ?? null;

        setExisting(restaurant);

        if (restaurant) {
          setName(restaurant.name ?? "");
          setAddress(restaurant.address ?? "");
          setPhone(restaurant.phone ?? "");
          setDescription(
            restaurant.description ?? ""
          );
          setLogo(restaurant.logo ?? "");
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load restaurant."
        );
      } finally {
        if (!controller.signal.aborted) {
          setChecking(false);
        }
      }
    }

    void loadRestaurant();

    return () => controller.abort();
  }, [isPending, session?.user?.id, router]);

  // Upload the selected logo to ImgBB.
  async function handleLogoUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const key =
      process.env.NEXT_PUBLIC_IMGBB_API_KEY;

    if (!key) {
      setError(
        "ImgBB API key is not configured."
      );
      event.target.value = "";
      return;
    }

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(
        file.type
      )
    ) {
      setError(
        "Only JPG, PNG and WebP images are allowed."
      );
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Logo must be smaller than 2 MB.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    setError("");

    try {
      const form = new FormData();
      form.append("image", file);

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${encodeURIComponent(key)}`,
        {
          method: "POST",
          body: form,
        }
      );

      const result = (await response.json()) as {
        success?: boolean;
        data?: {
          url?: string;
          image?: { url?: string };
        };
        error?: { message?: string };
      };

      const imageUrl =
        result.data?.image?.url ??
        result.data?.url;

      if (
        !response.ok ||
        !result.success ||
        typeof imageUrl !== "string"
      ) {
        throw new Error(
          result.error?.message ||
            "Logo upload failed."
        );
      }

      const parsedUrl = new URL(imageUrl);

      // Match the domain accepted by the backend.
      if (
        parsedUrl.protocol !== "https:" ||
        parsedUrl.hostname !== "i.ibb.co"
      ) {
        throw new Error(
          "ImgBB returned an unsupported image URL."
        );
      }

      setLogo(imageUrl);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload logo."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  // Create a new restaurant or update the existing one.
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving || uploading || checking) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        isEdit
          ? `${API_URL}/api/restaurants/me`
          : `${API_URL}/api/restaurants`,
        {
          method: isEdit ? "PATCH" : "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            address: address.trim(),
            phone: phone.trim(),
            description: description.trim(),
            ...(logo ? { logo } : isEdit ? { logo: null } : {}),
          }),
        }
      );

      const result =
        await parseApiResponse<Restaurant>(
          response
        );

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to save restaurant."
        );
      }

      setSuccess(
        isEdit
          ? "Restaurant profile updated successfully."
          : "Restaurant registration submitted successfully."
      );

      window.location.replace(
        "/dashboard/vendor"
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save restaurant."
      );
    } finally {
      setSaving(false);
    }
  }

  if (isPending || checking) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-[#FFF9F2]">
        <div className="flex items-center gap-3 text-sm text-stone-600">
          <Loader2
            size={20}
            className="animate-spin text-red-600"
          />
          Loading restaurant information...
        </div>
      </main>
    );
  }

  if (!session?.user) return null;

  return (
    <main className="min-h-screen bg-[#FFF9F2] px-4 py-10 text-stone-900 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/dashboard/vendor"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700"
        >
          <ArrowLeft size={17} />
          Back to Vendor Dashboard
        </Link>

        <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-[0_16px_45px_rgba(89,49,25,0.08)] sm:p-9">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-[#D62828]">
              <Store size={27} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-red-600">
                PizzaHub Vendor
              </p>

              <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                {isEdit
                  ? "Edit Restaurant Profile"
                  : "Register Your Restaurant"}
              </h1>

              <p className="mt-2 text-sm leading-6 text-stone-500">
                {isEdit
                  ? "Keep your restaurant information up to date."
                  : "Tell us about your restaurant to get started."}
              </p>
            </div>
          </div>

          {isEdit && (
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold capitalize text-green-700">
                Status: {existing.status}
              </span>

              <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold capitalize text-orange-700">
                Plan: {existing.plan.replaceAll("_", "+")}
              </span>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {success && (
            <div
              role="status"
              className="mt-6 flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-700"
            >
              <CheckCircle2 size={18} />
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6"
          >
            <div>
              <label
                htmlFor="restaurant-logo"
                className="mb-3 block text-sm font-bold"
              >
                Restaurant Logo
              </label>

              <div className="flex flex-wrap items-center gap-5 rounded-2xl border border-stone-200 bg-stone-50/60 p-5">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-white">
                  {logo ? (
                    <img
                      src={logo}
                      alt="Restaurant logo preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Store
                      size={35}
                      className="text-stone-300"
                    />
                  )}
                </div>

                <div className="flex-1">
                  <label
                    htmlFor="restaurant-logo"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-red-600 shadow-sm ring-1 ring-stone-200 hover:bg-red-50"
                  >
                    {uploading ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <ImagePlus size={17} />
                    )}

                    {uploading
                      ? "Uploading..."
                      : logo
                        ? "Change Logo"
                        : "Upload Logo"}
                  </label>

                  <input
                    id="restaurant-logo"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={uploading || saving}
                    onChange={handleLogoUpload}
                    className="sr-only"
                  />

                  <p className="mt-2 text-xs text-stone-500">
                    PNG, JPG or WebP. Maximum 2 MB.
                  </p>

                  {logo && (
                    <button
                      type="button"
                      onClick={() => setLogo("")}
                      disabled={uploading || saving}
                      className="mt-2 text-xs font-semibold text-red-600 hover:underline"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="restaurant-name"
                className="mb-2 block text-sm font-bold"
              >
                Restaurant Name
              </label>

              <div className="relative">
                <Store
                  size={18}
                  className="absolute left-4 top-3.5 text-stone-400"
                />
                <input
                  id="restaurant-name"
                  required
                  minLength={3}
                  maxLength={120}
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Your restaurant name"
                  className="h-12 w-full rounded-xl border border-stone-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="restaurant-address"
                className="mb-2 block text-sm font-bold"
              >
                Address
              </label>

              <div className="relative">
                <MapPin
                  size={18}
                  className="absolute left-4 top-3.5 text-stone-400"
                />
                <input
                  id="restaurant-address"
                  required
                  minLength={5}
                  maxLength={250}
                  value={address}
                  onChange={(event) =>
                    setAddress(event.target.value)
                  }
                  placeholder="Street, area and city"
                  className="h-12 w-full rounded-xl border border-stone-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="restaurant-phone"
                className="mb-2 block text-sm font-bold"
              >
                Phone Number
              </label>

              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-4 top-3.5 text-stone-400"
                />
                <input
                  id="restaurant-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="+8801XXXXXXXXX"
                  className="h-12 w-full rounded-xl border border-stone-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="restaurant-description"
                className="mb-2 block text-sm font-bold"
              >
                Description
              </label>

              <div className="relative">
                <FileText
                  size={18}
                  className="absolute left-4 top-4 text-stone-400"
                />
                <textarea
                  id="restaurant-description"
                  rows={4}
                  maxLength={1000}
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Tell customers about your restaurant"
                  className="w-full resize-none rounded-xl border border-stone-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-red-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={
                saving ||
                uploading ||
                checking
              }
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#D62828] px-5 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Save size={18} />
              )}

              {saving
                ? "Saving..."
                : isEdit
                  ? "Save Restaurant Changes"
                  : "Register Restaurant"}
            </button>
          </form>

          {isEdit && (
            <p className="mt-5 text-center text-xs leading-6 text-stone-400">
              Updating restaurant details does not
              change your approval or subscription.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
