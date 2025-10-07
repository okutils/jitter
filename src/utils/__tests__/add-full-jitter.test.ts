import { describe, expect, it } from "@jest/globals";
import { JitterError } from "../../errors";
import { addFullJitter } from "../add-full-jitter";

describe("addFullJitter", () => {
  it("应返回一个在 [0, delay] 范围内的值", () => {
    const delay = 250;
    const values: number[] = [];
    for (let i = 0; i <= 10; i++) {
      const v = addFullJitter(delay, () => i / 10);
      values.push(v);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(delay);
    }
    expect(values).toContain(0); // i=0
    expect(values).toContain(delay); // i=10
  });

  it("当参数无效时应抛出错误", () => {
    expect(() => addFullJitter(-1)).toThrow(JitterError);
  });
});
