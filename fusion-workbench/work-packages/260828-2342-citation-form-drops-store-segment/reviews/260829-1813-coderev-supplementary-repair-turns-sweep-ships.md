# Code review: the two repair Turns after closure, and the sweep that ships

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `e9f2ed0b..a60d1fea`
**Not-opened:** none
**Circle:** `260828-2342-citation-form-drops-store-segment`
**Dispatched by:** orchestrator, supplementary to `260829-1345-coderev-circle-closure-storeless-citation-form.md`
**Previous review's Not-opened:** none

Opened in full: `hooks/lib/citation-scan.ts` (the diff and the surrounding functions), `hooks/citation-sweep.ts`, `bin/fusion-citation-sweep`, `hooks/lib/__tests__/citation-sweep.test.ts`, the diffs of `hooks/citation-check.ts`, `bin/fusion-citation-check`, `hooks/lib/__tests__/helpers/citation-scan.ts`, `reference-resolution-lint.test.ts`, `workbench-citation-lint.test.ts`, `skills/help/SKILL.md`, `docs/upgrading-to-v10-20.md`, `README-hooks.md`, `CLAUDE.md`, `.gitignore`. `hooks/dist/` was not read line by line; `committed-dist.test.ts` holds it equal to the source. The workbench repair (`3276b1e1`, 172 files) was sampled: five restored head fields and five stripped tails against `git show 66b486e0:<path>`, plus the sweep and the repair pass each dry-run over `git archive a60d1fea fusion-workbench`.

## Summary

