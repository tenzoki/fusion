export declare class CascadeError extends Error {
    constructor(message: string);
}
export declare const DOMAINS: readonly ["code", "data", "strategic", "knowledge"];
export type Domain = (typeof DOMAINS)[number];
/** The names the cascade may read. An identifier outside this set is an error. */
export declare const COUNT_NAMES: readonly ["commits", "analyses_count", "issues_count", "decisions_count", "code_files", "data_files", "counted_by"];
export type CountName = (typeof COUNT_NAMES)[number];
/**
 * The inputs Step 5 gathers. Numbers are counts; strings are the two values
 * that are not numbers — `counted_by`, and either file count when the helper
 * reports `unavailable`.
 */
export type Counts = Record<CountName, number | string>;
export type Expr = {
    kind: "num";
    value: number;
} | {
    kind: "str";
    value: string;
} | {
    kind: "var";
    name: CountName;
} | {
    kind: "arith";
    op: "*" | "/" | "+" | "-";
    left: Expr;
    right: Expr;
} | {
    kind: "compare";
    op: "==" | "!=" | ">" | ">=" | "<" | "<=";
    left: Expr;
    right: Expr;
} | {
    kind: "logical";
    op: "and" | "or";
    left: Expr;
    right: Expr;
};
export interface Branch {
    /** `if` for the first branch, `elif` for the middle, `else` for the last. */
    kind: "if" | "elif" | "else";
    /** The domain this branch assigns. */
    domain: Domain;
    /** The branch line as written, trailing comment stripped. */
    source: string;
    /** The parsed condition; `null` for `else`. */
    condition: Expr | null;
}
export declare function parseCondition(src: string): Expr;
/**
 * Every fenced block in `markdown` that assigns both the `code` and the
 * `strategic` domain — i.e. every executable copy of the cascade the text
 * carries. Zero for an ordinary file, one for the definition site.
 *
 * Exported because "how many files hold one" is the reach gate's question as
 * much as "which block do I run" is this module's.
 */
export declare function cascadeBlocks(markdown: string): string[];
/**
 * The one fenced block assigning both the `code` and the `strategic` domain.
 * Exactly one such block must exist — two would mean the prompt describes the
 * decision twice, and this reader would have to guess which one runs.
 */
export declare function extractCascadeBlock(markdown: string): string;
/**
 * The cascade's branches, in order, with conditions parsed.
 *
 * The block's variable definitions above the cascade name every count and its
 * comments discuss them; neither starts with `if`/`elif`/`else`, so neither is
 * read as a branch.
 */
export declare function parseCascade(markdown: string): Branch[];
export interface Verdict {
    domain: Domain;
    /** Index of the branch that fired. */
    index: number;
    branch: Branch;
}
/** Run the cascade. First branch whose condition holds wins, as an if/elif chain does. */
export declare function evaluateCascade(branches: Branch[], counts: Counts): Verdict;
/** Convenience: parse the prompt text and run it in one call. */
export declare function domainFor(markdown: string, counts: Counts): Domain;
/** Every count name the expression reads. */
export declare function variablesRead(e: Expr | null): Set<CountName>;
/**
 * The three `KEY=value` lines `bin/fusion-count-sources` prints, in the shape
 * the cascade consumes: integers stay integers, and `unavailable` stays the
 * string it is. Turning it into 0 here would be exactly the mislabelling the
 * helper's own header forbids.
 */
export declare function countsFromHelperOutput(stdout: string): Pick<Counts, "code_files" | "data_files" | "counted_by">;
export interface CascadeStatement {
    /** 1-based line number. */
    line: number;
    /** The line as written, trimmed. */
    text: string;
    domains: Domain[];
    inputs: CountName[];
}
/** Every line of `markdown` that states the cascade rather than consuming it. */
export declare function findCascadeStatements(markdown: string): CascadeStatement[];
