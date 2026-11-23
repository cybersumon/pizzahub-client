
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
  Crown,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

// ============================================
// API CONFIGURATION
// ============================================

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

// ============================================
// API RESPONSE PARSER
// ============================================

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

// ============================================
// RESTAURANT PROFILE PAGE
// ============================================

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

  // ============================================
  // LOAD EXISTING RESTAURANT
  // ============================================

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

  // ============================================
  // IMGBB LOGO UPLOAD
  // ============================================

  async function handleLogoUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const key =
      process.env.NEXT_PUBLIC_IMGBB_API_KEY;

    if (!key) {
      setError("ImgBB API key is not configured.");
      event.target.value = "";
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
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
          image?: {
            url?: string;
          };
        };
        error?: {
          message?: string;
        };
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

  // ============================================
  // CREATE OR UPDATE RESTAURANT
  // ============================================

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
            ...(logo
              ? { logo }
              : isEdit
                ? { logo: null }
                : {}),
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

  // ============================================
  // LOADING STATE
  // ============================================

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

  const planLabel =
    existing?.plan === "premium_plus"
      ? "Premium+"
      : existing?.plan === "premium"
        ? "Premium"
        : "Free";

  // ============================================
  // PAGE UI
  // ============================================

  return (
    <main className="min-h-[calc(100vh-68px)] bg-[#FFF9F2] px-4 py-8 text-stone-900 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        {/* Back navigation */}
        <Link
          href="/dashboard/vendor"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#D62828] transition hover:text-red-700"
        >
          <ArrowLeft size={17} />
          Back to Vendor Dashboard
        </Link>

        {/* Main profile card */}
        <section className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-[0_16px_50px_rgba(89,49,25,0.07)]">
          {/* Profile header */}
          <div className="relative overflow-hidden border-b border-orange-100 bg-linear-to-br from-white via-[#FFFBF7] to-[#FFF1E5] px-6 py-7 sm:px-9 sm:py-9">
            <div className="pointer-events-none absolute -right-14 -top-20 h-52 w-52 rounded-full bg-orange-200/40 blur-3xl" />

            <div className="relative flex flex-wrap items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#D62828] text-white shadow-lg shadow-red-100">
                <Store size={27} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#D62828]">
                  PizzaHub Vendor Workspace
                </p>

                <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {isEdit
                    ? "Edit Restaurant Profile"
                    : "Register Your Restaurant"}
                </h1>

                <p className="mt-2 text-sm text-stone-500">
                  {isEdit
                    ? "Keep your restaurant branding and business details up to date."
                    : "Create your restaurant profile to get started."}
                </p>
              </div>
            </div>

            {/* Approval and plan information */}
            {isEdit && (
              <div className="relative mt-6 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-xs font-bold capitalize text-green-700">
                  <ShieldCheck size={14} />
                  {existing.status}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs font-bold text-orange-700">
                  <Crown size={14} />
                  {planLabel} Plan
                </span>
              </div>
            )}
          </div>

          {/* Form content */}
          <div className="p-6 sm:p-9">
            {error && (
              <p
                role="alert"
                className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            {success && (
              <div
                role="status"
                className="mb-6 flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-700"
              >
                <CheckCircle2 size={18} />
                {success}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              {/* ====================================
                  RESTAURANT BRANDING
                  ==================================== */}

              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-extrabold">
                    Restaurant Branding
                  </h2>

                  <p className="mt-1 text-sm text-stone-500">
                    Your logo appears beside your restaurant
                    name on PizzaHub.
                  </p>
                </div>

                <div className="flex flex-col gap-5 rounded-2xl border border-orange-100 bg-[#FFFCF8] p-5 sm:flex-row sm:items-center sm:p-6">
                  {/* Logo preview */}
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-orange-100 bg-white p-2 shadow-sm">
                    {logo ? (
                      <img
                        src={logo}
                        alt="Restaurant logo preview"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Store
                        size={38}
                        className="text-stone-300"
                      />
                    )}
                  </div>

                  {/* Logo upload controls */}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-stone-900">
                      Restaurant Logo
                    </p>

                    <p className="mt-1 text-xs leading-6 text-stone-500">
                      Upload a clear restaurant logo.
                      PNG, JPG or WebP. Maximum 2 MB.
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <label
                        htmlFor="restaurant-logo"
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#D62828] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
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

                      {logo && (
                        <button
                          type="button"
                          onClick={() => setLogo("")}
                          disabled={uploading || saving}
                          className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                        >
                          <Trash2 size={16} />
                          Remove Logo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ====================================
                  BUSINESS INFORMATION
                  ==================================== */}

              <div>
                <div className="mb-5">
                  <h2 className="text-lg font-extrabold">
                    Business Information
                  </h2>

                  <p className="mt-1 text-sm text-stone-500">
                    Manage your restaurant contact
                    information and description.
                  </p>
                </div>

                {/* Two columns on desktop */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {/* Restaurant Name */}
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
                        className="h-12 w-full rounded-xl border border-stone-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      />
                    </div>
                  </div>

                  {/* Restaurant Phone */}
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
                        className="h-12 w-full rounded-xl border border-stone-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      />
                    </div>
                  </div>

                  {/* Address spans both columns */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="restaurant-address"
                      className="mb-2 block text-sm font-bold"
                    >
                      Restaurant Address
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
                        className="h-12 w-full rounded-xl border border-stone-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      />
                    </div>
                  </div>

                  {/* Description spans both columns */}
                  <div className="md:col-span-2">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label
                        htmlFor="restaurant-description"
                        className="text-sm font-bold"
                      >
                        Description
                      </label>

                      <span className="text-xs text-stone-400">
                        {description.length}/1000
                      </span>
                    </div>

                    <div className="relative">
                      <FileText
                        size={18}
                        className="absolute left-4 top-4 text-stone-400"
                      />

                      <textarea
                        id="restaurant-description"
                        rows={5}
                        maxLength={1000}
                        value={description}
                        onChange={(event) =>
                          setDescription(
                            event.target.value
                          )
                        }
                        placeholder="Tell customers about your restaurant"
                        className="w-full resize-none rounded-xl border border-stone-200 bg-white py-3 pl-11 pr-4 text-sm leading-6 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ====================================
                  FORM ACTIONS
                  ==================================== */}

              <div className="flex flex-col-reverse items-center justify-between gap-4 border-t border-stone-100 pt-6 sm:flex-row">
                <Link
                  href="/dashboard/vendor"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-bold text-stone-700 transition hover:bg-stone-50 sm:w-auto"
                >
                  <ArrowLeft size={17} />
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    uploading ||
                    checking
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#D62828] px-7 py-3 text-sm font-bold text-white shadow-[0_8px_18px_rgba(214,40,40,0.15)] transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
              </div>
            </form>

            {isEdit && (
              <p className="mt-5 text-center text-xs leading-6 text-stone-400">
                Updating restaurant details does not
                change your approval status or subscription.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
