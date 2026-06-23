import gsap from "gsap";
import type { MotionImpulse } from "@/lib/motion/motionProgress";

export function resetDevelopmentImpulse(target: HTMLElement | null) {
  gsap.set(target, {
    "--shake-x": "0px",
    "--shake-y": "0px",
    "--shake-rotate": "0deg",
    "--develop-flash-opacity": 0,
  });
}

export function playDevelopmentImpulse(
  target: HTMLElement | null,
  amount: number,
  impulse?: MotionImpulse,
) {
  if (!target) {
    return;
  }

  const rawX = impulse?.x ?? Math.random() * 2 - 1;
  const rawY = impulse?.y ?? Math.random() * 2 - 1;
  const length = Math.max(Math.hypot(rawX, rawY), 0.2);
  const directionX = rawX / length;
  const directionY = rawY / length;
  const force = Math.min(Math.max(impulse?.force ?? amount * 16, 0.8), 1.9);
  const shakeX = directionX * gsap.utils.random(18, 32) * force;
  const shakeY = directionY * gsap.utils.random(10, 22) * force;
  const shakeRotate =
    (-directionX * gsap.utils.random(5, 9) +
      directionY * gsap.utils.random(-2.2, 2.2)) *
    force;

  gsap.killTweensOf(target);
  gsap
    .timeline()
    .to(target, {
      "--shake-x": `${shakeX}px`,
      "--shake-y": `${shakeY}px`,
      "--shake-rotate": `${shakeRotate}deg`,
      "--develop-flash-opacity": Math.min(0.14 + amount * 1.8, 0.36),
      duration: 0.07,
      ease: "power3.out",
    })
    .to(target, {
      "--shake-x": `${shakeX * -0.46}px`,
      "--shake-y": `${shakeY * -0.34}px`,
      "--shake-rotate": `${shakeRotate * -0.52}deg`,
      "--develop-flash-opacity": 0.08,
      duration: 0.11,
      ease: "sine.inOut",
    })
    .to(target, {
      "--develop-flash-opacity": 0,
      duration: 0.18,
      ease: "power2.out",
    })
    .to(
      target,
      {
        "--shake-x": "0px",
        "--shake-y": "0px",
        "--shake-rotate": "0deg",
        duration: 0.44,
        ease: "elastic.out(1, 0.46)",
      },
      "<",
    );
}
