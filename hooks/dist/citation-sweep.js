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
 *      outside the work tree or untracked by it. Nothing written.
 *   5  guard (b) refused: `--write` without `--yes`. The census was printed;
 *      nothing written.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { createScanner, declaredCitationFiles, declaredCitationNotes, fencedContentLines, GATE_KINDS, markdownFilesUnder, MARKER_SLOT, } from "./lib/citation-scan.js";
import { loadConfig } from "./lib/config.js";
import { findWorkbenchRoot } from "./lib/workbench-root.js";
import { exitZeroOnStdoutEpipe } from "./lib/fail-open.js";
// The reader may close stdout first; see exitZeroOnStdoutEpipe.
exitZeroOnStdoutEpipe();
const NAME = "fusion-citation-sweep";
const USAGE = `usage: ${NAME} [--root <workbench>] [--dry-run | --write [--yes]] [--repair] [<path>...]`;
function usage(msg) {
    process.stderr.write(`${NAME}: ${msg}\n${USAGE}\n`);
    process.exit(1);
}
function parse(argv) {
    let root = null;
    let write = false;
    let yes = false;
    let repair = false;
    const extra = [];
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === "--root") {
            const next = argv[++i];
            if (next === undefined)
                usage("--root needs a directory");
            root = next;
        }
        else if (a === "--write")
            write = true;
        else if (a === "--dry-run")
            write = false;
        else if (a === "--yes")
            yes = true;
        else if (a === "--repair")
            repair = true;
        else if (a.startsWith("--"))
            usage(`unknown option ${a}`);
        else
            extra.push(a);
    }
    if (root === null) {
        const project = findWorkbenchRoot();
        if (project !== null)
            root = join(project, "fusion-workbench");
    }
    if (root === null || !existsSync(join(root, ".fusion-setup"))) {
        process.stderr.write(`${NAME}: no workbench (no fusion-workbench/.fusion-setup above cwd; pass --root)\n`);
        process.exit(2);
    }
    return { root: resolve(root), write, yes, repair, extra };
}
// --- guard (a): a tracked workbench, and no pending change in its corpus -----
function git(cwd, ...args) {
    const r = spawnSync("git", args, { cwd, encoding: "utf-8" });
    return { status: r.status, stdout: r.stdout ?? "", failed: r.error !== undefined };
}
/** A path as the filesystem spells it, falling back for one that is not there. */
function real(p) {
    try {
        return realpathSync(p);
    }
    catch {
        return resolve(p);
    }
}
/**
 * Every path `git status --porcelain -z` names, work-tree-relative. `-z` is
 * what keeps this a split rather than a parse: no quoting, no C-escapes, and a
 * rename or copy carries its original path as the next NUL-separated field
 * instead of the ` -> ` infix the quoted form uses. Both halves are returned.
 */
function porcelainPaths(toplevel) {
    const fields = git(toplevel, "status", "--porcelain", "-z").stdout.split("\0").filter((f) => f.length > 0);
    const out = [];
    for (let i = 0; i < fields.length; i++) {
        const f = fields[i];
        out.push(f.slice(3)); // `XY <path>`
        if (/[RC]/.test(f.slice(0, 2))) {
            const orig = fields[++i];
            if (orig !== undefined)
                out.push(orig);
        }
    }
    return out;
}
/**
 * The porcelain entries that name a file this run will read, sorted. Porcelain
 * is work-tree-relative and the corpus is absolute, so both are resolved
 * through the filesystem's own spelling before they are compared: the toplevel
 * is already a realpath, and a corpus entry may have been reached through a
 * symlinked `--root`.
 */
