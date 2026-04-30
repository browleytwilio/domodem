"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackNewsletterSubscribed } from "@/lib/analytics/events";

const footerLinks = {
  "About Us": [
    { label: "Our Story", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Corporate", href: "/corporate" },
    { label: "Franchise Info", href: "/franchise" },
  ],
  "Customer Service": [
    { label: "Contact Us", href: "/contact" },
    { label: "FAQs", href: "/faq" },
    { label: "Allergen Info", href: "/allergens" },
    { label: "Nutrition Info", href: "/nutrition" },
  ],
  More: [
    { label: "VIP Club", href: "/account/loyalty" },
    { label: "Gift Cards", href: "/gift-cards" },
    { label: "Catering", href: "/catering" },
    { label: "Store Locator", href: "/store-locator" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use", href: "/terms" },
    { label: "Accessibility", href: "/accessibility" },
    { label: "Sitemap", href: "/sitemap" },
  ],
};

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "done">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    setState("submitting");
    try {
      trackNewsletterSubscribed(trimmed, "footer");
      await new Promise((r) => setTimeout(r, 500));
      setState("done");
      toast.success("Subscribed! Check your inbox.");
    } catch {
      setState("idle");
      toast.error("Something went wrong");
    }
  }

  if (state === "done") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm">
        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
        Thanks — you&apos;re subscribed.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-2 sm:flex-row">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        autoComplete="email"
        aria-label="Email address"
        className="h-10 border-white/20 bg-white/10 text-white placeholder:text-white/40 sm:h-9"
        disabled={state === "submitting"}
        required
      />
      <Button
        type="submit"
        disabled={state === "submitting"}
        className="h-10 gap-1.5 bg-[var(--dominos-red)] text-white hover:bg-[var(--dominos-red)]/90 sm:h-9"
      >
        {state === "submitting" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Mail className="h-3.5 w-3.5" />
        )}
        Subscribe
      </Button>
    </form>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-[var(--dominos-dark-blue)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 md:grid-cols-[2fr_repeat(4,1fr)]">
          <div className="sm:col-span-2 md:col-span-1">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/60">
              Get deals in your inbox
            </h3>
            <p className="mb-4 text-sm text-white/75">
              Weekly offers, exclusive coupons, new menu items. Unsubscribe anytime.
            </p>
            <NewsletterForm />
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/60">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/75 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-6 border-t border-white/10 pt-8 md:flex-row md:justify-between">
          <Image
            src="/logos/dominos-horizontal-white.svg"
            alt="Domino's Pizza"
            width={170}
            height={35}
            className="h-8 w-auto"
          />

          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} Domino&apos;s Pizza Enterprises
            Ltd. ABN 16 010 489 326
          </p>
        </div>
      </div>
    </footer>
  );
}
