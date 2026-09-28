# Does the plan-size ceiling fail hard or only report?

---
**Domain:** code
**Filed by:** shaper, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260909-1615_*_spec-cut-fusion-to-a-working-minimum.md` `## User Decisions Pending` and C5 state this question with its measurements. The report-only precedent is the three stdout-verdict helpers named in `CLAUDE.md`'s `bin/` rows.

---

## Question

C5 makes the record obligation conditional and puts a size ceiling on plans. Whether that ceiling
fails a run or merely prints a verdict decides whether this spec enforces a bound whose value it has
not measured, which is the shape it refuses everywhere else.

## Options

1. **Report only**: print a verdict on stdout, gate nothing.
   - Pros: matches what fusion's three other verdict helpers already do, none of which has been
     promoted to a gate; enforces no unmeasured discipline.
   - Cons: nothing changes unless somebody reads the line; plans stay a third of the store a
     dispatch is pointed at.
2. **Fail hard**: a plan over the ceiling reddens the suite.
   - Pros: plans are the one record kind whose size is measured, at 300.6 KiB across six live plans,
     and a bound that does not bind has already been shown not to hold a surface down.
   - Cons: splits a plan a reader may want whole; it would be the first bound in this spec enforced
     without a demonstrated reader on either side.

## Constraints

- No plan has a measured reader, so neither option can be justified by what a reader loses.
- The spec's own constraint forbids removing something on the grounds that it is large; a ceiling
  that fails hard is the same argument applied to what may be written.

## Recommendation

None. This is the user's call, and the spec files it rather than resolving it.

---
Answered: 260909-1700_*_does-the-plan-size-ceiling-fail-hard-or-only-report.md `## Question` — report only, never a hard failure. It joins the three existing stdout-verdict helpers, none of which has been promoted to a gate. The reason against hard: no plan has a measured reader, so enforcing the ceiling would be the first bound in this specification enforced without one, which is the shape the specification refuses elsewhere; ruled by user, Kai Stalmann <ks@qantr.com>.

---
Implemented: 069c54ae — `bin/fusion-plan-size` prints a `KEY=value` block and one `verdict=` line over the live plans, carries the ceiling in no exit code, and is wired into no gate and no pipeline; its own unit test asserts exit 0 over a plan above the ceiling, which is the inverse of the usual assertion and is what would catch this ruling being reversed.
