
import type { ReactNode } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import AdminSidebar from "@/components/admin/AdminSidebar";

// ============================================
// ADMIN LAYOUT
// ============================================

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DashboardLayout variant="admin">
      <AdminSidebar>
        {children}
      </AdminSidebar>
    </DashboardLayout>
  );
}
