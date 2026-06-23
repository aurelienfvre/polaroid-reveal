export type MotionImpulse = {
  x: number;
  y: number;
  force: number;
};

export type MotionProgressHandler = (
  amount: number,
  impulse?: MotionImpulse,
) => void;
