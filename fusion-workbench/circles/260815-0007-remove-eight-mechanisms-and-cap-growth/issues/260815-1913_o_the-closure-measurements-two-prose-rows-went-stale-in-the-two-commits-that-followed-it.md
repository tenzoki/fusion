# The closure measurement's two prose rows went stale in the two commits that followed it

---
**Severity:** Medium — the Circle's closure criterion is a before-and-after measurement, and two of its seventeen rows no longer hold at HEAD
**Domain:** code
**Filed by:** reconciler, Phase-3 pass `history/260815-1913-reconciliation.md`, HEAD `9306f0a`
**Owner:** whoever writes the Closure note
**Affects:** `history/260815-1832-coder-after-measurement.md` `## Before and after, with deltas`, rows 8, 9 and 11
**Cross-references:** `_t_circle.md` `## Closure criterion`; `planning/260815-0029_c_plan-remove-eight-mechanisms-and-cap-growth.md` steps 14 and 15

---

Step 14 took the after-measurement at HEAD `0609945` and stamps that HEAD honestly in its own header.
Step 15 then landed `9306f0a`, which added `docs/upgrading-to-v9.md` (148 lines) and grew
`skills/help/SKILL.md` by 897 bytes. The measurement block re-run by this pass at HEAD:

| Row | recorded (at `0609945`) | at HEAD `9306f0a` | recorded delta | true delta at HEAD |
|---:|---:|---:|---:|---:|
| 8 · `skills/*/SKILL.md`, bytes | 220 439 | 221 336 | −73 695 | **−72 798** |
| 9 · `skills/*/SKILL.md`, lines | 2 463 | 2 465 | −1 169 | **−1 167** |
| 11 · `docs/*.md` + `README*.md`, bytes | 129 567 | 137 699 | −23 534 | **−15 402** |

The other fourteen rows reproduce to the byte at HEAD, including all five rule-emission figures, both
`agents/` rows, `rules/`, both hook-line rows, `bin/`, the test-file count and both Setup rows.

---

## Why it is a defect rather than a stamping quirk

The plan puts step 15 after step 14 and says step 15 "measures nothing". It does not measure, and it
adds: an upgrade note is prose on a surface the closure figures count. So the last commit of the
Circle moves three of the figures the Circle closes on, and the Closure note the Directive demands
will quote a `docs/` reduction 8 132 bytes larger than the tree shows.

The direction is knowable and worth stating with the number, the way step 14 already does for the
320 invisible `.mjs` lines: **the docs reduction is real and is 15 402 bytes, not 23 534.** The
8 132-byte difference is one file this Circle deliberately added for the projects it breaks, which is
a cost of the release rather than a saving it failed to make.

## What closes it

Either the Closure note carries these three corrected rows with the reason, or step 14's block is
re-run at the true closing HEAD. Re-running is cheap — the block is reproduced verbatim in
`history/260815-0729-coder-before-measurement.md` — but it would then need the same treatment for
whatever the closing commit itself adds, which is the regress the annotation avoids.
