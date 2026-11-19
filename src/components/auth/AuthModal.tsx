"use client";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

// ShadCN Dialog components।
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface AuthModalProps {
  children: ReactNode;
  title: string;
}

// Reusable Sign In / Sign Up modal।
export default function AuthModal({
  children,
  title,
}: AuthModalProps) {
  const router = useRouter();

  function closeModal() {
    router.back();
  }

  return (
    <Dialog
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) closeModal();
      }}
    >
      <DialogContent
        className="
          max-h-[90dvh]
          w-[calc(100vw-24px)]
          max-w-md
          overflow-y-auto
          rounded-[28px]
          border border-orange-100
          bg-white
          p-0
          shadow-2xl
          sm:max-w-md

          [&_main]:!min-h-0
          [&_main]:!bg-transparent
          [&_main]:!p-0

          [&_main>div]:!w-full
          [&_main>div]:!max-w-none
          [&_main>div]:!rounded-none
          [&_main>div]:!border-0
          [&_main>div]:!shadow-none
        "
      >
        <DialogTitle className="sr-only">
          {title}
        </DialogTitle>

        <DialogDescription className="sr-only">
          Authenticate with your PizzaHub account.
        </DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  );
}