The reconciler's verdict vocabulary has no case for a Directive that is reachable but deliberately not reached

---
**Severity:** Medium — it is a gap in a case split, which `rules/critical-stance.md` §4 classes as a
defect of the same kind as a wrong result. Every Circle that closes short of its Directive by user
choice lands in it, and the reconciler has to improvise the verdict.
**Domain:** code
**Filed by:** reconciler, second Phase-3 pass of Circle `260816-1741-guard-becomes-observation-only`
**Affects:** `agents/reconciler.md` `### Step 2.5: Three-edge Coherence verdict` (the three-value
aggregate) and `## Rules`-adjacent `### Step 4` (the recommendation mapping table)
**Cross-references:**
- `circles/260816-1741-guard-becomes-observation-only/issues/260817-1505_*_the-curator-and-its-skill-still-say-a-projects-guard-configuration-can-deny-a-write.md` — the case that exposed it
- `circles/260816-1741-guard-becomes-observation-only/history/260816-1841-orchestrator-session.md` `## Coherence — second pass` — where the improvisation is recorded
- `shared/issues/260815-0752_*_no-agent-may-revise-an-active-circle-records-directive-so-a-revision-leaves-it-contradicting-the-spec.md` — the adjacent gap on the write side: even when "revise Directive" is chosen, no agent may perform it

---

## The three values and what falls between them

`agents/reconciler.md` defines the aggregate verdict as exactly three values:

- `coherent` — all three edges OK.
- `review-needed` — any edge flagged.
- `bounded-closure-proposed` — **"the Directive is judged definitively unreachable"**.

And it maps each to a Rebalance recommendation, `bounded-closure-proposed` → `accept Bounded
Closure`, `review-needed` with the Artifact↔Directive edge flagged → `revise Directive`.

A Circle whose Directive is **reachable and deliberately not reached** satisfies none of the three
cleanly:

- not `coherent`, because a clause of the Directive is visibly unmet in the shipped Artifact;
- not `bounded-closure-proposed` as defined, because nothing is unreachable — the residue is a
  small edit away and is filed;
- `review-needed` fits by elimination, but its recommendation mapping then points at `revise
  Directive`, while the honest closure is usually Bounded Closure (`_b_`), which the table
  reaches only from the verdict the definition rules out.

So the reconciler either states a recommendation its own table does not license, or states a
verdict whose definition is false. Both were live options in the pass that filed this.

## The case it was measured on

Circle `260816-1741-guard-becomes-observation-only` shipped v10.0.0 and v10.0.1. Every clause of
its Directive verifies at HEAD except one: "The shipped text that presents a blocking, halting
guard as a live property says what the guard now is, in code, in the agent prompts and skill
bodies, …". `agents/curator.md:212` and `skills/curate/SKILL.md:110` still say a write denied by
the project's guard configuration is a `failed` entry — an agent prompt and a skill body, both
named by that clause, both stating a mechanism that cannot fire at HEAD. The defect is filed as
`260817-1505` and was left open **by explicit user decision** against a shipped release.

Nothing here is unreachable and nothing is in doubt. The Directive was simply stopped short of, on
purpose, and the vocabulary has no word for that.

## Why it is not merely cosmetic

The verdict is what the orchestrator consumes to choose the closure marker: `coherent` → `_c_`,
Accept Bounded Closure → `_b_` (`rules/circle-records.md` `### Worked transitions`). A verdict
picked by elimination therefore decides a permanent marker on a permanent record. And the rule
that governs the picking is the reconciler's own: "The verdict is computed deterministically from
the edge flags, not from LLM-judgement-from-vibes." A case the flags do not separate is where that
determinism stops holding.

## Options

1. **Add a fourth value** — e.g. `directive-partially-met`, defined as *the Directive is reachable,
   at least one clause is unmet, and the shortfall is recorded* — mapping to `accept Bounded
   Closure` as its recommendation. Smallest change, and it makes the split disjoint and complete.
   Costs: a fourth value every consumer of the verdict has to read, including the orchestrator's
   Phase-3 branch and `rules/circle-records.md`.
2. **Widen `bounded-closure-proposed`** from "definitively unreachable" to "not reached in this
   Circle, whether unreachable or deliberately stopped short", keeping three values. Cheapest in
   surface area. Costs: the two situations differ in what the user should do next — one says the
   goal was wrong, the other says the work is unfinished and filed — and one word would then cover
   both.
3. **Make the recommendation independent of the verdict**, so `review-needed` may recommend
   `accept Bounded Closure` when the flagged shortfall is user-chosen. Keeps three values and
   loosens the table instead. Costs: the table's whole purpose is to reduce decision fatigue by
   being derivable; a case-by-case recommendation is the judgement it was written to replace.

## Recommendation

Option 1. The two situations are genuinely different questions for the user, and §4 of
`rules/critical-stance.md` asks for a cut that is disjoint and complete rather than one word
stretched over two cases. Option 2's saving is one enum value; its cost is the distinction that
matters most at the moment the marker is written.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `agents/reconciler.md:113-115` still enumerates three verdicts and `:172-176` still maps only those three. This pass hit an adjacent gap in the same vocabulary and filed it as `260817-1836_o_the-three-edge-verdict-has-no-case-for-a-session-that-stated-no-directive-and-two-of-its-three-edges-are-then-unevaluable.md`; the two are different causes and neither fix covers the other. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.
