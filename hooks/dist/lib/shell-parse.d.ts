/**
 * Shell parsing primitives shared by the guard's classifiers.
 *
 * These functions used to live in `git-branch-guard.ts`. They are generic —
 * nothing about blanking a heredoc body or splitting on `&&` is git-specific —
 * and a second classifier (`bash-mutation-guard.ts`) consumes them, so a module
 * named for git should not own the lexer its sibling depends on.
 *
 * This module is PURE and EXPORTED so it is unit-testable without the hook
 * firing. It never touches the filesystem, the environment, or the process.
 *
 * ## Two quote modes
 *
 * The git classifier and the mutation classifier need OPPOSITE treatment of a
 * single-quoted region, so `parseCommand` takes the mode as a parameter:
 *
 *   - `"blank"` — a single-quoted body is replaced by spaces. Correct for the
 *     git classifier, where `echo 'git switch main'` is inert prose and the
 *     content must not be read as a command. This is the historical behaviour
 *     of `stripDataRegions`, preserved byte-for-byte.
 *
 *   - `"capture"` — a single-quoted region (quotes included) is replaced by an
 *     opaque placeholder token and the literal text is recorded in a side
 *     table. Correct for the mutation classifier, where `mv 'rules/x.md' /tmp/`
 *     carries an ordinary path that blanking would destroy. A DOUBLE-quoted
 *     span is captured on the same terms when it expands nothing — no `$`, no
 *     backtick, no backslash escape — because bash performs no redirection and
 *     no word splitting inside it either, and reading a `>` in a commit message
 *     as an operator is a false positive on prose.
 *
 * Capture mode keeps quoted content INERT by construction rather than by
 * blanking: the placeholder contains no whitespace and no shell operator, so
 * `echo 'mv rules/x.md /tmp'` tokenizes to exactly two words and `mv` is never
 * in command position. A placeholder can only ever REDUCE segmentation, never
 * introduce a segment or a command word that blanking would have hidden.
 *
 * The double-quoted capture is bounded ON PURPOSE by those three characters: a
 * span bash would expand stays code, so a hidden `$(…)` is still lifted into
 * its own segment and the fail-closed direction is unchanged.
 *
 * Quoted-delimiter heredoc bodies stay blanked in BOTH modes. They are data
 * that a command reads, never an operand that a command writes.
 *
 * ## What a lifted command substitution leaves behind
 *
 * A `$(…)` / backtick body is lifted out into its own segment, because it runs
 * as its own command. What lands in the OUTER segment at run time is the
 * substitution's VALUE, and the two modes want that value described
 * differently:
 *
 *   - `"blank"` — a single space, so the outer segmentation is exactly what it
 *     has always been. The git classifier asks only which commands run, and the
 *     substitution's value is never one of them.
 *
 *   - `"capture"` — `SUBSTITUTION_FILLER`, a token carrying a `$` so that
 *     `resolveWord` reports it `{ unresolved: true }`. A consumer enforcing a
 *     fail-closed rule needs the operand to still BE there and be unknowable;
 *     with a space it vanished instead, and `rm $(echo rules/x.md)` reached the
 *     mutation classifier as a bare `rm` with no operands while `rm $VAR`
 *     denied. The filler glues to its neighbours exactly as the value would, so
 *     `"$(pwd)/build"` stays one word.
 */
/**
 * What a lifted `$(…)` / backtick substitution leaves in the outer segment in
 * CAPTURE mode. It must contain a `$` (so `resolveWord` reports it unresolved),
 * no whitespace (so it glues to its neighbours the way the substitution's value
 * would), no segment operator, and no `=` (so it can never read as a leading
 * `VAR=value` assignment) — and it has to stay readable when a deny reason
 * quotes the segment back at a human. Blank mode keeps the historical space.
 *
 * EXPORTED because it carries a balanced `(`/`)` pair that is NOT shell grammar.
 * A consumer counting real subshell parentheses in a segment (the virtual-cwd
 * walk in `bash-mutation-guard.ts`) has to remove the filler first, and it must
 * not have to know the filler's spelling to do it.
 */
