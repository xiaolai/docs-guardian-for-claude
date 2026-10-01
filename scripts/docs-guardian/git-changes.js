'use strict';
// An accident guard, not a shell sandbox. Never execute the supplied command.
const path = require('node:path');
const { execFileSync } = require('node:child_process');
function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', timeout: 5000, maxBuffer: 4 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
}
function words(command) {
  const out = []; let word = '', quote = null;
  const flush = () => { if (word) out.push(word); word = ''; };
  for (let i = 0; i < command.length; i++) {
    const c = command[i];
    if (c === '\\' && quote !== "'") { word += command[++i] || ''; continue; }
    if (quote) { if (c === quote) quote = null; else word += c; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (/\s/.test(c)) { flush(); if (c === '\n') out.push(';'); }
    else if (';&|'.includes(c)) { flush(); out.push(c); }
    else word += c;
  }
  flush(); return out;
}
function actions(command, initialCwd) {
  const tokens = words(command); const result = []; let cwd = initialCwd;
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === 'cd' && tokens[i + 1]) { cwd = path.resolve(cwd, tokens[++i]); continue; }
    if (path.basename(tokens[i]) !== 'git' || (i > 0 && ![';', '&', '|'].includes(tokens[i - 1]))) continue;
    let target = cwd; let j = i + 1;
    for (; j < tokens.length; j++) {
      const t = tokens[j];
      if (t === '-C') { target = path.resolve(target, tokens[++j] || '.'); continue; }
      if (t.startsWith('-C') && t.length > 2) { target = path.resolve(target, t.slice(2)); continue; }
      if (t === '-c' || t === '--config-env') { j++; continue; }
      if (t.startsWith('-')) continue;
      break;
    }
    if (!['commit', 'push'].includes(tokens[j])) continue;
    let end = j + 1; while (end < tokens.length && ![';', '&', '|'].includes(tokens[end])) end++;
    result.push({ cwd: target, action: tokens[j], args: tokens.slice(j + 1, end) }); i = end - 1;
  }
  return result;
}
function changedFiles(cwd, action, args) {
  if (action === 'commit') {
    // -a includes tracked working-tree changes; explicit paths select working-tree contents.
    const all = args.some(x => x === '--all' || /^-[^-]*a/.test(x));
    const staged = git(cwd, ['diff', '--cached', '--name-only', '-z']).split('\0').filter(Boolean);
    const separator = args.indexOf('--');
    if (separator >= 0 && args.length > separator + 1) return git(cwd, ['diff', 'HEAD', '--name-only', '-z', '--', ...args.slice(separator + 1)]).split('\0').filter(Boolean);
    if (args.includes('--amend')) throw new Error('amend requires an explicit documentation audit');
    return [...new Set([...staged, ...(all ? git(cwd, ['diff', '--name-only', '-z']).split('\0').filter(Boolean) : [])])];
  }
  // Resolve the pushed source and destination without contacting or writing to a remote.
  const positional = []; const valueFlags = new Set(['--repo', '--receive-pack', '--exec', '--push-option', '-o']);
  for (let i = 0; i < args.length; i++) {
    if (valueFlags.has(args[i])) { if (args[i] === '--repo') positional.unshift(args[i + 1]); i++; continue; }
    if (!args[i].startsWith('-')) positional.push(args[i]);
  }
  let remote = positional.shift();
  if (!remote) { try { remote = git(cwd, ['config', '--get', 'remote.pushDefault']).trim(); } catch {} }
  if (!remote) { try { remote = git(cwd, ['config', '--get', `branch.${git(cwd, ['branch', '--show-current']).trim()}.remote`]).trim(); } catch {} }
  remote ||= 'origin';
  if (args.includes('--delete')) return [];
  if (args.some(x => ['--all', '--mirror', '--tags'].includes(x)) || positional.some(x => x.includes('*'))) throw new Error('multi-ref push requires an explicit documentation audit');
  const refs = positional.length ? positional : ['HEAD']; const files = new Set();
  for (let ref of refs) {
    ref = ref.replace(/^\+/, ''); const [source, destination] = ref.split(':'); if (!source) continue;
    if (source.startsWith('-') || /[\s~^]/.test(source)) throw new Error('unsupported push ref');
    const head = git(cwd, ['rev-parse', '--verify', `${source}^{commit}`]).trim();
    let base = null;
    try {
      let branch = (destination || source).replace(/^refs\/heads\//, '');
      if (branch === 'HEAD') branch = git(cwd, ['branch', '--show-current']).trim();
      const upstream = `refs/remotes/${remote}/${branch}`;
      base = git(cwd, ['rev-parse', '--verify', upstream]).trim();
    } catch {}
    // A new branch: exclude commits known on the target remote; no tracking refs means all history.
    const exclusions = base ? [base] : git(cwd, ['for-each-ref', '--format=%(objectname)', `refs/remotes/${remote}/`]).trim().split('\n').filter(Boolean);
    const commits = git(cwd, ['rev-list', head, ...(exclusions.length ? ['--not', ...exclusions] : [])]).trim().split('\n').filter(Boolean);
    for (const commit of commits) for (const file of git(cwd, ['diff-tree', '--root', '-m', '--no-commit-id', '--name-only', '-r', '-z', commit]).split('\0').filter(Boolean)) files.add(file);
  }
  return [...files];
}
function glob(pattern, file) {
  let source = '';
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === '*' && pattern[i + 1] === '*') { i++; if (pattern[i + 1] === '/') { i++; source += '(?:.*/)?'; } else source += '.*'; }
    else if (pattern[i] === '*') source += '[^/]*';
    else if (pattern[i] === '?') source += '[^/]';
    else source += pattern[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${source}$`).test(file);
}
module.exports = { git, actions, changedFiles, glob };
