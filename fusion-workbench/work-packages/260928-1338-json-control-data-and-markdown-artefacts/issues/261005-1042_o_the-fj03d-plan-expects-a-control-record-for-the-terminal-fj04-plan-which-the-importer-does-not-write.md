The FJ03d plan expects a control record for the terminal FJ04 plan, which the importer does not write
---
Steps 11 and 15 of the FJ03d plan read back "the FJ04 plan pair (terminal, bound by the package)" through `bin/fusion-record show`. On the migrated copy that record does not exist, so the terminal half of the read-back cannot be done as written.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md, 261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md

Evidence, from the step 11 rehearsal at `fj03d` `29dac3c5`:

- `bin/fusion-record show` of the FJ04 plan's control file answers `ok:false`, `unresolved-reference/record-not-found`; only the Markdown file exists.
- `hooks/lib/legacy-import.ts` converts a terminal record only when a record-ref field of a converted record binds it. The package's active plan is now the FJ03d plan, so the FJ04 plan appears only among references. The survey counted `record-closure=0`: no terminal plan or spec of this workbench gets a pair.
- A terminal package does have a control file: `work-packages/260801-1244-curator/package.json` shows `status=done`, `outcome.class=legacy-completed`.

Acceptance: steps 11 and 15 name a terminal record that exists after migration (a terminal package's control file is the candidate the rehearsal read), or the user rules that Prior §8.3.7's "one terminal record" needs a terminal plan or decision pair and the importer's rule is revisited. The plan's wording is corrected either way.
