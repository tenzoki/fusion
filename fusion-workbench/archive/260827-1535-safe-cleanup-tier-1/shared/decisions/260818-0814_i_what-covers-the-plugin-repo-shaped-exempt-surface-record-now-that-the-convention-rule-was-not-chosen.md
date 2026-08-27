# What covers `260807-2153` now that the convention rule was not chosen?

---
**Domain:** code
**Status:** answered
**Filed by:** reconciler, session `260818-0708`
**Cross-references:** `shared/analyses/260818-0715-preventing-fusion-internal-identifiers-from-reaching-a-consuming-project.md` (recommendation 3 and Open Question 3); `shared/issues/260807-2153_o_the-exempt-surface-list-is-plugin-repo-shaped-but-ships-to-every-consumer.md` (the record left without a route); `shared/issues/260817-2131_c_nothing-stops-a-fusion-workbench-id-returning-to-an-emitted-hook-sentence-because-the-lint-reads-comment-lines-only.md` (the closed record whose resolution note carries the rejection)

---

## Question

Analysis `260818-0715` made five recommendations. The user's gate took 1 and 2 — the containment
gate, built in `33645a2` and `f3a3565` — and did **not** take 3, the convention rule that would
have authored the channel criterion in a file emitted to no agent. The rejection is recorded
in two places and in neither of them as a decision: `fusion-workbench/agentstate.yaml`
`plan_context.user_directive` ("Recommendation 3, the convention, was not chosen"), which the
Cleanup step deletes, and the closing paragraph of `260817-2131`'s `Resolved:` note, which is a
defect record's account of its own scope rather than a record of the choice.

The rejection itself is settled and needs no further answer. What is not settled is its stated
consequence. Recommendation 3 says in its own text that the convention rule "is also the only
surface that covers `260807-2153`, the open sibling one layer up, where a rule file's *statement*
rather than its identifiers is written from the plugin repository's position." That record has been
open since 2026-08-07. With recommendation 3 declined, nothing in the workbench names a route to it,
and the analysis's own Open Question 3 — whether the two should be answered by one text — is now
answered on one side and unasked on the other.

It comes to a decision rather than back to the analyst because the input it needs is the user's
intent behind the rejection, which the two surviving records do not carry: whether the convention
was refused as a *surface* (a rule file nobody is emitted, charged to no bound) or as a *statement*
(the criterion should not be written down at all). Those two readings lead to different answers
below and nothing on disk separates them.

## Options

1. **`260807-2153` is deferred with the convention.** Read the gate answer as covering both: the
   criterion stays in the containment test's header, where it is enforced, and the plugin-repo-shaped
   exempt-surface record waits for a session that wants it.
   - Pros: no new surface; matches the plainest reading of "not chosen"; costs nothing today.
   - Cons: leaves an open record with no route and no stated reason, which is the state that made
     this worth filing; the header of a test file is not where a reader of `rules/` looks.
2. **`260807-2153` gets its own route, independent of the convention.** It is a defect about one
   list's wording in `rules/fusion-workbench-conventions.md` `## Project language`, and it can be
   answered as a defect by `coder` without any rule file being created.
   - Pros: closes a nine-day-old record at the cost of an edit to one list; does not reopen the
     rejected recommendation.
   - Cons: answers the instance and not the class, so the next surface written from the plugin's
     position arrives unguarded — which is the objection recommendation 3 was built against.
3. **Re-put recommendation 3 with its cost measured.** The analysis priced it against the growth
   bounds and found it binds none; if the rejection was about surface rather than about the
   statement, that measurement is the missing input and the question can be asked again once.
   - Pros: the only option that answers both records with one text, which is what Open Question 3
     asked for.
   - Cons: re-asking a question the user has already answered is a cost of its own, and it should
     not happen without new information — the measurement is not new, it was in the analysis.

## Constraints

- Nothing here may reopen the containment gate's scope. The static shipped surface stays ungated and
  unswept (analysis recommendation 4), whichever option is taken.
- Any answer that creates a rule file is charged to no dispatch only if it is emitted to no agent,
  on the `rules/rule-file-provenance.md` precedent. A rule emitted to every agent lands on the
  always-on floor and on a failing growth bound.
- `260807-2153` must not be closed by this record. It is a defect; this decides what route it takes.

## Recommendation

None from the filing agent. The choice turns on what the user meant by declining recommendation 3,
and that is the one input reconstruction cannot supply. Option 1 is the cheapest and option 2 is the
one that actually clears a record; option 3 should only be reached if the rejection was about the
rule file as a surface rather than about writing the criterion down.

---
Answered: <set when status moves to _a_>
Implemented: `e7ca60f` 2026-08-18, `coder`, in the commit that carries this transition — option 2 realised: the exempt-surface block in `rules/fusion-workbench-conventions.md` `## Project language` is split into a universal group and a criterion a project evaluates against itself (text a project ships to consumers of unknown language is English), this repository's double role is named rather than passed over, and no rule file was created. `shared/issues/260807-2153_*_the-exempt-surface-list-is-plugin-repo-shaped-but-ships-to-every-consumer.md` is closed `_c_`. The residual the answer named stands: the instance is answered, the class is not.
Deferred: <set when status moves to _d_>
Superseded by: <set when status moves to _s_>
Retired: <set when the implementation is removed; the marker stays _i_>

---
Answered: user gate, orchestrator session `shared/history/260818-0708-orchestrator-session.md`, 2026-08-18 — option 2. `260807-2153` gets its own route as an ordinary defect against the wording of one list in `rules/fusion-workbench-conventions.md` `## Project language`, with no rule file created. The rejection of recommendation 3 stands and is read as a rejection of the *surface*, not of the criterion, which continues to live in the containment test's header where it is enforced. The residual is accepted and named: this answers the instance and not the class, so the next shipped surface written from the plugin repository's position arrives unguarded.
