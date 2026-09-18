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
