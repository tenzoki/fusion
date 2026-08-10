# The churn ranking has no noise filter, so the migration promotes dashboard files into Setup's top ten

---

`rankThrashing` excludes entries whose file is absent and nothing else. `TRACKER_NOISE_FILES`
(`hooks/tracker.ts:123-128`) names four workbench surfaces the tracker refuses to count as
churn, because they are rewritten continuously by design. The migration re-anchors legacy
keys into exactly those spellings, and the ranking then shows them — so the list the
orchestrator reads at Setup can name a file the tracker deliberately declines to measure.

---

## Evidence

`hooks/tracker.ts:123-128`:

```ts
const TRACKER_NOISE_FILES = [
  "fusion-workbench/orchestrator-live.md",
  "fusion-workbench/orchestrator-events.jsonl",
  "fusion-workbench/agentstate.yaml",
  "fusion-workbench/.guard-state/**",
];
```

`hooks/lib/churn.ts:529-561` — `rankThrashing` applies one filter, `exists(resolve(root, path))`,
and no other.

Measured against this repository's live `fusion-workbench/.guard-state/churn.json`
(592 entries), migrated in memory through the shipped `hooks/dist/lib/churn.js`:

```
migrated keys matching TRACKER_NOISE_FILES:
  fusion-workbench/orchestrator-live.md   score=15  total=47  session=0
  fusion-workbench/agentstate.yaml        score=2   total=6   session=0
```

`fusion-workbench/orchestrator-live.md` lands **10th** in the default `--limit 10` ranking,
so it occupies a slot in the exact output `agents/orchestrator.md` Setup Step 5 tells the
orchestrator to read and report.

## Why the migration is what surfaces them

Before `25c5454` these entries were spelled `orchestrator-live.md` and `agentstate.yaml`,
bare — written by sessions started in `fusion-workbench/`. In that spelling they matched no
noise pattern, which is the mechanism `hooks/tracker.ts:673-677` already documents. The
migration probes a relative key against the root and then against the workbench
(`reanchor`, `hooks/lib/churn.ts:293-306`) and correctly lifts them to
`fusion-workbench/…`. From that moment the write path skips them — but the entries already
in the map keep their accumulated score, and the read path has no reason to drop them.

So the fix that stopped the leak left the pool behind, and made it visible.

## Scope

`hooks/lib/churn.ts` (`rankThrashing`), read by `hooks/churn-rank.ts` and therefore by
`bin/fusion-churn-rank`. Affects every project whose churn map predates the anchor change,
which is every project that has ever run the guard. A fresh project is unaffected: the
write path never records a noise file under the new anchor.

## Recommendation

Apply `matchesAny(path, TRACKER_NOISE_FILES)` in `rankThrashing` as a second exclusion,
counted separately from `absent` so the reader can tell "deleted" from "not evidence".
That keeps the entries in the map, which decision `260810-0920` part (c) asks for, and
keeps them out of the ranking, which is the same treatment absent files already get.
Dropping them during the migration would also work but discards history the decision
chose to preserve, and it would not help a map migrated before the fix lands.

The constant would have to move out of `hooks/tracker.ts` or be imported from it; note
that `260809-2252` already has that list open for a separate reason.

## Cross-references

- `fusion-workbench/shared/issues/260809-2252_o_the-tracker-noise-list-still-says-it-excludes-two-metrics-when-only-churn-reads-it.md` — same constant, different defect
- `fusion-workbench/shared/decisions/260810-0920_i_what-should-a-churn-key-be-anchored-to-and-what-happens-to-the-535-entries-already-recorded.md`
- Filed by `coderev`, review `shared/reviews/260810-1632-coderev-turn-1-range-430d73a-to-head.md`
