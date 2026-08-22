# Code review: the guard-rationale repair, the capped help topic, and the prose-metric test

**Reviewed-range:** `c2ad89c..6781814`
**Not-opened:** `fusion-workbench/shared/history/260822-1136-shaper-multi-user-fusion.md`, `fusion-workbench/shared/history/260822-1154-planner-c0-cut-only-circle.md`, `fusion-workbench/shared/history/260822-1226-analyst-cut-ledger.md`, `fusion-workbench/shared/history/260822-1318-coder-cut-the-hook-test-suite-by-500-lines.md`, `fusion-workbench/shared/history/260822-1350-coder-cut-agents-surface-step3.md`, `fusion-workbench/shared/history/260822-1420-coder-cut-skills-surface-step4.md`, `fusion-workbench/shared/history/260822-1425-coder-plan-c0-step-7-prose-metric-test.md`, `fusion-workbench/shared/history/260822-1435-coder-move-stranded-doc-comment.md`, `fusion-workbench/shared/history/260822-1437-coder-guard-rationale-into-the-helper-header.md`, `fusion-workbench/shared/history/260822-1450-coder-c0-steps-5-and-6-two-defects-on-the-skills-surface.md`, `fusion-workbench/shared/planning/260822-1136_o_spec-fusion-becomes-a-multi-user-tool.md`, `fusion-workbench/shared/issues/260822-0946_c_the-v10-5-release-note-reaches-the-readme-and-not-fusion-help-because-the-skills-bound-has-30-bytes.md`, `fusion-workbench/shared/issues/260822-1422_c_the-doc-comment-for-shippedprompts-is-stranded-above-agentnames.md`, `fusion-workbench/shared/issues/260822-1503_o_claude-mds-docs-row-says-fusion-help-points-at-every-upgrade-note-and-the-cap-made-that-false.md`

Every shipped file in the range was opened in full, and so was the C0 plan and the previous review.
The unopened set is fourteen workbench records: the ten step-history logs (whose claims this review
checked against the tree instead), the multi-user spec, and three records this range filed or closed.
Every path above was copied off the disk and re-tested with a shell loop before this field was
written — the failure the previous pass had here is recorded as `260822-1510` and is not repeated.

**Carried scope, discharged.** The previous review's `**Not-opened:**` field named fifteen records,
five of which resolved to nothing. All ten that resolve were opened here, together with the five real
records the failing five were paraphrases of, per
`fusion-workbench/shared/issues/260822-1510_o_five-of-fifteen-not-opened-entries-name-records-that-do-not-exist-and-no-gate-reads-that-field.md`.
Six of the fifteen carried records — the step-history logs — reappear above as not-opened for this
pass, for the reason the previous pass gave and this one repeats: a step report is the executor's
account of its own work, and checking it against the tree is worth more than reading it.

## Summary

Three commits: a test for `bin/fusion-prose-metric`, the repair of the previous review's High finding,
and the `/fusion:help` cap plus Setup's Step 0e guards. **The repair is sound** — the header now states
every claim the removed sentence carried. Nothing behaves differently anywhere in the range, no
baseline map moved, all three closure clauses hold at the reported figures, and the suite is green at
41 files and 724 tests. Eight findings, none of them a mechanism removed: two are false claims a later
reader would reason from, and six are smaller.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 2 |
| Low | 6 |

## Verdict on the repair of the previous High finding

**Sound.** The removed sentence was:

> The `[ -x ]` guard is the one every prompt-called `bin/` helper carries: a helper added between
> releases is absent from an older install and a bare call is exit 127.

Three claims. The new paragraph at `bin/fusion-source-root:46-56` states all three: *"the guard is the
one every prompt-called helper in this directory carries"*, *"a helper added to the plugin's work tree
between releases is simply absent from an older install"*, *"a bare call there is exit 127 at the
caller's own first step."* Not something adjacent, not the criterion around it — the claims themselves,
in the same order. The two pointers in `skills/cleanup/SKILL.md:29` and `skills/help/SKILL.md:31` now
name three things their target holds rather than two, which is correct for what the target now holds.
`bin/` is on no bounded surface, so the repair cost the Circle nothing.

