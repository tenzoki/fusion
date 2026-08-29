# Reconciliation — Circle `260801-1244-curator`, session close

**Date:** 2026-08-14 20:17
**Agent:** reconciler
**Domain:** `code`
**Verified against:** the working tree at HEAD `41c224c`
**Session:** `260813-2345-orchestrator-session.md`, range `d7786eb..41c224c`, 25 commits, 5 Turns, 10 tasks
**Status:** Complete

---

## What this pass was

The final reconciliation before Circle `260801-1244-curator` closes. A previous pass ran mid-session
at HEAD `18173e1` (`260814-1457-reconciliation.md`) and left the
Circle's plan and spec correct; six commits have landed since. This pass re-derived that pass's
verdicts rather than inheriting them, covered the six new commits, and computed the three-edge
Coherence verdict that decides how the Circle closes.

**Nothing was taken on report.** Every claim below names the command or the file and line that
produced it.

---

## Counts

| | Reviewed | Updated | Filed |
|---|---|---|---|
| Plans and specs | 10 files across both stores; 3 read in full | 3 | — |
| Defect records | 26 opened and checked individually (15 open in the Circle, 3 Turn-5 closures, 8 in `shared/`); 314 inventoried | 1 | 5 filed, 2 of them closed again within the pass — see the addenda |
| Decision records | 86 swept mechanically for marker-vs-header agreement; 19 active in `$SCAN_DECISIONS` assessed against the Directive; 2 read in full | 1 | 1 |
| Reviews | 5 in the Circle | 1 annotated | — |

No marker rename was warranted by this pass. Every record whose work landed had already been
renamed by the commit that landed it, which is the finding the brief anticipated and it held.

---

## Both halves of the Directive are on disk, and both were re-run rather than re-read

The Directive had two halves. Both landed.

**Half 1 — the curator agent.** `agents/curator.md` (32 356 bytes, frontmatter `name` +
`description` only), `skills/curate/SKILL.md` (12 281 bytes, `allowed-tools` carrying
`Agent(fusion:curator)`), the seventeenth-agent registration at `bin/fusion-rules:174` and `:185`
with the `[curator]` block at `hooks/lib/__tests__/fixtures/rules-emission.golden:66`,
`ls agents/*.md` returning 17, and the dispatch allowlist at `agents/orchestrator.md:4`. The staleness
line sits in `skills/cleanup/SKILL.md`. All three invocation shapes are reachable, and as of Turn 5
the roster in `README-agents.md:66-68` says so too — that surface was the Turn-4 review's first High
finding and `9f4cdac` closed it.

**Half 2 — the growth bound.** `hooks/lib/__tests__/rules-emission-golden.test.ts:994-995` holds
`expect(g.over, hardBoundMessage(g)).toBe(false)` over the universal-core file set. The five
baseline entries at `:475-479` each carry an inline `// 2026-08-14 arming` comment; the three
role-specific entries at `:482` were left on their 2026-08-05 figures, as the arming decision
required. The unit tests at `:1158-1177` prove the assertion fires in both directions — one case
asserts `g.over === true` on a grown set, one asserts `false` on an unchanged one — so it is a hard
bound and not a report. Re-run by this pass:
`npx vitest run lib/__tests__/rules-emission-golden.test.ts` passes 15 of 15 with no `RULE-TEXT
BUDGET` report printed for any role. Turn 5's rule-file edit spent 415 of the remaining head-room
and the bound held.

**T7, the Directive's proof half.** `260814-1332-curator-run.md`
exists at 211 776 bytes and 2 633 lines. Its head states "approved: all 28 entries; 28 applied, 0
skipped, 0 stale, 0 failed", and §5 records that all 28 are tier 1 with no constraint removed at any
tier. The corrections landed in `1a36fe4`. The corpus-wide question the run could not settle —
whether a decision whose implementation was later deleted has a marker — was filed as an open
decision rather than answered, which is the spec's own second admissible form.

---

## What was found stale, and what was done about it

### Repaired by this pass

**A decision record's header contradicted its own filename.**
`260813-0027_*_should-the-orchestrator-be-able-to-dispatch-the-shapers-portfolio-activation-mode.md`
read `**Status:** open` while the filename marker said implemented and the file carried both an
`Answered:` and an `Implemented:` footer. The record walked open → answered → implemented across
commits `e02f268` and `0b14d03`; both renames moved the marker and neither touched the header.
Header corrected to `implemented`, and the `Implemented: bf9553f` footer re-derived from the tree:
`agents/shaper.md:55` and `:57` carry the conditional form and the `**Initiated by:**` halt,
`agents/orchestrator.md:333-339` carries the dispatch contract, `README-agents.md:66-68` carries the
roster rows. All three agree at HEAD.

