# fusion-workbench Conventions

**Provenance:** No motivating record recoverable; introduced in `git:b05b423`.

Shared conventions for all agents operating on `fusion-workbench/`, and for the rule files those agents load. This file is emitted by `bin/fusion-rules` to every agent at Setup step 2; nothing is auto-loaded. Single source of truth for the workbench layout, the origin rule, the operative half of path resolution, the issue/planning and decision marker vocabularies, marker globs, filename patterns, issue and decision filing, inline tracking, history logging, timestamps, and the project's two language declarations.

**This document is the definition** of everything it still states in full. Five topics that were once defined here now have their own authoring homes, each cited at the point where it left, and each emitted to the audience that actually applies it rather than to every agent:

| Topic | Authoring home | Emitted to |
|---|---|---|
| The resolver's name namespace, key table, and key-set derivation | `rules/workbench-path-resolution.md` | no agent: read when authoring a prompt or the resolver |
| Circle state markers, transitions, the record and portfolio templates | `rules/circle-records.md` | `orchestrator`, `playmaker`, `shaper` |
| Provenance headers on rule files | `rules/rule-file-provenance.md` | no agent: read when writing a rule file |
| The commit lock | `rules/commit-lock.md` | `orchestrator` |
| Which of a tracked workbench's root entries git holds | `rules/workbench-tracking.md` | no agent: read when writing a project's `.gitignore`, and cited by the archive step of `/fusion:cleanup` |

No agent prompt and no skill body may carry a competing or supplementary definition of where artifacts go: they resolve their paths at run time (see `## Path Resolution (Pfadauflösung)`) and cite whichever of these six files owns the rule.

**Store-directory path literals.** `hooks/lib/__tests__/path-literal-lint.test.ts` forbids one in any `agents/*.md` or `skills/*/SKILL.md` outside `/fusion:setup` and `/fusion:migrate`; every other consumer resolves through `bin/fusion-paths`. The gate reads neither `rules/` nor `bin/`, so the files that *define* the stores are outside its reach rather than exempted by it. They are enumerated there as `DEFINITION_SITES` all the same: an enumeration somebody has to edit is the difference between a fourth definition site being decided and one merely slipping past a gate that never looked.

## fusion-workbench Layout

A **Circle is a directory**, not a file. Everything a unit of work produces lives inside it. Everything with no Circle affiliation lives in `shared/`. Everything the hooks and the dashboard read stays at the workbench root.

```
fusion-workbench/
├── circles/
│   └── 260716-1847-workbench-umbau/   # one directory per unit of work
│       │                              # stable name: <YYMMDD-HHMM>-<directive-slug>, NO marker
│       ├── _t_circle.md              # the Circle record — carries the state marker
│       ├── planning/                  # spec and plan of THIS unit of work
│       ├── issues/
│       ├── decisions/
│       ├── history/
│       ├── reviews/                   # codereview + ontoreview, merged
│       └── analyses/
├── shared/                            # everything with no Circle affiliation
│   ├── planning/                      # specs and plans written with no Circle in scope
│   ├── issues/
│   ├── decisions/
│   ├── analyses/
│   ├── reviews/                       # codereview + ontoreview, merged
│   ├── investigations/                # always shared, and write-frozen — see below
│   ├── consult/                       # consultations are always shared — see below
│   ├── history/
│   ├── memos/                         # memos are always shared — see below
│   └── backlog/                       # ideas not yet units of work — always shared, see below
├── archive/                           # target of cleanup's archive step
├── stilwerk/                          # stylometric profiles
├── portfolio.md                       # playmaker output
├── monitor                            # dashboard binary, copied at setup
├── .active-circle                     # pointer to the active Circle directory
├── .fusion-setup                      # setup marker (JSON: timestamp + plugin version)
├── .asset-provenance                  # what setup copied, checksummed at the moment of copying
│
│   # ── Root-anchored. The hooks, the monitor and the bin/ helpers read these ──
│   # ── HERE, at fixed root-relative paths. Do not move them.               ──
├── agentstate.yaml                     # bin/monitor, hooks/lib/state-file.ts (for review-coverage and staging-drift)
├── orchestrator-live.md                # bin/monitor, hooks/lib/staging-drift.ts
├── orchestrator-events.jsonl           # bin/monitor, hooks/lib/staging-drift.ts
├── .guard-state/                       # bin/monitor, hooks/lib/events.ts, hooks/lib/guard-state-file.ts, hooks/lib/staging-drift.ts
├── .commit-lock/                       # bin/fusion-commit-lock, hooks/lib/staging-drift.ts (created and removed per commit)
└── .session-marker                     # bin/fusion-session-mark, hooks/lib/staging-drift.ts
```

**Two legacy stores are absent from this tree on purpose.** A workbench may carry `stashes/`, written by the Circle stash skills removed on 2026-08-15, and `.migration-v2-backup/`, left by the retired `/fusion:migrate-workbench-v2` (fusion v2.3–v2.5) as its rollback copy. Nothing shipped writes to either any more: a line in the tree above would read as a store the plugin still creates. Frozen content is not live content, so live-tree consumers keep it out. `skills/log-activity/SKILL.md:82`, `skills/archive/SKILL.md:102` and `agents/playmaker.md:61` exclude `stashes/` by path, all but the archive skill `.migration-v2-backup/` too. `/fusion:setup` **stopped needing** its exclusions rather than losing them: it bounds its probe to the two live trees (`skills/setup/SKILL.md:67`), leaving every frozen store outside by construction. Do not drop the three that remain: `skills/setup/SKILL.md:60` records the cost, a Setup that refuses permanently and routes to a migration with nothing to do.

**The root-anchored surfaces are not negotiable.** Each is bound to a fixed root-relative path by every consumer named beside it in the tree, and none of those consumers has a fallback path: relocating one into a Circle or into `shared/` breaks it silently. The column names a consumer that only *names* the path, in an exclusion or classification list, next to one that reads the file: what breaks on a move is the same dependency either way.

They are root-anchored because none of them belongs to a unit of work. `agentstate.yaml`, `orchestrator-live.md` and `orchestrator-events.jsonl` are session state, and a session may span Circles. `.guard-state/` counters are project-wide. `.commit-lock/` guards the project's git index, which no single Circle owns. `.session-marker` answers "is an orchestrator already running in this project", which is meaningless scoped to a Circle. This placement is what makes the guarantee "hooks behave unchanged across the layout" structural rather than promised.

