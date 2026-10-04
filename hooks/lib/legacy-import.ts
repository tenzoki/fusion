/**
 * The host's legacy reader and mapping composer for FJ04's migration of a v12
 * Markdown workbench to JSON control (step 2 of
 * `261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md`).
 * Pure: it reads the workbench root and a byte inventory and writes nothing.
 * The host reads, the codec writes
 * (`261001-1804_*_where-does-the-legacy-markdown-reader-live-and-what-does-the-codecs-migration-operation-take.md`,
 * option 1): what this module composes is a proposal the codec's `migration
 * plan` validates and freezes. Nothing here serialises a control file, so the
 * proposal carries control objects, not bytes; the codec's serialiser fixes
 * the bytes and their hashes.
 *
 * ## The inventory
 *
 * A migration composes from the codec's `migration survey`: `bin/fusion-migrate`
 * passes its entries through `inventoryFromSurvey` (step 9), so the proposal
 * describes exactly the tree whose `eligible_sha256` it carries.
 * `buildInventory` walks the same tree host-side, not following a link, with
 * each file's size, sha256 and kind plus every directory (an empty container
 * tree is a shape no file list shows); it stays for the repair's re-read and
 * the backup's tree hash, which need no codec.
 *
 * ## The record cut
 *
 * `261001-1804_*_which-markdown-artefacts-become-records-when-a-legacy-workbench-migrates.md`,
 * option 2. Four rows, disjoint by construction:
 *
 *   package-live      a container head (item record or Circle head) whose
 *                     status is open, claimed or paused; control head fields
 *                     removed from its narrative and kept in `legacy_fields`
 *   package-terminal  a head that is done or dropped, Circle heads by marker;
 *                     narrative byte-identical, bindings only in `legacy_fields`
 *   record-live       an issue, plan or discussion `_o_`/`_p_`, a decision
 *                     `_o_`/`_a_`; a plan loses its `**Status:**` line and its
 *                     step marks
 *   record-closure    a terminal record a record_ref-only field of a converted
 *                     record names; `legacy-terminal`, byte-identical
 *
 * Every other marked record stays plain (`plain-terminal`). The record_ref-only
 * fields are `depends_on.target`, `active_documents.ref`, a plan's
 * `acceptance.ref` and `superseded_by`; the first and third name packages, which
 * all convert, and `superseded_by` is set only on a superseded decision, which
 * never converts live, so the closure holds plans and specs alone. The closure
 * is checked after composing: a record_ref naming no proposed record is a
 * blocking `closure-incomplete`, so a defect in the rule is a refusal.
 *
 * ## Values with no v1 counterpart, and step anchors
 *
 * `261001-1804_*_how-are-legacy-values-with-no-v1-counterpart-mapped-at-import.md`
 * option 1: Circle `_c_` done/legacy-completed, `_b_` dropped/bounded, `_s_`
 * dropped/dropped, `_d_` dropped/dropped unless its `**Status:**` starts
 * `paused` or `dropped`; an empty container tree is reported and not
 * migrated; an `Answered:` line citing nothing resolvable answers with the
 * record's own original. Every mapped value stays verbatim in
 * `provenance.legacy_fields`.
 * `261001-1804_*_what-stable-step-anchor-does-an-imported-plan-carry-and-which-criteria.md`
 * option 1: the step number is the anchor, criteria are empty.
 *
 * Which lines are steps, as decidable from the line: a line at column 0 that
 * is a number and a full stop, optionally behind a `##`-`####` heading
 * marker, is a step when it carries a bracket mark, or when it stands in an
 * `## Implementation steps` section. An unmarked step is `open`. Inside a
 * fenced code block nothing is read.
 *
 * ## Derive, carry as unknown, default (the ruling of 2026-10-03)
 *
 * The plan's `## Amendment of 2026-10-03: derive, carry as unknown, ask only
 * what is genuine`, and requests 54 to 58 of `codec/fixtures/prior/REQUESTS.md`.
 * A value the files or git decide is derived; one they do not is carried as
 * unknown or as a default that asserts no live state. Each such control value
 * has one entry in `provenance.legacy_fields.derived`, keyed by its JSON
 * Pointer, `{rule, evidence?}`, and its finding is `reported`. A value the
 * legacy file recorded is never replaced, and `**Filed by:** user` keeps its
 * person null. Per class:
 *
 *   filed-by-*       actor `legacy-unknown`; person from the injected
 *                    `firstAdd` (the git author of the file's first add,
 *                    followed through renames), else null with its evidence
 *   answered-without-answer-line, answer-ref-self  `answer_ref` the
 *                    record's own original: no line, an empty one, or one
 *                    citing nothing resolvable
 *   mark-outside-numbered-step    the mark token leaves the narrative, kept in
 *                    `legacy_fields.unanchored_marks` by line
 *   unknown-step-mark the step anchors `open`; the token stays in `step_marks`
 *   duplicate-step-number every line of a duplicated number stays unanchored,
 *                    its mark in `unanchored_marks`; the other steps anchor
 *   an `**Active spec/plan:**` entry that is unresolvable, archived,
 *                    ambiguous, not a plan, or of an unclear or conflicting
 *                    role: carried in `references` as its citation, or only in
 *                    `legacy_fields.head` when it is no citation
 *   circle-deferred  `dropped`, as the other Circle markers map terminal
 *
 * ## Findings
 *
 * `blocking` stops activation until the frozen plan resolves it: what spec
 * section 8.2 forbids to default, a state, a claim, a live dependency or which
 * plan is active (`several-active-plans`, `plan-adopted-twice`), and the
 * structural facts the codec refuses. `reported` is carried into the plan and
 * the receipt and blocks nothing. `FINDINGS` lists every class with its severity.
 */