export declare const SUBSTITUTION_FILLER = "$(\u2026)";
/** How `parseCommand` treats single-quoted regions. */
export type QuotedMode = "blank" | "capture";
export interface ParseOptions {
    quoted: QuotedMode;
}
/**
 * The operator that joins a segment to the one before it AT ITS OWN NESTING
 * LEVEL. `"start"` is the first segment of a level — nothing ran before it.
 *
 * The distinction a consumer buys with this is the one bash makes: after `&&`
 * the previous segment is GUARANTEED to have succeeded, and after every other
 * operator it is not. A classifier that models a `cd` may only carry the model
 * across a `&&`; across `;`, `||`, `|`, `&` or a newline the shell runs the next
 * segment from wherever it never left
 * (`decisions/260803-2338_i_should-the-guard-degrade-its-directory-model-after-a-cd-it-cannot-prove-succeeded.md`).
 *
 * Only `&&` is a guarantee, so a reader that wants one should test for `&&`
 * rather than enumerate the others: a future operator added here is then
 * unguaranteed by default, which is the fail-closed direction.
 *
 * Two precisions, both learned the hard way:
 *
 * 1. **A newline AFTER `&&` does not make the joiner `newline`.** Bash's
 *    grammar is `and_or : and_or AND_AND newline_list pipeline`, so the
 *    newlines sit inside the operator. An ordinary multi-line chain
 *    (`cd hooks &&\n  npm run build &&\n  rm -rf dist`) carries `&&` on every
 *    segment, exactly as its single-line form does. See the `flush` comment.
 * 2. **`&&` guarantees the AND-OR LIST to its left, not the previous
 *    SEGMENT.** A flat list evaluates left to right, so `A || B && C` is
 *    `(A || B) && C` — reaching `C` proves the list returned zero and says
 *    nothing about whether `B` ran. `|` does not reach past `&&` either, and a
 *    pipeline element runs in a bash subshell. A consumer that reads this field
 *    as "the previous segment ran" is wrong in both shapes; both are open and
 *    argued in
 *    `circles/260801-1244-guard-rules-write/decisions/260804-0947_o_should-the-joiner-be-consulted-for-the-segment-that-moves-as-well-as-the-one-that-writes.md`.
 */
export type SegmentJoiner = "start" | "&&" | "||" | ";" | "|" | "&" | "newline";
export interface ParsedSegment {
    /** The segment's text, trimmed. Carries placeholders in capture mode. */
    text: string;
    /** 0 = outer command, >= 1 = body of a `$(…)` / backtick subshell. */
    depth: number;
    /** How this segment is joined to the previous one. See `SegmentJoiner`. */
    joiner: SegmentJoiner;
}
export interface ParsedCommand {
    /** Segments in SOURCE ORDER (by their start offset in the command). */
    segments: ParsedSegment[];
    /** Placeholder token -> the single-quoted literal it stands for. Empty in blank mode. */
    literals: Map<string, string>;
}
/**
 * The outcome of resolving one word to a static literal.
 * `{ value }` when the word is knowable without running the shell,
 * `{ unresolved: true }` when it is not (expansion, substitution, `~`).
 */
export type ResolvedWord = {
    value: string;
    unresolved?: undefined;
} | {
    value?: undefined;
    unresolved: true;
};
/**
 * Blank shell data regions (single-quoted strings, quoted-delimiter heredoc
 * bodies) so only executable code reaches the segmenter. The historical
 * entry point, kept under its original name and behaviour for the git
 * classifier and its suite. New consumers want `parseCommand`.
 */