function dirtyCorpusPaths(toplevel, corpus) {
    const files = new Set(corpus.map(real));
    const hits = new Set();
    for (const p of porcelainPaths(toplevel)) {
        const abs = resolve(toplevel, p);
        if (p.endsWith("/")) {
            // an untracked directory stands for every corpus file beneath it
            for (const f of files)
                if (f.startsWith(abs + sep))
                    hits.add(p);
        }
        else if (files.has(abs))
            hits.add(p);
    }
    return [...hits].sort();
}
/** One line naming the refused condition, or null when the tree qualifies. */
function refusal(root, extra, corpus) {
    const top = git(root, "rev-parse", "--show-toplevel");
    if (top.failed)
        return `refused (no-git): git could not be run, so no commit exists to return to; nothing written`;
    if (top.status !== 0) {
        return `refused (not-a-git-work-tree): ${root} is not inside a git work tree, so a rewrite there has no way back; nothing written`;
    }
    const toplevel = realpathSync(top.stdout.trim());
    const wbRel = relative(toplevel, realpathSync(root));
    const tracked = git(toplevel, "ls-files", "--error-unmatch", "--", wbRel === "" ? "." : wbRel);
    if (tracked.status !== 0) {
        return `refused (workbench-untracked): ${wbRel || "."} is not tracked by git (git ls-files --error-unmatch), so a rewrite there has no way back; nothing written`;
    }
    const dirty = dirtyCorpusPaths(toplevel, corpus);
    if (dirty.length > 0) {
        const named = dirty.slice(0, 10).join(", ") + (dirty.length > 10 ? `, and ${dirty.length - 10} more` : "");
        return `refused (dirty-tree): uncommitted changes name ${dirty.length} ${dirty.length === 1 ? "file" : "files"} this run reads: ${named}; commit or stash them first, so the sweep is its own diff and the way back is one revert; nothing written`;
    }
    // inside the work tree AND tracked by it: see the header's guard (a) block
    const untracked = [];
    for (const p of extra) {
        const abs = realpathSync(resolve(p));
        const rel = relative(toplevel, abs);
        if (rel.startsWith("..") || resolve(toplevel, rel) !== abs) {
            return `refused (path-outside-repo): ${p} is not inside the work tree at ${toplevel}, so its rewrite would have no way back; nothing written`;
        }
        if (git(toplevel, "ls-files", "--error-unmatch", "--", rel === "" ? "." : rel).status !== 0) {
            untracked.push(rel === "" ? "." : rel);
        }
    }
    if (untracked.length > 0) {
        const one = untracked.length === 1;
        const named = untracked.slice(0, 10).join(", ") + (untracked.length > 10 ? `, and ${untracked.length - 10} more` : "");
        return `refused (path-untracked): git does not track ${untracked.length} ${one ? "path" : "paths"} this run would rewrite: ${named}; commit ${one ? "it" : "them"} first, so a damaged rewrite has one revert back; nothing written`;
    }
    return null;
}
// --- the sweep ---------------------------------------------------------------
/**
 * The rel a rewrite is probed under. Any name outside `RECORD_EXAMPLE_FILES`
 * does; naming it here is what keeps the probe from inheriting a file-wide
 * exemption that has nothing to do with the string being judged.
 */
const REWRITE_PROBE = "<rewrite-probe>";
/**
 * Whether the grammar reads the rewritten string back WHOLE: one token, its own
 * whole span, a kind the gates judge, and not exempt. The guard the header's
 * visibility section states, asked of the output rather than of the shapes that
 * could produce it. The scanner is the run's own, so both its indexes are
 * already built and this costs no directory walk.
 */