The list is exhaustive as written, and it is a list rather than a count on purpose: a count goes stale on the next helper that needs project-wide state, and this one already had. When a `bin/` helper or a hook adds a root-anchored surface, it lands in this tree and in the record-or-live-state split in `rules/workbench-tracking.md`, both in the same commit: this document is the definition, and an incomplete tree invites exactly the reasoning-by-omission it exists to prevent.

### Which of them a tracked workbench tracks

Whether a consuming project tracks its workbench at all is that project's decision: fusion ships no `.gitignore` rule for it. Which of the root entries above a project that *does* track it should commit, which it should not, and what preserves the evidence in the ones it does not, are authored in `rules/workbench-tracking.md`, which `bin/fusion-rules` emits to **no agent**: its two readers are a human writing a project's `.gitignore` and the archive step of `/fusion:cleanup`.

**`shared/` mirrors the Circle's artifact kinds, plus four of its own.** Every kind a Circle can hold has a shared counterpart, because any of them can be produced with no Circle active and must still have a home. `investigations/`, `consult/`, `memos/` and `backlog/` exist only in `shared/`: an investigation studies a failure capture, a consultation answers a question, a memo records a note, and a backlog entry precedes every Directive by construction. None of the four is produced by executing a Directive, so none can originate in a Circle. `investigations/` is **write-frozen** since the `investigator` fold of 2026-08-15: the store and its reports stay, nothing writes there any more, and a failure analysis goes to `$OUT_ANALYSIS` like every other analysis.

**The review types collapse into one `reviews/`.** codereview and ontoreview differ by sender, not by kind. The sender is in the filename (`YYMMDD-HHMM-<sender>-<topic>.md`) and in the document header. Inside one Circle they do not earn a directory each.

`fusion-workbench/.active-circle` is a one-line pointer file containing the **directory name** of the active Circle (e.g. `260716-1847-workbench-umbau`): no marker, no `circles/` prefix, no `.md`. It is absent when no Circle is active. Because the directory name is stable across the Circle's whole lifecycle, the pointer no longer has to be re-pointed on every marker change. Its writer set is closed and enumerated here (decision `260806-0015_*_wem-gehoert-die-circle-aktivierung`). On the activation path there are three writers: the orchestrator **writes** it on `_a_→_t_` activation (after user confirmation of playmaker's proposal) and **deletes** it on `_t_→_c_/_b_/_s_/_d_` closure at Phase 4; `/fusion:next` writes it in its user-confirmed interactive-activation branch; `/fusion:setup` writes it in exactly one condition, the confirmed branch of its `MISSING-POINTER` gate, where this checkout holds a `_t_` record with no pointer and the user answered yes to activating that Circle here. Two lifecycle skills touch it outside activation, each in one bounded way: `/fusion:migrate` re-points it from the pre-v4 filename form to the directory name, and `/fusion:cleanup` clears it only when the active Circle's record already carries a terminal marker. No other party writes it; a new writer adds itself to this enumeration in the same commit. The pointer is the single source of truth for "active Circle": `agentstate.yaml` does NOT duplicate this field.

`fusion-workbench/.asset-provenance` records what `/fusion:setup` copied into the workbench: one line per asset in the shape `shasum -a 256` prints: the checksum taken at the moment of copying, then the asset's path relative to the workbench. It is the third input that makes "is this project's copy stale, or has the project adapted it" decidable, which the two files alone are not: one difference, two causes. `/fusion:setup` is its only writer and its only reader, and an asset with no line is one the record says nothing about rather than one it classifies.

The `fusion-workbench/` is anchored to the directory where setup was run: the working directory `pwd` reports, not necessarily the git toplevel. A subfolder may legitimately have its own independent workbench, separate from any workbench at a parent level; the plugin's hooks resolve `process.cwd()` directly and follow whichever directory is active.

Within a given working directory there is exactly **one** `fusion-workbench/`. Never create a nested duplicate inside it, and never split a Circle's artifacts across multiple workbenches in the same tree: they all live in the single workbench at the active `pwd`.

## Origin Rule (Herkunftsregel)

**An artifact belongs to the Circle whose Directive caused it to come into existence. With no active Circle, it goes to `shared/`. Cross-cutting relevance is expressed by citation, not by placement.**

The rule is origin, not durability. And that choice is load-bearing. An agent *knows* its own origin: it was dispatched under a Directive, or it was not. It would have to *guess* an artifact's future reach. A rule built on a fact is mechanically applicable by every agent without judgment; a rule built on a prognosis produces a different answer from every agent that applies it, and the placement decision drifts. So: file by where the work came from, and let citation carry the rest.

Worked examples:

- **Defect.** A coder implementing the active Circle's plan finds a broken test in the code this Circle is writing → `<circle>/issues/`. The same coder notices, in passing, an unrelated dangling reference in a module this Circle never touches → `shared/issues/`. The second defect did not arise from the Directive; it was found next to it.
- **Decision.** A shaper refining the active Circle's spec surfaces the choice "one Circle or two?" → `<circle>/decisions/`, because that question exists only because this Directive exists. A decision the user raises between Circles, with no Circle active: "which IdP do we standardise on?" → `shared/decisions/`. Note the consequence, accepted deliberately: a project-wide decision that *arose inside* a Circle stays in that Circle. It is not promoted. Later Circles cite it by path.
- **Analysis.** An analyst dispatched by the orchestrator to inform the active Circle's plan → `<circle>/analyses/`. An analyst the user invokes directly to study an external document, no Circle active → `shared/analyses/`.

Two corollaries follow:

1. **Unknown origin means `shared/`.** When an artifact's Circle affiliation was never recorded and cannot be reconstructed, it is by definition not attributable to a Directive. It belongs in `shared/`. This is what makes migration of a pre-container workbench a mechanical move rather than an act of interpretation.
2. **Reach is cited, never placed.** If a Circle's decision binds a later Circle, the later Circle references it by path in its `## Dependencies` or `**Cross-references:**` header. Do not copy it, do not move it, do not file a duplicate in `shared/`. One record, one location, many citations.

Should the rule prove too tight in practice, the answer is a promotion step (an explicit, recorded move from a Circle to `shared/`), not a second placement rule. Two placement rules is how the definition scatters again.