**The declined second-order cut is where it goes wrong**, and that is a separate finding below.

## Findings by theme

### Theme 1 — a claim that a commit's own change makes false

#### Medium — the declined second-order cut is declined on a reason `620e737` falsified

`skills/setup/SKILL.md:32`, `skills/next/SKILL.md:33`, `bin/fusion-source-root:46-56`.

The commit declined to cut the surviving paragraph in `setup` and `next`, on this reason:

> Each surviving paragraph in setup and next opens by naming a call site inside its own body and then
> describes that body's own three-branch block. A helper header cannot author that.

Both halves fail. `next:33` opens *"the one the orchestrator's Setup carries"* — `agents/orchestrator.md`,
not a call site inside `skills/next/SKILL.md`; the body itself says at `:27` that it has exactly one
executable check, so it has no own second site to name. And the two sentences that follow the opening
clause are now in the header, added by this same commit, in near-identical wording:

| `skills/setup/SKILL.md:32`, `skills/next/SKILL.md:33` | `bin/fusion-source-root:52-56` |
|---|---|
| "The absent branch falls to `$FUSION_PLUGIN_ROOT`, which is the behaviour that preceded the helper, and says so on stderr rather than resolving in silence." | "The absent branch falls back to the install root, which is the behaviour that preceded this helper, and says so on stderr rather than resolving in silence." |
| "An unset `FUSION_PLUGIN_ROOT` does not fall anywhere, because there is nothing to fall to, and it is the branch that prints `UNRESOLVED`." | "An unset FUSION_PLUGIN_ROOT does not fall back anywhere, because there is nothing to fall to, and it is the branch a caller reports as UNRESOLVED." |

The "own three-branch block" is not own either: the first `bash` block is byte-identical in all four
bodies, and `cleanup` and `help` carry it with no describing paragraph at all — the direct
demonstration that the header is sufficient for it. About 920 bytes across the two files, on a bounded
surface.

Filed as `shared/issues/260822-1506_o_the-declined-second-order-cut-is-declined-on-a-reason-the-same-commit-made-false.md`.
Nothing behaves differently; the repair itself stands.

### Theme 2 — counted claims that do not survive counting

#### Medium — the help cap names one silent action and there are two

`skills/help/SKILL.md:107`. The commit's basis for the standing line:

> Of the three paragraphs the cap removed, exactly one held an action that fails silently when skipped.

The other two were checked, which is what the dispatch asked for.

- **v10.2 note — clean.** `docs/upgrading-to-v10-2.md:62` opens `## What you have to do` with
  *"**Nothing, for the upgrade itself.**"* and its one case is an explicit **halt** at `:66-71`. Loud.
- **v9 note — not clean.** `docs/upgrading-to-v9.md:54-59`, check 2: *"**An unrecognised value is not
  an error: it falls back to `code`, silently**, in `taskplanner`, `reconciler` and `playmaker`
  alike."* A leftover `**Domain:** strategic` or `knowledge` line runs as `code` without saying so.
  The removed *"Coming from a v8 or earlier install"* paragraph named that leftover by name.

**This does not trip the Circle's stopping clause, and the distinction matters.** Clause `:180` of the
plan requires every cut to carry a named authoring home that holds the claim. `docs/upgrading-to-v9.md`
does hold this claim, in full and in bold, and the standing line routes a reader there. What is wrong
is the line's *summary* of what the home holds. That is different in kind from the previous review's
High, where the cited home genuinely did not carry the claim — so a silent action was not lost to the
cap, and no mechanism was removed. The defect is a wrong count in a sentence later work will read.

Filed as `shared/issues/260822-1506_o_the-help-caps-standing-line-names-one-silent-action-and-the-v9-note-holds-a-second.md`.

#### Low — the v9 note's own preamble contradicts its check 2

