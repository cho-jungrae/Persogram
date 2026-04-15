export const SPRING = { type: "spring" as const, stiffness: 300, damping: 24 };

export const FADE_UP = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
};

// initial: {} 필수 — 없으면 자식 variant가 전파되지 않음
export const STAGGER_CONTAINER = {
  initial: {},
  animate: { transition: { staggerChildren: 0.06 } },
};

export const STAGGER_ITEM = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { ...SPRING } },
};
