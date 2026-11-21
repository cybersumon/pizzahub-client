"use client";

import {
  getUserProfile,
  getDashboardPath,
} from "@/lib/user-profile";
import { useState, type FormEvent } from "react";
import Link from "next/link";
// import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Mail, ArrowRight } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import AuthPanel from "@/components/auth/AuthPanel";

// Customer, Vendor & Admin — login form।
export default function SignInPage() {
  // const router = useRouter();

  // Email/password state।
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Password show/hide।
  const [showPassword, setShowPassword] = useState(false);

  // Loading & error management।
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login form submit।
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Better Auth backend-login request।
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (result.error) {
        setError(result.error.message || "Unable to sign in.");
        return;
      }
      const profile = await getUserProfile();

      const destination = getDashboardPath(profile.role);

      window.location.replace(destination);
    } catch {
      setError("Could not connect to the authentication server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPanel
      eyebrow="Welcome back"
      title="Sign in to PizzaHub"
      description="One account, one login — for customers, restaurants and admins."
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Email field */}
        <div>
          <label
            htmlFor="signin-email"
            className="mb-2 block text-sm font-bold text-stone-700"
          >
            Email Address
          </label>

          <div className="relative">
            <Mail
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
            />

            <input
              id="signin-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="h-13 w-full rounded-2xl border border-stone-200 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-[#D62828] focus:ring-2 focus:ring-red-100"
            />
          </div>
        </div>

        {/* Password field */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="signin-password"
              className="text-sm font-bold text-stone-700"
            >
              Password
            </label>
          </div>

          <div className="relative">
            <LockKeyhole
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
            />

            <input
              id="signin-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="h-13 w-full rounded-2xl border border-stone-200 bg-white pl-12 pr-12 text-sm outline-none transition focus:border-[#D62828] focus:ring-2 focus:ring-red-100"
            />

            {/* Password visibility toggle। */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-[#D62828]"
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
        </div>

        {/* Authentication error। */}
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* Login submit। */}
        <button
          type="submit"
          disabled={loading}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#D62828] font-bold text-white transition hover:bg-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
          {!loading && <ArrowRight size={19} />}
        </button>
      </form>


      <div className="mt-6 border-t border-stone-200 pt-5 text-center text-sm text-stone-600">
        New to PizzaHub?{" "}
        <Link href="/sign-up" className="font-extrabold text-[#D62828]">
          Create Account
        </Link>
      </div>
    </AuthPanel>
  );
}