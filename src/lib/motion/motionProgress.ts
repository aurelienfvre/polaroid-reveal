export type MotionImpulse = {
  x: number;
  y: number;
  force: number;
  source?: "manual" | "motion" | "pointer";
};

export type MotionProgressHandler = (
  amount: number,
  impulse?: MotionImpulse,
) => void;
