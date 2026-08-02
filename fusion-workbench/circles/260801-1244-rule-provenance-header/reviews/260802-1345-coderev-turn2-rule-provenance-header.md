# Code review: Turn 2, rule-provenance-header

**Date:** 2026-08-02
**Agent:** coderev
**Circle:** `circles/260801-1244-rule-provenance-header`
**Scope:** `cac3726..HEAD` excluding `fusion-workbench/`. 3 paths, 143 insertions, 34 deletions. Commits `cc004fc`, `7703330`.
**Prior review:** `reviews/260802-1257-coderev-turn1-rule-provenance-header.md`.

## Summary

The four fixes are correct and the coder's evidence holds under independent
mutation. Three new findings, all introduced by the fix pass, none serious: a
false exclusivity claim in `CLAUDE.md`, two stale strings inside the test file
the fix rewrote, and an undeclared Node floor. The heaviest is the `CLAUDE.md`
parenthetical, because it is the same defect class as the Turn 1 finding it was
written to close, pointing the other way.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 1 |
| Low | 2 |

`npm test` from `hooks/`: 17 files, 780 tests, green (was 777 — four tests added,
one deleted). `git status --porcelain` clean after all mutation probes were
reverted.

## Fix accounting

Four of the seven Turn 1 issues carry `_c_` in the Circle's issue store
(`260802-1250`, `-1251`, `-1253`, `-1254`); three remain `_o_` by the user's
decision and were not re-examined. That matches the brief.

## Verified correct

Stated because the review's value depends on knowing what was checked rather
than assumed.

**The mutation claim, verified rather than accepted.** Both halves reproduce.

| Mutation | Result |
|---|---|
| `{ recursive: true, withFileTypes: true }` → `{ withFileTypes: true }` | 3 failed, 24 passed |
| back to the pre-fix string form (`recursive` only, `join(dir, f)`, no `isFile()`) | 3 failed, 24 passed |

Under the first, the corpus test stays green and the failures are the traversal
block's tests 1, 3 and 4. Under the second, the failures are tests 1, 2 and 4,
and test 4 fails with `EISDIR: illegal operation on a directory, read` — the
exact throw the `isFile()` filter exists to prevent, so the second mutation
demonstrates the `EISDIR` claim in the header comment at `:28-30` as well. The
new tests are non-vacuous.

**The traversal implementation** (`provenance-header-lint.test.ts:105-118`).
`relative(relTo, abs).split(sep).join("/")` normalises separators; the sort is
deterministic code-unit order on `rel`, matching its docstring; `gatedFiles()`
passes `pluginRoot` as `relTo` so the emitted `rel` is still `rules/<name>.md`,
unchanged from the pre-fix shape for a flat corpus. No unused imports.

**The temp-tree convention and its cleanup.** Four sibling test files already use
`mkdtempSync(join(tmpdir(), …))` with `rmSync(…, { recursive: true, force: true })`
— `fusion-paths.test.ts:91-105`, `context-manifest.test.ts:74-89`,
`fusion-plane.test.ts:77-85`, and `guard-harness.ts:177-211`. The coder said
three; it is four, so the convention claim understates rather than overstates.

Cleanup is exception-safe, checked empirically on all three paths rather than
reasoned about:

- **Test failure.** Both mutation runs above left zero `provenance-tree-*`
  directories under `$TMPDIR`.
- **`beforeAll` throwing after `mkdtempSync` succeeded.** A throwaway probe suite
  reproducing exactly that shape confirmed vitest still runs `afterAll`, the
  marker file was written, and the tree was removed.
- **`mkdtempSync` itself throwing**, leaving `root` as `""`. `rmSync("", {
  recursive: true, force: true })` returns without throwing — `force` suppresses
  the `ENOENT`. So the `afterAll` cannot itself fail and mask the real error.

**The deletion of the corpus-prose test took nothing that is not held elsewhere,
and it did take a fifth thing — correctly.** The deleted block carried four
assertions, not three:

| Deleted assertion | Where the coverage now sits |
|---|---|
| the fixture prose still exists in `rules/user-facing-output.md` | no longer needed: the fixture at `:302-309` is relabelled "long blockquoted prose mentioning provenance mid-sentence" and no longer claims corpus origin |
| the prose sits below line 10 of that file | intentionally dropped — this was the vacuous coupling |
| `headerLine(user-facing-output.md) === 3` | **nothing replaces it** |
| that file's header exists at all | corpus test, `:159-168` |

