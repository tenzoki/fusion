/**
 * The citation sweep: rewrite store-prefixed citations to the storeless form,
 * and repair what an earlier version of this program broke.
 *
 * The grammar is `lib/citation-scan.ts`, the one tokeniser the checker
 * (`citation-check.ts`) and fusion's own gates run, so no second detector
 * exists (Circle `260828-2342-citation-form-drops-store-segment`, plan step 3).
 * Shipped as `bin/fusion-citation-sweep` since decision
 * `260829-1623_*_does-fusion-ship-the-citation-sweep-or-only-the-checker-and-under-which-guards.md`
 * (option 2). It lived as a `.mjs` script under `hooks/scripts/` until then, one
 * script only a checkout with `node_modules` could run; it is compiled now so
 * the install tarball runs it like every other helper. **No fusion pipeline
 * or skill runs it**: `/fusion:cleanup` prints the checker's verdict and
 * stops there, and a person runs the sweep by hand after reading its census.
 *
 * ## Usage
 *
 *   fusion-citation-sweep [--root <workbench>] [--dry-run | --write [--yes]] [--repair] [<path>...]
 *
 *   --root <dir>   the workbench to index and sweep; default: walk up from
 *                  cwd to the directory holding `fusion-workbench/.fusion-setup`
 *   --dry-run      the default: print the census and write nothing
 *   --write        apply the rewrites, behind the three guards below
 *   --yes          the second guard's answer; without it `--write` prints the
 *                  census and writes nothing
 *   --repair       the repair pass (below) instead of the sweep; combines with
 *                  `--write` / `--dry-run` / `--yes` the same way
 *   <path>...      files or directories to sweep BEYOND the workbench (a
 *                  project's shipped text); a directory is walked for `*.md`,
 *                  a file is taken as named whatever its extension
 *
 * ## The three guards on a writing mode
 *
 * A sweep over a workbench touches every record in it, and fusion's own first
 * run rewrote 42 head fields and left 239 chained tails before a repair Turn
 * (issues
 * `260829-1346_*_the-committed-sweep-rewrote-29-date-head-fields-into-filenames-and-left-181-chained-tails-in-the-tree.md`
 * and
 * `260829-1347_*_the-grammars-marker-slot-is-one-letter-while-24-indexed-artifacts-carry-a-word-there-and-the-stamp-bare-rewrite-checks-no-boundary.md`).
 * Three guards stand between `--write` and the tree, each evaluated before a
 * byte is written:
 *
 *   (a) The workbench must be inside a git work tree and tracked by it
 *       (`git ls-files --error-unmatch <workbench>`), any extra `<path>` must
 *       sit inside that same work tree, and **no uncommitted change may name a
 *       file this run will read**. That last is the corpus question, not a
 *       clean-tree question: the corpus is the one `main()` builds, every
 *       `*.md` under the workbench plus each extra `<path>` resolved the way
 *       `main()` resolves it, computed once and handed to the guard so the
 *       guard and the run cannot disagree about what will be written. A
 *       failure is one line on stderr naming the condition, and the offending
 *       paths where it has them, and exit 4: without a commit to return to, a
 *       damaged rewrite has no way back, and a change already standing in a
 *       file the sweep rewrites would mix the two into one diff.
 *
 *       It asks about the corpus because a clean tree is not reachable here.
 *       `fusion-workbench/orchestrator-events.jsonl` is tracked (class R2 in
 *       `rules/workbench-tracking.md`) and `bin/fusion-commit-lock` appends
 *       the machine-written `commit` row to it after every commit, so inside
 *       an orchestrator session the tree is dirty again the moment it is
 *       committed and a clean-tree test can never be satisfied. That test was
 *       a proxy for the property guard (a) exists for, namely that a damaged
 *       rewrite has one revert back and the sweep's diff is its own; this is
 *       the property itself. The event log is not markdown, so it leaves the
 *       question by construction rather than through an exemption somebody has
 *       to maintain. Binding decision:
 *       `260830-1843_*_how-does-the-commit-lock-stop-leaving-the-tree-it-just-committed-dirty.md`
 *       (option 4), whose point is that `bin/fusion-commit-lock` and
 *       `rules/commit-lock.md` are not edited: the other three options each
 *       traded away a property that rule mandates.
 *
 *       Three mechanics of the reading, stated here because the code alone
 *       leaves them to be inferred. The listing is taken with `git status
 *       --porcelain -z`, so a path is never quoted or C-escaped and a rename
 *       arrives as two NUL-separated fields, both of which are compared
 *       (`R  old -> new` in the unquoted form). An untracked directory entry
 *       (`?? dir/`) counts when any corpus file sits beneath it. And a
 *       **deleted** corpus file does not refuse: the run cannot read a file
 *       that is not there, so it falls outside the question this guard asks.
 *   (b) The census is printed first, in full, and nothing is written unless
 *       `--yes` was passed. Without it the run ends in one stderr line and
 *       exit 5, so a person reads what would move before it moves.
 *   (c) There is no bare-stamp resolution, and no option turns one on. A bare
 *       stamp names a minute, not a file; the rule that expanded a uniquely
 *       matching one into that file's basename acted on the class the
 *       scanner's own `partition()` refuses to judge, and it produced every
 *       corrupted token the v10.20.0 sweep left in fusion's workbench: 38 head
 *       fields (`**Date:**`, `**Started:**`, `**Stamp:**`, ...) turned into
 *       self-citations, and every chained tail the repair pass counts. The
 *       grammar refuses the shapes that fed it, and the rule is gone rather
 *       than bounded: with it, `--dry-run` over a swept tree could not reach
 *       `rewrites=0` while a terminal record kept a bare stamp on purpose.
 *
 * A dry run needs none of the three and runs anywhere the workbench does.
 *
 * ## What the sweep rewrites, per token kind
 *
 * Only where the scanner's status is not `exempt` (fenced code, blockquote
 * lines, footer templates, announced illustrations, placeholders, fabricated
 * names, globs, head fields, the example files):
 *
 *   record          -> `<stamp>_*_<slug>...`  the store segment is dropped and
 *                                             a literal marker becomes `_*_`;
 *                                             a token with no marker keeps its tail
 *   circle-record   -> `<stamp>-<slug>`       the bare Circle-directory name
 *   circle-dir      -> `<stamp>-<slug>`       the same
 *   bare-record     -> `_*_` at the marker    only when the marker is literal; a
 *                                             truncated citation (`<stamp>_o_`,
 *                                             `<stamp>_d`) is one token and is
 *                                             rewritten whole or left whole
 *   stamp-bare      -> never rewritten; listed with its status
 *
 * Tokens are spliced right to left within a line, so earlier columns stay
 * valid; nothing but the token span is touched. `.ts` files under
 * `lib/__tests__` are never rewritten: their store-prefixed strings are
 * fixtures the tests assert on.
 *
 * ## The visibility guard: no rewrite may escape the grammar
 *
 * Every rewrite the table above computes is then handed back to the SAME
 * scanner that produced the token, alone on a line, and is applied only when
 * that scan yields exactly one hit whose token is the whole string, whose kind
 * the gates judge (`GATE_KINDS`) and whose status is not `exempt`. Otherwise
 * the token is left exactly as it stands.
 *
 * It is one property rather than a list of shapes, and that is the point. A
 * rewrite that the grammar cannot read back is strictly worse than no rewrite:
 * the pointer stops resolving AND stops being reported, so the defect leaves
 * the checker's output at the moment it is created. The measured case is the
 * pre-v4 bracket marker — `<store>/<stamp>[o]-<slug>.md` rewrote to the bare
 * stamp with `[o]-<slug>.md` left standing beside it, and `STAMP_RE`'s boundary
 * then refused the result entirely — but the guard is not written against that
 * shape and names none: asking the question from the other side subsumes every
 * future shape whose rewrite would escape the grammar, instead of enumerating
 * the two known today (`rules/critical-stance.md` §2, one integral rule rather
 * than a rim of special cases).
 *
 * Cost, since the guard runs per candidate rewrite: it reuses the run's one
 * memoised scanner, so it re-walks neither the workbench index nor the Circle
 * directory index, and it is evaluated only after a candidate exists — a token
 * the table leaves alone never reaches it.
 *
 * What the guard deliberately does NOT do is make the bracket form rewritable.
 * The grammar reads such a citation whole and reports it; resolving one is a
 * separate open question, `/fusion:migrate` not having converted the frozen
 * stores:
 * `260830-1842_*_may-the-grammar-resolve-a-bracket-marked-record-that-a-frozen-store-keeps-permanently.md`.
 *
 * Output: one `<file>  rewrites=<n>` line per touched file, then the
 * residual (every bare stamp the scanner judged, in file order,
 * `<file>:<line>  '<token>'  <status>`; an exempt one is not listed), then
 * one summary line, `files=<n> rewrites=<n> residual=<n> record=<n>
 * circle-record=<n> circle-dir=<n> bare-record=<n> stamp-bare=<n>
 * mode=<dry-run|write>`, the per-kind figures being what the commit message
 * that lands a sweep names. `stamp-bare=` is always 0 since the rule went and
 * is kept so the line's shape is stable. The summary line reads `mode=write`
 * only when files were written; a `--write` run stopped by guard (b) prints
 * `mode=dry-run`, because that is what it was.
 *
 * ## The repair pass (`--repair`)
 *
 * Undoes what the retired bare-stamp rule did, token by token and nothing
 * else, over every file the sweep would read (`archive/` and terminal records
 * included, because the damage reached them). Three classes, each keyed on
 * the workbench index rather than on a diff, so the pass is runnable in any
 * workbench the v10.20.0 sweep touched:
 *
 *   date-field   `**<Field>:** <basename>` where the basename names the record
 *                itself (`<stamp>-<slug>.md` or `<stamp>_coder_<slug>.md`, the
 *                two legacy history shapes) -> `**<Field>:** <stamp>`. A
 *                self-naming date is the one thing that line can have been.
 *   chained-tail `<basename>.md<tail>` where `<basename>.md` (with `_*_` read
 *                as any letter) is in the index and `<tail>` is `_<x>`, `_<x>_`,
 *                `_...<anything>`, `_<word>_<anything>`, `[<x>]-<slug>` or a
 *                second `.md` -> `<basename>.md`. A line-anchor `:<n>` after
 *                the tail survives. One shape is deliberately excluded: a tail
 *                that is itself a complete filename with an extension other
 *                than `.md` (one `_observations.txt` tail, once) was a
 *                different file's name before the sweep and is restored to it.
 *   doubled      the `_<word>_` case of `chained-tail`, counted apart so the
 *                figure reconciles with the issue that named 6.
 *
 * Fenced and blockquoted lines are left alone (an exhibit of the fault is not
 * an instance of it). Output: `<file>:<line>  '<from>' -> '<to>'  <class>` per
 * token, then `files=<n> repairs=<n> date-field=<n> chained-tail=<n>
 * doubled=<n> mode=<dry-run|write>`.
 *
 * ## Exit codes
 *
 *   0  ran; in a writing mode, wrote.
 *   1  usage error.
 *   2  no workbench (no `fusion-workbench/.fusion-setup` above cwd and no
 *      `--root`, or `--root` names no workbench).
 *   3  the compiled hooks are missing; `bin/fusion-citation-sweep` raises it
 *      before this file is reached.
 *   4  guard (a) refused: not a git work tree, workbench untracked, an
 *      uncommitted change on a file in this run's corpus, or an extra path
 *      outside the work tree. Nothing written.
 *   5  guard (b) refused: `--write` without `--yes`. The census was printed;
 *      nothing written.
 */
export {};
