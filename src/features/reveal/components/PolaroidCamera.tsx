"use client";

import { useEffect, useRef, useState } from "react";
import { PolaroidButton } from "@/features/reveal/components/PolaroidButton";
import { PolaroidCameraScene } from "@/features/reveal/components/PolaroidCameraScene";
import type { PolaroidCameraModel } from "@/features/reveal/data/polaroidCameraModels";
import { usePolaroidHaptics } from "@/lib/haptics/usePolaroidHaptics";

const EJECT_DURATION = 2900;
// Let the button's stripe press animation play out before the eject hides it.
const SHOOT_DELAY = 520;

type Props = {
  isPassive?: boolean;
  model: PolaroidCameraModel;
  onShoot?: () => void;
};

export function PolaroidCamera({ isPassive = false, model, onShoot }: Props) {
  const [isEjecting, setIsEjecting] = useState(false);
  const isEjectingRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const startTimeoutRef = useRef<number | null>(null);
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

    // Lock immediately so a second tap is ignored, but leave the button visible
    // long enough for its stripe animation to play before the eject begins.
    isEjectingRef.current = true;

    startTimeoutRef.current = window.setTimeout(() => {
      setIsEjecting(true);
      // One continuous motor whir for the whole ejection (distinct from the
      // movement-driven buzzes while shaking the developed print).
      playHaptic("ejectMotor", { intensity: 0.6 });

      timeoutRef.current = window.setTimeout(() => {
        onShoot();
        isEjectingRef.current = false;
        setIsEjecting(false);
      }, EJECT_DURATION);
    }, SHOOT_DELAY);
  };

  useEffect(() => () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    if (startTimeoutRef.current) {
      window.clearTimeout(startTimeoutRef.current);
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
      {!isPassive && !isEjecting && (
        <PolaroidButton
          onClick={handleShoot}
          aria-label="Take a photo"
        >
          TAKE A PHOTO
        </PolaroidButton>
      )}
    </div>
  );
}
