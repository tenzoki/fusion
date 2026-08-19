# The split line form cannot express a partial split, which is the only case the store actually holds

**Filed by:** coderev (review of Circle `260813-0858-playmaker-maintains-backlog-store`, commit `b995049`)
**Severity:** Low
**Scope:** `rules/circle-records.md:127`–`131` (the four operation forms); `skills/next/SKILL.md` Step 5b

## The form

`rules/circle-records.md:128`:

```
split <entry path> into: <slug> — <title>; <slug> — <title>
```

One operation, one line, all pieces on it. `rules/circle-records.md:127` states the purpose: *"one operation to a line, so a person can approve one at a time."* The unit of approval is therefore the **whole split**, not a piece of it.

## The case it meets first

The store holds one entry. The last playmaker run read 13 distinct ideas in it and sorted them three ways (`fusion-workbench/portfolio.md:155`–`186`): three live and shapeable, seven already carried by a filed record, three duplicates of another idea in the same entry, plus two fragments it judged not to be ideas at all.

Consequences of the single-line form against that input:

1. **No partial approval.** A user who wants two of the three live pieces but not the third has no representation for it. The whole split is one line; the answer is yes or no.
2. **The line is long and its separators are weak.** Pieces are separated by `;` and each piece internally by ` — `. A `<title>` containing either character breaks the parse, and titles are free prose written by the same run.
3. **It exceeds the option-label cap.** `rules/user-facing-output.md` `## Length` caps `AskUserQuestion` option labels at four lines. A split line naming three-plus `<slug> — <title>` pairs, shown with the entry path, does not fit — and Step 5b instructs the skill to show the operations with entry paths (`skills/next/SKILL.md:161`).
4. **The dropped ideas are not in the line at all.** The seven already-covered ideas and the three duplicate groups are decisions the split makes, and the form carries only what is created. The plan's acceptance checklist item 4 requires they be *"accounted for in the appended line or in the run's history log"*, so they are recoverable — but they are not visible at the moment the user confirms.

## Note on evidence

The Circle closes without its end-to-end acceptance run, so this is reasoning from the forms and from the one real input, not from an observed failure.

## Recommendation

Either accept it explicitly — state in `rules/circle-records.md` that a split is confirmed whole and a user who wants a different partition says so in prose and re-runs — or make the piece the unit. The second is a small change to the same template: one line per produced entry under a `split <entry path>:` header, each line individually approvable and individually relayable, which also removes the semicolon separator and brings the option labels back under the cap.

---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`, and the narrowing is worth recording: three of the record's four consequences were addressed sideways, and the one in its title was not.**

The form is unchanged:

```
grep -n 'split <entry path>' rules/circle-records.md
  172: `split <entry path> into: <slug> — <title>; <slug> — <title>`
```

One operation, one line, all pieces on it.

**What was addressed, by a change aimed at something else.** `skills/next/SKILL.md` Step 5b now grants an explicit second `AskUserQuestion` with `multiSelect`, and states in as many words: *"Choosing a subset is the ordinary answer here, not an edge case: the four fixed line forms … are one operation to a line precisely so a person can approve them one at a time."* That answers consequence 1 **between** operations and consequence 3's cap pressure with it — the user now marks a subset of the proposed operations in one pass.

**What is untouched is the title.** A subset *of operations* is not a partial *split*. The split is still one line, still approved whole, and a user who wants two of three produced entries still has no representation for it. Consequence 2 (a `<title>` carrying `;` or ` — ` breaks the parse, and titles are free prose from the same run) and consequence 4 (the ideas the split *drops* appear nowhere in the line the user confirms) are both exactly as filed.

**The evidence note stands too, and should not be read as weaker than it is.** This is still reasoning from the forms and from one real input rather than from an observed failure; no end-to-end acceptance run has happened since. But the one real input has not gone away — the store still holds the multi-idea entry the record measured.

Of the record's two remedies, the second is now the cheaper: one line per produced entry under a `split <entry path>:` header is the same shape Step 5b's follow-up already puts to the user, so the template would be catching up with the skill rather than leading it.
