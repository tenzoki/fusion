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
export declare const FINDINGS: {
    readonly "legacy-store-name": "blocking";
    readonly "manifest-present": "blocking";
    readonly "control-file-exists": "blocking";
    readonly "unknown-state": "blocking";
    readonly "unknown-package-status": "blocking";
    readonly "two-package-heads": "blocking";
    readonly "container-without-head": "blocking";
    readonly "invalid-claim": "blocking";
    readonly "unknown-mode": "blocking";
    readonly "duplicate-control-head": "blocking";
    readonly "several-active-plans": "blocking";
    readonly "plan-adopted-twice": "blocking";
    readonly "unresolvable-live-dependency": "blocking";
    readonly "dependency-not-a-package": "blocking";
    readonly "dependency-archived": "blocking";
    /** On `**Depends-on:**` only; on `**Active spec/plan:**` it is `active-document-ambiguous`. */
    readonly "ambiguous-structural-citation": "blocking";
    readonly "closure-without-v1-state": "blocking";
    readonly "closure-incomplete": "blocking";
    readonly "record-is-link": "blocking";
    readonly "narrative-too-large": "blocking";
    readonly "circle-deferred": "reported";
    readonly "filed-by-missing": "reported";
    readonly "filed-by-not-owed": "reported";
    readonly "filed-by-unreadable": "reported";
    readonly "unresolvable-active-document": "reported";
    readonly "active-document-not-a-plan": "reported";
    readonly "active-document-archived": "reported";
    readonly "active-document-ambiguous": "reported";
    readonly "active-document-role-unclear": "reported";
    readonly "active-document-role-conflict": "reported";
    readonly "duplicate-step-number": "reported";
    readonly "mark-outside-numbered-step": "reported";
    readonly "unknown-step-mark": "reported";
    readonly "answered-without-answer-line": "reported";
    readonly "empty-container-tree": "reported";
    readonly "terminal-value-without-v1-state": "reported";
    readonly "circle-head-disagrees-with-marker": "reported";
    readonly "live-record-in-terminal-container": "reported";
    readonly "answer-ref-self": "reported";
    readonly "decision-line-disagrees-with-marker": "reported";
    readonly "status-head-in-live-record": "reported";
    readonly "reference-not-a-citation": "reported";
    readonly "unmarked-file-in-record-store": "reported";
    readonly "unknown-domain": "reported";
    readonly "untracked-record": "reported";
    readonly "ignored-record": "reported";
    readonly symlink: "reported";
};
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
    actors?: Readonly<Record<string, {
        actor: string;
        person: string | null;
    }>>;
    /** Narrative path to the person git names for its first add, or why none: the person of a filer the file never recorded. */
    firstAdd: (path: string) => FirstAdd;
}
export type FirstAdd = {
    person: string;
    commit: string;
} | {
    unknown: "untracked" | "no-repository" | "shallow-history";
};
/** `provenance.legacy_fields.derived`: JSON Pointer into the control to the rule that set the value. */
export type Derived = Record<string, {
    rule: string;
    evidence?: string;
}>;
/** Every entry under `root`, sorted; links are not followed. Reads only. */
export declare function buildInventory(root: string): Inventory;
/** One entry of `migration survey`'s answer, in its four forms. */
export type SurveyEntry = {
    path: string;
    kind: "file";
    size: number;
    sha256: string;
} | {
    path: string;
    kind: "link";
    target: string;
} | {
    path: string;
    kind: "directory" | "other";
};
/** The composer's inventory from survey's entries: a link carries its target's hash, as `buildInventory` gives it. */
export declare function inventoryFromSurvey(entries: readonly SurveyEntry[]): Inventory;
export interface Head {
    fields: Map<string, {
        value: string;
        line: number;
    }[]>;
}
/** Lines outside fenced code blocks, as booleans by index. */
export declare function unfenced(lines: string[]): boolean[];
/** `**Key:** value` lines before the first `## ` heading, outside fences. */
export declare function readHead(lines: string[]): Head;
/** Splits a head value at commas outside parentheses: `a.md (plan, part 1), b.md`. */
export declare function entries(value: string): {
    token: string;
    clause: string;
    raw: string;
}[];
export declare const ACTOR: RegExp;
/**
 * The reserved actor of a filer the Markdown never recorded
 * (`261003-1746_*_how-does-an-imported-record-carry-a-filer-its-legacy-workbench-never-recorded.md`):
 * written only with its derived entry, never read or answered as a recorded actor.
 */
export declare const LEGACY_UNKNOWN = "legacy-unknown";
/** A plan's step lines (id and bracket mark) and its stray marks, outside fences, by the header's grammar. */
export declare function scanPlan(lines: string[]): {
    steps: {
        line: number;
        id: string;
        mark: string | undefined;
    }[];
    stray: number[];
};
/** Composes the migration proposal. Reads files under `root`; writes nothing. */
export declare function composeProposal(input: ComposeInput): Proposal;
/** The findings that stop activation until the frozen plan resolves them. */
export declare const blocking: (p: Proposal) => Finding[];
