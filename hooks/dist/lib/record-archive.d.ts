/**
 * The host's archive move over a JSON-controlled workbench: which units may
 * leave the current record store, the fence that keeps every codec writer out
 * while they move, the move, its verification, and the recovery a crash
 * leaves behind. Reached through `archive.ts` and `bin/fusion-archive`, by
 * explicit calls only. No skill calls it before step 13 of
 * `261001-1030_*_plan-the-archive-revision-archive-leaves-json-control-and-json-archival-follows-its-qualification.md`,
 * which waits on Prior's qualification of the archive revision.
 *
 * ## What it decides, and from what
 *
 * Prior rules (`## 36` of its FJ03c response, `codec/fixtures/prior/REQUESTS.md`
 * `## The archive revision (the contract delta)`) that every record staying
 * under JSON control keeps every binding it makes. Whether a unit may leave is
 * decided from one codec answer: `reconcile`'s `references`, complete by the
 * schemas since the archive revision (`codec/README.md`
 * `## What \`reconcile\` reports`). Nothing here parses a control file. The
 * store is read through `lib/record-index.ts` `readRecordIndex` (gate, `list`,
 * `reconcile`, and its judgement of which rows read), whose `list` and
 * `reconcile` answers are kept rather than asked for twice. State is the
 * contract's liveness, never a Markdown header or a file name.
 *
 * ## Units
 *
 *   package          a container `work-packages/<dir>/`, every file below it.
 *                    Eligible when every record in it is terminal by
 *                    `codec/contract/transitions.json` and it holds nothing
 *                    but directories and regular files.
 *   pair             a record under `shared/`, its control file and its
 *                    narrative, named by either. Eligible when terminal.
 *   evidence-group   a report and every evidence record naming it, moved
 *                    whole or not at all; named by the report or any record.
 *
 * A candidate line naming anything else is refused by name: a path under
 * `archive/`, one reached through a symbolic link, a record inside a
 * container (it moves with its container), a file no record names (the skill
 * moves it as before).
 *
 * ## Holds, to a fixed point
 *
 * A reference whose source stays binds its target, and a unit containing the
 * target stays too. A container contains every path below it, so it inherits
 * the hold of anything inside. A unit held in one round stays, so its own
 * references hold in the next; the computation repeats until no round holds a
 * further unit. The target of an entry:
 *
 *   resolved                      its `target`
 *   unresolved, ambiguous,        the value at the entry's own pointer in
 *     foreign                     `show` of its source: a record id holds
 *                                 every unit carrying that id, a path every
 *                                 unit containing it
 *   unchecked                     none: a legacy citation, a git commit or a
 *                                 named external target binds no local file
 *
 * A control file that does not read (the index's `unreadable`) has bindings
 * nobody can know, so every unit is held. A takeover's consent source, at
 * `/provenance/claim_transfers/<i>/source` (or `…/source/ref`), is one more
 * `reconcile` site under this table, with no rule or exemption of its own
 * (Prior's answer to request 62, part 6).
 *
 * Prose binds too, where it names a path. A remaining record's narrative that
 * cites a unit by a full workbench path holds it, because that path no longer
 * resolves once the unit moves; Prior accepts no intentional break of such a
 * citation (its response at `39f6fb8`, ruling 40). The tokens are the citation
 * grammar's own (`lib/citation-scan.ts`): every token it reports
 * `store-prefixed` is read as a path, `./` and `../` from the citing file,
 * `fusion-workbench/` and a bare container directory from the workbench root,
 * and one rooted in `archive/` names nothing that moves. The file it names
 * holds, and so does every file the grammar's own lookup of its last segment
 * finds in that directory (a wildcarded marker, a prefix). The hold line names
 * the citing narrative, `line <n>`, and the cited path. A storeless basename
 * holds nothing: the lookup covers `archive/`, so it still resolves. A report,
 * a forum entry or any other Markdown file names no record and binds nothing
 * here, and a narrative that does not read stops the survey (exit 4).
 *
 * ## The move
 *
 *   inventory   `archive/<into>/.inventory.json`, naming the operation id
 *               the fence will take, before the fence is asked for
 *   fence       `maintenance begin`; refused or unanswered, nothing moves
 *   recheck     the store read again under the fence: the survey's
 *               candidates are resolved and held afresh, and `store=` says
 *               whether any revision moved since the survey. A unit held now
 *               is not moved, whatever the survey said
 *   final       the kept units with every file's sha256; a unit whose
 *               destination stands is refused (`collision`)
 *   moves       unit by unit, the inventory rewritten after each
 *   verify      every moved file absent at its source and at its destination
 *               with its hash, the store reading again with no unreadable
 *               record, and no reference left unresolved that resolved under
 *               the fence (`baseline`)
 *   end         `maintenance end` naming the fence
 *
 * Verification is the host's own because the codec cannot see two of the
 * three ways a move goes half-wrong: a control file moved without its
 * narrative, and a container moved without its evidence group, both leave
 * `validate` and `reconcile` clean (step 9's recorded failed moves 1 and 3).
 * A failed move or verification puts every moved file back and ends the
 * fence; a restore that cannot finish leaves the store fenced and names it.
 *
 * ## Recovery
 *
 * Maintenance bypasses the codec's record journal: `begin` writes the fence
 * and `end` removes it before its answer is stored, so a crash in that gap
 * leaves a fence state that no replay reports as a success. Recovery therefore
 * reads state and never re-sends: `resume` and `abandon` ask `inspect` for the
 * fence and match it and the files against the durable inventory. Neither
 * sends `begin`, and each sends `end` only to the fence `inspect` names as
 * this inventory's. An answer that did not come is never re-sent within the
 * run; it is exit 7, and the next `resume` reads what landed.
 *
 *   phase survey       nothing had moved. The inventory's fence, if it
 *                      stands, is ended; the inventory is closed
 *   fence standing     every file at its source or its destination with its
 *                      recorded hash finishes the move; anything else is
 *                      put back under the fence, which then ends
 *   no fence standing  every file at its destination with its hash, and the
 *                      store verifying, closes the move; anything else moves
 *                      nothing (exit 5), since files move only under the fence
 *
 * `abandon` ends a fence whose inventory records nothing moved, and refuses
 * once a unit moved.
 *
 * With the inventory lost there is no last resort by hand. A `validate` and a
 * `reconcile` do not show a store whole: two of step 9's three half-moves pass
 * both. Before the fence is removed, a trustworthy inventory is recovered, or
 * a known complete state is restored or verified under it: every pair and
 * evidence group whole, every file at its recorded hash. Where neither can be
 * established, the fence stays and normal work stays blocked.
 *
 * Normal work is gated on the fence itself (Prior's ruling 39(a)). The codec
 * checks it under its lock on every fresh mutation, so `bin/fusion-write`
 * meets `conflict/maintenance-active` however its caller read the store.
 * Only a replay of an operation completed before the fence answers, and it
 * writes nothing. The readers (`lib/record-index.ts`, `bin/fusion-claimed-package`,
 * `bin/fusion-work-order`) keep reading under a fence, as 39(a) permits, and
 * authorise no write; a fence that does not read refuses their `inspect`.
 * Nothing fences a narrative edited outside the codec. The fence is local to
 * one checkout: a checkout that has not pulled the move can still reference
 * an archived record, and only a `reconcile` after the pull reports it
 * (request 39).
 */
