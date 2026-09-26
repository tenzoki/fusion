The OUT_HISTORY arm outlived the last prompt naming it
---
`rules/workbench-path-resolution.md` `## The key table`, the `OUT_HISTORY` row, says the arm "survives only while the last skill bodies naming it do, and goes with them". No prompt or skill body names `OUT_HISTORY` any more, and `bin/fusion-paths` still carries the arm and lists the key in `ORDER`. The rule text states the intended coupling correctly; the code did not follow it, so the fix is `code-implementer` work. Found by the curator survey `260926-0720-curator-run.md`.
---
**Filed by:** policy-curator, Kai Stalmann <ks@qantr.com>

**Evidence:**

- `grep -rn OUT_HISTORY agents skills` returns 0 lines at `80a3d988`.
- `grep -n OUT_HISTORY bin/fusion-paths` returns the header note, the value arm and the `ORDER` entry.
- The last skill body naming the key lost it at `115be68d` (2026-09-10), per `git log -S OUT_HISTORY -- skills`.

`SCAN_HISTORY` is not affected: `skills/cadence/SKILL.md` and `skills/archive/SKILL.md` still read it.

**Acceptance test:** `grep -n OUT_HISTORY bin/fusion-paths` returns nothing, the `OUT_HISTORY` row in `rules/workbench-path-resolution.md` `## The key table` is then updated in the same change (that file is the policy-curator's, so the row edit may be filed back as a ledger entry), and `npm test` stays green.
