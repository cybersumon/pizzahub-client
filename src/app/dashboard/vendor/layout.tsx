import type { ReactNode } from "react";
import VendorSidebar from "@/components/vendor/VendorSidebar";

// The shared application layout already provides Navbar and Footer.
export default function VendorLayout({ children }: { children: ReactNode }) {
  return <VendorSidebar>{children}</VendorSidebar>;
}

