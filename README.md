# SurrealDB WASM worker + Vite **build-time** reproduction

[Vite's docs on web workers](https://vite.dev/guide/features.html#web-workers)

This repo shows a build-time error when using `@surrealdb/wasm` (specifically `createWasmWorkerEngines`) in a Vite-based app.

The important detail is that the failure only happens at **build time**. Dev mode can work, but `vite build` fails because the Vite optimizer tries to analyze a `new URL(...)` call inside the compiled WASM wrapper.

## Steps to reproduce

1. Clone this repo.
2. Install dependencies:

  ```bash
  pnpm install
  ```

3. Build the app:

  ```bash
  pnpm run build
  ```

## Expected behavior

Using the documented worker API:

```ts
import { Surreal } from "surrealdb";
import { createWasmWorkerEngines } from "@surrealdb/wasm";

const db = new Surreal({
  engines: createWasmWorkerEngines(),
});
```

Vite should successfully build the project. Internally, `@surrealdb/wasm` should expose a worker entry that's friendly to Vite's build-time analysis.

## Actual behavior

- `pnpm run dev` can work.
- `pnpm run build` fails with an error about resolving / analyzing `new URL` inside the `@surrealdb/wasm` implementation.

From what I can tell:

- The WASM wrapper / worker entry is not exported as a separate public entry point.
- Vite treats the `@surrealdb/wasm` bundle as a dependency and tries to statically analyze a `new URL(...)` call inside it at build time.
- That `new URL` call is not in the `new URL("./worker.js", import.meta.url)` shape that Vite expects, so the optimizer fails and build breaks.

A Vite-friendly solution would be something like:

- Ensuring that worker instantiation in the WASM wrapper accept a custom `new URL("./worker.js", import.meta.url)` (or similar), **and**
- Optionally exposing a dedicated worker entry or a configuration point so bundlers like Vite can handle it cleanly.
