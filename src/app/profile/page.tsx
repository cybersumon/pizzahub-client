"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import Link from "next/link";

import {
  UserRound,
  Mail,
  ShieldCheck,
  ArrowLeft,
  Save,
} from "lucide-react";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";

import { authClient } from "@/lib/auth-client";

import {
  getUserProfile,
  getDashboardPath,
  type UserProfile,
} from "@/lib/user-profile";

export default function ProfilePage() {
  // Current authenticated session।
  const { data: session, isPending } =
    authClient.useSession();

  // Profile information।
  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  // Form values।
  const [name, setName] = useState("");

  // Request state।
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const userId = session?.user?.id;

  useEffect(() => {
    if (isPending) return;

    if (!userId) {
      window.location.replace("/sign-in");
      return;
    }

    let active = true;

    async function loadProfile() {
      try {
        const data = await getUserProfile();

        if (active) {
          setProfile(data);
          setName(data.name);
        }
      } catch {
        if (active) {
          setError("Unable to load your profile.");
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

  // =========================================
  // PROFILE UPDATE
  // =========================================
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {

      const result = await authClient.updateUser({
        name: name.trim(),
      });

      if (result.error) {
        setError(
          result.error.message || "Profile update failed."
        );
        return;
      }

      const updatedProfile = await getUserProfile();

      setProfile(updatedProfile);
      setName(updatedProfile.name);
      setSuccess("Profile updated successfully!");
    } catch {
      setError("Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  }

  // Loading screen।
  if (isPending || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading your profile...</p>
      </main>
    );
  }

  if (!session?.user) {
    return null;
  }

  if (!profile) {
    return (
      <main className="p-10 text-center">
        <p className="text-red-600">
          {error || "Profile unavailable."}
        </p>

        <Link href="/" className="mt-4 inline-block">
          Back to Home
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF9F2] px-4 py-10">

      <div className="mx-auto max-w-3xl">

        {/* Dashboard navigation */}
        <Link
          href={getDashboardPath(profile.role)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#D62828]"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        {/* Profile container */}
        <section className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">

          {/* Profile header */}
          <div className="bg-[#D62828] px-8 py-10 text-white">
            <div className="flex flex-wrap items-center gap-5">

              <Avatar className="h-20 w-20 border-4 border-white">
                <AvatarImage
                  src={session.user.image || undefined}
                  alt={profile.name}
                />

                <AvatarFallback className="bg-orange-100 text-2xl font-bold text-[#D62828]">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div>
                <h1 className="text-3xl font-extrabold">
                  {profile.name}
                </h1>

                <p className="mt-2 text-sm text-white/80">
                  {profile.email}
                </p>

                <span className="mt-3 inline-block rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold capitalize">
                  {profile.role}
                </span>
              </div>

            </div>
          </div>

          {/* Profile information form */}
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
              {/* Editable full name */}
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

              {/* Error message */}
              {error && (
                <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </p>
              )}

              {/* Success message */}
              {success && (
                <p role="status" className="rounded-xl bg-green-50 p-4 text-sm text-green-700">
                  {success}
                </p>
              )}

              {/* Save profile button */}
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#D62828] px-6 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
              >
                <Save size={18} />

                {saving ? "Saving..." : "Save Changes"}
              </button>

            </form>
          </div>

        </section>
      </div>
    </main>
  );
}