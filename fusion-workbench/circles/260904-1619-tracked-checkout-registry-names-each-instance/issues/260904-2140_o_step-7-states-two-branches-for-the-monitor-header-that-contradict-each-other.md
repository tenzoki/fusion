Step 7 states two branches for the monitor header that contradict each other
---
The step's Changes say the header shows "the hex alone where none is" found, and its Acceptance says that with the store absent it renders "exactly what it renders at HEAD". At HEAD the header names no checkout at all, so the two sentences cannot both hold as a two-branch reading.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Where.** `260904-1651_*_the-checkout-registry-names-each-instance-and-joins-one-persons-identities.md`, step 7, its Changes paragraph against its Acceptance line.

**How it was resolved, and by whom.** The implementing coder read the two sentences as three branches rather than two and said so in its report rather than choosing silently: an entry with an alias renders `<alias> · <hex>`; a registry present with no entry for this hex renders the hex alone, which is the Changes sentence; no store at all renders what HEAD renders, which is the Acceptance line. All three were tested against four scratch workbenches served by the real script and read through the dashboard endpoint, with the store-absent case diffed against `git show HEAD:bin/monitor` in both the payload and the served HTML.

**Why that reading is the right one and not merely a workable one.** The Circle's Directive states that every consumer falls back to today's behaviour when no entry exists, which is what makes the registry adoptable one checkout at a time with no migration. A bare hex in the header of every project that has no registry at all would be a visible change in a project that never opted in, and it would contradict that constraint rather than merely stretching the step's wording.

**Acceptance.** Step 7's text in the plan states three branches rather than two, so step 13's verification pass reads a specification that matches what was built. No code changes: the built behaviour is already the one this record endorses.
