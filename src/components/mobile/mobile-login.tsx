"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { MobileStackedHeader } from "./mobile-stacked-header";

const DEMO_ACCOUNTS = [
  { label: "Sarah — VIP", email: "sarah.vip@dominosdemo.com" },
  { label: "Dan — Cart Abandoner", email: "dan.abandoner@dominosdemo.com" },
  { label: "Alex — Deal Hunter", email: "alex.deals@dominosdemo.com" },
  { label: "Jamie — New Visitor", email: "jamie.new@dominosdemo.com" },
];

function prefill(email: string) {
  const emailInput = document.getElementById("email") as HTMLInputElement | null;
  const pwInput = document.getElementById("password") as HTMLInputElement | null;
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  )?.set;
  if (emailInput && setter) {
    setter.call(emailInput, email);
    emailInput.dispatchEvent(new Event("input", { bubbles: true }));
  }
  if (pwInput && setter) {
    setter.call(pwInput, "demo1234");
    pwInput.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

export function MobileLogin() {
  const [showDemo, setShowDemo] = useState(false);
  return (
    <div className="flex h-full flex-col bg-background">
      <MobileStackedHeader title="Sign in" />
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <h1 className="text-xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to see your orders and rewards.
        </p>

        <div className="mt-5">
          <LoginForm />
        </div>

        <button
          type="button"
          onClick={() => setShowDemo((s) => !s)}
          className="mt-6 flex w-full items-center justify-between rounded-xl border border-dashed border-border/80 px-4 py-2.5 text-xs font-semibold text-muted-foreground"
        >
          <span>Demo accounts</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${showDemo ? "rotate-180" : ""}`}
          />
        </button>
        {showDemo && (
          <div className="mt-2 flex flex-col gap-1 rounded-xl border border-border/60 p-2 text-xs">
            <p className="px-2 py-1 text-muted-foreground">
              Password for all: <span className="font-mono">demo1234</span>
            </p>
            {DEMO_ACCOUNTS.map((acct) => (
              <button
                key={acct.email}
                type="button"
                onClick={() => prefill(acct.email)}
                className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-left font-semibold"
              >
                <span>{acct.label}</span>
                <span className="text-muted-foreground">Use</span>
              </button>
            ))}
          </div>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          No account?{" "}
          <Link
            href="/m/register"
            className="font-semibold text-[var(--dominos-red)]"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