function readsBackWhole(scanner, rewritten) {
    const hits = scanner.scanCitationTokens(REWRITE_PROBE, [{ line: 1, text: rewritten }]);
    return (hits.length === 1 &&
        hits[0].token === rewritten &&
        GATE_KINDS.includes(hits[0].kind) &&
        hits[0].status !== "exempt");
}
/** The storeless spelling of one hit, before the visibility guard reads it. */
function candidateFor(hit) {
    const t = hit.token;
    switch (hit.kind) {
        case "record": {
            const m = /([0-9]{6}-[0-9]{4})((?:_[a-zA-Z*]_)?[^]*)$/.exec(t.slice(t.lastIndexOf("/") + 1));
            if (m === null)
                return null;
            return m[1] + m[2].replace(/^_[a-z]_/, "_*_");
        }
        case "circle-record":
        case "circle-dir": {
            const m = /circles\/([0-9]{6}-[0-9]{4}-[a-z0-9-]+)/.exec(t);
            return m === null ? null : m[1];
        }
        case "bare-record":
            return /^[0-9]{6}-[0-9]{4}_[a-z]_/.test(t) ? t.replace(/_[a-z]_/, "_*_") : null;
        default:
            return null;
    }
}
/** The storeless spelling of one hit, or null when it is left as it stands. */
function rewriteOf(scanner, hit) {
    if (hit.status === "exempt" || hit.status === "unresolved-no-workbench")
        return null;
    const to = candidateFor(hit);
    return to !== null && readsBackWhole(scanner, to) ? to : null;
}
// --- the repair pass ---------------------------------------------------------
const STAMP = "[0-9]{6}-[0-9]{4}";
// `<basename>.md` then a tail; the basename's slug is the shortest run that
// lets a `.md` follow, so a doubled `<b>.md_coder_<b>.md` splits at the first.
const CHAINED_RE = new RegExp(`(?<![\\/0-9A-Za-z_-])(${STAMP}(?:${MARKER_SLOT})[A-Za-z0-9…-]*?\\.md)` +
    `(_[a-z*]_?(?![A-Za-z0-9])|_(?:[a-z]+_|…)[A-Za-z0-9._…-]*|_[a-z0-9-]+\\.[a-z]{2,4}|\\[[a-z]\\](?:-[a-z0-9-]+)?|\\.md)(?![A-Za-z0-9])`, "g");
