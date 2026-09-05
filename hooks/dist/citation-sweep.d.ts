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
 * ## The declared corpus
 *
 * Since 2026-08-31 the run also reads every file the project DECLARED as
 * citation-bearing in `citations.extraPaths` in its `fusion.json`, resolved by
 * `declaredCitationFiles()` against `dirname(--root)` and deduplicated by
 * absolute path. They join the corpus at the same place a `<path>` argument
 * does, BEFORE guard (a) is asked, so the guard covers them with no new guard
 * code. The loader's diagnostics and one line per pattern that matched nothing
 * or was refused go to stderr; the summary line below is untouched by any of
 * it, byte for byte, because `lib/__tests__/citation-sweep.test.ts` pins it as
 * a release gate. A project that declares nothing sweeps exactly what it swept
 * before.
 *
 * `citation-check.ts` resolves the same leaf through the same function: the
 * two hand-run helpers share one corpus, because a reporter narrower than the
 * rewriter is how this program came to change files the checker then declared
 * clean. `lib/__tests__/workbench-citation-lint.test.ts` deliberately does not
 * read the declaration and is not to be made to — that gate has no approvable
 * baseline and runs in everyone's `npm test`, so a corpus set by an editable
 * configuration leaf would redden the suite of somebody who edited nothing.
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
 *       sit inside that same work tree **and be tracked by it**, asked with
 *       that same `git ls-files --error-unmatch`, and **no uncommitted change
 *       may name a file this run will read**. That last is the corpus question, not a
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
 *       The extra-path half asked only whether the path sat inside the work
 *       tree until 2026-08-31, and inside is not tracked: only tracked gives
 *       the revert. Measured on a real run that day, a sweep pointed at 89
 *       code files in a consuming project rewrote all 89, of which 79 were
 *       tracked and 10 sat under a gitignored build-output directory with no
 *       committed version to return to — harmless there because build output
 *       is regenerated, harmless by luck rather than by construction (issue
 *       `260831-0015_*_the-sweeps-guard-a-does-not-check-that-an-extra-path-argument-is-tracked.md`).
 *       Declared files need no such check and get none: `git ls-files` cannot
 *       name an untracked or ignored file, so the route `## The declared
 *       corpus` describes is tracked by construction and only a hand-passed
 *       `<path>` reaches this branch. A `<path>` naming a DIRECTORY is asked
 *       exactly the question the workbench is asked and carries the same
 *       residual: a directory holding anything git tracks passes, and an
 *       untracked `*.md` beneath it is still rewritten with no way back. The
 *       check is per argument and never widens to "everything under the work
 *       tree must be tracked": a project may legitimately leave its workbench
 *       untracked, and that choice is the project's
 *       (`rules/workbench-tracking.md`).
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
 * Only where the scanner reported NO exemption reason — fenced code, blockquote
 * lines, footer templates, announced illustrations, placeholders, fabricated
 * names, globs, head fields, the example files and the layout-conversion file.
 * The reason and not the status is what holds the sweep off: a fenced or
 * worked-example token whose SHAPE is store-prefixed is judged by the gate and
 * still carries its reason here, because rewriting a verbatim exhibit deletes
 * the finding it exists to show:
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
 * ## One spelling per corpus file, anchored on the project root
 *
 * Every file is named `relative(<project root>, <abs>)`, the anchor
 * `citation-check.ts` names its whole corpus by (`fusion-workbench/<rel>`,
 * `CLAUDE.md`, `rules/<f>`, `docs/<rel>`, and a declared path as the project
 * declared it). It is the scan key and the display name both, because
 * `scanCitationTokens()` keys `RECORD_EXAMPLE_FILES` and
 * `RETIRED_LAYOUT_FILES` on it: a cwd-relative spelling made this program's
 * file-wide exemptions fire only from the project root while the checker's
 * fired from anywhere, which is one file under two names inside a corpus the
 * two helpers share (issue
 * `260901-0324_*_the-checker-and-the-sweep-key-file-exemptions-on-two-different-spellings-of-the-same-file.md`).
 * No realpath is taken for it, the checker taking none either; `real()` still
 * serves the guard and the deduplication, which compare paths rather than name
 * them.
 *
 * Output: one `<file>  rewrites=<n>` line per touched file, then the
 * residual (every bare stamp the scanner judged, in file order — the corpus
 * order the census lines above them use, and by line within a file; an exempt
 * one is not listed) as `<file>:<line>  '<token>'  <status>`, then
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
 * Undoes what an earlier sweep did, token by token and nothing else, over every
 * file the sweep would read (`archive/` and terminal records included, because
 * the damage reached them). Four classes, each keyed on the workbench index
 * rather than on a diff, so the pass is runnable in any workbench the v10.20.0
 * sweep touched. The first three undo the retired bare-stamp rule; the fourth
 * undoes one half of the splice the unanchored store patterns produced, and
 * `## The splice damage` below is why it is one half and not both:
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
 *   spliced-prefix
 *                a run of LETTERS fused to the front of a storeless basename
 *                (`<letters><stamp>_<x>_<slug>.md`, `<letters><stamp>-<slug>`)
 *                -> the basename alone. The letter run must itself begin at a
 *                non-path boundary, and the basename must name a record or a
 *                Circle directory the index holds AND read back through the
 *                grammar whole.
 *
 * Fenced and blockquoted lines are left alone (an exhibit of the fault is not
 * an instance of it). A line is repaired to a FIXPOINT, because one token can
 * carry two damages at once: a glued prefix hides its own chained tail from
 * `CHAINED_RE`'s lookbehind, so a single pass would leave the second damage for
 * a second run and `--repair` would not be idempotent. Every repair strictly
 * shortens the line, so the walk terminates; the pass bound is belt to that
 * brace. Output: `<file>:<line>  '<from>' -> '<to>'  <class>` per token, then
 * `files=<n> repairs=<n> date-field=<n> chained-tail=<n> doubled=<n>
 * spliced-prefix=<n> mode=<dry-run|write>`.
 *
 * ## The splice damage, and why exactly one half of it repairs
 *
 * Until `cbc1d9fb` the three store-prefixed patterns carried no left boundary,
 * so a store name was recognised wherever it stood and the sweep spliced the
 * storeless basename in at the token's own column, leaving everything to the
 * left of the store segment standing. Two shapes came out of that, and they are
 * not one problem:
 *
 *   a letter run fused to the stamp, from a directory whose NAME ends in a
 *   store name. What survives is the head of one path segment, cut where the
 *   store name began. It is not a path and cannot become one: it is the broken
 *   half of a segment, and no rooting the layout admits ends in a letter, which
 *   is what makes the damage decidable from the token alone. Deleting it is
 *   what `spliced-prefix` does, and the token that remains is the storeless
 *   citation the sweep meant to write.
 *
 *   a complete path segment in front of the stamp, from a store name that
 *   occupied a whole segment. What survives is a WHOLE path, terminated by its
 *   own `/`, and what was removed sits inside it. That is not recoverable: the
 *   token does not say which store stood there, nor whether a
 *   `fusion-workbench/` or a `shared/` stood with it, and the index cannot say
 *   either, because the record may have been archived since. Any rule that
 *   dropped the surviving segment would delete text the damage did not touch,
 *   and any rule that inserted a store would be guessing. `rules/critical-stance.md`
 *   §4: the mechanism changes rather than the approximation improving, and the
 *   mechanism is the project's own git history.
 *
 * No detector is shipped for the second shape either, and that is deliberate
 * rather than unfinished. Telling a spliced foreign path from a foreign path
 * somebody wrote on purpose is the same undecidable question as the one that
 * caused the damage, so a count would be a guess with a number in front of it.
 *
 * ### Recovering the second shape from git
 *
 * The sweep's guard (a) is what guarantees this works: a writing run refuses
 * unless the workbench is tracked and no pending change names a file it reads,
 * so the damage is always exactly one diff away from the text before it.
 *
 *   1. Find the commit that ran the sweep. It is the one whose diff turns
 *      `<store>/<stamp>…` into `<stamp>…` across many files at once:
 *
 *        git log --oneline -S'fusion-workbench/shared' -- fusion-workbench
 *
 *      or, if the commit message named it, `git log --oneline --grep=citation`.
 *      Call it `<sweep>`.
 *   2. See what it removed, and read the two sides side by side:
 *
 *        git diff <sweep>^ <sweep> -- fusion-workbench | grep -E '^[-+].*[0-9]{6}-[0-9]{4}'
 *
 *      Every `-` line carries the original spelling. A `-` line whose citation
 *      sat behind a path that is NOT one of `shared/`, `circles/<dir>/`,
 *      `archive/<sweep-dir>/` or a bare `<stamp>-<slug>/` Circle directory is
 *      an instance of this shape.
 *   3. Restore one file to its pre-sweep text, edit the citations by hand
 *      against what step 2 showed, and keep everything else the sweep did:
 *
 *        git show <sweep>^:<path> > <path>
 *
 *      A whole-tree revert is the wrong tool here. The same commit made a large
 *      number of CORRECT rewrites, and `git revert <sweep>` would take those
 *      back with the damage.
 *   4. Re-run `bin/fusion-citation-sweep --dry-run` afterwards. A citation you
 *      restored to its store-prefixed spelling is reported again, and one more
 *      `--write` puts it in the storeless form with the anchored patterns that
 *      landed at `cbc1d9fb`, which cannot splice.
 *
 * If the sweep's commit is not in your history at all, the text is gone and no
 * program in this tree can reconstruct it. That is the honest end of this
 * remedy, and it is why guard (a) refuses to write into an untracked workbench.
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
 *      outside the work tree or untracked by it. Nothing written.
 *   5  guard (b) refused: `--write` without `--yes`. The census was printed;
 *      nothing written.
 */
export {};
