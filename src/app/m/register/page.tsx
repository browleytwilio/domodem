"use client";

import { RegisterForm } from "@/components/auth/register-form";
import { MobileStackedHeader } from "@/components/mobile/mobile-stacked-header";

export default function MobileRegisterPage() {
  return (
    <div className="flex h-full flex-col bg-background">
      <MobileStackedHeader title="Create account" />
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <h1 className="text-xl font-bold">Join Domino&apos;s</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Free to join. Earn rewards with every order.
        </p>
        <div className="mt-5">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
