/**
 * Shell parsing primitives for the guard's git branch policy.
 *
 * These functions used to live in `git-branch-guard.ts`. They are generic —
 * nothing about blanking a heredoc body or splitting on `&&` is git-specific —
 * and a second classifier consumed them for a while, so a module named for git
 * should not own the lexer. That second consumer is gone; the lexer stays here,
 * because the split is what keeps the git policy free of lexing detail and its
 * suite able to test the two apart.
 *
 * This module is PURE and EXPORTED so it is unit-testable without the hook
 * firing. It never touches the filesystem, the environment, or the process.
 *
 * ## One quote mode: data is blanked
 *
 * A single-quoted region is replaced by spaces, because `echo 'git switch main'`
 * is inert prose and its content must not be read as a command. So is a
 * quoted-delimiter heredoc body — data a command reads, never a command.
 * Regions where bash DOES expand (a double-quoted span carrying `$`, a
 * backtick or an escape; an unquoted-delimiter heredoc body) are preserved
 * verbatim, so a real hidden command still gets classified. That is the
 * fail-closed direction and it must not flip.
 *
 * There used to be a second, opposite mode. A retired mutation classifier
 * needed a single-quoted region kept as an ordinary path (`mv 'rules/x.md'
 * /tmp/`) rather than erased, so the parser took the mode as a parameter and
 * minted placeholder tokens for the captured literals. Nothing needs that
 * reading any more, and the parameter, the placeholders and the ordered,
 * depth-tagged parse built on top of them are gone with it. What survives is
 * the flat blank-mode path the git policy has always used, byte for byte.
 *
 * `resolveWord` still takes a literal table, and it is still the seam that mode
 * was threaded through. The git policy passes an empty map (`NO_LITERALS` in
 * `git-branch-guard.ts`), which is the whole of it today.
 *
 * A `$(…)` / backtick body is lifted out into its own segment, because it runs
 * as its own command, and a single space is left where it stood. The git policy
 * asks only which commands run, and a substitution's VALUE is never one of them.
 */
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
 * bodies) so only executable code reaches the segmenter. The entry point the
 * git classifier and its suite consume, kept under its original name and
 * behaviour.
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
 * An ordered, depth-tagged parser used to sit beside it for a consumer that
 * needed a virtual-cwd walk; it is gone, and this is the only segmenter now.
 */
export declare function extractCommandSegments(command: string): string[];
/**
 * Tokenize a single segment into whitespace-separated words, with the
 * parentheses of a `(…)` subshell removed (`stripSubshellParens`). A word that
 * was NOTHING but parentheses disappears, which is what the spaced form
 * `( rm x )` should leave behind.
 *
 * The strip lives here rather than in the classifier because it is a lexing
 * question, not a policy one. It leaves the SEGMENTER untouched, which is what
 * keeps the change contained: the segmentation is still byte-for-byte what it
 * always was.
 */
export declare function tokenize(segment: string): string[];
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
