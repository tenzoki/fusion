# Code Review — the Plane mirror's removal, and the two premises the plan hands the next step

**Date:** 2026-08-15 08:04
**Sender:** coderev
**Reviewed-range:** `9a7da8e..7c12d6a`
**Not-opened:** `bin/fusion-plane`, `hooks/lib/__tests__/fusion-plane.test.ts`, `docs/plane-setup.md`, `fusion-workbench/orchestrator-events.jsonl`, `260815-0007-shaper-remove-eight-mechanisms-and-cap-growth.md`, `260815-0029-planner-remove-eight-mechanisms-and-cap-growth.md`, `templates/plane.config.yaml`, `fusion-workbench/plane.config.yaml`, `fusion-workbench/.plane-map.json`, `fusion-workbench/.plane-outbox.jsonl`, `hooks/lib/__tests__/fixtures/plane/` (15 files)
**Circle:** `260815-0007-remove-eight-mechanisms-and-cap-growth`
**Suite at review time:** `cd hooks && npx vitest run` — 48 files, 903 tests, 4 failures in `legacy-halt-clearing.test.ts`; the same file passes 6 of 6 in isolation. Known flake, `260814-2118_*_the-hooks-suite-fails-differently-on-repeated-full-runs-and-does-so-on-clean-head.md`.

The first four entries in `**Not-opened:**` are files this range deleted, read as diffs and as commit statistics rather than line by line; the last five are the structured-data half, which `ontorev` reviewed in parallel and whose review is `260815-0803-ontorev-plane-structured-data-removal.md`.

---

## Summary

The removal itself is clean. Every shipped surface that named the Plane mirror in a way a gate could
see has been corrected, the compiled `dist/` matches its source, the golden fixture moved by exactly
the two rule-file deletions and nothing else, and `claude plugin validate .` passes. The two
`agents/orchestrator.md` call points that had to survive losing a push — the `.active-circle` write
at activation and the `rm -f` at Phase 4 — both read correctly, with no orphaned clause.

What the range leaves behind is not in the code. Nine open defect records now name deleted files as
their subject, one of them because the removal wrote its closure into the wrong Circle as a bodiless
stub while the open original stood. And the plan carries forward a premise its own step 2 disproved,
which will turn step 4 red if followed as written.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 (filed by `ontorev`; this review adds evidence) |
| Medium | 3 |
| Low | 3 |

Three further findings of mine duplicated `ontorev`'s and were withdrawn rather than filed twice; see
`## Overlap with the parallel review`.

## Findings by theme

### A. Records that outlived their subject

**A1 — A defect record is live under two names in two Circles, and the closed copy lost its body.**
High. Filed by `ontorev` as
`260815-0803_*_the-layout-tree-record-is-live-under-two-names-in-two-circles-and-the-closed-copy-lost-its-body.md`;
I withdrew my own record for it. Two pieces of evidence from my pass that record does not carry, and
that matter for the fix:

The mechanism that caught the sibling and missed this one is stated in `507dbc6`'s own commit
message — *"A rename is two paths and P-2's staging list named only one."* For `260810-0410`
the leftover `_o_` and the new `_c_` were the same basename in the same directory, so
`bin/fusion-staging-drift` reported them as a pair and the fix landed one commit later. For
`260814-1419` the new path is in a **different Circle**, so the two never appeared together and
nothing named the leftover. The repair that closed the first case does not generalise to the second,
which is worth knowing before the same shape recurs at steps 4, 6, 7, 8, 10 and 11.

And the placement is decided, not open: `rules/fusion-workbench-conventions.md` `## Origin Rule`
corollary 2 is *"One record, one location, many citations"*, and the record originated in the curator
Circle, where `coderev` filed it during that Circle's Turn 3. The `mv` belongs in
`circles/260801-1244-curator/issues/`.

**Repaired one commit past this range, while the review was being written.** `53f2ed2` renames the
curator Circle's copy `_o_` → `_c_` with its 28-line body intact and deletes the stub, which is the
first of the two dispositions above. Verified on disk. The finding stands as a record of what the
range shipped, and the sequencing entry below drops to closing `ontorev`'s record rather than
performing a fix — that record was still `_o_` at the time of writing.