import { lstatSync, readdirSync, readFileSync, readlinkSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { createScanner, type Scanner } from "./citation-scan.js";
import { CONTAINER_STORE, PACKAGE_CONTROL, RECORD_CONTROL_SUFFIX, V11_STORE_NAMES, WORKBENCH_MANIFEST } from "./stores.js";

export interface InventoryEntry {
  path: string;
  size: number;
  /** `sha256:<hex>` of the bytes; a link's of its target string. */
  sha256: string;
  kind: "regular" | "link" | "other";
}

export interface Inventory {
  files: InventoryEntry[];
  dirs: string[];
}

export const FINDINGS = {
  "legacy-store-name": "blocking",
  "manifest-present": "blocking",
  "control-file-exists": "blocking",
  "unknown-state": "blocking",
  "unknown-package-status": "blocking",
  "two-package-heads": "blocking",
  "container-without-head": "blocking",
  "invalid-claim": "blocking",
  "unknown-mode": "blocking",
  "duplicate-control-head": "blocking",
  "several-active-plans": "blocking",
  "plan-adopted-twice": "blocking",
  "unresolvable-live-dependency": "blocking",
  "dependency-not-a-package": "blocking",
  "dependency-archived": "blocking",
  /** On `**Depends-on:**` only; on `**Active spec/plan:**` it is `active-document-ambiguous`. */
  "ambiguous-structural-citation": "blocking",
  "closure-without-v1-state": "blocking",
  "closure-incomplete": "blocking",
  "record-is-link": "blocking",
  "narrative-too-large": "blocking",
  "circle-deferred": "reported",
  "filed-by-missing": "reported",
  "filed-by-not-owed": "reported",
  "filed-by-unreadable": "reported",
  "unresolvable-active-document": "reported",
  "active-document-not-a-plan": "reported",
  "active-document-archived": "reported",
  "active-document-ambiguous": "reported",
  "active-document-role-unclear": "reported",
  "active-document-role-conflict": "reported",
  "duplicate-step-number": "reported",
  "mark-outside-numbered-step": "reported",
  "unknown-step-mark": "reported",
  "answered-without-answer-line": "reported",
  "empty-container-tree": "reported",
  "terminal-value-without-v1-state": "reported",
  "circle-head-disagrees-with-marker": "reported",
  "live-record-in-terminal-container": "reported",
  "answer-ref-self": "reported",
  "decision-line-disagrees-with-marker": "reported",
  "status-head-in-live-record": "reported",
  "reference-not-a-citation": "reported",
  "unmarked-file-in-record-store": "reported",
  "unknown-domain": "reported",
  "untracked-record": "reported",
  "ignored-record": "reported",
  "symlink": "reported",
} as const;

export type FindingClass = keyof typeof FINDINGS;

export interface Finding {
  class: FindingClass;
  severity: "blocking" | "reported";
  path: string;
  detail: string;
}

export type CutRow = "package-live" | "package-terminal" | "record-live" | "record-closure";
export type Kind = "package" | "issue" | "plan" | "discussion" | "decision";

export interface ProposedRecord {
  row: CutRow;
  kind: Kind;
  id: string;
  narrative: string;
  control_path: string;
  /** The inventory's hash of the narrative as read. */
  source_sha256: string;
  /** Where the original bytes go: `archive/migrations/<id>/originals/<narrative>`. */
  backup: string;
  /** The rewritten narrative, when a live one changes; null when it stays byte-identical. */
  narrative_after: string | null;
  control: Record<string, unknown>;
}

export interface Proposal {
  migration_id: string;
  workbench_id: string;
  source_layout: "fusion-v12";
  records: ProposedRecord[];
  /** Narrative path to record id. */
  uuid_map: Record<string, string>;
  counts: Record<CutRow | "plain-terminal" | "empty-container", number>;
  findings: Finding[];
}

export interface ComposeInput {
  root: string;
  inventory: Inventory;
  migrationId: string;
  /** Injected so a test fixes the UUIDs; called in narrative-path order. */
  newId: () => string;
  untracked?: readonly string[];
  ignored?: readonly string[];
  /** Narrative path to an actor the repair log supplied for its control only (a terminal record, whose Markdown stays as it is). */
  actors?: Readonly<Record<string, { actor: string; person: string | null }>>;
  /** Narrative path to the person git names for its first add, or why none: the person of a filer the file never recorded. */
  firstAdd: (path: string) => FirstAdd;
}

export type FirstAdd = { person: string; commit: string } | { unknown: "untracked" | "no-repository" | "shallow-history" };
/** `provenance.legacy_fields.derived`: JSON Pointer into the control to the rule that set the value. */
export type Derived = Record<string, { rule: string; evidence?: string }>;

const MAX_RECORD_BYTES = 1024 * 1024;
const sha = (b: Uint8Array | string): string => "sha256:" + createHash("sha256").update(b).digest("hex");
const STORES: Record<string, Exclude<Kind, "package">> = { issues: "issue", plans: "plan", discussions: "discussion", decisions: "decision" };
const RECORD_PATH = new RegExp(`^(?:${CONTAINER_STORE}/[^/]+|shared)/(issues|plans|discussions|decisions)/([^/]+\\.md)$`);
const MARKED = /^\d{6}-\d{4}_([a-z])_.+\.md$/;
const CIRCLE_HEAD = /^_([a-z])_circle\.md$/;
const VOCAB: Record<Exclude<Kind, "package">, { live: Record<string, string>; terminal: Record<string, string> }> = {
  issue: { live: { o: "open", p: "in_progress" }, terminal: { c: "closed", d: "deferred" } },
  plan: { live: { o: "open", p: "in_progress" }, terminal: { c: "closed", d: "deferred" } },
  discussion: { live: { o: "open" }, terminal: { c: "closed" } },
  decision: { live: { o: "open", a: "answered" }, terminal: { i: "implemented", s: "superseded", d: "deferred" } },
};
/** Letters terminal in some vocabulary: such a marker on another kind is history with no v1 state, not a live unknown. */
const TERMINAL_LETTERS = new Set(["c", "d", "i", "s"]);
const CIRCLE: Record<string, { status: "done" | "dropped"; outcome: string; reason: string; heads: RegExp }> = {
  c: { status: "done", outcome: "legacy-completed", reason: "", heads: /^(closed|done|complete)/i },
  b: { status: "dropped", outcome: "bounded", reason: "closed bounded (legacy Circle marker)", heads: /^(bounded|closed)/i },
  s: { status: "dropped", outcome: "dropped", reason: "superseded (legacy Circle marker)", heads: /^superseded/i },
  d: { status: "dropped", outcome: "dropped", reason: "deferred (legacy Circle marker)", heads: /^(paused|dropped)\b/ },
};
/** A plan mark outside a numbered step: the token, and its one trailing space, leave the narrative. */
const STRAY_MARK = /\[(OPEN|IN PROGRESS|DONE)\] ?/;
const PACKAGE_STATUSES = new Set(["open", "claimed", "paused", "done", "dropped"]);
/** The head fields JSON owns on a live package: removed from its narrative, kept raw in `legacy_fields`. */
const PACKAGE_CONTROL_HEADS = ["Status", "Claim", "Mode", "Active spec/plan", "Depends-on"];
const MAPPED_HEADS = new Set([...PACKAGE_CONTROL_HEADS, "Domain", "Filed by"]);
const STEP_MARKS: Record<string, string> = { OPEN: "open", "IN PROGRESS": "in_progress", DONE: "done" };
const CITATION = [/^\d{6}-\d{4}_(\*|[opcdais])_[^/\\\s]+\.md$/, /^\d{6}-\d{4}-[^/\\\s_]+\.md$/, /^foreign:[^:/\\\s]+:\d{6}-\d{4}(_(\*|[opcdais])_[^/\\\s]+|-[^/\\\s_]+)\.md$/];

// --- the inventory ---------------------------------------------------------------

/** Every entry under `root`, sorted; links are not followed. Reads only. */
export function buildInventory(root: string): Inventory {
  const files: InventoryEntry[] = [];
  const dirs: string[] = [];
  const walk = (rel: string): void => {
    for (const name of readdirSync(join(root, rel)).sort()) {
      const r = rel ? `${rel}/${name}` : name;
      const st = lstatSync(join(root, r));
      if (st.isDirectory()) {
        dirs.push(r);
        walk(r);
      } else if (st.isSymbolicLink()) files.push({ path: r, size: st.size, sha256: sha(readlinkSync(join(root, r))), kind: "link" });
      else if (st.isFile()) files.push({ path: r, size: st.size, sha256: sha(readFileSync(join(root, r))), kind: "regular" });
      else files.push({ path: r, size: st.size, sha256: sha(""), kind: "other" });
    }
  };
  walk("");
  return { files, dirs };
}

/** One entry of `migration survey`'s answer, in its four forms. */
export type SurveyEntry = { path: string; kind: "file"; size: number; sha256: string } | { path: string; kind: "link"; target: string } | { path: string; kind: "directory" | "other" };

/** The composer's inventory from survey's entries: a link carries its target's hash, as `buildInventory` gives it. */
export function inventoryFromSurvey(entries: readonly SurveyEntry[]): Inventory {
  const files: InventoryEntry[] = [];
  const dirs: string[] = [];
  for (const e of entries) {
    if (e.kind === "directory") dirs.push(e.path);
    else if (e.kind === "file") files.push({ path: e.path, size: e.size, sha256: e.sha256, kind: "regular" });
    else if (e.kind === "link") files.push({ path: e.path, size: Buffer.byteLength(e.target), sha256: sha(e.target), kind: "link" });
    else files.push({ path: e.path, size: 0, sha256: sha(""), kind: "other" });
  }
  return { files, dirs };
}

// --- the Markdown grammar ----------------------------------------------------------

export interface Head {
  fields: Map<string, { value: string; line: number }[]>;
}

/** Lines outside fenced code blocks, as booleans by index. */
export function unfenced(lines: string[]): boolean[] {
  let fence: string | null = null;
  return lines.map((l) => {
    const m = /^\s*(```|~~~)/.exec(l);
    if (m) {
      fence = fence === null ? m[1] : fence === m[1] ? null : fence;
      return false;
    }
    return fence === null;
  });
}

/** `**Key:** value` lines before the first `## ` heading, outside fences. */
export function readHead(lines: string[]): Head {
  const fields = new Map<string, { value: string; line: number }[]>();
  const open = unfenced(lines);
  for (let i = 0; i < lines.length; i++) {
    if (!open[i]) continue;
    if (/^## /.test(lines[i])) break;
    const m = /^\*\*([^*]+?):\*\*\s*(.*?)\s*$/.exec(lines[i]);
    if (m) fields.set(m[1], [...(fields.get(m[1]) ?? []), { value: m[2], line: i }]);
  }
  return { fields };
}

const one = (h: Head, key: string): string | undefined => h.fields.get(key)?.[0]?.value;

function rawHead(h: Head): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, vs] of h.fields) out[k] = vs.map((v) => v.value).join("\n");
  return out;
}

/** Splits a head value at commas outside parentheses: `a.md (plan, part 1), b.md`. */
export function entries(value: string): { token: string; clause: string; raw: string }[] {
  const out: { token: string; clause: string; raw: string }[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of value + ",") {
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === "," && depth === 0) {
      const t = cur.trim().replace(/^`|`$/g, "");
      if (t) {
        const m = /^(\S+?)`?\s*(?:\((.*)\))?\s*$/.exec(t);
        out.push(m ? { token: m[1].replace(/`/g, ""), clause: m[2] ?? "", raw: cur.trim() } : { token: t, clause: "", raw: cur.trim() });
      }
      cur = "";
    } else cur += ch;
  }
  return out;
}

