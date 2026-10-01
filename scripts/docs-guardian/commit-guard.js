#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { git, actions, changedFiles, glob } = require('./git-changes');
const sourceExtensions = new Set(['.ts','.tsx','.js','.jsx','.mjs','.cjs','.py','.go','.rs','.java','.kt','.cs','.rb','.swift','.c','.cpp','.h']);
const docExtensions = new Set(['.md','.mdx','.rst','.txt']);
let input; try { input = JSON.parse(fs.readFileSync(0, 'utf8')); } catch { process.exit(0); }
const findings = []; let block = false;
for (const item of actions(String(input.tool_input?.command || ''), input.cwd || process.cwd())) {
  let root, config;
  try { root = git(item.cwd, ['rev-parse', '--show-toplevel']).trim(); config = JSON.parse(fs.readFileSync(path.join(root, '.claude/docs-guardian/config.json'), 'utf8')); }
  catch { continue; }
  const strictness = config.hookStrictness || 'off'; if (strictness === 'off') continue;
  let files;
  try { files = changedFiles(root, item.action, item.args); }
  catch (error) { findings.push(`[docs-guardian] Could not verify ${item.action} in ${root}: ${error.message.split('\n')[0]}. Run a documentation audit; no pass is recorded.`); block ||= strictness === 'block'; continue; }
  const exclusions = config.excludePatterns || [];
  const code = files.filter(f => sourceExtensions.has(path.extname(f)) && !exclusions.some(p => glob(p, f)));
  const docs = files.filter(f => docExtensions.has(path.extname(f)));
  const missing = code.filter(file => {
    const mappings = (config.mappings || []).filter(m => typeof m.source === 'string' && glob(m.source, file));
    if (!mappings.length) return docs.length === 0;
    return mappings.some(m => typeof m.doc !== 'string' || !docs.some(doc => glob(m.doc.replaceAll('${name}', path.basename(file, path.extname(file))), doc)));
  });
  if (!missing.length) continue;
  block ||= strictness === 'block';
  findings.push(`[docs-guardian] Code files changed without documentation updates (${item.action}, ${root}):\n${missing.map(f => `  - ${f}`).join('\n')}\nUpdate the mapped documentation, or set hookStrictness to "warn". ${!(config.mappings || []).length ? 'No explicit mappings: this is a coarse code/document co-change check, not documentation accuracy verification. ' : ''}Hook strictness: ${['warn','block'].includes(strictness) ? strictness : `unknown hookStrictness "${strictness}" (expected off, warn or block) — treated as warn.`}`);
}
if (findings.length) {
  const message = findings.join('\n\n');
  console.log(JSON.stringify(block ? { hookSpecificOutput: { hookEventName:'PreToolUse', permissionDecision:'deny', permissionDecisionReason:message } } : { systemMessage:message, hookSpecificOutput:{ hookEventName:'PreToolUse', additionalContext:message } }));
}
