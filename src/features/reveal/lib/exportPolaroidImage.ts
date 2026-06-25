import type { Memory } from "@/features/reveal/data/memories";

const EXPORT_WIDTH = 1130;
const EXPORT_HEIGHT = 1380;
const PHOTO_SIZE = 950;
const PHOTO_X = 90;
const PHOTO_Y = 110;

export async function exportPolaroidImage(memory: Memory) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  canvas.width = EXPORT_WIDTH;
  canvas.height = EXPORT_HEIGHT;

  context.fillStyle = "#f9f7f1";
  context.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);
  context.fillStyle = "#111111";
  context.fillRect(PHOTO_X, PHOTO_Y, PHOTO_SIZE, PHOTO_SIZE);

  const image = await loadImage(memory.imageUrl);
  drawCoverImage(context, image);
  drawPaperGrain(context);

  const blob = await canvasToBlob(canvas);
  downloadBlob(blob, `${slugify(memory.title)}-polaroid.png`);
}

function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
) {
  const scale = Math.max(PHOTO_SIZE / image.width, PHOTO_SIZE / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  const x = PHOTO_X + (PHOTO_SIZE - width) / 2;
  const y = PHOTO_Y + (PHOTO_SIZE - height) / 2;

  context.save();
  context.beginPath();
  context.rect(PHOTO_X, PHOTO_Y, PHOTO_SIZE, PHOTO_SIZE);
  context.clip();
  context.drawImage(image, x, y, width, height);
  context.restore();
}

function drawPaperGrain(context: CanvasRenderingContext2D) {
  const grain = document.createElement("canvas");
  const grainContext = grain.getContext("2d");

  if (!grainContext) {
    return;
  }

  grain.width = EXPORT_WIDTH;
  grain.height = EXPORT_HEIGHT;

  const imageData = grainContext.createImageData(EXPORT_WIDTH, EXPORT_HEIGHT);
  const data = imageData.data;

  for (let index = 0; index < data.length; index += 4) {
    const value = Math.random() > 0.5 ? 255 : 0;
    data[index] = value;
    data[index + 1] = value;
    data[index + 2] = value;
    data[index + 3] = 255;
  }

  grainContext.putImageData(imageData, 0, 0);
  context.save();
  context.globalAlpha = 0.035;
  context.globalCompositeOperation = "overlay";
  context.drawImage(grain, 0, 0);
  context.restore();
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load image"));
    image.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("Unable to export image"));
      }, "image/png");
    } catch (error) {
      reject(error);
    }
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