export const ACTOR = /^[a-z][a-z0-9-]*$/;
/**
 * The reserved actor of a filer the Markdown never recorded
 * (`261003-1746_*_how-does-an-imported-record-carry-a-filer-its-legacy-workbench-never-recorded.md`):
 * written only with its derived entry, never read or answered as a recorded actor.
 */
export const LEGACY_UNKNOWN = "legacy-unknown";

/** A plan's step lines (id and bracket mark) and its stray marks, outside fences, by the header's grammar. */
export function scanPlan(lines: string[]): { steps: { line: number; id: string; mark: string | undefined }[]; stray: number[] } {
  const open = unfenced(lines);
  const steps: { line: number; id: string; mark: string | undefined }[] = [];
  const stray: number[] = [];
  let inSteps = false;
  for (let i = 0; i < lines.length; i++) {
    if (!open[i]) continue;
    if (/^## /.test(lines[i])) inSteps = /^##\s+implementation steps\b/i.test(lines[i]);
    const step = /^((?:#{2,4}\s+)?)(\d+[a-z]?)\.\s+(?:\[([A-Z][A-Z -]*)\]\s+)?/.exec(lines[i]);
    if (step && (step[3] !== undefined || inSteps)) steps.push({ line: i, id: step[2], mark: step[3] });
    else if (/^\s*(?:#{1,6}\s+)?(?:[-*+]\s+|\d+[a-z]?\.\s+)?(?:\*\*)?\[[A-Z][A-Z -]*\]/.test(lines[i]) && /\[(OPEN|IN PROGRESS|DONE)\]/.test(lines[i])) stray.push(i);
  }
  return { steps, stray };
}

function filedBy(value: string | undefined): { actor: string; person: string | null } | "missing" | "unreadable" {
  if (value === undefined) return "missing";
  const m = /^([a-z][a-z0-9-]*)(?:\s*\([^)]*\))?\s*(?:,\s*(.+?))?\s*$/.exec(value);
  return m && m[1] !== LEGACY_UNKNOWN ? { actor: m[1], person: m[2] ?? null } : "unreadable";
}

// --- the composer ------------------------------------------------------------------

interface Candidate {
  kind: Kind;
  narrative: string;
  live: boolean;
  head: Head;
  text: string;
  /** The record marker letter, or the Circle marker letter; null on an item record. */
  marker: string | null;
  container: string | null;
  status: string;
}

/** Composes the migration proposal. Reads files under `root`; writes nothing. */
export function composeProposal(input: ComposeInput): Proposal {
  const { root, inventory, migrationId } = input;
  const findings: Finding[] = [];
  const find = (cls: FindingClass, path: string, detail: string): void => {
    findings.push({ class: cls, severity: FINDINGS[cls], path, detail });
  };
  const byPath = new Map(inventory.files.map((f) => [f.path, f]));
  const read = (p: string): string => readFileSync(join(root, p), "utf-8");
  const scanner: Scanner = createScanner(root);
  const originals = (p: string): string => `archive/migrations/${migrationId}/originals/${p}`;
  const untracked = new Set(input.untracked ?? []);
  const ignored = new Set(input.ignored ?? []);
  const derived = new Map<string, Derived>();
  const derivedOf = (p: string): Derived => derived.get(p) ?? (derived.set(p, {}), derived.get(p)!);
  const unanchored = new Map<string, Record<string, string>>();

  for (const legacy of V11_STORE_NAMES) {
    for (const d of inventory.dirs) {
      if (!d.startsWith("archive/") && (d === legacy || d.endsWith(`/${legacy}`))) find("legacy-store-name", d, `rename to the v12 name first (/fusion:migrate)`);
    }
  }
  if (byPath.has(WORKBENCH_MANIFEST)) find("manifest-present", WORKBENCH_MANIFEST, "a manifest stands; this workbench is not legacy");
  for (const f of inventory.files) if (f.kind === "link" && !f.path.startsWith("archive/")) find("symlink", f.path, "a symbolic link stays as it is");

  // Packages: one head per container.
  const candidates: Candidate[] = [];
  const packageOf = new Map<string, Candidate>();
  const containers = inventory.dirs.filter((d) => d.startsWith(`${CONTAINER_STORE}/`) && d.split("/").length === 2);
  for (const c of containers) {
    const name = c.slice(CONTAINER_STORE.length + 1);
    const inside = inventory.files.filter((f) => f.path.startsWith(`${c}/`));
    const heads = inside.filter((f) => f.path === `${c}/${name}.md` || (f.path.split("/").length === 3 && CIRCLE_HEAD.test(f.path.split("/")[2])));
    if (inside.length === 0) {
      find("empty-container-tree", c, "no file at all; not migrated");
      continue;
    }
    if (heads.length !== 1) {
      find(heads.length === 0 ? "container-without-head" : "two-package-heads", c, heads.map((h) => h.path).join(", ") || "no item record and no Circle head");
      continue;
    }
    const narrative = heads[0].path;
    if (heads[0].kind === "link") {
      find("record-is-link", narrative, "a package head is a symbolic link");
      continue;
    }
    const text = read(narrative);
    const head = readHead(text.split("\n"));
    const circle = CIRCLE_HEAD.exec(narrative.split("/")[2]);
    let status: string;
    if (circle) {
      const map = CIRCLE[circle[1]];
      if (!map) {
        find("unknown-package-status", narrative, `Circle marker _${circle[1]}_ has no v1 status`);
        continue;
      }
      const picked = circle[1] === "d" ? /^(paused|dropped)\b/.exec(one(head, "Status") ?? "")?.[1] : undefined;
      status = picked ?? map.status;
      if (circle[1] === "d" && !picked) {
        find("circle-deferred", narrative, `Circle marker _d_ with head ${JSON.stringify(one(head, "Status") ?? null)}; dropped`);
        derivedOf(narrative)["/status"] = { rule: "circle-deferred-dropped" };
      } else if (!map.heads.test(one(head, "Status") ?? "")) find("circle-head-disagrees-with-marker", narrative, `marker _${circle[1]}_, head ${JSON.stringify(one(head, "Status") ?? null)}`);
    } else {
      status = one(head, "Status") ?? "";
      if (!PACKAGE_STATUSES.has(status)) {
        find("unknown-package-status", narrative, `**Status:** ${JSON.stringify(status)}`);
        continue;
      }
    }
    const cand: Candidate = { kind: "package", narrative, live: !["done", "dropped"].includes(status), head, text, marker: circle ? circle[1] : null, container: c, status };
    candidates.push(cand);
    packageOf.set(name, cand);
  }

  // Records, by store and marker.
  const plain = new Map<string, Candidate>();
  for (const f of inventory.files) {
    const m = RECORD_PATH.exec(f.path);
    if (!m) continue;
    const kind = STORES[m[1]];
    const mk = MARKED.exec(m[2]);
    if (!mk) {
      find("unmarked-file-in-record-store", f.path, "no state marker; stays plain");
      continue;
    }
    const letter = mk[1];
    const vocab = VOCAB[kind];
    const container = f.path.startsWith(`${CONTAINER_STORE}/`) ? f.path.split("/").slice(0, 2).join("/") : null;
    const base = { kind, narrative: f.path, marker: letter, container, head: { fields: new Map() } as Head, text: "" };
    if (letter in vocab.live) {
      if (f.kind === "link") {
        find("record-is-link", f.path, "a live record is a symbolic link");
        continue;
      }
      const text = read(f.path);
      candidates.push({ ...base, live: true, text, head: readHead(text.split("\n")), status: vocab.live[letter] });
    } else if (letter in vocab.terminal) plain.set(f.path, { ...base, live: false, status: vocab.terminal[letter] });
    else if (TERMINAL_LETTERS.has(letter)) {
      plain.set(f.path, { ...base, live: false, status: "" });
      find("terminal-value-without-v1-state", f.path, `_${letter}_ on a ${kind}`);
    } else find("unknown-state", f.path, `_${letter}_ is not a ${kind} marker`);
  }

  const resolveOne = (from: string, token: string): { path: string | null; why: "dangling" | "ambiguous" | "archived" | null } => {
    const hits = scanner.scanCitationTokens(from, [{ line: 1, text: token }]).filter((h) => h.token === token || h.token === token.replace(/\.md$/, ""));
    const h = hits[0];
    if (!h || h.status === "dangling") return { path: null, why: "dangling" };
    if (h.matches.length > 1 || h.status === "ambiguous") return { path: null, why: "ambiguous" };
    if (h.matches.length !== 1) return { path: null, why: "dangling" };
    return { path: h.matches[0], why: h.matches[0].startsWith("archive/") ? "archived" : null };
  };

  // Live records: rewrites and step anchors.
  const after = new Map<string, string>();
  const steps = new Map<string, { id: string; state: string }[]>();
  const removedMarks = new Map<string, Record<string, string>>();
  for (const c of candidates) {
    if (c.kind === "package" || !c.live) continue;
    const lines = c.text.split("\n");
    const drop = new Set<number>();
    const st = c.head.fields.get("Status");
    if (st) {
      st.forEach((s) => drop.add(s.line));
      if (c.kind !== "plan") find("status-head-in-live-record", c.narrative, `**Status:** ${JSON.stringify(st[0].value)} removed`);
    }
    if (c.kind === "plan") {
      const found: { id: string; state: string }[] = [];
      const marks: Record<string, string> = {};
      const loose: Record<string, string> = {};
      const scan = scanPlan(lines);
      const times = new Map<string, number>();
      for (const s of scan.steps) times.set(s.id, (times.get(s.id) ?? 0) + 1);
      const seen = new Set<string>();
      for (const { line, id, mark } of scan.steps) {
        if (mark !== undefined && !(mark in STEP_MARKS)) find("unknown-step-mark", c.narrative, `step ${id} [${mark}]`);
        if (seen.has(id)) find("duplicate-step-number", c.narrative, `step ${id}`);
        seen.add(id);
        // A duplicated number anchors no line, so a citation of it attaches to no step rather than possibly the wrong one.
        const anchored = times.get(id) === 1;
        if (mark !== undefined) {
          if (anchored) marks[id] = mark;
          else loose[`line ${line + 1}`] = mark;
          lines[line] = lines[line].replace(`[${mark}] `, "");
        }
        if (!anchored) continue;
        if (mark !== undefined && !(mark in STEP_MARKS)) derivedOf(c.narrative)[`/control/steps/${found.length}/state`] = { rule: "unrecognised-mark-open", evidence: mark };
        found.push({ id, state: mark === undefined ? "open" : STEP_MARKS[mark] ?? "open" });
      }
      const dup = [...times].filter(([, n]) => n > 1).map(([id]) => id);
      if (dup.length) derivedOf(c.narrative)["/control/steps"] = { rule: "duplicate-numbers-unanchored", evidence: dup.join(", ") };
      for (const i of scan.stray) {
        find("mark-outside-numbered-step", c.narrative, `line ${i + 1}`);
        const m = STRAY_MARK.exec(lines[i])!;
        loose[`line ${i + 1}`] = m[1];
        lines[i] = lines[i].replace(m[0], "");
      }
      steps.set(c.narrative, found);
      removedMarks.set(c.narrative, marks);
      if (Object.keys(loose).length) unanchored.set(c.narrative, loose);
    }
    const out = lines.filter((_, i) => !drop.has(i)).join("\n");
    if (out !== c.text) after.set(c.narrative, out);
  }
  // Live packages: control head lines leave the narrative.
  for (const c of candidates) {
    if (c.kind !== "package" || !c.live) continue;
    const drop = new Set(PACKAGE_CONTROL_HEADS.flatMap((k) => (c.head.fields.get(k) ?? []).map((f) => f.line)));
    const out = c.text.split("\n").filter((_, i) => !drop.has(i)).join("\n");
    if (out !== c.text) after.set(c.narrative, out);
  }
  const revisionOf = (p: string): string => (after.has(p) ? sha(after.get(p)!) : byPath.get(p)!.sha256);

  // Structural fields of live packages, and the closure.
  const docs = new Map<string, { path: string; role: "spec" | "plan" }[]>();
  const deps = new Map<string, string[]>();
  const closure = new Map<string, Candidate>();
  /** `**Active spec/plan:**` entries the files do not bind, by package: carried as references (request 58). */
  const carried = new Map<string, { token: string; evidence: string }[]>();
  const liveRecord = new Map(candidates.filter((c) => c.kind !== "package").map((c) => [c.narrative, c]));
  for (const c of candidates) {
    if (c.kind !== "package" || !c.live) continue;
    for (const k of MAPPED_HEADS) if ((c.head.fields.get(k)?.length ?? 0) > 1) find("duplicate-control-head", c.narrative, `**${k}:** twice`);
    const ds: { path: string; role: "spec" | "plan" }[] = [];
    const carry: { token: string; evidence: string }[] = [];
    const unbound = (cls: FindingClass, evidence: string, token: string, detail = token): void => {
      find(cls, c.narrative, detail);
      carry.push({ token, evidence });
    };
    const active = one(c.head, "Active spec/plan");
    for (const e of active === undefined ? [] : entries(active)) {
      const r = resolveOne(c.narrative, e.token);
      if (r.why !== null) {
        if (r.why === "dangling") unbound("unresolvable-active-document", "unresolvable", e.token);
        else if (r.why === "archived") unbound("active-document-archived", "archived", e.token);
        else unbound("active-document-ambiguous", "ambiguous", e.token);
        continue;
      }
      const target = liveRecord.get(r.path!) ?? plain.get(r.path!);
      if (!target || target.kind !== "plan") {
        unbound("active-document-not-a-plan", "not-a-plan", e.token, `${e.token} is ${target ? `a ${target.kind}` : "no converted record kind"}`);
        continue;
      }
      const clause = /\bspec\b/i.test(e.clause) !== /\bplan\b/i.test(e.clause) ? (/\bspec\b/i.test(e.clause) ? "spec" : "plan") : null;
      const stem = /_[a-z*]_(spec|plan)-/.exec(e.token)?.[1] as "spec" | "plan" | undefined;
      // A clause and a stem naming opposite roles decide neither, as no clause and no stem decide none.
      if (clause && stem && clause !== stem) {
        unbound("active-document-role-conflict", "role-conflict", e.token, `${e.token}: clause ${clause}, stem ${stem}`);
        continue;
      }
      const role = clause ?? stem;
      if (!role) {
        unbound("active-document-role-unclear", "role-unclear", e.token);
        continue;
      }
      if (!target.live) {
        if (target.status === "") find("closure-without-v1-state", target.narrative, `bound by ${c.narrative}`);
        else if (!closure.has(target.narrative)) {
          // A plain candidate was never read; the closure record's head and actor come from its text.
          const text = read(target.narrative);
          closure.set(target.narrative, { ...target, text, head: readHead(text.split("\n")) });
        }
      }
      ds.push({ path: target.narrative, role });
    }
    if (ds.filter((d) => d.role === "plan").length > 1) find("several-active-plans", c.narrative, ds.filter((d) => d.role === "plan").map((d) => d.path).join(", "));
    docs.set(c.narrative, ds);
    carried.set(c.narrative, carry);
    const dp: string[] = [];
    const dependsOn = one(c.head, "Depends-on");
    for (const e of dependsOn === undefined ? [] : entries(dependsOn)) {
      let r = resolveOne(c.narrative, e.token);
      if (r.why === "dangling" && e.token.endsWith(".md")) r = resolveOne(c.narrative, e.token.slice(0, -3));
      if (r.why !== null) {
        find(r.why === "dangling" ? "unresolvable-live-dependency" : r.why === "archived" ? "dependency-archived" : "ambiguous-structural-citation", c.narrative, e.token);
        continue;
      }
      const name = r.path!.split("/")[1];
      if (!r.path!.startsWith(`${CONTAINER_STORE}/`) || !packageOf.has(name)) find("dependency-not-a-package", c.narrative, e.token);
      else dp.push(name);
    }
    deps.set(c.narrative, dp);
  }

  // Identities, in narrative-path order: the converted set, then the closure.
  const converted = [...candidates.filter((c) => c.kind === "package" || c.live), ...[...closure.values()]];
  const ids = new Map<string, string>();
  const workbenchId = input.newId();
  for (const c of [...converted].sort((a, b) => (a.narrative < b.narrative ? -1 : 1))) ids.set(c.narrative, input.newId());
  const ref = (p: string): Record<string, unknown> => ({ workbench_id: workbenchId, record_id: ids.get(p) ?? "unknown", display: p.split("/").pop()! });
  const references = (c: Candidate): unknown[] => {
    const out: string[] = [];
    const xr = one(c.head, "Cross-references");
    for (const e of xr === undefined ? [] : entries(xr)) {
      if (!CITATION.some((re) => re.test(e.token))) find("reference-not-a-citation", c.narrative, e.token);
      else if (!out.includes(e.token)) out.push(e.token);
    }
    for (const { token, evidence } of carried.get(c.narrative) ?? []) {
      if (!CITATION.some((re) => re.test(token))) find("reference-not-a-citation", c.narrative, token);
      else if (!out.includes(token)) {
        derivedOf(c.narrative)[`/references/${out.length}`] = { rule: "binding-carried-as-reference", evidence };
        out.push(token);
      }
    }
    return out;
  };
  const actor = (c: Candidate): Record<string, unknown> => {
    // Anywhere outside a fence, bold or not: an issue carries it below its description, older records unbolded.
    const lines = c.text.split("\n");
    const open = unfenced(lines);
    const line = lines.find((l, i) => open[i] && /^(?:\*\*)?Filed by:/.test(l));
    const f = filedBy(line?.replace(/^(?:\*\*)?Filed by:(?:\*\*)?/, "").replace(/`/g, "").trim());
    if (typeof f !== "string") return f;
    if (input.actors?.[c.narrative] !== undefined) return { ...input.actors[c.narrative] };
    // A plan does not owe the line (the conventions' `### Who filed it`). The actor is never guessed; the person is git's record of the first add.
    find(f === "unreadable" ? "filed-by-unreadable" : c.kind === "plan" ? "filed-by-not-owed" : "filed-by-missing", c.narrative, JSON.stringify(one(c.head, "Filed by") ?? null));
    const added = input.firstAdd(c.narrative);
    const d = derivedOf(c.narrative);
    d["/filed_by/actor"] = { rule: "unknown" };
    d["/filed_by/person"] = "commit" in added ? { rule: "git-first-add", evidence: added.commit } : { rule: "unknown", evidence: added.unknown };
    return { actor: LEGACY_UNKNOWN, person: "commit" in added ? added.person : null };
  };
  const provenance = (c: Candidate, extra: Record<string, unknown> = {}): Record<string, unknown> => {
    const loose = unanchored.get(c.narrative);
    const d = derived.get(c.narrative);
    return {
      source: c.live ? "imported" : "legacy-terminal",
      legacy_fields: { file_marker: c.marker, head: rawHead(c.head), ...extra, ...(loose ? { unanchored_marks: loose } : {}), ...(d && Object.keys(d).length ? { derived: d } : {}) },
      backup: { path: originals(c.narrative), sha256: byPath.get(c.narrative)!.sha256, kind: "other" },
    };
  };

  const adoptedBy = new Map<string, string>();
  for (const [pkg, ds] of docs) {
    for (const d of ds.filter((x) => x.role === "plan")) {
      if (adoptedBy.has(d.path)) find("plan-adopted-twice", d.path, `${adoptedBy.get(d.path)} and ${pkg}`);
      else adoptedBy.set(d.path, pkg);
    }
  }

  const records: ProposedRecord[] = [];
  for (const c of converted) {
    const filed = actor(c);
    const textBytes = Buffer.byteLength(after.get(c.narrative) ?? c.text ?? "");
    if (Math.max(textBytes, byPath.get(c.narrative)!.size) > MAX_RECORD_BYTES) find("narrative-too-large", c.narrative, `${byPath.get(c.narrative)!.size} bytes`);
    if (untracked.has(c.narrative)) find("untracked-record", c.narrative, "git does not track it");
    if (ignored.has(c.narrative)) find("ignored-record", c.narrative, "git ignores it");
    let control: Record<string, unknown>;
    let row: CutRow;
    const controlPath = c.kind === "package" ? `${c.container}/${PACKAGE_CONTROL}` : c.narrative.replace(/\.md$/, RECORD_CONTROL_SUFFIX);
    if (byPath.has(controlPath)) find("control-file-exists", controlPath, "a control file stands where the import would write one");
    if (c.kind === "package") {
      row = c.live ? "package-live" : "package-terminal";
      const domain = one(c.head, "Domain") ?? null;
      if (domain !== null && domain !== "code" && domain !== "data") find("unknown-domain", c.narrative, domain);
      const claimRaw = one(c.head, "Claim");
      const cm = claimRaw === undefined ? null : /^([0-9a-f]{8})\s*(?:—|-)\s*(.*?)\s*(?:,\s*\d{6}-\d{4})?\s*$/.exec(claimRaw);
      const claim = cm ? { checkout_id: cm[1], person: cm[2] || null, claimed_at: null } : null;
      if (c.live && claimRaw !== undefined && !cm) find("invalid-claim", c.narrative, "the **Claim:** line names no checkout");
      if (c.live && (c.status === "claimed") !== (claim !== null)) find("invalid-claim", c.narrative, `status ${c.status} with ${claim ? "a" : "no"} claim`);
      const mode = one(c.head, "Mode");
      if (c.live && mode !== undefined && mode !== "autonomous" && mode !== "ordinary") find("unknown-mode", c.narrative, mode);
      const circle = c.marker ? CIRCLE[c.marker] : null;
      control = {
        schema: "fusion.package/v1",
        id: ids.get(c.narrative),
        workbench_id: workbenchId,
        domain: domain === "code" || domain === "data" ? domain : null,
        status: c.status,
        claim: c.live && c.status !== "claimed" ? null : claim,
        mode: c.live && (mode === "autonomous" || mode === "ordinary") ? { value: mode, source: { kind: "legacy", raw: `**Mode:** ${mode}` } } : { value: "ordinary", source: null },
        origin: filed?.actor === "user" ? { kind: "user-request", ref: null } : { kind: "legacy-unknown", ref: null },
        filed_by: filed,
        narrative: { path: c.narrative },
        depends_on: c.live ? (deps.get(c.narrative) ?? []).map((n) => ({ target: ref(packageOf.get(n)!.narrative), condition: "terminal" })) : [],
        active_documents: c.live ? (docs.get(c.narrative) ?? []).map((d) => ({ ref: ref(d.path), role: d.role, revision: revisionOf(d.path) })) : [],
        references: c.live ? references(c) : [],
        evidence: [],
        outcome: c.live ? null : circle ? { class: circle.outcome, reason: circle.reason, evidence: [] } : c.status === "done" ? { class: "legacy-completed", reason: "", evidence: [] } : { class: "dropped", reason: "dropped (legacy item record; its narrative states why)", evidence: [] },
        provenance: provenance(c),
        extensions: {},
      };
    } else {
      row = c.live ? "record-live" : "record-closure";
      const kind = c.kind;
      let ctl: Record<string, unknown>;
      if (kind === "issue") ctl = { state: c.status, disposition: null };
      else if (kind === "discussion") ctl = { state: c.status, participants: [], outcome_refs: [] };
      else if (kind === "plan") {
        const pkg = adoptedBy.get(c.narrative);
        ctl = { state: c.status, steps: c.live ? steps.get(c.narrative) ?? [] : [], criteria: [], acceptance: pkg ? { ref: ref(pkg), revision: revisionOf(c.narrative) } : null };
      } else {
        const lines = c.text.split("\n");
        const lastOf = (key: string): string | undefined => lines.filter((l) => l.startsWith(`${key}:`)).pop()?.slice(key.length + 1).trim();
        const answered = lastOf("Answered");
        for (const k of ["Implemented", "Superseded by", "Deferred", ...(c.status === "open" ? ["Answered"] : [])]) {
          if (lastOf(k) !== undefined) find("decision-line-disagrees-with-marker", c.narrative, `${k}: on _${c.marker}_`);
        }
        let answer: unknown = null;
        if (c.status === "answered") {
          if (!answered) {
            find("answered-without-answer-line", c.narrative, answered === undefined ? "_a_ with no Answered: line" : "_a_ whose last Answered: line is empty");
            derivedOf(c.narrative)["/control/answer_ref"] = { rule: "answer-ref-self", evidence: answered === undefined ? "no-answer-line" : "empty-answer-line" };
          }
          const hit = !answered ? undefined : scanner.scanCitationTokens(c.narrative, [{ line: 1, text: answered.split(" — ")[0] }]).find((h) => h.status === "resolved" && h.matches.length === 1);
          if (hit && ids.has(hit.matches[0])) answer = ref(hit.matches[0]);
          else if (hit && CITATION.some((re) => re.test(hit.token))) answer = hit.token;
          else {
            answer = { path: originals(c.narrative), sha256: byPath.get(c.narrative)!.sha256, kind: "decision" };
            find("answer-ref-self", c.narrative, "the Answered: line cites nothing resolvable; the record's original answers");
            // The missing and the empty line got theirs above; a line citing nothing resolvable is the same default.
            if (answered) derivedOf(c.narrative)["/control/answer_ref"] = { rule: "answer-ref-self", evidence: "unresolvable-answer-line" };
          }
        }
        ctl = { state: c.status, answer_ref: answer, implementation_ref: null, superseded_by: null, deferral: null };
      }
      if (c.live && c.container && packageOf.get(c.container.split("/")[1]) && !packageOf.get(c.container.split("/")[1])!.live) {
        find("live-record-in-terminal-container", c.narrative, `in ${c.container}`);
      }
      control = {
        schema: "fusion.record/v1",
        id: ids.get(c.narrative),
        workbench_id: workbenchId,
        kind,
        narrative: { path: c.narrative },
        filed_by: filed,
        references: c.live ? references(c) : [],
        provenance: provenance(c, removedMarks.has(c.narrative) ? { step_marks: removedMarks.get(c.narrative) } : {}),
        extensions: {},
        control: ctl,
      };
    }
    records.push({ row, kind: c.kind, id: ids.get(c.narrative)!, narrative: c.narrative, control_path: controlPath, source_sha256: byPath.get(c.narrative)!.sha256, backup: originals(c.narrative), narrative_after: after.get(c.narrative) ?? null, control });
  }

  // The closure check: every record_ref names a proposed record.
  const proposed = new Set(records.map((r) => r.id));
  const walk = (v: unknown, at: string): void => {
    if (Array.isArray(v)) v.forEach((x) => walk(x, at));
    else if (v && typeof v === "object") {
      const o = v as Record<string, unknown>;
      if (typeof o.record_id === "string" && !proposed.has(o.record_id)) find("closure-incomplete", at, `${String(o.display)} is no proposed record`);
      Object.values(o).forEach((x) => walk(x, at));
    }
  };
  for (const r of records) walk(r.control, r.narrative);

  const counts = { "package-live": 0, "package-terminal": 0, "record-live": 0, "record-closure": 0, "plain-terminal": plain.size - closure.size, "empty-container": findings.filter((f) => f.class === "empty-container-tree").length };
  for (const r of records) counts[r.row]++;
  const uuid_map: Record<string, string> = {};
  for (const [p, id] of [...ids].sort()) uuid_map[p] = id;
  return { migration_id: migrationId, workbench_id: workbenchId, source_layout: "fusion-v12", records, uuid_map, counts, findings };
}

/** The findings that stop activation until the frozen plan resolves them. */
export const blocking = (p: Proposal): Finding[] => p.findings.filter((f) => f.severity === "blocking");
