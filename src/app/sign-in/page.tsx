"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

// Email/password login page।
export default function SignInPage() {
  const router = useRouter();

  // Form state।
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Request state।
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login form submit handler।
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Better Auth backend-এ credentials পাঠাচ্ছি।
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      // Invalid credentials বা অন্য error।
      if (result.error) {
        setError(result.error.message || "Unable to sign in.");
        return;
      }

      // Login successful হলে আপাতত homepage।
      // Dashboard তৈরি হলে role অনুযায়ী redirect করব।
      router.push("/");
      router.refresh();
    } catch {
      setError("Authentication server is not available.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF9F2] px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-orange-100 bg-white p-7 shadow-xl sm:p-9">

        <Link href="/" className="text-xl font-extrabold text-[#D62828]">
          PizzaHub
        </Link>

        <h1 className="mt-6 text-3xl font-extrabold text-stone-900">
          Welcome Back!
        </h1>

        <p className="mt-2 text-sm text-stone-500">
          Sign in to continue your PizzaHub experience.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">

          {/* Email input */}
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 w-full rounded-xl border border-stone-200 px-4 outline-none focus:border-[#D62828]"
              placeholder="you@example.com"
            />
          </div>

          {/* Password input */}
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold">
              Password
            </label>

            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 w-full rounded-xl border border-stone-200 px-4 outline-none focus:border-[#D62828]"
              placeholder="Enter your password"
            />
          </div>

          {/* Login error message */}
          {error && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-full bg-[#D62828] font-bold text-white hover:bg-[#B91C1C] disabled:opacity-60"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-600">
          New to PizzaHub?{" "}
          <Link href="/sign-up" className="font-bold text-[#D62828]">
            Create Account
          </Link>
        </p>
      </div>
    </main>
  );
}