The grammar repair is right: `MARKER_SLOT` is one spelling read by the index, the uniqueness test and the sweep; `BARE_RE` takes a truncated citation whole; `STAMP_RE` refuses a `_`, `[` or letter after the stamp and the two backtracks; the head-field exemption is as narrow as its header says. The sweep ships behind the three guards the decision named, the `stamp-bare` rule is gone rather than bounded, and the own-tree idempotency case is a real gate (it went red in this session's working tree on three post-range bookkeeping lines, which is the gate doing its job). One defect is at HEAD: the repair pass is not clean over the committed tree, because two exhibits in a closed issue record are inline-code and not fenced, and no test pins `repairs=0`.

## Totals

Critical 0 / High 0 / Medium 1 / Low 2 filed, 2 noted. Issues filed: 3.

## Findings by theme

### 1. The repair pass would rewrite evidence in a closed issue record (Medium)

Filed: `260829-1810_*_the-repair-pass-rewrites-two-unfenced-exhibits-in-a-closed-issue-record-and-no-gate-holds-repairs-at-zero.md`.

- `bin/fusion-citation-sweep --repair --dry-run` over `git archive a60d1fea fusion-workbench`: `files=1 repairs=2 date-field=0 chained-tail=1 doubled=1`. Both hits are lines 24 and 26 of `260829-1346_*_the-committed-sweep-rewrote-29-date-head-fields-into-filenames-and-left-181-chained-tails-in-the-tree.md`, inline backticks, so `fencedContentLines()` does not reach them (`hooks/citation-sweep.ts:352` skips fenced and blockquoted lines only).
- `citation-sweep.test.ts:272-291` pins `rewrites=0` for the sweep over this tree and nothing for `--repair`.
- Fix direction: fence the two exhibits (a record fix), and add the `repairs=0` leg to the own-tree describe block. Scope: this repository's workbench plus the test; a consuming project meets it only if it filed such an exhibit.

### 2. A missing extra path under `--write` is a stack trace (Low)

Filed: `260829-1811_*_a-nonexistent-extra-path-under-write-is-a-stack-trace-from-refusal-not-the-usage-line.md`. `main()` (`hooks/citation-sweep.ts:320`) runs `refusal()` before the existence check at line 332; `refusal()` line 210 calls `realpathSync` on the path. Reproduced on a scratch repo. Exit 1 by accident, stderr contract broken.

### 3. Three head-field counts for one quantity (Low)

Filed: `260829-1812_*_the-sweep-header-states-the-head-field-count-as-42-and-38-in-one-file-and-the-issue-it-cites-says-29.md`. `hooks/citation-sweep.ts:35` says 42, `:57` says 38, `hooks/lib/citation-scan.ts:72` says 42, the cited issue's title says 29. The coder log measured 42 over the working tree; nothing stamps which tree each figure counts.

### 4. Noted, not filed (Low)

- **Output paths under `--root` are cwd-relative.** `relative(cwd, realpathSync(abs))` (`hooks/citation-sweep.ts:346`, `:373`) prints `../../../../../private/tmp/...` when the workbench is not below cwd. The header does not say output is cwd-relative. Cosmetic.
- **`bin/fusion-citation-sweep --dry-run` is cited unrooted** in `skills/help/SKILL.md:101` and `docs/upgrading-to-v10-20.md:45`; a consuming project has no `bin/` at its root and the runnable spelling is `"$FUSION_PLUGIN_ROOT/bin/fusion-citation-sweep"`. The checker is cited the same way in the same paragraph, so this is the existing convention, not a regression.

## What was checked and holds

- `MARKER_SLOT` (`citation-scan.ts:151`) is used by `REC_RE`, `BARE_RE`, the repair pass's `CHAINED_RE`/`HEAD_FIELD_RE` and the uniqueness test's `STAMPED_RE`; the new test case reads the words off the tree and holds them equal to `MARKER_WORDS`.
- `STAMP_RE` (`:247`): `(?![0-9A-Za-z_\[])(?!-[a-z0-9])(?!\.md)` refuses the truncated, bracket-marked and name-under-different-case heads and the two backtracks the comment names; verified against the scratch fixtures in test 2 (`**Date:**`, `**Started:**`, three truncated shapes, a word-marked file, an ellipsis cut, a glob: `rewrites=1 residual=1`, no stamp of a head field listed).
- `isHeadFieldValue` (`:260`) is read for `stamp-bare` only (`:594`), so `**Active spec/plan:** <basename>` stays a citation.
- `rewriteOf` (`hooks/citation-sweep.ts:184`): `record` keeps a word marker literal, `bare-record` stars only a whole literal letter marker, `stamp-bare` returns null; a `--resolve-stamps` option is a usage error (test). The residual lists only non-exempt bare stamps.
- Guards: (a) not-a-work-tree, untracked, dirty, path-outside-repo each tested or reproduced (the fourth reproduced here, exit 4 with the named line); (b) `--write` without `--yes` prints the census, exits 5, `mode=dry-run` on the summary, tree untouched; (c) no code path resolves a bare stamp. Guards run before the census, and a dry run needs none.
- Own-tree sweep at `a60d1fea`: `files=0 rewrites=0 residual=2753`. The two red tests in the live working tree (`citation-sweep.test.ts` own-tree case, `workbench-citation-lint.test.ts`) are three uncommitted post-range bookkeeping lines: `260829-1133-orchestrator-session.md`, `260829-1805-reconciliation.md`, and line 9 of `260829-1623_*_the-sweep-starred-both-markers-of-a-shell-illustration-in-a-terminal-circle-record.md`, each carrying a `circles/` prefix. Not code findings; the writer of those lines fixes them before commit.
- Sampled repair (10 of 172 files): `**Date:**`, `**Datum:**`, `**Started:**`, `**Stamp:**` restored byte-equal to `66b486e0`; every sampled tail (`.md_coder_…`, `.md_a`, `.md_*` twice, `.md_*` in a German log) stripped to `<basename>.md`. One thing a reader should know: where the pre-sweep token was truncated (`260803-1419_a`, `260823-1642_*`), the repair keeps the expansion the first sweep made and strips the tail; it does not restore the truncation. That is what the header documents (`chained-tail -> <basename>.md`), and the result resolves, but the tree is not byte-equal to `66b486e0` on those lines.
- `hooks/scripts/citation-sweep.mjs` is gone; no shipped surface cites it outside two historical comments (`hooks/citation-sweep.ts:10`, the baseline comment in `reference-resolution-lint.test.ts`). `.gitignore` re-includes the new wrapper; `install.sh` copies `bin/` whole.
- `reference-resolution-lint.test.ts` pin `1552/216/11`: the +8 and the stampBare 12 -> 11 are each derived on the line with their shares; not re-measured here.
- `docs/upgrading-to-v10-20.md:45` and `skills/help/SKILL.md:101`: the consumer paragraph states the guard order and the two tools' split correctly against the code.

## Cross-cutting observations

- The same exemption boundary produces finding 1 here and the open issue `260829-1623_*_the-sweep-starred-both-markers-of-a-shell-illustration-in-a-terminal-circle-record.md`: the scanner reads "fenced or blockquoted" as the whole of exhibit-versus-pointer, and a marker that is the datum in an inline span or in a fenced *shell* line falls on the pointer side. Two rewriters (sweep, repair) inherit that one cut.
- The own-tree gate is the right shape and was proven by going red on live bookkeeping within hours; the repair leg lacks the same gate, which is finding 1's second half.

## Recommended sequencing

1. Finding 1 before anyone runs `--repair --write --yes` in this repository; it is a fence and a test case.
2. Findings 2 and 3 at any cleanup.

Release note: none of the three blocks the sweep shipping; the sweep's own idempotency and guards hold at `a60d1fea`. The open Low `260829-1348_*_circle-records-names-playmaker-as-a-resolver-of-the-head-field-and-the-playmaker-prompt-never-reads-it.md` stands and is not refiled.
