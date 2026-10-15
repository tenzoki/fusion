/fusion:migrate Step 7 and Step 1 carry shell variables across separate Bash calls
---
Step 7 says "Set `M="$FUSION_PLUGIN_ROOT/bin/fusion-migrate"`" once and then names `"$M" status`, `"$M" survey`, `"$M" repair --list`, `"$M" run`, `"$M" resume`, `"$M" rollback` and `"$M" repair --apply` as separate calls. Step 1 sets `ROOT` inside its block and then says `cd "$ROOT"`, and Step 7 says every call "runs from `$ROOT`". Each Bash call is a fresh shell, so in a later call `"$M"` expands to the empty string (exit 127) and `cd "$ROOT"` to `cd ""`. Commit `42d8f1bc` fixed exactly this class in Step 6 ("the write runs in a fresh shell") and left Step 7 and Step 1 as they were.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261015-1310-reviewer-closing-pass-over-the-migrate-step-6-package.md`

**Evidence.**

- `skills/migrate/SKILL.md` `## Step 7 — Repair, then migrate to JSON control`, the paragraph after the Node block: "Set `M="$FUSION_PLUGIN_ROOT/bin/fusion-migrate"`; every call below runs from `$ROOT`." Every later command in the step is spelled `"$M" …`.
- `skills/migrate/SKILL.md` `## Step 1 — Locate the workbench`: the block assigns `ROOT=…`; the prose after it says "`cd "$ROOT"`".
- `hooks/lib/__tests__/reference-resolution-lint.test.ts`, the 2026-10-15 re-approval note on `BASELINE`: the Step 6 commands "now spell `$FUSION_PLUGIN_ROOT/bin/fusion-citation-sweep` each, so each runs in a fresh shell". `hooks/lib/__tests__/store-name-migration.test.ts`, `FRESH_ENV`: "shell variables do not outlive the call that set them".
- `grep -n 'Set `' skills/*/SKILL.md` finds this one instance only; the class is confined to this file.

**Fix direction.** Spell `"$FUSION_PLUGIN_ROOT/bin/fusion-migrate"` in each Step 7 command, as Step 6 now does, and fold the `cd` into Step 1's block or state that the working directory persists while variables do not.

**Acceptance.** No command in `skills/migrate/SKILL.md` depends on a variable set in another call; a test lifts each Step 7 command and runs it under `FRESH_ENV`, or asserts that no `"$M"` remains.

---
Resolved: 2026-10-15, plan `261015-1559-plan-migrate-step-7-recognises-json-control-without-a-local-session.md` steps 2 and 3. Every command in `skills/migrate/SKILL.md` `## Step 7 — Repair, then migrate to JSON control` now spells `"$FUSION_PLUGIN_ROOT/bin/fusion-migrate"` in full, and no `"$M"` or "Set `M=`" remains. `## Step 1 — Locate the workbench` folds `cd "$ROOT"` into its block and says the working directory persists between calls while shell variables do not, so no later command names the root. Case (h) in `hooks/lib/__tests__/store-name-migration.test.ts`, `describe("Step 7 as shipped: the survey block routes every cell of session by state")`, asserts that no `"$M"` or "Set `M=`" remains, that `$ROOT` stands only inside Step 1's block, and that the block carries `cd "$ROOT"`.
