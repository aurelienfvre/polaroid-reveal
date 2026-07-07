import { readdir } from "node:fs/promises";
import path from "node:path";
import {
  createMemoriesFromPhotoFiles,
  PHOTO_FILE_EXTENSIONS,
} from "@/features/reveal/data/memories";

export async function getLocalPhotoMemories() {
  const photoDirectory = path.join(process.cwd(), "public", "images", "photos");

  try {
    const entries = await readdir(photoDirectory, { withFileTypes: true });
    const fileNames = entries
      .filter((entry) => entry.isFile() && isPhotoFile(entry.name))
      .map((entry) => entry.name)
      .sort((first, second) => first.localeCompare(second));

    return createMemoriesFromPhotoFiles(fileNames);
  } catch {
    return [];
  }
}

function isPhotoFile(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();

  return PHOTO_FILE_EXTENSIONS.includes(
    extension as (typeof PHOTO_FILE_EXTENSIONS)[number],
  );
}
