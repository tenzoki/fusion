# coder — German literals out of the skill bodies, plus the demoted-name residual in setup

**Status:** Complete
**Source record:** `260814-1001_*_three-skill-bodies-embed-german-while-skill-bodies-are-an-english-surface.md`
**Files changed:** `skills/archive/SKILL.md`, `skills/direct/SKILL.md`, `skills/migrate/SKILL.md`, `skills/next/SKILL.md`, `skills/setup/SKILL.md`

## What the survey found, against what the record claimed

The record named three files. One of them, `skills/seed-from-plane/SKILL.md`, no longer
exists — it left with the Plane mirror on 2026-08-15. The other two were right. A survey of
all twelve skill bodies found German user-facing literals in **five**, not three:

| File | What was German |
|---|---|
| `skills/next/SKILL.md` | the exit-1 halt, the no-Circles line, three render specimens, the whole activation prompt with its three option labels, the final chain-into-a-session message |
| `skills/direct/SKILL.md` | the exit-1 halt, the no-argument usage line, the three-line follow-up hint |
| `skills/migrate/SKILL.md` | ~26 operator strings across both inline shell blocks, four tail counter *names*, two Step-2 report lines, the whole Step-3 prompt and its `MODE=plain` variant |
| `skills/setup/SKILL.md` | three operator strings in the pre-v4 probe shell, the two-paragraph refusal message |
| `skills/archive/SKILL.md` | the three `AskUserQuestion` option labels (`Archivieren` / `Ändern` / `Abbrechen`) |

`skills/archive/SKILL.md` was the surprise: its Step 6 already *says* to write the prompt in
the project's language, and then gives the three labels in German anyway. That is the record's
own thesis reproduced in a file the record never looked at.

## The shape applied

`skills/curate/SKILL.md` `## Tone` is the pattern: specify the prompt in English, and state
that it renders in the project's chat language. Each of the five now carries that statement
where its prompts are specified — in the `## Tone` section for `next` and `direct`, beside the
prompt for `archive` and `setup`, and once at the top for `migrate`, which has no Tone section.
The specification is English; the rendering is not.

**The shell blocks are the one place where the English is final rather than a specification.**
`migrate` and `setup` print operator strings straight out of bash, where no agent stands between
the literal and the terminal. Those are CLI operator output, which
`rules/fusion-workbench-conventions.md` `## Project language` exempts by name alongside hook
banners and helper usage text, so they are English in every project. `migrate`'s new opening
paragraph says so explicitly, because that file is half prompt specification and half shell and
a reader needs to know which half they are in.

**`migrate`'s four tail counters were renamed with the strings that carry them** —
`verschoben`/`kollisionen`/`ignoriert` became `moved`/`collisions`/`ignored`, `mv-fallbacks`
unchanged. They are machine-read names in the skill's own Step 5, not prose, so the rename had
to reach the four prose references as well; it did. Nothing outside `skills/migrate/SKILL.md`
reads them: `grep` over `hooks/`, `bin/`, `agents/`, `rules/`, `templates/`, `docs/` and the
READMEs returns nothing (the only hit was TypeScript's own German diagnostics bundle under
`node_modules`).

## The two judgement calls

**The `next` and `setup` "German shape:" specimens were converted, not kept.** Acceptance
criterion 1 permits an illustration of a rendering to stay if it says it is one, and both said
so. They were converted anyway, for three reasons. Nothing about German is load-bearing in
either specimen — neither demonstrates a translation subtlety, so an English specimen carries
the same information for every project while a German one carries it for one. Second, the
record's own diagnosis is that "the next skill author copies the nearest example"; a labelled
German specimen is still the nearest example. Third, and the reason that decided it: with the
literals gone the rule becomes checkable by `grep` over `skills/*/SKILL.md` rather than by
judging each site against an exemption. A surface with zero German is a surface a lint could
one day assert on; a surface with two labelled exceptions is not.

**`skills/memo/SKILL.md`'s German strings were left alone, and they are not a violation.**
`aufgabe:`, `idee:`, `diese aufgabe`, `das gehört ins Backlog`, `merk das als Idee vor` are
routing patterns the skill *recognises in what the user types*. They are input, never output —
nothing prints them. Deleting them would remove the German keyword recognition without fixing
anything the rule is about. The rule governs "text that ships to consuming projects" as a
*surface the user reads*, and an input vocabulary is not one.

## The residual from the demotion task

`skills/setup/SKILL.md:60` presented `/fusion:archive` as a standalone command and cited
`/fusion:log-activity` Step 3. Both are steps of the `/fusion:cleanup` pipeline since the
collapse. Rewritten to "the archive step of `/fusion:cleanup`, reachable alone as
`/fusion:cleanup --only archive`" and "the activity-log step of `/fusion:cleanup`
(`--only log-activity`), at its own Step 3".

The same line cites `skills/migrate/SKILL.md:52,85`, and both shell blocks moved down two lines
when `migrate` gained its opening language paragraph. Updated to `54,87`.

## Verification

`cd hooks && npm test` — exit 1, in a detached worktree carrying only this patch (750 of 751
tests pass). The single failure is
`lib/__tests__/surface-growth-bound.test.ts > matches the checked-in golden, surface by surface`:
the golden is a per-file byte inventory of the bounded surfaces and every edit to one makes it
stale. It was **not** regenerated, per the task. The bound itself passes — that file's twelve
tests include the per-surface head-room assertions and only the inventory one failed. The three
lint gates that read these files pass: `reference-resolution-lint`, `path-literal-lint`,
`derivable-enumerations-lint`, 73 tests.

Total growth across the five files: **1 387 bytes**, against roughly 19 000 of head-room on the
`skills` surface. Almost all of it is the five language statements; the literal replacements are
close to neutral, English running slightly shorter than German.

## One thing this task could not fix

`CLAUDE.md` line 129 quotes the old German string verbatim: *"`/fusion:next` prints "Noch keine
Circles vorhanden" and stops"*. That row is now wrong — the skill prints "No Circles yet." The
file is outside this task's scope (`skills/*/SKILL.md` only), so the quotation was left as it
stands and is named here instead. It is a one-line correction for whoever next opens that table,
or for the curator.