`docs/upgrading-to-v9.md:35-36` says *"Six checks. Each is optional — nothing here is load-bearing."*
Check 2, nineteen lines below, describes a silent behaviour change. Read alone, the preamble gives
exactly the wrong count above, which is most likely where it came from. Out of range — the file was
read as the destination of a removed paragraph. Filed as
`shared/issues/260822-1506_o_the-v9-upgrade-notes-preamble-calls-six-checks-optional-and-check-2-describes-a-silent-behaviour-change.md`.

#### Low — the standing line's three derivable claims about `docs/` all fail

`skills/help/SKILL.md:107`. Checked against `git tag -l` and `ls docs/`:

1. *"Every release since v9 has its own note"* — nine tags since and including `v9.0.0`, six notes.
   `v10.0.1`, `v10.0.2` and `v10.1.0` have none.
2. *"named `upgrading-to-<version>.md`"* — the files use a dash: `upgrading-to-v10-2.md`. A reader
   substituting their own version constructs a filename that does not exist.
3. *"starting at its own"* — has no referent for a project at `v10.0.x` or `v10.1.0`, which is exactly
   the case the removed *"Coming from a v10.0 or v10.1 install"* paragraph handled by name.

Filed as `shared/issues/260822-1506_o_the-help-caps-standing-line-makes-three-claims-about-docs-and-none-of-the-three-resolves.md`,
with a fix that needs no derivation at all.

### Theme 3 — the prose-metric test: what it pins and what it does not

The test's expected numbers were re-derived here by hand from `bin/fusion-prose-metric`'s header,
without reading the awk, as the dispatch asked. **Seven of eight reproduce exactly**, and the two
findings are about coverage rather than correctness.

| Case | Header rule applied | Expected | Holds |
|---|---|---|---|
| `prose.md` | no excluded region; 3 dashes, 19 tokens; `permit = int(19/1000)` | `3 / 19 / 157.9 / 0 / over`, exit 0 | yes |
| `fence.md` | region 1, fences included | `1 / 6` | yes |
| `span.md` | region 2, delimiters included | `1 / 8` | yes |
| `quote.md` | region 3, whole line | `1 / 3` | yes |
| `profile.yaml` | region 4, subtree ends at `note:` (indent ≤ key) | `1 / 6` | yes |
| same text as `.md` | region 4 is extension-keyed | `3` | yes |
| `exhibits.md` | naive 7 (1+1+2+2+1), prose 1 | `7` → `1` | yes |
| dashes | only U+2014 | `1`, and `0` | yes |
| exit table | 1 usage, 2 unreadable with readable rows kept | as stated | yes |

#### Low — the two limits the header calls "stated rather than discovered" have no test

`bin/fusion-prose-metric:69-73` states that a 4-space indented block is **not** excluded and that a
code span spanning two lines is **not** matched. Neither is asserted, and both would silently become
false under a plausible edit. The documented `total (N files)` row is unasserted too, deliberately —
the test's `run()` helper filters it out with a comment saying why. **The fix costs about twelve lines
against 302 of head-room on a closure clause of 300**, so it needs a cut in front of it; that
sequencing is stated in the record rather than left to be discovered when the suite goes red. Filed as
`shared/issues/260822-1506_o_the-prose-metric-test-pins-every-header-rule-except-the-two-the-header-calls-limits.md`.

#### Low — the test pins a word count the header does not document

The `19` in the first case counts three bare em-dashes as words. The script counts whitespace-separated
tokens; the header's column table says only *"prose words, excluding the same regions"* and never says
what a word is. The test's own preamble claims it pins the header rather than the awk, and for this one
assertion there is nothing in the header to pin. `CLAUDE.md` declares that header authoritative, so this
is the same class as the finding repaired two commits earlier. Filed as
`shared/issues/260822-1506_o_the-prose-metric-counts-a-bare-em-dash-as-a-prose-word-and-only-the-test-says-so.md`.

### Theme 4 — smaller

#### Low — a stopping clause that cannot be answered yes

