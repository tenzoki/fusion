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

---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`, materially narrowed. One of the three sentences is left, and it is the one the record calls the most-read.**

Measured at HEAD `e435f03` across all four sites the record enumerates:

| Site | At HEAD | Acceptance |
|---|---|---|
| `:3` frontmatter description | "Never **originates** a backlog entry." | **not met** |
| `:10` write-narrow paragraph | "never originate a backlog entry" | not met by the letter |
| `:60` the prohibition | "**Originate a backlog entry.** Filing is the user's act … You reshape ideas the store already holds and never add one to it, **the merge included**" | met in substance |
| `:112` | "you reshape the ideas it already holds, and you **originate none**" | correct, and correctly left alone |

The acceptance asked for the noun to change — "files" where it says "originates", or "originates an idea". **The noun never changed anywhere.** What changed is that `:60` and `:112` grew the clause that removes the ambiguity: `:60` now says explicitly that the bound covers the merge, and `:112` scopes the verb to *ideas*, which is the thing actually forbidden. A reader of either reaches the right answer without consulting the conventions file.

`:3` and `:10` did not get that clause. `:3` is the sentence a dispatcher reads and the one `playmaker-backlog-mandate-lint.test.ts` case 2 pins against the mandate section, and read literally against the split behaviour the same prompt grants — *"Give each distinct idea its own entry … and file the new entries at `_o_`"*, `agents/playmaker.md` Step 2b item 1 — it is still false.

**Why this stays open rather than closing as substantially-fixed.** The record's own argument is that the sentences a reader meets *first* are the ones that must be right, and the frontmatter description is first by construction. Two of the four sites were repaired by adding context; the two that cannot carry context are the two left. The fix is still the one the record names and still costs one word each.