**A2 — Seven open defect records name a deleted Plane file as their subject.** Medium in my reading,
High in `ontorev`'s; filed as
`260815-0803_*_seven-open-defect-records-name-the-deleted-plane-mirror-and-neither-removal-step-owns-a-record-sweep.md`.
My own record was withdrawn. Two additions:

An eighth needs a different disposition rather than a `_c_` rename.
`260813-2305_*_the-directive-promises-plane-setup-verification-and-step-10-was-deferred-with-no-record.md`
records that a Directive promised `docs/plane-setup.md` be verified against `bin/fusion-plane`. Both
files are gone, so the promise is moot — but that Circle carries Bounded Closure (`_b_`) and its
Directive is part of its record, so the surface that has to say so is its closure note. And the
plan's own `## Risks & Mitigations` last row already required this: *"Its open records are checked at
step 2."* They were not.

A ninth is **not** in this class and should be left alone:
`260801-1020_*_plane-mirror-circle-closed-with-empty-turn-log.md` is about the
`_c_circle.md` record's unfilled Turn log, and that record still exists.

**Why the whole class was invisible, and it is not the executor's attention.** The plan's
`**Decidability:**` line rests the sweep on `reference-resolution-lint.test.ts`, and
`260812-1720_*_the-reference-resolution-lint-does-not-scan-the-workbench-where-citations-are-densest.md`
records that it does not scan the workbench. So `bin/fusion-plane:360` inside a defect record is not
a citation as far as `npm test` is concerned. The plan then states, in `## Testing Strategy`, that
each step's file list *"is not a guess at blast radius, it is what the lint will demand"* — so a
surface the lint cannot reach cannot appear in a file list by construction. The two statements
compose into a blind spot, and eleven removals are still ahead of it.

### B. The plan hands its next executors a disproved premise

**B1 — Step 4 still says `derivable-enumerations-lint` does not read `CLAUDE.md`'s Layout table, and
step 11 inherits it by omission.** Medium. Filed as
`260815-0804_*_the-plan-still-carries-the-false-premise-step-2-disproved-and-steps-4-and-11-will-ship-red-on-it.md`.

`260815-0029_*_plan-…md:195` ends *"The `CLAUDE.md` Layout row waits for gate G1."*
`hooks/lib/__tests__/derivable-enumerations-lint.test.ts:423-495` is section 8, a closed enumeration
in both directions, whose second branch is `CLAUDE.md's Layout table has a row for bin/${r} but that
file does not exist`. Step 4 deletes `bin/fusion-churn-rank`; following the sentence lands a red
commit, and the orchestrator's Step 3b reverts the whole task on red. Step 11 deletes
`bin/fusion-state-drift` and names `CLAUDE.md` in its file list without any bullet about the row, so
it produces the same red commit without having been told anything false. One step is misinformed and
one is uninformed; only the first is fixed by correcting a sentence.

The executing coder found this, acted on it correctly, and wrote it up —
`260815-0742-coder-remove-plane-mirror-code-and-prose.md` `## What the plan did not predict`
item 1 even says *"Step 4 inherits the correction"*. The plan was never edited: `git log` over it
returns one commit, `348f6db`. A correction recorded only in a history entry reaches the next
executor only if that executor reads a history entry it was not pointed at.

**Verified positively, and it is why this is Medium rather than High:** the roster is correct at
HEAD. `bin/` holds 14 regular files and `CLAUDE.md`'s Layout table holds 14 `| \`bin/…\` |` rows, the
same 14 names. The defect is in the instruction, not in the tree.

**B2 — Three steps have landed and the plan carries no `[DONE]` marker.** Medium. Filed as
`260815-0804_*_three-plan-steps-have-landed-and-the-plan-carries-no-inline-state-marker-for-any-of-them.md`.
`grep -n "IN PROGRESS\|\[DONE\]\|^\*\*Status:\*\*"` over the plan returns one line, the header. The
rule is `rules/fusion-workbench-conventions.md` `### Planning files`, and its `### When to update`
opens *"After completing each plan step — not just at session end."* This is a fifteen-step plan on a
Turn budget of 12; a resumed session reads the plan and sees fifteen unstarted steps.

