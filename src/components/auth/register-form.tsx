"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { trackSignedUp, trackAlias } from "@/lib/analytics/events";
import { Loader2 } from "lucide-react";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): string | null {
    if (password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError(null);

    const validationError = validate();
    if (validationError) {
      if (validationError.startsWith("Password must")) {
        setPasswordError(validationError);
      } else {
        setConfirmError(validationError);
      }
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (signUpError) {
        setError(signUpError.message ?? "Could not create account. Please try again.");
        setLoading(false);
        return;
      }

      trackSignedUp("email", email);
      const newUserId = data?.user?.id;
      if (newUserId) {
        try {
          trackAlias(newUserId);
        } catch {
          // alias is best-effort
        }
      }
      toast.success("Account created — let's order!");
      router.push("/menu");
    } catch (err) {
      const msg =
        err instanceof TypeError
          ? "Connection issue — check your network."
          : "Something went wrong. Please try again.";
      setError(msg);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Smith"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(null);
          }}
          onBlur={() => {
            if (email && !isValidEmail(email)) {
              setEmailError("Please enter a valid email address.");
            }
          }}
          required
          autoComplete="email"
          inputMode="email"
          disabled={loading}
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? "reg-email-error" : undefined}
          className={emailError ? "border-destructive focus-visible:ring-destructive/40" : undefined}
        />
        {emailError && (
          <p id="reg-email-error" role="alert" className="text-xs text-destructive">
            {emailError}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (passwordError) setPasswordError(null);
          }}
          onBlur={() => {
            if (password && password.length < 8) {
              setPasswordError("Password must be at least 8 characters.");
            }
          }}
          required
          autoComplete="new-password"
          disabled={loading}
          aria-invalid={Boolean(passwordError)}
          aria-describedby={passwordError ? "reg-password-error" : undefined}
          className={passwordError ? "border-destructive focus-visible:ring-destructive/40" : undefined}
        />
        {passwordError && (
          <p id="reg-password-error" role="alert" className="text-xs text-destructive">
            {passwordError}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          type="password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (confirmError) setConfirmError(null);
          }}
          onBlur={() => {
            if (confirmPassword && password !== confirmPassword) {
              setConfirmError("Passwords do not match.");
            }
          }}
          required
          autoComplete="new-password"
          disabled={loading}
          aria-invalid={Boolean(confirmError)}
          aria-describedby={confirmError ? "reg-confirm-error" : undefined}
          className={confirmError ? "border-destructive focus-visible:ring-destructive/40" : undefined}
        />
        {confirmError && (
          <p id="reg-confirm-error" role="alert" className="text-xs text-destructive">
            {confirmError}
          </p>
        )}
      </div>

      {error && (
        <div role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[var(--dominos-red)] text-white hover:bg-[var(--dominos-red)]/90"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[var(--dominos-blue)] underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
