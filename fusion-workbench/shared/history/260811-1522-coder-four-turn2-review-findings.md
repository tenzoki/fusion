# Four Turn 2 review findings closed — three stale claims and one gate that narrowed with its classifier

**Agent:** coder
**Status:** Complete
**Domain:** code
**Git HEAD at start:** `41d8e2b`
**Verification:** `cd hooks && npm test` — exit 0, 1271 tests, 49 files
**Records closed:** `shared/issues/260811-1408`, `-1410`, `-1411`, `-1413` (all `_o_` → `_c_`)
**Record filed:** `shared/decisions/260811-1522_o_should-the-readme-hooks-lib-table-pin-its-prose-to-the-modules-it-describes.md`

---

## What this was

Four findings from the Turn 2 review, dispatched as one task. Three of them share a shape: a claim
was corrected in the file a previous dispatch named and left standing in the file next to it. The
fourth is a test-time gate that lost coverage as a side effect of a fix to the mechanism it
borrows from.

## The three stale claims

**`260811-1408` — the ontocoder prompt still claimed every `.toml`.** Commit `619dfb7` settled
`Cargo.toml` on the coder in `agents/coder.md` and `README-agents.md`; `agents/ontocoder.md` was
outside that task's file set and kept claiming the extension in three places, one of them the
frontmatter `description` a dispatcher reads to route. All three now state the rule the record
asked for — the file's role decides, not its extension — and cite `agents/orchestrator.md`
`## Agent Routing Table` as the authority rather than restating a list. The `**You may NOT edit:**`
entry that read "`package.json` scripts" went with them: a partial claim on a file the coder owns
whole.

The frontmatter was the risk the dispatch flagged, because an unquoted colon there makes the whole
block fail to parse and the agent load with empty metadata. Checked after the edit: a parse over
all 16 agent prompts returns `["name","description"]` for `ontocoder.md`, and `claude plugin
validate .` passes with the one pre-existing CLAUDE.md warning.

**`260811-1411` — the coder's scope sentence carved `.toml` out and left `.json` standing.** The
sentence excluded `.json` while the ownership list two lines above claimed `package.json` and the
same sentence cited `tsconfig.json` as precedent. Rewritten to state the rule rather than an
exception, taking its formulation from the orchestrator's routing table instead of inventing a
third one. `tsconfig.json` joined the ownership list, since the sentence had been citing it as
precedent for a rule the file itself did not apply. The frontmatter `description` carried the
identical asymmetry and was corrected with it.

**`260811-1413` — `README-hooks.md` still described the `commit-message` class as it was before the
store scoping.** Corrected from `hooks/lib/staging-drift.ts`, per the dispatch, not from the
record: the class is a commit-message-shaped **name** that no artifact store owns. The row now also
carries why the scoping *is* the class, so a future editor cannot drop the clause as noise.

## The gate that narrowed with its classifier

`260811-1410`. `commit-message-path.test.ts` reached the `COMMIT_MESSAGE` pattern through
`classify()` — the right instinct, since transcribing it would have put two spellings of one
concept in the tree — but the two callers ask different questions of the same string:

```
                     COMMIT_MESSAGE  (one pattern)
                            |
          +-----------------+------------------+
          |                                    |
   classify()                        commit-message-path.test.ts
   "is this file on disk             "does a shipped prompt PRESCRIBE
    a leftover message?"              one inside the workbench?"
          |                                    |
   location first:                     no location test:
   a path a store owns                 a prescription may point
   is a `record`                       anywhere, stores included
```

Since `337c01b` the left branch answers by location first, and the gate inherited that. A prompt
naming `fusion-workbench/shared/consult/commit-message.txt` was classified `record` and passed
silently.

**What was chosen.** `lib/staging-drift.ts` now exports the shared sub-question as
`hasCommitMessageName(rel)` — the pattern applied to the basename, no location test — and
`classify()` calls it for its own last branch. The gate reaches that predicate. One pattern, two
scopings, neither transcribed.

**What the alternative would have cost.** Giving the gate its own regex is the cheaper edit and it
was rejected. A later change to the pattern would land in one spelling and leave the other matching
the old one, with no test able to notice, because the two would agree about every string anyone
thought to write a fixture for. That is the defect family this file's own docstring says it avoided
by reaching through `classify()` in the first place; re-introducing it to fix a symptom of that
reach would have been the workaround, not the fix.

