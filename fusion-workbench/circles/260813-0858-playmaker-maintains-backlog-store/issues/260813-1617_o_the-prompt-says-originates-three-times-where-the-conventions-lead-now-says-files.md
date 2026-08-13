The prompt says "originates" three times where the conventions lead now says "files"

---
The filing bound's bold lead in `rules/fusion-workbench-conventions.md` was changed from
"No agent originates a backlog entry" to "No agent **files** a backlog entry", because the
first wording did not settle the split case on its own: a split originates entries without
originating an idea. `agents/playmaker.md` still carries the old wording in three places,
and each of them carries exactly the gap the lead just shed.

---

## Where

Surfaced by the coder closing the review findings at 260813-1612, reported rather than fixed
because the dispatch had bounded the scope to five named findings.

`agents/playmaker.md` says "originates" four times:

- `:112` — **exact and correct.** It is about originating an *idea*, which is the thing the
  boundary actually forbids. Leave it.
- `:3` (the frontmatter description), `:10` (the write-narrow paragraph), `:60` (the
  prohibition) — each says the agent never originates a backlog **entry**. Read literally
  against the split behaviour the same prompt now grants, that is false: a split writes new
  entries.

## Why it is small and still worth a record

The document is not incoherent. `rules/fusion-workbench-conventions.md` `## Backlog entries`
now settles it in one quotable sentence, the marker table's `_o_` row names the playmaker as
the writer of a split's new entries, and the prompt's own Step 2b describes the split
correctly. A reader who follows any of those reaches the right answer.

But three of the four sentences a reader meets *first* — the description is what a dispatcher
sees, and the prohibition is what an executor checks itself against — assert something the
agent is now required to do. The Circle's whole subject was a prompt whose description
advertised one boundary while its body held another, and this is a smaller instance of the
same shape, left behind by the fix.

## What it is not

Not a licence to file. The bound survives in every wording: no agent introduces an idea the
store does not hold. Only the noun is wrong.

## Acceptance

- The three sentences say "files" where they now say "originates", or say "originates an
  idea", matching the conventions lead.
- `:112` is left alone.
- `playmaker-backlog-mandate-lint.test.ts` still passes — case 2 pins the description against
  the mandate section, so this touches a linted surface.
- Nothing grows the always-on rule text: this is `agents/playmaker.md`, which the golden
  measures per emission but which is not itself rule text.
