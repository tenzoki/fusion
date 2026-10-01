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
