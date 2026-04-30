import { NextResponse } from "next/server";
import storesData from "@/data/stores.json";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase();

  let stores = storesData;

  if (query) {
    stores = storesData.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.suburb.toLowerCase().includes(query) ||
        s.postcode.includes(query)
    );
  }

  return NextResponse.json(stores);
}
