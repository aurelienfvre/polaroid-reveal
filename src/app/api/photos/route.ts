import { NextResponse } from "next/server";
import { getLocalPhotoMemories } from "@/features/reveal/lib/photoLibraryServer";

export const dynamic = "force-dynamic";

export async function GET() {
  const photos = await getLocalPhotoMemories();

  return NextResponse.json({ photos });
}
