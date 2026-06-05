'use strict';

const childProcess = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const STATE_FILE = 'workflow-checkpoints.local.json';
const AUDIT_FILE = 'workflow-audit.local.jsonl';
const LOCK_DIR = 'workflow-checkpoints.local.lock';
const LOCK_STALE_MS = 30_000;
const LOCK_MAX_WAIT_MS = 2_000;
const LOCK_POLL_MS = 50;
const VALIDATE_TIMEOUT_MS = 15_000;

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function workflowPath(projectDir, name) {
  return path.join(projectDir, '.claude', name);
}

const SLEEP_BUFFER = new Int32Array(new SharedArrayBuffer(4));

function sleepSync(ms) {
  Atomics.wait(SLEEP_BUFFER, 0, 0, ms);
}

function lockAgeMs(lockPath) {
  const owner = readJson(path.join(lockPath, 'owner.json'), null);
  const createdAt = owner?.createdAt ? Date.parse(owner.createdAt) : Number.NaN;
  try {
    return Number.isFinite(createdAt)
      ? Date.now() - createdAt
      : Date.now() - fs.statSync(lockPath).mtimeMs;
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function tryCreateLock(lockPath) {
  const token = crypto.randomUUID();
  try {
    fs.mkdirSync(lockPath);
  } catch (error) {
    if (error.code === 'EEXIST') return null;
    throw error;
  }
  try {
    fs.writeFileSync(path.join(lockPath, 'owner.json'), `${JSON.stringify({
      token,
      pid: process.pid,
      hostname: os.hostname(),
      createdAt: new Date().toISOString(),
    }, null, 2)}\n`);
  } catch (error) {
    fs.rmSync(lockPath, { recursive: true, force: true });
    throw error;
  }
  return { lockPath, token };
}

function removeStaleLockDirectory(lockPath, staleMs) {
  const ageMs = lockAgeMs(lockPath);
  if (ageMs === null || ageMs <= staleMs) return false;

  const owner = readJson(path.join(lockPath, 'owner.json'), null);
  const observedToken = owner?.token;
  const quarantinePath = `${lockPath}.stale-${process.pid}-${crypto.randomUUID()}`;

  try {
    fs.renameSync(lockPath, quarantinePath);
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }

  const quarantinedOwner = readJson(path.join(quarantinePath, 'owner.json'), null);
  const quarantinedCreatedAt = quarantinedOwner?.createdAt ? Date.parse(quarantinedOwner.createdAt) : Number.NaN;
  const quarantinedAgeMs = Number.isFinite(quarantinedCreatedAt)
    ? Date.now() - quarantinedCreatedAt
    : lockAgeMs(quarantinePath);
  if (
    quarantinedAgeMs !== null &&
    quarantinedAgeMs > staleMs &&
    (!observedToken || quarantinedOwner?.token === observedToken)
  ) {
    fs.rmSync(quarantinePath, { recursive: true, force: true });
    return true;
  }

  try {
    fs.renameSync(quarantinePath, lockPath);
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
  return false;
}

function releaseLock(lock) {
  const owner = readJson(path.join(lock.lockPath, 'owner.json'), null);
  if (owner?.token === lock.token) {
    fs.rmSync(lock.lockPath, { recursive: true, force: true });
  }
}

function acquireWorkflowLock(projectDir, options = {}) {
  const maxWaitMs = options.maxWaitMs ?? LOCK_MAX_WAIT_MS;
  const staleMs = options.staleMs ?? LOCK_STALE_MS;
  const lockPath = workflowPath(projectDir, LOCK_DIR);
  const cleanupPath = `${lockPath}.cleanup`;
  const deadline = Date.now() + maxWaitMs;
  fs.mkdirSync(path.dirname(lockPath), { recursive: true });

  while (true) {
    const observedAgeMs = lockAgeMs(lockPath);
    if (observedAgeMs === null || observedAgeMs > staleMs) {
      const cleanupLock = tryCreateLock(cleanupPath);
      if (cleanupLock) {
        try {
          const currentAgeMs = lockAgeMs(lockPath);
          if (currentAgeMs === null) {
            const lock = tryCreateLock(lockPath);
            if (lock) return lock;
          } else if (currentAgeMs > staleMs) {
            removeStaleLockDirectory(lockPath, staleMs);
            continue;
          }
        } finally {
          releaseLock(cleanupLock);
        }
      } else {
        removeStaleLockDirectory(cleanupPath, staleMs);
      }
    }
    if (Date.now() >= deadline) {
      throw new Error(`Timed out waiting for workflow lock after ${maxWaitMs}ms. Retry the workflow command.`);
    }
    sleepSync(Math.min(LOCK_POLL_MS, Math.max(1, deadline - Date.now())));
  }
}

function releaseWorkflowLock(lock) {
  const cleanupPath = `${lock.lockPath}.cleanup`;
  const deadline = Date.now() + LOCK_MAX_WAIT_MS;
  let cleanupLock = tryCreateLock(cleanupPath);
  while (!cleanupLock && Date.now() < deadline) {
    removeStaleLockDirectory(cleanupPath, LOCK_STALE_MS);
    sleepSync(Math.min(LOCK_POLL_MS, Math.max(1, deadline - Date.now())));
    cleanupLock = tryCreateLock(cleanupPath);
  }
  if (!cleanupLock) return;
  try {
    releaseLock(lock);
  } finally {
    releaseLock(cleanupLock);
  }
}

function withWorkflowLock(projectDir, fn, options = {}) {
  const lock = acquireWorkflowLock(projectDir, options);
  try {
    return fn();
  } finally {
    releaseWorkflowLock(lock);
  }
}

function appendAuditUnlocked(projectDir, entry) {
  const auditPath = workflowPath(projectDir, AUDIT_FILE);
  fs.mkdirSync(path.dirname(auditPath), { recursive: true });
  fs.appendFileSync(auditPath, `${JSON.stringify({
    timestamp: new Date().toISOString(),
    bootstrapVersion: entry.bootstrapVersion || 'unknown',
    agent: entry.agent || 'unknown',
    ...entry,
  })}\n`);
}

function appendAudit(projectDir, entry, options = {}) {
  try {
    withWorkflowLock(projectDir, () => appendAuditUnlocked(projectDir, entry), options);
    return { ok: true };
  } catch (error) {
    return { ok: false, warning: error.message };
  }
}

function mutateStateAndAudit(projectDir, mutator) {
  const statePath = workflowPath(projectDir, STATE_FILE);
  return withWorkflowLock(projectDir, () => {
    fs.mkdirSync(path.dirname(statePath), { recursive: true });
    const state = readJson(statePath, { changes: {} });
    state.changes ||= {};
    const result = mutator(state) || {};
    if (result.stateChanged) {
      const temporaryPath = `${statePath}.${process.pid}.${crypto.randomUUID()}.tmp`;
      fs.writeFileSync(temporaryPath, `${JSON.stringify(state, null, 2)}\n`);
      fs.renameSync(temporaryPath, statePath);
    }
    if (result.auditEntry) {
      try {
        appendAuditUnlocked(projectDir, result.auditEntry);
      } catch (error) {
        return { ...result, auditWarning: error.message };
      }
    }
    return result;
  });
}

function spawnWithTimeout(command, args, timeoutMs = VALIDATE_TIMEOUT_MS, options = {}) {
  const result = childProcess.spawnSync(command, args, { killSignal: 'SIGKILL', ...options, timeout: timeoutMs });
  if (result.error?.code === 'ETIMEDOUT') return { ok: false, reason: 'timeout', timeoutMs };
  if (result.error) return { ok: false, reason: 'spawn-error', error: result.error };
  return { ok: result.status === 0, reason: result.status === 0 ? null : 'non-zero-exit', result };
}

function redactShellCommand(command) {
  const raw = typeof command === 'string' ? command : '';
  const preview = raw
    .replace(/(authorization\s*:\s*(?:bearer|basic)\s+)[^\s"']+/gi, '$1[REDACTED]')
    .replace(/((?:--[A-Za-z0-9_-]*(?:token|password|secret|api[_-]?key|access[_-]?key)[A-Za-z0-9_-]*)\s+)(?:"[^"]*"|'[^']*'|[^\s"']+)/gi, '$1[REDACTED]')
    .replace(/(([A-Za-z_][A-Za-z0-9_]*(?:token|password|secret|api_?key|access_?key)[A-Za-z0-9_]*|token|password|secret|api[_-]?key|access[_-]?key)\s*[=:]\s*)(?:"[^"]*"|'[^']*'|[^\s"']+)/gi, '$1[REDACTED]')
    .slice(0, 240);
  return {
    preview,
    digest: `sha256:${crypto.createHash('sha256').update(raw, 'utf8').digest('hex')}`,
  };
}

function activeChanges(projectDir) {
  const changesDir = path.join(projectDir, 'openspec', 'changes');
  if (!fs.existsSync(changesDir)) return [];
  return fs.readdirSync(changesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith('.') && name !== 'archive');
}

function normalizeStringArray(value, field, allowEmpty = false) {
  if (!Array.isArray(value)) return { error: `${field} must be a string array.` };
  if (value.some((item) => typeof item !== 'string' || !item.trim())) {
    return { error: `${field} must contain only non-empty strings.` };
  }
  const values = [...new Set(value.map((item) => item.trim()))].sort();
  if (!allowEmpty && values.length === 0) {
    return { error: `${field} must contain at least one non-empty string.` };
  }
  return { values };
}

function normalizeProjectRelativePath(value, field) {
  if (typeof value !== 'string' || !value.trim()) {
    return { error: `${field} must be a non-empty string.` };
  }
  const normalized = value.trim().split(/[\\/]+/).filter(Boolean).join('/');
  if (
    path.isAbsolute(value) ||
    normalized === '..' ||
    normalized.startsWith('../') ||
    normalized.includes('/../') ||
    normalized.endsWith('/..')
  ) {
    return { error: `${field} must be a project-relative path without '..'.` };
  }
  return { value: normalized };
}

function normalizeProjectPathArray(value, field) {
  if (!Array.isArray(value)) return { error: `${field} must be a string array.` };
  const values = [];
  for (const item of value) {
    const normalized = normalizeProjectRelativePath(item, field);
    if (normalized.error) return normalized;
    values.push(normalized.value);
  }
  return { values: [...new Set(values)].sort() };
}

function normalizeScopeAnchors(value) {
  if (value === undefined) return { anchors: {} };
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { error: 'implementation-scope.json anchors must be an object.' };
  }
  const anchors = {};
  for (const key of Object.keys(value).sort()) {
    const normalizedKey = normalizeProjectRelativePath(key, 'implementation-scope.json anchor path');
    if (normalizedKey.error) return normalizedKey;
    const normalizedAnchors = normalizeStringArray(
      value[key],
      `implementation-scope.json anchors.${normalizedKey.value}`,
      false,
    );
    if (normalizedAnchors.error) return normalizedAnchors;
    anchors[normalizedKey.value] = normalizedAnchors.values;
  }
  return { anchors };
}

function readImplementationScope(projectDir, change) {
  if (!change) return { error: 'No active OpenSpec change is selected.' };
  const scopePath = path.join(projectDir, 'openspec', 'changes', change, 'implementation-scope.json');
  if (!fs.existsSync(scopePath)) return { error: 'implementation-scope.json is missing.' };
  const input = readJson(scopePath, null);
  if (!input) return { error: 'implementation-scope.json is not valid JSON.' };
  if (typeof input !== 'object' || Array.isArray(input)) {
    return { error: 'implementation-scope.json must contain an object.' };
  }

  const allowedFiles = normalizeProjectPathArray(input.allowedFiles || [], 'implementation-scope.json allowedFiles');
  if (allowedFiles.error) return allowedFiles;
  const allowedDirs = normalizeProjectPathArray(input.allowedDirs || [], 'implementation-scope.json allowedDirs');
  if (allowedDirs.error) return allowedDirs;
  const allowedGlobs = normalizeProjectPathArray(input.allowedGlobs || [], 'implementation-scope.json allowedGlobs');
  if (allowedGlobs.error) return allowedGlobs;
  const anchors = normalizeScopeAnchors(input.anchors);
  if (anchors.error) return anchors;

  const scope = {
    allowedFiles: allowedFiles.values,
    allowedDirs: allowedDirs.values,
    allowedGlobs: allowedGlobs.values,
    anchors: anchors.anchors,
  };

  if (
    scope.allowedFiles.length === 0 &&
    scope.allowedDirs.length === 0 &&
    scope.allowedGlobs.length === 0
  ) {
    return {
      error: 'implementation-scope.json must list at least one allowed file, directory, or glob.',
    };
  }

  return {
    scope,
    fingerprint: `sha256:${crypto.createHash('sha256').update(JSON.stringify(scope), 'utf8').digest('hex')}`,
  };
}

function readRisk(projectDir, change) {
  if (!change) return { error: 'No active OpenSpec change is selected.' };
  const riskPath = path.join(projectDir, 'openspec', 'changes', change, 'risk.json');
  if (!fs.existsSync(riskPath)) return { error: 'risk.json is missing.' };
  const input = readJson(riskPath, null);
  if (!input) return { error: 'risk.json is not valid JSON.' };
  if (typeof input !== 'object' || Array.isArray(input)) {
    return { error: 'risk.json must contain an object.' };
  }
  if (!['L0', 'L1', 'L2', 'L3', 'L4'].includes(input.level)) {
    return { error: 'risk.json level must be one of L0, L1, L2, L3, or L4.' };
  }
  const reasons = normalizeStringArray(input.reasons, 'risk.json reasons');
  if (reasons.error) return reasons;
  const exclusions = normalizeStringArray(
    input.higherRiskExclusions,
    'risk.json higherRiskExclusions',
    input.level === 'L4',
  );
  if (exclusions.error) return exclusions;
  const profiles = normalizeStringArray(input.profiles, 'risk.json profiles', true);
  if (profiles.error) return profiles;
  if (typeof input.rollback !== 'string' || !input.rollback.trim()) {
    return { error: 'risk.json rollback must be a non-empty string.' };
  }
  const risk = {
    level: input.level,
    reasons: reasons.values,
    higherRiskExclusions: exclusions.values,
    profiles: profiles.values,
    rollback: input.rollback.trim(),
  };
  return {
    risk,
    fingerprint: `sha256:${crypto.createHash('sha256').update(JSON.stringify(risk), 'utf8').digest('hex')}`,
  };
}

module.exports = {
  AUDIT_FILE,
  LOCK_DIR,
  LOCK_MAX_WAIT_MS,
  LOCK_POLL_MS,
  LOCK_STALE_MS,
  STATE_FILE,
  VALIDATE_TIMEOUT_MS,
  activeChanges,
  appendAudit,
  mutateStateAndAudit,
  normalizeStringArray,
  readImplementationScope,
  readJson,
  readRisk,
  redactShellCommand,
  spawnWithTimeout,
  withWorkflowLock,
};
