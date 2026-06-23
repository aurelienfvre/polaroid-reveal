"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  isPassive?: boolean;
  onShoot?: () => void;
};

export function PolaroidCamera({ isPassive = false, onShoot }: Props) {
  const [isEjecting, setIsEjecting] = useState(false);
  const isEjectingRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const className = [
    "c-polaroid-camera",
    isPassive ? "c-polaroid-camera--is-passive" : "",
    isEjecting ? "c-polaroid-camera--is-ejecting" : "",
  ].filter(Boolean).join(" ");

  const handleShoot = () => {
    if (isPassive || isEjectingRef.current || !onShoot) {
      return;
    }

    isEjectingRef.current = true;
    setIsEjecting(true);
    timeoutRef.current = window.setTimeout(() => {
      onShoot();
      isEjectingRef.current = false;
      setIsEjecting(false);
    }, 760);
  };

  useEffect(() => () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
  }, []);

  return (
    <div className={className}>
      <button
        className="c-polaroid-camera__body"
        type="button"
        onClick={handleShoot}
        onPointerUp={handleShoot}
        disabled={isPassive}
        aria-label="Sortir une photo Polaroid"
      >
        <span className="c-polaroid-camera__flash" />
        <span className="c-polaroid-camera__lens" />
        <span className="c-polaroid-camera__slot" />
        <span className="c-polaroid-camera__print" />
      </button>
      {!isPassive && (
        <p className="c-polaroid-camera__caption">
          Clique l&apos;appareil pour ejecter le prochain Polaroid.
        </p>
      )}
    </div>
  );
}
