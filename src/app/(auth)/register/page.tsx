import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { RegisterForm } from "@/components/auth/register-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <>
      <Header />
      <CartDrawer />
      <main className="relative flex flex-1 bg-[var(--dominos-light-gray)]">
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
              Join the Domino&apos;s
              <br />
              family today.
            </h2>
            <p className="mt-3 max-w-sm text-base text-white/85">
              Create a free account to earn rewards, save favourites, and get
              exclusive member-only deals.
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
              <CardTitle className="text-xl">Create your account</CardTitle>
              <CardDescription>
                Join Domino&apos;s to earn rewards and order faster.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RegisterForm />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
