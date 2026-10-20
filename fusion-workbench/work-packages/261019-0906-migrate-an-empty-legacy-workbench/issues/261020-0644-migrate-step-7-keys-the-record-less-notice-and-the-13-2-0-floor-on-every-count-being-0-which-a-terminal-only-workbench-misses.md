/fusion:migrate Step 7 keys the record-less notice and the 13.2.0 floor on "every count= is 0", which a workbench holding only terminal records misses
---
The zero-write plan (chunk 1 with `writes: []`) is cut whenever the proposal's `records` is empty. That happens when the four cut rows are 0, whatever `plain-terminal` and `empty-container` say. Step 7 tests all six `count=` lines instead, so a v12 workbench holding only closed issues or terminal decisions gets a zero-write migration with neither the "nothing is converted" notice nor the 13.2.0 floor.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Severity:** Medium. Scope: `skills/migrate/SKILL.md` `## Step 7 — Repair, then migrate to JSON control` (the question to migrate and the report) and `skills/help/SKILL.md` `### 4. Update` (the 13.2.0 paragraph). The codec and host behave correctly. The defect is the predicate in the shipped text.

**Evidence.**

- `hooks/lib/legacy-import.ts` `composeProposal`: `counts` holds the four cut rows plus `plain-terminal` (`plain.size - closure.size`) and `empty-container`. Neither of those two adds a record to `records`.
- `hooks/lib/__tests__/legacy-import.test.ts`, the case added at `7ab72901`: a tree whose only record is a closed issue composes to `records: []` with `plain-terminal: 1`.
- Measured in a scratch root (one `.fusion-setup`, one closed issue, the `readme-typo` one stamped 260805-1000, copied from `codec/fixtures/legacy-v12/workbench/`) with this checkout's `bin/fusion-migrate`. `survey` prints `count=plain-terminal 1` and the other five at 0. `run` prints `proposal=… 0 records` and `planned=… 1 chunks`, then `result=json-control`. `chunks/1.json` is `"writes": []`.
- `skills/migrate/SKILL.md` Step 7, the question to migrate: "When every `count=` is 0, say the workbench holds no record …", and "13.0.0 or later (13.2.0 when every `count=` was 0)". The report repeats the parenthesis.
- `codec/fixtures/prior/REQUESTS.md` `### The version boundary, measured`: the qualified bundle `fb170361…` refuses rollback (`conflict/plan-file-changed`) and the second-run no-op over any zero-write index. The trigger is the index, not the survey counts.

**Two related wording points in the same sentences.**

- The floor sentence says 13.2.0 is needed "before it writes again". The measurement shows an older checkout reads the activated workbench, and only the migration's rollback and its second-run no-op are refused. The sentence names the wrong act.
- The quoted question below the notice still opens "This workbench's records are ready to move …", and the help paragraph says "a v12 workbench that holds no record". A terminal-only workbench holds records. They stay plain, so neither text matches it.

**Fix direction.** Key both sentences on the four cut rows (`package-live`, `package-terminal`, `record-live`, `record-closure`) all being 0, or on the `0 records` that `run` prints on its `proposal=` line. Say what is converted ("no record is converted; terminal records stay as they are"), not "holds no record". Name the floor for what it guards: rolling the migration back and its no-op re-run.

**Acceptance test.** In a terminal-only legacy tree, Step 7's text gives the zero-write notice and the 13.2.0 floor. In a memo-only tree it still gives both. With one live record it gives neither. `cd hooks && npm test` is green, `surface-growth-bound.test.ts` included.

---
Resolved: `skills/migrate/SKILL.md` `## Step 7 — Repair, then migrate to JSON control` now keys the record-less notice and the 13.2.0 floor on the four cut rows (`package-live`, `package-terminal`, `record-live`, `record-closure`) all being 0 in the question to migrate, and on the `proposal=` line saying `0 records` in the report. `hooks/lib/legacy-import.ts` `composeProposal` adds one to exactly one of those four rows per proposed record, so the two observables agree. The notice now says no record is converted and terminal records stay as they are. The quoted question opens "This workbench is ready to move". The floor is 13.0.0 before the installation writes again, and 13.2.0 to roll back or re-run a migration that converts no record. `skills/help/SKILL.md` `### 4. Update`, the 13.2.0 paragraph, now reads "a v12 workbench with no record to convert". Measured in scratch roots with `bin/fusion-migrate`: a terminal-only tree (`plain-terminal 1`) and a memo-only tree both give the four rows at 0, `0 records` and chunk 1 with 0 writes. A tree with one live issue gives `record-live 1`, `1 records` and 2 writes. This narrative's Evidence line was also respelt: the fixture filename it spelled was a dangling literal-marker citation that failed `workbench-citation-lint.test.ts` and `citation-sweep.test.ts`, and it is now named in words.
