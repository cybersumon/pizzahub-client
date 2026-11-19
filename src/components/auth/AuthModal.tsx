"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

// Modal-এর props।
interface AuthModalProps {
  children: ReactNode;
  title: string;
}

// Sign In / Sign Up reusable popup।
export default function AuthModal({
  children,
  title,
}: AuthModalProps) {
  const router = useRouter();

  return (
    <Dialog
      open={true}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          router.back();
        }
      }}
    >
      <DialogContent

        className="max-h-[92dvh] gap-0 overflow-y-auto rounded-3xl border-0 bg-white p-0 shadow-2xl"
        style={{
          width: "calc(100vw - 24px)",
          maxWidth: "960px",
        }}
      >
        {/* Accessibility title */}
        <DialogTitle className="sr-only">
          {title}
        </DialogTitle>

        <DialogDescription className="sr-only">
          PizzaHub account authentication.
        </DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  );
}