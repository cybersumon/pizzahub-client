"use client";

// React hooks।
import { useEffect, useState } from "react";

// Next.js navigation।
import Link from "next/link";

// Profile dropdown icons।
import {
  LayoutDashboard,
  UserRound,
  LogOut,
  ChevronDown,
} from "lucide-react";

// ShadCN Avatar।
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";

// Base UI compatible dropdown components।
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// Better Auth session।
import { authClient } from "@/lib/auth-client";

import {
  getUserProfile,
  getDashboardPath,
  type UserProfile,
} from "@/lib/user-profile";

export default function NavbarAuth() {
  // Current login session।
  const { data: session, isPending } =
    authClient.useSession();

  // User profile state।
  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  // Dropdown open/close state।
  const [open, setOpen] = useState(false);

  // Logout state।
  const [loggingOut, setLoggingOut] = useState(false);

  // Error state।
  const [error, setError] = useState("");

  const userId = session?.user?.id;

  // ==========================================
  // LOAD USER PROFILE
  // ==========================================

  useEffect(() => {
    let active = true;

    if (!userId) return;

    async function loadProfile() {
      try {
        const data = await getUserProfile();

        if (active) {
          setProfile(data);
        }
      } catch {
        if (active) {
          setProfile(null);
        }
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [userId]);

  // ==========================================
  // LOGOUT FUNCTION
  // ==========================================

  async function handleLogout() {
    setLoggingOut(true);
    setError("");

    try {
      const result = await authClient.signOut();

      if (result.error) {
        setError(
          result.error.message || "Unable to sign out."
        );
        return;
      }

      setOpen(false);

      window.location.replace("/");
    } catch {
      setError("Unable to connect to authentication server.");
    } finally {
      setLoggingOut(false);
    }
  }

  // ==========================================
  // SESSION LOADING
  // ==========================================

  if (isPending) {
    return (
      <div className="h-10 w-24 animate-pulse rounded-full bg-stone-200" />
    );
  }

  // ==========================================
  // USER NOT LOGGED IN
  // ==========================================

  if (!session?.user) {
    return (
      <div className="flex items-center gap-3">

        <Link
          href="/sign-in"
          className="rounded-full px-4 py-2 text-sm font-bold text-stone-700 transition hover:text-[#D62828]"
        >
          Sign In
        </Link>

        <Link
          href="/sign-up"
          className="rounded-full bg-[#D62828] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
        >
          Sign Up
        </Link>

      </div>
    );
  }

  // ==========================================
  // LOGGED-IN USER INFORMATION
  // ==========================================

  const user = session.user;

  const currentProfile =
    profile?.id === user.id ? profile : null;

  const initials = user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();

  // ==========================================
  // PROFILE DROPDOWN
  // ==========================================

  return (
    <DropdownMenu
      open={open}
      onOpenChange={setOpen}
    >

      {/* Profile dropdown trigger */}
      <DropdownMenuTrigger
        className="flex cursor-pointer items-center gap-2 rounded-full border border-stone-200 bg-white p-1.5 pr-3 outline-none transition hover:border-red-200"
      >

        <Avatar className="h-9 w-9">

          <AvatarImage
            src={user.image || undefined}
            alt={user.name}
          />

          <AvatarFallback className="bg-[#D62828] text-sm font-bold text-white">
            {initials || "U"}
          </AvatarFallback>

        </Avatar>

        <div className="hidden text-left sm:block">

          <p className="max-w-28 truncate text-xs font-bold text-stone-800">
            {user.name}
          </p>

          <p className="text-xs capitalize text-stone-500">
            {currentProfile?.role || "Account"}
          </p>

        </div>

        <ChevronDown size={15} />

      </DropdownMenuTrigger>

      {/* ======================================
          DROPDOWN CONTENT
          ====================================== */}

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-64 rounded-2xl border border-orange-100 bg-white p-2 shadow-xl"
      >

        <div className="px-3 py-3">

          <p className="truncate text-sm font-bold text-stone-900">
            {user.name}
          </p>

          <p className="mt-1 truncate text-xs text-stone-500">
            {user.email}
          </p>

          {currentProfile && (
            <span className="mt-2 inline-block rounded-full bg-orange-50 px-3 py-1 text-xs font-bold capitalize text-orange-700">
              {currentProfile.role}
            </span>
          )}

        </div>

        <DropdownMenuSeparator />

        {/* ======================================
            DASHBOARD LINK
            ====================================== */}

        {currentProfile && (
          <DropdownMenuItem
            render={
              <Link
                href={getDashboardPath(currentProfile.role)}
              />
            }
            onClick={() => setOpen(false)}
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-stone-700 hover:bg-orange-50"
          >
            <LayoutDashboard size={17} />
            Dashboard
          </DropdownMenuItem>
        )}

        {/* ======================================
            MY PROFILE LINK
            ====================================== */}

        <DropdownMenuItem
          render={<Link href="/profile" />}
          onClick={() => setOpen(false)}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-stone-700 hover:bg-orange-50"
        >
          <UserRound size={17} />
          My Profile
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* ======================================
            LOGOUT BUTTON
            ====================================== */}


        <DropdownMenuItem
          render={<button type="button" />}
          nativeButton
          closeOnClick={false}
          disabled={loggingOut}
          onClick={() => {
            void handleLogout();
          }}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut size={17} />

          {loggingOut ? "Signing out..." : "Sign Out"}

        </DropdownMenuItem>
        {error && (
          <p
            role="alert"
            className="mt-2 rounded-lg bg-red-50 p-3 text-xs text-red-700"
          >
            {error}
          </p>
        )}

      </DropdownMenuContent>

    </DropdownMenu>
  );
}