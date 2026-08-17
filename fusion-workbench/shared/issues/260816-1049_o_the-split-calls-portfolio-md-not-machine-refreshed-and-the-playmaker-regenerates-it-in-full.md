The tracked-workbench split calls portfolio.md "not machine-refreshed" and the playmaker regenerates it in full on every run

---

`rules/fusion-workbench-conventions.md:76` — one of the five always-on rules, read by every agent on
every dispatch — gives the ground for putting `portfolio.md` in the **records** group:

```
`portfolio.md` (authored text, not machine-refreshed)
```

It is machine-refreshed. Three sources say so, one of them nine lines above in the same file:

| Source | What it says |
|---|---|
| `rules/fusion-workbench-conventions.md:49` | the layout tree — `portfolio.md   # playmaker output` |
| `agents/playmaker.md:151` | "Regenerate `$PORTFOLIO` in full on every run (overwrite)." |
| `fusion-workbench/portfolio.md:3` | the live file's header — `**Generated:** 260815-2116 (by playmaker session 260815-2116-playmaker-orchestrator-phase4)` |
| `fusion-workbench/portfolio.md:13` | "Every figure here was measured against disk on this run; nothing is carried forward from the previous portfolio." |

`agents/playmaker.md:232` even names the file as a race-condition surface for exactly this reason.

---

## Where the false clause came from, and why it is now the only clause

It was written in `65f7c3b` (2026-08-10) as a **joint** parenthetical for two files:

```
`orchestrator-events.jsonl` (append-only ...), `tasklist.md` and `portfolio.md` (authored text, not machine-refreshed).
```

That commit's own message states the ground for each of the two, and they are **different**:

> Three stay: orchestrator-events.jsonl is append-only across sessions and read cross-session by the
> monitor, cadence and the stash protocol; tasklist.md is written prose with reasoning and acceptance
> wording; **portfolio.md is regenerated whole but each version is a complete briefing**, and the
> arguable case was left tracked rather than guessed at.

So the parenthetical described `tasklist.md` and never described `portfolio.md`. The author knew
this and put the correct ground for `portfolio.md` in the commit message rather than in the rule.
`tasklist.md` was removed from fusion on 2026-08-15, and the parenthetical stayed attached to the one
file it was never true of.

## Why this is worth fixing rather than shrugging at

The classification is probably right and is **not** what this record disputes. `portfolio.md` has been
touched by 17 commits across its whole life, not one per Turn, so the diff-noise argument that puts
`orchestrator-live.md` in the live group does not carry here.

What is wrong is the **criterion text**. `:76` and `:77` are the sentences a consuming project reads
to decide its own `.gitignore` — that is the section's stated job, and `:85` sends the reader
straight from it to this repository's `.gitignore` as the worked example. A project applying the test
as written ("is it machine-refreshed? then it is live state") gets the wrong answer on the very entry
the test is attached to.

It has also survived three consecutive passes over these two bullets in four days — `0a514e6` wrote
the scope clause, `d83c1b4` rewrote it, `b18a8cf` rewrote it again — each certifying the section as
tiling the ten root entries with no remainder. Every pass read the **lists**; none read the
**parentheticals**. Neither lint gate can see it: there is no path for `reference-resolution-lint` to
resolve and no enumeration for `derivable-enumerations-lint` to match.

## Fix direction

Replace the parenthetical with the ground `65f7c3b` already supplies. One clause, roughly
byte-neutral:

```
`portfolio.md` (regenerated whole, but each version is a complete briefing)
```

That keeps the entry in the records group, states a claim that is true and checkable, and keeps the
group's own criterion ("whether a past version answers anything") applicable to it.

Two things to check while in there, both one line away:

- `:77`'s live bullet opens "each describe *now*" over a six-item list and then adds `monitor` in a
  trailing sentence. `monitor` does not describe *now*; it has its own reason. The tiling holds, but
  a reader counting the enumerated list gets six of seven.
- The `.gitignore` block this section points at has its own stale sentence — see
  `shared/issues/260816-1051_o_the-gitignore-block-still-calls-both-consequences-lifecycle-skill-consequences-and-one-lost-its-consumer.md`.
  One deliberate pass over both surfaces is worth more than a fifth single-sentence correction.

**Cost:** the always-on core stands at 8 870 bytes of head-room in its 12 000-byte budget
(`hooks/lib/__tests__/rules-emission-golden.test.ts`), so a byte-neutral rewrite needs only the golden
regeneration if the size moves at all.

**Found by:** coderev, reviewing `433e206..b18a8cf`
(`shared/reviews/260816-1049-coderev-tracked-workbench-split-and-kept-line.md`, F1).

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `rules/fusion-workbench-conventions.md:76` still calls `portfolio.md` authored text rather than machine-refreshed, while `agents/playmaker.md:8` regenerates it every run. The live file changed stamp from 260815-2116 to 260817-1643 between two reads, which is the regeneration. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.
