// Behavioural tests for the commit-guard PreToolUse hook: node --test scripts/
// The hook is driven exactly as Claude Code and Codex drive it — a JSON payload
// on stdin, a JSON decision (or nothing) on stdout.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync, spawnSync } = require("node:child_process");

const HOOK = path.join(__dirname, "commit-guard.js");

function hasGit() {
  return spawnSync("git", ["--version"]).status === 0;
}

function repo({ strictness, staged }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "commit-guard-"));
  execFileSync("git", ["init", "-q"], { cwd: dir });
  if (strictness !== undefined) {
    fs.mkdirSync(path.join(dir, ".claude", "docs-guardian"), { recursive: true });
    fs.writeFileSync(
      path.join(dir, ".claude", "docs-guardian", "config.json"),
      JSON.stringify({ hookStrictness: strictness })
    );
  }
  for (const file of staged) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), "x\n");
    execFileSync("git", ["add", file], { cwd: dir });
  }
  return dir;
}

function run(cwd, command) {
  const result = spawnSync("node", [HOOK], {
    cwd,
    input: JSON.stringify({ tool_name: "Bash", tool_input: { command }, cwd }),
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim() ? JSON.parse(result.stdout) : null;
}

const skip = hasGit() ? false : "git is not on PATH";

test("warn: code without docs warns but never pre-approves the command", { skip }, () => {
  const out = run(repo({ strictness: "warn", staged: ["src/a.ts"] }), "git commit -m x");
  assert.ok(out, "expected a warning");
  // permissionDecision "allow" would bypass the user's permission rules for git commit.
  assert.equal(out.hookSpecificOutput.permissionDecision, undefined);
  assert.match(out.systemMessage, /Code files changed without documentation updates/);
  assert.match(out.hookSpecificOutput.additionalContext, /src\/a\.ts/);
});

test("block: code without docs denies the commit with the file list", { skip }, () => {
  const out = run(repo({ strictness: "block", staged: ["src/a.ts"] }), "git commit -m x");
  assert.equal(out.hookSpecificOutput.permissionDecision, "deny");
  assert.match(out.hookSpecificOutput.permissionDecisionReason, /src\/a\.ts/);
  assert.match(out.hookSpecificOutput.permissionDecisionReason, /hookStrictness/);
});

test("staged docs alongside code: no opinion", { skip }, () => {
  assert.equal(run(repo({ strictness: "block", staged: ["src/a.ts", "docs/a.md"] }), "git commit -m x"), null);
});

test("off, no config, and non-git commands: no opinion", { skip }, () => {
  assert.equal(run(repo({ strictness: "off", staged: ["src/a.ts"] }), "git commit -m x"), null);
  assert.equal(run(repo({ staged: ["src/a.ts"] }), "git commit -m x"), null);
  assert.equal(run(repo({ strictness: "block", staged: ["src/a.ts"] }), "ls -la"), null);
});

test("an unknown strictness value warns rather than silently allowing", { skip }, () => {
  const out = run(repo({ strictness: "blokc", staged: ["src/a.ts"] }), "git commit -m x");
  assert.equal(out.hookSpecificOutput.permissionDecision, undefined);
  assert.match(out.systemMessage, /unknown hookStrictness "blokc"/);
});

test("malformed and empty stdin: exits 0 with no output", () => {
  for (const input of ["not json", ""]) {
    const result = spawnSync("node", [HOOK], { input, encoding: "utf8" });
    assert.equal(result.status, 0);
    assert.equal(result.stdout, "");
  }
});
