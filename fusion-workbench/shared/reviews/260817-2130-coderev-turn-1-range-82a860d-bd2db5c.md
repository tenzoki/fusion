# Code review — Turn 1, `82a860d..bd2db5c`

**Sender:** coderev
**Reviewed-range:** `82a860d..bd2db5c`
**Not-opened:** none

The predecessor review left no `**Not-opened:**` field to carry: `bin/fusion-review-coverage`
reports `carried=(not recorded)`, which is the absence of a declaration and not a declaration
of nothing. Nothing is claimed here about what earlier passes did or did not open.

## Summary

One commit, one intent: the two model-facing hook sentences stop citing fusion's own workbench
records and a fusion commit hash into a consuming project's session. The removal is correct and
complete — every actionable clause survived, the two test proxies are sound, and the committed
build matches its source byte for byte. Three findings, none of them a request to put an
identifier back: one restated justification is mechanically false for three of the four shapes
it is attached to, the defect class has no gate against recurrence, and a source comment
mis-attributes the incident the shipped text was derived from.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 2 |
| Low | 1 |

## The four questions in the dispatch

### 1. Did any instruction die with its citation? — No

Read both builders end to end (`hooks/lib/review-coverage.ts:684-701`,
`hooks/lib/staging-drift.ts:617-660`) against their pre-commit text. Three fragments left, and
all three are retrospective:

| Removed | Instruction content |
|---|---|
| "This is issue 260810-1205: two passes ran, their ranges did not tile …" | none |
| "— issue 260811-1141 is what that cost when the instruction was unconditional." | none |
| "This is issue 260811-0114: a queue rebuild and its history file sat in the working tree …" | none |

Both clauses the motivating issue named as load-bearing survive verbatim in substance:

- "deleting an authored file on a name match is not recoverable" — `staging-drift.ts:645-646`.
- The four-shape `git add` prohibition — `staging-drift.ts:649`.

So does the cause the third fragment carried: "commit a queue rebuild at Phase 1 where the
dispatch that produced it happened" (`staging-drift.ts:648`) is the instruction that retrospective
justified, and it is still there. The referent of "these paths" in the surviving closing part is
still supplied, because `stagingSentence` returns `""` on zero faults and every non-empty return
therefore emits at least one preceding part that names paths.

### 2. Does the rewritten `git add -A` justification hold? — For `-u` only

**Finding M1 — the restated justification is true of one of the four shapes it forbids.**
`hooks/lib/staging-drift.ts:649-653`, compiled twin `hooks/dist/lib/staging-drift.js:550-554`.

