# coder — task 8, protect `.claude/rules/**`

**Date:** 2026-08-09 19:42
**Task:** `I:260801-1020-claude-rules` (queue task 8)
**Source:** `shared/issues/260801-1020_p_guard-protects-rules-but-not-claude-rules.md`
**Status:** Complete

## What was done

Resolution 1 of the two the record offered: `.claude/rules/**` joins `rules/**` on the
guard's shipped `protectedPaths`. The second resolution — document a deliberate asymmetry —
was searched for and has no basis; see below.

Changed:

- `hooks/config.json`, `hooks/config.example.json` — `.claude/rules/**` added directly after
  `rules/**`.
- `hooks/lib/rules-write-exemption.ts` — the two comments that documented the pending state.
  The `RULE_DIR_PATTERNS` docstring said `.claude/rules/**` was "not on the protected list
  today" and named the record it was waiting for; it now records that both roots are live and
  cites the record in the `_*_` wildcard form the marker convention requires. The
  `isProjectRulePath` docstring said nothing under `.claude/rules/` is "measured or refused
  with or without the flag"; it now states that the reach is the same in both roots.
- `hooks/lib/__tests__/config.test.ts` — the shipped-list assertion names the new entry, and
  a second case derives the invariant instead of restating it: every pattern in
  `RULE_DIR_PATTERNS` must appear on the effective protected list, or the exemption is a
  grant over something nobody protects. That is the shape of this defect, so the gate is
  written against the shape rather than against the one instance.
- `hooks/lib/__tests__/guard-rules-write-integration.test.ts` — the case "allows a write to
  .claude/rules/, but NOT because of the flag" was written to flip when this record closed.
  It is now "protects the second rule root, and exempts it on the same terms": a deny without
  the flag, and an allow plus one `guard_advisory` with it, through the real hooks in a
  spawned project. It moved out of the Bash-surface block into the write-tool block, where it
  always belonged — it was never a shell case.
- `hooks/lib/__tests__/rules-write-exemption.test.ts` — the mirror of the existing "a project
  that declares `rules/**` ITSELF loses the flag" case, for the second root.
- `hooks/lib/__tests__/helpers/guard-harness.ts` — `SEED_FILES` comment; the seeded
  `.claude/rules/local.md` now belongs to the protected group.
- `README-hooks.md` — two paragraphs. "Both rule roots are protected, and they are protected
  identically", under the matching rules; and "A declared list does not grow when the
  plugin's does", under per-project configuration.

## The search for a reason not to do this

The record judged resolution 2 right only if a reason exists that nobody wrote down. Four
places were checked and none carries one:

1. **The records that name the asymmetry both call it a defect.** The analysis this issue was
   filed from — `shared/analyses/260801-1020-normative-surface-drift-gap-analysis.md`,
   Question 3 — closes with "A defect surfaced while checking this". The answered decision
   `shared/decisions/260801-1020_i_may-any-fusion-writer-touch-rules.md` lists it under
   Constraints: "`.claude/rules/**` is currently unprotected (see the linked issue). That
   defect should be fixed independently, and its fix narrows option 3's appeal, since
   trimming `protectedPaths` would then expose more."
2. **The code was already written for the closed state.** `RULE_DIR_PATTERNS` has carried
   `.claude/rules/**` since the flag shipped, with a comment naming this record as the thing
   it waits for.
3. **Nothing fusion runs writes into `.claude/rules/`.** `/fusion:unlock` writes
   `.claude/settings.local.json`, which is not under the new pattern; no skill or agent
   targets the directory. So protecting it takes no capability away from fusion itself.
4. **The mechanism reaches it without a special case.** `enumerateProtected`'s `WALK_SKIP` is
   `.git`, `node_modules` and `.guard-state`; `.claude` is not skipped, `shouldDescend`
   descends it on the new pattern's prefix, and `globToRegex` escapes the leading dot. The
   one plausible technical reason — that a dot-directory is unreachable to the walk — is not
   true, and the integration case proves it end to end rather than by reading.

Against that: `bin/fusion-rules` emits from `./rules/` and `.claude/rules/` in one pass with
no precedence, an agent reads every emitted path, and `rules/context-lean-claude-md.md`
assigns the heavier project-wide material to the second one. The protection was inverted
relative to the value of the content.

## Merge semantics for consumers

Asked because it decides who picks the entry up. The template at
`templates/fusion-guard.json` declares **nothing** — no `guard` key at all — and says so in
its own `_inherits` note: the list is deliberately not restated so a later addition arrives
without the file being touched. So every project seeded by `/fusion:setup` gets
`.claude/rules/**` on its next guarded tool call, with no action.

The exception is a project that hand-declared `protectedPaths` in its own `fusion-guard.json`.
The merge is per leaf, so a declared list is taken exactly as written and inherits nothing
further; such a project keeps its own list and does not gain the entry. That is the documented
behaviour rather than a surprise, but nothing told a consumer to re-check after an update, so
`README-hooks.md` now does, naming this as the first entry to which it applies.

## Left for others

`rules/protected-path-discipline.md:11` enumerates the shipped list as eight entries and is
now incomplete. The queue's scope note says a statement made false by a task is a finding to
file, not scope to absorb, so it is filed:
`shared/issues/260809-1942_o_protected-path-discipline-enumerates-the-shipped-list-and-now-omits-one-entry.md`.
`README-hooks.md:260` names four of the entries inside a different argument, already omitted
four, and reads as illustrative — checked and left alone.

The source record keeps its `_p_` marker: the dispatch withheld the rename, and the
orchestrator closes it after its own validation. Its `Source:` line in `tasklist.md` still
cites the older `_o_` filename.

## Verification

`npm run build && npx vitest run` from `hooks/`: **35 files, 1153 tests passed**. The baseline
before this work was 1150 passed with **one** failure —
`reference-resolution-lint.test.ts` flagging the stale `_o_` marker in the citation at
`rules-write-exemption.ts:281`, which this task's comment rewrite removes. Nothing was
committed; the working tree is left for the orchestrator.
