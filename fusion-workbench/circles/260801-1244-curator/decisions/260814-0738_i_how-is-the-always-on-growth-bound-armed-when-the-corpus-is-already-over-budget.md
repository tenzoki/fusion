# How is the always-on growth bound armed when the corpus is already over budget?

---
**Domain:** code
**Status:** implemented
**Filed by:** shaper (portfolio-activation mode)
**Cross-references:** `260814-0738_*_spec-curator.md` C10; `hooks/lib/__tests__/rules-emission-golden.test.ts`; `260812-0022-where-the-complexity-comes-from-and-what-would-have-to-go.md`

---

## Question

Capability C10 turns the always-on rule set's growth budget from a report into a test failure. The corpus is already over that budget on the day the capability is specified: measured on 2026-08-14 at HEAD `d7786eb`, all five roles exceed their head-room, the leanest by 10 812 bytes and the orchestrator's role by 17 175. The whole overshoot is universal-core growth, 22 812 bytes added to the five always-on files since the 2026-08-05 cut against 12 000 bytes of head-room.

Arming the bound on that corpus ships a red suite. So the bound cannot be armed without one of three things happening first, and the choice decides whether this Circle also carries a cut of roughly 11 KB that the user removed from its scope.

The question must be answered before the planner plans C10, because the acceptance criteria differ between the options.

## Options

1. **Re-baseline once at the moment of arming, then bound growth from there.** The baseline map is re-set from the corpus as this Circle leaves it, the bound applies to everything after, and the 2026-08-14 overshoot is written into the file as text so the standing cleanup request survives the number moving.
   - Pros: it is what rate-bounding means, and it matches the finding in `260812-0022-...` that the binding constraint is the rate of addition rather than the size of the system. It keeps the compaction work out of scope, as the user directed on 2026-08-14. It arms green.
   - Cons: it overrides a position recorded in `hooks/lib/__tests__/rules-emission-golden.test.ts`, which states that the baseline moves at exactly one moment, after somebody has done the cleanup the report asked for. A reader of that file who has not read this record will read the arming re-baseline as the silent raise the file warns against.

2. **Cut the always-on set back under budget first, then arm at the existing baseline.** Roughly 11 KB has to come out of the five always-on files, most of it from `rules/fusion-workbench-conventions.md`, which grew 17 249 bytes since the cut.
   - Pros: the instrument's own rule is obeyed exactly. The baseline keeps meaning what it has always meant, and the project ships a leaner corpus.
   - Cons: it reintroduces the compaction work the user removed from this Circle's scope on 2026-08-14 when C9 was retired. It is also the work the curator's own evidence tiers cannot justify: the earlier spec is explicit that widening the tiers to reach "this reads long" is the exact failure the tiers exist to prevent, and it states that compaction will not shrink the file much. So the cut would be hand-performed coder work of unscoped size sitting on this Circle's critical path.

3. **Arm the bound and accept a red suite until a cut lands.** The bound is armed at the existing baseline and the suite stays failing.
   - Pros: the overshoot is impossible to ignore.
   - Cons: a permanently red suite is a suite nobody reads, which converts the one hard signal into noise and destroys the value of the two gates already in the file. This is listed for completeness and is not seriously proposed.

## Constraints

- `RELEASE_CAP` at 105 354 and `DRIFT_CEILING` at 145 144 are historical facts and are never raised, whichever option is chosen.
- Whatever is chosen must leave the standing cleanup request legible. Option 1 satisfies this by writing the overshoot into the file as text rather than leaving it encoded only in a number that has moved.
- The bound is hard for the universal core only. Role-specific rule text keeps the report, and that part of the cut is not in question here.
- The answer changes only C10's acceptance criteria. No other capability in the spec depends on it.

## Recommendation

Option 1, and the spec specifies it on that basis.

The argument for overriding the recorded position is that the rule was written for a reporting instrument, where the baseline's only job is to keep the report actionable, and that under a blocking gate the baseline acquires a second job, namely defining what the gate blocks on. The rule was not written against that case, so applying it there is an extension rather than obedience. What the rule protects against, a silent raise that retires every justification standing above it, is preserved by making the arming re-baseline explicit in the file and keeping the overshoot recorded as text.

Confidence, labelled per `rules/critical-stance.md`: the measurements are verified, having been produced by running the test on 2026-08-14. The reading of the instrument's intent is inference from the comments in that file, not a position the user has stated. The judgement that option 2 conflicts with the user's 2026-08-14 direction is inference from the retirement of C9, not a statement the user made about C10.

---
Answered: 260813-2345-orchestrator-session.md § User decisions recorded this session, item 5 — option 1, re-baseline once at arming; the 2026-08-14 overshoot is written into the file as text so the standing cleanup request survives the number moving. Answered by the user on 2026-08-14 at an orchestrator gate, having been shown that this overrides the recorded position in rules-emission-golden.test.ts.
Implemented: 5c843e6 — the five core entries in RULE_BASELINE re-set once at the arming, each carrying an inline comment naming the event; the three role-specific entries keep their 2026-08-05 figures. The cut log gains a dated arming entry stating that no bytes were removed and reproducing the per-role overshoot as text, so the standing cleanup request survives the number moving. RELEASE_CAP and DRIFT_CEILING untouched. The bound was falsified live against an always-on file and a role-specific one before being accepted.
Deferred:
Superseded by:
