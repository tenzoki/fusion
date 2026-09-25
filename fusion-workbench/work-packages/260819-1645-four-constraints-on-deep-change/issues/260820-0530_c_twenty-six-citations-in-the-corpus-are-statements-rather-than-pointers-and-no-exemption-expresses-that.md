# Twenty-six citations in the gate's corpus are statements rather than pointers, and no exemption expresses that

---

The repair steps of this Circle set out to leave the corpus with zero violations from
`scanRecordCitations`. They did not, and could not: **26 citations are deliberately left spelling a
marker their target no longer carries, because in each one the marker is the record's own subject
and starring it would delete the finding.** Every repair pass named its own leaves in a history log
and moved on. Step 9 asserts `violations.length === 0` over this corpus, so on the tree as it
stands that assertion is red on the commit that lands it — not from a dead citation, but from 26
live ones the parser has no way to tell apart from dead ones.

---

**Severity:** High — it blocks the acceptance criterion of step 9 of this Circle's own plan, which
is the step the four repair steps existed to enable.
**Domain:** code
**Filed by:** `coder`, at plan step 8c
**Owner:** whoever executes step 9
**Affects:** `hooks/lib/__tests__/helpers/citation-scan.ts` (the exemption list in `scanCitationTokens`);
`260819-2016_*_four-constraints-on-deep-change.md` step 9
**Cross-references:** `260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`
(option 1, answered: zero dangling, recomputed, no baseline);
`rules/circle-records.md` `### Citation form in the portfolio` (the pointer-versus-statement test);
`260814-1419_*_nine-open-marker-citations-were-left-literal-on-lines-where-their-siblings-were-starred.md`
(the same distinction, filed as a defect a week earlier and carrying seven of the 26 itself)

**Measured 2026-08-20 at HEAD `46133dc`** with the repair corpus assembled from the tree, in both
readings of "the open decisions". Wide reading (decisions `_o_` or `_a_`), 191 files, 1 778 tokens:
`scanRecordCitations` returns **26 violations**, all of status `stale-marker`, and zero `dangling`
and zero `wrong-store`. Narrow reading (decisions `_o_` alone), 171 files, 1 582 tokens: the same
**26**. The count is identical in both because every one of the 26 sits in a Circle record, in
`portfolio.md`, or in an issue carrying `_o_` — the parts of the corpus both readings select.

## Why they are not repairable as citations

`rules/circle-records.md` states the test: *star a pointer to a file; leave the letter on a marker
that is being named*, and the test is what a star would cost — a pointer loses nothing, a statement
loses its content. Every one of the 26 fails that test in the second direction. The shapes recur:

- **A defect record quoting the defective citation it was filed about.** The record's whole content
  is that some other file spells a marker its target no longer carries. Star the quotation and the
  record says a correct citation is wrong.
- **A table whose right-hand column is a verbatim transcript** of citations left literal elsewhere,
  which is the evidence that record exists to carry.
- **A reconciler note reporting a live instance** — "`…_p_…` and the plan is `_c_`" — where the two
  markers in one clause are the observation.
- **A record whose subject is the stale exact marker as a class**, illustrating it with a specimen.

None of these is a citation that has gone wrong. Each is a correct report of a citation that is
wrong somewhere else, and the parser reads the report and the thing reported identically.

## Why no existing exemption reaches them

`scanCitationTokens` carries seven exemptions: `record-example-file`, `blockquote`,
`announced-illustration`, `footer-template`, `placeholder`, `fabricated-name` and `glob`. Six are
syntactic and one is a file allowlist. **A statement in running prose matches none of them.**

The asymmetry is visible inside a single record. In the activation-renamed defect in this
workbench's `260815-0007` Circle, the same citation appears twice: once at line 22 inside a
blockquote, where it is exempt, and once at line 5 in the sentence that states the finding, where
it is a violation. Nothing distinguishes the two but the `>` character. That is not a rule about
statements; it is a rule about quotation marks, which happens to catch one of the two.

## The options, and why this is not the executor's call

1. **A wholesale file allowlist**, extending `RECORD_EXAMPLE_FILES` to the ten records that carry
   the 26. Cheap, and blunt in the direction that costs most: it exempts every citation in those
   files, including the ones that go stale later, and eight of the ten are records *about* citation
   staleness — the files where a new dead citation is likeliest.
2. **A line-level annotation** the author writes and the parser reads, so a leave is declared where
   it is made rather than in a log the parser cannot see. It puts the judgement at the line, which
   is where the pointer-versus-statement test is actually applied, and it is the only option that
   leaves a later reader able to tell a deliberate leave from an unnoticed one. It is also new
   syntax in the workbench's record form, which is a convention change and not a test change.
3. **Assert on `dangling` and `wrong-store` only**, and drop `stale-marker` from what the new gate
   fails on. The decision's own constraint says the gate asserts on the `dangling` *partition*, and
   `partition()` folds all three statuses into that bucket — so this is a narrowing of what was
   answered, not an application of it. It would also retire the class the Circle's first repair
   step was written to fix, which is the largest class in the corpus by a wide margin.
4. **Rewrite the 26 records** so no statement contains a citation token — the treatment step 7 and
   step 8 called "pull the substance into the text". It works, and on this population it means
   deleting verbatim evidence from ten defect records to satisfy a scanner.

Each trades a different thing away, and the trade is the same shape as the one the corpus decision
already put to the user rather than settling in a plan. It is recorded here and not chosen.

## What this is not

