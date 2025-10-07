import { JitterError } from "../errors";
import type { RandomFunction } from "../types";
import { ensureRandom } from "./ensure-random";

/**
 * @description 在给定的延迟时间上应用对称的随机抖动。
 *
 * 此函数通过将一个随机的百分比（由 `factor` 控制）加或减到 `delay` 上来计算新的延迟时间。
 *
 * @param delay 基础延迟时间，单位为毫秒。
 * @param factor 抖动因子，一个 0 到 1 之间（含端点）的数字，用于决定抖动的幅度。默认为 `0.2`。
 *                 例如，`factor = 0.2` 时抖动范围为 `[-20%, +20%]`，
 *                 最终延迟范围在 `[delay * (1-factor), delay * (1+factor)]` 内。
 *                 如果超出该区间（例如计算结果为负），会被裁剪到不小于 0。
 * @param random 一个可选的自定义随机数生成函数，应返回 `[0, 1)` 范围内的数字。默认为 `Math.random`。
 * @returns 返回应用抖动后的新延迟时间（毫秒），结果不会小于 0。
 *
 * @example
 * ```typescript
 * // 假设基础延迟为 1000ms，抖动因子为默认的 0.2
 * const delayWithJitter = addJitter(1000);
 * // 输出的延迟将在 800ms 到 1200ms 之间
 * console.log(delayWithJitter);
 * ```
 *
 * @throws {JitterError} 如果 `delay` 或 `factor` 不是有效的非负有限数，则抛出错误。
 */
export const addJitter = (
  delay: number,
  factor: number = 0.2,
  random: RandomFunction = Math.random,
): number => {
  if (!Number.isFinite(delay) || delay < 0) {
    throw new JitterError("'delay' must be a non-negative finite number");
  }
  if (!Number.isFinite(factor) || factor < 0 || factor > 1) {
    throw new JitterError("'factor' must be a finite number in [0,1]");
  }

  const randomNumber = ensureRandom(random);
  const jitter = delay * factor * (randomNumber * 2 - 1);

  return Math.max(0, delay + jitter);
};
