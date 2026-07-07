import type { Memory } from "@/features/reveal/data/memories";

type DrawnPhoto = Pick<Memory, "id">;

export function getRandomMemoryIndex(memories: readonly Memory[]) {
  return pickAvailableMemoryIndex(memories, new Set()) ?? 0;
}

export function pickNextMemoryIndex(
  memories: readonly Memory[],
  currentIndex: number,
  heldPhotos: ReadonlyArray<DrawnPhoto>,
  rejectedPhotoIds: ReadonlyArray<string> = [],
) {
  const excludedIds = new Set([
    ...heldPhotos.map((photo) => photo.id),
    ...rejectedPhotoIds,
  ]);
  const currentMemory = memories[currentIndex];

  if (currentMemory) {
    excludedIds.add(currentMemory.id);
  }

  return pickAvailableMemoryIndex(memories, excludedIds) ?? currentIndex;
}

export function getPlaceableMemory(
  memories: readonly Memory[],
  activeMemory: Memory,
  heldPhotos: ReadonlyArray<DrawnPhoto>,
  rejectedPhotoIds: ReadonlyArray<string> = [],
) {
  const heldIds = new Set([
    ...heldPhotos.map((photo) => photo.id),
    ...rejectedPhotoIds,
  ]);

  if (!heldIds.has(activeMemory.id)) {
    return activeMemory;
  }

  return pickAvailableMemory(memories, heldIds);
}

function pickAvailableMemoryIndex(
  memories: readonly Memory[],
  excludedIds: ReadonlySet<string>,
) {
  const candidates = memories
    .map((memory, index) => ({ id: memory.id, index }))
    .filter((memory) => !excludedIds.has(memory.id));

  if (candidates.length === 0) {
    return undefined;
  }

  return candidates[Math.floor(Math.random() * candidates.length)].index;
}

function pickAvailableMemory(
  memories: readonly Memory[],
  excludedIds: ReadonlySet<string>,
) {
  const nextIndex = pickAvailableMemoryIndex(memories, excludedIds);

  return nextIndex === undefined ? undefined : memories[nextIndex];
}
