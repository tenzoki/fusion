# Rules-emission golden — the cut log, the retired core-bound argument and the arming's discarded properties, 2026-08-05 to 2026-09-11

Rolled verbatim out of two hook-test files on 2026-09-22 (step 1 of `260922-0922_*_the-51-open-issues-at-451bb312-worked-autonomously-as-one-package.md`), the funding cut for that plan's test-bearing steps, on the model of `260921-1855-surface-growth-bound-arming-and-re-baseline-log-2026-08-15-to-2026-09-05.md`. Four passages, each named by where it stood at `451bb312`: from `hooks/lib/__tests__/rules-emission-golden.test.ts` the argument that retired the universal-core growth bound (header lines 71 to 91), the paragraph on why the budget only reports (header lines 93 to 102) and the event-by-event cut log with the standing cleanup table inside the `RULE_BASELINE` doc comment (lines 247 to 336); from `hooks/lib/__tests__/surface-growth-bound.test.ts` the paragraph on the arming's two discarded properties and its corroboration rate (header lines 81 to 90). The comment prefixes are stripped and, because the workbench sweep gate refuses a store-prefixed citation, the five citations that carried a `circles/…` or `shared/…` store segment and the one that carried a marker letter are written in the storeless wildcarded form the sweep itself would have produced; "below" in the third passage still means the `RULE_BASELINE` map that follows it in the test file. Nothing else is changed, so a reader can match the text against `git log` on the two files.

## The retired universal-core growth bound, and the argument that made retiring it safe (rules-emission-golden.test.ts)

THE UNIVERSAL-CORE GROWTH BOUND WAS RETIRED ON 2026-09-11, AND THIS IS THE
ARGUMENT THAT MADE IT SAFE. From its arming on 2026-08-14 it FAILED the suite
when the files every agent loads grew more than `GROWTH_BUDGET` past their
baseline. It is gone because THE DISPATCH-PATH BOUND at the foot of this file
dominates it. That bound counts every universal-core byte inside the `rules
emitted to <a>` component of all eleven paths, at ZERO head-room, so one core
byte is charged eleven times there and once here, and whichever bound has less
margin binds first. Measured at `9ff123c5`: the core stood at 74 873 bytes
against a budget of 77 498, 2 625 of margin, while the tightest path,
`reviewer`, stood at 188 842 against a baseline of 189 012 — 170 bytes. 170 is
less than 2 625, so every core addition the retired bound would have refused
is already refused by the per-path bound, and 2 455 bytes earlier. Retiring it
opened no window; it removed a second, weaker assertion over bytes that are
bounded harder two hundred lines down. The defect that asked for this carries
the other half of the same argument — the core bound could see neither
`CLAUDE.md` nor a conditionally emitted rule file, and the per-path bound
measures both:
`260909-1346_*_the-rule-growth-bound-covers-the-core-while-the-hottest-path-grew-29-percent-back.md`.
Its failure text and the two synthetic cases that proved that text went with
it; what `growth()` itself does is proved on synthetic sizes in
`surface-growth-bound.test.ts`.

## Why the budget only reports (rules-emission-golden.test.ts)

WHY THE BUDGET ONLY REPORTS. Told once, in `surface-growth-bound.test.ts`'s
`WHY THIS FILE EXISTS`: the 2026-08-05 conversion of the ratchet into a report
(decision 260805-1559, a ratchet makes the first finding-driven addition
unlandable), and the measurement that took half of it back on 2026-08-14 — the
largest deletion in this project's history back above its pre-deletion peak in
days,
`260812-0022-where-the-complexity-comes-from-and-what-would-have-to-go.md`,
so the binding constraint is the RATE of addition. That half is what the
retirement above hands to the per-path bound. Role-specific text has only ever
reported: it is bought by the agents that need it.

## The cut log inside the `RULE_BASELINE` doc comment, and the standing cleanup request (rules-emission-golden.test.ts)

