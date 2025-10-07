import { describe, expect, it } from "@jest/globals";
import { JitterError } from "../../errors";
import { addFixedJitter } from "../add-fixed-jitter";

describe("addFixedJitter", () => {
  it("应返回一个在 [delay, delay + maxJitter) 范围内的值", () => {
    const delay = 100;
    const maxJitter = 50;
    const values: number[] = [];
    const randomValues = [...Array(10).keys()].map((i) => i / 10);
    randomValues.push(0.999999);
    for (const rand of randomValues) {
      const v = addFixedJitter(delay, maxJitter, () => rand);
      values.push(v);
      expect(v).toBeGreaterThanOrEqual(delay);
      expect(v).toBeLessThan(delay + maxJitter);
    }
    expect(values).toContain(delay);
    expect(Math.max(...values)).toBeLessThan(delay + maxJitter);
  });

  it("当参数无效时应抛出错误", () => {
    expect(() => addFixedJitter(-1, 10)).toThrow(JitterError);

    expect(() => addFixedJitter(10, -1)).toThrow(JitterError);
  });
});