It is **not** the `stamp-name` question (`260819-2016`), which is about a class the gate does not
read. These 26 are inside `GATE_KINDS` today and are judged today. Widening `GATE_KINDS` at step 9
can only add to them.

It is also not an argument against arming the gate. Steps 5, 7 and 8 removed 84 dangling citations
between them and step 8c removed the last eight `circle-record` ones; the corpus is in a state
nobody has to guess about. What is missing is a way for the gate to say "this one is a statement",
and until it exists the gate cannot be both green and honest on this corpus.

## Where the 26 are

Named by file and line count rather than by token, deliberately: writing the tokens out would add
26 more instances of exactly this class to a record inside the corpus.

| record | violations | lines |
|---|---|---|
| `260814-1419_*_nine-open-marker-citations-were-left-literal-on-lines-where-their-siblings-were-starred.md` | 7 | 18, 19, 21, 22, 24, 25, 26 |
| `260812-1720_*_the-reference-resolution-lint-does-not-scan-the-workbench-where-citations-are-densest.md` | 4 | 24, 25, 26, 72 |
| `260816-0119_*_the-lints-newly-widened-surface-still-stops-at-hooks-lib-tests-where-real-citations-have-gone-stale.md` | 3 | 29, 31, 54 |
| `260815-1913_*_closing-the-plan-dangles-thirty-four-workbench-citations-that-spell-its-open-marker.md` | 3 | 12, 17, 77 |
| `260811-2105_*_circle-records-carry-the-same-silent-citation-form-and-a-third-of-their-citations-are-stale.md` | 2 | 102 (two tokens on one line) |
| `260816-0105_*_a-sub-agents-staged-rename-is-absorbed-by-the-orchestrators-next-commit-and-the-staging-list-cannot-prevent-it.md` | 2 | 17, 18 |
| `260815-1247_*_the-implemented-decision-records-two-cross-references-were-broken-by-the-commit-that-transitioned-it.md` | 2 | 65 (two tokens on one line) |
| `260815-0804_*_a-decision-records-cross-reference-points-at-an-a-circle-md-that-activation-renamed.md` | 1 | 5 |
| `260813-0913_*_a-dependency-between-two-circles-can-only-be-recorded-on-one-side-because-nobody-may-write-the-other.md` | 1 | 112 |
| `260818-0715_*_the-orchestrator-prompt-names-a-fusion-record-inside-the-instruction-for-what-to-report-to-the-user.md` | 1 | 75 |

Twenty-four were left by steps 5 and 7 and are listed in their history logs. Two are step 8c's, in
the `circle-record` class the grammar learned at step 8b, and are the last two lines of the table
above.

## Why in this Circle's store

The Directive that produced it is this Circle's, and the step that must act on it is this Circle's
step 9. Per the Origin Rule it belongs here and not in `shared/`.

---
Answered: **option 4, rewrite the 26** — with a correction to the price this record put on it, made
by the user 2026-08-20.

**The price was overstated here.** This record wrote option 4 as "deleting verbatim evidence from ten
defect records to satisfy a scanner". The evidence is not deleted; it moves by one hop. The record
goes on naming the file and the line, and whoever wants the bytes opens the line. **Verbatim bytes are
not evidence when what stands beside them is where they are.** That reframing is the reason option 4
was chosen over the allowlist, and it belongs in this record rather than only in the session.

**The one residue where prose does not reach** is a table whose right-hand column is a verbatim
transcript. The blockquote exemption already covers that shape and costs nothing. What the scanner does
**not** exempt today is the fenced code block: verified at `hooks/lib/__tests__/helpers/citation-scan.ts:375-395`,
where the exemption chain tests `/^\s*>/` against a single line and the enclosing loop carries no state
across lines at all. Admitting a fenced block is the smallest honest addition available, because a
verbatim transcript belongs in one anyway.

**No file allowlist is added.** Option 1 was recorded here in error on 2026-08-20 and removed at the
user's instruction; it was never chosen. The eight-of-ten residual that argued against it stands.

---
**The recurrence question, answered alongside.** *How is a claim kept from being written as an address
again?* Not by a classifier: whether a token is a pointer or a statement does not follow from the text,
and this repository has deleted two mechanisms that decided such questions from text. Three things
carry it instead, and only together:

1. **The gate is the prevention.** After the fenced-block exemption there are exactly two forms in which
   a verbatim citation survives — fenced or blockquoted. Everything else reddens, so a claim cannot be
   written as an address and pass.
2. **The failure message is where it is taught**, because a red gate is the moment an author looks for
   the way out and the cheapest way out is an allowlist. The message must name both correct remedies —
   correct the pointer, or fence it and name file and line — and say that a file allowlist is not one,
   in the shape `BASELINE_MESSAGE` already uses in the sibling lint.
3. **The convention is where it is read beforehand**, one line in `rules/fusion-workbench-conventions.md`:
   a record that states something about a citation names file and line, or fences the verbatim form.

---
Resolved: all three legs of the answer landed. The fenced-code exemption in `b6ed978` freed two of the twenty-six, both `grep` commands already inside fences the scanner could not see. The remaining twenty-four were rewritten in `0d4e0f2` — fourteen as prose naming file and line, ten into fences cut to the transcript rather than the paragraph — and the corpus reached zero violations in both readings with no allowlist and no new exemption. The failure message and the convention line landed in `bbfc912`.

The measured cost of the option chosen, against the one declined: twelve citations are now unjudged, where a file allowlist over the same two files would have taken those twelve plus the twenty-four live citations those files still carry.
