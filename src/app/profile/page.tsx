
"use client";

// ============================================
// PIZZAHUB — USER PROFILE PAGE
// LESSON 19 — STEP 6A
// MOBILE NUMBER INTEGRATION
// ============================================

// React Hooks।
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

// Next.js Link।
import Link from "next/link";

// Lucide Icons।
import {
  UserRound,
  Mail,
  Phone,
  ShieldCheck,
  ArrowLeft,
  Save,
  Loader2,
} from "lucide-react";

// Existing Avatar Components।
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";

// Existing Better Auth Client।
import { authClient } from "@/lib/auth-client";

// Existing User Profile Helpers।
import {
  getUserProfile,
  getDashboardPath,
  type UserProfile,
} from "@/lib/user-profile";

// ============================================
// BACKEND CONFIGURATION
// ============================================

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:7000";

// ============================================
// API RESPONSE TYPES
// ============================================

interface PhoneApiResponse {
  success: boolean;
  message?: string;
  data?: {
    phone: string;
  };
}

// ============================================
// HELPER — MOBILE NUMBER
// ============================================

// +880 অথবা 880 Format থেকে 01 Format।
function normalizeBDPhone(value: string): string {
  const cleaned = value.trim().replace(/[\s()-]/g, "");

  if (cleaned.startsWith("+880")) {
    return `0${cleaned.slice(4)}`;
  }

  if (cleaned.startsWith("880")) {
    return `0${cleaned.slice(3)}`;
  }

  return cleaned;
}

// ============================================
// MAIN PROFILE PAGE
// ============================================

