import { createWasmWorkerEngines } from "@surrealdb/wasm";
import { Surreal } from "surrealdb";

const output = document.getElementById("output") as HTMLPreElement | null;

function log(...args: unknown[]) {
  const msg = args
    .map((x) =>
      typeof x === "string" ? x : JSON.stringify(x, null, 2),
    )
    .join(" ");
  console.log(msg);
  if (output) {
    output.textContent += msg + "\n";
  }
}

async function main() {
  log("Initializing SurrealDB with WASM worker engines...");

  const db = new Surreal({
    engines: createWasmWorkerEngines(),
  });

  try {
    // Try to use the in-memory WASM engine via worker
    await db.connect("mem://", {
      namespace: "test",
      database: "test",
    });

    log("Connected to mem engine, running a simple query...");
    const res = await db.query("CREATE test SET hello = world;").collect();
    log("Query result:", res);
  } catch (err) {
    log("Error:", err instanceof Error ? err.message : String(err));
    log("Full error object:", err);
  }
}

main().catch((err) => {
  log("Top-level error:", err);
});
