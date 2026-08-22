# Analysis: cut ledger for the three bounded surfaces with a target

**Date:** 2026-08-22 12:26
**Type:** Gap
**Status:** Complete
**Requested by:** orchestrator, step 1 of `shared/planning/260822-1154_o_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md`

## The hook test suite does not clear 500 lines. Read this before anything else.

The plan named the hook test suite as the surface most likely to fall short. It falls short, and by
a wide margin.

**Measured yield from `restatement` and `superseded` rows: about 83 lines against a target of 500.**

| Route | Lines | Confidence |
|---|---|---|
| Restated paragraphs in `surface-growth-bound.test.ts` that `README-hooks.md` already authors | 36 | measured |
| One superseded paragraph in `helpers/guard-harness.ts` | 7 | measured |
| Factoring the four prompt-lint files onto one shared helper | about 40 | estimated, and the estimate is soft |
| **Total** | **about 83** | |

That is not enough to land the Circle's own step 7 either. Step 7 adds a test file of up to 200
lines to a surface holding 12 lines of head-room, so 190 lines have to be cut before that file can
exist at all. Eighty-three does not reach it.

**One route reaches the target, and it is a decision rather than a cut.** Lines 493 to 913 of
`hooks/lib/__tests__/reference-resolution-lint.test.ts` hold a chronological log of every approval
and re-approval of the `BASELINE` count pin: 26 entries between 2026-08-16 and 2026-08-22,
**421 lines**, ending three lines above `const BASELINE` at line 914. Trimming it to the pin's
rationale and the newest entry recovers about **418 lines**, which is the whole target on its own
and nothing else on this surface comes close.

Removing it is not a restatement cut. No other shipped file authors those attributions, and this
project has written down twice that a finding living only in a log is a defect. So the choice is
filed rather than taken, as
`shared/decisions/260822-1229_o_where-does-the-reference-resolution-pins-re-approval-attribution-log-live.md`,
with four options and no recommendation. Gate A is where it is answered.

**What follows from that.** With the log left alone, the hook test surface clears neither 500 nor
190, and the Circle's stopping clause for that surface cannot be met. Under the plan's own terms
that is a valid closure and it is reported here, early, as designed. With option 2 or option 4 of
that decision taken, the surface clears 500 comfortably and steps 2, 3, 4 and 7 all proceed.

## Question

For each of the three bounded surfaces the C0 plan sets a byte or line target on, which specific
text can be removed, what claim does each piece of text state, where is that claim authored if the
text is a restatement, and does the sum of the removable text reach the target? The plan's premise
is that it does. This report tests that premise per surface and reports the shortfall where there
is one.

## Scope

Measured at HEAD `370bfc5`, working tree clean of shipped files (the only modifications are
workbench records). Read in full: the plan and its spec; `hooks/lib/__tests__/helpers/growth-bound.ts`;
`hooks/lib/__tests__/surface-growth-bound.test.ts`; `hooks/lib/__tests__/rules-emission-golden.test.ts`;
`README-hooks.md` `### Growth bounds on the shipped text`; the four duplication records the plan
names; every file under `agents/`, `skills/*/SKILL.md`, `rules/` and `hooks/lib/__tests__/` at least
by measurement, and the candidate regions of each by reading.

Out of scope: `docs/`, `bin/`, the READMEs and `CLAUDE.md`, none of which is bounded. No file was
changed.

## Findings

### The four bounds, re-measured

Identical to the plan's table, so nothing moved between planning and this step.

| Surface | Floor | Head-room | Budget | Now | Remaining |
|---|---|---|---|---|---|
| Always-on rule core | 86 573 | 12 000 | 98 573 | 95 064 | 3 509 bytes |
| `agents/*.md` | 399 843 | 18 000 | 417 843 | 416 205 | 1 638 bytes |
| `skills/*/SKILL.md` | 220 439 | 20 000 | 240 439 | 240 409 | 30 bytes |
| Hook test suite | 17 875 | 2 500 | 20 375 | 20 363 | 12 lines |

Command: a Node script summing each baseline map out of
`hooks/lib/__tests__/surface-growth-bound.test.ts` over the files each surface's own `files()`
reader collects, byte sizes by `statSync` and line counts by newline count over
`readdirSync(root, {recursive: true})` filtered to `.ts`. The always-on core is
`wc -c` over the five files `bin/fusion-rules` emits unconditionally: 3 455 + 57 114 + 4 495 +
20 142 + 9 858 = 95 064.

