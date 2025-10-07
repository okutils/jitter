// Re-export utilities (jitter algorithms & helpers)
export * from "./utils";

// Expose error types & public TypeScript types at package root to avoid forcing
// consumers to deep-import internal paths. This addresses a previous omission
// where `JitterError` / `RandomFunction` could not be imported from the root.
export * from "./errors";
export * from "./types";