## Path Resolution (Pfadauflösung)

**`bin/fusion-paths <name>` is the single resolution point.** No agent and no skill hard-codes a store path. The prompt says "write your plan to `$OUT_PLAN`"; the resolver says what `$OUT_PLAN` is.

### The name namespace, the key table, and how a key set is derived

Three questions this section used to answer in full are now authored in
`rules/workbench-path-resolution.md`: which name a consumer passes (`<name>` is an agent OR
a skill, one flat namespace, every consumer asks under its own name), what each emitted key
means, and why the key set is derived from the prompt rather than declared. None of it is
needed to *use* the resolver: an agent's keys are the ones its own prompt already names,
and it reads their values off stdout. Read that file when you write or edit a consumer
prompt, or change `bin/fusion-paths` itself. `bin/fusion-rules` emits it to no agent.

### Where the call belongs

In **Setup step 2**, alongside `"$FUSION_PLUGIN_ROOT/bin/fusion-rules" <agent>`. That step is demonstrably executed by every agent on every run: it is the step that loads the rules the agent then obeys. A per-write call would be a new obligation with a new miss rate; a Setup-step call rides an obligation that already holds. Resolve once at Setup, use the values for the rest of the session. A skill resolves at its own first step, for the same reason.

**One second resolution is permitted, and only one.** A consumer that *creates* a Circle mid-run resolves once more immediately after creating it, passing the new directory as `<circle-dir>`, and holds those values for the rest of the run. The shaper's anticipated-circle mode is the case: the Circle does not exist when Setup runs, and every write after its creation belongs inside it. The exception is conditional on a fact rather than on judgement, namely *did this run create a Circle*, which is why it can be written down without widening into "re-resolve whenever it seems useful". The reason is recorded here beside the rule on purpose: without it, the next audit reads a consumer's two calls as drift and removes one. Binding decision: `shared/decisions/260812-1720_*_when-exactly-does-the-anticipated-circle-come-into-existence.md`.

**And what a consumer does with a key it cannot use: it stops and names that key.** An empty or unset value is never a default, a fallback, or an empty result: nothing is scanned through it, nothing written through it, and the run halts naming the key. This is the consumer-side end of the exit-4 rule under *Failure behaviour*, not a second rule beside it: the resolver refuses to emit `KEY=` for a reason that holds just as well one step later, where a held value is interpolated into a shell block, a glob or a path join and can go missing long after the resolver exited 0. An empty expansion is silent, so a consumer that does not check reports it as a finding.

`fusion-rules` still takes an **agent** name only. The two helpers stand side by side in the same step with different namespaces, and that is deliberate: `fusion-rules` maps an agent to rule-file patterns, which is an authored fact about an agent and has no meaning for a skill. Their symmetry is the interface (a required name argument, output on stdout, the shared `0/1/2` exit core), not the argument domain.

### Contract

Signature `fusion-paths <name> [<circle-dir>]`. Output: one `KEY=value` line per emitted key on stdout. Paths are workbench-relative except `WORKBENCH` itself, which is absolute. Multi-value keys are space-separated.

The optional `<circle-dir>` is the bare directory name of an **existing** Circle, and it makes that Circle the **Circle in scope**: it replaces the active Circle as the `OUT_*` base and as the Circle half of every `SCAN_*`, and changes nothing else. `.active-circle` is neither read for the substitution nor written, and the emitted `CIRCLE` key still names the *active* Circle, or is absent when none is active. A target Circle is in scope, not active.

#### Exit codes

| Code | Meaning | Shared with `bin/fusion-rules`? |
|---|---|---|
| 0 | Success | yes |
| 1 | Usage error, including a `<circle-dir>` that names no existing Circle directory, or no workbench found above `pwd` | yes |
| 2 | Unknown name: no such agent and no such skill | yes |
| 3 | `.active-circle` is corrupt or orphaned (a **workbench-state** fault) | code collides (see below) |
| 4 | Internal error: a prompt names a key the resolver cannot order or value, or one name is both an agent and a skill (a **fusion bug**) | no |

The `0/1/2` core is shared with `bin/fusion-rules`; 3 and 4 are this resolver's own. And 3 **collides**: `fusion-rules` also exits 3, for a malformed `rules/context-manifest.yaml`. Read exit 3 against the helper that returned it; interpreting a `fusion-rules` 3 by this table sends the user to fix an intact `.active-circle`.

**3 and 4 must never be merged.** They address different people. Exit 3 is the user's to fix: their pointer is stale, and the advice "fix `.active-circle` before continuing" is right. Exit 4 is not fixable from the workbench at all, and a caller that keys on the code would hand the user that same advice about a pointer that is perfectly fine. Distinguishing them only in the stderr text is not enough: prompts key on the code. A bad `<circle-dir>` takes 1 by the same question of whose fault it is: the argument came from the caller, so a consumer that meets it must report neither a broken pointer nor a fusion bug.

### Two invariants

1. **With no Circle in scope, every `OUT_*` points into `shared/`.** The **Circle in scope** is the `<circle-dir>` argument when one is given, and the active Circle otherwise. There is no error state and no refusal for "no Circle active": work happens outside Circles routinely, and it has a defined home. This is the Origin Rule's "unknown origin means `shared/`" expressed executably.
2. **Every `SCAN_*` always carries both stores** (the Circle in scope and the shared one), even when a Circle is active. An agent searching for open decisions must see the Circle's *and* the project's. With no Circle in scope, a `SCAN_*` collapses to the shared store alone.

   `SCAN_CONSULT` and `SCAN_BACKLOG` look like exceptions and are not. Their kinds exist only in `shared/` (a consultation cannot originate in a Circle, and a backlog entry precedes every Directive: see `## fusion-workbench Layout`), so "both stores" has nothing to range over and collapses to one. The invariant is not weakened for them; it is satisfied vacuously. The asymmetry is intentional, and it follows from the layout rather than sitting beside it.

   There is deliberately no `SCAN_MEMOS`. `memos/` is shared like the other two, but no agent reads it: a memo is written for the user, not for an agent. A key is emitted when a prompt reads the kind, not because the symmetry of the table would look better with it.

### Failure behaviour

A `.active-circle` pointing at a directory that does not exist is an error: message on stderr, exit 3, no silent fall back to `shared/`. A stale pointer means the workbench's state is inconsistent, and quietly writing to the wrong store is worse than stopping (`HYG-NO-SILENT-FAIL`).

