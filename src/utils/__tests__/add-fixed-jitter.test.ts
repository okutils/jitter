import { describe, expect, it } from "@jest/globals";
import { JitterError } from "../../errors";
import { addFixedJitter } from "../add-fixed-jitter";

describe("addFixedJitter", () => {
  it("应返回一个在 [delay, delay + maxJitter] 范围内的值", () => {
    const delay = 100;
    const maxJitter = 50;
    const values: number[] = [];
    for (let i = 0; i <= 10; i++) {
      const v = addFixedJitter(delay, maxJitter, () => i / 10);
      values.push(v);
      expect(v).toBeGreaterThanOrEqual(delay);
      expect(v).toBeLessThanOrEqual(delay + maxJitter);
    }
    expect(values).toContain(delay); // i=0
    expect(values).toContain(delay + maxJitter); // i=10
  });

  it("当参数无效时应抛出错误", () => {
    expect(() => addFixedJitter(-1, 10)).toThrow(JitterError);

    expect(() => addFixedJitter(10, -1)).toThrow(JitterError);
  });
});
