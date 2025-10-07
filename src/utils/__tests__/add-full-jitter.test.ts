import { describe, expect, it } from "@jest/globals";
import { JitterError } from "../../errors";
import { addFullJitter } from "../add-full-jitter";

describe("addFullJitter", () => {
  it("应返回一个在 [0, delay) 范围内的值", () => {
    const delay = 250;
    const values: number[] = [];
    const randomValues = [...Array(10).keys()].map((i) => i / 10);
    randomValues.push(0.999999);
    for (const rand of randomValues) {
      const v = addFullJitter(delay, () => rand);
      values.push(v);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(delay);
    }
    expect(values).toContain(0);
    expect(Math.max(...values)).toBeLessThan(delay);
  });

  it("当参数无效时应抛出错误", () => {
    expect(() => addFullJitter(-1)).toThrow(JitterError);
  });
});