Plan `:180` demanded the `620e737` repair; plan `:181` admits additions to a bounded surface only for
"the four defect fixes", and the repair added 50 bytes to `skills/`. Since v10.3 the orchestrator reads
these clauses back at closure, so somebody has to answer `:181` out loud and the honest answer today is
"no, by 50 bytes, for a reason the clause above required." Filed as
`shared/issues/260822-1506_o_two-of-the-c0-plans-stopping-clauses-cannot-both-be-answered-yes-for-a-repair-the-first-one-demands.md`,
with a one-clause widening rather than a number.

#### Low — a colon introducing a list that was cut out from under it

`skills/setup/SKILL.md:362` ends *"…→ Exit codes):"* and the next non-blank line is an unrelated bold
paragraph. `c2ad89c` removed the exit-3 and exit-4 bullets and the sentence's grammar did not survive.
One site only: `skills/next/SKILL.md:51` kept its Exit 1 bullet, so its colon still introduces a list.
Introduced by the range's base commit, so it belongs to the previous review's span; filed here because
it was found here. One byte to fix. Filed as
`shared/issues/260822-1506_o_setups-exit-code-sentence-ends-in-a-colon-introducing-a-list-that-was-cut.md`.

## What was verified and holds

### No baseline map moved

Compared byte-for-byte against `370bfc5`, block by block: `AGENT_BASELINE`, `SKILL_BASELINE` and
`TEST_LINE_BASELINE` in `hooks/lib/__tests__/surface-growth-bound.test.ts`, and `RULE_BASELINE` in
`hooks/lib/__tests__/rules-emission-golden.test.ts`. All four identical. The two test files did change
in the range's span, so a file-level diff is not the check — each map was extracted and compared on its
own.

### All three closure clauses hold, re-measured rather than trusted

Each surface summed the way its own `Surface.files()` reader sums it: `agents/` and `skills/` by byte
size, the hook tests by newline count over a **recursive** walk of `hooks/lib/__tests__/**/*.ts`
including `helpers/*.ts` and excluding `fixtures/*.golden`. Head-room is `floor + headRoom − total`,
with `floor` the baseline summed over the files present.

| Surface | Floor | Head-room | Budget | Now | Remaining | Clause | Reported |
|---|---|---|---|---|---|---|---|
| `agents/*.md` | 399 843 | 18 000 | 417 843 | 401 242 | **16 601** | ≥ 12 000 | 16 601 |
| `skills/*/SKILL.md` | 220 439 | 20 000 | 240 439 | 236 423 | **4 016** | ≥ 3 000 | 4 016 |
| Hook tests | 17 875 | 2 500 | 20 375 | 20 073 | **302 lines** | ≥ 300 | 302 |

All three reproduce to the byte and to the line. The `skills/` total also matches
`surface-growth.golden`'s regenerated `total 236423` exactly. **The hook-test figure has two lines of
margin against its own clause**, which is what makes the sequencing note on the prose-metric coverage
finding load-bearing rather than pedantic.

### Setup's Step 0e guards all three blocks, and the reordering does what it claims

Both claims were tested by running the blocks as pasted shell in a scratch workbench rather than read.

- **On a resolving root the behaviour is unchanged.** `[ -n "$SRC" ]` is true, the `||` short-circuits,
  and the classification loop ran to completion, reporting `case1-equal` for all four profiles.
- **On a non-resolving root all three blocks skip.** With `FUSION_PLUGIN_ROOT` unset each block printed
  `source-root-unresolved` and exited 0, reaching neither the classification nor the stamp.
- **The reordering is real.** With the guard ahead of `PROV=…; [ -f "$PROV" ] || : > "$PROV"`, a
  non-resolving root leaves **no** `.asset-provenance` behind. Confirmed by `ls` after the run.

The Done-report contract at `:241` now names the skip as a fifth outcome, and the enumeration head at
`:203` reads "The eight tokens" and names `source-root-unresolved` as the first. The closure note of
`circles/260820-2051-style-rules-arrive-and-get-measured/issues/260821-0302_c_…` describes exactly what
landed, including the one thing beyond the record's prescription.

**One thing this did not close, correctly.** The `cp` in the replace block is still unchecked, so a
failed copy is still stamped as replaced. That is `260821-0148`, still open, and the range did not claim
to touch it.

