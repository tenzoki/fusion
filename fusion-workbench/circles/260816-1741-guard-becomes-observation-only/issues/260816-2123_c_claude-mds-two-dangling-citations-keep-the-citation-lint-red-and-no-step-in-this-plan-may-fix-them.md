`CLAUDE.md`'s two dangling citations keep `reference-resolution-lint` red, and no step in this plan is allowed to fix them

---

The Circle record's `### Residuals stated rather than designed away` accepts that `CLAUDE.md`
"keeps a false statement until a `/fusion:curate` pass runs", and the Directive assigns
`CLAUDE.md` to the curator's gated path. That residual was priced as stale prose. It is not
prose alone: `hooks/lib/__tests__/reference-resolution-lint.test.ts` scans `CLAUDE.md`, and two
of its citations now name a deleted file.

Measured at `3c2e1c6`, `cd hooks && npm test -- lib/__tests__/reference-resolution-lint.test.ts`:

```
CLAUDE.md:29   'hooks/lib/project-relative.ts'  names a plugin file that does not exist in the tree
CLAUDE.md:129  'hooks/lib/project-relative.ts'  names a plugin file that does not exist in the tree
```

Six further dangling citations in the same run are `README-hooks.md`'s, which step 11 owns. The
two above are not reachable from any step: step 11's Files list does not include `CLAUDE.md`, and
nothing else in the plan does.

So step 11's stated verification — "`reference-resolution-lint.test.ts` and
`derivable-enumerations-lint.test.ts` green" — cannot be met by step 11, and `npm test` cannot go
green at the end of this Circle while the curator boundary holds as drawn. Step 15's release
readiness sits behind that suite.

**A second, smaller item in the same file and the same run.** `BASELINE.paths` is pinned at 1122
and the gate now resolves 1113; step 2 re-approved `BASELINE.records` (95 → 94) and left `paths`
where it was, correctly, because the deletions that moved it had not landed yet. Nothing in step
11's Changes text mentions re-approving the pin, and the step-3/6 history predicted 1117 rather
than the 1113 that stands after step 5's `project-relative.ts` deletion. The number has to be
re-measured at the end rather than copied from any of these records.

---

Context: found by `coderev` reviewing Turn 1 of this Circle, range `3d41d4a..3c2e1c6`. The two
`CLAUDE.md` citations became dangling at `3c2e1c6` (step 5's `project-relative.ts` deletion), which
is after the step-3/6 history enumerated the dangling set, so no earlier record names them.

Three shapes of answer, and the choice belongs to whoever holds the release gate:

1. **Run `/fusion:curate` inside this Circle, before step 15.** Keeps the boundary intact — the
   curator still owns `CLAUDE.md` — and pays for it with one gated pass the plan did not schedule.
2. **Give step 11 a named, minimal exception**: the two dangling path citations in `CLAUDE.md`, and
   nothing else in that file. It is the smallest edit that turns the gate green, and it puts a
   second author into a file the Directive says has one.
3. **Accept a red gate and record it.** Requires deciding, in writing, that this repository may
   tag a release over a known-red suite. This repository already carries
   `shared/issues/260810-1618_o_a-release-was-tagged-and-pushed-while-its-own-review-pass-was-still-running.md`,
   so this is the option that needs the most explicit consent.

What it costs if it stands: the Circle reaches step 15 with a red suite whose cause is correct
behaviour, the "is the suite green" question stops being answerable by running it, and the next
red case in that file hides behind two that everybody has learned to expect.

---
Also seen: 260816-2315 by coderev — the count is two only up to `3c2e1c6`; step 7b added `CLAUDE.md:30` with two more dangling paths and made the whole `fusion-guard.json` Layout row false. Recorded separately, with the four-citation measurement, in `260816-2317_o_claude-mds-dangling-citation-set-grew-from-two-to-four-at-7b-and-one-whole-layout-row-is-now-false.md`.

---
Resolved: option 1, the one this record recommended and the user chose at the Turn 1 coherence gate — `/fusion:curate` ran inside the Circle as plan step 16 and landed as `5763550`. The curator boundary held: `CLAUDE.md` was edited by the curator at its own gate, not by step 11.

Verified at HEAD by running the gate rather than by reading the diff: `cd hooks && npx vitest run lib/__tests__/reference-resolution-lint.test.ts` — 34 cases, 0 failures, no dangling reference in `CLAUDE.md` or anywhere else it scans. `hooks/lib/project-relative.ts` is named nowhere in `CLAUDE.md`. The whole suite is green with it (35 files, 653 tests), so step 15's release readiness no longer sits behind a red gate.

The second, smaller item is discharged too: `BASELINE.paths` was re-measured rather than copied from any of the three records that predicted it. That measurement, and the argument for moving one baseline and not three, are in `hooks/lib/__tests__/surface-growth-bound.test.ts` and in `260817-1032_c_*`.
