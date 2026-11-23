import type { ReactNode } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

// Shared layout for restaurant setup and management pages.
export default function RestaurantLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}