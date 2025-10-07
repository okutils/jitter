import { JitterError } from "../errors";
import type { RandomFunction } from "../types";
import { ensureRandom } from "./ensure-random";

/**
 * 应用“固定抖动”算法，在基础延迟上添加一个固定的随机范围。
 *
 * 这种策略在基础延迟上增加一个 `[0, maxJitter)` 范围内的随机值，
 * 最终延迟时间在 `[delay, delay + maxJitter)` 之间。
 * 它适用于需要可预测延迟上限的场景。
 *
 * @param delay 基础延迟时间（毫秒）。
 * @param maxJitter 最大抖动值（毫秒）。
 * @param random 可选的随机数生成器，默认为 `Math.random`。
 * @returns 添加抖动后的延迟时间。
 * @throws {JitterError} 如果 `delay` 或 `maxJitter` 不是非负有限数。
 *
 * @example
 * ```typescript
 * const delayWithJitter = addFixedJitter(1000, 200); // 结果范围: [1000, 1200)
 * ```
 */
export const addFixedJitter = (
  delay: number,
  maxJitter: number,
  random: RandomFunction = Math.random,
): number => {
  if (!Number.isFinite(delay) || delay < 0) {
    throw new JitterError("'delay' must be a non-negative finite number");
  }
  if (!Number.isFinite(maxJitter) || maxJitter < 0) {
    throw new JitterError("'maxJitter' must be a non-negative finite number");
  }

  const randomNumber = ensureRandom(random);
  const jitter = maxJitter * randomNumber;

  return delay + jitter;
};