### Running totals against the targets

| Surface | Target | Genuine removal, measured | Shortfall | Clears? |
|---|---|---|---|---|
| Hook test suite | 500 lines | about 83 lines | about 417 lines | **no**, unless the attribution-log decision is taken |
| `agents/*.md` | 10 362 bytes | 6 665 bytes | 3 697 bytes | **no**, unless one relocation row is accepted |
| `skills/*/SKILL.md` | 4 300 bytes | 4 290 bytes | 10 bytes | **effectively yes**, and comfortably so if Gate B takes option 2 |

"Genuine removal" counts only text that is deleted outright and whose claim is already authored in a
file the reader either already holds or can open by the citation left behind. It excludes bootstrap
duplication, and it excludes relocation, which is treated separately below because the two are not
the same kind of saving.

### Relocation is not removal, and the ledger keeps them apart

Several large duplications on `agents/*.md` can be discharged only by moving the shared text into a
new rule file emitted to the same agents. That buys the bound and buys a single authoring home,
which is real. It does not reduce what any agent loads: the reviewer that used to read the contract
in its own prompt now reads it in a rule file at Setup, byte for byte. The `agents/` bound exists
because "every byte is context an agent loads in full on every dispatch"
(`hooks/lib/__tests__/surface-growth-bound.test.ts`, the `cost` field of the agents surface), so a
row that satisfies the bound without reducing context is worth having for maintenance and is worth
naming honestly for what it is.

Rows below are marked **deletion** or **relocation**. Only deletions are in the running total.

---

## Surface 1: the hook test suite, target 500 lines

### Ledger

