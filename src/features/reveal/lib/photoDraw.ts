import { MEMORIES, type Memory } from "@/features/reveal/data/memories";

type DrawnPhoto = Pick<Memory, "id">;

export function getRandomMemoryIndex() {
  return pickAvailableMemoryIndex(new Set()) ?? 0;
}

export function pickNextMemoryIndex(
  currentIndex: number,
  heldPhotos: ReadonlyArray<DrawnPhoto>,
  rejectedPhotoIds: ReadonlyArray<string> = [],
) {
  const excludedIds = new Set([
    ...heldPhotos.map((photo) => photo.id),
    ...rejectedPhotoIds,
  ]);
  const currentMemory = MEMORIES[currentIndex];

  if (currentMemory) {
    excludedIds.add(currentMemory.id);
  }

  return pickAvailableMemoryIndex(excludedIds) ?? currentIndex;
}

export function getPlaceableMemory(
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

  return pickAvailableMemory(heldIds);
}

function pickAvailableMemoryIndex(excludedIds: ReadonlySet<string>) {
  const candidates = MEMORIES
    .map((memory, index) => ({ id: memory.id, index }))
    .filter((memory) => !excludedIds.has(memory.id));

  if (candidates.length === 0) {
    return undefined;
  }

  return candidates[Math.floor(Math.random() * candidates.length)].index;
}

function pickAvailableMemory(excludedIds: ReadonlySet<string>) {
  const nextIndex = pickAvailableMemoryIndex(excludedIds);

  return nextIndex === undefined ? undefined : MEMORIES[nextIndex];
}
