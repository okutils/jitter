import { JitterError } from "../errors";
import type { RandomFunction } from "../types";

/**
 * 校验并执行一个随机函数，确保其返回一个在 `[0, 1]` 区间内的有效数值。
 *
 * 此工具旨在为抖动（jitter）算法提供一个安全、可预测的随机源。
 * 它会检查传入的 `random` 函数：
 * 1. 是否为函数。
 * 2. 其返回值是否为 `[0, 1]` 区间内的有限数字。
 *
 * 注意：与 `Math.random()` 的 `[0, 1]` 区间不同，此函数允许返回 `1` 以兼容更多自定义实现。
 *
 * @param random 自定义随机函数。调用时应返回一个 `[0, 1]` 区间内的数字。
 * @param name （可选）用于错误消息的标签，默认为 "random"。
 * @returns number 返回一个经过校验的、在 `[0, 1]` 区间内的随机数。
 * @throws {JitterError} 如果 `random` 不是函数或其返回值无效。
 *
 * @example
 * ```ts
 * // 基本用法
 * ensureRandom(Math.random); // e.g., 0.3478
 *
 * // 允许返回 1
 * ensureRandom(() => 1); // 1
 *
 * // 无效输入将抛出 JitterError
 * ensureRandom(() => 1.5);
 * ensureRandom(() => NaN);
 * ```
 */
export const ensureRandom = (
  random: RandomFunction,
  name: string = "random",
): number => {
  if (typeof random !== "function") {
    throw new JitterError(`'${name}' must be a function returning a number`);
  }
  const value = random();
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1
  ) {
    throw new JitterError(
      `'${name}' must return a finite number in [0,1], got ${value}`,
    );
  }
  return value;
};