The first five figures below are the 2026-08-14 arming sizes, taken when all
five were the core; the last three are 2026-08-05 post-cut, at v5.9.1. How the
number moved to get here, event by event — kept because each line names which
cut, or which arming, produced which figure:

  150 817 — 2026-08-05, plan step 1 (introduced).
  131 685 — 2026-08-05, plan step 2 (the three-layer split by addressee).
  128 555 — 2026-08-05, plan step 4 (the stash-and-lock shard).
  111 810 — 2026-08-05, the pulled-forward C9 step 3 (the conventions file
            partitioned by addressee).
  111 766 — 2026-08-05, release preparation (five dead workbench paths).
   90 878 — 2026-08-06, textschicht step 8 (the guard-internals audience
            gated on `bin/fusion-plugin-cwd`).
   80 670 — 2026-08-12, protected-path removal step 9.

            WHAT EACH CUT DID, AND WHAT IT COST PER ROLE, IS NOT RESTATED
            HERE. Every one of the eight is written up where it was made:
            the plan
            `260804-2356_*_plan-ausstieg-kontextsteuer-und-auslieferung.md`
            carries the projections and the per-role tables, and the step's
            own history log carries what it measured — `260805-0717-coder-step2-drei-schichten.md`,
            `260805-0905-coder-step4-stash-and-lock-shard.md`,
            `260805-1003-coder-step4a-konventionsdatei-partitionieren.md`,
            `260805-1200-coder-step6-release-vorbereitet.md` in the same
            Circle's `history/`, and `260812-1500-coder-the-always-on-rule-its-emission-and-every-prose-citation.md`
            for the last. The addressee split itself is decision
            `260805-0709_*_wohin-gehoert-die-forensik-aus-protected-path-discipline.md`.

            ONE FINDING FROM THAT LOG IS KEPT, because it is the reason the
            2026-08-12 entry does not re-cut the baseline: RULE_BASELINE lost
            `protected-path-discipline.md`'s entry and nothing else moved, so
            the five remaining core sizes below are still the 2026-08-05 ones
            and the oversized entry had been masking 9 402 bytes of real
            growth. With the mask gone the budget report fires for every
            role, correctly: re-baselining there would have absolved that
            growth in the same edit that removed the thing hiding it.
   86 573 — 2026-08-14, at the ARMING of the universal-core growth bound.
            NOT A CUT, and the only entry in this log that is not one. No byte
            was removed and no rule file was touched for its size. What moved
            is the baseline: the five core entries below take the sizes the
            regenerated golden reported at this moment, so that the hard bound
            armed in this step has a reference to bound growth FROM. The three
            role-specific entries are untouched and still stand at their
            2026-08-05 post-cut sizes, which is why the diff of this change
            shows exactly which half moved. Capability C10 of Circle
            `260801-1244-curator`, plan step 5. The core-only role
            stands at 86 573 and the measured high-water mark, the
            orchestrator, at 111 474.

            THE STANDING CLEANUP REQUEST, KEPT AS TEXT. A re-baseline absolves
            the growth it re-baselines over, so the report this arming
            silences is written down here rather than disappearing with the
            number. Measured immediately before the re-baseline, every one of
            the five roles was over its head-room — the state the 2026-08-12
            entry above describes, still true on the day this one was written:

              role                                      emitted  budget  over by
              (core only)                                86 573  75 654   10 919
              design-diagrams.md                         92 246  81 327   10 919
              circle-records.md                          98 522  84 956   13 566
              circle-records.md + design-diagrams.md    104 195  90 629   13 566
              circle-records.md + stash-and-lock.md     111 474  94 206   17 268

            The whole of that overshoot is UNIVERSAL-CORE growth: 22 919 bytes
            added to the five always-on files since the 2026-08-05 cut, against
            12 000 of head-room. Per file, `fusion-workbench-conventions.md`
            +17 356, `critical-stance.md` +4 641, `agent-setup.md` +721,
            `user-facing-output.md` +101, `decision-record-examples.md` +100.
            The role-specific files grew too and are NOT absolved: their
            entries do not move here, so `workbench-stash-and-lock.md` (+3 702)
            and `circle-records.md` (+2 647) still count against the report.
            The spec's table for C10 reads 107 bytes lower per role because it
            was measured at HEAD d7786eb, before this Circle's own steps added
            that much to `fusion-workbench-conventions.md`.

            WHY THIS IS AN ARMING AND NOT THE SILENT RAISE THIS FILE WARNS
            AGAINST. The rule it overrides was written for a REPORTING
            instrument, where the baseline's only job is to keep the report
            actionable. Under a BLOCKING gate the baseline acquires a second
            job, defining what the gate blocks on, and a gate armed on a corpus
            already 22 919 bytes past its head-room ships red on the day it
            lands. Cutting the corpus back first was the alternative and was
            explicitly removed from this Circle's scope; shipping the red suite
            was the third option and was not seriously proposed. The user chose
            the re-baseline on 2026-08-14, having been shown that it overrides
            the position recorded here. What that position protects against —
            a raise that quietly retires the cleanup the report was asking for
            — is preserved by the table above, which outlives the number.
            Binding record:
            `260814-0738_*_how-is-the-always-on-growth-bound-armed-when-the-corpus-is-already-over-budget.md`.

## The arming's two discarded properties and its corroboration rate (surface-growth-bound.test.ts)

THE ARMING CLAIMED TWO FURTHER PROPERTIES AND A CORROBORATION RATE; all three
are gone, named here so nobody restores them from an older commit. "Two to
three weeks of the surface's own sustained rate" and "above the p95 honest
single-commit addition" reproduce under no replay method, and the rates are out
by large factors: over 2026-08-05..08-15 `agents/` measures 17 033 bytes a day
against a stated 10 989, `skills/` 8 398 against 1 029 (issue 260815-1939). No
head-room moved and nothing was recomputed to fit — a figure no method
reproduces reads as measured, which is worse than none. The peak days of that
window DO reproduce and still corroborate: `agents/` +66 803 (2026-08-11) and
`skills/` +28 367 (2026-08-10), both far above every head-room here.
