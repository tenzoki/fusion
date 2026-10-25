
3. **Citation check:** a candidate referenced (by relative path or filename) from the citing corpus is excluded regardless of tier or state, and the report names the citing file. The corpus is the shipped text (`CLAUDE.md`, `README*.md`, `rules/`, `agents/`, `skills/`, `hooks/lib/`, `hooks/*.ts`, `bin/`, `docs/`) plus the project's own `CLAUDE.md`, `rules/` and `.claude/rules/`: every one of them is loaded into sessions or held by a lint, so its references must stay resolvable. A positive enumeration, each entry skipped when absent, so a consuming project collapses to `CLAUDE.md` and its own rules; an unresolved source root skips the check with a report line; `hooks/lib/__tests__/workbench-citation-lint.test.ts` names this filter as its twin (decision `260827-1756_*_which-citation-corpus-does-the-archive-safety-filter-protect.md`). For a work package the candidate is a whole container, so check the container's basename **and** the basename of every file inside it: the move takes the item's own plans, issues, decisions, reviews and analyses with it, and a check that read only the container's own name would let a cited plan leave the live tree unseen.

4. **Out of tier scope by construction.** The tiers below enumerate what they include; anything they do not name is unreachable from a tier. That covers investigations, consultations, memos and analyses in the shared store — they hold strategic deliverables, briefings and source artefacts, and they are archive-class only with the user's explicit natural-language ask.

   This is deliberately a positive enumeration rather than an exclusion list. An exclusion list has to be kept in step with every directory the layout gains, and goes silently out of date when it isn't. What a tier does not name, a tier cannot touch.

## Tier definitions

Each tier is **additive**: tier-2 includes tier-1, tier-3 includes tier-2. The default age threshold for "aged" buckets is 14 days; override with `tier-N <D>d` (e.g. `tier-3 21d`).

### Tier 1 — Terminal records and age in the shared store

**Age is a tier-1 basis for one bucket only, the message store.** A forum entry has one audience and one short lifetime by design, so an aged one is as finished as a terminal record, and the archive moves it rather than deleting it. The accepted cost, stated once: a checkout dormant longer than the threshold can lose an entry unread, which is what selecting by age buys.

| Target | Selection | Reason |
|---|---|---|
| issues, plans, decisions under `shared/` | `closed` issue or plan, `implemented` or `superseded` decision, by the codec's `list` (Step 3) | terminal record; its pair moves together |
| work packages | each package `done` or `dropped`, by the same `list` — **the whole container moves, not the record alone** | terminal work package — its narrative already says what landed, or why the job is no longer live. Moving the record alone would separate a unit of work from the plans, issues, decisions, reviews and analyses in the container with it |
