Three commits shipped a red citation-sweep gate because an expected-red golden masked it

---

`hooks/lib/__tests__/citation-sweep.test.ts` failed on committed content for the whole of this Circle's Phase B and C, and no step noticed, because the plan deliberately leaves the surface-growth golden stale until step 16 and so makes a red suite the expected state of every intermediate commit.

---
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

**Evidence.** At step 17 the full suite reported `1 failed | 924 passed`, the failure being `citation-sweep.test.ts > --dry-run over this repository's workbench reports rewrites=0` with `files=3 rewrites=7`. Seven record citations spelled a literal state marker where `rules/fusion-workbench-conventions.md` `## Filename Patterns` requires the wildcarded form: five in the plan's `## Open Questions` and `## Filed alongside this plan`, one in each of the two Phase-B and Phase-C history logs, all naming the same two files. The five in the plan are present in `git show b0705cc4` of that file, which is the commit that filed the plan, so the gate has been red since the Circle's first commit and stayed red through `22d6f839` and `02533218`.

**Why nothing caught it.** `260815-2322_*_can-a-commit-stand-green-on-its-own-when-the-golden-is-a-per-file-inventory-of-a-multi-file-turn.md` rules that the green unit is the Turn rather than the commit, and this plan's step 16 accordingly regenerates the golden once at the end. Every Phase A and B dispatch was told in its own words to expect a stale golden inventory. That instruction is correct and is not what is being questioned here; the cost is that it makes *any* red suite unremarkable for the length of a Circle, so a second, unrelated cause of red carries no signal. The residual that record accepted was the golden's own staleness. What this Circle measured is that the residual is wider: while the golden is stale, every other gate is unwatched too.

**What was done.** The seven tokens were corrected in place at step 17 and `bin/fusion-citation-sweep --dry-run` then reported `files=0 rewrites=0`; `npm test` exits 0. This record is about the blind spot, not about the seven tokens.

**Acceptance test.** A Circle that defers its golden regeneration to a final step has some way of telling a red suite caused by the stale golden from a red suite caused by anything else, without waiting for that final step. Naming the one test file expected to fail, and treating any other failing file as a stop, would satisfy it.

---
Reconciled 260908-1814 (reconciler, HEAD `ee99a578`): still open. **The evidence checks out and the
reasoning holds, with one refinement to the mechanism.**

Verified against the commits named. `git show b0705cc4` of the plan carries five literal-marker citations —
one at `## Open Questions` and four under `## Filed alongside this plan`, each spelling `_o_` where the
storeless grammar requires `_*_`. That commit is the one that filed the plan, and `git log` over the
planning store shows the plan was touched again only at `3175f39e`, `22d6f839`, `02533218` and `ee99a578`,
with the citation correction landing in the last of those. So the gate was red at `b0705cc4` and stayed red
through the two commits the record names. The two history logs each carried one further token, corrected in
the same commit.

**The refinement.** The record reads as though a red suite was seen and attributed to the golden. It was
not: no Phase A, B or C dispatch ran the full suite at all. The four coder logs each report a hand-picked
`npx vitest run` over the lint files the dispatch touched, and `citation-sweep.test.ts` is in none of those
sets. So the causal chain is one link longer than stated — the deferred golden made a full-suite green
unattainable by construction, which pushed every executor onto a chosen subset, and the gate that went red
was never in anybody's subset. That strengthens the record rather than weakening it: the wider residual it
measures is real, and the mechanism is not "a second red is unremarkable" but "there is no run in which a
second red would have appeared". The acceptance test as written already covers it, because naming the one
file expected to fail is only meaningful against a full run.

The claim that the deferred-golden decision's accepted residual is wider than that decision stated is
correct. `260815-2322_*_can-a-commit-stand-green-on-its-own-when-the-golden-is-a-per-file-inventory-of-a-multi-file-turn.md`
reasons entirely about the golden's own staleness and says nothing about the other gates in the window.

Also seen: 260908-2038 by coder — twice more in this Circle, and the second and third instances
narrow the mechanism past what this record states. The closure review at `b625a47f` carried six
marker-spelled citations, and the history log of the dispatch that fixed them carried two. In
neither case was a stale golden involved: the golden was current and the dispatch before each one
ran the full suite, saw its red and attributed it correctly.

What operates in all three is one link further on. **The file that reddens the gate is a record
written after the last verification, by an agent producing prose rather than code, and nothing runs
between writing it and committing it.** A dispatch verifies, then writes its own history log, then
returns; the orchestrator stages both. The deferred golden explains only the first instance, by
making a full-suite run pointless; the other two need no golden at all.

That widens the acceptance test rather than satisfying it. Distinguishing a stale-golden red from
any other red does not reach a red that appears after the last run of the suite.
