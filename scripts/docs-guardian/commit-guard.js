#!/usr/bin/env node

/**
 * docs-guardian commit guard hook
 *
 * Runs as a PreToolUse hook on Bash commands. Checks if a git commit or push
 * is being attempted and whether staged code files have corresponding doc
 * file changes. Respects hookStrictness from config.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Read hook input from stdin
let input = "";
try {
  input = fs.readFileSync("/dev/stdin", "utf8");
} catch {
  process.exit(0);
}

let parsed;
try {
  parsed = JSON.parse(input);
} catch {
  process.exit(0);
}

const toolInput = parsed.tool_input || {};
const command = toolInput.command || "";

// Only intercept git commit and git push commands
const isCommit = /\bgit\s+commit\b/.test(command);
const isPush = /\bgit\s+push\b/.test(command);

if (!isCommit && !isPush) {
  process.exit(0);
}

// Find project root (walk up looking for .git)
function findProjectRoot(startDir) {
  let dir = startDir;
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, ".git"))) return dir;
    dir = path.dirname(dir);
  }
  return null;
}

const projectRoot = findProjectRoot(process.cwd());
if (!projectRoot) {
  process.exit(0);
}

// Load config
const configPath = path.join(
  projectRoot,
  ".claude",
  "docs-guardian",
  "config.json"
);
let config;
try {
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));
} catch {
  // No config = plugin not initialized for this project
  process.exit(0);
}

const strictness = config.hookStrictness || "off";
if (strictness === "off") {
  process.exit(0);
}

// Get staged files
let stagedFiles;
try {
  const output = execSync("git diff --cached --name-only", {
    cwd: projectRoot,
    encoding: "utf8",
  });
  stagedFiles = output.trim().split("\n").filter(Boolean);
} catch {
  process.exit(0);
}

if (stagedFiles.length === 0) {
  process.exit(0);
}

// Determine source file extensions based on config or common patterns
const sourceExtensions = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".py",
  ".go",
  ".rs",
  ".java",
  ".kt",
  ".cs",
  ".rb",
  ".swift",
  ".c",
  ".cpp",
  ".h",
]);

const docExtensions = new Set([".md", ".mdx", ".rst", ".txt"]);

// Separate staged files into code and doc files
const stagedCodeFiles = stagedFiles.filter((f) =>
  sourceExtensions.has(path.extname(f))
);
const stagedDocFiles = stagedFiles.filter((f) =>
  docExtensions.has(path.extname(f))
);

if (stagedCodeFiles.length === 0) {
  // No code files staged — no doc check needed
  process.exit(0);
}

if (stagedDocFiles.length > 0) {
  // Some doc files are staged — assume user is updating docs
  process.exit(0);
}

// Code files changed but no doc files changed
const message = [
  "",
  "[docs-guardian] Code files changed without documentation updates:",
  "",
  ...stagedCodeFiles.map((f) => `  - ${f}`),
  "",
  "Consider updating the corresponding documentation.",
  `Hook strictness: ${strictness}`,
  "",
];

if (strictness === "block") {
  // Output as blocked
  const result = {
    decision: "block",
    reason: message.join("\n"),
  };
  process.stdout.write(JSON.stringify(result));
  process.exit(0);
} else {
  // warn — print but allow
  const result = {
    decision: "warn",
    reason: message.join("\n"),
  };
  process.stdout.write(JSON.stringify(result));
  process.exit(0);
}
