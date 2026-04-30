import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="relative flex flex-1 bg-[var(--dominos-light-gray)]">
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src="/images/auth-hero.webp"
          alt=""
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--dominos-red)]/70 via-[var(--dominos-dark-blue)]/50 to-black/70" />
        <div className="relative flex h-full flex-col justify-end p-10 text-white">
          <h2 className="text-4xl font-black leading-tight">
            Hungry for
            <br />
            something great?
          </h2>
          <p className="mt-3 max-w-sm text-base text-white/85">
            Sign in to unlock exclusive deals, track orders in real-time, and
            rack up VIP rewards on every pizza.
          </p>
        </div>
      </div>
      <div className="flex w-full items-center justify-center px-4 py-8 sm:py-12 lg:w-1/2">
        <Card className="w-full max-w-sm sm:max-w-md">
          <CardHeader className="items-center text-center">
            <Link href="/" className="mb-2 flex items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--dominos-red)]">
                <span className="text-2xl font-black text-white">D</span>
              </div>
            </Link>
            <CardTitle className="text-xl">Sign in to your account</CardTitle>
            <CardDescription>
              Welcome back! Enter your details to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
