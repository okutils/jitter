import { describe, expect, it } from "@jest/globals";
import { JitterError } from "../../errors";
import { addEqualJitter } from "../add-equal-jitter";

describe("addEqualJitter", () => {
  it("应返回一个在 [delay/2, delay) 范围内的值", () => {
    const delay = 1000;
    const values: number[] = [];
    const randomValues = [...Array(10).keys()].map((i) => i / 10);
    randomValues.push(0.999999);
    for (const rand of randomValues) {
      const v = addEqualJitter(delay, () => rand);
      values.push(v);
      expect(v).toBeGreaterThanOrEqual(delay / 2);
      expect(v).toBeLessThan(delay);
    }
    expect(values).toContain(delay / 2);
    expect(Math.max(...values)).toBeLessThan(delay);
  });

  it("当参数无效时应抛出错误", () => {
    expect(() => addEqualJitter(-1)).toThrow(JitterError);
  });
});
