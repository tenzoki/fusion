/**
 * Churn heatmap tracker for the Compliance Guard.
 *
 * Ported from fusion/reactor/pkg/guard/churn_heatmap.go.
 * Tracks per-file change frequency and thrashing patterns.
 * State persists in state/churn.json across sessions.
 */

import { readFileSync, writeFileSync, renameSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Churn state is project-local: stored in fusion-workbench/.guard-state/ under
 * the project root (process.cwd()), NOT in the plugin cache directory.
 */
const STATE_DIR = resolve(process.cwd(), "fusion-workbench", ".guard-state");
const CHURN_PATH = resolve(STATE_DIR, "churn.json");

/** Per-file churn statistics. */
export interface FileChurnStats {
  totalChanges: number;
  changesThisSession: number;
  lastChange: string;
  thrashingScore: number;
}

/** Top-level churn state persisted to disk. */
export interface ChurnState {
  files: Record<string, FileChurnStats>;
  sessionStart: string;
}

/** Warning level from churn analysis. */
export type ChurnWarningLevel = "info" | "warning" | "critical";

/** A churn warning with affected files and recommendation. */
export interface ChurnWarning {
  level: ChurnWarningLevel;
  message: string;
  files: string[];
  recommendation: string;
}

/** Thresholds for churn analysis, loaded from config. */
export interface ChurnThresholds {
  changesPerSessionWarning: number;
  changesPerSessionCritical: number;
  totalChangesWarning: number;
  totalChangesCritical: number;
}

const DEFAULT_THRESHOLDS: ChurnThresholds = {
  changesPerSessionWarning: 5,
  changesPerSessionCritical: 10,
  totalChangesWarning: 8,
  totalChangesCritical: 15,
};

/** Load churn state from disk. Returns empty state if missing. */
export function loadChurn(): ChurnState {
  try {
    const content = readFileSync(CHURN_PATH, "utf-8");
    return JSON.parse(content) as ChurnState;
  } catch {
    return {
      files: {},
      sessionStart: new Date().toISOString(),
    };
  }
}

/** Save churn state to disk atomically. */
export function saveChurn(state: ChurnState): void {
  mkdirSync(STATE_DIR, { recursive: true });

  const tmpPath = `${CHURN_PATH}.tmp`;
  writeFileSync(tmpPath, JSON.stringify(state, null, 2), "utf-8");
  renameSync(tmpPath, CHURN_PATH);
}

/**
 * Record a file change in the churn state.
 *
 * Ported from churn_heatmap.go:91-109.
 * Increments counters and updates thrashing score.
 */
/** Max session age in milliseconds (2 hours). */
const SESSION_MAX_AGE_MS = 2 * 60 * 60 * 1000;

export function recordChange(state: ChurnState, filePath: string): void {
  const now = new Date().toISOString();

  // Auto-reset stale sessions so per-session thresholds stay meaningful
  const sessionAge = Date.now() - new Date(state.sessionStart).getTime();
  if (sessionAge > SESSION_MAX_AGE_MS) {
    resetSession(state);
  }

  let stats = state.files[filePath];
  if (!stats) {
    stats = {
      totalChanges: 0,
      changesThisSession: 0,
      lastChange: now,
      thrashingScore: 0,
    };
    state.files[filePath] = stats;
  }

  stats.totalChanges++;
  stats.changesThisSession++;
  stats.lastChange = now;

  updateThrashingScore(stats);
}

/**
 * Update thrashing score based on session changes and total.
 *
 * Ported from churn_heatmap.go:111-119.
 * Rapid-change penalty: (changesThisSession - 2) * 2 if > 2 changes.
 * Total penalty: totalChanges / 3.
 */
function updateThrashingScore(stats: FileChurnStats): void {
  let rapidChangePenalty = 0;
  if (stats.changesThisSession > 2) {
    rapidChangePenalty = (stats.changesThisSession - 2) * 2;
  }
  const totalPenalty = Math.floor(stats.totalChanges / 3);
  stats.thrashingScore = rapidChangePenalty + totalPenalty;
}

/**
 * Analyze churn patterns and return warnings.
 *
 * Ported from churn_heatmap.go:122-184.
 * Checks per-session and total change counts against thresholds.
 */
export function analyzeChurn(
  state: ChurnState,
  thresholds?: Partial<ChurnThresholds>,
): ChurnWarning[] {
  const t: ChurnThresholds = {
    ...DEFAULT_THRESHOLDS,
    ...thresholds,
  };

  const warnings: ChurnWarning[] = [];
  const criticalFiles = new Set<string>();
  const warningFiles = new Set<string>();

  for (const [filePath, stats] of Object.entries(state.files)) {
    // Session-level thresholds
    if (stats.changesThisSession >= t.changesPerSessionCritical) {
      criticalFiles.add(filePath);
    } else if (stats.changesThisSession >= t.changesPerSessionWarning) {
      warningFiles.add(filePath);
    }

    // Total-level thresholds
    if (stats.totalChanges >= t.totalChangesCritical) {
      criticalFiles.add(filePath);
    } else if (stats.totalChanges >= t.totalChangesWarning) {
      if (!criticalFiles.has(filePath)) {
        warningFiles.add(filePath);
      }
    }
  }

  if (criticalFiles.size > 0) {
    warnings.push({
      level: "critical",
      message: `High file churn detected: ${criticalFiles.size} file(s) showing thrashing pattern`,
      files: [...criticalFiles],
      recommendation:
        "Consider pausing to review approach. Frequent changes to same files may indicate unclear requirements or implementation drift.",
    });
  }

  if (warningFiles.size > 0) {
    warnings.push({
      level: "warning",
      message: `Elevated file churn: ${warningFiles.size} file(s) with multiple changes`,
      files: [...warningFiles],
      recommendation:
        "Monitor these files for continued churn. May indicate iterative refinement or potential scope creep.",
    });
  }

  return warnings;
}

/**
 * Get the top N files by thrashing score.
 *
 * Ported from churn_heatmap.go:221-239.
 */
export function getTopChurnFiles(state: ChurnState, n: number): string[] {
  return Object.entries(state.files)
    .sort(([, a], [, b]) => b.thrashingScore - a.thrashingScore)
    .slice(0, n)
    .map(([path]) => path);
}

/**
 * Reset session-level counters.
 * Call at the start of a new session to keep totalChanges but reset per-session tracking.
 */
export function resetSession(state: ChurnState): void {
  state.sessionStart = new Date().toISOString();
  for (const stats of Object.values(state.files)) {
    stats.changesThisSession = 0;
  }
}

/** Get the churn state file path (for external tools). */
export function getChurnPath(): string {
  return CHURN_PATH;
}
