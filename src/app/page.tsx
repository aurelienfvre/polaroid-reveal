import { RevealExperience } from "@/features/reveal/components/RevealExperience";
import { getLocalPhotoMemories } from "@/features/reveal/lib/photoLibraryServer";

export const dynamic = "force-dynamic";

export default async function Home() {
  const initialMemories = await getLocalPhotoMemories();

  return <RevealExperience initialMemories={initialMemories} />;
}
