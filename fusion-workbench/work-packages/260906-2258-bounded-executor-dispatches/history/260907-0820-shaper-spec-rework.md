# Shaper session: reworking the bounded-dispatch specification after the planability check

**Status:** Complete
**Filed by:** shaper (portfolio-activation mode), Kai Stalmann <ks@qantr.com>

**Mode:** portfolio-activation, scope `spec`, against `260906-2258-bounded-executor-dispatches/_t_circle.md`
**Initiated by:** the orchestrator put the analyst's verdict and four content questions to the user
on 260907; the user chose to have the gaps closed as a separate spec document rather than by
sharpening the record's goal in place.

## What was asked

The Circle's specification, which until now was the record itself, failed a planability check
(`260907-0710-planability-of-the-bounded-dispatch-spec.md`, eight gaps). Four of the eight were
closed by the user in chat and needed only working in. Four were shaping work.

## What the user settled, and where it landed

1. Closure checks the law, not the factor: does re-sent volume fall with the dispatch count, and
   does that survive caching. Landed in the spec's C5 and its criteria.
2. The minute measurement of the free handoff is accepted as evidence, with the currency limitation
   written down rather than left implicit. Landed in C5 and in the record's Grounding snapshot.
3. The bound is measured in wall-clock time. Landed in C1.
4. The bound covers all dispatched agents. Landed in C1.

## What was shaped rather than asked

- **The cacheability sentence is corrected and the counter-effect is now on the record.** Four
  dispatches each write a prefix at above input price, none reads the previous dispatch's tail, and
  the cache entry expires in five minutes. A split can lower volume and raise the bill.
- **28.6 percent replaces 36 percent**, with 30.6 percent given as the task-paired figure over the
  same window. The conclusion the figure supports is unchanged.
- **The "248 of 248" pairing is gone.** Its denominator was the `task_done` count itself.
- **The handoff and re-entry form is specified.** The handoff rides the agent's return report and
  the continuation dispatch; nothing is written to a workbench store for it. Decided rather than
  asked, on two recorded grounds: a resume note would add to bookkeeping, which this project has
  measured as its own largest cost at up to 28 percent of session time, and it would be a second
  standalone obligation of the kind measured at a 28.6 percent drop rate, while the return report
  rides an act the agent cannot skip.
- **The requested-versus-enforced question is answered in the spec's own second section.** Nothing
  fusion has can make a sub-agent give back control, so the bound is requested and only the reading
  afterwards is enforced. The spec states what that costs the expectation of saving instead of
  presenting the bound as guaranteed.
- **A stall guard was added.** Two consecutive continuations completing nothing stop the chain,
  because a requested bound cannot distinguish an agent that ran out of time from one that is stuck.
- **Two stopping conditions were written**, both keyed to measurements the work itself performs.

## Not asked, deliberately

No clarification round was returned. The two candidates for one were the handoff form and the
numeric value of the bound, and both were closeable from evidence already on disk: the first as
above, the second by specifying the property the default must have (at or above the median recorded
dispatch duration, so the ordinary dispatch is untouched and only the tail is cut) and leaving the
number to the measurement the planner takes. The scope was not reopened.

## Artifacts

- Spec: `260907-0820_*_spec-bounded-executor-dispatches.md`, in this Circle's planning store.
- Decision filed: `260907-0820_*_is-a-token-side-measurement-of-the-splits-net-cost-worth-building.md`,
  the residual C5 leaves open when the cache half comes back undetermined.
- Circle record: `**Active spec/plan:**` set to the spec, `## Directive` replaced by the pointer
  literal in the same write, `## Grounding snapshot` rewritten. No other section touched.

## Verification performed

- Read in full: the Circle record, the planability check, the source analysis
  `260812-0303-simplify-speed-and-why-rules-do-not-hold.md`, the shaper and orchestrator session
  histories in this Circle.
- Listed the open records in both decision stores and both issue stores before filing; no entry
  covers the token-side measurement question.
- `bin/fusion-prose-metric` over the three written files: 0 em-dashes across 2479, 949 and 535
  prose words.
- No plan was written and no agent was dispatched.
