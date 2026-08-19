# The reach gate is blind to a copy written only in the retired domain names, and `REACH.holes` does not say so

---

**Severity:** Medium
**Domain:** code
**Filed by:** `coderev`, review of `5d29b6d..518926d`, review file `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/reviews/260815-1501-coderev-turn-3-conceptrev-investigator-domain-values.md`
**Owner:** `coder`
**Affects:** `hooks/lib/domain-cascade.ts:1013` (`DOMAIN_LITERAL_RE`), `hooks/lib/domain-cascade.ts:1104` (`REACH.holes`), and the rendered paragraph in `README-hooks.md:207-232`
**Cross-references:** `shared/issues/260810-1918_*` (the `skills/cleanup/SKILL.md` second copy the reach gate was built for); the three `260810-2110` records (the bare-word hole measured against the shipped build); `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/history/260815-1440-coder-step9-domain-values.md`

---

Step 9 kept the retired **inputs** recognisable to the reach detector and did not do the symmetric thing for the retired **domain names**. The result is a shape of stale copy the gate cannot see, and it is not in the list of holes that file mandates for exactly this case.

---

## What the step did, and why the asymmetry is visible

`hooks/lib/domain-cascade.ts` introduced two constants when `strategic` and `knowledge` left:

```
export const RETIRED_DOMAINS     = ["strategic", "knowledge"] as const;
export const RETIRED_COUNT_NAMES = ["commits", "analyses_count", "issues_count", "decisions_count"] as const;
```

Its own header states the job of the second one (`hooks/lib/domain-cascade.ts:96-104`):

> `RETIRED_COUNT_NAMES` — the grammar no longer accepts these as inputs, but `inputsNamedIn` still recognises them, because the plainest second copy anyone will meet from here on is a STALE one restating the four-outcome cascade. Dropping them would make exactly that copy invisible to the reach gate.

`inputsNamedIn` does exactly that (`hooks/lib/domain-cascade.ts:1046-1053`). `domainLiteralsIn` does not: `DOMAIN_LITERAL_RE` is built from `DOMAINS` alone, so a domain name is recognised only when it is `code` or `data`. `RETIRED_DOMAINS` is read by `parseCascade` and by nothing on the detection path.

A statement of the cascade is selected only when it names **two** domains and **two** inputs (`findCascadeStatements`, `hooks/lib/domain-cascade.ts:833-853`). A stale copy naming only the two retired outcomes therefore reaches `domains.size < 2` and is dropped before its inputs are even read.

## Measured at HEAD `518926d`, against the shipped build

```js
findCascadeStatements(
  "Pick `strategic` when decisions_count >= issues_count, else `knowledge` when analyses_count > 0 and code_files == 0."
)                                                                                  → []   MISSES

findCascadeStatements(
  "Use `strategic` if the open decisions outnumber the open issues, and `knowledge` if there are analyses but no source files."
)                                                                                  → []   MISSES

findCascadeStatements(CLEANUP_COPY)   // the four-outcome fixture kept from 260810-1918
                                      → 1 statement, domains ["data","code"]        FIRES
```

The third line is the good news and is worth recording as verified: the fixture kept from the earlier defect **does** still fire, and it fires on its two surviving domain names plus `decisions_count` / `analyses_count`, which is precisely the load `RETIRED_COUNT_NAMES` was kept to carry. The gate did not pass because its selector lost the names it matched on. The first two lines are the gap the same reasoning leaves open on the other axis.

## Why this is a defect rather than an accepted limitation

`REACH` exists so that the reach of this gate is data with probes rather than prose (`hooks/lib/domain-cascade.ts:1067-1090`):

> every line of the claim now carries probes, and `domain-cascade.test.ts` runs them: each `covered` probe must fire, each `holes` probe must NOT fire … Closing a hole without correcting this list turns the suite red.

`REACH.holes` names four shapes: bare words, tables and three-line wraps, a paraphrase naming no input, and a paraphrase using synonyms the prose list does not carry. A retired-domain-only statement is none of those. It is an uncovered shape with no entry, which is the state this block was written to make impossible — and it is the second time the claim has been broader than the gate (the header records the first two rounds).

The `covered` entry that comes closest is honest about its own scope — *"A stale copy restating the retired **four-outcome** cascade"* — and a four-outcome restatement does name the surviving two. The gap is the copy that restates only the half that went.

## Fix directions — two, and they are not equivalent

1. **Widen the detector.** Build `DOMAIN_LITERAL_RE` from `[...DOMAINS, ...RETIRED_DOMAINS]`. `RETIRED_DOMAINS` is already exported and already sits next to `RETIRED_COUNT_NAMES`, so this is the same move the inputs got. Two things must be checked before it lands, not assumed: `cascadeBlocks()` and `extractCascadeBlock()` derive their "assigns every domain" test from `DOMAINS` and must keep deriving it from `DOMAINS` alone, or the definition site stops parsing; and the cost must be **measured** over `REACH.fileSet` the way the bare-word hole's cost was, then written into a `covered` entry with its probes.
2. **Record it as a hole.** Add a `REACH.holes` entry with the two probes above and the reason. This is the smaller change and it is honest, but it leaves the likelier-with-time copy — a paragraph written before 2026-08-15 and never re-read — invisible.

Direction 1 is the one the file's own reasoning for `RETIRED_COUNT_NAMES` argues for. Either way `describeReach()` renders into `README-hooks.md` and the byte comparison will force that file to move with it.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). Neither fix direction landed.**

`hooks/lib/domain-cascade.ts:722-724` — `DOMAIN_LITERAL_RE` is still built from `DOMAINS` alone. `RETIRED_DOMAINS` still feeds only `parseCascade` (`:451`) and never the detector, so a cascade copy written purely in `strategic`/`knowledge` is invisible to the reach gate. And `REACH.holes` (`:946-982`) still carries its four entries — bare words, table-and-wrapped-lines, paraphrase naming no input, synonym inputs — with no entry for a retired-domain-only copy.

The second half is the one that costs most and is cheapest to fix: a gate that enumerates its own blind spots and omits one is read as complete. One entry in `REACH.holes` discharges it even if the detector is left alone.
