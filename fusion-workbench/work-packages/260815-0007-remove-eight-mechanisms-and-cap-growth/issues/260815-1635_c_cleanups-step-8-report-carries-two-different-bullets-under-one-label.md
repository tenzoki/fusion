Cleanup's Step 8 report list carries two different bullets under the same label

---

P-12 renamed Step 8's `CLAUDE.md` bullet to "Normative surfaces". The report list already had a
bullet with that exact label, two lines below. The rendered report now shows the same name twice, for
two unrelated things.

---

## Context

`skills/cleanup/SKILL.md:218` (new, from P-12):

> - Normative surfaces: entries approved and applied, per surface; every entry that came back `stale`
>   or `failed`, by id and reason; or that the ledger was rejected, or that the survey proposed
>   nothing

`skills/cleanup/SKILL.md:220` (pre-existing):

> - Normative surfaces: the date of the last consolidation run, or that none has run, followed by the
>   current size in bytes of the decision records, the project's own rule files, and `CLAUDE.md`

The first reports what *this run* changed; the second is the read-only staleness measurement the
following paragraph describes. They are separated by one unrelated bullet ("Activity log: updated").

`rules/user-facing-output.md` `## Vocabulary` — **One name per thing**:

> Use a single, consistent term for an entity throughout an output. Do not rotate through synonyms
> [...] for one thing — that forces the reader to keep proving the names refer to the same object.

This is the inverse case and worse: one name for two things, in adjacent bullets of a single report.
The label P-12 chose is the right one for its bullet; it is the collision that was not noticed.

## Suggested direction

Rename one of them. "Normative surfaces changed" and "Normative surfaces state" would do, or move the
measurement bullet to the end under a label naming what it is — it is the only read-only line in a
list of things the run did.

---

Resolved: The two Step 8 bullets are distinguishable by label: `:218` is now "Normative surfaces changed" (what this run applied) and `:220` "Normative surfaces, current state" (the read-only measurement).
