// ---------------------------------------------------------------------------
// The gates' binding of the citation grammar to fusion's own roots.
//
// The grammar itself is `hooks/lib/citation-scan.ts` since 2026-08-29, so it
// compiles into `hooks/dist/` and an install can run it (decision
// `260828-0904_*_does-fusion-ship-a-citation-checker-to-consuming-projects.md`).
// This file adds no grammar of its own: it resolves the plugin root and the
// workbench root of THIS checkout, binds one scanner to them, and re-exports the
// bound functions and the root-free helpers under the names every gate already
// imports, so the move changed no test. The old CLI at the tail of the
// pre-move file is gone from here; the shipped entry point is its successor.
// ---------------------------------------------------------------------------

import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import {
  createScanner,
  agentNames as agentNamesUnder,
  shippedPrompts as shippedPromptsUnder,
} from "../../citation-scan.js";

export const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
export const workbenchRoot = join(pluginRoot, "fusion-workbench");

const scanner = createScanner(workbenchRoot);

export const WORKBENCH_PRESENT = scanner.present;
export const { workbenchIndex, circleDirs, scanCitationTokens, scanRecordCitations, scanCorpus } =
  scanner;

export const agentNames = (): string[] => agentNamesUnder(pluginRoot);
export const shippedPrompts = (exempt?: Set<string>): { rel: string; abs: string }[] =>
  shippedPromptsUnder(pluginRoot, exempt);

export {
  report,
  isPlaceholder,
  RECORD_EXAMPLE_FILES,
  fencedContentLines,
  GATE_KINDS,
  markdownFilesUnder,
  partition,
} from "../../citation-scan.js";
export type {
  Violation,
  WorkbenchEntry,
  CitationKind,
  CitationStatus,
  CitationHit,
  CorpusScan,
  Scanner,
} from "../../citation-scan.js";
