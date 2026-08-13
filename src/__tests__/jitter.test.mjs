import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  JitterError,
  addDecorrelatedJitter,
  addEqualJitter,
  addFixedJitter,
  addFullJitter,
  addJitter,
  ensureRandom,
} from '../../dist/index.mjs';

describe('addDecorrelatedJitter', () => {
  it('应生成一个在 [baseDelay, cap] 范围内的抖动延迟', () => {
    const baseDelay = 100;
    const cap = 10_000;
    let previous = baseDelay;
    const results = [];

    for (let i = 0; i < 20; i++) {
      const rand = i === 19 ? 0.999999 : i / 19;
      const next = addDecorrelatedJitter(baseDelay, previous, cap, () => rand);
      assert.ok(next >= baseDelay);
      assert.ok(next <= cap);
      results.push(next);
      previous = next;
    }

    assert.ok(Math.max(...results) <= cap);
  });

  it('应正确应用 multiplier 参数', () => {
    const baseDelay = 50;
    const previous = 200;
    const cap = 10_000;
    const multiplier = 4;
    const rand = 0.999999;
    const value = addDecorrelatedJitter(baseDelay, previous, cap, () => rand, multiplier);
    const expectedUpper = Math.max(baseDelay, previous * multiplier);
    const expected = baseDelay + (expectedUpper - baseDelay) * rand;
    assert.ok(Math.abs(value - expected) < 1e-9);
    assert.ok(value < expectedUpper);
  });

  it('当延迟超过 cap 时应进行截断', () => {
    assert.equal(
      addDecorrelatedJitter(100, 3000, 500, () => 0.999999),
      500,
    );
  });

  it('当参数无效时应抛出错误', () => {
    assert.throws(() => addDecorrelatedJitter(-1, 1, 1), JitterError);
    assert.throws(() => addDecorrelatedJitter(1, -1, 1), JitterError);
    assert.throws(() => addDecorrelatedJitter(1, 1, -1), JitterError);
    assert.throws(() => addDecorrelatedJitter(1, 1, 1, Math.random, 0), JitterError);
  });
});

describe('addEqualJitter', () => {
  it('应返回一个在 [delay/2, delay) 范围内的值', () => {
    const delay = 1000;
    const values = [];
    const randomValues = [...Array(10).keys()].map((i) => i / 10);
    randomValues.push(0.999999);

    for (const rand of randomValues) {
      const value = addEqualJitter(delay, () => rand);
      values.push(value);
      assert.ok(value >= delay / 2);
      assert.ok(value < delay);
    }

    assert.ok(values.includes(delay / 2));
    assert.ok(Math.max(...values) < delay);
  });

  it('当参数无效时应抛出错误', () => {
    assert.throws(() => addEqualJitter(-1), JitterError);
  });
});

describe('addFixedJitter', () => {
  it('应返回一个在 [delay, delay + maxJitter) 范围内的值', () => {
    const delay = 100;
    const maxJitter = 50;
    const values = [];
    const randomValues = [...Array(10).keys()].map((i) => i / 10);
    randomValues.push(0.999999);

    for (const rand of randomValues) {
      const value = addFixedJitter(delay, maxJitter, () => rand);
      values.push(value);
      assert.ok(value >= delay);
      assert.ok(value < delay + maxJitter);
    }

    assert.ok(values.includes(delay));
    assert.ok(Math.max(...values) < delay + maxJitter);
  });

  it('当参数无效时应抛出错误', () => {
    assert.throws(() => addFixedJitter(-1, 10), JitterError);
    assert.throws(() => addFixedJitter(10, -1), JitterError);
  });
});

describe('addFullJitter', () => {
  it('应返回一个在 [0, delay) 范围内的值', () => {
    const delay = 250;
    const values = [];
    const randomValues = [...Array(10).keys()].map((i) => i / 10);
    randomValues.push(0.999999);

    for (const rand of randomValues) {
      const value = addFullJitter(delay, () => rand);
      values.push(value);
      assert.ok(value >= 0);
      assert.ok(value < delay);
    }

    assert.ok(values.includes(0));
    assert.ok(Math.max(...values) < delay);
  });

  it('当参数无效时应抛出错误', () => {
    assert.throws(() => addFullJitter(-1), JitterError);
  });
});

describe('addJitter', () => {
  it('当 factor 为默认值 0.2 时，应返回一个在 [0.8*delay, 1.2*delay] 范围内的值', () => {
    const delay = 1000;
    const randomValues = [...Array(20).keys()].map((i) => i / 20);
    randomValues.push(0.999999);

    for (const rand of randomValues) {
      const value = addJitter(delay, undefined, () => rand);
      assert.ok(value >= delay * 0.8 - 1e-9);
      assert.ok(value < delay * 1.2 + 1e-9);
    }
  });

  it('应正确应用自定义的 factor', () => {
    const delay = 500;
    const factor = 0.5;
    const rand = 0.999999;
    const value = addJitter(delay, factor, () => rand);
    const expected = delay + delay * factor * (rand * 2 - 1);
    assert.ok(Math.abs(value - expected) < 1e-9);
    assert.ok(value < delay * (1 + factor));
  });

  it('当参数为负数或 NaN 时应抛出错误', () => {
    assert.throws(() => addJitter(-1, 0.2), JitterError);
    assert.throws(() => addJitter(100, -0.1), JitterError);
    assert.throws(() => addJitter(Number.NaN, 0.2), JitterError);
    assert.throws(() => addJitter(100, 1.01), JitterError);
  });

  it('应确保返回值不为负数', () => {
    assert.equal(
      addJitter(10, 1, () => 0),
      0,
    );
  });
});

describe('ensureRandom', () => {
  it('当提供 Math.random 时，应返回一个在 [0, 1) 范围内的值', () => {
    const value = ensureRandom(Math.random);
    assert.equal(typeof value, 'number');
    assert.ok(value >= 0);
    assert.ok(value < 1);
  });

  it('应使用并返回自定义随机函数的值', () => {
    assert.equal(
      ensureRandom(() => 0.75),
      0.75,
    );
  });

  it('当 random 不是函数时应抛出错误', () => {
    assert.throws(() => ensureRandom(123), JitterError);
  });

  it('当随机函数的返回值不在 [0, 1) 范围内时应抛出错误', () => {
    const invalids = [() => -0.1, () => 1, () => 1.1, () => Number.POSITIVE_INFINITY, () => Number.NaN];

    for (const fn of invalids) {
      assert.throws(() => ensureRandom(fn), JitterError);
    }
  });
});
