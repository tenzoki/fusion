# Should a project be able to declare a record an exhibit, and what does that declaration cover?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260906-0416_*_a-project-may-widen-the-citation-corpus-and-never-narrow-it-so-an-exhibit-has-no-declarable-form.md` (the gap) · `260905-1228_*_the-record-example-exemption-silences-a-verdict-that-does-not-depend-on-resolution.md` (the repair whose measured rejection option 1 reverses) · `260830-2225_*_should-an-archived-violation-move-the-checkers-verdict-line.md` (the verdict-scope precedent) · `260912-1614-the-citation-verdict-is-unreachable-where-an-exhibit-sits-in-an-edited-file.md` (the analysis that added option 4)

---

## Question

A record whose subject is a path has to quote that path — a shell transcript, a reproduced tool
message, a listing of where files were found. The checker judges such a token on its shape, and
the sweep refuses to rewrite it, so the tool says "violation" and "do not touch" about the same
characters. A consuming project has no way to declare the difference, and fusion's own
repository carries 395 tokens of exactly this class.

It must be answered now because a consuming project reported the impasse against 10.23.0, and
because the interim mitigation shipped on 2026-09-06 makes the class visible without making it
declarable. Leaving it there is a decision by default.

## Options

1. **Mask shape verdicts inside fences and blockquotes.** What the reporting project asked for:
   the mask is already computed and already consulted, so a fenced store segment stops being
   counted at all.
   - Pros: no new configuration surface; the tool's judgement and its verdict agree; a fenced
     transcript is the one context where a store segment is certainly not a pointer.
   - Cons: reverses a rejection that was measured rather than argued. The sweep shares this
     grammar, and the same change took it to 370 rewrites across 64 files, mostly archived
     exhibits whose content is the wrong spelling on purpose. And it re-opens what the earlier
     repair closed: the file whose job is to teach the citation form becomes a file where a
     wrong form cannot be detected.
2. **A subtractive configuration leaf** — a project names records that are exhibits, the way
   `citations.extraPaths` names files that are citation-bearing.
   - Pros: removes the asymmetry at its root; the declaration is the project's, recorded in a
     file that shows up in its own diffs; fusion takes no position on another project's records.
   - Cons: a new configuration surface, which this project has removed elsewhere for less; and a
     silencing leaf is the one shape most likely to be reached for when a gate is inconvenient
     rather than when a record is genuinely an exhibit. `workbench-citation-lint.test.ts` already
     carries a warning that adding a file to the exemption list is not the answer to a failing
     gate, and this option makes that warning a consuming project's to heed.
3. **Neither: state the bound.** Say in the checker's header that a project cannot narrow the
   corpus, that an exhibit is expected to name its path in words outside the token, and that
   the `unrewritable-violations` figure is what a gate should be wired on.
   - Pros: costs nothing, keeps every measurement made so far standing.
   - Cons: the reporting project's evidence is that "name it in words" destroys a verbatim
     transcript, which is the one artefact whose value is that it is verbatim. This option
     answers them by telling them their records are wrong.

4. **Only a row somebody may repair moves the verdict.** `verdict=violations` when the edited
   rows that carry no exemption `reason` are above zero, rather than when `edited-violations` is.
   Every row stays printed, every figure stays as it is, and `unrewritable-violations` becomes the
   half the verdict subtracts instead of a figure beside it.
   - Pros: it completes a criterion this project already chose rather than adding one.
     `260830-2225_*_should-an-archived-violation-move-the-checkers-verdict-line.md` named the
     criterion "nobody will repair it" and rejected its own option 2 for taking 65 rows where the
     criterion took 256; the live-file predicate it chose instead leaves the rows that are edited
     AND unrewritable uncovered, and those are exactly the ones the reporting project is standing
     on. No configuration surface, which is option 2's whole cost. It touches neither the mask nor
     the corpus nor the sweep, so the 2026-09-05 measurement that option 1 would reverse stands
     untouched. Both counters and the per-row column already exist, so the change is which of two
     numbers the verdict reads. And it is the only one of the four the reporting project asked
     for: they have the criterion running in a local Makefile, which proves it implementable and
     proves every consuming project otherwise rebuilds it.
   - Cons: it turns a red gate green in a consuming project, which the constraint below forbids
     doing SILENTLY. It needs a release that names it and an upgrade note; it cannot ride in
     unannounced. A genuine violation inside a fence in a live file stops moving the verdict: it
     stays printed, stays in `store-prefixed` and `unrewritable-violations`, and fusion's own
     blocking gate goes on failing on it, so the teaching file's coverage survives here and is
     lost only for a consuming project wiring on `verdict=` alone. And `unrewritable` is the
     presence of an exemption reason, not a finding that repair is impossible: a writer who
     fences a token they could have named in words gets a verdict that no longer objects.

