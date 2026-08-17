An analysis of another project recorded no HEAD, and turned a three-day-old snapshot into a claim about now

---
`shared/analyses/260812-0303-the-largest-consumer-read-for-the-first-time.md` read
`/Users/k1/Projects/productive/unite-co-creator` and reported, among much that holds, that the
project had never narrowed its guard configuration in 143 days. The user reports that on his work
machine it is narrowed, and has been. The local checkout's HEAD is `a460d7fa`, 2026-08-09 12:20 —
at least three days behind.

---
**Witness:** the user, correcting the analysis within hours of it being written
**Severity:** medium — the finding's history stands, its present tense does not, and nothing in the
method would have caught it
**Affected:** `agents/analyst.md`; by extension every cross-project reading

The analysis is annotated with the correction. This record is about the method, which will
otherwise repeat: the first reading of a consuming project was also the first chance to get this
wrong, and it took it.

## What the omission cost

One sentence — "never narrowed in 143 days" — carried the whole diagnosis into the present tense,
and it was the sentence the reader acted on. Everything downstream inherited it: a brief written
for that project asking for an edit that already exists, a `CLAUDE.md` block, a decision record
template, and the framing of the plugin-side issue `260812-0843`. None of those are wrong about the
history. All of them address a state that had already moved.

Note what did **not** save it. The analysis is careful, it labels inference, it has a confidence
section, and it cites its sources by path. None of that helps when the corpus itself is a snapshot
whose age was never established. A reading can be scrupulous about everything except when it was
taken.

## The fix is one line in the method, and it is cheap

Before reading a foreign tree, record its HEAD hash, that commit's date, its branch and its
tracking state, and put the age in the Scope section. Then every "as of now" in the document is
stamped, and a reader three days later knows what they are holding.

Two further points worth deciding rather than assuming:

- **Whether to read a tree at all when it is behind its remote.** A `git status -sb` showing
  divergence is one command. Refusing outright is too strong — a three-day-old tree still answers
  historical questions perfectly well, which is most of what this analysis did. Reporting the
  divergence and scoping the claims to it is the proportionate answer.
- **Whether the same applies to this project's own workbench.** An analysis of fusion by fusion
  reads a tree it is simultaneously changing, and none of tonight's four analyses recorded the HEAD
  they read either.

## Not to be over-corrected

The instinct after a finding like this is a checklist item in `agents/analyst.md`. Tonight's own
measurement says a standalone obligation in prompt text is dropped about a third of the time
(`shared/analyses/260812-0303-simplify-speed-and-why-rules-do-not-hold.md`). If this is worth
enforcing, it rides something the analyst already does — the Scope section is written on every run
and could carry the fields — rather than becoming a tenth instruction nobody reaches for.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `agents/analyst.md`-s Output Format `## Scope` template still carries no HEAD, age or branch field, and no other line in the prompt asks for a foreign tree-s HEAD. The suggested fix, riding it on the Scope section rather than adding a tenth instruction, was never built. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.