### Re-measured and left open

**The status-versus-marker population grew.**
`260812-1232_*_thirty-four-of-seventy-four-decision-records-carry-a-status-header-that-contradicts-their-filename-marker.md`
measured 34 of 74 on 2026-08-12. Re-derived at HEAD by comparing each filename's marker against that
file's `**Status:**` line: **39 raw mismatches over 86 records**, of which 4 are false positives of
the naive comparison (a header carrying the right word plus a parenthetical annotation an earlier
reconciliation added). The real figure is **35 of 86**. The record stays open and now carries the
re-measurement plus the one instance this session created and this pass corrected.

### Confirmed still standing

All 15 open defect records in the Circle were re-checked against the tree rather than assumed. Four
worth naming because each was verified by a command, not by reading the record:

- `260814-1332_o` (the curator is the one prose agent that does not enumerate its long-form outputs)
  — `grep -ln "Long-form prose" agents/*.md` returns 9 files and `agents/curator.md` is not among
  them. Stands.
- `260814-1419_o` (three Plane files entered the layout tree and the two per-surface arguments were
  not extended) — `rules/fusion-workbench-conventions.md:64-66` carries the three files;
  line 71's justification paragraph names none of them, and the tracked-versus-live split at `:75`
  contains zero occurrences of "plane". Stands, and its shared sibling `260810-0410_*_the-layout-tree-calls-itself-exhaustive-and-omits-the-two-plane-runtime-files.md` stands with it.
- `260814-1419_o` (the golden-regeneration history says eighteen agent blocks) —
  `260814-1352-coder-golden-regeneration.md:23` still reads "all
  eighteen agent blocks". Stands.
- `260814-1001_o` (the skills array omits two skills) —
  `hooks/lib/__tests__/fusion-paths.test.ts:22-26` lists 15 names, `ls skills/` returns 17;
  `cadence` and `seed-from-plane` are the two missing. Stands.

`260814-1419_o` (the shipped chat-voice profiles changed and the workbench copies did
not) also stands: `stilwerk/chat-voice-de.yaml` is 7 358 bytes against the workbench copy's 7 353,
and `chat-voice-en.yaml` is 6 800 against 6 801. The two long-form profiles match exactly.

---

## Four new defect records

All four are filed in this Circle's own store per the Origin Rule — each arose from running this
Directive rather than being found beside it.

**1. `260814-2017_*_an-uncommitted-turn-budget-edit-to-fusion-guard-json-makes-the-suite-red-at-the-working-tree-while-head-is-green.md`**

`cd hooks && npm test` fails 1 of 1 030 tests in the working tree. The failing case is
`config.test.ts:1325-1336`, which asserts the root `fusion-guard.json` is byte-identical to
`templates/fusion-guard.json`; the root copy carries an uncommitted
`"orchestrator": { "maxTurns": 12 }` line. `git show HEAD:fusion-guard.json | diff -
templates/fusion-guard.json` is empty, so **HEAD is green and only the tree is red**. The edit is the
documented way to raise this session's Turn budget — `agentstate.yaml` records `max_turns: 12`
against the Setup snapshot's 5 — so the pin makes fusion's own repository the one project that
cannot use the mechanism it ships. Three ways out are named in the record; none is chosen there. It
matters now because `npm test` green is step 0 of the release process.

Neither existing check would have caught it: `bin/fusion-staging-drift` reports `clean` because it
scans `fusion-workbench/` only and this file sits at the project root, and
`bin/fusion-review-coverage` tiles commits, of which an uncommitted change is not one.

**2. `260814-2017_*_turn-5-edited-three-shipped-surfaces-including-an-always-on-rule-file-and-no-review-pass-ever-opened-them.md`**

`bin/fusion-review-coverage` reports `uncovered=3` — `6d433c2`, `9f4cdac`, `41c224c`. The middle one
is Turn 5's work commit and it edits `README-agents.md`, `agents/orchestrator.md` and
`rules/fusion-workbench-conventions.md`, the last being an always-on rule file every agent loads on
every dispatch. The events log shows `turn_start` for Turn 5 and `task_done` for T10 with no
`review_start` between them; the next event is the resume, whose own detail reads "re-entering Turn 5
at Phase 3". The resume treated the Turn as finished, so its review was skipped rather than deferred.
This is the measurement working and nothing acting on it — the record proposes running the review
over `6d433c2..HEAD` before closure, and separately giving the resume path the check, and states why
taking one without the other leaves a hole.

**3. `260814-2017_*_three-of-the-five-turns-have-no-per-turn-section-and-turn-5-is-absent-from-the-circle-turn-log-while-the-drift-check-reads-clean.md`**

