export const addJitter = (
  delay: number,
  factor = 0.2,
  random: () => number = Math.random,
): number => {
  const jitter = delay * factor * (random() * 2 - 1);
  return Math.max(0, delay + jitter);
};