export declare function stripDataRegions(command: string): string;
/**
 * Split a command string into the segments that each run as their own command.
 * Segments on `;`, `&&`, `||`, `|`, `&` and newlines. Also recursively inspects
 * the *contents* of `$(...)` and backtick subshells (their inner commands run
 * too).
 *
 * This is a deliberately conservative lexer: it does not try to be a full
 * shell parser. It over-segments rather than under-segments, which is the
 * fail-closed direction.
 *
 * NOTE: callers that start from a raw Bash command string should pass it
 * through `stripDataRegions()` first (as `classifyGitCommand` does) so that
 * inert data regions — single-quoted strings and quoted-delimiter heredoc
 * bodies — do not get mis-parsed as command substitution.
 *
 * This is the FLAT, unordered form: subshell bodies come back ahead of the
 * outer segments they were lifted out of, and nesting depth is lost. It is
 * retained verbatim as the git classifier's segmenter — that classifier only
 * asks whether ANY segment denies, so order and depth are invisible to it, and
 * leaving it untouched is what makes the extraction provably behaviour-neutral.
 * `parseCommand` re-derives the same segments in source order with depth; a
 * unit test pins the two against each other. A consumer that needs order or
 * depth (a virtual-cwd walk, for one) must use `parseCommand`.
 */
export declare function extractCommandSegments(command: string): string[];
/**
 * Tokenize a single segment into whitespace-separated words, with the
 * parentheses of a `(…)` subshell removed (`stripSubshellParens`). A word that
 * was NOTHING but parentheses disappears, which is what the spaced form
 * `( rm x )` should leave behind.
 *
 * The strip lives here rather than in either classifier because both consume
 * this function and both had the hole. It leaves the SEGMENTER untouched, which
 * is what keeps the change contained: blank mode still reproduces the historical
 * segmentation byte for byte, and the subshell-scope counter in
 * `bash-mutation-guard.ts` reads a segment's raw TEXT rather than its tokens, so
 * it still sees every parenthesis it has to balance.
 */
export declare function tokenize(segment: string): string[];
/**
 * Parse a Bash command string into ordered, depth-tagged segments.
 *
 * `quoted: "blank"` reproduces `extractCommandSegments(stripDataRegions(cmd))`
 * — the same segments, now in source order and carrying their subshell depth
 * and their JOINER. `quoted: "capture"` additionally hands back the
 * single-quoted literals, so a consumer can read a quoted path as a path, and
 * leaves an unresolvable filler where a lifted `$(…)` stood instead of a space
 * (see the module docstring).
 *
 * The git classifier does not come through here — it consumes
 * `extractCommandSegments(stripDataRegions(cmd))`, which is a separate function
 * left byte-identical on purpose. So a field added to `ParsedSegment` reaches
 * the mutation classifier and nothing else, and the equivalence test below the
 * two still compares only what both produce: the segment TEXT.
 */
export declare function parseCommand(command: string, options: ParseOptions): ParsedCommand;
/**
 * Resolve one word from a parsed segment to the static literal it denotes.
 *
 * Reports `{ unresolved: true }` when the word's value cannot be known without
 * running the shell — it still contains `$` (parameter or arithmetic
 * expansion), a backtick (command substitution), or a leading `~` (home
 * expansion). A caller enforcing a fail-closed rule treats that as "could be
 * anything, including a protected path".
 *
 * Placeholders minted by capture mode expand to their literal text FIRST-CLASS:
 * `'$HOME'` was single-quoted, so it denotes a file literally named `$HOME` and
 * the `$` in it is not an expansion. Only characters that survived in CODE
 * position make a word unresolved.
 *
 * Surrounding double quotes are dropped when nothing inside them expands, so
 * `"plain.txt"` resolves to `plain.txt`, and a backslash escape in code
 * position is removed the way bash removes it, so `\rm` resolves to `rm`. That
 * second one is load-bearing for the CALLER'S command word: an unprocessed
 * escape does not merely shorten a path there, it renames the program out of
 * whatever table the caller is about to consult.
 */
export declare function resolveWord(token: string, literals: Map<string, string>): ResolvedWord;