A key the resolver cannot value exits 4 rather than emitting `KEY=`. An empty right-hand side would send an agent's writes to the workbench root: the same silent-wrong-place failure, arrived at from the other direction.

Callers must distinguish the two: **exit 3 is the user's to fix, exit 4 is ours.** A prompt that treats any non-zero exit as "your `.active-circle` is broken" is wrong on 4 and sends the user hunting a fault that is not theirs.

## Issues vs Decisions — when to use which

A **defect** belongs in `issues/`. A **decision** belongs in `decisions/`. The distinction:

| Defect | Decision |
|---|---|
| Something is wrong, broken, missing, or inconsistent. | A choice must be made between two or more options. |
| Resolves to a code/data fix that can be verified by reading a diff. | Resolves to a recorded answer (decision record) and, separately, to implementation that realises the answer. |
| Lifecycle: filed → fixed → closed. The fix and the closure are the same event. | Lifecycle: filed (open question) → answered (with pointer to where) → implemented (when the answer is realised in code/data) → optionally superseded later. The answer event and the implementation event are distinct. |
| Examples: "term mapping is missing for entity X"; "test failure in pkg/foo"; "manifest doesn't validate". | Examples: "which IdP for v1?"; "should we adopt approach X or Y?"; "what is the cut decision for the platform?". |

**Decision rule for borderline items:** if the resolution is "go fix it" → defect; if the resolution is "decide and record" → decision. When in doubt, file as an issue and reclassify in the next reconciliation pass: that round-trip is cheap, the misfile cost is low.

A **Circle** is a directory under `$OUT_CIRCLE`. Distinct from defect and choice point: a Circle is a unit of work bounded by a Directive + its Grounding + its Artifact (foundation V3 §2.1). When the resolution is "execute this Directive to closure," it's a Circle; when the resolution is "go fix it," it's an issue; when the resolution is "decide and record," it's a decision.

This three-way distinction is about **what kind of thing** an artifact is. It is orthogonal to the Origin Rule, which decides **where** it goes. A defect is an issue whether it lands in `$OUT_ISSUE` or in `shared/issues/`.

## Backlog entries

A **backlog entry** is an idea that is not yet a unit of work: worth considering, not yet worth planning. It has no Circle affiliation by construction, so it lives in `shared/backlog/` (`$OUT_BACKLOG`), one file per entry.

It carries the issues/planning marker vocabulary below, read for this kind as: `_o_` an idea worth considering, `_p_` recommended for promotion and not yet acted on, `_c_` no longer live, with the body citing the Circle it became or the reason it was dropped, `_d_` pushed out, with the body citing the target. `_c_` here is that vocabulary's second reading, "user decided to close", and not "the fix landed".

**Minimum content is a title and one paragraph** saying what the idea is and why it might matter. `**Domain:**`, `**Filed by:**` and `**Related:**` are optional; there is no Options, Constraints or Recommendation section. The cheapness is the design. When the cheapest structured surface on offer was a decision record, the user filed a 12 KB text file instead, and an entry more expensive to write than a note is an entry nobody writes.

Two bounds:

- **No agent files a backlog entry.** Filing is originating an idea; maintenance is reshaping ideas the store already holds. A defect an agent finds is an issue and a choice point is a decision record, exactly as before. The user files, by hand or through `/fusion:memo`; the playmaker maintains; nobody else writes here.
- **The backlog is not the work queue.** It holds ideas, not tasks. The work queue is not a file at all: `taskplanner` builds it from the records and returns it in its report, for that session only. Option 4 of the backlog decision asked whether `taskplanner` and the queue retire into the backlog; the persisted queue has since retired outright, and whether the agent should is still open.

**Maintenance is four operations and a ranking rename.** Splitting one entry's ideas across several files, merging several statements of one idea into one, closing an entry whose idea is no longer live, and deferring one to a named later moment: **four**, each performed only with a user confirmation the run holds for that operation. Renaming between `_o_` and `_p_` states the playmaker's own ranking of a live idea and is autonomous. None of the five adds an idea to the store, which is why the bound survives them: the text a merge writes consolidates statements already filed.

| Marker | Written by | Gate |
|---|---|---|
| `_o_` | the user, filing; the playmaker, on a split's new entries and when it drops a recommendation | filing is the user's alone; `_p_`→`_o_` is autonomous |
| `_p_` | the playmaker | autonomous: a ranking judgement, not a disposition |
| `_c_` | the playmaker, closing an entry or retiring a split's original; the shaper, promoting an `_o_` or `_p_` entry to a Circle | confirmed for the playmaker; for the shaper it is part of promotion |
| `_d_` | the playmaker | confirmed. Two transitions deliberately do not exist: `_d_`→`_p_`, because reviving reverses a disposition the user took and a reversal is not a ranking judgement (revival is `_d_`→`_o_`, by the user, by hand); and `_d_`→`_c_` by the shaper, because its promotion path renames `_o_` or `_p_` and nothing else (`agents/shaper.md:100`). |