// the two legacy history shapes, `<stamp>-<slug>.md` and `<stamp>_coder_<slug>.md`
const HEAD_FIELD_RE = new RegExp(`^(\\*\\*[^*\\n]+:\\*\\*\\s+)(${STAMP})((?:${MARKER_SLOT}|-)[a-z0-9-]+\\.md)\\s*$`);
/** Whether any index entry's basename is the repaired citation's. */
function indexed(scanner, base) {
    const re = new RegExp("^" + base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/_\\\*_/g, "_[a-z]_") + "$");
    return scanner.workbenchIndex().some((e) => re.test(e.base));
}
/** Every repair on one line, right to left. */
function repairsOn(scanner, lineText, ownBase) {
    const out = [];
    const hf = HEAD_FIELD_RE.exec(lineText);
    if (hf && hf[2] + hf[3] === ownBase) {
        out.push([hf[2] + hf[3], hf[2], "date-field", hf[1].length]);
        return out;
    }
    CHAINED_RE.lastIndex = 0;
    let m;
    while ((m = CHAINED_RE.exec(lineText)) !== null) {
        const [full, base, tail] = m;
        if (!indexed(scanner, base))
            continue;
        // a tail that is a whole filename with its own extension names another file
        const ext = /^_([a-z0-9-]+\.[a-z]{2,4})$/.exec(tail);
        if (ext && ext[1].split(".").pop() !== "md") {
            out.push([full, base.slice(0, 11) + "_" + ext[1], "chained-tail", m.index]);
            continue;
        }
        out.push([full, base, /^_[a-z]{2,}_/.test(tail) ? "doubled" : "chained-tail", m.index]);
    }
    return out.reverse();
}
// --- main --------------------------------------------------------------------
const isTestFixture = (abs) => abs.endsWith(".ts") && abs.split(sep).join("/").includes("/lib/__tests__/");
function main(argv) {
    const opts = parse(argv);
    const { root, repair, extra } = opts;
    const write = opts.write && opts.yes;
    // the corpus first: guard (a) asks about it, and one list is what keeps the
    // guard and the run from disagreeing about which files will be written
    const files = markdownFilesUnder(root).map((f) => f.abs);
    for (const p of extra) {
        const abs = resolve(p);
        if (!existsSync(abs))
            usage(`${p} does not exist`);
        if (statSync(abs).isDirectory())
            files.push(...markdownFilesUnder(abs).map((f) => f.abs));
        else
            files.push(abs);
    }
    // the declared paths join the corpus here, before guard (a) reads it
    const projectRoot = dirname(root);
    const config = loadConfig({ projectRoot });
    const declared = declaredCitationFiles(projectRoot, config.citations.extraPaths);
    for (const line of [...config.diagnostics, ...declaredCitationNotes(declared)]) {
        process.stderr.write(`${NAME}: ${line}\n`);
    }
    // by the filesystem's own spelling: `--root` may name the workbench by a path
    // the declared half would spell differently, and a file swept twice would be
    // counted twice
    const inCorpus = new Set(files.map(real));
    for (const f of declared.files)
        if (!inCorpus.has(real(f.abs)))
            files.push(f.abs);
    if (opts.write) {
        const why = refusal(root, extra, files);
        if (why !== null) {
            process.stderr.write(`${NAME}: ${why}\n`);
            return 4;
        }
    }
    const scanner = createScanner(root);
    const cwd = realpathSync(process.cwd());
    const mode = write ? "write" : "dry-run";
    const out = [];
    let touched = 0;
    if (repair) {
        const byClass = { "date-field": 0, "chained-tail": 0, doubled: 0 };
        let repairs = 0;
        for (const abs of files) {
            if (isTestFixture(abs))
                continue;
            const rel = relative(cwd, realpathSync(abs)).split(sep).join("/");
            const ownBase = abs.slice(abs.lastIndexOf(sep) + 1);
            const lines = readFileSync(abs, "utf-8").split("\n").map((t, i) => ({ line: i + 1, text: t }));
            const fenced = fencedContentLines(lines);
            let n = 0;
            for (const l of lines) {
                if (fenced[l.line - 1] || /^\s*>/.test(l.text))
                    continue;
                for (const [from, to, cls, col] of repairsOn(scanner, l.text, ownBase)) {
                    l.text = l.text.slice(0, col) + to + l.text.slice(col + from.length);
                    out.push(`${rel}:${l.line}  '${from}' -> '${to}'  ${cls}`);
                    byClass[cls]++;
                    n++;
                }
            }
            if (n === 0)
                continue;
            touched++;
            repairs += n;
            if (write)
                writeFileSync(abs, lines.map((l) => l.text).join("\n"));
        }
        const classes = Object.entries(byClass).map(([k, v]) => `${k}=${v}`).join(" ");
        out.push(`files=${touched} repairs=${repairs} ${classes} mode=${mode}`);
    }
    else {
        let rewrites = 0;
        const byKind = { record: 0, "circle-record": 0, "circle-dir": 0, "bare-record": 0, "stamp-bare": 0 };
        const residual = [];
        for (const abs of files) {
            if (isTestFixture(abs))
                continue;
            const rel = relative(cwd, realpathSync(abs)).split(sep).join("/");
            const lines = readFileSync(abs, "utf-8").split("\n").map((t, i) => ({ line: i + 1, text: t }));
            const hits = scanner.scanCitationTokens(rel, lines);
            let n = 0;
            // right to left within a line, so each splice leaves the earlier columns valid
            for (const h of [...hits].sort((a, b) => b.line - a.line || b.col - a.col)) {
                const to = rewriteOf(scanner, h);
                if (to === null) {
                    if (h.kind === "stamp-bare" && h.status !== "exempt") {
                        residual.push([h.line, h.col, `${rel}:${h.line}  '${h.token}'  ${h.status}`]);
                    }
                    continue;
                }
                if (to === h.token)
                    continue;
                const l = lines[h.line - 1];
                l.text = l.text.slice(0, h.col) + to + l.text.slice(h.col + h.token.length);
                n++;
                if (h.kind in byKind)
                    byKind[h.kind]++;
            }
            if (n === 0)
                continue;
            touched++;
            rewrites += n;
            out.push(`${rel}  rewrites=${n}`);
            if (write)
                writeFileSync(abs, lines.map((l) => l.text).join("\n"));
        }
        for (const [, , r] of residual.sort((a, b) => a[0] - b[0] || a[1] - b[1]))
            out.push(r);
        const kinds = Object.entries(byKind).map(([k, v]) => `${k}=${v}`).join(" ");
        out.push(`files=${touched} rewrites=${rewrites} residual=${residual.length} ${kinds} mode=${mode}`);
    }
    process.stdout.write(out.join("\n") + "\n");
    if (opts.write && !opts.yes) {
        process.stderr.write(`${NAME}: refused (no --yes): the census above is what --write would change; pass --yes to write it; nothing written\n`);
        return 5;
    }
    return 0;
}
process.exitCode = main(process.argv.slice(2));