The session history's `## Per-Turn Log` carries `### Turn 1`, `### Turn 2` and `### Turn 3,
continued` and nothing else. The Circle record's `## Turn log` runs Turn 1, 2, 3, 3-continued, 4 —
`git show 41c224c -- .../_t_circle.md` shows that commit adding the **Turn 4** bullet, so Turn 5 was
never written anywhere. `bin/fusion-state-drift` reports `verdict=clean` on exactly this row because
five bullets happen to equal five Turns: the continuation bullet is counted as a Turn, masking the
missing one. Both surfaces are the orchestrator's to write, which is why this is a record and not an
edit.

**4. `260814-2017_o_the-newest-decision-record-carries-no-answered-implemented-footer-block-so-its-next-transition-has-nowhere-to-land.md`**

`circles/260801-1244-curator/decisions/260814-1915_o_*` ends after `## Recommendation` with no
`Answered: / Implemented: / Deferred: / Superseded by:` block. The template in
`rules/fusion-workbench-conventions.md` `## Decision Record Template` closes the body with it and
the three sibling records in this Circle all carry it. Content is complete; only the transition
surface is missing.

---

## One new decision record

**`260814-2017_*_does-a-parent-spec-close-when-its-last-circle-does-if-three-of-its-capabilities-were-retired-rather-than-delivered.md`**

`260801-1122_*_spec-normative-consolidation.md` spans four Circles and has now had
three reconciliation passes decline to move its marker, each on the ground that Circles were still
outstanding. With `260801-1244-curator` closing, that ground expires. But three of the spec's
capabilities were *retired* rather than delivered — C9 by user direction, C4 by user decision on
2026-08-14, and C5c because its subject was deleted on 2026-08-12. Renaming the file `_c_` asserts a
delivery that did not happen; leaving it `_o_` asserts outstanding work nobody intends to do. Both
are false, so the marker cannot be chosen by measurement. Filed in `shared/` rather than in this
Circle because the artifact spans four Circles, three of which are not this one, and the question was
found beside this Directive rather than caused by it.

The spec itself received a reconciliation entry recording that all four of its Circles have now
delivered, and pointing at the decision.

---

## Misfiled — should be a decision

None found this pass. Every open record in the Circle store resolves to "go fix it" and belongs where
it is. The one item in the Circle whose remedy is a choice —
`260814-1850_*_the-halt-that-guards-the-audit-trail-…` — is correctly filed as a defect *and* cites
its closing decision `260814-1915_*_should-mode-3-require-the-audit-line-on-every-run-instead-of-testing-whether-it-was-dispatched.md`, which is the right shape: the defect is real, and answering the
decision is what closes it.

---

## Coherence verdict

Computed at session end and written to
`260813-2345-orchestrator-session.md` `## Coherence`, which is the surface the
orchestrator reads at Phase 3.

**Verdict: `review-needed`.** One of the three edges is flagged: Artifact↔Grounding. The two others
are clean, and it is worth being precise about what that means, because the flag is about closing
hygiene rather than about the work.

**The Directive itself is met, both halves, and this pass verified it by running the instruments
rather than reading the reports.** What is flagged is that the Circle would otherwise close over an
unreviewed change to an always-on rule file, over a working tree whose test suite is red, and over a
Turn log missing its last Turn. None of the three is a defect in what was built.

---

## Files this pass wrote