Worth noting how the miss is shaped rather than just that it happened. The plan's preamble to
`## Implementation Steps` restates two per-step obligations — `npm test` green and a history entry —
and both were performed on all three steps. It does not restate this one, and it was not performed on
any of them. The preamble is selecting which obligations get met.

### C. Statements the removal falsified and left standing

**C1 — Both history entries inventory "two remaining Plane mentions" in `CLAUDE.md`, and there are
three.** Low. Filed as
`260815-0804_*_two-history-entries-inventory-two-remaining-plane-mentions-in-claude-md-and-there-are-three.md`.
`CLAUDE.md:73` still says the marker-on-the-record design gives *"the later Plane mirror … an
immutable natural key"*. The same justification was **deleted** from `rules/circle-records.md:30` by
`d0ddabb`, correctly. So the authoring home for that design now gives one reason and `CLAUDE.md`
gives two, the second naming a mechanism that no longer exists. This is adjacent to `ontorev`'s
`260815-0803_*_two-claude-md-inventory-rows-went-stale…` rather than a duplicate of it: theirs is
about rows 51 and 52 and why no gate sees them, this one is about a third row whose claim a rule file
now contradicts.

Both inventories reached "two" by the same correct method — asking which mentions a gate would fail
on — applied to a `grep` that stopped at the Layout table.

**C2 — `.gitignore:30` keeps `!bin/fusion-plane`.** Low. Filed by `ontorev` as
`260815-0803_*_gitignore-still-carries-the-ship-exception-for-the-deleted-bin-fusion-plane.md`;
my record was withdrawn. The addition worth carrying: the file's own comment at `:20` describes this
case in advance — *"Helper REMOVED? Take its line out too — nothing checks that this list matches
`bin/`, so a stale exception sits here naming a file that does not exist and reads to the next editor
as a helper that failed to ship."* Steps 4 and 11 delete two more `bin/` helpers, and neither names
`.gitignore`. The durable fix is to extend `derivable-enumerations-lint.test.ts` section 8 to read the
`!bin/<name>` exception list as a third surface beside the tree and the Layout table; it already
derives the roster, so the addition is small, and it is what the comment is asking for.

### D. Two small record defects

**D1 — The Circle record's `## Dependencies` announces five bound artifacts and lists six.** Low.
Filed as `260815-0804_*_the-circle-records-dependencies-section-announces-five-bound-artifacts-and-lists-six.md`.
Two candidate exclusions are available and nothing marks either, which is the shape of an off-by-one
rather than a deliberate omission.

**D2 — A decision record cross-references an `_a_circle.md` that activation renamed.** Low. Filed as
`260815-0804_*_a-decision-records-cross-reference-points-at-an-a-circle-md-that-activation-renamed.md`.
`260815-0007_*_does-fusion-cleanup-block-…md:7`. The shaper's history entry names the same
path at `:83` and that one is correct and must not be touched: it states what that run wrote, at the
name it wrote it under. The distinction is exactly the one step 2 drew for the two test comments that
keep the word "Plane" — a historical statement survives its subject, a live pointer does not.

## What was verified and is correct

Recorded because a removal review that lists only faults gives the next Turn no idea what it can
stop re-checking.

- **`agents/orchestrator.md` survived losing three call points cleanly.** The `## Plane mirror`
  section is gone whole; the Write Points bullet at `:249` and the Step 3e end-of-Turn sentence each
  lost their trailing clause and kept the act it was attached to; Phase 4 step 4 now reads
  `4. **Clear \`.active-circle\`.** Run \`rm -f fusion-workbench/.active-circle\`.` with its
  queue-retirement paragraph beneath it intact. No sentence anywhere in the file refers to a push.
- **The committed `hooks/dist/` matches its source.** `npm run build` (`rm -rf dist && tsc`) produced
  no working-tree change. The two `staging-drift` outputs in the range are the real build.
- **The two "Plane" test comments are historical and correctly kept.**
  `state-drift-detection-lint.test.ts:592` explains that its `PRE_FIX` fixture is
  `git show 9bad4d6^:agents/orchestrator.md` verbatim and that the one elision was a Plane-push
  clause; `derivable-enumerations-lint.test.ts:15` records that the review motivating the gate
  measured a skill list missing `seed-from-plane`. Both are statements about the past and stay true.
