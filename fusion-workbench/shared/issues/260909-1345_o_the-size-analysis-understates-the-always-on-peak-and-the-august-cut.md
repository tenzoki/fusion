The size-versus-bookkeeping analysis understates the always-on peak by 24% and the 2026-08-27 cut by 40%

---

`260909-1047-size-versus-bookkeeping-across-three-projects.md` finding 12 states the always-on rule set "climbed from 45 KiB to 108 KiB by late July" and recommendation 4 quotes "108 KiB at its peak". Re-derived per-commit over every commit touching `bin/fusion-rules` or `rules/` at pin `a1ecf86e`, the set stood at 85.0 KiB on 2026-07-18 (`046453ee`), crossed 108 KiB on 2026-08-02 (`c2c2a048`, 107.6 KiB) and peaked at **141.7 KiB on 2026-08-04 17:20 (`98c9363e`)** — 145 144 bytes, driven by `protected-path-discipline.md` at 50 559 bytes. The report's "108 KiB in July" is an early-August value produced by its weekly sampling; the true peak is never reported.

Finding 15 describes the 2026-08-27 cut as two commits taking the floor from 96.4 to 72.5 KiB, a 24 KiB reduction. Both quoted commits verify exactly (`8ac9a533` 08:45:11, `9c056b6c` 09:25:02, 96.36 -> 91.94 -> 72.50 KiB). But a **third** commit the same morning, `265a86fb` at 11:03:12 ("the language cascade and the backlog mandate leave the floor"), took it further to **62.8 KiB**. The day's cut was 96.4 -> 62.8 KiB = 33.6 KiB across three commits over two hours eighteen minutes, not 24 KiB across two commits forty minutes apart. `265a86fb` falls inside the report's own after-window, so the before/after direction is unaffected, but recommendation 4's price ("12 percentage points of fix share" per 24 KiB) is computed against a treatment 40% larger than stated.

---
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
Verified in `260909-1345-verification-of-the-size-versus-bookkeeping-analysis.md` (Corrected, items C1 and C2). Commands: per-commit extraction of unindented `emit_if_exists` lines from `bin/fusion-rules` with `git cat-file -s` on each named rule file, over the 202 commits touching `bin/fusion-rules` or `rules/`.
