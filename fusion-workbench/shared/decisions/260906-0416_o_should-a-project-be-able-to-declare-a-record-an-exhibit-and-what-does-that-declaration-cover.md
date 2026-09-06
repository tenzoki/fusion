# Should a project be able to declare a record an exhibit, and what does that declaration cover?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260906-0416_*_a-project-may-widen-the-citation-corpus-and-never-narrow-it-so-an-exhibit-has-no-declarable-form.md` (the gap) · `260905-1228_*_the-record-example-exemption-silences-a-verdict-that-does-not-depend-on-resolution.md` (the repair whose measured rejection option 1 reverses) · `260830-2225_*_should-an-archived-violation-move-the-checkers-verdict-line.md` (the verdict-scope precedent)

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