- **The `bin/` roster is complete in both directions**, 14 files against 14 Layout rows.
- **The golden moved by exactly the two rule-file deletions** — `fusion-workbench-conventions.md`
  53 124 → 52 756, `circle-records.md` 11 949 → 11 754 — and `RULE_BASELINE` was not re-cut
  (`rules-emission-golden.test.ts` is unchanged in the range). The coder's reported per-dispatch
  figure checks out: golden `coder` total 87 302 plus the 7 353-byte chat profile is 94 655.
- **The three decision records carry the `Answered: <path>:<line> — <summary>` citation** their `_a_`
  marker requires, and the cited lines resolve. One is off by a line, `:103` landing on the blank
  above the record path rather than on it; not worth a record.
- **The one closed defect that was renamed rather than copied carries its `Resolved:` footer**
  (`260810-0410_*_…`, a 93 %-similarity rename with the footer appended).
- **`claude plugin validate .` passes** with the standing CLAUDE.md-at-root warning, and `skills/`
  holds 16 directories against `CLAUDE.md`'s 16-name listing.
- **`skills/setup/SKILL.md` runs 0d → 0f** with 0e removed and not re-lettered, which the history
  entry justifies: step 12 of the plan names Step 0f as the place its new permission step goes.

## Cross-cutting observations

**Every finding in sections A, C and D is the same shape, and it is not a shape a reviewer's
attention fixes.** Nine records, one `.gitignore` line, one `CLAUDE.md` clause and two record
citations all survived because no gate looks at them, and the plan's file lists are built from what
the gates demand. The three that a gate *did* cover — the `bin/` Layout row, the `hooks/lib` table,
the golden — were all caught inside the removing commit, several of them against the plan's own
instructions. The instrument works exactly where it reaches and the misses are exactly its
complement. That is worth stating plainly before eleven more removals run through the same
arrangement.

**The two reviews of this range found the same three things independently and filed them twice.**
`ontorev`'s stamps are 08:03, mine 08:04, in one store, with no mechanism between us. I withdrew
mine. Recorded here because the dispatch split the range by artifact kind while the defects it
contains are not split that way: `.gitignore` and a Markdown defect record are neither structured
data nor application code, so both reviewers reached them and both filed. `ontorev`'s three carry
`**Domain:** data` and `**Owner:** ontocoder` for `.gitignore` and for the record transitions, which
is not obviously right against `agents/ontocoder.md`'s own charter; the next Turn should settle the
owner rather than let the records sit unassigned.

**HEAD is not reliably green, and three history entries in this range state `exit 0`.** My full run
failed four tests in `legacy-halt-clearing.test.ts` that pass 6 of 6 in isolation — the exact
behaviour of `260814-2118_*_…`, which is open and Medium. Every step in this plan takes
"`npm test` green" as its acceptance criterion, and the release process's step 0 does too. Nothing in
this range caused it and nothing in this range can fix it, but a plan that runs the suite fifteen
more times as its principal instrument is resting on an instrument that reports differently on
repeated runs.

## Recommended sequencing

**Before step 4 starts** — B1. It is the only finding that makes the next commit fail. It is a
two-sentence edit to the plan.

**Before step 4 starts, and cheaply** — B2, the `[DONE]` markers, since the same editor is in the
plan file.

**Any time in this Circle, and best as one pass** — A2 and C2, the record and `.gitignore` sweep;
A1's fix already landed in `53f2ed2` and what remains of it is closing `ontorev`'s record with a
`Resolved:` footer citing that commit. Doing them together is the point: they are one class, and the pass that does them should also
decide whether the class gets an instrument, per A2's closing paragraph and C2's.

**At gate G1, with the curator** — C1 and `ontorev`'s two-rows record. All three are `CLAUDE.md`
narrative and G1 is where they belong; C1 additionally needs the rule-file contradiction named in the
ledger rather than just the row deleted.

**No release blocker.** Nothing in this range breaks a shipped surface, and the version was correctly
left unbumped for step 15.
