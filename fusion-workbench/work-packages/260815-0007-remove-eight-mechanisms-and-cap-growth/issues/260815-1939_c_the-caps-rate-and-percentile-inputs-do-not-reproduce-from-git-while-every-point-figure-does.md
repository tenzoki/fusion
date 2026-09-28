The cap's rate and percentile inputs do not reproduce from git, while every point figure does
---
Each of the three head-room figures rests on three derived properties: it sits inside the surface's worst measured day, it is two to three weeks of that surface's sustained rate, and it stands above the p95 honest single-commit addition. The worst-day figures reproduce exactly. The sustained-rate and percentile figures do not reproduce under any of four replay methods, and the corroboration rates are off by factors of 1.5x and 8x. The head-rooms may still be the right numbers; the argument that they are is not currently checkable.
---
**Severity:** Medium. The numbers themselves are defensible and the cap works. What does not hold is the derivation the cap is *justified* by, and that derivation is what a future re-baseliner will read before moving a figure.

**What I could reproduce exactly** (tree-snapshot replay over the linear history; `git log --merges` is empty, so consecutive-commit diffing is valid):

| Figure | Claimed | Measured | |
|---|---|---|---|
| `agents/` worst day | +50 725 (2026-05-16) | +50 725 (2026-05-16) | exact |
| `skills/` worst day | +38 025 (2026-05-19) | +38 025 (2026-05-19) | exact |
| `agents/` peak day, Aug window | +66 803 | +66 803 (2026-08-11) | exact |
| `skills/` peak day, Aug window | +28 367 | +28 367 (2026-08-10) | exact |
| `agents/` at 2026-08-05 | 289 958 | 289 958 | exact |
| hook test lines at 2026-08-05 | 19 838 | 19 838 | exact |
| `agents/` / `skills/` at `9a7da8e` | 460 292 / 294 134 | 460 292 / 294 134 | exact |
| all three baselines | 399 843 / 220 439 / 19 453 | identical, file by file | exact |
| arming arithmetic | 18 799 + 699 − 45 = 19 453 | 18 799 ✓, 576+123=699 ✓, 1204−1159=45 ✓ | exact |

**What does not reproduce.**

*The `agents/` sustained rate, claimed 851 bytes/day over 2026-06-02 to 2026-07-31* (`surface-growth-bound.test.ts:88-90`, and the step report's table). Three readings of "growth", all measured over that named window:

```
net total delta          279 073 -> 288 373 = +9 300   over 60 days =   155 B/day
net existing-file delta                       -14 363   over 60 days =  -239 B/day
positive-only existing-file                  +38 467   over 60 days =   641 B/day
```

None is 851. The closest arrival is `38 467 / 45 = 855`, but 45 is neither the calendar length of the window (60) nor the number of commit-days in it (20, measured).

*The corroboration rates* (`:104-107`), stated as "deliberately not used to set the figures" but presented as measurements:

```
agents/  claimed 10 989 B/day    measured 170 334 / 10 days = 17 033 B/day
skills/  claimed  1 029 B/day    measured  83 981 / 10 days =  8 398 B/day
```

The `skills/` figure is out by a factor of eight. Both peak-day figures in the same sentence are exact, so this is a denominator problem in one class of figure rather than a wrong window.

*The p90/p95 per-commit additions*, claimed `+7 216 / +12 082` for `agents/`. Measured over the 339 replayed commits: `840 / 3 681` counting every commit, `6 095 / 9 042` counting only the 62 commits that touched an existing agent prompt. Neither pair is the claimed one.

*Two smaller slips.* "337 commits across three months" — I count 340 in `2026-05-04..2026-08-05`. And the window is stated as starting "2026-05-05 (the repository's first commit)"; the first commit is `b05b423`, 2026-05-04.

**The consequence, which is the reason to fix rather than to note.** The head-room's second justifying property is "two to three weeks of the surface's own sustained rate, so a cleanup comes due on that cadence" — 21, 14 and 19 days respectively. That property is what tells a future maintainer whether a red bound means "you have grown unusually" or "three weeks have passed". Against the rates I measure it is not 21 days for `agents/`: it is either 116 days (net) or 28 days (positive-only existing-file) in the calm window, and about one day against the surface's own August rate of 17 033 B/day. The figure the header offers as the calm cadence and the figure the same header offers as corroboration disagree by two orders of magnitude, and neither is the one written down.

**Direction.** The replay was run once and its output was not kept. Commit the replay as a script under `hooks/` or `bin/` — the surfaces are already declared in `surface-growth-bound.test.ts` and the tree-snapshot method is ten lines of shell — so that the next re-baseliner recomputes rather than re-derives. Failing that, restate the three head-rooms on the worst-day property alone, which is the one that does reproduce, and drop the cadence and percentile claims rather than leaving unreproducible figures where they read as measurements.

`speculation:` the claimed `agents/` calm rate of 851 B/day is suspiciously close to the 800 B/day the same report gives for `rules/`, and the `rules/` calm rate I measure over the same window is 1 029 B/day, which is in turn the claimed `skills/` corroboration figure. That pattern is consistent with figures being transposed between surfaces, but I have not established it and it should not be treated as a finding.

**Found by:** coderev, review of `1e29572..9306f0a`, commit `0609945`.

---

**Resolved:** 2026-08-16, coder, in `hooks/lib/__tests__/surface-growth-bound.test.ts`.

Took the second of the two directions this record offered. `## Where each
head-room comes from` now rests on the worst-measured-day property alone, which
reproduces exactly for all three surfaces (`agents/` +50 725 on 2026-05-16,
`skills/` +38 025 on 2026-05-19, hook tests +5 247 on 2026-08-04, plus the
+4 026 of 2026-08-01, all re-measured in this checkout). The section names the
replay method that produces them — day-end snapshots from `b05b423` (2026-05-04)
to `66e4a698` (2026-08-05), 340 commits over 40 commit-days, no merges, largest
consecutive-day rise — so the next re-baseliner recomputes rather than re-derives.

The sustained-rate figures, the p90/p95 per-commit figures and the two
corroboration rates are gone. A paragraph names all three claims and says they
reproduced under no replay method, with your measured counter-figures (17 033 vs
10 989, 8 398 vs 1 029) and this record's stamp, so they are not restored from an
older commit. The August peak days survive because they do reproduce.

**No head-room moved:** 18 000 / 20 000 / 2 500 are byte-identical, and no
baseline constant was touched. What changed is the argument, not the numbers.

The first direction — committing the replay as a script under `hooks/` or `bin/`
— was out of this task's file scope and remains available. The method is now
written down in the header, which is the cheaper half of it.
