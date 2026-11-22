import type { ReactNode } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

// Shared layout for all admin pages।
export default function AdminLayout({
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