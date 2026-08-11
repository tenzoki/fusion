# Record `260811-1547` states its proposed lint has no exceptions, and a shipped skill already is one

---

**Severity:** Low — an unchecked claim about the tree, inside the record filed against an unchecked claim about the tree
**Domain:** code
**Filed by:** coderev (Turn 3 review, range `7d9efc8..adaa545`)
**Affects:** `shared/issues/260811-1547_o_the-orchestrator-prompt-cites-a-fusion-monitor-reset-skill-that-does-not-exist.md` (the "Suggested direction" and the second acceptance criterion)
**Cross-references:**
`skills/setup/SKILL.md:49` (the line the proposed rule would fail on);
`hooks/lib/__tests__/reference-resolution-lint.test.ts` (the lint the record proposes extending);
`rules/critical-stance.md` §3

---

## What is wrong

`260811-1547` is a correct record — `/fusion:monitor-reset` really does not exist, and
`agents/orchestrator.md:192` really does justify an instruction with it. Its proposal carries a claim
of the same kind it was filed against:

> Extend `reference-resolution-lint.test.ts` to resolve `/fusion:<name>` against `skills/*/SKILL.md`
> … **Built-in Claude Code commands are not in that namespace, so the rule has no exceptions to
> carve.**

and, as acceptance criterion 2:

> Every `/fusion:<name>` occurrence in the shipped prompts resolves to a directory under `skills/`
> holding a `SKILL.md`, checked by a test rather than by hand.

There is already an exception, in a shipped skill body.

## Measured

Every `/fusion:<name>` in `agents/`, `skills/`, `rules/`, `docs/`, `README*.md` and `CLAUDE.md`,
resolved against `skills/<name>/SKILL.md`:

```
OK    /fusion:archive          OK    /fusion:memo
OK    /fusion:cadence          OK    /fusion:migrate
OK    /fusion:circle-pop       MISS  /fusion:migrate-workbench-v2
OK    /fusion:circle-stash     MISS  /fusion:monitor-reset
OK    /fusion:cleanup          OK    /fusion:next
OK    /fusion:commit           OK    /fusion:revise-claude-md
OK    /fusion:direct           OK    /fusion:seed-from-plane
OK    /fusion:help             OK    /fusion:setup
OK    /fusion:log-activity     OK    /fusion:unlock
```

Two misses, not one. The second is `skills/setup/SKILL.md:49`:

> `archive/`, `stashes/` and `.migration-v2-backup/` hold content deliberately taken out of
> circulation: `/fusion:archive` moves it there, `/fusion:circle-stash` freezes it, and **the retired
> `/fusion:migrate-workbench-v2` (fusion v2.3–v2.5)** left the backup copy behind as its rollback
> path.

That reference is honest and load-bearing — it explains why a directory a former skill created is on
the probe's exclusion list, and the sentence names it as retired. It is exactly the shape criterion 2
forbids and the shape the "no exceptions" sentence says cannot occur. A lint written to the record as
filed turns the suite red on its first run against a line nobody should change.

## Why this is worth filing rather than fixing in passing

The record's own diagnosis is that a claim about the tree was written without being checked against
the tree, and that it *"was cited a second time, in a decision record about a different append-only
log, before anybody checked whether the skill was real."* The proposal repeats the move one level
down. Recording it here means whoever implements the lint meets the exception in the record rather
than in a red suite — which is the same reason `260811-1547` gives for existing.

## Suggested direction

Amend `260811-1547` rather than opening a competing record. Two things to change:

1. Drop "the rule has no exceptions to carve", and name the one that exists.
2. Give criterion 2 the shape the neighbouring lints already use for honest prose — a reference is an
   offence only when the line does not mark it as retired or absent, the same line-level exemption
   `commit-message-path.test.ts` `it("finds none")` uses. Whichever exemption is chosen, assert it
   against `skills/setup/SKILL.md:49` directly, so it cannot be narrowed without that line failing
   (see `shared/issues/260811-1611_o_*` for the same lesson from the sibling lint).

## Acceptance criteria

- [ ] `260811-1547` names `skills/setup/SKILL.md:49` and no longer claims the rule has no exceptions.
- [ ] Its acceptance criterion 2 is expressible as a test that passes against the tree as it stands.
