# What does a second checkout do with a Circle record marked active that it never activated?

---
**Domain:** code
**Filed by:** analyst, C1 isolation measurement
**Cross-references:**
`circles/260822-1921-measure-what-two-checkouts-share/analyses/260822-2219-what-two-checkouts-of-one-project-actually-share.md` (the measurement that raised it, `## Findings` section 3);
`shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` (class L of its state partition, which puts `.active-circle` in the group that never travels, and answer 4, which limits cross-checkout visibility to presence);
`shared/decisions/260822-1610_*_how-does-fusion-support-several-people-working-one-project-at-once.md` (the arrangement this is a consequence of);
`rules/circle-records.md` (the state vocabulary the `_t_` marker belongs to);
`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` (the closed writer set of `.active-circle`)

---

## Question

The Circle state marker travels and the activation pointer does not. A Circle record is tracked, so a second checkout pulls `circles/<c>/_t_circle.md` with its active marker intact. `.active-circle` is class L, ignored by construction, so the second checkout has none. Measured in a fresh clone: `bin/fusion-paths analyst` emits no `CIRCLE=` key at all and routes `OUT_ANALYSIS`, `OUT_ISSUE`, `OUT_DECISION` and `OUT_HISTORY` into `shared/`, while `circles/<c>/_t_circle.md` sits in that same tree saying the Circle is active.

That divergence is what makes the isolation work, so it is not a defect. It is unanswered, though: nothing in the workbench says what an orchestrator starting in the second checkout should do when it reads a `_t_` record it never activated. Three behaviours are all defensible from what is written today, and they differ in where the second person's work lands.

It has to be answered inside C2, which settles what travels, and before C3, which changes every record template. After C3 the cost of changing the answer includes rewriting records.

## Options

1. **Activation is per checkout, and a pulled `_t_` record means nothing locally.** The second checkout treats the marker as somebody else's state, writes into `shared/` until its own user activates something, and says so once at Setup.
   - Pros: matches class L exactly, needs no new mechanism, and preserves the property the whole arrangement rests on, that no session reads another session's live state. It is also what the code does today with no change at all.
   - Cons: the same Circle can be active in two checkouts with neither able to see the other, which was measured and has no detection anywhere. Work on one Directive lands in `shared/` in one tree and in the Circle in the other, so the Origin Rule produces two different answers for one unit of work depending on who did it.
2. **A pulled `_t_` record is adopted: the second checkout writes `.active-circle` from it at Setup.** One `_t_` record in `circles/` implies the local pointer.
   - Pros: artifacts from both people land in the same Circle, which is what the Origin Rule says should happen; no split store for one Directive.
   - Cons: it adds a writer to `.active-circle`, whose writer set is closed and enumerated in `rules/fusion-workbench-conventions.md`; it makes a pulled file change local live state, which is the boundary answer 4 drew; and with two `_t_` records it has no rule.
3. **The second checkout is told and decides.** Setup reports "a Circle is marked active in this workbench and nothing is active in this checkout" and offers activation as a user act.
   - Pros: no automatic write to live state, the divergence becomes visible at the one moment it is cheap to resolve, and it is the presence-only visibility the user asked for, applied to activation.
   - Cons: a gate in Setup, on a surface with a measured head-room problem; and it still permits two checkouts to activate one Circle, so it informs rather than prevents.

## Constraints

- `.active-circle` stays untracked. The user's answer 5 is final: no currently ignored file becomes tracked.
- No session may read another session's live state. Answer 4 limits cross-checkout visibility to presence.
- Whatever is chosen must work in a checkout that has pulled records and run nothing else.
- The writer set of `.active-circle` is closed and enumerated. Any answer that adds a writer adds itself to that enumeration in the same commit.

## Recommendation

`inference:` Option 3, and only if C2 finds room for it. It is the only one of the three that neither hides the divergence nor writes live state from a pulled file, and it is the same shape as the advisory single-orchestrator warning fusion already ships. Option 1 is what happens today and is a defensible answer to leave standing, provided it is written down rather than left as behaviour nobody chose. Option 2 is refused here: it makes a tracked file drive an untracked one, which inverts the partition the whole design rests on.

This is genuinely the user's, because it trades a split store for one Directive against a gate on a surface the user has already paid a whole Circle to make room on.

---
Answered:
Implemented:
Deferred:
Superseded by:
Retired:
