import { JitterError } from "../errors";
import type { RandomFunction } from "../types";
import { ensureRandom } from "./ensure-random";

/**
 * 应用“相等抖动”算法，一半固定，一半随机。
 *
 * 这种策略将延迟分为两部分：一半是固定的基础延迟，另一半是随机延迟。
 * 最终延迟时间在 `[delay / 2, delay]` 范围内。
 *
 * @param delay 基础延迟时间（毫秒）。
 * @param random 可选的随机数生成器，默认为 `Math.random`。
 * @returns 添加抖动后的延迟时间。
 * @throws {JitterError} 如果 `delay` 不是一个非负有限数。
 *
 * @example
 * ```typescript
 * const delayWithJitter = addEqualJitter(1000); // 结果范围: [500, 1000]
 * ```
 */
export const addEqualJitter = (
  delay: number,
  random: RandomFunction = Math.random,
): number => {
  if (!Number.isFinite(delay) || delay < 0) {
    throw new JitterError("'delay' must be a non-negative finite number");
  }
  const halfDelay = delay / 2;

  const randomNumber = ensureRandom(random);
  return halfDelay + halfDelay * randomNumber;
};
