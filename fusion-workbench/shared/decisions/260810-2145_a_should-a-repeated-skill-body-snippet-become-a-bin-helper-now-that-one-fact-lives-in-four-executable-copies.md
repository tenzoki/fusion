# Should a repeated skill-body snippet become a `bin/` helper, now that one fact lives in four executable copies?

---
**Domain:** code
**Status:** open
**Filed by:** orchestrator (on the Turn-2 and Turn-3 executors' proposals)
**Cross-references:** `shared/issues/260810-2030_*_the-source-root-resolution-is-stated-in-two-skill-bodies-and-has-no-single-home.md`; `shared/issues/260810-2110_o_the-domain-capture-one-liner-is-now-copied-into-a-fourth-skill-body-and-the-copying-is-the-stated-justification.md`; `shared/issues/260810-1918_c_the-cleanup-skill-carries-a-second-domain-cascade-in-the-pre-fix-order-and-no-gate-reads-it.md`

---

## Question

Two snippets are now repeated across skill bodies, and both repetitions were introduced this session
as fixes.

The **source-root resolution** decides whether a citation resolves to the plugin's work tree or to
the installed copy. It exists in four places across `skills/setup/SKILL.md` and
`skills/next/SKILL.md`: an announcing block in each, plus an inline re-resolution in each, because a
later shell call is a fresh shell.

The **domain capture**, which reads `session.domain` from `agentstate.yaml` with a `code` fallback,
now sits in four skill bodies. It reached the fourth this session as the fix for the duplicated
domain cascade, and the fact that three skills already copied it was the stated justification for the
fourth copying it too.

The question is whether either becomes a `bin/` helper, and it is a question rather than an obvious
yes because a `bin/` helper is a real addition to a surface every agent and skill already calls at
Setup.

## What made it concrete

The Turn-3 executor reported it from the work rather than from principle. Fixing the empty-root
report — one factual change — had to be written into four places in two files, and getting it wrong
in one of them would have been invisible. The prose in each file promises the inline copy is "those
same two lines", and nothing checks that promise.

The precedent sits in the same session and cost two Turns. `skills/cleanup/SKILL.md` carried a second
statement of the domain cascade, in the order from before a fix, and no gate read it, so the two
copies diverged behaviourally and a consuming project got `code` at Setup and `strategic` at Cleanup
in one session. That is what an unchecked duplicate does when it is left alone long enough.

Both executors landed independently on the same recommendation, and the second added a distinction
worth keeping: **the source-root case is the stronger of the two, because its copies are executable
rather than merely repeated.** A repeated sentence drifts in meaning; repeated shell drifts in
behaviour.

## Options

1. **One helper for the source root only.** `bin/fusion-source-root` prints the root, the four copies
   become four calls.
   - Pros: removes the executable duplication, which is the sharper half; the criterion already has
     one home in `bin/fusion-plugin-cwd`, and this would stop each consumer re-deriving what to do
     with its answer.
   - Cons: a new `bin/` entry for what is presently two consumers.

2. **One helper for each.** As above, plus a helper or a documented one-liner home for the domain
   capture.
   - Pros: settles both records; the domain capture is on its fourth copy and the copying is
     self-justifying, which is how a fifth arrives.
   - Cons: two new surfaces at once; the domain capture is a `sed` over a YAML field and may not earn
     a helper of its own.

3. **Neither. Gate the duplication instead.** Leave the copies and add a check that they are
   byte-identical, the way the cascade gate now checks for a second statement of the cascade.
   - Pros: no new runtime surface; turns an unchecked promise into a checked one, which is the actual
     complaint in both records.
   - Cons: a gate over copies is still copies; it catches divergence and does not prevent the fifth
     copy from being written.

4. **Neither, and record why.** Accept the repetition as the cost of skills being self-contained
   documents, and note it so the next executor does not re-file it.

## Constraints

- Whatever is chosen must keep the no-upward-walk bound in `bin/fusion-plugin-cwd`: from a
  subdirectory of the plugin's own repository the answer is the install, congruent with
  `hooks/lib/self-detect.ts` by design.
- The `queue-check: UNAVAILABLE` and `UNRESOLVED (FUSION_PLUGIN_ROOT is unset)` reports must survive
  any refactor. An unresolvable root has to be named, never silently empty.
- Skills are not served by `bin/fusion-rules`, so a rule file is not a route here. That was settled
  this session in decision `260810-1822`.

## Recommendation

Option 1, and treat option 2's second half as a separate call once the first has proved itself.
The executable duplication is the one that can diverge in behaviour without anybody reading the
files, and this session already paid for exactly that failure once. The domain capture is a weaker
case: it is short, it is read-only, and its fallback is stated at every site.

Option 3 deserves a fair hearing rather than a dismissal. It is cheaper, it is the mechanism this
session has been building all day, and "gate the duplication" is a legitimate answer when the copies
genuinely belong to self-contained documents. The argument against it is that a gate over four
executable copies still leaves four copies to maintain, and the maintenance is the cost being
complained about.

---
Answered:
Implemented:
Deferred:
Superseded by:

---
Answered: user, session 260811-0752 (chat) — **Option 1.** `bin/fusion-source-root` prints the
source root and the four skill-body copies become four calls. Follows the record's recommendation:
the executable duplicate is the one that can diverge in behaviour without anyone reading the files,
and this session paid for exactly that failure once, when a correction reached two copies and left
two standing. Option 2's second half, a helper or documented home for the domain capture, is a
separate call to be made once the first has proved itself; the record's reasoning for treating it
as the weaker case (short, read-only, fallback stated at every site) stands.

---
Implemented (option 1 only — **the marker stays `_a_`, deliberately**): `bin/fusion-source-root`
now owns the source-root criterion; the four executable copies across `skills/setup/SKILL.md`
and `skills/next/SKILL.md` are guarded calls to it, and `skills/cleanup/SKILL.md` and
`skills/help/SKILL.md` were moved onto the same root in the same change, closing
`shared/issues/260811-1733_*_…` and `shared/issues/260811-0109_*_…`. `grep -rn
'fusion-plugin-cwd' agents/ skills/ rules/` is empty. Suite green, 1293 passed.

**Why this record is not `_i_`.** It bundles two questions, and only the first is answered.
Option 2's second half — a helper or a documented home for the **domain capture** — is held in
reserve by this very answer ("a separate call to be made once the first has proved itself"), and
it is still carried by `shared/issues/260810-2110_o_the-domain-capture-one-liner-is-now-copied-
into-a-fourth-skill-body-and-the-copying-is-the-stated-justification.md` and by `tasklist.md`
task 41. `_i_` is terminal, so marking it would close a record whose second half nobody has
decided.

That is the reasoning `shared/decisions/260810-1544_*_should-prompt-called-bin-helpers-get-one-
guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md` was written out of,
applied to itself: a decision record bundling separable questions cannot be tracked, because its
state is not a single value, and the repair is to split rather than to pick a marker that lies
in one direction. When the domain-capture call is taken up, split this record — file that half
as its own decision, and move this one to `_i_` on the source-root half alone.
