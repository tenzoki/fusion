Setup's claim branch leaves a Circle claimed by this checkout unstated where next's states it
---
`skills/setup/SKILL.md:351` splits the claim read two ways: `Claimed ` naming another identity, and "`Unclaimed`, or no field". A `**Claim:**` opening with `Claimed ` and naming *this* checkout falls through both. `skills/next/SKILL.md:207` closes the same split with three cases, the third being "this checkout's own identity", so the two readers of one field describe different case-spaces.
---
**Filed by:** coderev
**Attribution backfilled 260825 (not written by the filing agent):** `coderev` filed this record; the person half of `**Filed by:**` is absent because the installed plugin at `$FUSION_PLUGIN_ROOT` carried no `bin/fusion-identity` at that time. See `260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`.

Found reviewing `0f5889e..3fba5c6`, the two commits that close the C3 Circle's high-severity findings. The sentence was edited at `3fba5c6`, which repaired its citation and left the split as it stood.

**The two splits, side by side.**

`skills/setup/SKILL.md:351`, Step 0i, the branch for one `_t_` record and no pointer:

> where it opens with `Claimed ` and names an identity other than the one just read, name the holder and the time **before** the offer, and the offer overrides […]. `Unclaimed`, or no field, behaves as today.

`skills/next/SKILL.md:207`, Step 6.1:

> Where the field opens with `Claimed ` and names another identity […]. `Unclaimed`, an absent field, or this checkout's own identity is the mismatch above and is reported as one.

**The uncovered state is the one Step 0i opens by describing.** Its own first paragraph (`:332`) says "A pointer deleted by hand is that same state, same report, same offer." A checkout that activated a Circle and then lost or deleted `.active-circle` holds a record claimed by itself with no pointer, which is precisely the `Claimed `-and-same-identity case, and precisely the condition that gates the whole step. Neither sub-branch names it.

**What the run does then is not stated, only inferable.** The offer *Activate it here* / *Leave it inactive* stands outside the claim reading, so the plain offer probably runs and no holder is named. That is very likely the right behaviour, and it is exactly the kind of "probably" `rules/critical-stance.md` §4 rules out: every input falls in exactly one branch, or the split is wrong. A run that instead reads the case as unhandled has two other exits available: report a mismatch the way `/fusion:next` does at that identity, or name the holder as "you" before offering.

**Severity is low and the reason to file it is not.** No data is lost either way and the offer is the same. What is at stake is that the two shipped readers of `**Claim:**` now disagree about how many cases the field has, in the Circle whose Directive is the claim, and `rules/circle-records.md:202-205` fixes a reader test that both are meant to implement.

Fix direction: state the third case in Step 0i and say what it does, matching the shape `skills/next/SKILL.md:207` uses. Cheapest form is one clause on the existing sentence, "`Unclaimed`, no field, or this checkout's own identity behaves as today", which costs `skills/` about thirty bytes against the surface that shrank 92 at `3fba5c6`. Confirm that "behaves as today" is in fact what is wanted for the third case before writing it; if it is not, the branch needs its own sentence.

---
**Reconciliation 260824-1637** (reconciler, domain `code`, Phase 3 of session `260824-0539`, HEAD `cf7a5b0`; log `260824-1637-reconciliation.md`) — **STAYS `_o_`.** Both sides re-read at HEAD. `skills/setup/SKILL.md:351` splits the claim two ways, `Claimed ` naming another identity and `Unclaimed`-or-absent, and says nothing about `Claimed ` naming this checkout. `skills/next/SKILL.md:207` closes with "`Unclaimed`, an absent field, or this checkout's own identity is the mismatch above and is reported as one", which is the third case. The asymmetry stands.

---
Resolved: fixed — Step 0i names the third case, `Claimed ` with this checkout's own identity, and says it behaves as today, matching the three-way split `/fusion:next` Step 6.1 uses; `skills/setup/SKILL.md:357`
