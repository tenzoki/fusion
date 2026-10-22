The migrate and setup skills name helper output and exit paths the helpers do not provide
---
Four places in `skills/migrate/SKILL.md` and `skills/setup/SKILL.md` describe helper behaviour the helpers do not have.

1. Migrate Step 7 says a person half "comes only from the git author of the file's first commit", offered to the user. `repair --list` prints no offered value, and the skill omits the `text` question form the repair helper uses.
2. Migrate's "tracked entries only" option moves a whole directory with `git mv`/`mv` when its destination is absent, so the untracked children go with it, contrary to "leaves the untracked ones".
3. Setup treats every `fusion-write initialize` exit 6 as "no fusion store, move entries away", while the helper also returns 6 for `manifest-present`.
4. Setup's no-Node fallback rewrites the whole `.fusion-setup` marker, dropping keys the Node path preserves.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261014-0830-reviewer-closing-pass-over-the-prior-module-bundle-package.md`

Evidence:

- Verified by the reviewer: `hooks/migrate.ts:582` prints `ask=` with key, form, ask, choices and when, and no offered value.
- Reported by the delegated pass, not re-read by the reviewer:
  - `hooks/lib/legacy-repair.ts:113` computes `offered`; the `text` form is used at `:223` and `:279`.
  - `skills/migrate/SKILL.md:132`, `fold_store`.
  - `skills/setup/SKILL.md:57` against `bin/fusion-write:119-121`.
  - `skills/setup/SKILL.md:76`.

Fix direction: add `offered` to the `ask=` line and document the `text` form; in tracked-only mode always descend and fold entry by entry; split setup's exit-6 message by the helper's stated reason; make the fallback merge rather than overwrite, or refuse without Node.

Acceptance: each of the four passages matches the helper it names, checked against a run of that helper on a fixture workbench.

---
Resolved: step 8 of `261022-1611-plan-prior-bundle-closing-review-follow-ups.md`. (1) `hooks/migrate.ts` `## The git pass`: `repair` passes the person of the file's first add as `offers`, and each `ask=` line carries `offered` as a seventh field (`-` when none), asserted in `hooks/lib/__tests__/migrate.test.ts`; `skills/migrate/SKILL.md` `## Step 7 — Repair, then migrate to JSON control` names the `text` form, the condition as the sixth field, offers the seventh as an option, and says the helper offers only the first-add author and writes only the user's answer. (2) `skills/migrate/SKILL.md` `## Step 4 — Apply`: `fold_store` in tracked-only git mode descends into every directory whose destination is absent, so an untracked child stays (a fixture run at HEAD moved two untracked files with their directory; now both stay, `left=2`). (3) `skills/setup/SKILL.md` `### Superseded-format check (CRITICAL — refuse, do not migrate)`: exit 6 splits on the reason; `manifest-present` stops, saying a JSON-controlled workbench stands and Setup run again reuses it, per `hooks/lib/record-write.ts` `## Initialize, Setup's route to a new workbench`. `manifest-present` arises only when a manifest lands between `inspect` and `initialize`; the fixture run injected one. (4) The no-Node marker fallback writes a marker only when none exists and otherwise sets `plugin_version` in place, every other key kept.