| # | File and lines | Lines | Claim the text states | Where the claim is authored | Verdict | Kind |
|---|---|---|---|---|---|---|
| H1 | `surface-growth-bound.test.ts:39-46` | 8 | Four surfaces, four independent budgets, one instrument; growth in one cannot be paid for by shrinkage in another | `helpers/growth-bound.ts` header, second paragraph; `README-hooks.md` `### Growth bounds on the shipped text`, "The four budgets are independent" | `restatement` | deletion |
| H2 | `surface-growth-bound.test.ts:197-214` | 18 | What no bound covers: the `.mjs` scripts, `hooks/*.ts`, `bin/`, `docs/`, the READMEs; and that `RELEASE_CAP`/`DRIFT_CEILING` say nothing about these surfaces | `README-hooks.md` `### Growth bounds on the shipped text`, "What no bound covers" | `restatement` | deletion |
| H3 | `surface-growth-bound.test.ts:215-227` | 13 | How to regenerate the golden and that regenerating never clears a bound | `README-hooks.md` same section; and `GOLDEN_HEADER` at `surface-growth-bound.test.ts:437-451` in this same file | `restatement` | deletion |
| H4 | `helpers/guard-harness.ts:17-23` | 7 | The harness had a second reason until 2026-08-16 (the write guard's fusion-repository stand-down), and the requirement outlived it | `CLAUDE.md` opening section, which carries the stand-down's removal and the rule it established | `superseded` | deletion |
| H5 | `marker-format-lint.test.ts:85-96`, `path-literal-lint.test.ts:159-170`, `glob-nomatch-lint.test.ts:99-110`, `commit-message-path.test.ts:212-221` | about 40 net | Four private implementations of "every agent prompt plus each non-exempt skill body", plus repeated `Violation`, `report()` and injection-fixture shapes | nowhere yet; `helpers/citation-scan.ts` already exports `pluginRoot` and `markdownFilesUnder()`, and a `helpers/prompt-lint.ts` is the missing sibling | `restatement` | deletion |
| **H6** | `reference-resolution-lint.test.ts:493-910` | **418** | Twenty-five historical approvals and re-approvals of the `BASELINE` count pin, each naming what moved the number and why | **nowhere.** Recoverable from `git log -p` only | **decision required, filed** | deletion |

H1 through H3 net 36 rather than 39 because each cut leaves a one-line citation behind.

H5 is the one soft number in this ledger and it is soft in the pessimistic direction. Factoring four
copies of a twelve-line function into one saves 36 lines gross; the new helper's own imports and the
header comment this project's convention puts on a helper eat most of the rest. Forty is my estimate
and I did not build the helper to check it.

### What was examined and rejected

- **The guard-related tests, 2 903 lines.** `helpers/guard-harness.ts` (978), `hook-fail-open.test.ts`
  (621), `guard-project-config-integration.test.ts` (423), `guard-bash-integration.test.ts` (417),
  `guard-state-shape.test.ts` (251), `legacy-halt-clearing.test.ts` (213). The plan flags these as a
  concentration against a hook that has decided nothing since 2026-08-16. Every assertion in them has
  a live subject: the guard still writes one `guard_allow` per write-tool call and one
  `guard_advisory` per configuration problem, `hook-fail-open` covers the fail-open path that still
  runs, `guard-project-config-integration` covers the two retirement advisories `CLAUDE.md` documents
  as the v10 migration, and `legacy-halt-clearing` pins three properties `CLAUDE.md` states about a
  project still carrying a halt. Their comment mass is mechanism narrative, not restatement:
  `guard-state-shape.test.ts:21-40` explains why the seeded state file has changed three times, which
  no other file carries. **Verdict: `load-bearing`.** Yield: 7 lines (row H4).
- **Test text overlapping shipped non-test text.** Measured with 10-word shingles over the whole
  suite against `README*.md`, `CLAUDE.md`, `rules/*.md`, `hooks/*.ts`, `hooks/lib/*.ts` and `bin/`:
  **52 lines in five files**, and most of those lines are quoted assertion strings, which are the
  gate rather than commentary. This confirms the plan's "about ten duplicated comment lines" and is
  the reason this surface has no reserve.
- **Intra-suite duplication.** 1 389 lines are touched by 10-word runs that appear in a second test
  file. Almost all of it is repeated `withProject(...)` setup and repeated assertion shapes, which is
  test code doing its job rather than duplicated prose. Row H5 is the part of it that is a missing
  abstraction rather than incidental similarity.
- **The arming and absolution logs.** `surface-growth-bound.test.ts:63-196` (the head-room
  derivation, the 2026-08-15 arming, the 2026-08-17 cleanup re-baseline) and
  `rules-emission-golden.test.ts:267-459` (the `RULE_BASELINE` movement log ending in the 2026-08-14
  arming). Together about 320 lines. The plan forbids touching these and it is right to: they are the
  text `helpers/growth-bound.ts` `## Re-baselining` requires in order to survive the number moving.
  **Verdict: `load-bearing`.**

### Two costs this surface has to absorb that the ledger does not fund

- Step 3 and step 4 each need one attribution block above the re-approved
  `reference-resolution-lint` pin. Recent blocks in that file run three to twelve lines each.
- `shared/issues/260816-0133_*_…` prescribes a ten-line test, and the plan's step 4 names it as a
  `skills/` cut candidate. It is not one. See the filed issue below.

---

## Surface 2: `agents/*.md`, target 10 362 bytes

### Bootstrap duplication, named and excluded

The plan asks for this explicitly and it is larger than two sentences.

Every one of the fifteen prompts opens with the same two Setup steps. Step 1 locates the workbench,
carries the halt message and the `cd`, and names where the layout is defined. Step 2 runs
`bin/fusion-rules` and `bin/fusion-paths` under the agent's own name and points at
`rules/agent-setup.md` for what the output means. Measured as one shared 12-word shingle run, that
block is **about 661 bytes in each of the fifteen prompts, roughly 9 900 bytes in total**, and the
exact-sentence measurement attributes 9 395 bytes of it to five sentences alone.

**None of it is counted, and none of it should be cut.** `rules/agent-setup.md` is the file that
would otherwise author it, and an agent cannot read that file until it has already run
`bin/fusion-rules`. The rule says so in its own second sentence: "It is itself emitted by
`fusion-rules`, so by the time you read this you have already run it." An agent told to consult the
rule instead of carrying the commands would have nothing to consult.

**Two further cases of the same kind, also excluded.**

- The halt string in Setup step 1 (*"No fusion workbench found above `$(pwd)`. Run `/fusion:setup`
  at the project root first."*) is what the agent says when the bootstrap fails, so it has to be in
  the prompt for the same reason.
- `skills/setup/SKILL.md:12` and `skills/next/SKILL.md:13` carry a byte-identical 364-byte paragraph
  telling the reader that a citation of a shipped file resolves at `$FUSION_SRC`. A skill body
  becomes the user prompt and is loaded by nothing else, so the instruction that governs how to read
  the rest of the body cannot itself be behind a citation. Same class, excluded from the `skills/`
  total below.

There is a trimmable clause **inside** the bootstrap block that is not bootstrap: Setup step 2's
tail, "where each `OUT_*`/`SCAN_*` value points, and which voice profiles to load", summarises two
sections of `rules/agent-setup.md` that the same sentence is pointing at. Shortening it in all
fifteen prompts is worth roughly 1 600 bytes. It is named here and deliberately **not** counted,
because the plan says bootstrap duplication is not counted and the boundary between the sentence and
its tail is a judgement the gate should make rather than the ledger.

### Ledger: deletions

| # | Files and lines | Bytes | Claim the text states | Where the claim is authored | Verdict |
|---|---|---|---|---|---|
| A1 | The chat-profile parenthetical in the `Long-form prose vs short-form` block: `analyst.md:305`, `consultant.md:167`, `curator.md:354`, `editor.md:98`, `orchestrator.md:1344`, `planner.md:201`, `playmaker.md:264`, `shaper.md:271` | **2 422** | The chat profile's path, that the long-form writing profile does not apply to chat, and that structured artifacts follow the rule only | `rules/user-facing-output.md` `## Style anti-patterns apply to everything`, which states all three, and which every agent already loads | `restatement` |
| A2 | "It catches the recurring failure: dense technical prose with em-dash chains and unexpanded project codes…": `analyst.md:303`, `consultant.md:165`, `orchestrator.md:1342`, `planner.md:199`, `playmaker.md:262`, `shaper.md:269` | **888** | What the readability gate catches | `rules/user-facing-output.md` `## Self-review before sending`, cited in the preceding clause of the same sentence | `restatement` |
| A3 | "Do not emit effort estimates unsolicited. If the user explicitly asks for one, follow `rules/user-facing-output.md` `## Effort estimates`…": `bugfixer.md:166`, `coder.md:119`, `coderev.md:155`, `editor.md:102`, `ontocoder.md:142`, `ontorev.md:137`, `reconciler.md:198`, `taskplanner.md:194` | **1 176** | No unsolicited estimate; on request, one line, locked phrasing, at the end | `rules/user-facing-output.md` `## Effort estimates`, whose first bullet is the same prohibition in stronger form | `restatement` |
| A4 | The clause after the citation in the Output Style opener, all fifteen prompts (`analyst.md:303` through `taskplanner.md:192`) | **1 632** | Action-first ordering, plain-English vocabulary, no undefined jargon, trailing details and references blocks | `rules/user-facing-output.md`, which the same sentence cites and which every agent loads | `restatement` |
| A5 | "Long-form prose outputs subject to the stylometric profile loaded at Setup:" in the eight prompts carrying the block | **547** | That the long-form profile is the one loaded at Setup | `rules/agent-setup.md` `## Voice profiles` | `restatement` |
| | **Subtotal** | **6 665** | | | |

Every one of these five is a genuine deletion. The claim stays authored in an always-on rule the
agent has already read by the time it reaches its Output Style section, so the bytes leave the
dispatch rather than moving inside it.

**Measured shortfall against the 10 362 target: 3 697 bytes.**

### Ledger: relocations, which close the gap and are a different kind of saving

| # | Files | Bytes | Claim | Proposed home | Verdict | Cost |
|---|---|---|---|---|---|---|
| R1 | `coderev.md:67-135` and `ontorev.md:60-121`, the reviewer contract: the two mandated header fields, the worked before/after, the `bin/fusion-review-coverage` self-check, the final-review shape | **about 8 500** net of one pointer in each prompt | How a reviewer records what it opened and what it did not | a new `rules/review-contract.md` emitted to `coderev` and `ontorev` | `restatement` | needs `bin/fusion-rules` (a new emission arm), `rules-emission-golden.test.ts` `ROLES` (its role-coverage assertion is HARD), and `review-coverage-mandate.test.ts:70`, whose `REVIEWER_PROMPTS` pins the two fields in the prompts themselves. **All three are outside step 3's stated Files list.** |
| R2 | The `**Domain:**` parameter-parsing block in `playmaker.md:34-36`, `reconciler.md:41-43`, `taskplanner.md:36-38` | about 800 (two of three copies) | How to parse the dispatch parameter and what to do when it is absent | a shared rule, or `README-agents.md` `## Dispatch parameters` if agents could read it, which they cannot | `restatement` | `domain-cascade.test.ts` and `domain-cascade-order-lint.test.ts` both read these blocks |
| R3 | The sub-agent `AskUserQuestion` note in `analyst.md:45`, `bugfixer.md:42`, `curator.md:247`, `planner.md:72`, `shaper.md:132` | about 1 800 net | A dispatched sub-agent does not hold `AskUserQuestion` and returns the blocking question to its dispatcher | nowhere; would need a new rule | `restatement` | already the subject of `shared/issues/260820-1755_o_five-agent-prompts-tell-a-top-level-run-it-holds-askuserquestion-and-a-headless-one-does-not.md`, which should be settled first |

**R1 alone takes the surface to 15 165 bytes, clearing 10 362 with 4 803 to spare.** R2 and R3
together with the deletions reach 9 265 and still fall short.

So the honest statement for the gate is: **`agents/*.md` clears its target if and only if one
relocation row is accepted, and R1 is the only one large enough.** Accepting it means step 3's Files
list grows by three files and the reviewers' per-dispatch context does not fall.

### `agents/coder.md` and `agents/ontocoder.md`: duplication that must stay

`coder.md:71-88` and `ontocoder.md:90-109` carry about 3 900 bytes of near-identical text, the second
largest sibling overlap on the surface. It is not available.
`hooks/lib/__tests__/executor-verification-report-lint.test.ts:39` sets
`EXECUTORS = ["coder", "ontocoder"]` and asserts that each prompt carries exactly one
`### Report shape` section with the three locked `Verification:` forms. The gate exists precisely so
the contract cannot "drift into two divergent shapes across the two executors". Cutting either copy
turns the suite red, and cutting both into a rule file would require rewriting the gate to read a
different surface. **Verdict: `load-bearing`.**

While measuring it I found that the sentence justifying the duplication is false. Filed as an issue,
below.

### `agents/orchestrator.md`: the special case, treated as one

The file is **150 807 bytes, 36.2 per cent of the whole surface**, and carries **10 948** of the
surface's 16 362 bytes of growth. The arming note in `hooks/lib/__tests__/surface-growth-bound.test.ts`
is explicit: "Nothing here asks for that to be cut; the bound asks only that it stop growing at the
measured rate."

**What this ledger proposes for it: restatement rows only.** Rows A1, A2, A4 and A5 touch it for a
combined **632 bytes**. Nothing else in the file is a restatement of another shipped file. I read its
sections against `rules/circle-records.md` and `rules/fusion-workbench-conventions.md` and found the
opposite of duplication: `## Circle head fields` at line 251 states in its own words that the rule
file "defines them and owns their semantics" and then confines itself to when the fields are written,
which is the shape this whole Circle is trying to produce elsewhere.

**A deeper cut is available and I am naming it because the plan requires me to, not because I am
recommending it.** `## Setup`, lines 27 to 220, is **27 401 bytes** across 194 lines, and
`skills/setup/SKILL.md` inlines the same procedure. Replacing the section with a pointer to
`/fusion:setup` would clear the surface's target more than twice over out of one file.

**In my own words: the project has not asked for this, and I am not asking for it either.** What
would be given up is the reason the two copies exist. `CLAUDE.md` records the failure that produced
them: *"Orchestrator skipped Setup, dashboard never refreshed. 'MUST run Setup' in agent prompt was
overridden by task urgency. The fix is `/fusion:setup`."* The skill body exists because the prompt
instruction lost, and `skills/setup/SKILL.md:8` says so: "This skill inlines the full Setup procedure
so it cannot be skipped." Cutting the prompt's copy leaves an orchestrator dispatched outside the
skill with no Setup at all, which is the pre-fix state rather than a saving. The measured overlap
between the two copies is only 369 bytes of identical lines, so the prompt's section is not a stale
duplicate that drifted; it is a second telling that was deliberately kept.

A cut here would be a structural change to how the orchestrator is bootstrapped. It belongs in a
Circle that owns that question, with its own record, not in a row of a cut ledger.

---

## Surface 3: `skills/*/SKILL.md`, target 4 300 bytes

### Ledger: deletions

| # | Files and lines | Bytes | Claim the text states | Where the claim is authored | Verdict |
|---|---|---|---|---|---|
| S1 | The "Why the branch, and why it is a call" paragraph: `setup/SKILL.md:30` (787), `next/SKILL.md:31` (788), `cleanup/SKILL.md:29` (535), `help/SKILL.md:31` (548) | **2 298** net of a short pointer in each | Why `$FUSION_PLUGIN_ROOT` is the wrong root inside the plugin's own repository, the four-copies history, and why the `[ -x ]` guard is there | `bin/fusion-source-root`'s own header, lines 28-45, which carries the criterion, the history, and the decision citation. The paragraph itself says so: "owns the criterion; its own header states it in full and this file does not restate it", and then restates it | `restatement` |
| S2 | The Exit 3 and Exit 4 bullets after the `bin/fusion-paths` call: `cadence/SKILL.md` (315), `curate/SKILL.md` (328), `direct/SKILL.md` (328), `memo/SKILL.md` (315), `next/SKILL.md` (373), `setup/SKILL.md` (333) | **1 992** | What exit 3 and exit 4 mean and who fixes each | `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes, which each of the six bodies already cites in the sentence immediately above the bullets | `restatement` |
| | **Subtotal** | **4 290** | | | |

**Measured shortfall against the 4 300 target: 10 bytes.** That is a rounding distance rather than a
gap, and the reserve below covers it several times over.

One caveat on S2, stated because it is a real trade rather than a free cut. A skill body is the user
prompt and is never served by `bin/fusion-rules`, so a skill invoked in a session whose agent has not
loaded the conventions file would have to open the cited section to learn what exit 3 means. The
citation is already in the text and resolves, so nothing breaks; a read is added. The Exit 1 bullets
are **not** in this row: they carry the halt wording and the "do not bootstrap a workbench from here"
instruction, which is behaviour rather than reference.

### Reserve, measured but held back

| # | Files | Bytes | Note |
|---|---|---|---|
| S3 | "What the root does *not* cover" in `setup` (886), `next` (436), `cleanup` (531) | about 1 000 net | The general run-or-copy split is in the helper's header. Setup's Step 0e exception is setup-specific and stays. |
| S4 | The general half of "`UNRESOLVED` is not a path" in `setup` (1 050), `next` (770), `cleanup` (686), `help` (510) | about 900 net | The semantics are in `bin/fusion-source-root`'s exit-code table. The per-file half, naming which steps cite the root, stays. |

### Gate B changes the target, downward

`skills/help/SKILL.md:101-109` holds five "Coming from a vN install" paragraphs totalling
**3 147 bytes**, one per release since v9. Option 2 of
`shared/issues/260822-0946_*_the-v10-5-release-note-reaches-the-readme-and-not-fusion-help-because-the-skills-bound-has-30-bytes.md`
caps the section at the last N releases with one standing pointer at `docs/`. At N = 2 that removes
1 684 bytes and adds roughly 500 for the missing v10.5 paragraph plus about 180 for the standing
line, so **step 6 lands at about minus 1 004 bytes rather than plus 1 100**.

If Gate B takes option 2, the step-4 requirement falls from 4 300 to about **2 126** bytes, which S1
alone nearly covers and S1 plus S2 clears with 2 164 to spare.

### One of the plan's three named candidates yields nothing here

`shared/issues/260816-0133_*_…` (the three byte-identical bracket probes) explicitly forbids the cut
step 4 assumes: *"Do not try to factor the expression into a shared file… the pinned-duplication
shape is the right one here."* Its fix is a ten-line test. Discharging it yields **zero bytes** on
`skills/` and **costs about ten lines** on the hook test surface. Filed as an issue.

The domain-capture one-liner record (`260810-2110`) is worth about 300 bytes across two of its three
copies and its fix direction is a new `bin/` helper, which is a mechanism change outside step 4's
Files list. The `bin/fusion-source-root` block is row S1 and is the one of the three that pays.

---

## The always-on rule core, surveyed last

**Head-room: 3 509 bytes. No target, and this report proposes no cut.**

A cut is available. `rules/fusion-workbench-conventions.md` is 57 114 bytes, 60 per cent of the core,
and its header table already records five topics partitioned out of it by addressee, so the method
is established and could run again.

**What it would cost is why it should not run here.** Every byte in these five files is charged to
every dispatch of every one of the fifteen agents, which makes this the most expensive text in the
plugin and the room in it the most valuable. Spending it inside a Circle whose whole purpose is to
buy room elsewhere would be spending the same room twice.

There is one question in the core larger than any byte count, and it is an audience question rather
than a cut: `rules/decision-record-examples.md` is 4 495 bytes of worked examples of a marker
vocabulary `rules/fusion-workbench-conventions.md` already defines, and it is emitted unconditionally
to all fifteen agents. Whether every agent needs the worked examples is decided by the `ROLES` map in
`rules-emission-golden.test.ts`, whose role-coverage assertion is HARD and treats an audience change
as a decision that may not happen silently. It is named here so the gate knows it exists. It is not
proposed.

## Implications

1. **The Circle's premise holds on one surface of three.** `skills/*/SKILL.md` clears its target from
   restatement rows alone. `agents/*.md` needs one relocation row. The hook test suite needs a
   decision that is not a cut.
2. **The plan's two headline duplication figures are gross occurrence counts, not removable bytes.**
   Measured with my own splitter, the exact-sentence duplication is 25 749 bytes on `agents/` and
   6 788 on `skills/`. The `agents/` figure agrees with the plan's 24 685 within splitter noise; the
   `skills/` figure is 5 234 bytes below the plan's 12 022, which I could not reconcile and which
   matters because that number is the plan's evidence that the `skills/` target is reachable. Once
   bootstrap is excluded, one copy of each claim is kept, and a citation is left behind, the same
   exact-sentence measurement yields **10 631 bytes on `agents/` and 3 496 on `skills/` at zero
   citation cost**, and 6 131 and 2 116 at 60 bytes per citation site. Exact-sentence duplication
   alone therefore does **not** clear either target. Everything in the ledgers above that exceeds
   those figures came from reading, not from matching.
3. **The order the plan sets is right and the reason is now measurable.** Steps 3 and 4 will move the
   `reference-resolution-lint` pin and each owes an attribution block on the hook-test surface, which
   holds 12 lines. Cutting the hook tests first is not a preference.
4. **A cut Circle can produce a surface that passes its bound while nothing gets cheaper.** Row R1 is
   the example. The distinction is worth carrying into the closure note.

## Recommendations

1. **Take the ledger to Gate A with the hook-test finding first.** The user has one decision to make
   before anything else: `shared/decisions/260822-1229_o_where-does-the-reference-resolution-pins-re-approval-attribution-log-live.md`.
   Nothing on that surface moves without it.
2. **Ask at the same gate whether row R1 is in scope.** If yes, step 3's Files list has to name
   `bin/fusion-rules`, a new `rules/review-contract.md`, `rules-emission-golden.test.ts` and
   `review-coverage-mandate.test.ts`, and the step report has to say that reviewer context did not
   fall. If no, `agents/*.md` closes 3 697 bytes short and the Circle reports it.
3. **Bring Gate B forward, or at least decide it before step 4 sizes itself.** Option 2 turns step 6
   from a 1 100-byte cost into roughly a 1 000-byte saving and drops step 4's target by half.
4. **Route the three filed issues.** All three are plan-level or prompt-level corrections rather than
   code. `260822-1226` goes to `coder` or to a later Circle; `260822-1227` and `260822-1228` are for
   the orchestrator to apply to the plan before dispatching steps 4 and 8.
5. **Do not open the always-on rule core.** No target was set, the room is the most expensive in the
   plugin, and the one question worth asking there is an audience decision that needs its own record.

## Filed Issues

- `shared/issues/260822-1226_o_the-executor-report-contract-cites-bugfixer-as-its-author-and-bugfixer-defines-a-different-shape.md` — `coder.md:73` and `ontocoder.md:92` cite `agents/bugfixer.md` as the author of the four-field executor report; bugfixer defines a different, weaker shape and sits outside the gate that pins it.
- `shared/issues/260822-1227_o_plan-step-4-names-a-duplication-record-whose-own-fix-direction-forbids-the-cut-the-step-asks-for.md` — the bracket-probe record prescribes a test and forbids factoring, so it yields zero `skills/` bytes and costs hook-test lines.
- `shared/issues/260822-1228_o_plan-step-8-asks-for-a-closure-that-was-already-made-and-the-record-already-carries-the-note.md` — the record step 8 targets is already `_c_` and already carries the prescribed note.

## Filed Decisions

- `shared/decisions/260822-1229_o_where-does-the-reference-resolution-pins-re-approval-attribution-log-live.md` — four options, no recommendation, and the load-bearing question for the hook test surface.

## Sources

- `fusion-workbench/shared/planning/260822-1154_o_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md` (read in full)
- `hooks/lib/__tests__/helpers/growth-bound.ts` (the instrument and its `## Re-baselining` rule)
- `hooks/lib/__tests__/surface-growth-bound.test.ts:1-628` (three baseline maps, three head-room constants, the arming log, the `files()` readers)
- `hooks/lib/__tests__/rules-emission-golden.test.ts:17-459` (`RULE_BASELINE`, the movement log, the four assertion classes)
- `README-hooks.md` `### Growth bounds on the shipped text`
- `hooks/lib/__tests__/reference-resolution-lint.test.ts:483-914` (the pin, its rationale and the 26-entry attribution log)
- `hooks/lib/__tests__/executor-verification-report-lint.test.ts:1-60`, `review-coverage-mandate.test.ts:70`, `marker-format-lint.test.ts:85-96`, `path-literal-lint.test.ts:159-170`, `glob-nomatch-lint.test.ts:99-110`, `helpers/citation-scan.ts:816-825`, `helpers/guard-harness.ts:1-52`, `guard-state-shape.test.ts:1-82`
- `bin/fusion-source-root:1-45` (the header that authors row S1's claim)
- `rules/user-facing-output.md` `## Style anti-patterns apply to everything`, `## Effort estimates`, `## Self-review before sending`; `rules/agent-setup.md` `## Voice profiles`
- `agents/orchestrator.md:27-220`, `:251-305`, `:1342-1344`; all fifteen `agents/*.md`; all twelve `skills/*/SKILL.md`
- `shared/issues/260811-1734_o_reduce-the-surface-so-a-claim-cannot-go-stale-in-several-places-at-once.md`, `260810-2110_o_…`, `260816-0133_o_…`, `260822-0946_o_…`; `shared/decisions/260810-1635_a_…`, `260822-1154_o_does-the-hook-test-line-budget-cover-comment-prose.md`; `circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2204_c_a-growth-bound-lost-half-its-head-room-against-a-stated-stopping-criterion-and-the-finding-lives-only-in-a-history-log.md`
- `CLAUDE.md` (the stand-down history behind row H4; the Setup-skipped failure behind the orchestrator section)

### Measurement commands

- Surface totals and per-file deltas: a Node script parsing `AGENT_BASELINE`, `SKILL_BASELINE` and `TEST_LINE_BASELINE` out of `hooks/lib/__tests__/surface-growth-bound.test.ts` and applying each surface's own `files()` reader.
- Comment, blank and code lines per test file: a Node classifier over every `.ts` under `hooks/lib/__tests__/`, counting a line as comment when its trimmed form opens `//` or `/*` or lies inside an unterminated block. Totals 7 167 comment, 1 652 blank, 11 544 code, which reproduces the plan's figures.
- Exact-sentence duplication: sentences split on `[.!?:;]` followed by whitespace, whitespace normalised, markdown emphasis stripped, fenced blocks dropped, sentences of 70 or more characters kept, over `agents/*.md`, `skills/*/SKILL.md` and `rules/*.md`. 65 distinct sentences in more than one file.
- Near-duplication: 12-word shingles over `agents/`, `skills/`, `rules/`, `docs/`, `bin/`, the READMEs and `CLAUDE.md`, marking every token inside a shingle that also occurs in a different file. 48 333 bytes covered on `agents/`, 26 687 on `skills/`.
- Attribution log: `awk 'NR>=493 && NR<=913' hooks/lib/__tests__/reference-resolution-lint.test.ts | wc -l` gives 421. `git log --format='%h %ad %s' --date=short -L 914,914:hooks/lib/__tests__/reference-resolution-lint.test.ts` lists 26 commits, one per entry.
- Individual row bytes: a Node script extracting each named substring from each named file and differencing it against the proposed replacement.

## Open Questions

- [ ] Where does the `reference-resolution-lint` attribution log live? Filed as `shared/decisions/260822-1229_o_…`. Gate A decides; the hook test surface depends on it entirely.
- [ ] Is relocation row R1 in scope for step 3, given that it reaches three files the step does not name and does not reduce reviewer context? Not filed as a decision, because it is a scope question for Gate A rather than a standing choice for the project.
- [ ] Why does my exact-sentence measurement of `skills/*/SKILL.md` report 6 788 bytes where the plan reports 12 022? Both are floors and neither is load-bearing for the ledger, which was built by reading. The discrepancy is recorded rather than resolved.
- [ ] Row H5's 40 lines is the one estimate in the hook-test ledger. Building the helper is the only way to settle it, and that is step 2's work.
