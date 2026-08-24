# Line-number citations into rule files go stale on any edit above them, and no gate reads a line number

---

**Severity:** Low
**Domain:** code
**Filed by:** reconciler, Phase 3 pass of session `260807-2020` (the two-language-declaration split)
**Affects:** every record that cites a rule file by `file.md:NNN` or "lines N-M"; `hooks/lib/__tests__/reference-resolution-lint.test.ts` (the gate that could catch it and does not)
**Cross-references:**
`fusion-workbench/shared/decisions/260807-0158_*_how-is-a-unique-record-filename-obtained.md:7` (the first measured instance, staled by this session),
`fusion-workbench/shared/issues/260807-2153_*_the-exempt-surface-list-is-plugin-repo-shaped-but-ships-to-every-consumer.md` (two citations staled by this session's own second Turn),
`fusion-workbench/circles/260805-2005-textschicht-gegen-code-nachziehen/decisions/260806-0015_*_zitierform-fuer-workbench-records.md` (the ratified citation form for the *record* class, which solved the analogous problem there)

---

## The defect

A record that cites a rule file by line number is correct on the day it is written and silently
wrong afterwards. Any insertion above the cited line moves it, and nothing anywhere reports the
move: the citation still parses, the file still exists, and the reader is sent to a line that now
holds something else.

Measured in this session, on records that are live rather than historical:

| Citation | Where it points today | What moved it |
|---|---|---|
| `260807-0158_*_how-is-a-unique-record-filename-obtained.md:7` — `## Filename Patterns` "(lines 185-208)" | the section now runs 221-245 | S1 of `archive/260817-1907-safe-cleanup-scoped/shared/planning/260807-2024_*_two-language-declarations.md` grew `## Project language` by ~36 lines |
| `260807-2153_*_…:` — `bin/fusion-rules:387` (the unconditional emission) | now `:404`; line 387 is `PROJECT_CLAUDE_RULES_DIR=".claude/rules"` | commit `4992ffb` added a 17-line block to `declared_lang()` |
| `260807-2153_*_…:` — `bin/fusion-rules:464` (the project-rules search layer) | now `:481`; line 464 is a bare comment marker | the same commit |

The second and third are the sharper case: an **open** finding was staled by a **later Turn of the
same session**, roughly two hours after it was filed. This is not slow rot.

A wider sweep over `fusion-workbench/shared/` finds the same shape throughout the older corpus —
`fusion-workbench-conventions.md:326`, `:516-558`, `:68-85`, `:229-244`, `:129-153` and others are
cited from decisions, analyses and plans, and none of them resolves to what its citing text
describes. Those are historical records and are not worth repairing individually; they are
evidence that the failure is systemic rather than incidental.

## Why nothing catches it

`hooks/lib/__tests__/reference-resolution-lint.test.ts` is the gate built for exactly this class of
rot, and its header enumerates the three kinds of reference it resolves: plugin-file paths, section
-heading anchors in the adjacent `` `file.md` `## Section` `` form, and workbench-record citations
in the ratified wildcard form. A line number is none of the three. The gate reads the path, confirms
the file exists, and stops.

Its input surface is also bounded to the plugin's own shipped text — `rules/`, `agents/`, `skills/`
and the READMEs. Workbench records are the *target* of class (c) resolution, never the source, so
the citations measured above sit outside the gate twice over: wrong reference class, wrong file set.

## Why the record class was solved and this one was not

Decision `260806-0015_*_zitierform-fuer-workbench-records.md` met the same problem for record
citations — a marker in a cited filename goes stale the moment the record transitions — and solved
it by ratifying a citation *form* (`YYMMDD-HHMM_*_<slug>`) that survives the change, then teaching
the lint to enforce it. The line-number case has no such form, and the same reconciliation passes
that repair marker citations walk straight past the line numbers beside them.

## Fix directions (none chosen)

1. **Prefer the heading anchor, and say so.** `rules/fusion-workbench-conventions.md` `## Filename
   Patterns` is stable under every edit that does not rename the heading, and the existing lint
   already resolves that form. A convention line would make it the default and leave line numbers
   for the cases where a heading genuinely is not precise enough. Cheapest, and it composes with
   the gate that already exists.
2. **Extend the lint to line citations it can check.** For a `file.md:NNN` naming a plugin file the
   gate can already open, it could at least fail when `NNN` exceeds the file's length. That catches
   the crude half and nothing subtler; a citation that drifted from line 185 to 221 in a 500-line
   file stays green.
3. **Accept and repair on reconciliation.** Treat stale line citations as ordinary drift, corrected
   when a pass touches the record anyway — which is what happened here. Costs nothing up front and
   guarantees that citations in records nobody re-reads stay wrong.

Option 1 is the only one that removes the failure rather than sampling it, and it needs a decision
about scope before implementation: whether the preference binds fusion's own shipped text only, or
also the records agents write.

## Not a blocker

Nothing is broken at runtime. The cost is a reader sent to the wrong line, and reconciliation time
spent re-deriving citations that were correct when filed.

Also seen: 260816-1330 by coderev — commit `52b8665` inserted two bullets into `rules/user-facing-output.md` at `:87` and `:95` and shifted every citation below them by two. Three instances in the same session, two of them inside the same file: `shared/history/260816-1251-curator-run.md:288` records that the analysis cited the gate cap as `:101` and "it is at `:99` at this HEAD", and the commit the same run produced moved it back to `:101`, so the correction was made obsolete by its own change; the same run file then cites `:99` at `:99`, `:181` and `:332`. Commit `6049d3e`'s message cites the ceiling clause as `:128` in one sentence and `:130` two sentences later, for the same line, at a HEAD where `:130` is correct.

Also seen: 260816-1345 by reconciler, third-pass verification at HEAD `dd560ab`. The annotation
appended one commit earlier is itself an instance. It states that `52b8665` inserted its two bullets
at `:87` and `:95`; at HEAD they are at `:89` (`A response moment is either a question…`) and `:96`
(`Every option says what it forecloses.`), and the file has not changed since that commit. Four more
in the same batch of records, all against `rules/user-facing-output.md` at a HEAD where the file is
byte-identical to the one reviewed: the three pronoun-opener sites cited `:22`, `:57`, `:83` are at
`:19`, `:56`, `:85`; the two `see` sites cited `:9` and `:14` are at `:9` and `:12`; the length caps
cited `:103` is at `:102`; and "four lines above the first of them" for the blacklist at `:18` is one
line above. The citations that do hold in the same batch are `:101`, `:107`, `:112`, `:121`, `:130`.
Nine wrong and five right inside one review pass, on the file the pass was reviewing, is the
strongest evidence this record has that the fault is not carelessness but the absence of any gate.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `hooks/lib/__tests__/reference-resolution-lint.test.ts` still resolves paths, heading anchors and record wildcards, and never bounds a line number. Two further instances have accumulated on the record since filing, which is evidence the class is still producing. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.