export default function ProfilePage() {
  // ==========================================
  // AUTHENTICATION
  // ==========================================

  // বর্তমান Login Session।
  const { data: session, isPending } =
    authClient.useSession();

  // ==========================================
  // STATES
  // ==========================================

  // Existing Profile Information।
  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  // Editable Full Name।
  const [name, setName] = useState("");

  // নতুন: Editable Mobile Number।
  const [phone, setPhone] = useState("");

  // Loading এবং Saving State।
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Error এবং Success Messages।
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Authenticated User ID।
  const userId = session?.user?.id;

  // ==========================================
  // LOAD USER PROFILE
  // ==========================================

  useEffect(() => {
    // Session Loading চললে অপেক্ষা।
    if (isPending) return;

    // Login না থাকলে Sign In Page।
    if (!userId) {
      window.location.replace("/sign-in");
      return;
    }

    // Component Unmount হলে State Update বন্ধ।
    let active = true;

    async function loadProfile() {
      try {
        // Existing User Profile API।
        const profileData = await getUserProfile();

        // নতুন Mobile Number API।
        const phoneResponse = await fetch(
          `${API_URL}/api/profile/phone`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const phoneResult: PhoneApiResponse =
          await phoneResponse.json();

        if (
          !phoneResponse.ok ||
          !phoneResult.success
        ) {
          throw new Error(
            phoneResult.message ||
              "Unable to load mobile number."
          );
        }

        if (active) {
          // Existing Profile State।
          setProfile(profileData);
          setName(profileData.name);

          // নতুন Mobile Number State।
          setPhone(phoneResult.data?.phone ?? "");

          setError("");
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your profile."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [isPending, userId]);

  // ==========================================
  // PROFILE UPDATE
  // ==========================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) return;

    setError("");
    setSuccess("");

    // ========================================
    // NAME VALIDATION
    // ========================================

    const normalizedName = name.trim();

    if (
      normalizedName.length < 2 ||
      normalizedName.length > 120
    ) {
      setError(
        "Full name must contain 2 to 120 characters."
      );
      return;
    }

    // ========================================
    // MOBILE NUMBER VALIDATION
    // ========================================

    const normalizedPhone = normalizeBDPhone(phone);

    if (!/^01[3-9]\d{8}$/.test(normalizedPhone)) {
      setError(
        "Enter a valid Bangladeshi mobile number."
      );
      return;
    }

    setSaving(true);

    try {
      // ======================================
      // SAVE CUSTOMER MOBILE NUMBER
      // ======================================

      // Backend-এ Phone Save করা হচ্ছে।
      const phoneResponse = await fetch(
        `${API_URL}/api/profile/phone`,
        {
          method: "PATCH",

          credentials: "include",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            phone: normalizedPhone,
          }),
        }
      );

      const phoneResult: PhoneApiResponse =
        await phoneResponse.json();

      if (
        !phoneResponse.ok ||
        !phoneResult.success
      ) {
        throw new Error(
          phoneResult.message ||
            "Unable to save mobile number."
        );
      }

      // ======================================
      // SAVE NAME USING BETTER AUTH
      // ======================================

      // তোমার আগের Name Update Code।
      const result = await authClient.updateUser({
        name: normalizedName,
      });

      if (result.error) {
        throw new Error(
          result.error.message ||
            "Name update failed. Mobile number was saved."
        );
      }

      // ======================================
      // RELOAD UPDATED PROFILE
      // ======================================

      const updatedProfile =
        await getUserProfile();

      setProfile(updatedProfile);
      setName(updatedProfile.name);

      // Backend থেকে Normalized Phone।
      setPhone(
        phoneResult.data?.phone ?? normalizedPhone
      );

      setSuccess(
        "Profile updated successfully!"
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (isPending || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFF9F2]">
        <div className="flex items-center gap-3 text-stone-600">
          <Loader2
            size={22}
            className="animate-spin text-[#D62828]"
          />
          Loading your profile...
        </div>
      </main>
    );
  }

  // ==========================================
  // UNAUTHENTICATED USER
  // ==========================================

  if (!session?.user) {
    return null;
  }

  // ==========================================
  // PROFILE UNAVAILABLE
  // ==========================================

  if (!profile) {
    return (
      <main className="p-10 text-center">
        <p className="text-red-600">
          {error || "Profile unavailable."}
        </p>

        <Link
          href="/"
          className="mt-4 inline-block text-[#D62828]"
        >
          Back to Home
        </Link>
      </main>
    );
  }

  // ==========================================
  // PROFILE PAGE UI
  // ==========================================

  return (
    <main className="min-h-screen bg-[#FFF9F2] px-4 py-10">
      <div className="mx-auto max-w-3xl">

        {/* =====================================
            DASHBOARD NAVIGATION
            ===================================== */}

        <Link
          href={getDashboardPath(profile.role)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#D62828]"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        {/* =====================================
            PROFILE CONTAINER
            ===================================== */}

        <section className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">

          {/* ===================================
              PROFILE HEADER
              =================================== */}

          <div className="bg-[#D62828] px-8 py-10 text-white">
            <div className="flex flex-wrap items-center gap-5">

              {/* Existing User Avatar। */}
              <Avatar className="h-20 w-20 border-4 border-white">
                <AvatarImage
                  src={session.user.image || undefined}
                  alt={profile.name}
                />

                <AvatarFallback className="bg-orange-100 text-2xl font-bold text-[#D62828]">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* User Information। */}
              <div>
                <h1 className="text-3xl font-extrabold">
                  {profile.name}
                </h1>

                <p className="mt-2 text-sm text-white/80">
                  {profile.email}
                </p>

                {/* Existing Role Badge। */}
                <span className="mt-3 inline-block rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold capitalize">
                  {profile.role}
                </span>
              </div>

            </div>
          </div>

          {/* ===================================
              PERSONAL INFORMATION FORM
              =================================== */}

          <div className="p-6 sm:p-8">

            <h2 className="text-xl font-extrabold">
              Personal Information
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              View and manage your PizzaHub account.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >

              {/* =================================
                  FULL NAME — EDITABLE
                  ================================= */}

              <div>
                <label
                  htmlFor="profile-name"
                  className="mb-2 flex items-center gap-2 text-sm font-bold"
                >
                  <UserRound size={17} />
                  Full Name
                </label>

                <input
                  id="profile-name"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  required
                  minLength={2}
                  maxLength={120}
                  className="h-12 w-full rounded-xl border border-stone-200 px-4 outline-none focus:border-red-500"
                />
              </div>

              {/* =================================
                  MOBILE NUMBER — NEW
                  ================================= */}

              <div>
                <label
                  htmlFor="profile-phone"
                  className="mb-2 flex items-center gap-2 text-sm font-bold"
                >
                  <Phone size={17} />
                  Mobile Number
                </label>

                <input
                  id="profile-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  required
                  maxLength={20}
                  placeholder="01712345678"
                  className="h-12 w-full rounded-xl border border-stone-200 px-4 outline-none focus:border-red-500"
                />

                <p className="mt-2 text-xs text-stone-400">
                  Your saved mobile number can be used
                  for future pizza orders.
                </p>
              </div>

              {/* =================================
                  EMAIL ADDRESS — READ ONLY
                  ================================= */}

              <div>
                <label
                  htmlFor="profile-email"
                  className="mb-2 flex items-center gap-2 text-sm font-bold"
                >
                  <Mail size={17} />
                  Email Address
                </label>

                <input
                  id="profile-email"
                  value={profile.email}
                  readOnly
                  className="h-12 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 text-stone-500"
                />
              </div>

              {/* =================================
                  ACCOUNT ROLE — READ ONLY
                  ================================= */}

              <div>
                <label
                  htmlFor="profile-role"
                  className="mb-2 flex items-center gap-2 text-sm font-bold"
                >
                  <ShieldCheck size={17} />
                  Account Role
                </label>

                <input
                  id="profile-role"
                  value={profile.role}
                  readOnly
                  className="h-12 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 capitalize text-stone-500"
                />
              </div>

              {/* =================================
                  ERROR MESSAGE
                  ================================= */}

              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              {/* =================================
                  SUCCESS MESSAGE
                  ================================= */}

              {success && (
                <p
                  role="status"
                  className="rounded-xl bg-green-50 p-4 text-sm text-green-700"
                >
                  {success}
                </p>
              )}

              {/* =================================
                  SAVE PROFILE BUTTON
                  ================================= */}

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#D62828] px-6 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
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
                  : "Save Changes"}
              </button>

            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
