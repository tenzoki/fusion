The hard growth bound covers the universal core while the path every coder dispatch reads grew 29% back in thirteen days

---

The 2026-08-27 cut was fully undone on the path that matters, and nothing measured it. The commit that closed that morning's work, `265a86fb`, records "A coder dispatch's rules block: 75.9 KB -> 65.9 KB". Re-derived at that commit by running its own `bin/fusion-rules coder` and sizing each emitted file at the commit: 3904 + 49 851 + 10 530 + 1659 = **65 944 bytes**, matching the commit's own claim. At pin `a1ecf86e` the same command emits **85 175 bytes**: **+29.2% in thirteen days**.

Where it came from, measured against `RULE_BASELINE` in `hooks/lib/__tests__/rules-emission-golden.test.ts`:

- `fusion-workbench-conventions.md` regrew **+8911 bytes** (49 851 -> 58 762) after the partition that had cut it to 49 481.
- `bounded-dispatch.md`, 9162 bytes, was added on 2026-09-08 (`b3649305`) as a conditional emission to seven agents including `coder`.

The hard bound (`GROWTH_BUDGET = 12_000`) measures the **universal core only** — `agent-setup.md` + `fusion-workbench-conventions.md` + `critical-stance.md`, floor 65 498, cap 77 498. At the pin the core is 73 317 bytes: **7819 of 12 000 bytes consumed, 65%, 4181 left**. Two consequences.

1. The baseline is the 2026-08-14 **arming** sizes, not the post-cut sizes. The 2026-08-27 cut was never banked, so it silently created headroom the following fortnight spent.
2. Everything role-specific only **reports** and never fails. `bounded-dispatch.md` (9162 B, seven agents) and `circle-records.md` (baseline 9302 -> **28 124 B, +18 822, x3.0**, on the orchestrator's path in every session) grew entirely outside the hard bound. The bound is on the universal core; the cost is on the emitted set.

`260909-1047-size-versus-bookkeeping-across-three-projects.md` measures the cut and never asks whether it held. A cut aimed at the floor without a bound on the emitted set regrows inside two weeks — this repository's own thirteen days are the evidence.

---
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
Verified in `260909-1345-verification-of-the-size-versus-bookkeeping-analysis.md` (Missing, item M1). Commands: `bin/fusion-rules coder` at HEAD and the reconstructed 2026-08-27 script; `git cat-file -s` per file at `265a86fb` and `a1ecf86e`; `RULE_BASELINE` and `GROWTH_BUDGET` read from `hooks/lib/__tests__/rules-emission-golden.test.ts`.
