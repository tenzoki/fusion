# Does `transition` keep walking the `claim` and `release` edges once `claim` and `release` are operations of their own?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260928-1550_*_plan-fj01-codec-port-bundle-wrapper-and-first-record-round-trip.md, 260928-1338-json-control-data-and-markdown-artefacts.md

---

## Question

`codec/contract/transitions.json` carries an `operation` column on the package edges: `open → claimed` is `claim`, `claimed → open` is `release`, and the spec's section 6 lists `claim` and `release` as operations beside `transition`. `codec/src/transitions.ts` `allowed()` matches an edge by `from` and `to` alone and ignores that column, so FJ01's `transition` walks both edges, and the recorded exchange `codec/fixtures/protocol-session/02-transition` (open to claimed, revision R1) relies on it; the Prior side has been told to replay exactly that. FJ02 lands `claim` and `release`. The question is whether `transition` then refuses the two edges, which changes the recorded pair and its revision and every replay the Prior side has built on it, or whether the `operation` column is documentation of the preferred op and `transition` stays the general edge walker.

## Options

1. **`transition` stays general; `claim` and `release` are conveniences over it** — the column names the op a caller should use, and `transition` with a claim payload is the same write.
   - Pros: no recorded fixture moves; one code path; the Prior adapter's replay stays valid.
   - Cons: two ways to express one act; a reader of the table may expect the column to be enforced.
2. **`transition` refuses an edge whose `operation` is not `transition`** — the column is enforced from FJ02 on.
   - Pros: one op per act, the table means what it says.
   - Cons: the FJ01 recording is regenerated, R1 moves, and the Prior side's replay is invalidated once; a `transition` that carries a claim is refused with a reason that has to point at `claim`.
3. **Enforce in FJ02 but keep the two edges open under a `via: transition` flag in the request** — explicit opt-in.
   - Pros: compatibility and enforcement.
   - Cons: a flag whose only purpose is to keep an old recording valid.

## Constraints

- Spec section 6: `claim`, `release`, `set-mode` are explicit domain operations; a claim is domain attribution, not a lease.
- The recorded pairs are what the Prior side replays; a change to them is announced in `REQUESTS.md` before it lands.

## Recommendation

Option 1. The table's column documents the op a caller should reach for, and `claim`/`release` in FJ02 validate the claim payload more strictly than a bare `transition` can (they know the checkout and the person they are asked to write), so they are the stricter front door over the same edge rather than the only door. If FJ02 finds a rule that only the dedicated ops can enforce, that is the moment to reopen this with a measured case.

---
Answered: Prior: docs/design/fusion-fj01-prior-response.md `## Claim/release decision for FJ02` (at Prior c512c4c) — option 1: transition stays the general edge walker, claim and release land in FJ02 as named operations over the same edges, and every check (authorizer, checkout and person binding, claim ownership, allowed edge, evidence, expected revision, operation-id binding) runs in one kernel for both entry points; the recorded protocol session stays valid; ruled by user, Kai Stalmann <ks@qantr.com>.
