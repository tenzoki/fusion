export declare class CascadeError extends Error {
    constructor(message: string);
}
export declare const DOMAINS: readonly ["code", "data"];
export type Domain = (typeof DOMAINS)[number];
/** Domain values the cascade may no longer assign. */
export declare const RETIRED_DOMAINS: readonly ["strategic", "knowledge"];
/** The names the cascade may read. An identifier outside this set is an error. */
export declare const COUNT_NAMES: readonly ["code_files", "data_files", "counted_by"];
export type CountName = (typeof COUNT_NAMES)[number];
/** Inputs only the retired branches read. Not readable; still recognisable. */
export declare const RETIRED_COUNT_NAMES: readonly ["commits", "analyses_count", "issues_count", "decisions_count"];
export type RetiredCountName = (typeof RETIRED_COUNT_NAMES)[number];
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
 * Every fenced block in `markdown` that assigns both surviving domains — i.e.
 * every executable copy of the cascade the text carries. Zero for an ordinary
 * file, one for the definition site.
 *
 * Both are required, not either: a block naming one outcome states no choice.
 * The pair is derived from DOMAINS rather than spelled out, so it moved with
 * the removal instead of staying pinned to a name that no longer exists.
 *
 * Exported because "how many files hold one" is the reach gate's question as
 * much as "which block do I run" is this module's.
 */
export declare function cascadeBlocks(markdown: string): string[];
/**
 * The one fenced block assigning both domains. Exactly one such block must
 * exist — two would mean the prompt describes the decision twice, and this
 * reader would have to guess which one runs.
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
/** Any input name the detector recognises: live, or retired with its branch. */
export type NamedInput = CountName | RetiredCountName;
/** The cascade inputs a line names, by variable name or by prose spelling. */
export declare function inputsNamedIn(line: string): Set<NamedInput>;
export interface CascadeStatement {
    /** 1-based line number of the unit's FIRST line. */
    line: number;
    /** How many source lines the unit covers: 1, or 2 for a wrapped sentence. */
    span: number;
    /** The unit as written, trimmed; a 2-line unit is joined with one space. */
    text: string;
    domains: Domain[];
    inputs: NamedInput[];
}
export interface StatementUnit {
    line: number;
    span: number;
    text: string;
}
/**
 * The units a statement is looked for in: every line on its own, then every
 * line joined to its continuation. Fenced regions are joined by nobody — a
 * fenced copy is `cascadeBlocks()`'s job and joining two branch lines there
 * would report the same block twice.
 */
export declare function statementUnits(markdown: string): StatementUnit[];
/**
 * Every unit of `markdown` that states the cascade rather than consuming it.
 *
 * Single lines are considered before wrapped pairs, and a pair is dropped when
 * either of its two lines already reported on its own. So a statement that fits
 * on one line is reported once — never again as the head of the pair below it,
 * and never again as the tail of the pair above it.
 */
export declare function findCascadeStatements(markdown: string): CascadeStatement[];
/** One line of the reach claim, with the probes that keep it true. */
export interface ReachCase {
    /** The claim as a reader meets it, in `README-hooks.md` and here. */
    claim: string;
    /** Texts the claim is asserted against. Covered probes fire; holes do not. */
    probes: readonly string[];
    /**
     * For a hole left open on cost: what closing it would select across the
     * scanned set, outside the definition site. Both numbers are re-measured by
     * the suite and rendered into the README by `describeReach()`, because a
     * count is the one part of a claim that can be checked mechanically and this
     * project's counts are where its claims have slipped.
     */
    cost?: {
        readonly widening: string;
        readonly singleLine: number;
        readonly withWindow: number;
    };
}
/** A path the gate does not read, and what reading it would yield today. */
export interface ReachExclusion {
    /** Path or glob, relative to the plugin root. */
    glob: string;
    /** Measured, not assumed: does the gate select anything in these files? */
    measured: "clean" | "fires";
    /** Why it is out of the scanned set, in terms the measurement supports. */
    note: string;
}
/**
 * What the reach gate scans, catches, misses, and leaves out — the single
 * authoring home for all four. Every field is checked in
 * `domain-cascade.test.ts`: `fileSet` is what the gate actually enumerates,
 * each `covered` probe must fire, each `holes` probe must not, each `excluded`
 * glob must measure what it claims, and `README-hooks.md` must carry
 * `describeReach()` verbatim.
 */
export declare const REACH: {
    readonly fileSet: readonly ["agents/*.md", "skills/*/SKILL.md", "rules/*.md"];
    readonly covered: readonly [{
        readonly claim: string;
        readonly probes: readonly ["Use `data` when the data files outnumber the source files, otherwise `code`.", "Use \"data\" when the data files outnumber the source files, otherwise \"code\".", "Use 'data' when the data files outnumber the source files, otherwise 'code'.", "Use **data** when the data files outnumber the source files, otherwise **code**."];
    }, {
        readonly claim: string;
        readonly probes: readonly [string];
    }, {
        readonly claim: "A paraphrase written with the cascade's own variable names.";
        readonly probes: readonly ["`data` if data_files > code_files * 2, else `code` whenever code_files is above zero."];
    }, {
        readonly claim: string;
        readonly probes: readonly [string];
    }, {
        readonly claim: string;
        readonly probes: readonly [string];
    }];
    readonly holes: readonly [{
        readonly claim: string;
        readonly probes: readonly [string];
        readonly cost: {
            readonly widening: "matching bare words";
            readonly singleLine: 12;
            readonly withWindow: 12;
        };
    }, {
        readonly claim: string;
        readonly probes: readonly [string, "Pick `data` when the data files\noutnumber the source files, and\notherwise fall back to `code`."];
    }, {
        readonly claim: string;
        readonly probes: readonly ["`data` for ontology work, else `code`."];
    }, {
        readonly claim: string;
        readonly probes: readonly ["`data` when the schemas outnumber the modules, otherwise `code`."];
    }];
    readonly excluded: readonly [{
        readonly glob: "docs/*.md";
        readonly measured: "clean";
        readonly note: string;
    }, {
        readonly glob: "CLAUDE.md";
        readonly measured: "clean";
        readonly note: string;
    }, {
        readonly glob: "README-hooks.md";
        readonly measured: "clean";
        readonly note: string;
    }];
};
/**
 * The reach claim rendered as the markdown block `README-hooks.md` carries.
 * The test compares the file against this, so the two cannot drift.
 */
export declare function describeReach(): string;
