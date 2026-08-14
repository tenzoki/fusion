# Coder — step 4: the cleanup staleness line

**Date:** 2026-08-14 10:07
**Status:** Complete
**Circle:** `260801-1244-curator`
**Plan:** `circles/260801-1244-curator/planning/260814-0845_o_plan-curator.md` step 4
**HEAD at start:** `44b9967`
**Agent:** coder

## What was implemented

`skills/cleanup/SKILL.md` Step 8 gains one report bullet and the short procedure block
behind it. The bullet names the date of the last `curator` run and the current byte totals
of the three normative surfaces; the block says how to obtain both.

The measurement reads:

- the most recent `*-curator-run.md` across every directory `$SCAN_HISTORY` names, sorted
  on the filename rather than the whole path, because run files are timestamped
  `YYMMDD-HHMM` and a path sort would order by store directory first;
- the decision records under `$SCAN_DECISIONS`, both stores;
- the project-owned rule files under `./rules/` and `./.claude/rules/`, both optional;
- `CLAUDE.md`.

Cleanup dispatches nothing and gains no step, per the plan and per C7 of the spec. The
block states that explicitly, and states that the measurement runs under `--dry-run`
unchanged, since it is read-only.

Two shipped-text decisions worth recording:

1. **The empty-`$LAST_RUN` branch is called out in bold.** A project that has never
   consolidated and a run that found nothing to change are different facts, and only the
   first is a reason to run `/fusion:curate`. Reporting an absent run as a zero or an old
   date would collapse them.
2. **Naming `/fusion:curate` to the user is flagged as a deliberate exception** to the
   "perform the work, don't name the command" instruction at the top of the same file.
   That instruction governs steps this skill executes inline; a consolidation is precisely
   the thing cleanup must not run on the user's behalf, so here the command is named.

`find … -exec cat {} +` is used rather than `xargs cat`: with no matches `-exec … +` runs
nothing, while a bare `xargs cat` under GNU xargs would run `cat` with no arguments and
read stdin. The `for d in $(printf '%s\n' "$SCAN_…")` idiom is the one Step 1 of the same
file already uses, and it is there because zsh does not word-split an unquoted parameter
expansion.

## The derived key set

Naming `$SCAN_HISTORY` and `$SCAN_DECISIONS` in the body extends this skill's key set with
no change to `bin/fusion-paths`, which greps the consumer's own prompt for
`\$(OUT|SCAN)_[A-Z][A-Z_]*`. Verified: both keys now appear in `./bin/fusion-paths cleanup`.

## Verification

| Command | Exit |
|---|---|
| `cd hooks && npm test` | 0 — 49 files, 1024 tests |
| `./bin/fusion-paths cleanup` | 0 |

The two new lines the resolver emitted:

```
SCAN_DECISIONS=circles/260801-1244-curator/decisions shared/decisions
SCAN_HISTORY=circles/260801-1244-curator/history shared/history
```

The shipped shell block was additionally executed against this repository from the project
root, the directory Step 0 leaves the run in. It exited 0 and produced
`LAST_RUN` empty (no curator run file exists yet, which is the branch the bold sentence
governs), decision records 334 410 bytes, rule files 152 877 bytes, `CLAUDE.md` 55 557
bytes.

## Language

`skills/cleanup/SKILL.md` was already English throughout, Step 8 included, so the
convention in `rules/fusion-workbench-conventions.md` `## Project language` needed no
correction here and the file stays internally consistent. The added text specifies the
line's content in English and leaves the rendering language to the project's chat profile,
the same shape `skills/curate/SKILL.md` uses.

## Scope kept

`hooks/lib/__tests__/rules-emission-golden.test.ts` and `RULE_BASELINE` were not touched.
Arming the growth bound is step 5.

## Files changed

- `/Users/k1/Projects/productive/fusion/skills/cleanup/SKILL.md`
