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