Measured on git 2.49.0 in a throwaway repository holding one committed record renamed on disk
(tracked deletion, untracked successor — the incident's exact shape). Index reset between runs:

| Command | `git diff --cached --name-status` |
|---|---|
| `git add -u recs/` | `D  recs/260810-0501_o_x.md` |
| `git add -A recs/` | `R100  ..._o_x.md -> ..._p_x.md` |
| `git add recs/` | `R100  ..._o_x.md -> ..._p_x.md` |
| `git add recs/*.md` (shell glob) | `A  recs/260810-0501_p_x.md` |
| `git add 'recs/*.md'` (pathspec glob) | `R100  ..._o_x.md -> ..._p_x.md` |

The sentence's mechanism — "stages the deletions of records that were renamed, adds nothing in
their place, and so takes those records out of HEAD" — is exactly right for `-u` and false for
the other three. `-A` and a bare directory argument stage the rename whole; since git 2.0 a
pathspec stages removals *and* additions. An unquoted shell glob fails the opposite way, adding
the successor and leaving the deletion behind.

The plugin already holds the accurate account in three places, all naming `-u`:
`agents/orchestrator.md:539`, `hooks/lib/staging-drift.ts:27-29`, and `f38f37d`'s own commit
message ("The cause is the directory-wide `-u`").

Why it matters rather than being pedantry: the sentence's only job is to stop an agent widening
`git add`, and it is addressed to a reader who can check it. The old wording
(`"loosening it re-opens f38f37d"`) carried the same over-attachment and was unfalsifiable in a
consuming project. Making the mechanism explicit made the over-attachment checkable — better
form, worse truth. Filed as `260817-2130`, with a proposed wording that keeps each justification
on the shape it holds for.

### 3. Are the new test proxies sound? — Yes

Both proxies come from the part their sentence emits unconditionally, which is the property the
dispatch asked about:

- `COVERAGE_SPOKE = "widen the next dispatch's scope"` (`review-coverage.test.ts:70`) sits in the
  final `parts.push` at `review-coverage.ts:694-697`, after the `if (parts.length === 0) return ""`
  guard. Neither conditional branch (uncovered, carried) can suppress it.
- `STAGING_SPOKE = "Do NOT reach for \`git add -A\`"` (`staging-drift.test.ts:110`) sits in the final
  `parts.push` at `staging-drift.ts:648-654`, after the only early return. Neither fault class
  (`record`, `commit-message`) can suppress it.

Both phrases are unique in the plugin outside their own source and its build — grepped across
`hooks/`, `bin/`, `agents/`, `skills/`, `rules/`. So neither can be satisfied by some other hook
string, which is what the new comments claim.

No assertion was weakened. The one place assertions were merged is
`staging-drift.test.ts:517-523`, where `toContain("\`git add -A\`")` and `toMatch(/Do NOT reach for/)`
became a single `toContain(STAGING_SPOKE)` — and `STAGING_SPOKE` contains both, adjacent, so the
merged assertion is strictly stronger than the pair. The positive assertions are `toContain` on a
non-empty literal and fail on `""`; the three `.not.toContain` sites are the throttle and
quiet-path cases, where an empty string is the expected result and was before this commit too.

One observation, not filed. `COVERAGE_SPOKE` duplicates `COVERAGE_SENTENCE_MARKERS[2]` in
`helpers/guard-harness.ts:544-548`, whose own comment says the constant exists "so the two suites
that use it as a probe cannot disagree about what 'the tracker spoke' means" — while
`review-coverage.test.ts`, the suite most about that sentence, holds an independent copy. The
duplication pre-dates this commit (the literal `260810-1205` was in both), both copies were
updated consistently here, and a future divergence fails loudly on the positive assertions rather
than silently. Not a defect; worth folding into the harness constant the next time either file is
touched.

### 4. Do source and compiled output agree? — Yes, exactly

`npm run build` in `hooks/` against a copy of the committed `dist/`: `diff -r` reports no
difference across the whole tree. The two rebuilt files match their sources, and nothing else in
`dist/` was left stale by the change. `npm test`: 35 files, 653 tests, all passing.

The regenerated golden is arithmetically exact:
`guard-harness.ts` 972→978, `review-coverage.test.ts` 804→819, `staging-drift.test.ts` 649→660,
total 17887→17919 = +32 = 6+15+11. `wc -l` on the three files at HEAD returns 978 / 819 / 660. No
growth baseline moved and none needed to.

## Findings by theme

### Correctness of shipped model-facing text

**M1 — Medium — `hooks/lib/staging-drift.ts:649-653` + `dist/lib/staging-drift.js:550-554`.**
The restated `git add` justification, measured false for `-A`, a directory argument and a glob.
Detail and measurements above. → `shared/issues/260817-2130_o_the-git-add-prohibition-s-restated-justification-holds-for-u-alone-and-is-false-for-the-other-three-shapes.md`

### Recurrence control

**M2 — Medium — no gate on foreign identifiers in emitted hook text.**
`bd2db5c` removed four identifiers by hand and added no check. The next edit can put one back
with every gate green, which is how they arrived.

`reference-resolution-lint.test.ts` does scan both modules — and comment lines only
(`:173-177`, `:183-187`, each with `commentRe: TS_COMMENT_RE`, defined `:129`). Its own comment
at `:169-173` states the exclusion and its reason: *"Code lines stay out of scope: string
literals there are classifier inputs and deny-reason text, not references."* That premise held
for the guard-era modules and does not hold for these two, whose string literals carried four
workbench records and a commit hash.

Note the gate could not have caught them even if it had scanned those lines: it asserts a
citation resolves **in this repository**, and all four did. The defect is the reverse property —
resolves here, nowhere else — and no check expresses it.

The cheap gate is on the **output**, not the source text. Both builders are exported and pure
(`review-coverage.ts:684`, `staging-drift.ts:617`), so a test can call them on synthetic reports
through every branch and assert the returned string matches neither `/\b\d{6}-\d{4}\b/` nor
`/\b[0-9a-f]{7,40}\b/`. Gating the output covers parts added later without anyone extending a
list.
→ `shared/issues/260817-2131_o_nothing-stops-a-fusion-workbench-id-returning-to-an-emitted-hook-sentence-because-the-lint-reads-comment-lines-only.md`

### Source-comment accuracy

**L1 — Low — `hooks/lib/staging-drift.ts:612-614` attributes `f38f37d` to `git add -A`.**
The same file at `:27-29`, `agents/orchestrator.md:539` and the commit's own message all
attribute it to a directory-wide `git add -u`. Pre-existing, untouched by `bd2db5c`, and filed
only because it is the text directly above the function whose sentence was rewritten — it is the
most likely source of M1, and correcting one without the other leaves the next editor the same
trap. → `shared/issues/260817-2132_o_the-staging-sentences-source-comment-attributes-f38f37d-to-git-add-a-while-the-same-file-attributes-it-to-u.md`

## Also checked, clean

**No other fusion-internal reference in a model-facing string in either module.** Grepped both
sources and both builds for `260810-1205`, `260811-0114`, `260811-1141`, `260811-1148`,
`260810-0710` and `f38f37d`. Every remaining hit is on a comment line — jsdoc or `//` — which is
the fusion-developer surface the user's gate decision explicitly kept.

**The CLI renderers are clean too**, and they matter because they are also model-facing: the
orchestrator reads `bin/fusion-review-coverage` stdout at Step 3c and Phase 4.
`renderUncovered`, `renderReview` (`review-coverage.ts:641,656`) and `renderStagingRow`
(`staging-drift.ts:601`) build their output from report data alone. The id-shaped tokens in
`hooks/review-coverage.ts` and `hooks/staging-drift.ts` are all in header comments and sample
output blocks, never in a printed string.

`hooks/lib/domain-cascade.ts` was left out of scope per the user's gate decision and is not
reviewed here.

## Cross-cutting observation

The two Medium findings are the same shape one level apart. M1 is a claim in shipped text that
is true of one member of a set and asserted of the set; M2 is a gate whose stated exclusion was
true of one class of file and applied to a directory. Both are `rules/critical-stance.md` §4:
a justification, like a case split, has to range over exactly what it is attached to. In both
cases the accurate statement already existed elsewhere in the repository — `agents/orchestrator.md:539`
for M1, and for M2 the lint's own reasoning about *why* comments rot, which applies verbatim to
a string literal addressed to a reader outside this repository.

## Recommended sequencing

Neither Medium blocks a release. M1 ships text that is wrong about git and should be corrected
before the next version bump, since it is cheap and reaches every consumer. M2 is the durable
one: it is what stops this recurring, and it is the smaller change of the two. L1 rides along
with M1 — same file, same reading, one commit.

---

## Reconciliation annotation — 260817-2207

Reconciler, final pass of session `260817-2037`, at HEAD `307a696`
(log `shared/history/260817-2207-reconciliation.md`). Findings only annotated, nothing rewritten.

- **M1** (`260817-2130`) — resolved in `6b6436d` and revised again in `307a696`. Verified by
  rendering `stagingSentence()` from the rebuilt `hooks/dist/lib/staging-drift.js`: each of the four
  forbidden shapes now reaches a clause, and `-A` is not the subject of the deletion mechanism.
  Record closed (`_c_`). Its `Resolved:` note, written after `6b6436d`, states a judgement that
  `307a696` reversed and carries no pointer to the reversal, which is filed as
  `shared/issues/260817-2207_o_a-closed-records-resolution-note-states-a-judgement-head-reversed-and-every-citation-points-backward.md`.
- **M2** (`260817-2131`) — still open, by user decision at the Turn 1 gate rather than by oversight.
  Verified that no output-assertion gate exists and that `reference-resolution-lint.test.ts` still
  registers both modules with `commentRe: TS_COMMENT_RE`. Evidence appended to that record,
  including a defect in this review's proposed gate: asserting "no bare short hash" over
  `coverageSentence()`'s uncovered branch fails by construction, because that branch emits the
  consuming project's own commit hashes.
- **L1** (`260817-2132`) — resolved in `6b6436d`. Verified: the docstring above `stagingSentence()`
  attributes `f38f37d` to a directory-wide `git add -u` and cites its agreement with
  `hooks/lib/staging-drift.ts:29` and `agents/orchestrator.md` Step 3b. Record closed (`_c_`).

The review's declared `**Reviewed-range:**` matches what it opened: `bin/fusion-review-coverage`
reports `not-opened=none covers=1` for this file. Nothing here claims a range it did not open.
