"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

const STRIPE_ANIMATION_DURATION = 460;

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function PolaroidButton({
  children,
  className,
  disabled,
  onKeyDown,
  onPointerDown,
  type = "button",
  ...props
}: Props) {
  const [isPressed, setIsPressed] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const buttonClassName = [
    "c-polaroid-button",
    isPressed ? "c-polaroid-button--is-pressed" : "",
    className ?? "",
  ].filter(Boolean).join(" ");

  const playStripeAnimation = () => {
    if (disabled) {
      return;
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setIsPressed(true);
    timeoutRef.current = window.setTimeout(() => {
      setIsPressed(false);
      timeoutRef.current = null;
    }, STRIPE_ANIMATION_DURATION);
  };

  useEffect(() => () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
  }, []);

  return (
    <button
      className={buttonClassName}
      disabled={disabled}
      onKeyDown={(event) => {
        if (!event.repeat && (event.key === " " || event.key === "Enter")) {
          playStripeAnimation();
        }

        onKeyDown?.(event);
      }}
      onPointerDown={(event) => {
        playStripeAnimation();
        onPointerDown?.(event);
      }}
      type={type}
      {...props}
    >
      <span className="c-polaroid-button__stripes" aria-hidden="true">
        <span className="c-polaroid-button__stripe c-polaroid-button__stripe--red" />
        <span className="c-polaroid-button__stripe c-polaroid-button__stripe--orange" />
        <span className="c-polaroid-button__stripe c-polaroid-button__stripe--yellow" />
        <span className="c-polaroid-button__stripe c-polaroid-button__stripe--green" />
        <span className="c-polaroid-button__stripe c-polaroid-button__stripe--blue" />
      </span>
      <span className="c-polaroid-button__label">{children}</span>
    </button>
  );
}
