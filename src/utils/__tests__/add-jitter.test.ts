import { describe, expect, it } from "@jest/globals";
import { JitterError } from "../../errors";
import { addJitter } from "../add-jitter";

describe("addJitter", () => {
  it("当 factor 为默认值 0.2 时，应返回一个在 [0.8*delay, 1.2*delay] 范围内的值", () => {
    const delay = 1000;
    for (let i = 0; i < 20; i++) {
      const v = addJitter(delay, undefined, () => i / 19); // 0..1
      expect(v).toBeGreaterThanOrEqual(delay * 0.8 - 1e-9);
      expect(v).toBeLessThanOrEqual(delay * 1.2 + 1e-9);
    }
  });

  it("应正确应用自定义的 factor", () => {
    const delay = 500;
    const factor = 0.5; // [-0.5, +0.5]
    const v = addJitter(delay, factor, () => 1); // 最大正偏移
    expect(v).toBeCloseTo(delay * (1 + factor));
  });

  it("当参数为负数或 NaN 时应抛出错误", () => {
    expect(() => addJitter(-1, 0.2)).toThrow(JitterError);

    expect(() => addJitter(100, -0.1)).toThrow(JitterError);
    expect(() => addJitter(Number.NaN, 0.2)).toThrow(JitterError);
    // 新的上界校验
    expect(() => addJitter(100, 1.01)).toThrow(JitterError);
  });

  it("应确保返回值不为负数", () => {
    const v = addJitter(10, 1, () => 0); // jitter = 10 * 1 * (-1) = -10 -> clipped to 0
    expect(v).toBe(0);
  });
});
