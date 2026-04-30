import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DeliveryBanner } from "@/components/layout/delivery-banner";
import { CartDrawer } from "@/components/cart/cart-drawer";

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <DeliveryBanner />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
