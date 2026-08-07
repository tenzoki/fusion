# How does an agent obtain a record filename that is guaranteed unique?

---
**Domain:** knowledge
**Status:** open
**Filed by:** consultant, from a report by the consuming project `unite-co-creator`, session 260806-1242
**Cross-references:** `fusion-workbench/shared/issues/260807-0158_o_record-filenames-collide-on-the-minute-and-nothing-prevents-it.md` (the measured defect); `rules/fusion-workbench-conventions.md` `## Filename Patterns` (lines 185-208) and `## Timestamps` (lines 172-174); `bin/fusion-commit-lock` (the precedent)

---

## Question

Record filenames are *constructed* by each agent from `date +%y%m%d-%H%M` plus a slug.
Two records minted in the same minute produce the same identifier, and 43 percent of this
workbench's 556 record files already carry a shared one. The defect record measures it.

The choice is what replaces construction. It has to be made now because the answer decides
whether a new `bin/` helper exists, whether every prompt that names a filename pattern
changes, and whether every identifier in the corpus gets longer.

## Options

1. **A minting helper — `bin/fusion-newname <kind> <slug>`.** The helper creates the file
   atomically (`O_EXCL`, or the `mkdir` idiom `bin/fusion-commit-lock` already uses at
   lines 14-15 and 179), prints the path, and becomes the single place any agent obtains a
   record filename. `## Filename Patterns` is rewritten to say a filename is *obtained*,
   not constructed.
   - Pros: closes both causes, batch filing and concurrency, by construction rather than by
     obligation. Matches the shape fusion already chose for the staging race. Leaves the
     identifier length untouched. Sits in `bin/` beside the resolver and the lock, so
     agents acquire it through the Setup step they already run.
   - Cons: a new helper to write, test and document. Every prompt and skill body that
     currently names a filename pattern has to route through it, which is a wide edit.
     A second mandatory helper call at filing time is a second thing that can be skipped
     unless the convention makes construction plainly wrong.
2. **Second resolution — `YYMMDD-HHMMSS`.** No helper; change the pattern.
   - Pros: cheap. Removes most batch collisions and many concurrent ones. One edit to the
     conventions plus a slug-pattern change wherever the shape is written out.
   - Cons: removes neither class. An agent writing several files inside one second is
     ordinary, and two agents can still land on the same second. Lengthens every identifier
     in every citation permanently, and the corpus becomes mixed-width.
3. **Ordinal suffix on collision — `YYMMDD-HHMM-2`.** Keep the identifier length for the
   common case, append an ordinal when the name is taken.
   - Pros: shortest identifiers, no change to existing citations.
   - Cons: race-free only with an atomic mint, at which point it is option 1 with a
     different name shape. Without one it is the check-then-write instruction the defect
     record already rejects.

## Constraints

- **The mechanism must not be an obligation.** An instruction to check before writing
  carries a miss rate, records a time that is not the time when it bumps, and still loses
  the check-then-write race. This is the constraint that rules out prose-only answers.
- **It must close batch filing, not only concurrency.** The dominant cause is one agent
  filing a dozen records in one pass.
- **Existing files are not renamed.** 238 files carry a shared identifier; renaming them
  breaks every citation pointing at them. Whatever is chosen applies going forward.
- **The convention states the fallback for the existing corpus regardless of this answer:**
  cite by full filename when an identifier is known to be shared.

## Recommendation

Option 1, with two qualifications.

The reporting project recommends option 1 and the reasoning holds: it is the only option
that closes both causes, and it reuses a mechanism fusion has already chosen for the same
class of problem rather than inventing a second one. Option 2 changes every identifier in
the corpus and still leaves the failure reachable, which is the worst trade of the three.

First qualification. The helper's cost is not the helper, it is the prompt edits, and that
edit is the same shape as the v4.0.0 path-literal migration: prompts stopped naming store
directories and started resolving them. That migration held because a lint test
(`hooks/lib/__tests__/path-literal-lint.test.ts`) fails the build when a literal reappears,
and the resolver exits 4 rather than emitting an empty value. A minting helper without an
equivalent gate would decay the same way construction did. **inference:** the same lint
harness can be extended to catch a hand-built `date +%y%m%d-%H%M` filename in an
`agents/*.md` or `skills/*/SKILL.md`; I have read that test's role in the conventions
(`rules/fusion-workbench-conventions.md:18`) but not its implementation, so treat the
extension as plausible rather than verified.

Second qualification. Whether the helper should *create* the file or only *reserve* the
name needs deciding when this record is answered. Creating it is what makes the mint
atomic; it also means an agent that mints and then fails leaves an empty record behind.
`bin/fusion-commit-lock` faced the same question and answered it with a stale detector
(lines 176-189). That is a design detail, not a fourth option.

---
Answered: <set when status moves to _a_>
Implemented: <set when status moves to _i_>
Deferred: <set when status moves to _d_>
Superseded by: <set when status moves to _s_>
