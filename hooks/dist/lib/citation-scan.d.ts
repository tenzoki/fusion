export interface Violation {
    file: string;
    line: number;
    token: string;
    problem: string;
    fix: string;
}
export declare function report(violations: Violation[]): string;
/** Placeholder syntax — template tokens are never references. */
export declare function isPlaceholder(token: string): boolean;
/** Files exempt from class (c) wholesale, with the reason. */
export declare const RECORD_EXAMPLE_FILES: Record<string, string>;
/**
 * Which of `lines` sit INSIDE a closed fenced code block, as a mask parallel to
 * the input. Indexed rather than keyed by line number so that a caller passing
 * a filtered or repeated line list cannot silently collide two entries.
 *
 * Content only. The opening fence's line carries the info string and the
 * closing fence's line carries nothing; neither is content, so a token on
 * either is judged like any other. That is the difference between exempting a
 * transcript and exempting the sentence that introduces it.
 *
 * WHAT IS IMPLEMENTED, read off CommonMark 0.31.2 §4.5 on 2026-08-20 rather
 * than recalled:
 *   - a fence is at least three consecutive backticks or tildes, and the two
 *     characters may not be mixed;
 *   - either fence may be preceded by up to three spaces of indentation;
 *   - a closing fence uses the SAME character as the opening one, is at least
 *     as long, and "may be followed only by spaces or tabs";
 *   - "if the info string comes after a backtick fence, it may not contain any
 *     backtick characters" — the rule that keeps a one-line inline span such as
 *     ``` ```x``` ``` from opening a block that never ends.
 *
 * WHAT IS DELIBERATELY NOT, each because implementing it would decide something
 * this step is not the place to decide:
 *   - **container blocks.** A fence inside a list item may be indented to that
 *     item's content column, well past three spaces, and CommonMark scopes the
 *     fence to the container. This tracker is flat, so such a fence never opens
 *     — `agents/orchestrator.md:162` carries one at five spaces. The cost is
 *     that its content stays JUDGED, which is the status quo and the safe
 *     direction; dropping the indent bound instead would let any indented run
 *     of three backticks switch the gate off for an arbitrary span.
 *   - **tabs as indentation.** A leading tab advances to column 4 and so cannot
 *     introduce a fence; the pattern asks for spaces and stops there.
 *   - **indented (four-space) code blocks.** Not fences, and out of scope by
 *     instruction. Measured before the exclusion rather than assumed: over the
 *     shipped markdown surface exactly 2 citation tokens sit on a line indented
 *     four spaces or more, and over the whole workbench 179 — and every sample
 *     inspected was a list continuation, not a code block. Four-space
 *     indentation is ambiguous with list continuation, and treating it as code
 *     would exempt those 181 tokens on the strength of a guess.
 *
 * AND ONE DEPARTURE FROM THE SPEC, taken deliberately and in the strict
 * direction. CommonMark: "if the end of the containing block (or document) is
 * reached and no closing code fence has been found, the code block contains all
 * of the lines after the opening code fence until the end". Here an unclosed
 * fence exempts NOTHING — the lines it opened are discarded at the end of the
 * walk rather than added. A gate that one stray backtick line can switch off
 * for the whole remainder of a file is not a gate, and an unbalanced fence is a
 * record to fix rather than a region to stop reading.
 */
export declare function fencedContentLines(lines: {
    line: number;
    text: string;
}[]): boolean[];
export interface WorkbenchEntry {
    relDir: string;
    base: string;
}
export type CitationKind = 
/** the five the gate judges; the first, third and fourth carry a store segment and are violations */
"record" | "bare-record" | "circle-record" | "circle-dir"
/** a stamp plus a dashed name, no store prefix — decidable by prefix */
 | "stamp-name"
/** a stamp alone — the residual, and the only kind the gate does not read */
 | "stamp-bare";
