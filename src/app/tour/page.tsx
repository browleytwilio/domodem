import { TourLanding } from "@/components/tour/tour-landing";

export default async function TourPage({
  searchParams,
}: {
  searchParams: Promise<{ guest?: string }>;
}) {
  const { guest } = await searchParams;
  return <TourLanding guestName={guest ?? ""} />;
}
