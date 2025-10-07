import { describe, expect, it } from "@jest/globals";
import { JitterError } from "../../errors";
import { ensureRandom } from "../ensure-random";

describe("ensureRandom", () => {
  it("当提供 Math.random 时，应返回一个在 [0, 1] 范围内的值", () => {
    const v = ensureRandom(Math.random);
    expect(typeof v).toBe("number");
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThanOrEqual(1);
  });

  it("应使用并返回自定义随机函数的值", () => {
    const fn = () => 0.75;
    expect(ensureRandom(fn)).toBe(0.75);
  });

  it("当 random 不是函数时应抛出错误", () => {
    // @ts-expect-error purposely wrong
    expect(() => ensureRandom(123)).toThrow(JitterError);
  });

  it("当随机函数的返回值不在 [0, 1] 范围内时应抛出错误", () => {
    const invalids = [
      () => -0.1,
      () => 1.1,
      () => Number.POSITIVE_INFINITY,
      () => NaN,
    ];
    for (const fn of invalids) {
      expect(() => ensureRandom(fn)).toThrow(JitterError);
    }
  });
});
