import { MobileProductDetail } from "@/components/mobile/mobile-product-detail";

export default async function MobileProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <MobileProductDetail slug={slug} />;
}