The third row is the fifth thing. Nothing in the suite now asserts that any real
rule file's header sits at the canonical line 3; only the fixture at `:253` does.
That loss is right, not a gap: the gate's contract is the ten-line window, and
pinning a real file to line 3 would reinstate exactly the corpus coupling the
deletion removed — a legitimate move of that header to line 1 would break the
test while the gate stayed correct. Canonical placement is a convention for
review to hold, which is what the section itself says.

The coder's other three coverage claims all check out: case at `:292`, colon at
`:293`, anchor rejection at `:295`, position at `:409-437` (the conventions-file
block, still the strongest test in the file) and at `:260-268`.

**The measured numbers, checked against the files.** Every figure in both the
conventions section (`:571`) and the gate's header comment (`:59-69`) reproduces:

| Claim | Check |
|---|---|
| pre-header blockquote ran to line 8 in `context-manifest.md` | `git show e8988d9:rules/context-manifest.md` — blockquote lines 3-8 |
| a header after that lede would have landed on line 10 | line 9 blank, line 10 next — correct |
| the header now sits at line 3, above the lede | correct |
| the blockquote is now lines 5-10 | correct |
| a header below that lede would sit at line 12 | line 11 blank, line 12 next — correct |
| it is the corpus's longest opening blockquote | correct; the runner-up is `context-lean-claude-md.md` ending at line 9 |
| "as all ten now do" | `rules/` holds exactly 10 `.md` files, and all 10 carry the header at line 3 |

The two copies of the argument agree. The conventions version adds one sentence
the test comment omits ("The remaining margin is zero, and it costs nothing"),
and the test comment adds "as all ten now do"; neither contradicts the other.
Turn 1 finding 4 is properly closed — the rationale is now stated in the past
tense against the pre-header corpus, which is what made it verifiable.

**The conventions lede's "the rule files those agents load" holds against
`bin/fusion-rules`.** Checked against the helper, not against the prose. It emits
from three rule roots: `$FUSION_PLUGIN_ROOT/rules` (the always-on set plus
`design-diagrams.md` plus pattern matches), `./rules`, and `.claude/rules`. That
is exactly the scope the provenance section claims at `:586` — the plugin's
`rules/` gated by the lint, the two project roots as documented convention. Two
residuals, both benign:

- The helper also emits `./fusion-workbench/stilwerk/chat-voice-<lang>.yaml` for
  every agent and `default-voice-<lang>.yaml` for nine. These are stylometric
  YAML profiles, not rule files, and `rules/agent-setup.md` keeps them in a
  separate "## Voice profiles" section from the rules it lists. Nobody would read
  "rule files" as covering them.
- With a context manifest present, the helper also emits manifest `path` units.
  `rules/context-manifest.md:71` calls such a unit "a rule file", and the schema
  does not constrain where it points, but every worked example points inside
  `.claude/rules/`. Theoretical, not actual.

The lede does not overclaim. `CLAUDE.md` does — finding 1.

## Findings by theme

### Theme 1: the fix's prose half

