"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

// Customer registration form।
export default function SignUpPage() {
  const router = useRouter();

  // Form fields-এর state।
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Loading ও error state।
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Submit করলে Better Auth API-তে registration পাঠাব।
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Better Auth-এর built-in email signup।
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      // Backend error থাকলে form-এ দেখাব।
      if (result.error) {
        setError(result.error.message || "Registration failed.");
        return;
      }

      // Registration সফল হলে sign-in page।
      router.push("/sign-in");
    } catch {
      setError("Cannot connect to the authentication server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF9F2] px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-orange-100 bg-white p-7 shadow-xl sm:p-9">

        <Link
          href="/"
          className="text-xl font-extrabold text-[#D62828]"
        >
          PizzaHub
        </Link>

        <h1 className="mt-6 text-3xl font-extrabold text-stone-900">
          Create an Account
        </h1>

        <p className="mt-2 text-sm text-stone-500">
          Join PizzaHub to discover and order your favorite pizza.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">

          {/* Customer name */}
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-semibold">
              Full Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              minLength={2}
              autoComplete="name"
              className="h-12 w-full rounded-xl border border-stone-200 px-4 outline-none focus:border-[#D62828]"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email address */}
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              className="h-12 w-full rounded-xl border border-stone-200 px-4 outline-none focus:border-[#D62828]"
              placeholder="you@example.com"
            />
          </div>

          {/* Minimum 8-character password */}
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold">
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
              autoComplete="new-password"
              className="h-12 w-full rounded-xl border border-stone-200 px-4 outline-none focus:border-[#D62828]"
              placeholder="Minimum 8 characters"
            />
          </div>

          {/* Error message */}
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
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-600">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-bold text-[#D62828]">
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}