| File | What changed |
|---|---|
| `260813-0027_*_should-the-orchestrator-be-able-to-dispatch-the-shapers-portfolio-activation-mode.md` | `**Status:**` corrected `open` → `implemented`; reconciliation evidence appended |
| `260812-1232_*_thirty-four-of-seventy-four-decision-records-carry-a-status-header-that-contradicts-their-filename-marker.md` | re-measurement appended, 35 of 86; stays open |
| `260814-0845_*_plan-curator.md` | second reconciliation entry at HEAD `41c224c` |
| `260814-0738_*_spec-curator.md` | second reconciliation entry at HEAD `41c224c` |
| `260801-1122_*_spec-normative-consolidation.md` | reconciliation entry; marker stays `_o_` pending the new decision |
| `260814-1850-coderev-curator-turn-4.md` | per-finding annotation, F1 and F3 resolved, F2 and F4-F6 standing |
| `260813-2345-orchestrator-session.md` | `## Coherence` section appended (append-only, this pass's only cross-agent write) |

Plus the four defect records and the one decision record named above.

## What this pass did not touch, and why

`260801-1244-curator`, `fusion-workbench/agentstate.yaml` and the session
history's non-Coherence sections are outside the reconciler's write set. Three findings above land
on them and stay as records for the orchestrator's Phase-4 write: the Circle record's title and
`## Dependencies` (`260814-0813_*_the-circle-records-title-and-dependencies-still-describe-the-conventions-file-as-the-validation-case.md`), its `## Grounding snapshot` lag on the answered growth-bound
decision (`260814-0828_*_the-grounding-and-the-spec-still-call-the-growth-bound-decision-open-after-it-was-answered.md`), and the missing Turn-5 entry (`260814-2017_o`).

---

## Addendum, 20:30 — a concurrent reviewer, and two corrections to the entries above

A `coderev` Turn-5 pass over `d5b71f1..41c224c` was running while this reconciliation was being
written. It surfaced after the sections above were drafted, and two of them are wrong as first
written. Both are corrected here rather than silently edited, because the reason they were wrong is
worth keeping: two agents reading the same tree at the same HEAD from different starting points, with
no way to see each other.

**Correction 1 — the guard-config record is a duplicate and was closed.** The reviewer filed the same
defect at 20:24 as
`260814-2022_*_this-repository-cannot-set-its-own-turn-budget-because-a-test-pins-fusion-guard-json-to-the-template.md`.
That record is fuller (it carries the edit's mtime, 2026-08-14 19:35:20, which places it after the
Turn-5 task reported a green suite at 19:12; the default at `hooks/lib/config.ts:277`; the
`_turnBudget` note at `templates/fusion-guard.json:6`; and two cross-references to the same shape one
layer up) and better placed: the tension between the byte-identity pin and the documented
configuration surface is general to this repository rather than caused by this Directive, so
`shared/` is the Origin Rule's answer and this pass's placement reasoning was wrong. The record filed
here was renamed `_c_` against it and the measurement stays on disk as an independent second
observation.

**Correction 2 — the review gap is being closed, and it was not harmless.** The record
`260814-2017_*_turn-5-edited-three-shipped-surfaces-…` stays open, because
`bin/fusion-review-coverage` still reports `uncovered=3` with `reviews=5`: the reviewer's findings
exist but its review file does not, and the helper tiles declared `**Reviewed-range:**` fields rather
than filed issues. The record now says to close it on `uncovered=0`, not on the findings appearing.

**What the review found in the unreviewed commit, verified independently by this pass.** Ten stale
line-number citations into `agents/orchestrator.md` and `agents/shaper.md` were left standing in
shipped documentation by `9f4cdac`, seven of them inside the same `## Dispatch parameters` table the
commit corrected the other half of
(`260814-2022_*_ten-citations-that-bf9553f-staled-…`). Three
checked here by reading the cited line: `README-agents.md:59` cites `agents/orchestrator.md:392`,
which is a table separator row; `:61` cites `:850`, a sentence about how the review-coverage range is
derived; `:72` cites `:438`, the plan-review human gate. All three are wrong at HEAD. So the
coverage gap was not a bookkeeping formality — the commit no reviewer had opened did carry a defect
in user-facing text, and it took the review to find it.

**What this does to the verdict: nothing, except strengthen it.** The aggregate stays
`review-needed` and the flagged edge stays Artifact↔Grounding. Both halves of the Directive were and
remain met. What the addendum changes is the weight behind the recommendation — a Circle closing
`_c_` now would be closing over a red working-tree suite and an open High finding in text it
shipped.

---

## Addendum 2, 20:33 — final state

`260814-2022-coderev-curator-turn-5.md` landed at 20:31,
declaring `**Reviewed-range:** d5b71f1..41c224c` and `**Not-opened:** none`. Re-running the helper:
`commits=25`, `reviews=6`, `uncovered=0`, `verdict=covered`. The session's whole commit range is
now covered by a review.

**Two records closed on that fact, and one refiled.**

- `260814-2017_*_turn-5-edited-three-shipped-surfaces-…` closed on the condition it set for itself:
  `uncovered=0`, checked by running the helper rather than by observing that a reviewer had been
  active. Its second candidate fix does not close with it, so it was refiled as
  `260814-2033_*_a-resume-that-re-enters-at-phase-3-never-asks-whether-the-turn-it-skips-past-was-reviewed.md` —
  the resume branch reads `bin/fusion-state-drift` and not the coverage helper, so the one moment the
  check was cheap is the one moment nothing asked, and the next resumed session reaches the same
  place.
- `260814-2017_*_an-uncommitted-turn-budget-edit-…` closed as a duplicate, as addendum 1 records.

**The Turn-5 review filed four findings** (`F1` and `F2` High, `F3` Medium, `F4` Low), all four open
at the time of writing. F1, the ten stale citations, and F2, the pinned `fusion-guard.json`, are the
two that carry the Coherence flag.

**Final verdict, unchanged through both addenda: `review-needed`, flagged edge Artifact↔Grounding,
recommendation revise Artifact.** The Artifact↔Directive and Grounding↔Directive edges are clean and
both halves of the Directive are met. What is flagged is the state the Circle would close in, not
what it built.
