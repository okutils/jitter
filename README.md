# @okutils/jitter

[![npm version](https://img.shields.io/npm/v/@okutils/jitter.svg)](https://www.npmjs.com/package/@okutils/jitter)
[![license](https://img.shields.io/npm/l/@okutils/jitter.svg)](LICENSE)

一个为 TypeScript/JavaScript 设计的轻量级工具库，专注于在延迟时间上应用各类抖动（Jitter）策略。通过引入随机性，它可以有效缓解分布式系统中的请求冲突、网络拥塞和“惊群效应”。本库内置了多种业界标准的抖动算法，如完全抖动（Full Jitter）、均等抖动（Equal Jitter）和 AWS 推荐的解相关抖动（Decorrelated Jitter）。

> [!IMPORTANT]
>
> 目前还没有发布 1.0 版，可能会存在 bug 或不兼容的变更。

## 安装

```bash
# 使用 pnpm
pnpm add @okutils/jitter

# 使用 yarn
yarn add @okutils/jitter

# 使用 npm
npm install @okutils/jitter

# 使用 Bun
bun add @okutils/jitter
```

## 使用方法

下面是一个基本的示例，展示如何在一个 1000 毫秒的延迟上应用默认的抖动（±20%）：

```typescript
import { addJitter } from "@okutils/jitter";

// 基础延迟为 1000ms
const baseDelay = 1000;

// 应用抖动
const delayWithJitter = addJitter(baseDelay);

// 输出的延迟将在 800ms 到 1200ms 之间
console.log(
  `原始延迟: ${baseDelay}ms, 应用抖动后: ${delayWithJitter.toFixed(2)}ms`,
);
```

### API

本库提供以下核心函数。所有函数的 `random` 参数均为可选，若不提供，则默认使用 `Math.random()` 作为随机源。所有随机源的返回值必须在 `[0, 1)` 区间内。

> **区间约定**：本文档使用 `[a, b)` 表示一个包含下界 `a` 但不包含上界 `b` 的左闭右开区间。如果结果经过 `cap` 参数截断，则可能落在闭合上界点上（即允许等于 `cap`）。

#### 1. `addJitter(delay, factor = 0.2, random?)`

在基础延迟上应用对称的百分比抖动。它通过在 `delay` 上加或减一个由 `factor` 控制的随机百分比来计算新延迟。

- **公式**: `delay * (1 + factor * (2 * r - 1))`，其中 `r` 是 `[0, 1)` 范围内的随机数。
- **结果区间**: `[delay * (1 - factor), delay * (1 + factor))`，并确保最终值不小于 0。

```ts
// 1000ms 基础延迟，默认 factor = 0.2 -> [800, 1200)
const v = addJitter(1000);
```

**适用场景**：需要简单、可控的按比例扩散延迟的场景。

#### 2. `addFullJitter(delay, random?)`

应用“完全抖动”（Full Jitter）策略，提供最大程度的随机性。

- **结果区间**: `[0, delay)`。

```ts
const v = addFullJitter(1000); // [0, 1000)
```

**适用场景**：高并发环境下，有效避免因重试策略一致而导致的“惊群效应”。

#### 3. `addEqualJitter(delay, random?)`

应用“均等抖动”（Equal Jitter）策略，兼顾了固定延迟和随机性。

- **结果区间**: `[delay / 2, delay)`。

```ts
const v = addEqualJitter(1000); // [500, 1000)
```

**适用场景**：既希望保留部分固定延迟，又需要引入随机性以分散请求的场景。

#### 4. `addDecorrelatedJitter(baseDelay, previousDelay, cap, random?, multiplier = 3)`

实现 AWS Builders' Library 推荐的“解相关抖动”（Decorrelated Jitter）退避算法。该算法根据上一次的延迟动态计算下一次的延迟范围，以避免不同客户端之间的重试同步。

- **计算逻辑**: `min(cap, random(baseDelay, max(baseDelay, previousDelay * multiplier)))`。
- **采样区间**: 首先在 `[baseDelay, max(baseDelay, previousDelay * multiplier))` 区间内取一个随机值，然后与 `cap` 取较小者。

**特性**:

- **避免同步**：与纯指数退避相比，随机性可以有效避免多个客户端同步重试。
- **受控增长**：`multiplier` 控制了延迟的增长速率（默认为 3）。
- **边界情况**：
  - 当 `previousDelay * multiplier < baseDelay` 时，随机区间退化为固定值 `baseDelay`。
  - 建议始终保持 `cap >= baseDelay`，否则结果将恒为 `cap`。

```ts
// 首次重试，previousDelay 可设为与 baseDelay 相同
let delay = addDecorrelatedJitter(100, 100, 10_000);

// 后续重试，传入上一次计算出的 delay
delay = addDecorrelatedJitter(100, delay, 10_000);
```

**适用场景**：需要实现智能、防拥塞的重试/回退机制，尤其适用于长时间运行的服务。

#### 5. `addFixedJitter(delay, maxJitter, random?)`

在基础延迟上添加一个固定范围的随机增量。

- **结果区间**: `[delay, delay + maxJitter)`。

```ts
const v = addFixedJitter(1000, 200); // [1000, 1200)
```

**适用场景**：需要为延迟增加少量随机性，同时要求延迟上限严格可控的场景。

#### 6. `ensureRandom(randomFn)` (工具函数)

校验并执行一个自定义随机函数，确保其返回值在 `[0, 1)` 区间内，否则抛出 `JitterError`。

此函数主要用于内部，或在需要注入可复现的伪随机源（如测试）时使用。

```ts
const r = ensureRandom(() => 0.42); // 返回 0.42
// ensureRandom(() => 1) 将抛出 JitterError
```

**适用场景**：测试、注入确定性的伪随机数生成器、对随机源进行安全校验。

### 配置选项（参数汇总）

| 参数            | 适用函数                                | 说明                                       | 取值 / 默认              |
| --------------- | --------------------------------------- | ------------------------------------------ | ------------------------ |
| `delay`         | 所有除 `addDecorrelatedJitter` 外的函数 | 基础延迟时间（毫秒）                       | `≥ 0` 的有限数           |
| `factor`        | `addJitter`                             | 对称抖动的百分比幅度                       | `[0, 1]`，默认 `0.2`     |
| `random`        | 全部                                    | 自定义随机函数，返回值需在 `[0, 1)` 区间内 | 缺省 `Math.random`       |
| `baseDelay`     | `addDecorrelatedJitter`                 | 延迟的最小基础值（毫秒）                   | `≥ 0` 的有限数           |
| `previousDelay` | `addDecorrelatedJitter`                 | 上一次计算出的延迟值（毫秒）               | `≥ 0` 的有限数           |
| `cap`           | `addDecorrelatedJitter`                 | 延迟的上限（毫秒），结果将被截断至此值     | `≥ 0` 的有限数           |
| `multiplier`    | `addDecorrelatedJitter`                 | 延迟增长的倍率                             | `> 0` 的有限数，默认 `3` |
| `maxJitter`     | `addFixedJitter`                        | 固定的最大抖动增量（毫秒）                 | `≥ 0` 的有限数           |

> 已移除文档中误写的 `fixedValue`，真实参数为 `maxJitter`。

**边界与裁剪**：

- 所有函数的数值参数若为负数或非有限数（`Infinity`, `NaN`），将抛出 `JitterError`。
- `addJitter` 的结果会确保不小于 `0`。
- `addDecorrelatedJitter` 的结果会被 `cap` 值进行上限裁剪。

### 错误类

本库定义了一个自定义错误类型 `JitterError`，用于标识所有与参数校验或运行时相关的错误。

##### 使用场景

当传递给抖动函数的参数无效时，会抛出 `JitterError`。例如：

- `delay` 或其他数值参数为负数、`Infinity` 或 `NaN`。
- `factor` 超出 `[0, 1]` 的范围。
- 自定义的 `random` 函数返回值不在 `[0, 1)` 区间内。

##### 错误处理

为了确保应用的健壮性，建议将抖动函数调用包裹在 `try...catch` 块中，并专门处理 `JitterError`。

```typescript
import { addJitter, JitterError } from "@okutils/jitter";

try {
  // 尝试使用无效的延迟值
  const result = addJitter(-100);
  console.log(result);
} catch (error) {
  if (error instanceof JitterError) {
    // 捕获并处理抖动计算相关的错误
    console.error("抖动计算失败:", error.message);
  } else {
    // 处理其他预料之外的错误
    console.error("发生未知错误:", error);
  }
}
```

### FAQ

**Q: 为什么我的值永远达不到区间的上界？**  
A: 因为内部使用的随机源（如 `Math.random()`）返回的是一个 `[0, 1)` 区间的值，不包含 `1`。因此，计算结果的区间通常是右开的，例如 `[0, 1000)` 不会包含 `1000`。唯一的例外是当 `addDecorrelatedJitter` 的结果被 `cap` 截断时，可以等于 `cap`。

**Q: 我提供的 `random` 函数可以返回 1 吗？**  
A: 不可以。库内部的 `ensureRandom` 函数会进行校验，如果返回值大于等于 `1` 或小于 `0`，会抛出 `JitterError`。请确保您的随机函数返回值严格在 `[0, 1)` 区间内。

**Q: `addDecorrelatedJitter` 适合什么场景？**  
A: 它非常适合实现重试/回退逻辑，尤其是在需要平衡“指数增长”和“避免客户端同步”的复杂分布式系统中。它的随机区间依赖于上一次的延迟结果，而不是固定的指数倍增，从而更智能地分散请求。

**Q: 我需要自己调用 `ensureRandom` 吗？**  
A: 通常不需要。所有抖动函数内部都已经调用了它。只有当您需要单独测试或封装自己的随机源时，才可能直接使用。

## 许可证

MIT © Luke Na
