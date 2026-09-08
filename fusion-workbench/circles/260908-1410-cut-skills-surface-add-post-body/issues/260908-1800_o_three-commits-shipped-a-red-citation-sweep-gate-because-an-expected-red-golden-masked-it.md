Three commits shipped a red citation-sweep gate because an expected-red golden masked it

---

`hooks/lib/__tests__/citation-sweep.test.ts` failed on committed content for the whole of this Circle's Phase B and C, and no step noticed, because the plan deliberately leaves the surface-growth golden stale until step 16 and so makes a red suite the expected state of every intermediate commit.

---
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

**Evidence.** At step 17 the full suite reported `1 failed | 924 passed`, the failure being `citation-sweep.test.ts > --dry-run over this repository's workbench reports rewrites=0` with `files=3 rewrites=7`. Seven record citations spelled a literal state marker where `rules/fusion-workbench-conventions.md` `## Filename Patterns` requires the wildcarded form: five in the plan's `## Open Questions` and `## Filed alongside this plan`, one in each of the two Phase-B and Phase-C history logs, all naming the same two files. The five in the plan are present in `git show b0705cc4` of that file, which is the commit that filed the plan, so the gate has been red since the Circle's first commit and stayed red through `22d6f839` and `02533218`.

**Why nothing caught it.** `260815-2322_*_can-a-commit-stand-green-on-its-own-when-the-golden-is-a-per-file-inventory-of-a-multi-file-turn.md` rules that the green unit is the Turn rather than the commit, and this plan's step 16 accordingly regenerates the golden once at the end. Every Phase A and B dispatch was told in its own words to expect a stale golden inventory. That instruction is correct and is not what is being questioned here; the cost is that it makes *any* red suite unremarkable for the length of a Circle, so a second, unrelated cause of red carries no signal. The residual that record accepted was the golden's own staleness. What this Circle measured is that the residual is wider: while the golden is stale, every other gate is unwatched too.

**What was done.** The seven tokens were corrected in place at step 17 and `bin/fusion-citation-sweep --dry-run` then reported `files=0 rewrites=0`; `npm test` exits 0. This record is about the blind spot, not about the seven tokens.

**Acceptance test.** A Circle that defers its golden regeneration to a final step has some way of telling a red suite caused by the stale golden from a red suite caused by anything else, without waiting for that final step. Naming the one test file expected to fail, and treating any other failing file as a stop, would satisfy it.
