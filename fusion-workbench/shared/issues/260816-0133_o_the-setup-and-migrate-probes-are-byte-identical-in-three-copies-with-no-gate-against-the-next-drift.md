The setup and migrate probes are now byte-identical in three copies, and nothing would catch the next divergence

---
`c0e179a` narrowed Setup's bracket-marker probe so it runs the same `find` as migrate's reformat pass, closing the deadlock. Verified: the three occurrences are **byte-identical, 218 characters each** — `skills/setup/SKILL.md:67`, `skills/migrate/SKILL.md:54` and `skills/migrate/SKILL.md:87`. But they are three copies of one expression, not one source. The defect being fixed was two copies drifting apart; the fix raises the copy count from two to three and adds no mechanism that would notice the next drift. `hooks/lib/__tests__/path-literal-lint.test.ts` gates store-path literals in these same files and would not see this.

---

## Verified, mechanically

Extracted with a regex over both files at `3a0408a`:

```
setup:67    len=218
migrate:54  len=218
migrate:87  len=218

{ [ -d "$WB/shared" ] && find "$WB/shared" -type f -name '*[[]*[]]*.md' 2>/dev/null; [ -d "$WB/circles" ] && find "$WB/circles" -mindepth 2 -type f -name '*[[]*[]]*.md' 2>/dev/null; } | grep -E '\[[oatcibspd]\]-[^/]*$'
```

Identical byte for byte; only the tail differs by purpose (`| head -1`, `| wc -l`, `> "$RTMP"`). The citation `skills/migrate/SKILL.md:54,87` in `skills/setup/SKILL.md:60` lands on exactly those two lines.

**The narrowing itself is correct.** `archive/`, `stashes/` and `.migration-v2-backup/` are all workbench **root** entries (`rules/fusion-workbench-conventions.md:47`, `skills/archive/SKILL.md:205`), so `shared/` at any depth plus `circles/` from depth 2 excludes all three by construction, exactly as the paragraph claims. A flat `circles/*.md` is out of reach of this probe and is caught by the Circle-file probe instead when it carries the stamp shape, and ignored by migrate (`SKIPPED`) when it does not — the three probes tile without overlap. The reasoning at `skills/setup/SKILL.md:60,62` holds as written.

## What is not closed

The record this fix closes (`circles/260805-2005-.../issues/260806-0022_c_setup-klammer-probe-und-migrate-reformat-decken-verschiedene-baeume.md`) is about two probes that were written once and then edited independently. Nothing about the fix prevents that from happening again — the next person who narrows or widens one of the two files has no signal that two other lines must move with it. The `skills/setup/SKILL.md:60` prose says "do not widen it" and cites migrate, which is guidance; guidance is what failed the first time.

## Fix direction

A test asserting the three occurrences are byte-identical, in the shape the repo already uses for this class:

- `hooks/lib/__tests__/path-literal-lint.test.ts` already reads every `agents/*.md` and `skills/*/SKILL.md`. The check is: extract every occurrence of the `{ [ -d "$WB/shared" ] … }` prefix through the closing `grep -E`, assert exactly three, assert all three equal. About ten lines.
- The failure message should name the drift-fix, not the count: *"setup's bracket probe and migrate's reformat candidate list must select the same files; three sites, one string."*

The `hook-tests` surface has 2 320 lines of head-room, so ten lines is affordable. Do **not** try to factor the expression into a shared file — a skill body is a prompt, not a shell library, and there is nowhere for it to live; the pinned-duplication shape is the right one here.

## Alternative worth naming before implementing

If a third copy is judged too many to pin, the other cut is to have Setup call the migrate survey rather than restate its query — but migrate's survey is a 4 kB block that writes counters and temp files, so this would be a larger change than the defect warrants. Named so the next reader does not have to rediscover why it was not taken.

**Found by:** coderev, reviewing `f4f01b0..3a0408a` (commit `c0e179a`).

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: The probe expression is one unique 218-character string across `skills/setup/SKILL.md:67`, `skills/migrate/SKILL.md:54` and `:87`, and no test asserts the equality. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.