### The suite is green and the pin did not move

`cd hooks && npm test` — exit 0, 41 files, 724 tests, matching the commit messages. `BASELINE = { paths:
1269, anchors: 171, records: 115 }` in `reference-resolution-lint.test.ts` is byte-identical at `c2ad89c`
and `6781814`, and the green suite proves it still resolves against the tree as it now stands. So the
"four citations left, four arrived" claim is confirmed at its only checkable end.

### The stranded doc comment moved correctly

`hooks/lib/__tests__/helpers/citation-scan.ts`: the `shippedPrompts` block now sits directly above
`shippedPrompts` and `agentNames` keeps its one-liner. Net zero lines, which is why the hook-test figure
did not move.

## Cross-cutting observations

**Both Medium findings are the same shape, and it is not the shape the previous review found.** The
previous High was a pointer to a home that did not hold the claim. These two are a *claim about* what a
home holds — "a helper header cannot author that", "exactly one held an action that fails silently" —
where the home is fine and the summary of it is wrong. That class survives every gate this repository
has, and it survives the fix for the previous class too: a citation gate resolves the path, a growth
bound counts the bytes, and neither reads a sentence about what the target says. Both were found the
only way they can be: by opening the target and reading it against the claim.

**One of the two was falsified by its own commit, four lines apart.** `620e737` added the three-branch
description to the header and, in the same message, gave "a helper header cannot author that" as the
reason for not cutting the bodies' copy of it. That is not carelessness about a distant file; it is a
claim about the diff the author had just written. Worth knowing before the next repair Circle, because
the previous review's High was also a claim about a file the same commit had just touched.

**The tightest number in the range is the one nothing is pressing against.** Hook tests stand at 302
against a clause of 300. Two of the eight findings have fixes that land on that surface, and one of them
is about twelve lines. The plan's own `## Open Questions` already carries the unanswered decision behind
this — `260822-1154_o_does-the-hook-test-line-budget-cover-comment-prose.md` — and every fix that touches
this surface between now and its answer is negotiating against two lines of slack.

**The range's method is sound where it was checked.** Three separate claims — "no baseline moved", "all
three closure clauses hold at 16 601 / 4 016 / 302", "the guards change nothing on a resolving root" —
were re-derived here independently and all three reproduced exactly, the third by execution. Where this
range measured, it measured correctly. Where it summarised a document, twice, it was wrong.

## Recommended sequencing

1. **Before this Circle closes:** the two Medium findings, and the stopping-clause Low with them. All
   three are things the closure note or the closure gate has to state, and stating them wrongly is
   cheaper to fix now than to correct in a record later. None costs more than about 150 bytes on a
   surface with 4 016.
2. **Before this Circle closes, or explicitly deferred with a reason:** the standing line's three
   derivable claims. The fix is shorter than the sentence it replaces, so it is free against every bound.
3. **Cleanup, any time:** the colon at `skills/setup/SKILL.md:362` (one byte), the v9 note's preamble
   (`docs/`, unbounded), and the prose-metric header's word definition (`bin/`, unbounded).
4. **Sequenced behind a cut, and not before:** the two missing prose-metric assertions. Twelve lines
   against two of margin. Read `260822-1154_o_does-the-hook-test-line-budget-cover-comment-prose.md`
   first.
5. **Not a blocker:** nothing else. The suite is green, no baseline moved, the three surfaces cleared
   their clauses, and the repair of the previous High is sound.

## References

- Repaired record: `shared/issues/260822-1421_c_two-skill-bodies-lost-the-x-guard-rationale-to-a-header-that-does-not-carry-it.md`
- Previous review: `shared/reviews/260822-1421-coderev-c0-cut-only-circle.md`
- Carried-scope defect: `shared/issues/260822-1510_o_five-of-fifteen-not-opened-entries-name-records-that-do-not-exist-and-no-gate-reads-that-field.md`
- Plan: `shared/planning/260822-1154_o_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md`
- Filed by this review: eight records under `shared/issues/`, all stamped `260822-1506`
