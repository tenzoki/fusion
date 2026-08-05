# The illustration block still points at "the three questions" in a procedure that now has four

---

**Severity:** Low
**Domain:** code (documentation of a security control)
**Filed by:** coderev, incremental review of `4f1007f`
**Affects:** `rules/protected-path-discipline.md:218`
**Kind:** NEW in `4f1007f`. The commit turned three questions into four at `:182` and updated the sibling count sentence at `:193` ("Two words" → "Three words"), but left the back-reference at `:218` untouched.
**Cross-references:** `260804-1025_o_…` (the same section, different clause); `260804-1027_o_…` (the same class — a count or recipe that went stale one Turn after it was written).

---

## What is wrong

`4f1007f` inserted a new question 2 into the decision procedure, renumbering the old 2 and 3
to 3 and 4:

```
rules/protected-path-discipline.md:182   Four questions decide any command, in order:
```

The paragraph that introduces the illustration block still reads:

```
rules/protected-path-discipline.md:216-219
Every row below is measured. They are **examples of the rule above**, and the set is open —
if you can answer the three questions for a command you have not seen here, you have the
rule; if you cannot, re-read it rather than looking for your command in the table.
```

Measured, at HEAD `4f1007f`:

```
$ grep -n "questions" rules/protected-path-discipline.md
182:Four questions decide any command, in order:
218:if you can answer the three questions for a command you have not seen here, you have the
```

## Why it matters at all

The sentence is the file's own instruction for using the rule instead of the table, and it
is the sentence an agent reaches when its command is not in the illustration block. "The
three questions" names a set that no longer exists, three lines below a block of four. The
cheapest wrong reading is that the reader stops at question 3 — which is exactly the
question `260804-1025` says overclaims — and never reaches question 4.

No behaviour depends on it. This is a Low finding about the file that is loaded into every
agent's context on every dispatch in every consuming project, filed because that is the
one file in this Circle where a count is not cosmetic.

## Recommended fix

`:218` — "the three questions" → "the four questions". One word.

While in that sentence: the same commit's new question 2 is worded as an enumeration —
*"No — it is a `||` or a `|` → …"* — three paragraphs after the table states the opposite
rule, *"Anything not in this table counts as **no** to both."* A joiner added to
`SegmentJoiner` later answers "no" to question 2 without being a `||` or a `|`, and the
question's gloss says it is not. The code is a safe-list (`JOINER_UNKNOWN`,
`hooks/lib/bash-mutation-guard.ts:1751-1754`) and the table's own footnote is right; only
the question's parenthetical restates it as a closed pair. Two enumerations have shipped in
this Circle and both were falsified inside a day, so it is worth not shipping a third.

## Anti-vacuity

A grep for the literal word "three" would be theatre. What catches this class: the four
questions and the table are the only two places in the file that state a count, and both are
edited by the same commit whenever the procedure changes. A review instruction — when the
question list changes, grep the file for every back-reference to its length — is the honest
control, and it belongs in the Step 9 documentation task with the instruction
`260804-1025` already asks for.

## Origin

Found by reading `rules/protected-path-discipline.md` end to end during the incremental
review of `4f1007f`.

---

**Step 3 disposition (coder, 2026-08-05) — branch A, text corrected. CLOSING.**

**This issue's `**Affects:**` line no longer holds, and that is the first thing to record.**
Step 2 split `rules/protected-path-discipline.md` into three layers and the illustration
block travelled to
`circles/260801-1244-guard-rules-write/analyses/260805-0717-protected-path-forensics.md`.
So the sentence is not at `rules/protected-path-discipline.md:218` and the correction
landed in the analysis instead. The four questions themselves stayed in the core file, so
the two halves of this issue are now in two files.

**It is not corrected to "the four questions". The count is removed.** The sentence now
reads "that section's numbered questions", with one line saying why: the count has been
three and then four, and a back-reference that names a length goes stale one commit after
the list it names. That is this issue's own `## Anti-vacuity` argument taken at its word
rather than its literal `## Recommended fix`, which would have shipped the fourth
enumeration this Circle falsified inside a day.

**The second half is also done, and it is in the core file where the reader is.** Question
2's parenthetical restated a safe-list as the closed pair "it is a `||` or a `|`", three
paragraphs after the table's own footnote says anything not in the table counts as no. It
now says to read the answer out of the table's third column, and that anything the table
does not carry is a "no" as well — so a joiner added to `SegmentJoiner` later cannot make
the question's gloss false on its own.
