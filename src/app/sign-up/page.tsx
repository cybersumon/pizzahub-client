"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ShoppingBag,
  Store,
  Eye,
  EyeOff,
  UserRound,
  Mail,
  LockKeyhole,
  ArrowRight,
} from "lucide-react";

// Shared authentication design।
import AuthPanel from "@/components/auth/AuthPanel";

// Better Auth client।
import { authClient } from "@/lib/auth-client";

// Registration account selection type।
type AccountType = "customer" | "restaurant";

export default function SignUpPage() {
  const router = useRouter();
  const [accountType, setAccountType] =
    useState<AccountType>("customer");

  // Registration form values।
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state।
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Better Auth registration function।
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (result.error) {
        setError(
          result.error.message || "Account creation failed."
        );
        return;
      }


      // ===========================================
// REGISTRATION SUCCESS — SESSION CHECK
// ===========================================

const sessionResult = await authClient.getSession();

if (!sessionResult.data?.user) {
  setError(
    "Account created successfully, but you are not signed in. Please sign in to continue."
  );
  return;
}

const destination =
  accountType === "restaurant"
    ? "/restaurant/setup"
    : "/dashboard/customer";

window.location.replace(destination);
return;

window.location.replace(destination);
return;

       if (accountType === "restaurant") {
        // if Restaurant go to onboarding page.
        router.replace("/restaurant/setup");
      } else {
        // if Customer go to homepage.
        router.replace("/");
      }

      // new session information refresh
      router.refresh();
    } catch {
      setError("Unable to connect to the authentication server.");
    } finally {
      setLoading(false);
    }
  }

  const selectedStyle =
    "border-[#D62828] bg-[#FFF1EE] text-[#D62828]";

  const unselectedStyle =
    "border-stone-200 bg-white text-stone-600 hover:border-red-200";

  return (
    <AuthPanel
      eyebrow="Join PizzaHub"
      title="Create Account"
      description="Choose how you want to join our community."
    >
      {/* =========================================
          ACCOUNT TYPE SELECTOR
          ========================================= */}
      <div className="grid grid-cols-2 gap-3">

        {/* CUSTOMER BUTTON */}
        <button
          type="button"
          onClick={() => setAccountType("customer")}
          aria-pressed={accountType === "customer"}
          className={
            "flex h-22 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl border-2 px-3 text-center transition-colors " +
            (accountType === "customer"
              ? selectedStyle
              : unselectedStyle)
          }
        >
          <ShoppingBag size={22} />

          <span className="text-sm font-extrabold">
            Customer
          </span>

          <span className="text-[11px]">
            Order delicious pizzas
          </span>
        </button>

        {/* RESTAURANT BUTTON */}
        <button
          type="button"
          onClick={() => setAccountType("restaurant")}
          aria-pressed={accountType === "restaurant"}
          className={
            "flex h-22 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl border-2 px-3 text-center transition-colors " +
            (accountType === "restaurant"
              ? selectedStyle
              : unselectedStyle)
          }
        >
          <Store size={22} />

          <span className="text-sm font-extrabold">
            Restaurant
          </span>

          <span className="text-[11px]">
            Sell with PizzaHub
          </span>
        </button>
      </div>

      {/* =========================================
          FIXED HEIGHT INFORMATION AREA
          =========================================

      */}
      <div className="mt-2 flex h-10 items-center">
        <p className="text-xs leading-4 text-stone-500">
          {accountType === "restaurant"
            ? "Create your account first. Restaurant setup comes next."
            : "Join PizzaHub and discover your favorite pizzas."}
        </p>
      </div>

      {/* =========================================
          REGISTRATION FORM
          ========================================= */}
      <form
        onSubmit={handleSubmit}
        className="mt-2 space-y-3"
      >
        {/* FULL NAME */}
        <div>
          <label
            htmlFor="signup-name"
            className="mb-1.5 block text-sm font-semibold text-stone-700"
          >
            Full Name
          </label>

          <div className="relative">
            <UserRound
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
            />

            <input
              id="signup-name"
              type="text"
              required
              minLength={2}
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your full name"
              className="h-11 w-full rounded-xl border border-stone-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#D62828] focus:ring-2 focus:ring-red-100"
            />
          </div>
        </div>

        {/* EMAIL ADDRESS */}
        <div>
          <label
            htmlFor="signup-email"
            className="mb-1.5 block text-sm font-semibold text-stone-700"
          >
            Email Address
          </label>

          <div className="relative">
            <Mail
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
            />

            <input
              id="signup-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="h-11 w-full rounded-xl border border-stone-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#D62828] focus:ring-2 focus:ring-red-100"
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div>
          <label
            htmlFor="signup-password"
            className="mb-1.5 block text-sm font-semibold text-stone-700"
          >
            Password
          </label>

          <div className="relative">
            <LockKeyhole
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
            />

            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 8 characters"
              className="h-11 w-full rounded-xl border border-stone-200 bg-white pl-11 pr-11 text-sm outline-none transition focus:border-[#D62828] focus:ring-2 focus:ring-red-100"
            />

            {/* PASSWORD VISIBILITY */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword ? "Hide password" : "Show password"
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-[#D62828]"
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-3 text-xs text-red-700"
          >
            {error}
          </p>
        )}

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#D62828] text-sm font-bold text-white transition hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating Account..." : "Create Account"}

          {!loading && <ArrowRight size={17} />}
        </button>
      </form>

      {/* SIGN IN LINK */}
      <p className="mt-4 text-center text-xs text-stone-600">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-extrabold text-[#D62828] hover:underline"
        >
          Sign In
        </Link>
      </p>
    </AuthPanel>
  );
}