**The cut, and why it was incomplete.** Options 1 to 3 cut on one dimension, how a project may
declare an exhibit. Option 4 is on the other dimension, which rows move the verdict, the one
`260830-2225_*_should-an-archived-violation-move-the-checkers-verdict-line.md` established and
this record cited as precedent without carrying an option on it. The two dimensions are
independent: any of options 1 to 3 can be taken with or without option 4.

## Constraints

Whatever is chosen must not reach the sweep's rewriting behaviour: an exhibit must stay
un-rewritable, which is true under all three options today and is the one property no answer may
cost. It must not silently change `verdict=` for a project that wires a gate on it — a release
that quietly turns a red gate green is worse than the red gate. And the teaching file's coverage,
won by the 2026-09-05 repair, must survive: a wrong form written into `rules/decision-record-examples.md` has to stay detectable.

## Recommendation

Option 2, with the declaration per record rather than per file, and with the checker printing
the count of declared exhibits beside its verdict so a declaration is visible rather than
silent. Option 1 is the one asked for and is the one this project has already measured itself
out of; option 3 answers a reporter's evidence by disputing their records, which their eleven
worked examples do not deserve.

The residual to accept with option 2, stated rather than discovered later: a project can silence
a genuine violation by calling it an exhibit, and nothing mechanical distinguishes the two. That
is the same residual the `foreign:` qualifier carries — a claim the writer makes rather than a
fact a gate checks — and it was accepted there on the same reasoning.

## Addendum 2026-09-12 — option 4 added

The recommendation above predates option 4 and was written when the cut carried three. It is left
standing rather than rewritten, because changing a recommendation is not this addendum's to do.

What the second report from the same consuming project adds, verified against this tree: the
narrowing is `ff52dd4a` of 2026-09-05, four days after v10.22.0, shipped in v10.23.0, which matches
their account. `verdict=` reads `edited-violations` and nothing else, as `hooks/citation-check.ts`
states in its own header. And fusion's own repository cannot observe the failure mode: measured on
2026-09-12 it reads `edited-violations=0`, `unrewritable-violations=401`, `verdict=clean`, so every
unrepairable row here already sits in a file the live-file predicate excludes. That is why the
first round produced a diagnostic figure instead of a repair.

The analyst's assessment is option 4, with options 2 and 4 not exclusive: option 4 makes the
verdict reachable for a project whose exhibits sit in live records, and option 2 answers the
separate asymmetry that a project can widen the corpus and never narrow it
(`260906-0416_*_a-project-may-widen-the-citation-corpus-and-never-narrow-it-so-an-exhibit-has-no-declarable-form.md`).
Neither settles the other.

**Filed by:** analyst, Kai Stalmann <ks@qantr.com>, checkout 5e8248d7

---
Working answer (plan 260921-1726): option 2 — a subtractive leaf `citations.exhibits`, per record by storeless basename, every token in a declared record exempt with the reason `declared-exhibit`, the checker printing `declared-exhibits=` beside its verdict; option 4 is not taken and not foreclosed; implemented in the commit that carries this line

Answer located: 260921-1726_*_the-33-open-defects-of-the-11-9-1-survey-worked-autonomously-as-one-package.md `## Working answers` — row 10, option 2, implemented at `a891c50e` (the commit that appended the line above): `citations.exhibits` in `hooks/lib/config.ts`, exemption reason `declared-exhibit` and `declared-exhibits=` on the checker's verdict line; option 4 untaken and not foreclosed. A working answer, not a ruling.

---
Answered: 260921-1726_*_the-33-open-defects-of-the-11-9-1-survey-worked-autonomously-as-one-package.md `## Working answers` row 10 — option 2: a subtractive leaf `citations.exhibits`, per record by storeless basename, every token in a declared record exempt as `declared-exhibit`, the count printed beside the verdict; option 4 not taken and not foreclosed; ruled by user, Kai Stalmann <ks@qantr.com>, 260922-0027.
---
Implemented: a891c50e — `citations.exhibits` in `hooks/lib/config.ts`, exemption reason `declared-exhibit` in `hooks/lib/citation-scan.ts`, `declared-exhibits=` on `bin/fusion-citation-check`'s verdict line.
