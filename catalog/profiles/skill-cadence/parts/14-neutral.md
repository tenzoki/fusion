
```markdown
# Cadence — project digest

**Generated:** <YYYY-MM-DD HH:MM, from `date`>
**Digested by:** <$CO_LABEL> — the checkout that ran this, not the author of the work below
**Yesterday window:** <yday_start> → <today><!-- append " (Fri–Sun collapsed)" on a Monday -->
**Recent window:** <week_start> → <today> (7 days)
**Activity log:** <path> — <n new days logged, m refreshed / "already current">
**Sources scanned:** <e.g. git (37 commits on 12 days); workbench tree (84 files, codes h p i d r); session histories: frozen corpus, nothing after 2026-09-10>
**Session flow (7d, this checkout only):** <e.g. 1.1 approval answers/session · first dispatch median 6 min · dispatches median 4 min, max 14 — or "no event data">

## Topics — yesterday

<!-- on a Monday, render the heading as "## Topics — yesterday (Fri–Sun)" -->

- **<topic>** — <source codes + dates, one line>

<!-- empty window: --> _No activity since <yday_start>._

## Topics — last 7 days

- **<topic>** — <source codes + dates, one line>

<!-- empty window: --> _No activity logged in the last 7 days (most recent day-section: <date>)._

## Recurring themes — by churn (distinct days)

| Rank | Theme | Days | Span (first → last) | Sources |
|------|-------|------|---------------------|---------|
| 1 | <theme> | <n> | <first> → <last> | <codes> |

<!-- nothing recurs on two days: --> _No theme recurs across two or more days yet._

## Notes

- **Always:** the churn column counts **days**, one per `## High-level arc` line, not sessions.
- **Always:** name the session-history cut date and state that no session log covers anything after it.
- <caveats: undated files fallen back to mtime, a legacy log adopted, anything ambiguous>
```

### 10. Report to the user

Lead with the digest — the top 2–3 recent topics and the top 2–3 recurring themes — then the two paths written. The record half is a trailing detail and owes numbers rather than an "OK": new days logged, whether `$SINCE` was re-scanned and what it gained, the date range covered, total items found, the current commit total, any legacy-name rename, and step 6's three counts as `<N> daily entries`, `<W> per-week rows`, `<W'> distinct ISO weeks`. Do not collapse those three to "matches" — the user should be able to spot-check without re-running the greps.

Output follows `rules/user-facing-output.md` plus the chat profile for the project's language (`./fusion-workbench/stilwerk/chat-voice-<lang>.yaml`; the language comes from the `**Language:**` line in `CLAUDE.md`).

## Graceful degradation

- **Not a git repo:** skip the `g` source silently and note it in the sources line.
- **A closed or empty store:** carry on. The session-history store has been closed to writes since v11 (`rules/fusion-workbench-conventions.md` `## Session history`), so an old corpus and no corpus are both ordinary — say which in `**Sources scanned:**`, naming the cut date, so a window with no `h` item reads as a closed store rather than a quiet week. Git and the rest of the tree still cover every window in full.
- **Nothing datable in a window:** still write both files, with the empty-window note in the affected list.
- **Ambiguous or missing dates:** fall back to mtime (step 3) and record it in `## Notes` rather than guessing a date.

**Neither halt is degradation.** No workbench stops the command at step 0 and an empty resolver key stops it at step 3; those two are the only conditions under which this command writes nothing at all, and every case above still writes both files.

## What this workflow is NOT