**1. `CLAUDE.md`'s new parenthetical asserts an exclusivity that four other
sections of the same file contradict. Medium.** `CLAUDE.md:30` now ends
"...and the provenance headers on rule files (the one subject it governs outside
`fusion-workbench/`)". False. `rules/fusion-workbench-conventions.md:601`
(`## Security`, "never read or display `.secret` files") governs every file in
the project. `:7` and `:91` (the path-literal rule and "No agent and no skill
hard-codes a store path") govern `agents/*.md` and `skills/*/SKILL.md`, and are
enforced over those files by `path-literal-lint.test.ts`. `:220`
(`## Project language`) governs `CLAUDE.md` itself. The conventions lede half of
the same commit makes no such claim and is correct; only the `CLAUDE.md` half
overclaims, so the two documents now disagree. This is a regression introduced by
the fix for Turn 1 finding 2, and it is that finding's mirror image: a lede that
excluded a subject it hosts, replaced by a row that excludes subjects it hosts.
`CLAUDE.md` is auto-loaded into every session here, so it is read before any edit
to the conventions file.
Filed: `issues/260802-1343_o_claude-md-parenthetical-claims-provenance-is-the-only-subject-outside-the-workbench.md`

### Theme 2: drift inside the rewritten test file

**2. The corpus test's name and vacuity message still say `rules/*.md`. Low.**
`provenance-header-lint.test.ts:160` and `:175`. The set became recursive in the
same commit, and the file's own header comment at `:21` says so — "every `*.md`
under `rules/` at ANY depth". `:160` is the line a contributor reads in the
vitest runner when the gate fails, and the recursion exists precisely so a nested
curator shard is gated, so the stale glob is worst in exactly the scenario the
fix was built for.
Filed: `issues/260802-1344_o_corpus-test-name-and-vacuity-message-still-say-rules-star-md-after-the-set-became-recursive.md`

### Theme 3: runtime floor

**3. `e.parentPath` raises the Node floor to 20.12 and nothing declares it. Low.**
`provenance-header-lint.test.ts:109`. `hooks/package.json` has no `engines`
field and there is no root manifest. Grep confirms neither `parentPath` nor
`readdirSync(…, { recursive: true })` appears anywhere else under `hooks/lib/`,
so this Turn is what raised the floor — previously it was vitest 2.1's
`^18.0.0 || >=20.0.0`. On Node 18.17-20.11 the property is `.path` instead, so
`join(undefined, e.name)` throws `TypeError [ERR_INVALID_ARG_TYPE]`: loud, but
naming `join` rather than the Node version. Exposure is limited to a contributor
running `npm test` — `tsconfig.json` excludes `lib/__tests__`, so no test reaches
`hooks/dist/`, and `install.sh` ships no tests and needs no Node on the user's
machine. One line in `hooks/package.json` closes it.
Filed: `issues/260802-1345_o_the-recursion-fix-raises-the-node-floor-to-20-12-and-no-engines-field-declares-it.md`

## Observed, not filed

**The traversal block's third test crashes rather than asserting under the very
regression it guards.** `:229-231` uses `find(...)!`, so dropping `recursive:
true` produces `TypeError: Cannot read properties of undefined (reading 'rel')`
instead of a message naming the missing nested file. Not filed: the non-null
assertion is an established idiom in this suite (`fusion-plane.test.ts:85`,
and `:399` in this same file), and the diagnostic signal is not lost — tests 1
and 4 fail in the same run with messages that name `nested/deep.md` explicitly.

**The header comment at `:189` says "the first test here fails" under the
recursion mutation.** Three do. True as written, understated in fact. Not worth
an edit.

## Cross-cutting observations

**The fix pass repeated the defect class it was closing, in one place out of
four.** Turn 1 finding 2 was a lede whose scope statement excluded a section the
file hosts. The fix corrected the lede accurately and then wrote a fresh, tighter
scope claim into `CLAUDE.md` that excludes four sections the file hosts. Both are
the same failure: a summary of a document's scope written from the subject in
front of the author rather than from the document. It is worth noting that the
conventions file itself — the surface under review — came out clean, and the
error landed in the file describing it.

**Both cleanup findings are drift between a claim and the thing it describes**,
which is the same shape as Turn 1 findings 4 and 5. Finding 2 here is a string
invalidated by code moving under it in the same commit. That makes four
instances of this class across two Turns in a Circle whose whole subject is
keeping normative text answerable to what actually exists. Worth naming for
`circles/260801-1244-curator`, whose remit is exactly that reconciliation.

**Nothing in the two prose files drifted beyond the three edited lines.**
`git diff --stat` reports one changed line in `CLAUDE.md` and two in
`rules/fusion-workbench-conventions.md`, with no other hunks.

**The test file is coherent as a whole.** Seven describe blocks, each with a
stated purpose, no duplicated coverage between the new traversal block and the
existing ones, and the header comment's account of the file matches what the file
does — except for the two strings in finding 2.

## Recommended sequencing

Nothing here blocks the Circle from closing. No finding is a release blocker.

1. **Finding 1** before the curator Circle's C9 touches
   `rules/fusion-workbench-conventions.md`, since C9 may restate its scope and
   the `CLAUDE.md` row would have to move with it. Deleting the parenthetical is
   the whole fix.
2. **Findings 2 and 3**, any time. Two strings and one manifest field, no
   dependencies between them or on anything else.

---

**Reconciliation annotation, 260802-1413 (reconciler). All three findings confirmed fixed in `b568ad9`; no finding text altered.**

| Issue | Verified |
|---|---|
| `260802-1343` `CLAUDE.md` exclusivity parenthetical | `_c_`. The parenthetical is gone from `CLAUDE.md:30`, which now ends "…the decision-record template, and the provenance headers on rule files." The row and the conventions lede agree. |
| `260802-1344` stale `rules/*.md` strings | `_c_`. `provenance-header-lint.test.ts:160` and `:175` both read `rules/**/*.md`, matching the recursive set `cc004fc` introduced. |
| `260802-1345` undeclared Node floor | `_c_`. `hooks/package.json:5-7` declares `"engines": { "node": ">=20.12.0" }`. |

Worth recording about this review specifically: all three findings were regressions introduced by the Turn 1 fix pass, and the review caught them in the same session that created them. That is the review loop working as intended rather than a sign of a sloppy fix pass.
