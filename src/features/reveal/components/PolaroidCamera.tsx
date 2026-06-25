"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PolaroidButton } from "@/features/reveal/components/PolaroidButton";
import { PolaroidCameraScene } from "@/features/reveal/components/PolaroidCameraScene";
import type { PolaroidCameraModel } from "@/features/reveal/data/polaroidCameraModels";
import { usePolaroidHaptics } from "@/lib/haptics/usePolaroidHaptics";

const EJECT_DURATION = 2100;
// Let the button's stripe press animation play out before the eject hides it.
const SHOOT_DELAY = 520;

type Props = {
  isPassive?: boolean;
  model: PolaroidCameraModel;
  onShoot?: () => void;
  shootNonce?: number;
};

export function PolaroidCamera({ isPassive = false, model, onShoot, shootNonce = 0 }: Props) {
  const [isEjecting, setIsEjecting] = useState(false);
  const [hideActionButton, setHideActionButton] = useState(false);
  const isEjectingRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const startTimeoutRef = useRef<number | null>(null);
  const lastNonceRef = useRef(shootNonce);
  const playHaptic = usePolaroidHaptics();
  const className = [
    "c-polaroid-camera",
    `c-polaroid-camera--model-${model.id}`,
    isPassive ? "c-polaroid-camera--is-passive" : "",
    isEjecting ? "c-polaroid-camera--is-ejecting" : "",
  ].filter(Boolean).join(" ");

  const handleShoot = ({ hideButton = false } = {}) => {
    if (isPassive || isEjectingRef.current || !onShoot) {
      return;
    }

    // Lock immediately so a second tap is ignored, but leave the button visible
    // long enough for its stripe animation to play before the eject begins.
    isEjectingRef.current = true;
    setHideActionButton(hideButton);

    startTimeoutRef.current = window.setTimeout(() => {
      setIsEjecting(true);
      // One continuous motor whir for the whole ejection (distinct from the
      // movement-driven buzzes while shaking the developed print).
      playHaptic("ejectMotor", { intensity: 0.9 });

      timeoutRef.current = window.setTimeout(() => {
        onShoot();
        isEjectingRef.current = false;
        setIsEjecting(false);
        setHideActionButton(false);
      }, EJECT_DURATION);
    }, SHOOT_DELAY);
  };

  // Auto-fire the eject when the parent bumps the nonce (e.g. "Take a new
  // photo"), so the user doesn't have to press the button again.
  useLayoutEffect(() => {
    if (shootNonce === lastNonceRef.current) {
      return;
    }
    lastNonceRef.current = shootNonce;
    if (!isPassive) {
      handleShoot({ hideButton: true });
    }
    // handleShoot is stable enough for this fire-and-forget trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shootNonce]);

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
          onClick={() => handleShoot()}
          disabled={isEjecting || isPassive || hideActionButton}
          aria-label="Take a photo"
        />
      </div>
      {!isPassive && !isEjecting && !hideActionButton && (
        <PolaroidButton
          onClick={() => handleShoot()}
          aria-label="Take a photo"
        >
          SNAP IT
        </PolaroidButton>
      )}
    </div>
  );
}
