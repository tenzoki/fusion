v11 is at version in the manifest and named on none of the three upgrade surfaces
---
`.claude-plugin/plugin.json` reads `11.0.0`. `docs/` holds no `upgrading-to-v11.md`, `README.md`'s newest upgrade paragraph is "Upgrading from v10.25?", and `skills/help/SKILL.md` `### 4. Update` carries v10.26, v10.25 and v10.24. The release that removed four agents, the Turn loop and the Circle tells an upgrading user nothing.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `CLAUDE.md` `## Release process` step 0 (the pre-tag obligation this misses)

**Measured at HEAD `1d6103c4`.**

```
$ cat .claude-plugin/plugin.json | grep version      ->  "version": "11.0.0",
$ ls docs/ | grep upgrading | sort -V | tail -1      ->  upgrading-to-v10-26.md
$ grep -c 'v11' README.md                            ->  the two hits are §Workbench prose, not an upgrade paragraph
```

`README.md:28` opens the upgrade block with **Upgrading from v10.25?** and describes v10.26.
`skills/help/SKILL.md` `### 4. Update` carries three paragraphs — "Coming from a v10.25 install",
"v10.24", "v10.23" — and its own standing line says the section holds the last three releases.

**Why this is a defect and not a nicety.** `CLAUDE.md` `## Release process` step 0 makes the help
advance a pre-tag step in its own words, citing
`260906-2014_*_the-help-topic-on-updates-has-missed-two-releases-and-names-none-of-the-last-three.md`
as the reason it exists. That step has not run for this release. And v11 is the first release since
v9 where the shipped text carries an action the user has to take: a workbench that was mid-work at
the upgrade needs `/fusion:migrate`, which nothing in the tree tells them. Every v10 note states
explicitly that nothing is rewritten and nothing is to be migrated; a user who reads the newest note
present concludes exactly that.

**Acceptance.** `docs/upgrading-to-v11.md` exists and names what a consuming project must do;
`README.md`'s upgrade block opens with a v11 paragraph; `skills/help/SKILL.md` `### 4. Update`
carries v11 and relabels the two below it, dropping the oldest. The pin example in `install.sh`'s
header and in `README.md:26` names `tags/v11.0.0` per the four-version-surface rule in
`CLAUDE.md` `## Release process`.

---
Resolved: All three upgrade surfaces name v11. `docs/upgrading-to-v11.md` is new and is the first note since v9 that does not open by saying nothing is rewritten: its check 1 is the migration, giving the `find fusion-workbench/circles -mindepth 2 -maxdepth 2 -name '_[at]_circle.md'` probe, the `/fusion:migrate` run, and what skipping it costs — the resolver matches nothing and every record a session files lands in the shared store instead of inside its item, silently and for the life of the project. Four further checks cover the five agent names that stop resolving, the `--only`/`--skip` selectors leaving `/fusion:cleanup` and the five commands its pipeline became, the two retired `fusion.json` leaves plus the `fusion-guard.json` instruction (stated as the reversal of the v10 note it contradicts), and the three unread workbench-root files with the renamed stopping heading. `README.md` gains a v11 paragraph above the v10.25 one and points at the note. `skills/help/SKILL.md` `### 4. Update` carries v11, v10.26 and v10.25, the v10.24 paragraph dropped; the standing line sending an older install to the docs folder is unchanged. The acceptance's fourth clause is met too: the `FUSION_REF=tags/v11.0.0` pin example is refreshed in `README.md` and in `install.sh`'s header. Two corrections to the dispatch, both measured against the tree: **two** skill directories left in this release (`next` and `direct`) and two arrived (`check` and `reconcile`), not three leaving — the three-count in `CLAUDE.md` spans a longer range and is finding E of the closing review; and a live plan carrying the old stopping heading **fails no gate in a consuming project** — `plan-stopping-section-lint.test.ts` runs only in fusion's own suite, so the real cost is that the orchestrator's closing gate silently skips the stop-condition question, which is what the note says. Byte cost on `skills/`: net zero, the surface still at 224 308 against a budget of 224 308, the help swap measured to land at exactly 0 margin. No baseline map, head-room constant or growth golden was touched. `reference-resolution-lint.test.ts` moved, as the dispatch anticipated: paths 1518 -> 1522, anchors and stampBare unmoved, attributed per file and per token in that file's own re-approval entry (+4 the new note, +1 `README.md`, -1 the help swap, 0 `install.sh`). Verification: `cd hooks && npm run build && npm test` — exit 0, 53 files, 915 tests.
