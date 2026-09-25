The skill promises the before-text re-read that the edge exception gives up, and one apply bullet names a staleness test with no stale outcome

---

Two statements about the apply pass's safety no longer describe it. `skills/curate/SKILL.md` Step 6 tells the user every approved entry's before-text is re-read and compared; the edge exception gives that comparison up for the two edge groups. And the first bullet after the preconditions names a staleness test whose two outcomes are both non-stale.

---

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

## Defect 1 — the skill over-promises

`skills/curate/SKILL.md` `## Step 6 — Dispatch the curator to apply`:

> The apply pass re-reads each approved entry's before-text from disk before touching it, so an entry whose file moved under the gate is marked stale rather than applied. That check is what makes this two-dispatch path as safe as a run the agent holds end to end

`agents/curator.md` `### Pass 2 — apply`:

> For those two fields on a work item, and for no other field on any surface, **what the exception gives up is the whole-line before-text comparison and nothing else.**

So for the two edge groups the claim is false as written: the field line is read, but it is not compared against the ledger's Before. A third party who adds or removes a basename in that line between the gate and the apply is not detected — the three preconditions test the field's *presence*, not its content, and the relevant branch holds "whatever basenames it now holds". That is deliberate and argued (`### Pass 2 — apply`, the collision bullet); what is wrong is the skill body still stating the general property, in the one step whose whole job is to tell the user what safety they are getting.

## Defect 2 — a staleness test with no stale outcome

`agents/curator.md` `### Pass 2 — apply`, first bullet under "Then, and only then, the write and its comparison":

> **Staleness is judged on this entry's own basename**, absent or present in the list on disk — never on the whole line matching the ledger's Before.

The next bullet supplies both outcomes of that test, and neither is `stale`:

> **A basename already present is `applied` with nothing written**, not `stale`

and an absent basename is written. Staleness for an edge entry is in fact decided by the three preconditions above the bullet — record resolves, dependent live, field presence agrees — none of which is "this entry's own basename". The bullet is a leftover of the pre-`260918-0821` shape, where the basename test *was* the whole of the staleness machinery, and it now contradicts the preconditions restored above it. A reader who takes the bullet at its word skips them.

## Acceptance test

- `skills/curate/SKILL.md` Step 6 states the safety the apply pass actually carries, naming the edge groups' narrower check.
- `agents/curator.md` `### Pass 2 — apply` states once where staleness is decided, and the bullet either names the whole-line comparison it displaces without claiming to decide staleness, or goes.

Resolved, both halves — and the sweep found a third instance of defect 1, in `agents/curator.md` itself.

**Defect 1 — the text stops promising, and that is the right way round here.** What the skill promised is a comparison the apply pass gives up on purpose: the collision forced it out, the argument is in `### Pass 2 — apply` and it holds, and `skills/curate/SKILL.md` is the wrong place to re-decide it. So Step 6 now states the safety the pass carries: "The apply pass re-reads from disk before touching anything, so an entry whose file moved under the gate is stale rather than applied — the whole before-text for most entries, and for the two edge fields the record and three preconditions, the rest of that shared line being other entries'." The sentence that made the general claim — "as safe as a run the agent holds end to end" — is gone; the "it is the agent's check, not this skill's" clause is kept, because that one is true and load-bearing. Net +32 bytes against 63 free on the skills bound.

**The same over-promise stood in the agent prompt**, one paragraph above the exception that falsifies it, and the review did not reach it: `### Pass 2 — apply`'s opening said the before-text re-read "is what makes a two-dispatch run as safe as a one-dispatch run" without qualification. It now reads "**for every entry that owns its region**", and says what the edge entry gets instead, closing with a clause that forbids the defect from coming back on either surface: "no sentence here or in `skills/curate/SKILL.md` may claim the whole-line comparison on its behalf."

**Defect 2 — the bullet stops claiming to decide staleness.** It is not deleted, because the comparison it describes is real and its absence needs explaining; what goes is the claim that staleness turns on it. It now reads: "**What the exception displaces is the whole-line comparison against the ledger's Before, and nothing about staleness**, which the three preconditions above decide and nothing below them revisits." The collision reasoning and the yield-of-two measurement are kept, and the bullet ends by handing the basename read to the next bullet, which supplies both its outcomes. Acceptance test met on both branches: the skill states the safety the pass actually carries and names the edge groups' narrower check, and staleness is stated once, at the preconditions.
