import { KioskProductDetail } from "@/components/kiosk/kiosk-product-detail";

export default async function KioskProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <KioskProductDetail slug={slug} />;
}
