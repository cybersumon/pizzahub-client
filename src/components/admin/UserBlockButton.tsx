"use client";

import { useState } from "react";
import {
  Ban,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  UnlockKeyhole,
  X,
} from "lucide-react";

// ============================================
// PIZZAHUB — USER BLOCK / UNBLOCK BUTTON
// Lesson 18 — Step 6C
// ============================================

// Backend API URL।
// Development-এ Express Server port 7000।
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:7000";

// ============================================
// PROPS TYPE
// ============================================

interface UserBlockButtonProps {
  // Better Auth User ID।
  userId: string;

  userName: string;

  isBlocked: boolean;

  role: "admin" | "vendor" | "customer";

  onUpdated: () => void | Promise<void>;
}

// ============================================
// COMPONENT
// ============================================

export default function UserBlockButton({
  userId,
  userName,
  isBlocked,
  role,
  onUpdated,
}: UserBlockButtonProps) {
  const [confirmOpen, setConfirmOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  // Error Message।
  const [error, setError] =
    useState("");

  // ==========================================
  // ADMIN PROTECTION
  // ==========================================

  if (role === "admin") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-500">
        <ShieldAlert size={14} />
        Protected Admin
      </span>
    );
  }

  // ==========================================
  // BLOCK / UNBLOCK API REQUEST
  // ==========================================

  async function updateBlockStatus() {
    if (loading) return;

    const nextStatus = !isBlocked;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/users/${userId}/block`,
        {
          method: "PATCH",

          credentials: "include",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            isBlocked: nextStatus,
          }),
        }
      );

      // Backend Response Type।
      const result: {
        success: boolean;
        message?: string;
      } = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to update user status."
        );
      }

      setConfirmOpen(false);

      await onUpdated();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // USER INTERFACE
  // ==========================================

  return (
    <div className="space-y-2">
      {/* ======================================
          MAIN ACTION BUTTON
          ====================================== */}

      {!confirmOpen && (
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setError("");
            setConfirmOpen(true);
          }}
          className={
            isBlocked
              ? "inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
              : "inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
          }
        >
          {isBlocked ? (
            <>
              <UnlockKeyhole size={16} />
              Unblock
            </>
          ) : (
            <>
              <Ban size={16} />
              Block
            </>
          )}
        </button>
      )}

      {/* ======================================
          INLINE CONFIRMATION PANEL
          ====================================== */}

      {confirmOpen && (
        <div className="w-full min-w-0 max-w-sm rounded-xl border border-orange-200 bg-orange-50 p-3">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-stone-900">
              {isBlocked
                ? "Unblock this user?"
                : "Block this user?"}
            </p>

            {/* Close Button */}
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setConfirmOpen(false);
                setError("");
              }}
              aria-label="Close confirmation"
              className="rounded-lg p-1 text-stone-500 transition hover:bg-orange-100 disabled:opacity-50"
            >
              <X size={16} />
            </button>
          </div>

          {/* User Information */}
          <p className="mt-2 wrap-break-word text-xs leading-5 text-stone-600">
            {isBlocked
              ? `Restore access for ${userName}?`
              : `Restrict protected API access for ${userName}?`}
          </p>

          {/* Warning / Information */}
          <div className="mt-3 flex items-start gap-2 text-xs text-stone-600">
            {isBlocked ? (
              <CheckCircle2
                size={16}
                className="shrink-0 text-emerald-600"
              />
            ) : (
              <ShieldAlert
                size={16}
                className="shrink-0 text-amber-600"
              />
            )}

            <span>
              {isBlocked
                ? "The user will regain access to protected features."
                : "The user will lose access to routes protected by the active-user middleware."}
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <p
              role="alert"
              className="mt-3 rounded-lg bg-red-100 p-2 text-xs text-red-700"
            >
              {error}
            </p>
          )}

          {/* Action Buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                void updateBlockStatus();
              }}
              className={
                isBlocked
                  ? "inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                  : "inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
              }
            >
              {loading ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : isBlocked ? (
                <UnlockKeyhole size={15} />
              ) : (
                <Ban size={15} />
              )}

              {loading
                ? "Updating..."
                : isBlocked
                  ? "Confirm Unblock"
                  : "Confirm Block"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setConfirmOpen(false);
                setError("");
              }}
              className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-600 transition hover:bg-stone-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}