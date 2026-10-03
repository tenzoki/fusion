/**
 * The repair of findings before FJ04's migration freezes its plan (step 8 of
 * `261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md`).
 * A finding of `lib/legacy-import.ts` becomes a proposed edit to the v12
 * Markdown, applied only with the user's consent for that one finding.
 *
 * Optional since step 12d (the ruling of 2026-10-03): the composer derives,
 * carries as unknown or defaults every class this module repairs, so the
 * migration requires none of them. An owner who wants the Markdown corrected
 * first applies one, blocking or reported, and the value is then a recorded
 * one with no `derived` entry. `proposeRepair` takes a finding of any class
 * `REPAIRS` holds, whatever its severity.
 *
 * ## What is proposed, and what is asked
 *
 * `REPAIRS` holds one entry per repairable class; the edit is pure (text in,
 * text out). A repair writes only what the user answers: the actor and person
 * of `**Filed by:**`, an `Answered:` line's section, summary and ruler, a step
 * mark, a document, a role, a Circle's status. `offered` lists values the user may pick, such as
 * `bin/fusion-identity`'s `PERSON=`; an unanswered question refuses the
 * repair rather than taking one. A person answered `""` writes the half
 * absent, which the conventions allow and which is an answer, not a gap.
 * A duplicate step number suffixes the later duplicate with the next free
 * letter and asks, per known citation of that step, which of the two steps it
 * means; each answered with the new id is rewritten in the same edit. Known
 * (C16 of the a1fb17a amendment, fusion's reading): a line of the plan, or of
 * another live narrative that cites the plan through `lib/citation-scan.ts`,
 * naming `step <n>`. A terminal narrative or `archive/` is history and is
 * neither scanned nor edited.
 *
 * A terminal narrative is never edited (`## Terminal states are history`):
 * a missing `**Filed by:**` there is asked all the same, consented and logged,
 * but the actor goes into its control file only (`control_only`), through the
 * composer's `actors` input that `actorsFromLog` builds from the log.
 *
 * Every other blocking class has no repair that avoids guessing and stays
 * blocking until the Markdown is fixed by hand; `legacy-store-name` routes to
 * the store rename.
 *
 * ## Applying one
 *
 * `applyRepair` refuses, writing nothing, without consent, with a question
 * unanswered or an answer outside its form, or when the file's sha256 is no
 * longer the one the proposal was made from. Before the first repair it
 * copies the whole workbench into the session directory, outside the root,
 * and verifies the copy by tree hash. It then writes the edit, re-runs the
 * reader, and restores the file unless that finding is gone. Each applied
 * repair is one line of the session's `repair-log.jsonl`: the finding, the
 * answers, and the file's sha256 before and after, for the frozen plan's
 * repair log.
 */
import { type Finding, type FindingClass } from "./legacy-import.js";
export interface Question {
    key: string;
    ask: string;
    /** `choice`: one of `choices`; `actor`: the `**Filed by:**` actor grammar; `person`: one line, `""` for absent; `text`: one non-empty line. */
    form: "choice" | "actor" | "person" | "text";
    choices?: string[];
    /** Values the user may pick; never taken when the answer is missing. */
    offered?: string[];
    /** Asked only when another answer has this value. */
    when?: {
        key: string;
        value: string;
    };
}
/** A line naming the duplicated step; `line` is 0-based. */
interface Cite {
    path: string;
    line: number;
    text: string;
}
export type RepairProposal = {
    repairable: true;
    finding: Finding;
    source_sha256: string;
    edit: string;
    questions: Question[];
    listed: string[];
    control_only: boolean;
    others: {
        path: string;
        sha256: string;
    }[];
} | {
    repairable: false;
    finding: Finding;
    reason: string;
};
export interface RepairLogEntry {
    finding: Finding;
    answers: Record<string, string>;
    pre_sha256: string;
    post_sha256: string;
    /** The Markdown stayed as it is (pre equals post) and the answer goes into the control file. */
    control_only?: true;
}
export type ApplyResult = {
    applied: true;
    entry: RepairLogEntry;
} | {
    applied: false;
    refusal: "unrepairable" | "no-consent" | "unanswered" | "invalid-answer" | "file-changed" | "not-located" | "not-cleared" | "session-inside-root";
    detail: string;
};
/** Values the caller may offer as choices: never defaults. */
export interface Offers {
    person?: string;
}
type Answers = Readonly<Record<string, string>>;
interface Repair {
    edit: string;
    /** The questions for this finding in this text, or why it cannot be located. */
    questions(text: string, f: Finding, offers: Offers, root: string): Question[] | string;
    apply(text: string, f: Finding, a: Answers): string;
    listed?(text: string, f: Finding): string[];
    /** The known citations an answer may rewrite, in this file and in others. */
    cites?(root: string, text: string, f: Finding): Cite[];
}
/** A terminal narrative by its name or head: a terminal record marker, a closed Circle head, a done or dropped item record. */
export declare function isTerminalNarrative(path: string, text: string): boolean;
export declare const REPAIRS: Partial<Record<FindingClass, Repair>>;
/** Proposes the repair of one finding, reading its file; writes nothing. */
export declare function proposeRepair(root: string, finding: Finding, offers?: Offers): RepairProposal;
/** The first question left unanswered or answered outside its form; null when every asked one is answered. */
export declare function checkAnswers(questions: Question[], answers: Answers): {
    refusal: "unanswered" | "invalid-answer";
    detail: string;
} | null;
/** The workbench's tree hash: every file's path, kind and sha256, and every directory. */
export declare function treeHash(root: string): string;
export declare function readRepairLog(session: string): RepairLogEntry[];
/** The actors the log supplied to control files only, by narrative, for the composer's `actors`. */
export declare function actorsFromLog(log: readonly RepairLogEntry[]): Record<string, {
    actor: string;
    person: string | null;
}>;
/** Copies the workbench into `session/backup/` once, verified by tree hash; a copy that does not verify throws, and nothing is repaired. */
export declare function ensureBackup(root: string, session: string): void;
/** Applies one consented repair. Without consent, a full answer or unchanged files it writes nothing at all. */
export declare function applyRepair(input: {
    root: string;
    session: string;
    proposal: RepairProposal;
    consent: boolean;
    answers: Answers;
}): ApplyResult;
export {};
