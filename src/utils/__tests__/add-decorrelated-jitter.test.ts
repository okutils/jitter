import { describe, expect, it } from "@jest/globals";
import { JitterError } from "../../errors";
import { addDecorrelatedJitter } from "../add-decorrelated-jitter";

describe("addDecorrelatedJitter", () => {
  it("应生成一个在 [baseDelay, cap] 范围内的抖动延迟", () => {
    const baseDelay = 100;
    const cap = 10_000;
    let previous = baseDelay;
    const results: number[] = [];

    for (let i = 0; i < 20; i++) {
      const rand = i === 19 ? 0.999999 : i / 19;
      const next = addDecorrelatedJitter(baseDelay, previous, cap, () => rand);
      expect(next).toBeGreaterThanOrEqual(baseDelay);
      expect(next).toBeLessThanOrEqual(cap);
      results.push(next);
      previous = next;
    }

    // 结果应该随 i 单调不一定递增，但不应超 cap
    expect(Math.max(...results)).toBeLessThanOrEqual(cap);
  });

  it("应正确应用 multiplier 参数", () => {
    const baseDelay = 50;
    const previous = 200;
    const cap = 10_000;
    const multiplier = 4;
    const rand = 0.999999;
    const v = addDecorrelatedJitter(
      baseDelay,
      previous,
      cap,
      () => rand,
      multiplier,
    );
    const expectedUpper = Math.max(baseDelay, previous * multiplier);
    const expected = baseDelay + (expectedUpper - baseDelay) * rand;
    expect(v).toBeCloseTo(expected);
    expect(v).toBeLessThan(expectedUpper);
  });

  it("当延迟超过 cap 时应进行截断", () => {
    const v = addDecorrelatedJitter(100, 3000, 500, () => 0.999999);
    expect(v).toBe(500);
  });

  it("当参数无效时应抛出错误", () => {
    expect(() => addDecorrelatedJitter(-1, 1, 1)).toThrow(JitterError);
    expect(() => addDecorrelatedJitter(1, -1, 1)).toThrow(JitterError);
    expect(() => addDecorrelatedJitter(1, 1, -1)).toThrow(JitterError);
    expect(() => addDecorrelatedJitter(1, 1, 1, Math.random, 0)).toThrow(
      JitterError,
    );
  });
});
