#!/usr/bin/env node
/**
 * The quality gate. Runs lint, typecheck, and tests in order and stops at
 * the first failure. Used three ways:
 *
 *   npm run verify              full gate, exits 1 on failure
 *   npm run verify -- --quick   typecheck + tests only (skips lint)
 *   node scripts/verify.mjs --hook
 *                               Claude Code Stop hook. Skips when the working
 *                               tree is clean, exits 2 on failure so the agent
 *                               is sent back to fix the problem, and never
 *                               loops (see stop_hook_active below).
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const args = new Set(process.argv.slice(2));
const hookMode = args.has("--hook");
const quick = args.has("--quick");

function run(label, cmdArgs) {
  const started = Date.now();
  // One constant command string through the shell: works for npm.cmd on
  // Windows and plain npm elsewhere, and avoids Node's DEP0190 warning
  // about args + shell. Nothing here comes from user input.
  const res = spawnSync(["npm", ...cmdArgs].join(" "), {
    stdio: hookMode ? "pipe" : "inherit",
    encoding: "utf8",
    shell: true,
  });
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  if (res.status === 0) {
    if (hookMode) process.stderr.write(`verify: ${label} ok (${seconds}s)\n`);
    return null;
  }
  const output = hookMode ? `${res.stdout ?? ""}${res.stderr ?? ""}` : "";
  return { label, output: output.trim().split("\n").slice(-40).join("\n") };
}

function workingTreeDirty() {
  const res = spawnSync("git", ["status", "--porcelain"], { encoding: "utf8" });
  return res.status !== 0 || res.stdout.trim().length > 0;
}

function readHookInput() {
  if (!hookMode) return {};
  try {
    const raw = readFileSync(0, "utf8");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const hookInput = readHookInput();

if (hookMode && !workingTreeDirty()) {
  process.stderr.write("verify: working tree clean, nothing to gate\n");
  process.exit(0);
}

const steps = quick
  ? [
      ["typecheck", ["run", "typecheck", "--silent"]],
      ["test", ["run", "test", "--silent"]],
    ]
  : [
      ["lint", ["run", "lint", "--silent"]],
      ["typecheck", ["run", "typecheck", "--silent"]],
      ["test", ["run", "test", "--silent"]],
    ];

for (const [label, cmdArgs] of steps) {
  const failure = run(label, cmdArgs);
  if (!failure) continue;

  if (hookMode) {
    process.stderr.write(
      `\nverify: ${failure.label} FAILED. Fix it before finishing.\n\n${failure.output}\n`
    );
    // If this is already the re-run triggered by a previous block, report
    // but do not block again, so a stubborn failure cannot trap the session.
    process.exit(hookInput.stop_hook_active ? 0 : 2);
  }
  process.exit(1);
}

if (hookMode) process.stderr.write("verify: all gates passed\n");
