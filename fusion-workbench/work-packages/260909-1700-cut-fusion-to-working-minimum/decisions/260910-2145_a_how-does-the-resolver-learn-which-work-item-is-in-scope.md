# How does bin/fusion-paths learn which work item is in scope?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260910-2133_*_does-a-unit-of-work-keep-its-own-container-for-the-artifacts-it-produces.md; 260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md step C9; 260910-2145_*_does-the-container-store-keep-the-directory-name-circles.md; 07961552

---

## Question

The container ruling restores a per-work-item directory, so `bin/fusion-paths` has a placement decision to make again: every `OUT_*` points into the container of the item in scope, or into `shared/` when no item is in scope. The resolver has to learn which item that is, from a single call at Setup step 2, with no session state to carry.

The mechanism it used until `07961552` was `.active-circle`, an untracked one-line pointer at the workbench root holding the active Circle's directory name. That file is gone, and the thing it pointed at is gone with it. Since C9 a work item carries its own holder in a head field, `**Claim:** <8 hex> — <person>, YYMMDD-HHMM`, and `bin/fusion-rules` already reads exactly that field to resolve the context-manifest topic (`bin/fusion-rules` `resolve_topics`). So the question is whether the pointer comes back or whether the claim field answers for both helpers.

It must be settled before the resolver is written, because the answer decides the exit table, the failure behaviour, and whether `rules/workbench-tracking.md` gains a class L entry.

## Options

1. **A per-checkout pointer file** — restore `.active-circle` under a new name, one line, bare directory name, untracked, class L.
   - Pros: one read, O(1), no dependency on `bin/fusion-identity`, and no ambiguity is representable — a file holds one line. Two checkouts cannot interact, because the file never travels.
   - Cons: two writes for one fact. The pointer and the item's `**Status:**`/`**Claim:**` can disagree and nothing reconciles them, so a pointer at a `done` item and a claimed item with no pointer are both reachable states. Somebody has to write it, and with the phase machinery gone there is no agent whose act that is — claiming is an edit to the item file, and the pointer write is a second act to remember. It also gives fusion two different answers to "what is this checkout working on", one in `bin/fusion-paths` and one in `bin/fusion-rules`, resolved from two sources, in two helpers called from the same Setup step.
2. **The item's own `**Claim:**` field** — scan the item records for `**Status:** claimed` and a `**Claim:**` whose first field is this checkout's eight hex, and take that item's container.
   - Pros: one fact in one place. The act of claiming *is* the act of setting scope; there is no second write and no way for the two to disagree. The criterion already exists and is already relied on in `bin/fusion-rules`, so the two helpers can share one implementation instead of holding two answers. Under the container shape the item record lives inside its container, so a resolvable item is a resolvable container and the orphaned-pointer failure has no representation at all. It costs no new file, no new writer and no class L entry.
   - Cons: O(items) reads per call rather than O(1). Ambiguity becomes representable — one checkout can claim two items — and must be detected rather than resolved. And the resolver acquires a dependency on `bin/fusion-identity`, which has a failure mode outside the workbench that a pointer read does not.
3. **Both** — the pointer as an override over the claim.
   - Pros: none that either alone lacks.
   - Cons: it is option 1's disagreement plus option 2's scan, with a precedence rule on top. Two placement rules is how the definition scatters, which is the reason the Origin Rule's own text gives for refusing a second one.

## Constraints

- The answer must be resolvable in one call, from a shell script, with no session state.
- An empty `KEY=` may never be emitted: a key the resolver cannot value exits non-zero (`rules/fusion-workbench-conventions.md` `## Path Resolution` → Failure behaviour).
- "No item in scope" is a real answer and resolves to `shared/`. It is not an error, and work outside a unit of work is routine.
- `bin/fusion-rules` must not call `bin/fusion-paths`: that resolver derives a key set from a consumer prompt, and `fusion-rules` has no prompt of its own (`bin/fusion-rules` `resolve_topics`, the comment on the store literal).
- A project that is not a git work tree at all is supported. There `bin/fusion-identity` exits 4, no claim can ever be written, and the true answer is "no item in scope" rather than a degradation.

## Recommendation

Option 2, with the ambiguity refused rather than resolved.

The decisive argument is not cost, it is that option 1 stores one fact twice. Every failure this project has recorded against a second copy of a fact is the same shape: the declared key set that expanded empty and sent a reconciler's records to the workbench root, the `Status:` head field on decision records that drifted from its marker in 39 of 94 cases. A pointer beside a claim field is that shape again, and it arrives with no writer whose job it is to keep the two in step.

Three failure modes have to be answered explicitly, and the third is where the design is decided:

- **No claimed item.** No item in scope, `OUT_*` resolves into `shared/`, exit 0. The same clean answer an absent pointer gave.
- **Two claimed items.** Exit 3, both files named, no output. `bin/fusion-rules` takes the first by sort and is right to — a wrong topic costs a few optional manifest units. A resolver that took the first would silently write a plan into another item's container, which is the silent-wrong-place failure the exit-4 refusal already exists to prevent one step earlier.
- **A claim that does not resolve.** Three distinct sub-cases, and they do not take one answer. (a) The container is missing: unreachable, because the item record lives inside its container, so finding the item is finding the container. (b) `bin/fusion-identity` exits 3 or 5 inside a git work tree — the checkout half is unreadable, so no equality can be evaluated and the answer is unknown: exit 3, never `shared/`. (c) `bin/fusion-identity` exits 4, not a git work tree — no claim can exist, so "no item in scope" is true rather than degraded: exit 0, `shared/`. The helper's own exit table already splits 3/5 from 4, which is what makes this decidable instead of a guess.

What option 2 gives up is stated rather than softened: the resolver can now fail for a reason outside the workbench, which a pointer read could not. That is the strongest argument for option 1 and it does not carry the decision, because the failure is loud, named, and has a defined exit code, while option 1's failure is a silent disagreement between two files.

---
Answered: 260910-2145_*_restore-the-per-work-item-container.md `## Decidability` and step S2 — option 2, the item's own `**Claim:**` field and no pointer file. A pointer stores one fact twice with nothing reconciling the two, and no surviving agent owns writing it, where claiming an item already is the act; `bin/fusion-rules` reads the field today, so a pointer beside it would answer "what is this checkout working on" twice, out of two sources, in two helpers called in the same Setup step. The criterion is implemented once, in `bin/fusion-claimed-item`, which both callers use. Two claims naming this checkout are refused with exit 3 and both files named, never resolved by picking one. Ruled by user, Kai Stalmann <ks@qantr.com>, in approving the plan.