/**
 * The kinds the gate judges. Everything else is measurement-only, and since
 * 2026-08-20 "everything else" is one kind: `stamp-bare`.
 *
 * `stamp-name` joined the list under decision
 * `260819-2016_*_does-the-citation-gate-judge-the-stamp-name-class-which-scanrecordcitations-does-not-read.md`
 * (option 2), so that the repair scope and the gate scope coincide instead of
 * diverging by 33 tokens. A `stamp-name` token is a stamp plus a dashed name
 * (`260812-2116-coder-<slug>`), which this parser's own header calls decidable
 * by prefix. `stamp-bare` stays out and is not a candidate for joining: a bare
 * timestamp carries no store, no kind and no slug, so the question it fails is
 * "which of these is meant", which no mechanism reading the token can answer
 * (`rules/critical-stance.md` §4).
 *
 * BOTH callers share this list — the shipped-text lint in
 * `hooks/lib/__tests__/reference-resolution-lint.test.ts` and the workbench
 * gate in `hooks/lib/__tests__/workbench-citation-lint.test.ts`. Adding a kind
 * here therefore moves the first one's pinned counts, and that re-approval
 * belongs in the same commit as the widening.
 *
 * EXPORTED SO THE NEXT DRIFT IS REPORTED. `reference-resolution-lint.test.ts`
 * walks the shipped surface with a literal restatement of this list, kept
 * literal on purpose so the two views stay independent — and that copy was
 * stale for two steps, green only because the surface carried no token of the
 * kind it had missed. One assertion there now compares the two lists directly,
 * which is a question the corpus cannot answer and this export makes askable.
 */
export declare const GATE_KINDS: CitationKind[];
export type CitationStatus = 
/** resolves to exactly one file (or one Circle directory) */
"resolved"
/** resolves to more than one — the citation does not say which */
 | "ambiguous"
/** the record exists, under a different marker */
 | "stale-marker"
/** the citation carries a store segment; never resolved, `fix` spells the storeless form */
 | "store-prefixed"
/** nothing on disk matches */
 | "dangling"
/** a parser exemption fired; the token was never resolved */
 | "exempt"
/** no workbench to resolve against (fresh clone) */
 | "unresolved-no-workbench";
export interface CitationHit {
    file: string;
    line: number;
    /** 0-based column of the token on its line; what a rewriter splices at */
    col: number;
    token: string;
    kind: CitationKind;
    status: CitationStatus;
    /** what the token resolved to, workbench-relative */
    matches: string[];
    problem?: string;
    fix?: string;
    /** which exemption fired, when the status is `exempt` */
    reason?: string;
}
export type Lines = {
    line: number;
    text: string;
}[];
export interface CorpusScan {
    root: string;
    files: number;
    hits: CitationHit[];
}
/** The grammar bound to one workbench root — what `createScanner()` returns. */
export interface Scanner {
    /** The root every resolution below is taken against. */
    workbenchRoot: string;
    /** Whether `<workbenchRoot>/.fusion-setup` exists; without it nothing resolves. */
    present: boolean;
    workbenchIndex(): WorkbenchEntry[];
    circleDirs(): Map<string, string[]>;
    scanCitationTokens(rel: string, lines: Lines): CitationHit[];
    scanRecordCitations(rel: string, lines: Lines): {
        violations: Violation[];
        resolved: number;
    };
    scanCorpus(root: string): CorpusScan;
}
/**
 * Bind the grammar to a workbench root. The two indexes below are memoised per
 * scanner, and for one reason: both are read once per token and the tree does
 * not move under a run. A caller that needs a fresh read makes a fresh scanner.
 */
export declare function createScanner(workbenchRoot: string): Scanner;
/** Every agent's name, read off the prompt directory rather than hard-coded. */
export declare function agentNames(pluginRoot: string): string[];
/**
 * Every agent prompt plus each skill body, as `{ rel, abs }`. `exempt` names
 * skill DIRECTORIES to skip, which is how the marker-format and path-literal
 * gates let `setup` and `migrate` name what those gates otherwise forbid.
 * Four gates each carried a private copy of this walk until 2026-08-22.
 */
export declare function shippedPrompts(pluginRoot: string, exempt?: Set<string>): {
    rel: string;
    abs: string;
}[];
export declare function markdownFilesUnder(root: string): {
    rel: string;
    abs: string;
}[];
/**
 * The three lists the baseline is stated in, plus the bucket of tokens that
 * were never judged. Disjoint, and every hit lands in exactly one.
 *
 * A `stamp-bare` token lands in `undecidable` WHATEVER it resolved to, and
 * that is the one placement worth defending. Such a token carries no store, no
 * kind and no slug: when it matches exactly one artifact today, it does so by
 * the accident that one artifact was written in that minute, and it silently
 * becomes ambiguous the moment a second one is. The question it fails is not
 * "does this exist" but "which of these is meant", and no mechanism reading
 * that token can answer it.
 */
export declare function partition(hits: CitationHit[]): {
    resolved: CitationHit[];
    dangling: CitationHit[];
    undecidable: CitationHit[];
    exempt: CitationHit[];
};
