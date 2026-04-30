import { notFound } from "next/navigation";
import { findAdventure } from "@/lib/tour/registry";
import { TourRunner } from "@/components/tour/tour-runner";

export default async function AdventurePage({
  params,
}: {
  params: Promise<{ adventure: string }>;
}) {
  const { adventure } = await params;
  const found = findAdventure(adventure);
  if (!found) notFound();
  return <TourRunner adventureId={found.id} />;
}