**What the widening costs, measured.** A prompt citing a workbench record whose topic slug says
"commit message" is flagged again. Across `agents/*.md` and `skills/*/SKILL.md` there are exactly
two such lines today, both carrying a defect word, so the `finds none` assertion passes unchanged.
The load shifts onto that line-level keyword exemption, whose breadth is already filed as
`260811-1149`; the positive control now asserts that dependency explicitly instead of leaving it
latent. `classify()` was deliberately not widened: a false positive there told the model to delete
three authored records, and a false positive in the gate costs a developer one exemption entry.

## Siblings — the instruction not to leave a fifth one

Grepped the corrected claims across `agents/`, `skills/`, `rules/`, `README*.md` and `hooks/`.

Fixed with the dispatch rather than filed:

- `agents/planner.md:32-33` and `:45` — the executor table gave `ontocoder` every `.toml` and
  `.json` unconditionally and omitted `Cargo.toml` from `coder`, while the tiebreaker below it
  already stated the role rule for `.json` alone. Same defect, same file.
- `README-agents.md` — both rows. The ontocoder row's exception clause ("except build manifests
  such as `Cargo.toml`") was replaced by one statement of the rule below the table, so neither row
  restates it and a new manifest needs no edit to either.
- `README-hooks.md:180` — the `hasCommitMessageName` export and the two questions it serves, since
  `260811-1410` closed in the same pass and added a second caller to a module the table describes.

Left alone, with reasons:

- `agents/orchestrator.md:346` — the coder row omits `Cargo.toml`. Already filed as `260811-1301`,
  which correctly calls it a gap rather than a contradiction (the tiebreaker below the table yields
  the right answer today). Not mine to close in this dispatch.
- `agents/bugfixer.md:20`, `agents/consultant.md:47`, `agents/orchestrator.md:223`,
  `agents/reconciler.md:61` — each names `.toml` in a list of what that agent may or may not edit.
  None of them adjudicates the coder/ontocoder split, so none contradicts the corrected rule.

Filed rather than fixed:

- `shared/decisions/260811-1522_o_…` — whether the `README-hooks.md` lib table should pin its prose
  to the modules it describes, the way `describeReach()` pins the domain-cascade paragraph. Raised
  by `260811-1413` and deliberately not decided here: it is a question about ~25 rows, and a
  generated block built for `staging-drift.ts` alone would leave the rest carrying the same risk
  while looking like coverage.

## One measured side effect

The pinned false-positive count in `hooks/lib/domain-cascade.ts` `REACH.holes[0].cost` moved
14 → 13, and the generated paragraph in `README-hooks.md` was regenerated to match. The coder scope
sentence contained the adjacent words "data files", which made it one of the honest-prose lines a
bare-word widening of the domain-cascade gate would falsely select; the new wording separates them.
`domain-cascade.test.ts` re-measures both numbers on every run, which is how the change announced
itself rather than drifting.

## Files changed

| File | Why |
|---|---|
| `agents/ontocoder.md` | `260811-1408` — three claims plus the build-files line |
| `agents/coder.md` | `260811-1411` — scope sentence, ownership list, frontmatter description |
| `agents/planner.md` | sibling of `1408`/`1411` — executor table and tiebreaker |
| `README-agents.md` | sibling — both rows plus one statement of the rule below the table |
| `README-hooks.md` | `260811-1413`, the `hasCommitMessageName` clause, the regenerated reach count |
| `hooks/lib/staging-drift.ts` | `260811-1410` — the `hasCommitMessageName` export, `classify()` calls it |
| `hooks/lib/__tests__/commit-message-path.test.ts` | `260811-1410` — the gate, its header, and both controls |
| `hooks/lib/domain-cascade.ts` | the re-measured hole cost |
| `hooks/dist/**` | rebuilt by `npm test` (the compiled hooks are committed) |

## Verification

`cd hooks && npm test` — exit 0. 1271 tests across 49 files, matching the count the dispatch named
as green at HEAD `41d8e2b`. The run failed once first, on the stale domain-cascade count above; the
number was corrected, the README block regenerated, and the suite re-run to green.
