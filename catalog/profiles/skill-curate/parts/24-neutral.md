
Report, in this order:

1. **What changed** — the count applied, per surface.
2. **What did not, and why** — every `stale` and every `failed` entry by id and file, with the reason as the agent wrote it. A write that did not land is a **failed** entry carrying whatever reason it had, never an applied one. Do not summarise these away: a partial apply reported as a completion is the failure this whole shape exists to avoid.
