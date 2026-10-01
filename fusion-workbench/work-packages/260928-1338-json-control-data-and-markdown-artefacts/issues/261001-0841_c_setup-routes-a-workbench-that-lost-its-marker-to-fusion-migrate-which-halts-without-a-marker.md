Setup routes a workbench that lost its marker to /fusion:migrate, which halts without a marker
---
Setup's Step 0 keys the legacy row on `.fusion-setup` alone. Take a v12 workbench whose marker is gone, for example a clone, since R3 is untracked. `bin/fusion-write initialize` meets its stores, the codec answers `conflict/target-not-empty`, exit 6, and Setup stops and names `/fusion:migrate`. That skill finds no marker in its first block and says "Run /fusion:setup". Neither skill gets out of the loop. At `b1dcd3c6` Setup repaired this case: it ran `mkdir -p` over the stores and wrote the missing marker.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260930-2305_*_plan-fj03c-the-write-client-setup-and-the-skills-on-json.md (step 5, the marker row), 261001-0837-reviewer-fj03b-initialize-and-fj03c.md

Severity: Medium. Scope: `skills/setup/SKILL.md` Step 0 and `hooks/lib/record-write.ts` `initialize`.

**Evidence:**

- `hooks/lib/record-write.ts` `initialize`: `if (pending === null && existsSync(join(wb, SETUP_MARKER))) return { kind: "ready", how: "legacy", … }`. Without the marker the next step sends `initialize`.
- `skills/setup/SKILL.md` Step 0, the exit list:
  - "a fusion store among them (`work-packages`, `shared`) is a workbench that lost its marker, which is `/fusion:migrate`'s."
  - The `result=legacy` bullet: "its control data stays Markdown until `/fusion:migrate` converts it."
- `skills/migrate/SKILL.md` frontmatter says "Directory renames only; no record is rewritten". Its first block halts with "No fusion workbench above $(pwd). Run /fusion:setup" when `bin/fusion-workbench-root` finds no marker.
- Base: `git show b1dcd3c6:skills/setup/SKILL.md`, "Only when `OLD=0`:" `mkdir -p` and then the marker. Marker loss was repaired there.

The second bullet carries a second defect. The Markdown-to-JSON conversion is FJ04's migration, not the v12 store-name `/fusion:migrate`.

**Fix direction:** choose one of these.

- In `initialize()`, treat "no pending intent, no marker, every root entry a fusion store name or a root-anchored surface" as `legacy` and let Setup re-mark it, which restores the old behaviour.
- Stop with a message that names the manual repair (recreate `.fusion-setup`) and no skill that itself halts.

Either way, reword the `result=legacy` bullet so it does not promise a conversion `/fusion:migrate` does not perform.

**Acceptance:**

- Run Setup's Step 0 blocks, extracted from the shipped `SKILL.md`, over a copy of a v12 workbench without `.fusion-setup`. It ends either in a workbench `bin/fusion-workbench-root` finds, or in a stop message that names no skill which would itself halt on that tree.
- No sentence in `skills/setup/SKILL.md` says `/fusion:migrate` converts control data.

---
Resolved: `initialize()` in `hooks/lib/record-write.ts` answers `legacy` for a target with no pending intent and either the marker or a fusion store (`work-packages`, `circles`, `shared`) present. Setup then takes today's path: the stores, then its marker block, which writes the lost marker. The table stays disjoint, and the pending rows come first. A target with no marker and no store goes to `initialize`, so foreign entries alone (`.DS_Store`) are refused `target-not-empty` by name. `skills/setup/SKILL.md`: the `result=legacy` bullet names both cases and says no command converts the control data yet. The exit-6 sentence no longer sends anyone to `/fusion:migrate`. The issue's first fix direction, measured: Step 0's blocks were extracted from the shipped `SKILL.md` and run at the base and fixed trees. A copy of this repository's workbench without its marker went from `result=refused`, exit 6, Setup stopped and `bin/fusion-workbench-root` exit 1, to `result=legacy`, `marker=written`, root found. The copy differs from its source by `.fusion-setup` alone. A store beside `.DS_Store` gives the same change. `.DS_Store` alone is refused, exit 6, at both trees. A fresh directory is initialized, and a marked workbench is `legacy`, at both trees. `hooks/lib/__tests__/record-write.test.ts` (the empty-target case): a `work-packages` store without its marker is `legacy`, and it was red against the marker-only row.
