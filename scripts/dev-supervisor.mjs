import { spawn } from "node:child_process";
import { stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const workspace = process.cwd();
const viteEntry = path.join(workspace, "node_modules", "vite", "bin", "vite.js");
const watchedFiles = ["package.json", "package-lock.json", "vite.config.ts"].map((file) => path.join(workspace, file));
const maxLifetimeMs = 6 * 60 * 60 * 1000;
const forwardedArgs = process.argv.slice(2);
const viteArgs = forwardedArgs.length === 2 && forwardedArgs.every((value) => !value.startsWith("-"))
  ? ["--host", forwardedArgs[0], "--port", forwardedArgs[1]]
  : forwardedArgs.length ? forwardedArgs : ["--host", "127.0.0.1", "--port", "4173"];

let child = null;
let childStartedAt = 0;
let restarting = false;
let stopped = false;

async function signature() {
  const values = await Promise.all(watchedFiles.map(async (file) => {
    try {
      const info = await stat(file);
      return `${file}:${info.mtimeMs}:${info.size}`;
    } catch {
      return `${file}:missing`;
    }
  }));
  return values.join("|");
}

let lastSignature = await signature();

function start() {
  if (stopped) return;
  childStartedAt = Date.now();
  child = spawn(process.execPath, ["--max-old-space-size=2048", viteEntry, ...viteArgs], {
    cwd: workspace,
    env: { ...process.env, NODE_OPTIONS: "" },
    stdio: "inherit",
    windowsHide: true,
  });
  child.once("exit", (code, signal) => {
    child = null;
    if (stopped || restarting) return;
    console.error(`[dev] Vite exited (${signal || code}); restarting with a clean process.`);
    setTimeout(start, 800);
  });
}

function restart(reason) {
  if (stopped || restarting) return;
  restarting = true;
  console.warn(`[dev] ${reason}; restarting Vite to release its module graph and file watchers.`);
  const current = child;
  if (!current) {
    restarting = false;
    start();
    return;
  }
  current.once("exit", () => {
    restarting = false;
    setTimeout(start, 500);
  });
  current.kill("SIGTERM");
}

const guard = setInterval(async () => {
  const nextSignature = await signature();
  if (nextSignature !== lastSignature) {
    lastSignature = nextSignature;
    restart("dependencies or Vite configuration changed");
    return;
  }
  if (child && Date.now() - childStartedAt >= maxLifetimeMs) restart("six-hour development-session limit reached");
}, 2000);

function shutdown() {
  stopped = true;
  clearInterval(guard);
  child?.kill("SIGTERM");
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
start();
