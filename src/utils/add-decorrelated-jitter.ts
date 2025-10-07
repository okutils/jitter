import { JitterError } from "../errors";
import type { RandomFunction } from "../types";
import { ensureRandom } from "./ensure-random";

/**
 * 应用装饰性抖动 (Decorrelated Jitter) 算法，一种 AWS 推荐的退避策略。
 *
 * 该算法基于前一次的延迟时间计算下一次延迟，通过引入随机性来避免不同客户端之间的重试拥塞。
 * 计算方式：在区间 `[baseDelay, max(baseDelay, previousDelay * multiplier)]` 上取一个随机值，
 * 然后再与 `cap` 取最小值。
 *
 * 注意：
 * 1. 若 `previousDelay * multiplier < baseDelay`，区间退化为单点 `baseDelay`。
 * 2. 若 `baseDelay > cap`，结果会被直接裁剪为 `cap`（退化为常数）；请确保配置上保持 `cap >= baseDelay`。
 * 3. 当 `previousDelay * multiplier` 远大于 `cap` 时，分布中超出 `cap` 的部分会集中折叠到 `cap`。
 *
 * @param baseDelay 基础延迟时间（毫秒）。
 * @param previousDelay 上一次的延迟时间（毫秒）。
 * @param cap 延迟时间的上限（毫秒）。
 * @param random 可选的随机数生成器，默认为 `Math.random`。
 * @param multiplier 延迟时间的增长倍数，默认为 3。
 * @returns 计算后的延迟时间（毫秒）。
 *
 * @example
 * ```typescript
 * // 首次重试
 * let delay = addDecorrelatedJitter(100, 100, 10000);
 *
 * // 后续重试
 * delay = addDecorrelatedJitter(100, delay, 10000);
 * ```
 *
 * @throws {JitterError} 当任意参数为无效数值时抛出。
 */
export const addDecorrelatedJitter = (
  baseDelay: number,
  previousDelay: number,
  cap: number,
  random: RandomFunction = Math.random,
  multiplier: number = 3,
): number => {
  if (!Number.isFinite(baseDelay) || baseDelay < 0) {
    throw new JitterError("'baseDelay' must be a non-negative finite number");
  }
  if (!Number.isFinite(previousDelay) || previousDelay < 0) {
    throw new JitterError(
      "'previousDelay' must be a non-negative finite number",
    );
  }
  if (!Number.isFinite(cap) || cap < 0) {
    throw new JitterError("'cap' must be a non-negative finite number");
  }
  if (!Number.isFinite(multiplier) || multiplier <= 0) {
    throw new JitterError("'multiplier' must be a positive finite number");
  }

  const upperCandidate = previousDelay * multiplier;
  const upper = Math.max(baseDelay, upperCandidate);

  const randomNumber = ensureRandom(random);

  const randomDelay = baseDelay + (upper - baseDelay) * randomNumber;
  return Math.min(cap, randomDelay);
};
