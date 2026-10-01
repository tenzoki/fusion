/**
 * The repair of blocking findings before FJ04's migration freezes its plan
 * (step 8 of `261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md`).
 * A blocking finding of `lib/legacy-import.ts` becomes a proposed edit to the
 * v12 Markdown, applied only with the user's consent for that one finding.
 *
 * ## What is proposed, and what is asked
 *
 * `REPAIRS` holds one entry per repairable class; the edit is pure (text in,
 * text out). A value only the user has is a question, never a default (spec
 * section 8.2): the actor and person of `**Filed by:**`, an `Answered:`
 * line's section, summary and ruler, a step mark, a document, a role, a
 * Circle's status. `offered` lists values the user may pick, such as
 * `bin/fusion-identity`'s `PERSON=`; an unanswered question refuses the
 * repair rather than taking one. A person answered `""` writes the half
 * absent, which the conventions allow and which is an answer, not a gap.
 * A duplicate step number is the one edit that asks nothing: the later
 * duplicate takes the next free letter, and the lines citing that step are
 * listed for the user, not edited.
 *
 * Every other blocking class has no repair that avoids guessing and stays
 * blocking; `legacy-store-name` routes to the store rename.
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
export type RepairProposal = {
    repairable: true;
    finding: Finding;
    source_sha256: string;
    edit: string;
    questions: Question[];
    listed: string[];
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
    questions(text: string, f: Finding, offers: Offers): Question[] | string;
    apply(text: string, f: Finding, a: Answers): string;
    listed?(text: string, f: Finding): string[];
}
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
/** Applies one consented repair. Without consent, a full answer or an unchanged file it writes nothing at all. */
export declare function applyRepair(input: {
    root: string;
    session: string;
    proposal: RepairProposal;
    consent: boolean;
    answers: Answers;
}): ApplyResult;
export {};
