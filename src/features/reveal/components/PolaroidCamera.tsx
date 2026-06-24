"use client";

import { useEffect, useRef, useState } from "react";
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
  const triggerHaptic = usePolaroidHaptics();
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
    triggerHaptic("eject", { intensity: 0.68 });

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
      <PolaroidCameraScene
        isEjecting={isEjecting}
        isPassive={isPassive}
        model={model}
      />
      <button
        className="c-polaroid-camera__hotspot"
        type="button"
        onClick={handleShoot}
        onPointerUp={handleShoot}
        disabled={isPassive}
        aria-label="Sortir une photo Polaroid"
      />
      {!isPassive && (
        <p className="c-polaroid-camera__caption">
          Clique l&apos;appareil pour ejecter le prochain Polaroid.
        </p>
      )}
    </div>
  );
}
