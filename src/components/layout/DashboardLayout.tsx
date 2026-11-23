
import type { ReactNode } from "react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// ============================================
// DASHBOARD LAYOUT TYPES
// ============================================

interface DashboardLayoutProps {
  children: ReactNode;
  variant?: "default" | "admin";
}

// ============================================
// SHARED DASHBOARD LAYOUT
// ============================================

export default function DashboardLayout({
  children,
  variant = "default",
}: DashboardLayoutProps) {
  const isAdmin = variant === "admin";

  return (
    <div
      data-dashboard-theme={variant}
      className="flex min-h-screen flex-col"
    >
      {/* Shared navigation */}
      <Navbar />

      {/* Main page content */}
      <div
        className={
          isAdmin
            ? "min-w-0 flex-1 bg-[#FFF9F2]"
            : "min-w-0 flex-1"
        }
      >
        {children}
      </div>

      {/* Shared footer */}
      <Footer />
    </div>
  );
}