import { type Ask } from "./record-client.js";
import { type RecordIndex } from "./record-index.js";
export type UnitKind = "package" | "pair" | "evidence-group";
export interface Unit {
    kind: UnitKind;
    /** The container, or the control file of a pair, or the report of a group: what the unit is named by. */
    source: string;
    /** Every file the unit moves, workbench-relative, sorted. */
    files: string[];
    /** The record ids the unit carries. */
    ids: string[];
    /** Why it may not leave whatever binds it: a live record, or a file that is not regular. */
    barred: Why | null;
}
/** Why a unit stays. `at` and `target` are a binding's pointer and target, a citation's line and cited path, `-` for every other reason. */
export interface Why {
    why: "binding" | "citation" | "live" | "unreadable" | "collision" | "not-regular";
    path: string;
    at: string;
    target: string;
}
/** One `reconcile` reference entry, as far as a hold reads it. */
interface Ref {
    path: string;
    at: string;
    status: string;
    target?: string;
}
/** The store as one read saw it. */
export interface Store {
    id: string;
    index: RecordIndex;
    /** sha256 over every listed control path and revision: equal digests, no revision moved. */
    digest: string;
    references: Ref[];
}
export interface Survey {
    workbenchId: string;
    digest: string;
    units: Unit[];
    held: Map<string, Why>;
    refused: Array<{
        line: string;
        reason: string;
    }>;
}
export interface InventoryUnit {
    kind: UnitKind;
    source: string;
    destination: string;
    files: Array<{
        path: string;
        sha256: string;
    }>;
    state: "planned" | "moved" | "restored";
}
export interface Inventory {
    format: typeof INVENTORY_FORMAT;
    workbench_id: string;
    /** The operation id `maintenance begin` takes. */
    fence: string;
    into: string;
    /** `survey` until the recheck under the fence, `final` once the units are fixed, `closed` at any end. */
    phase: "survey" | "final" | "closed";
    outcome?: string;
    /** Every reference entry neither resolved nor unchecked under the fence, `<path>\t<at>`. */
    baseline: string[];
    units: InventoryUnit[];
}
/** How a file moves; a test hands in its own to show what verification catches. */
export interface Io {
    rename(from: string, to: string): void;
}
export interface Options {
    ask?: Ask;
    /** `codec/contract/transitions.json`; default beside the compiled module. */
    contract?: string;
    io?: Io;
}
export type Kind = "done" | "usage" | "install" | "unread" | "fence" | "nothing" | "fenced" | "restored";
export interface Outcome {
    kind: Kind;
    lines: string[];
    detail?: string;
}
/** The wrapper's exit table, one code per kind. 1 is the wrapper's own: no workbench above the working directory. */
export declare const EXIT: Readonly<Record<Kind, number>>;
export declare const INVENTORY_FORMAT = "fusion.archive-inventory/1";
/** `<stamp>-<slug>`, the archive folder's name as `/fusion:archive` composes it. */
export declare const INTO: RegExp;
export declare const sha256: (wb: string, rel: string) => string;
export declare const inventoryPath: (into: string) => string;
/** The store through `readRecordIndex`, keeping its `list` and `reconcile` answers; or why it was not read. */
export declare function readStore(wb: string, options?: Options): {
    store: Store;
} | {
    stop: Outcome;
};
/** The candidate lines as units, each named once, and the lines that name none. */
export declare function unitsOf(wb: string, lines: string[], store: Store, ask: Ask): {
    units: Unit[];
    refused: Array<{
        line: string;
        reason: string;
    }>;
};
/** Which units stay, and why: the header's `## Holds, to a fixed point`. */
export declare function holdsOf(wb: string, units: Unit[], store: Store, ask: Ask): Map<string, Why>;
export declare const heldLine: (u: {
    kind: string;
    source: string;
}, w: Why) => string;
/** `survey --candidates`: every candidate line as a unit, `candidate=` or `held=`, over one read of the store. */
export declare function survey(wb: string, lines: string[], options?: Options): {
    survey: Survey;
} | {
    stop: Outcome;
};
export declare function surveyOutcome(s: Survey): Outcome;
/** A survey's printed lines read back: the workbench, the store digest and the candidates. */
export declare function parseSurvey(text: string): {
    workbenchId: string;
    digest: string;
    candidates: Array<{
        kind: UnitKind;
        source: string;
    }>;
} | {
    usage: string;
};
export declare function writeInventory(wb: string, inv: Inventory): void;
/** An inventory file read and checked, or why it is none this helper wrote. */
export declare function readInventory(file: string): {
    inventory: Inventory;
} | {
    usage: string;
};
/** `maintenance begin` under the inventory's operation id: null once the fence stands. */
export declare function beginFence(wb: string, inv: Inventory, options?: Options): Outcome | null;
/** The recheck under the fence: the survey's candidates resolved and held afresh, the kept ones fixed with their hashes. */
export declare function finalize(wb: string, inv: Inventory, surveyDigest: string, options?: Options): {
    lines: string[];
} | {
    stop: Outcome;
};
/** One unit to its destination, the inventory rewritten after it. A file already at its destination stays there. */
export declare function moveUnit(wb: string, inv: Inventory, unit: InventoryUnit, io?: Io): void;
/** Why the moved units are not where the inventory says, or the store does not read clean after them; null when they are and it does. */
export declare function verifyMove(wb: string, inv: Inventory, options?: Options): string | null;
/** The inventory written and the fence taken, before anything is rechecked; or why not. */
export declare function planMove(wb: string, surveyText: string, into: string, options?: Options): {
    inventory: Inventory;
    digest: string;
} | {
    stop: Outcome;
};
/** `move --survey --into`: the header's `## The move`, end to end. */
export declare function move(wb: string, surveyText: string, into: string, options?: Options): Outcome;
/**
 * `resume --inventory`: the header's `## Recovery` table, matched against what
 * `inspect` names. It sends no `begin`, and `end` only to a fence it saw stand.
 */
export declare function resume(wb: string, file: string, options?: Options): Outcome;
/** `abandon --inventory`: end a fence whose inventory records nothing moved. */
export declare function abandon(wb: string, file: string, options?: Options): Outcome;
export {};
