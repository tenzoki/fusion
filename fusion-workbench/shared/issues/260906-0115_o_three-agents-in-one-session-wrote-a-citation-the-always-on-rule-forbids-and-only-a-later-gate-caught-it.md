Three agents in one session wrote a citation the always-on rule forbids, and only a later gate caught it

---
The citation form is mandated in `rules/fusion-workbench-conventions.md`, which `bin/fusion-rules`
emits to every agent on every dispatch. In one session three different agents violated it in
three freshly written records. Each was caught by a release gate minutes to hours later, after
the record had been written and in one case committed, never at the moment of writing.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**The three, all on 2026-09-05 in session `260905-2008-orchestrator-session.md`.**

| writer | record | what it wrote | caught by |
|---|---|---|---|
| coder | `260905-2110-coder-the-pins-entry-chain-recovers-its-three-breaks.md` | the state marker spelled out instead of wildcarded | the sweep, before its commit |
| orchestrator | `260905-2213_*_two-concurrent-sessions-share-one-tmp-commit-message-path-so-one-can-commit-the-others-message.md` | a store-prefixed path into another project's workbench | the citation gate, one commit after it landed |
| analyst | `260906-0026-what-shared-state-the-hook-suite-reaches.md` | five store-prefixed paths in its Sources section | the sweep, while the suite was red for it |

The middle one left the release gate red at `cd623b6f` and was repaired at `4db7dddb`. The last
one left it red for every agent in the checkout until repaired by hand.

**Severity is in the second-order cost, not the repair.** Each repair is seconds. What each cost
was a diagnosis: a red suite that has to be attributed before it can be acted on, twice while
this session was also chasing an unrelated intermittent failure. One of those diagnoses produced
a wrong hypothesis that survived two messages.

**This is the second rule in this session measured to be loaded and missed.**
`260828-0044_*_thirty-four-of-sixty-two-records-filed-on-260827-carry-no-person-half-after-the-reach-was-settled.md`
found the same shape for the `**Filed by:**` field: mandated in the same always-on file, missed
in 6 of 99 September records, including one written by this session. Its repair was a header
template, and the coder who wrote that template said in the same report that it would not close
the gap alone, because the field was already mandated in a file every dispatch loads. This record
is the evidence for that judgement, from a different rule in the same file.

**What this record does not claim.** It does not claim the rule is unclear; it is stated with
worked cases and a closing paragraph on the pointer-versus-statement distinction. It does not
claim these agents were careless. Three writers with the text in context violating it in one
session is a property of where the rule sits relative to the act, not of who read it.

**Acceptance.** A citation that violates the form is reported to the writer at the moment the
record is written, not at the next gate run. `hooks/tracker.ts` already speaks to the model on a
narrow PostToolUse trigger when a review file lands, so the mechanism exists and the trigger is
the question: a record file landing in a workbench store is the analogous moment. Failing that,
the record states why write-time detection was rejected and what a session should do instead.

Closing this on "the three instances are repaired" is not acceptance. All three are repaired
already, and the next session will produce the fourth.

**Cross-references:**
`260828-0044_*_thirty-four-of-sixty-two-records-filed-on-260827-carry-no-person-half-after-the-reach-was-settled.md`
(the same shape, a different rule in the same file);
`260830-2235_*_the-fabricated-name-exemption-keys-on-the-literal-foo-so-every-realistic-probe-fixture-is-read-as-a-real-citation.md`
(undecidable as posed, and its diagnosis also ends at moving the check to write time).
