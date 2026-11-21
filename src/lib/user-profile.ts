// PizzaHub Express backend URL।
const API_URL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
  "http://localhost:7000";

// Application role type।
export type UserRole = "customer" | "vendor" | "admin";

// Restaurant subscription plan।
export type VendorPlan = "free" | "premium" | "premium_plus";

// Backend user profile structure।
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: UserRole;
  canManageMenu: boolean;

  restaurant: {
    id: string;
    name: string;
    address: string;
    phone: string;
    status: "pending" | "approved" | "rejected";
    plan: VendorPlan;
  } | null;
}

export async function getUserProfile(): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/api/users/me`, {
    method: "GET",

    credentials: "include",

    cache: "no-store",
  });

  const result = await response.json();

  // API error handling।
  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Unable to load user profile."
    );
  }

  return result.data;
}

export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin/restaurants";

    case "vendor":
      return "/dashboard/vendor";

    default:
      return "/dashboard/customer";
  }
}