"use client";

import { useRef } from "react";
import { usePolaroidCameraScene } from "@/features/reveal/hooks/usePolaroidCameraScene";
import type { PolaroidCameraModel } from "@/features/reveal/data/polaroidCameraModels";

type Props = {
  isEjecting: boolean;
  isPassive: boolean;
  model: PolaroidCameraModel;
};

export function PolaroidCameraScene({ isEjecting, isPassive, model }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  usePolaroidCameraScene(canvasRef, model, { isEjecting, isPassive });

  return (
    <div className="c-polaroid-camera__scene" aria-hidden="true">
      <canvas className="c-polaroid-camera__canvas" ref={canvasRef} />
    </div>
  );
}
