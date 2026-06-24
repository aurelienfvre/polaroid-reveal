"use client";

import { useEffect, useRef, useState } from "react";
import { PolaroidButton } from "@/features/reveal/components/PolaroidButton";
import { PolaroidCameraScene } from "@/features/reveal/components/PolaroidCameraScene";
import type { PolaroidCameraModel } from "@/features/reveal/data/polaroidCameraModels";
import { usePolaroidHaptics } from "@/lib/haptics/usePolaroidHaptics";

const EJECT_DURATION = 1980;

type Props = {
  isPassive?: boolean;
  model: PolaroidCameraModel;
  onShoot?: () => void;
};

export function PolaroidCamera({ isPassive = false, model, onShoot }: Props) {
  const [isEjecting, setIsEjecting] = useState(false);
  const isEjectingRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const playHaptic = usePolaroidHaptics();
  const className = [
    "c-polaroid-camera",
    `c-polaroid-camera--model-${model.id}`,
    isPassive ? "c-polaroid-camera--is-passive" : "",
    isEjecting ? "c-polaroid-camera--is-ejecting" : "",
  ].filter(Boolean).join(" ");

  const handleShoot = () => {
    if (isPassive || isEjectingRef.current || !onShoot) {
      return;
    }

    isEjectingRef.current = true;
    setIsEjecting(true);
    playHaptic("eject", { intensity: 0.68 });

    timeoutRef.current = window.setTimeout(() => {
      onShoot();
      isEjectingRef.current = false;
      setIsEjecting(false);
    }, EJECT_DURATION);
  };

  useEffect(() => () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
  }, []);

  return (
    <div className={className}>
      <div className="c-polaroid-camera__stage">
        <PolaroidCameraScene
          isEjecting={isEjecting}
          isPassive={isPassive}
          model={model}
        />
        <button
          className="c-polaroid-camera__camera-hitbox"
          type="button"
          onClick={handleShoot}
          disabled={isEjecting || isPassive}
          aria-label="Take a photo"
        />
      </div>
      {!isPassive && (
        <PolaroidButton
          onClick={handleShoot}
          disabled={isEjecting}
          aria-label="Take a photo"
        >
          TAKE A PHOTO
        </PolaroidButton>
      )}
    </div>
  );
}
