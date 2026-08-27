# The Review Contract

**Provenance:** shared/decisions/260822-1330_*_where-does-the-reviewer-contract-live-when-the-agents-surface-has-to-give-back-bytes.md

**This document is the single authoring home** of what a review file contains: the three mandated
header fields, the per-topic working files, and the final consolidated review. `bin/fusion-rules`
emits it to `coderev` and `ontorev`, the two agents that write review files, and to no other agent.
Neither prompt carries a competing definition. Each names its own domain-specific analysis steps and
its own sender segment, and cites this file for everything below.

Two names are used throughout. `<sender>` is your own agent name, `coderev` or `ontorev`.
`$OUT_REVIEW` is the review store `bin/fusion-paths` resolved for you at Setup; both senders write
into the same one, which is why the sender segment is mandatory in every filename.

You write no separate session-history entry. Your review file under `$OUT_REVIEW` is the session's
durable record, and a history log would only duplicate it.

## The review file's header — three mandated fields

**Every review file you write carries these three lines in the header block — anywhere above the first `##` heading, which is where the reader stops looking.** They are not decoration and they are not optional on a pass that found nothing:

```
**Filed by:** <sender>, <person>
**Reviewed-range:** `<from>..<to>`
**Not-opened:** none
```

- **`**Filed by:**`** — your sender name and the person half, read as `rules/fusion-workbench-conventions.md` `### Who filed it` prescribes, absent on the exits that rule names and never composed. A review is a record kind that owes the field; the same identity read is required of every kind that does.

- **`**Reviewed-range:**`** — the commits you actually opened, as **two resolved short hashes**. Get them with `git rev-parse --short <ref>`. Never `HEAD`, never a branch name, never a tag: those name a different commit every day the file is read, and a range that cannot be pinned to the commits it covered is not a range. Two of the ten review files that existed when this mandate was written end in `-to-head`, and neither can be tiled today.
- **`**Not-opened:**`** — every file inside the dispatched range that you did **not** open, backticked and comma-separated, or the bare word `none` when you opened all of them. A concurrent task holding a file, a scope the dispatch narrowed, a file you ran out of budget for — all of them go here. Write `none` explicitly rather than dropping the line: a recorded absence can be compared and a missing line can only be guessed at, which is the rule `rules/critical-stance.md` §4 states: when the producer did not record the fact, it is not recoverable from the text.

A pass that opened everything in a real range, and one that did not:

```
**Reviewed-range:** `18b6094..a7c2b03`
**Not-opened:** none
```

```
**Reviewed-range:** `7f617b1..7ddacbc`
**Not-opened:** `agents/orchestrator.md`, `skills/next/SKILL.md`, `skills/archive/SKILL.md`
```

**Why this is mandated and not left to your judgement.** Reviewers already state their scope — the problem is that they each state it differently. Ten `coderev` files in one store carried four spellings of the range (`**Range:**`, `**Scope:**`, `**Scope reviewed:**`, `**Scope as dispatched:**`), several carried none, and the filenames disagreed too. So nothing could read them, and nothing did: in session `260810-0844` two passes ran, their ranges did not tile the session's range, and **seven code-bearing commits reached a pushed release tag with no reviewer having opened them** while the session's own report said one. The record is `260810-1205` under `$SCAN_ISSUES`.

**The `**Not-opened:**` field is the one that has already failed once.** The `0939` pass of that session declared, correctly and in its own header, that three named files "were not opened" because concurrent tasks held them — and those were exactly the files two of the unreviewed commits changed. The reviewer did its job. The sentence went into a file and stopped there. Written in the mandated form it does not stop: `bin/fusion-review-coverage` reads it, the orchestrator adds it to the next dispatch's scope, and the PostToolUse hook names it back to whoever is holding the session the moment your file lands.

You can check your own file before you finish:

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-review-coverage"
```

Your file should appear on a `review …` line with its range and its `not-opened=` list, not with `UNUSABLE (...)`.

## Per-topic session files

For each topic the user raises or each module you scope, write one working file. What "analyse it thoroughly" means for your domain is your prompt's to say; the file itself is this file's:

1. Save it directly to `$OUT_REVIEW/YYMMDD-HHMM-<sender>-<topic>.md`: the one review pattern of `rules/fusion-workbench-conventions.md` `## Filename Patterns`, which is the shape `bin/fusion-review-coverage` parses a sender out of. A two-digit counter in the stamp position parses as no sender at all.
2. The `<sender>` segment is mandatory, because the review kinds share one store.
3. Each file carries the three mandated header fields above, then one self-contained finding, its evidence as file:line citations, a recommendation, and the scope it affects.

## The final consolidated review

When the user asks for the final review:

1. Read all per-topic session files from this session in `$OUT_REVIEW`.
2. Consolidate them into one structured review document.
3. Group findings by theme, not by file.
4. Flag conflicts, duplicates, and patterns that only become visible when the findings are read together.
5. Write it into `$OUT_REVIEW` under the review filename pattern in `rules/fusion-workbench-conventions.md` `## Filename Patterns`, with your own sender segment.
6. Include:
   - **The three mandated header fields**, exactly as specified above. On a consolidated review the range is the whole span you covered across the session's per-topic passes, and the not-opened list is the union of what those passes left unopened and still stands.
   - **Summary** — two or three sentences.
   - **Totals** — counts per severity (Critical / High / Medium / Low).
   - **Findings by theme** — each finding cites file:line, shows its evidence, notes severity and the scope it affects, and proposes a concrete fix or a clarifying question.
   - **Cross-cutting observations** — patterns that appear in more than one place.
   - **Recommended sequencing** — release blocker versus cleanup.
7. Delete the consolidated per-topic session files. They are working notes; the consolidated review is the permanent record.
