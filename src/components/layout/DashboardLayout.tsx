// React children type।
import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";


interface DashboardLayoutProps {
  children: ReactNode;
}


export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">

      <Navbar />

      <div className="flex-1">
        {children}
      </div>

      {/* Existing PizzaHub Footer। */}
      <Footer />

    </div>
  );
}