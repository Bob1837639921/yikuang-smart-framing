#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lockPath = path.join(root, "mobile-runtime.lock.json");
const protectedFiles = [
  "scripts/check-mobile-runtime.mjs",
  "scripts/prepare-sites-build.mjs",
  "scripts/update-mobile-runtime-lock.mjs",
  "vite.config.ts",
  "website/src/App.tsx",
  "website/src/main.tsx",
  "website/src/styles.css",
  "worker/index.js",
];

const hashes = {};
for (const relativePath of protectedFiles) {
  const filePath = path.join(root, relativePath);
  if (!existsSync(filePath)) throw new Error(`Protected runtime file is missing: ${relativePath}`);
  hashes[relativePath] = createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

writeFileSync(lockPath, `${JSON.stringify(hashes, null, 2)}\n`);
console.log(`Updated mobile-runtime.lock.json (${protectedFiles.length} protected files).`);
