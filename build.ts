// build.js

import path from "node:path";
import { fileURLToPath } from "node:url"; // Needed for __dirname equivalent in ESM
import { build as esbuildBuild } from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function build() {
  try {
    await esbuildBuild({
      tsconfig: path.join(__dirname, "./tsconfig.build.json"),
      bundle: true,
      entryPoints: [path.join(__dirname, "./index.ts")],
      outfile: path.join(__dirname, "./dist/index.js"),
      format: "esm",
      sourcemap: true,
    });
  } catch (error) {
    console.error("❌ esbuild build failed:", error);
    process.exit(1);
  }
}

build();