Binding decisions: `shared/decisions/260812-0254_*_does-fusion-need-a-backlog-store-and-a-maintainer-that-anticipates-circles.md` (the store and its maintainer), `shared/decisions/260812-0254_*_where-do-a-circles-spec-and-plan-belong-when-the-circle-exists-before-them.md` (the Circle-first placement it feeds), `shared/decisions/260812-2043_*_who-writes-the-recommended-marker-on-a-backlog-entry.md` (the playmaker's maintenance mandate) and `circles/260813-0858-playmaker-maintains-backlog-store/decisions/260813-0858_*_does-a-non-interactive-playmaker-run-perform-the-confirm-gated-backlog-operations.md` (which of those writes need a confirmation, and on which dispatch path it can exist).

## Timestamps

Always obtain `YYMMDD-HHMM` from `date +%y%m%d-%H%M`. LLMs have no clock. Never guess or estimate the time.

## Project language

**The surface decides.** Not the length of the text, not who reads it, not which agent wrote it. Every piece of output falls into exactly one of four cases:

- Output the user reads in the terminal (gate prompts, `AskUserQuestion` text, status reports, chat replies) is written in the **chat language**.
- Output that persists as a file **for the project's own use** (specs and plans, defect and decision records, session histories, reviews, analyses, memos and the portfolio) is written in the **artifact language**.
- Output that persists as a file **for a reader outside the project** (a customer deliverable: the Markdown documents and branded decks `agents/editor.md` produces, and its translations of them) is written in the language **the dispatching task names**. There is no default and no fallback, and the editor **halts** when the task names none.
- Text on an exempt surface is **English**, whatever either declaration says: code and operator strings in every project, and whatever a project ships onward to readers of unknown language. The two groups are listed below.

**The two persisted cases are cut by who the file is for, and that keeps the split disjoint.** A deliverable is a file that persists, so under the earlier three-way split it fell into the artifact-language case by silence. And it fell there wrongly. The artifact language exists for the project's internal record-keeping; a deliverable's language follows its reader, and the two have no reason to agree. Every persisted file is now in exactly one of the two: written for the project, or written for someone outside it. Nothing else moved: the deliverable is the only output whose reader is outside the project, and every other persisted file stays where it always was.

**Why the source is the dispatch and not a third declaration.** A deliverable's language is not a per-project constant: the same consultancy writes for a German client one week and an English one the next, so any project-wide default is wrong a large share of the time. A default that is wrong in the common case is a defect that hides until someone forgets. And what it produces is a *finished* document in the wrong language, found by the customer rather than by a stop. So the obligation sits on the dispatch, per deliverable, and the failure is loud by design: `agents/editor.md` `## Deliverable language` halts and names what to pass. That loudness is the substance of the answer, not politeness around it (decision `260807-2131_*_which-language-governs-a-customer-deliverable.md`, option 3).

**A single-declaration project is unchanged in every other case, and is not exempt from this one.** Where chat and artifacts share one language, every case except the deliverable one collapses to today's behaviour. The deliverable case does not collapse with them: the project's declaration says nothing about a reader outside the project, so the dispatch still names the language, even there.

A project names its two languages in `CLAUDE.md`, on two lines:

```
**Language:** de
**Artifact language:** en
```

`**Language:**` declares the chat language, `**Artifact language:**` the artifact language. Valid values for both are `en` and `de`. A project whose chat and artifacts share one language declares only the first line.

**The fallback chain is one rule with no special cases.** `**Artifact language:**` absent, unreadable, or carrying anything other than `en` or `de` all mean the same thing: not declared. And then `**Language:**` governs both surfaces. `**Language:**` not declared, by the same three-way test, means `en`. Both fallbacks are silent: no chat warning, no history line. Missing, unreadable and invalid land in the same branch deliberately, so the case split stays disjoint and complete and the second declaration needs no error path of its own.

**The stylometric profiles under `./fusion-workbench/stilwerk/` follow from the boundary above rather than defining it.** Each family governs one of the first two surfaces, so each resolves from that surface's language:

- **`chat-voice-<lang>.yaml`**: the short-form chat profile, resolved from the **chat** language and applied by **every** agent to its short-form user-facing output (gate prompts, `AskUserQuestion` text, status reports, chat replies). See `rules/user-facing-output.md` `## Style anti-patterns apply to everything`.
- **`default-voice-<lang>.yaml`**: the long-form writing profile, resolved from the **artifact** language and applied by the long-form-prose agents to their narrative outputs (session summary bodies, consultant reports, analysis reports including failure timelines, playmaker briefings, prose sections of specs and plans).

The writing profile follows its surface's language, not the artifact declaration as such, so **a customer deliverable's prose takes the writing profile of the language the dispatch named**: `default-voice-de.yaml` for a German deliverable in a project whose artifact language is `en`, and the target language's profile on a translation. That is the deliverable case above applied to the profile family, not an exception to it: each family resolves from the language of the surface it governs, and for one surface that language comes from the dispatch.

`bin/fusion-rules` emits the chat profile path for every agent and the writing profile path only for long-form-prose agents. The two paths may name different languages; for a project whose chat and artifacts differ that is the intended configuration, not a fault to report or work around.

Each family keeps its own missing-variant fallback, and the fallback is **per family, not shared**: when the resolved language's variant is missing (e.g. the artifact language is `de` but no `default-voice-de.yaml` exists), `bin/fusion-rules` falls back to the `-en.yaml` variant of that same family. Standard output carries the resolved path alone, so the fallback names itself on standard error instead, giving the family, the requested variant and the resolved one. Whether an agent is obliged to record that event is open, and no surface states such an obligation today (`circles/260801-1244-curator/issues/260814-1332_*_the-voice-profile-fallback-is-performed-by-the-helper-so-the-agent-cannot-record-it.md`). If neither variant of a family exists, the agent emits nothing for that family and follows `rules/user-facing-output.md` alone: that rule always applies, regardless of profile presence.

**Exempt surfaces: English, whatever either line says.** Two groups, cut by who the text reaches. The first holds in every project; the second is a criterion a project evaluates against itself, not a list of paths.

**Universal.** Code and code comments; and hook and CLI operator strings: banners, configuration advisories, measurement notices, helper usage and error text. `hooks/session-start.ts` `## Why the message is English` is the worked case for the second: a hook fires before any agent has read `CLAUDE.md`, and localising one of fusion's operator strings while the rest stay English is the inconsistency, not the fix. The count that stood in that sentence is deliberately not restated: the set has shrunk three times since it was measured, so a number written into prose about it is stale before it is committed.

**Conditional: text a project ships to consumers of unknown language is English.** Those readers are not the project's own and no declaration it makes reaches them, so its declared languages cannot govern that text. A project that ships nothing onward has no surface in this group at all: its declarations govern its whole tree, its own `rules/` and its own `README.md` included. A project that does ship (a rule corpus, a plugin, a library) writes the shipped part in English and nothing else by this rule.

**Fusion's own repository holds both roles at once, and the criterion divides it rather than exempting it whole.** It is the source of the shipped rule text and at the same time a `de` project with its own workbench: the rule files, agent prompts, skill bodies, `README.md` and `docs/` it ships to consuming projects of every language are English, while its workbench artifacts reach nobody outside it and follow its declarations like any other project's. Universalising the first half (offering "these ship to consuming projects" as the reason a project that ships nothing must also write its own README in English) was the defect this replaced (`shared/decisions/260807-1515_*_wie-weit-reicht-die-projektsprache-in-den-regelkorpus.md`, third constraint).

**Persisted surfaces that carry no profile still follow the artifact language.** Dashboard lines (`orchestrator-live.md`), commit messages and monitor strings are exempt from *both* stylometric profiles (`rules/user-facing-output.md` `## Style anti-patterns apply to everything` keeps their terse, parseable shape), but exemption from a style profile is not exemption from the language rule. They persist as files, so they take the artifact language. This reading was **settled by user decision rather than derived**: the dashboard is the one surface where "persists as a file" and "direct user interaction" genuinely overlap, and the user chose the persisted reading, on the ground that commit messages are the same class of persisted-but-user-facing surface and fall on the persisted side of the boundary with it. It is not an oversight and is not to be reopened as one.

**Head labels follow the file that defines them, not the artifact they sit in.** A label defined in a shipped template (the plan head's `**Decidability:**` and a record's `**Domain:**`) is English in every project, because the template lives in an exempt file. The artifact *body* under those labels follows the artifact language. That is what makes `**Decidability:**` the plan-head label everywhere, with no per-language variant.

**Existing artifacts are not translated.** The boundary applies going forward, the same way the filename patterns do. A workbench holding older prose in another language is not evidence against the rule.

## Filename Patterns

Patterns attach to the **kind of artifact**, not to a directory. The same kind carries the same name shape whether it lands in a Circle or in `shared/`.

| Artifact kind | Written to | Pattern | State marker |
|---|---|---|---|
| Circle directory | `$OUT_CIRCLE/` | `YYMMDD-HHMM-<directive-slug>/` | no: the directory name is stable |
| Circle record | inside the Circle directory | `_S_circle.md` | yes (circles vocabulary) |
| Spec / plan | `$OUT_PLAN` | `YYMMDD-HHMM_S_<topic>.md` | yes (issues/planning vocabulary) |
| Defect | `$OUT_ISSUE` | `YYMMDD-HHMM_S_<topic>.md` | yes (issues/planning vocabulary) |
| Decision record | `$OUT_DECISION` | `YYMMDD-HHMM_S_<topic>.md` | yes (decisions vocabulary, richer set) |
| Session history | `$OUT_HISTORY` | `YYMMDD-HHMM-<topic>.md` | no |
| Review (code / onto) | `$OUT_REVIEW` | `YYMMDD-HHMM-<sender>-<topic>.md` | no |
| Analysis | `$OUT_ANALYSIS` | `YYMMDD-HHMM-<topic>.md` | no |
| Consultation | `$OUT_CONSULT` | `YYMMDD-HHMM-<topic>.md` | no |
| Memo | `$OUT_MEMO` | `memos-<username>.md` / `tasks-<username>.md` | no |
| Backlog entry | `$OUT_BACKLOG` | `YYMMDD-HHMM_S_<topic>.md` | yes (issues/planning vocabulary) |
| Cadence digest | `$OUT_MEMO` | `cadence-<username>.md` | no |
| Portfolio | `$PORTFOLIO` | fixed | — |

`<sender>` on a review file is `coderev` or `ontorev`. It is what distinguishes the two review kinds now that they share one `reviews/` directory: it is mandatory, and the document header repeats it. Older files may carry a third sender, `conceptrev`, retired with its agent on 2026-08-15.

The two kinds sharing `$OUT_MEMO` differ in write semantics: the memo and task files are **append** logs (`/fusion:memo` adds to them), while the cadence digest is **overwritten** on each `/fusion:cadence` run (it is a fresh snapshot of the work cadence, not a history of its own runs).

## State Markers — issues and planning

Defect files and spec/plan files carry a state marker: `YYMMDD-HHMM_S_<topic>.md`. This holds in a Circle and in `shared/` alike.

| Marker | Meaning |
|--------|---------|
| `_o_` | Open: initial state on creation |
| `_p_` | In progress: agent is actively working on it |
| `_c_` | Closed: resolved, or user decided to close. Stays `_c_` when a later commit or record reverses the reasoning in its `Resolved:` note; the body gains a `Revised by:` line instead (see `## Inline State Tracking`). |
| `_d_` | Deferred: user decided, or agent proposed and user confirmed |

**Rules:**
- Every new file starts as `_o_`.
- When an agent begins work: rename `_o_` → `_p_`.
- When work is done: rename `_p_` → `_c_`.
- When the user defers: rename to `_d_`.
- State change = `mv` (rename). Only the marker changes; `YYMMDD-HHMM` and `<topic>` stay the same.

History, review, analysis, investigation, consultation, memo, and cadence files do NOT carry state markers.

## State Markers — decisions

Decision records carry a richer state marker that distinguishes "the answer is recorded" from "the answer is realised in code/data".

| Marker | Meaning |
|--------|---------|
| `_o_` | Open: the question has been filed but not yet answered. Initial state on creation. |
| `_a_` | Answered: a recorded answer exists somewhere on disk (typically an analysis, a plan, a session history, or the decision record itself). The file body MUST cite the answer's location with `Answered: <path>:<line> — <one-line summary>`. Cite the path as it stands, whether that is inside a Circle or in `shared/`. The decision is not yet realised in code or data. `_a_` does not assert that realising it is still possible: when the subject was removed before anyone built against it, the body gains a `Retired:` line and the marker does not move. |
| `_i_` | Implemented. The answer has been realised: code or data on disk now reflects the decision. The file body MUST cite the implementation with `Implemented: <commit hash> or <path>:<line> — <one-line summary>`. This is the terminal state for decisions whose realisation is verifiable. `_i_` does not assert that the implementation still exists: when it is later removed and no decision overrode it, the body gains a `Retired:` line and the marker does not move, so the marker alone cannot tell a live implementation from a retired one. |
| `_d_` | Deferred: the user explicitly pushed the decision out (to v1.x, to a future workbench, etc.). The file body MUST cite the deferral target. |
| `_s_` | Superseded: a later decision has overridden this one. The file body MUST cite the superseding decision file: `Superseded by: <path> — <reason>`. |

**Worked transitions:**

1. **`_o_` → `_a_`**: Reconciler (or analyst) finds that an open decision has been answered in a deliverable. Append `Answered: circles/260501-1900-transform-shape/analyses/260501-1915-D04-detailed-architecture.md §4.3 — Shape C selected`. Rename `_o_` → `_a_`.
2. **`_a_` → `_i_`**: A coder/ontocoder commit lands that realises the decision. Append `Implemented: a3f7c2e — pkg/transform now uses Shape C dispatch`. Rename `_a_` → `_i_`.
3. **`_o_` → `_d_`**: User says "defer to v1.x". Append `Deferred: v1.x — pending pilot signal`. Rename `_o_` → `_d_`. (Skipping `_a_` is fine when the deferral itself is the answer.)
4. **`_a_` → `_s_`**: A new decision overrides the answered one. Append `Superseded by: <path>/YYMMDD-HHMM_a_new-decision.md — replaces Shape C with Shape D after expert veto`. Rename to `_s_`. The superseding record may live in another Circle or in `shared/`: cite it where it is; never copy it next to the superseded one.
5. **`_o_` → `_s_`** (rare): A new decision overrides an open one before it was even answered. Same procedure as above.

**`_i_` and `_s_` are terminal.** Do not rename them back to `_o_` or `_a_`. If an implemented decision needs revisiting, file a NEW decision, which may then supersede the `_i_` one: append `Superseded by:` and rename `_i_` → `_s_` (the one allowed terminal-to-terminal transition).

**Grounding-Stand vs Grounding-Historie:**

The marker vocabulary mirrors foundation_V3 §1.2's two-layer Grounding model:

- `_o_` (open) and `_a_` (answered, awaiting realisation) are **Grounding-Stand**: the current best-of-knowledge the project is working with.
- `_i_` (implemented), `_s_` (superseded), and `_d_` (deferred) are **Grounding-Historie**: preserved record of what was decided, including elements that have been replaced or postponed.

Each decision store holds both layers; the marker carries the layer information. Reconciliation passes that "list active Grounding" filter on `_o_` + `_a_`; passes that "show project history" include all five. A scan for active Grounding must cover every path in `$SCAN_DECISIONS`, not just the Circle's.

## Marker globs

The delimiter is an underscore, not brackets, and that choice is what keeps the marker cheap to read as a glob. `[` and `]` are shell-glob metacharacters: a marker written in bracket form inside a glob is silently a *character class* matching the single marker letter, so a glob of the shape `circles/*/…-circle.md` with a bracketed `t` resolves to `circles/*/t-circle.md`, matches the empty set, and under `bash` fails *silently*: the unmatched pattern expands to itself, the customary `[ -e "$f" ] || continue` guard drops it, and the count comes back `0` on a workbench full of Circles (`HYG-NO-SILENT-FAIL`). That trap was hit five times in a single session. The underscore is inert in both glob and regex: `_t_circle.md` matches literally, with no escaping and no character-class surprise.

Two forms are correct. Use them verbatim:

| Purpose | Form |
|---|---|
| Records in one state | `circles/*/_t_circle.md` |
| All records, marker read from the name | `circles/*/*_circle.md`, then `basename` → `sed -nE 's/^_([a-z])_.*/\1/p'` |

The second form is preferred wherever the task is counting or enumerating: it reads the marker as data rather than requiring one glob per state.

`find` needs no special handling: `find circles -name '_t_circle.md'` is correct as written. The underscore is not a metacharacter to `find`'s `-name` matcher any more than it is to the shell.

This applies to every marker in every vocabulary (`_o_`, `_a_`, `_t_`, `_c_`, `_i_`, `_p_`, `_b_`, `_s_`, `_d_`) anywhere a filename carrying one is matched by a glob, in any agent prompt or skill body.

**And a record that states something *about* a citation names file and line, or fences the verbatim form.** A pointer and a statement about one are the same characters, and no reader (human or gate) can tell them apart; `rules/circle-records.md` `### Citation form in the portfolio` says to star the first and leave the letter on the second, which leaves the second spelling an address that dies at its target's next transition. So do not spell it: name the citing line (`shared/issues/260812-1720_*_the-reference-resolution-lint-does-not-scan-the-workbench-where-citations-are-densest.md:24`) and let the reader open it. A fenced code block is the exception, for where the spelling itself is the datum (a verbatim transcript), and the citation gate exempts a fence for exactly that. Binding: `circles/260819-1645-four-constraints-on-deep-change/issues/260820-0530_*_twenty-six-citations-in-the-corpus-are-statements-rather-than-pointers-and-no-exemption-expresses-that.md`.

## Circle records

The Circle state vocabulary (`_a_` anticipated, `_t_` active, `_c_` closed-coherent, `_b_`
bounded, `_s_` superseded, `_d_` deferred), its worked transitions, the Circle record
template and the `portfolio.md` template are authored in `rules/circle-records.md`. The
marker sits on the record inside the Circle directory, never on the directory itself, so
every path into a Circle stays valid for its whole life.

`bin/fusion-rules` emits that file to `orchestrator`, `playmaker` and `shaper`: the three
agents that transition or rank a Circle. Those three were once exactly the agents whose
prompts named a Circle-scoped resolver key, and the key no longer picks them out:
`curator` names `$SCAN_CIRCLES` to read Circle records as evidence and moves no Circle.
The audience is authored in `bin/fusion-rules` rather than derived, and
`rules/circle-records.md` carries the reason. If you are not one of the three you work
inside a Circle without ever changing its state, and `## fusion-workbench Layout` above is
the part you need.

## Inline State Tracking

**Filename markers are not enough.** Content inside planning, issue, and decision files must also track progress, so that interruptions don't lose state.

### Planning files

- When you start a step: mark it `[IN PROGRESS]`:
  `3. [IN PROGRESS] **Step Title**`
- When you complete a step: mark it `[DONE]`:
  `1. [DONE] **Step Title**`
- When all steps are `[DONE]`: set `**Status:** Complete` in the header and rename the filename marker to `_c_`.

### Issue files

When an issue is resolved, append below the existing content:
```
---
Resolved: <brief description of what was done>
```
Then rename the filename marker to `_c_`.

When a later commit or record reverses the reasoning a closed issue's `Resolved:` note states, append:
```
---
Revised by: <commit hash, or path to the reversing record> — <one-line reason>
```
(**no rename**: the marker stays `_c_`.) The defect is still closed; only its stated reasoning moved. Leave the `Resolved:` note itself unedited: it records what was decided then, and rewriting it would erase the reversal instead of pointing at it. `Superseded by:` keeps its decision-record meaning and is never used on an issue file.

### Decision files

Decision files have their own resolution annotations matching the marker semantics: do NOT use `Resolved:` (that's for defect-issues only). Use one of:

```
---
Answered: <path>:<line> — <one-line summary>
```
(rename `_o_` → `_a_`)

```
---
Implemented: <commit hash> or <path>:<line> — <one-line summary>
```
(rename `_a_` → `_i_`, or `_o_` → `_i_` if the implementation skipped the recorded-answer step)

```
---
Deferred: <target — one-line reason>
```
(rename to `_d_`)

```
---
Superseded by: <path to new decision> — <reason>
```
(rename to `_s_`)

```
---
Retired: <plan, commit or gate that removed the subject> — <one-line reason>
```
(**no rename**: the marker stays where it stands.) For a decision whose subject was removed with
no later decision overriding it; `Superseded by:` stays reserved for that case. It covers `_i_` and
`_a_` alike, and the marker already says which case a reader is in: on `_i_` the citation names what
removed the **implementation**; on `_a_`, where there is none, it names what removed the thing the
answer would have been realised against, so the answer can no longer be realised. Nothing renames,
so no glob, filter or count changes behaviour. And the filename still reads as implemented or
answered, so a history pass has to open the body to learn otherwise.

### When to update

- After completing each plan step, not just at session end.
- After resolving an issue, before moving to the next task.
- After answering or implementing a decision, before moving to the next task.
- When a review confirms a plan step, issue, or decision is done — the reviewing agent marks it.
- When the user asks to close, defer, supersede, or reopen anything.

## Issue and Decision Filing — MANDATORY

**Every defect, problem, inconsistency, concern, or TODO discovered during work MUST be written as a separate defect file. Every open question, choice point, or design fork MUST be written as a separate decision record. No exceptions.**

This applies to:
- Defects found during implementation, analysis, or review → defect
- Inconsistencies in code, data, docs, or existing architecture → defect
- Tech debt, dead code, stale docs, dangling references → defect
- Open questions raised during shaping, planning, or analysis → decision
- Choices the user has deferred or has not yet made → decision
- Anything the user asks to track, note, or remember: choose kind per the issues-vs-decisions rule above

**Where it goes** is the Origin Rule's answer, resolved for you: defects to `$OUT_ISSUE`, decisions to `$OUT_DECISION`. Both point into the active Circle when there is one and into `shared/` when there is not. The one judgment left to you is the one the Origin Rule names: did this arise from the active Directive, or did you merely find it nearby? If the latter, file it in the shared store even while a Circle is active.

**Before writing, list what is already there.** One `ls` over the open (`_o_`) record names in the target store, plus `shared/` when a Circle is active. Names only, never bodies: a costlier check gets skipped. On a hit, append one line to that record: `Also seen: YYMMDD-HHMM by <agent> — <one clause>`. No second file, no marker moves. **In doubt, write the new record**: a duplicate costs one merge, an unfiled defect costs the defect. This step never ends with nothing written.

**NEVER put issues or decisions inside plan documents, review documents, analyses, code comments, chat output, history logs, or any other location.** Embedded items get lost. Each item is a separate file in its own store.

**Filename:** `YYMMDD-HHMM_o_<topic>.md` (always `_o_` on creation, for either kind).

**Issue file format:**
```
<issue title>
---
<short description>
---
<context>
```

**Decision file format**: see the Decision Record Template below.

Brief but precise: enough context to understand the item without the original conversation.

## Decision Record Template

File: `$OUT_DECISION/YYMMDD-HHMM_o_<topic>.md`

Body:

```markdown
# <one-line decision title — phrased as a question or choice point>

---
**Domain:** code | data
**Filed by:** <agent name or "user">
**Cross-references:** <paths to related defects, analyses, plans, or decision records — in this Circle, in another Circle, or in shared/. Cite where they are; never copy them here.>

---

## Question

<One paragraph: what is the choice point? Why must it be made now?>

## Options

1. **<Option A>** — <description>
   - Pros: ...
   - Cons: ...
2. **<Option B>** — ...
3. ... (2–4 options typical; more = the question needs decomposing first)

## Constraints

<Hard constraints that any answer must satisfy.>

## Recommendation

<If the filing agent has a recommendation, state it with reasoning. Otherwise omit.>

---
Answered: <set when status moves to _a_>
Implemented: <set when status moves to _i_>
Deferred: <set when status moves to _d_>
Superseded by: <set when status moves to _s_>
Retired: <set when the subject is removed; the marker stays _i_ or _a_>
```

**There is no `Status:` head field, and you do not write one.** It duplicated the marker and
drifted from it: 39 of 94 records carried a header naming a state their marker did not, a
ratio that held six days across three hand corrections. The marker on the filename is the
state and the only source. A record written before the removal still carries the field; leave
it exactly as it stands, including when you transition it: those drifted headers are the
evidence the removal was decided on. Binding decision:
`shared/decisions/260818-2212_*_should-the-decision-records-status-field-exist-at-all-now-that-the-circle-records-has-been-removed.md`.

## Rule-file provenance

Every file in a `rules/` directory opens with a `**Provenance:** <citation>` line in its
first ten lines, naming the record, Circle, or commit that caused it to exist. The three
legitimate citation forms, the placement rule, what
`hooks/lib/__tests__/provenance-header-lint.test.ts` checks and what it cannot, and who
carries the obligation are authored in `rules/rule-file-provenance.md`. Read it before you
create or edit any file under `rules/`. `bin/fusion-rules` emits it to no agent: the one
agent whose routine work includes writing normative rule text is the `curator`, and
`agents/curator.md` reaches this definition by citing it at Setup rather than by emission.

## History Logging

Every session writes a history entry to `$OUT_HISTORY/YYMMDD-HHMM-<topic>.md` describing what was done. Update the entry's status line to `Complete` as the final step of the session. If interrupted before this, completion state is lost.

The history log is the only durable record of a session. The in-memory task list does not persist. Always update history before finishing.

## Security

Never read or display `.secret` files. If secrets are needed, ask the user to provide them via environment variables.

## Commit lock

The commit-lock protocol (when it activates, mechanism, the `bin/fusion-commit-lock` subcommands, who acquires, tag conventions, failure modes) moved verbatim to `rules/commit-lock.md`, which `bin/fusion-rules` emits to `orchestrator` only.
