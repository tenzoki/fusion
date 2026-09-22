# `ready=` is claimed to be optimistic by exactly one count, and an unresolvable entry inflates it too

---

Two shipped headers state the readiness figure's error term as a single number, the count of
items carrying no `**Depends-on:**` field. An item whose only entry is unresolvable for any
reason other than the target being terminal is also reported `ready`, and neither the headers nor
the mandatory `note=` line says so.

---

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Related:**
`260908-2018-prerequisites-confirmed-once-order-computed.md` (the item that built the helper);
`260908-2018_*_does-the-record-template-mandate-the-prerequisite-field-or-merely-permit-it.md` (the ruling the `note=` line carries out);
`260908-2018_*_is-a-closed-prerequisite-a-satisfied-edge-or-no-edge-and-what-is-an-archived-one.md` (the ruling that makes a terminal target no edge)

**Measurement anchor.** Every line number below was read in this work tree at commit `c2a12973`
on 2026-09-13.

## The defect

`hooks/lib/work-graph.ts:415` computes readiness from resolved out-edges alone:

```ts
readiness: out[i].length === 0 ? "ready" : "blocked",
```

`out[i]` holds only entries that resolved in the node map. An entry that did not resolve is
pushed to `unresolvedEdges` (`hooks/lib/work-graph.ts:313`) and contributes nothing to `out[i]`.

For a terminal target that is correct and is the G1 ruling. For every other unresolvable entry it
is not. `hooks/lib/work-graph.ts:295` states the resolution rule and names the cases itself: "An
entry is compared literally, so a name written in any other form than the basename the grammar
defines is reported rather than guessed at." A missing `.md`, a container name instead of a
record basename, a typo, or an archived target all produce an entry that names live unfinished
work and a row that reads `ready`.

Two claims are then wrong as written:

- `hooks/lib/work-graph.ts:72` — "`readiness` is optimistic by exactly that count". The word
  "exactly" is a precision claim, and the count named is `noDependsOnField` alone.
- `hooks/order.ts:32` — "`ready=` counts the items with no unmet prerequisite". In the dangle
  case the item has an unmet prerequisite and is counted.

The `note=` line (`hooks/order.ts:101`) carries the same single count. `unresolved-edges=` and the
`unresolved=` rows are printed, so the evidence is on the page; the `ready` word on the row and
the `ready=` figure in the block still make an affirmative statement that contradicts it.

This is the one claim in the module that `rules/critical-stance.md` section 3 reaches directly:
the figure is stated with a precision the computation does not have.

## Acceptance test

1. A fixture store holding one open item whose sole `**Depends-on:**` entry names a live open
   item by a form the grammar does not define (the container name with no `.md`): the helper's
   output does not describe that item as having no unmet prerequisite. Either its row carries a
   readiness value distinct from `ready`, or it is excluded from `ready=` and the exclusion is
   named in the output.
2. Whichever of those is chosen, `hooks/lib/work-graph.ts:72` and `hooks/order.ts:32` state the
   error term the implementation actually has. If the chosen fix is a second caveat rather than a
   third readiness value, the caveat fires whenever `unresolved-edges=` is above zero, in the same
   line kind the `note=` line uses.
3. The terminal-target case keeps reading `ready`, because the G1 ruling says it genuinely is.
   The fixture row for the item whose sole entry names a terminal target is unchanged.

## Scope

`hooks/lib/work-graph.ts`, `hooks/order.ts`, `bin/fusion-work-order` (its header repeats the
`ready=` definition at line 27), and `hooks/lib/__tests__/work-graph.test.ts` for the new case.

---
Resolved: the commit that carries this line takes the record's second reading, a caveat rather than a third readiness value, because the terminal-target case must keep reading `ready` under the G1 ruling and a third value would have to tell that dangle from a typo, which the literal lookup cannot: `caveat()` in `hooks/order.ts` now fires when `no-depends-on-field=` or `unresolved-edges=` is above zero and names each count that is (the note line carries the literal `unresolved-edges=<n>`), and the three headers (`hooks/lib/work-graph.ts` `## Two figures describe what the store does NOT say`, `hooks/order.ts`, `bin/fusion-work-order`) state the error term as up to those two counts, "exactly" gone; the two `README-hooks.md` rows that restated it follow. Verified over a scratch store holding one open item whose sole entry is a container name without `.md`: `ready=1` and a `note=` line naming `unresolved-edges=1`; the fixture row for the item whose sole entry names a terminal item is unchanged at `ready`.
