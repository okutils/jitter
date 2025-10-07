import { describe, expect, it } from "@jest/globals";
import { JitterError } from "../../errors";
import { addEqualJitter } from "../add-equal-jitter";

describe("addEqualJitter", () => {
  it("应返回一个在 [delay/2, delay] 范围内的值", () => {
    const delay = 1000;
    const values: number[] = [];
    for (let i = 0; i <= 10; i++) {
      const v = addEqualJitter(delay, () => i / 10);
      values.push(v);
      expect(v).toBeGreaterThanOrEqual(delay / 2);
      expect(v).toBeLessThanOrEqual(delay);
    }
    expect(values).toContain(delay / 2); // i=0
    expect(values).toContain(delay); // i=10
  });

  it("当参数无效时应抛出错误", () => {
    expect(() => addEqualJitter(-1)).toThrow(JitterError);
  });
});
