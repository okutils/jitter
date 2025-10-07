import { JitterError } from "../errors";
import type { RandomFunction } from "../types";
import { ensureRandom } from "./ensure-random";

/**
 * 应用全抖动 (Full Jitter) 策略，返回一个在 [0, delay) 范围内的随机延迟。
 *
 * 全抖动提供了最大的随机性，能有效避免高并发下的“惊群效应”。
 *
 * @param delay 基础延迟（毫秒），也是随机范围的上限。
 * @param random 可选的随机数生成器，默认为 `Math.random`。
 * @returns 抖动后的新延迟时间（毫秒）。
 * @throws {JitterError} 如果 `delay` 不是一个非负有限数。
 * @example
 * ```typescript
 * // 计算 1000ms 的全抖动延迟
 * const jitteredDelay = addFullJitter(1000);
 * // => 结果在 [0, 1000) 范围内
 * ```
 */
export const addFullJitter = (
  delay: number,
  random: RandomFunction = Math.random,
): number => {
  if (!Number.isFinite(delay) || delay < 0) {
    throw new JitterError("'delay' must be a non-negative finite number");
  }

  const randomNumber = ensureRandom(random);
  return delay * randomNumber;
};
