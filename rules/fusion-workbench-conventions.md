# fusion-workbench Conventions

**Provenance:** No motivating record recoverable; introduced in `git:b05b423`.

Shared conventions for all agents operating on `fusion-workbench/`, and for the rule files those agents load. This file is emitted by `bin/fusion-rules` to every agent at Setup step 2; nothing is auto-loaded. Single source of truth for the workbench layout, the Origin Rule, the operative half of path resolution, the work-package grammar, each record kind's states and the operations that move them, filename patterns, issue and decision filing, inline tracking, timestamps, and the project's two language declarations.

**This document is the definition** of everything it still states in full. Topics that were once defined here now have their own authoring homes, each cited at the point where it left, and each emitted to the audience that actually applies it rather than to every agent:

| Topic | Authoring home | Emitted to |
|---|---|---|
| The resolver's name namespace, key table, and key-set derivation | `rules/workbench-path-resolution.md` | no agent: read when authoring a prompt or the resolver |
| Provenance headers on rule files | `rules/rule-file-provenance.md` | no agent: read when writing a rule file |
| The commit lock | `rules/commit-lock.md` | `orchestrator` |
| Which of a tracked workbench's root entries git holds | `rules/workbench-tracking.md` | no agent: read when writing a project's `.gitignore`, and cited by `/fusion:archive` |
| The language cascade's reasoning and edge semantics | `rules/project-language.md` | `document-editor` (its deliverable-language halt lives there); the operative core stays in `## Project language` below |

No agent prompt and no skill body may carry a competing or supplementary definition of where artefacts go: they resolve their paths at run time (see `## Path Resolution (Pfadauflösung)`) and cite whichever of these files owns the rule.

**Store-directory path literals.** `hooks/lib/__tests__/path-literal-lint.test.ts` forbids one in any `agents/*.md` or `skills/*/SKILL.md` outside `/fusion:setup` and `/fusion:migrate`; every other consumer resolves through `bin/fusion-paths`. The lint reads neither `rules/` nor `bin/`, so the files that *define* the stores are outside its reach rather than exempted by it. They are enumerated there as `DEFINITION_SITES` all the same: an enumeration somebody has to edit is the difference between a fifth definition site being decided and one merely slipping past a lint that never looked.

## fusion-workbench Layout

**A work package keeps its own container; everything with no item to belong to lives under `shared/`.** The two hold the same artefact kinds, and `## Origin Rule` below says which of them an artefact goes to. Everything the hooks and the `bin/` helpers read stays at the workbench root.

```
fusion-workbench/
├── work-packages/                     # one directory per work package — see ## Work packages
│   └── <stamp>-<slug>/                # the container: the item's pair, plus what the item produced
│       ├── <stamp>-<slug>.md          # the narrative — the directory's own name
│       ├── package.json               # its control file
│       ├── plans/
│       ├── issues/
│       ├── decisions/
│       ├── discussions/
│       ├── reviews/
│       ├── analyses/
│       └── history/                   # write-frozen — see ## Session history
├── shared/                            # the same kinds, for work belonging to no item
│   ├── plans/                         # specs and plans
│   ├── issues/
│   ├── decisions/
│   ├── discussions/
│   ├── analyses/
│   ├── reviews/                       # codereview + ontoreview, merged
│   ├── investigations/                # write-frozen — see below
│   ├── history/                       # write-frozen — see ## Session history
│   ├── consultations/
│   ├── memos/
│   ├── forum/                         # messages left for another checkout
│   └── checkouts/                     # one entry per checkout — written by bin/fusion-checkout-name, nothing else
├── archive/                           # target of cleanup's archive step
├── stilwerk/                          # stylometric profiles
├── monitor                            # dashboard binary, copied at setup
├── .fusion-setup                      # setup marker (JSON: timestamp + plugin version)
├── .asset-provenance                  # what setup copied, checksummed at the moment of copying
├── .checkout-id                       # bin/fusion-identity (minted once), hooks/lib/staging-drift.ts
│
│   # ── Root-anchored. The hooks, the monitor and the bin/ helpers read these ──
│   # ── HERE, at fixed root-relative paths. Do not move them.               ──
├── workbench.json                      # the manifest: the codec, /fusion:setup (initialize), hooks/lib/staging-drift.ts
├── .json-state/                        # the codec's lock and journal, never travels: the codec, hooks/lib/staging-drift.ts
├── orchestrator-events.jsonl           # bin/monitor, bin/fusion-events (hooks/events-query.ts), hooks/lib/orchestrator-events.ts, bin/fusion-commit-lock, hooks/lib/staging-drift.ts
├── .guard-state/                       # bin/monitor, hooks/lib/events.ts, hooks/lib/guard-state-file.ts, hooks/lib/staging-drift.ts
├── .commit-lock/                       # bin/fusion-commit-lock, hooks/lib/staging-drift.ts (created and removed per commit)
├── .cadence-anchors                    # bin/fusion-cadence-anchor, hooks/lib/staging-drift.ts
├── .check-stamps                       # /fusion:check, /fusion:setup, hooks/lib/staging-drift.ts
└── .session-marker                     # bin/fusion-session-mark, hooks/lib/staging-drift.ts
```

**A controlled record is a pair, and the pair is one artefact**: its Markdown narrative and, beside it, a control file only the codec writes (`package.json` in a container, `<stem>.record.json` beside an issue, plan, discussion or decision, `<stem>[.<n>].evidence.json` beside a review report). Both halves move, archive and commit together, in one commit; `hooks/lib/staging-drift.ts` marks a split pair `pair-split`. A workbench without `workbench.json` is `legacy`, its control data Markdown, and the resolvers refuse it by name until `/fusion:migrate` has run.

**The container store is `work-packages/`**, renamed from `circles/` at v12: `260922-1114_*_does-the-container-store-take-the-name-work-packages-superseding-circles.md`.

**Three legacy stores are absent from this tree on purpose**, because nothing shipped writes them: `stashes/` (the stash skills removed on 2026-08-15), `.migration-v2-backup/` (the rollback copy of the retired `/fusion:migrate-workbench-v2`) and `shared/backlog/`, the store before containers, frozen since 2026-09-22 (`260922-0922_*_what-becomes-of-the-two-entries-in-the-unread-shared-backlog-store.md`). Frozen content is not live content: live-tree consumers keep it out, and `/fusion:migrate` renames nothing in it. `skills/cadence/SKILL.md` and `skills/archive/SKILL.md` exclude the first two by path, and the empty third excludes itself; `backlog` stays in the store-segment lists of `hooks/lib/staging-drift.ts` and `hooks/lib/citation-scan.ts`, so a citation of an archived entry still reads as store-prefixed rather than becoming invisible.

**The root-anchored surfaces are not negotiable.** Each is bound to a fixed root-relative path by every consumer named beside it in the tree, and none of those consumers has a fallback path: relocating one into `shared/` breaks it silently. The column names a consumer that only *names* the path, in an exclusion or classification list, next to one that reads the file: what breaks on a move is the same dependency either way.

They are root-anchored because none of them belongs to a unit of work. `workbench.json` names the whole workbench, and `.json-state/` holds the one write lock over it. `orchestrator-events.jsonl` is session state, and a session may span work packages. `.guard-state/` counters are project-wide. `.commit-lock/` guards the project's git index, which no single work package owns. `.session-marker` answers "is an orchestrator already running in this project", which is meaningless scoped to one item. This placement is what makes the guarantee "hooks behave unchanged across the layout" structural rather than promised.

The list is exhaustive, and a list rather than a count on purpose: a count goes stale on the next helper that needs project-wide state. A `bin/` helper or hook that adds a root-anchored surface adds it to this tree and to the record-or-live-state split in `rules/workbench-tracking.md` in the same commit: an incomplete tree invites exactly the reasoning-by-omission this definition exists to prevent.

### Which of them a tracked workbench tracks

Whether a consuming project tracks its workbench at all is that project's decision: fusion ships no `.gitignore` rule for it. Which of the root entries above a project that *does* track it should commit, which it should not, and what preserves the evidence in the ones it does not, are authored in `rules/workbench-tracking.md`.

**One kind, two candidate stores, and one decision between them.** A kind never has two stores inside one container, so all that is left to decide is container or `shared/`, and `## Origin Rule` decides it. What a citation carries is the record's basename and never its store, which is what lets a record be moved by an archive sweep without breaking a pointer to it (`## Filename Patterns`).

`checkouts/` holds one file per checkout, written by `bin/fusion-checkout-name` and by nothing else; that script's header is the authoritative documentation for the entry grammar, and this document does not restate it. `investigations/` is **write-frozen** since the `investigator` fold of 2026-08-15: the store and its reports stay, nothing writes there any more, and a failure analysis goes to `$OUT_ANALYSIS` like every other analysis.

**The review types collapse into one `reviews/`.** codereview and ontoreview differ by sender, not by kind. The sender is in the filename (`YYMMDD-HHMM-<sender>-<topic>.md`) and in the document header, so they do not earn a directory each.

`fusion-workbench/.checkout-id` holds eight lowercase hex characters naming **this checkout** and nothing else: `bin/fusion-identity` mints it on first read and never again, and it is what a work package's `claim.checkout_id` names, beside the person. It is class L in `rules/workbench-tracking.md`, which says why it never travels.

`fusion-workbench/.asset-provenance` records what `/fusion:setup` copied into the workbench: one line per asset in the shape `shasum -a 256` prints. The checksum is taken at the moment of copying, then comes the asset's path relative to the workbench. It is the third input that makes "is this project's copy stale, or has the project adapted it" decidable, which the two files alone are not: one difference, two causes. `/fusion:setup` is its only writer and its only reader, and an asset with no line is one the record says nothing about rather than one it classifies.

The `fusion-workbench/` is anchored to the directory where setup was run: the working directory `pwd` reports, not necessarily the git toplevel. A subfolder may legitimately have its own independent workbench, separate from any workbench at a parent level; the plugin's hooks resolve `process.cwd()` directly and follow whichever directory is active.

Within a given working directory there is exactly **one** `fusion-workbench/`. Never create a nested duplicate inside it, and never split one unit of work's artefacts across multiple workbenches in the same tree: they all live in the single workbench at the active `pwd`.

## Origin Rule (Herkunftsregel)

**An artefact belongs to the work package whose brief caused it to come into existence. With no item in scope, it goes to `shared/`. Cross-cutting relevance is expressed by citation, not by placement.**

The rule is origin, not durability, and that choice is load-bearing. An agent *knows* its own origin: it was dispatched under an item's brief, or it was not. It would have to *guess* an artefact's future reach. A rule built on a fact is mechanically applicable by every agent without judgment; a rule built on a prognosis produces a different answer from every agent that applies it, and the placement decision drifts. So: file by where the work came from, and let citation carry the rest.

Worked example. A code-implementer implementing the item in scope finds a broken test in the code that item is writing → the container's `issues/`. The same code-implementer notices in passing an unrelated dangling reference in a module the item never touches → `shared/issues/`. The second defect did not arise from the directive; it was found next to it. Note the consequence, accepted deliberately: a project-wide decision that *arose inside* an item stays in that item's container. It is not promoted, and later items cite it by basename.

Two corollaries follow:

1. **Unknown origin means `shared/`.** When an artefact's affiliation was never recorded and cannot be reconstructed, it is by definition not attributable to a brief, so it belongs in `shared/`. This is what makes migrating a workbench that never had containers a mechanical move rather than an act of interpretation.
2. **Reach is cited, never placed.** If one item's decision binds a later item, the later item references it by basename in its `**Cross-references:**` header. Do not copy it, do not move it, do not file a duplicate in `shared/`. One record, one location, many citations.

## Path Resolution (Pfadauflösung)

**`bin/fusion-paths <name>` is the single resolution point.** No agent and no skill hard-codes a store path. The prompt says "write your plan to `$OUT_PLAN`"; the resolver says what `$OUT_PLAN` is.

### The name namespace, the key table, and how a key set is derived

Three questions this section used to answer in full are now authored in
`rules/workbench-path-resolution.md`: which name a consumer passes (`<name>` is an agent OR
a skill, one flat namespace, every consumer asks under its own name), what each emitted key
means, and why the key set is derived from the prompt rather than declared. None of it is
needed to *use* the resolver: an agent's keys are the ones its own prompt already names,
and it reads their values off stdout.

### Where the call belongs

In **Setup step 2**, alongside `"$FUSION_PLUGIN_ROOT/bin/fusion-rules" <agent>`. That step is demonstrably executed by every agent on every run: it is the step that loads the rules the agent then obeys. A per-write call would be a new obligation with a new miss rate; a Setup-step call rides an obligation that already holds. Resolve once at Setup, use the values for the rest of the session. A skill resolves at its own first step, for the same reason.

**And what a consumer does with a key it cannot use: it stops and names that key.** An empty or unset value is never a default, a fallback, or an empty result: nothing is scanned through it, nothing written through it, and the run halts naming the key. This is the consumer-side end of the exit-4 rule under *Failure behaviour*, not a second rule beside it: the resolver refuses to emit `KEY=` for a reason that holds just as well one step later, where a held value is interpolated into a shell block, a glob or a path join and can go missing long after the resolver exited 0. An empty expansion is silent, so a consumer that does not check reports it as a finding.

`fusion-rules` still takes an **agent** name only. The two helpers stand side by side in the same step with different namespaces, and that is deliberate: `fusion-rules` maps an agent to rule-file patterns, which is an authored fact about an agent and has no meaning for a skill. Their symmetry is the interface (a required name argument, output on stdout, the shared `0/1/2` exit core), not the argument domain.

### Contract

Signature `fusion-paths <name> [<item-dir>]`. Output: one `KEY=value` line per emitted key on stdout. Paths are workbench-relative except `WORKBENCH` itself, which is absolute. Multi-value keys are space-separated.

**The second argument names the item in scope**, as the directory's own name in the container store; it must hold a `package.json` the codec reads, and one that does not is exit 1, a caller usage error rather than a workbench fault. It is how a dispatcher sends an agent into an item other than the one this checkout holds.

**With no second argument the resolver reads the claim.** The item in scope is the package whose control file has `status` `claimed` and a `claim.checkout_id` equal to this checkout's eight hex characters (`## Work packages`). No claimed item is a real answer and resolves to `shared/`, exit 0. **Two claimed items is refused, never resolved:** exit 3, both files named on stderr, no output at all. The criterion is implemented once, in `bin/fusion-claimed-package`, which `bin/fusion-paths` and `bin/fusion-rules` both call rather than each carrying a claim scan of its own; binding decision `260910-2145_*_how-does-the-resolver-learn-which-work-item-is-in-scope.md` (option 2).

**Scope is per checkout, and holds by construction rather than by a rule.** A claim names one checkout, so an item another checkout holds does not match here and is not this checkout's scope: its writes go to `shared/`, or into the container of whatever it holds itself. The claim travels with git, so both checkouts read one store and reach different answers out of it. No pointer, no per-checkout state, nothing to reconcile.

#### Exit codes

| Code | Meaning | Shared with `bin/fusion-rules`? |
|---|---|---|
| 0 | Success | yes |
| 1 | Usage error, including no workbench found above `pwd` | yes |
| 2 | Unknown name: no such agent and no such skill | yes |
| 3 | The item in scope cannot be determined. The header of `bin/fusion-claimed-package` lists the causes, among them two or more claimed items, this checkout's identifier unreadable inside a git work tree, and a workbench refused by name (`legacy`, `unsupported`). No output, and never a fall back to `shared/` | no |
| 4 | Internal error: a prompt names a key the resolver cannot order or value, or one name is both an agent and a skill (a **fusion bug**) | no |

**Exit 3 is unknown scope and nothing else.** A project that is not a git work tree takes no claim at all, so no item in scope is the true answer there and it exits 0 into `shared/`. The two look alike and are not, hence `bin/fusion-identity` splits its 3 and 5 from its 4. On a `legacy` workbench the way out is `/fusion:migrate`, never an edit; on an `unsupported` one, a newer client.

The `0/1/2` core is shared with `bin/fusion-rules`; 3 and 4 are this resolver's own. `bin/fusion-rules` also exits 3, for an unrelated reason, a malformed `rules/context-manifest.yaml`, so read an exit 3 against the helper that returned it, never across the two.

### Two invariants

1. **Every `OUT_*` points into the container of the item in scope, and into `shared/` when there is none.** That is `## Origin Rule` stated executably. The resolver answers the placement question once, at Setup, so a consumer carries no branch and is never asked where something goes; "no item in scope" is an answer it resolves, not an error it hands on.
2. **Every `SCAN_*` names both stores for its kind, container first and then the shared one, and collapses to the shared one alone when no item is in scope.** A scan that misses a store is the failure this invariant guards against: an artefact filed under a brief is the same kind as one filed without, so a consumer that searched one store would report a clean pass over half the corpus.

   There is deliberately no `SCAN_MEMOS`. `memos/` is a store like the others, but no agent reads it: a memo is written for the user, not for an agent. A key is emitted when a prompt reads the kind, not because the symmetry of the table would look better with it.

### Failure behaviour

A key the resolver cannot value exits 4 rather than emitting `KEY=`. An empty right-hand side would send an agent's writes to the workbench root, which is the silent-wrong-place failure this refusal exists to prevent (`HYG-NO-SILENT-FAIL`).

**Exit 4 is ours, not the user's.** It is not fixable from the workbench at all, so a prompt that reports it as something the user should go and repair sends them hunting a fault that is not theirs.

## Issues vs Decisions — when to use which

A **defect** belongs in `issues/`, a **decision** in `decisions/`, and `## Record filing` below says when each is owed. What separates them is the resolution: "go fix it" is a defect, "decide and record" is a decision. A defect resolves to a fix in the tree, verifiable by reading a diff; a decision resolves to a recorded answer and, separately, to the implementation that realises it, which is why the two carry different state sets (`## State Markers — issues and planning`, `## State Markers — decisions`).

- Defects: "term mapping is missing for entity X"; "test failure in pkg/foo"; "manifest doesn't validate".
- Decisions: "which IdP for v1?"; "should we adopt approach X or Y?"; "what is the cut decision for the platform?".

When in doubt, file as an issue and reclassify in the next reconciliation pass: that round-trip is cheap, the misfile cost is low.

A **work package** is neither: it is the work itself, not a statement about it. "Do this" is a work package, and `## Work packages` below is its grammar.

This three-way distinction is about **what kind of thing** an artefact is, and the kind decides the store on its own.

## Work packages

A **work package** is one unit of work: something somebody is going to do, or has decided not to. **It is a directory holding a pair**: the container `work-packages/YYMMDD-HHMM-<slug>/` (`$OUT_PACKAGES`), the narrative `YYMMDD-HHMM-<slug>.md` under the directory's own name, and the control file `package.json` beside it, with **no marker on any of them**. Everything the item produces goes into that directory too, in the same per-kind subdirectories `shared/` carries (`## fusion-workbench Layout`), so `ls` on one path is a unit of work's whole account of itself. Finding the pair is finding the container, so a claim that resolves can never point at a directory that is not there.

One directory per item rather than one list file, because two checkouts adding work at the same time then merge with no conflict. No marker, because a state change rewrites `package.json` and renames nothing, so every citation of an item stays valid for its whole life.

The narrative carries the brief and nothing that decides state:

```markdown
# <one-line brief>

## Directive

<One paragraph: what this item aims for, and how a reader would know it was reached.>
```

**`package.json` is written by `bin/fusion-write` alone**, never by hand: `create --kind package` files the pair once the narrative is written, then each field has one subcommand (flags and exit codes: that script's header):

| Field | Written by |
|---|---|
| `status`, `claim` | `claim`; `release`; `transition --to <status>`, with `--outcome` into `done` or `dropped` |
| `mode` | `set-mode` |
| `depends_on` | `set-dependencies` |
| `active_documents` | `adopt-plan`, which moves a replaced plan into `references` |
| `domain`, `filed_by`, `origin` | `create`, once |

**`--outcome` takes three required fields**: `{"class":"completed","reason":"<what landed>","evidence":[]}` into `done`; into `dropped` the class is `bounded`, `cancelled`, `failed` or `dropped` and `reason` is non-empty.

A narrative imported by `/fusion:migrate` may keep `**Domain:**`, `**Filed by:**` or `**Cross-references:**` lines: they are informational, and where one disagrees with `package.json` the JSON governs.

**`mode` `autonomous` is the user's standing answer to the approvals about the solution**; `ordinary` is the default. It stands on the user's word and is written only on it, `set-mode --source` citing the narrative that holds the user's words, `'{"kind":"user-word","ref":{"kind":"other","path":"<it>","sha256":"sha256:<of its bytes>"}}'`: by the user, by `/fusion:wp` from the user's own words, or by the orchestrator in the same turn as a filing or a claim the user asked for, never from the brief's prose. Which approval conditions it answers, and which it never does, is `agents/orchestrator.md` `## Human approval rules`; a `gate_response` citing it records an answer the user gave, so `## Dispatching another agent` holds.

**`status` takes five values and there is no sixth.** The first three are live; the last two are terminal, the `terminal` set of `package` in `codec/contract/transitions.json`.

| Value | Meaning | `claim` |
|---|---|---|
| `open` | nobody is working on it | null |
| `claimed` | a checkout is working on it now | names that checkout |
| `paused` | set aside deliberately, not abandoned, expected back | null |
| `done` | the work landed | may keep the checkout that did it |
| `dropped` | no longer live; the narrative says why | may keep one that stood |

**The edges are the kernel's**: `claim` from `open` or `paused`; `release` from `claimed` to `open`; `transition` from `open` or `claimed` to `paused`, from `paused` to `open`, from `claimed` to `done`, and from any live value to `dropped`. The codec refuses any other (exit 6). Pausing clears the claim, so resuming is an ordinary `claim` by anybody. **A paused item's narrative says *what* it is waiting for** and never a date, because nothing checks a date; where the thing waited on is another work package, that is a `depends_on` entry rather than prose. **`done` and `dropped` are terminal**: reopening one is filing a new item that cites it (`## Terminal states are history`).

**`claim` names the checkout, and the checkout is the whole key.** `claim.checkout_id` is what `bin/fusion-identity` prints as `CHECKOUT=`, and `claim.person` its `PERSON=` line, read the way `### Who filed it` reads it. Two checkouts of one person carry one git identity, so the person alone cannot answer whose claim this is; the checkout can, and comparing a claim against this checkout is an equality on those eight characters. `bin/fusion-write` refuses (exit 5) a claim when this checkout's identifier cannot be read, and a `release` or a `transition` out of `claimed` by any checkout but the holder.

**A takeover stands on the user's word, per package and per transfer.** A package another checkout holds stays claimed until that checkout releases or transitions it, or until `claim --take-over-from <checkout> --source <JSON>` gives this checkout the claim and appends an entry to `provenance.claim_transfers`. The word names the package, its holder and the new one; the user saying the old checkout is gone is procedure, not fencing (`agents/orchestrator.md` `## Work packages`). Within one workbench the codec refuses a second claim. Across checkouts the race is detected, not prevented: two that both pull, both see `open` and both claim conflict on `package.json` at the next merge, and the one who loses picks another item.

**`depends_on` entries are written by `set-dependencies --on <condition>:<package control path>`.** **An entry stands on the user's confirmation, and no agent writes one without it**. **One agent route may propose an entry for the user to confirm**, the policy-curator's `**Edges:** on` survey (`agents/policy-curator.md` `## The fourth subject — work-package edges`), whose proposals are inert until somebody rules on them. **`mode` `autonomous` on the item that survey targets is the one route by which a proposed entry is written without a per-entry ruling**: the ledger is then applied whole, edges included, on the standing answer the field is, and `agents/orchestrator.md` `## Human approval rules` is the authority for which approval conditions it answers. Absent that, the write still stands on the user's confirmation, entry by entry. `bin/fusion-work-order` computes the order over the confirmed edges, and it stands unless the user overrides it. No agent asserts a ranking, and no field holds one. Binding decision: `260909-1808_*_may-a-helper-compute-an-order-over-work-items-after-the-portfolio-layer-goes.md` (option 3).

**An entry asserts one relation and one only: the named item must reach its condition before this item may start.** `terminal` is reached at `done` or `dropped`, because neither is a node; `succeeded` is the stricter condition chosen explicitly, `done` with outcome `completed` and an accepted evidence record (`codec/contract/dependencies.json`). A `paused` target has reached neither, so the entry is live: the paused item is a node in `bin/fusion-work-order`'s graph and blocks every item naming it. A citation that orders nothing (a record the item rests on, a decision that binds it, work it merely touches) stays in the narrative's prose. Binding decisions: `260908-2018_*_does-the-new-field-name-only-the-ordering-edge-or-the-four-relation-types-beside-it.md` and, for the node set the terminal values come from, `260908-2018_*_is-a-closed-prerequisite-a-satisfied-edge-or-no-edge-and-what-is-an-archived-one.md`.

**`active_documents` names the artefacts the work runs on**: plan records bound at the exact narrative revision accepted, any number in the role `spec` and at most one in the role `plan`. `adopt-plan --plan <control path> [--role spec]` writes it, and a later plan replaces the earlier one in the same write. **The write rides the act**: whoever makes a spec or plan the one this work runs on adopts it in the same turn, and no pass maintains it afterwards: a field a separate bookkeeping step owns drifts from what the work is actually running on. Empty means no artefact yet, and a reader takes that as the statement it is. Its second reader is the closure step, which reads the plan whose `## Where this work stops` it puts back to the user clause by clause; with none bound, that step has only the plan the session happens to be holding, which nothing persists. Binding record: `260910-2011_*_a-work-item-has-no-field-for-the-plan-it-runs-on-so-the-closure-step-lost-its-source.md`.

**Who files a package.** The user, by hand, through `/fusion:wp`, or by instructing the orchestrator, whose write carries the user's words as the brief, `--origin user-request` and `--actor user`. **An agent may also originate one** within the work it was commissioned for: `--actor` names the agent, so `filed_by` still tells an agent's filing from the user's, and `--origin` names the control path of the package whose scope it decomposes. That origin creates no mandate and no right to run: what runs is still approved through `mode` and the orchestrator's approval rules. A defect an agent finds is still an issue, a choice point a decision record. Binding decision: `260927-2319_*_may-an-agent-originate-a-work-package-on-its-own-initiative.md` (option 1).

**Maintenance is the orchestrator's, at the user's word, with no agent dispatch.** Splitting one item's work across several, merging several statements of one job into one, and moving an item to `done` or `dropped` are operations somebody performs once the user has said so; the user is confirming each one anyway, and dispatching an agent to perform a confirmed operation costs a dispatch to save nothing.

## Dispatching another agent

**An agent may dispatch another agent.** Nothing forbids it and nothing enforces a ban, so a pass that needs to fan out, fans out. Two bounds hold for every agent, not for the orchestrator alone: the `consultant` is no executor, so no task is routed to it, and an agent dispatches it only for a second opinion on a concept or, through `/fusion:discuss`, as the second discussion partner; the `orchestrator` is dispatched by no agent at all. A dispatch grants no mandate: what an agent may file is `## Work packages` above, and what may run is the approval rules below.

**Approvals are asked in the orchestrator's own loop, and a nested dispatch never reaches one** (`agents/orchestrator.md` `## Human approval rules` holds the conditions). So before an agent dispatches another agent, it reads that section through `$FUSION_PLUGIN_ROOT`, which every SessionStart exports. A row that applies to the dispatch it is about to make means it **does not make it**: it returns the question, with the row named, to whoever dispatched it, and that party carries it up to the orchestrator, where the user answers as before. A table it cannot read (the variable unset, the file absent) counts as a row applying, so it returns rather than proceeding blind. No row applying, the work goes on.

**Whether an approval condition is present is a determination; what the user answers is a decision.** The determination is delegable, because it is a finding about the task. The answer is not, because it is consent: **no agent approves on the user's behalf, and no agent writes a `gate_response` for an answer nobody gave.** The party that put the question to the user records the answer it received, and that party is the orchestrator; nobody else writes the event. Binding decision: `260913-0909_*_may-the-orchestrator-reach-every-tool-and-may-an-agent-dispatch-another.md`.

## Timestamps

Always obtain `YYMMDD-HHMM` from `date +%y%m%d-%H%M`. LLMs have no clock. Never guess or estimate the time.

## Project language

**The surface decides**: every piece of output falls into exactly one of four cases:

- Output the user reads in the terminal (approval prompts, `AskUserQuestion` text, status reports, chat replies): the **chat language**.
- Output that persists as a file **for the project's own use** (specs, plans, records, histories, reviews, analyses, memos, work packages, and the profile-exempt persisted surfaces too: dashboard lines, commit messages, monitor strings): the **artefact language**.
- Output that persists **for a reader outside the project** (a customer deliverable): the language **the dispatching task names**: no default, no fallback; the `document-editor` halts when the task names none.
- Text on an **exempt surface is English**, whatever either declaration says. Universal: code, code comments, hook and CLI operator strings. Conditional: **whatever a project ships onward to readers of unknown language**, a rule corpus, a plugin, a library. A project that ships nothing has no surface in this group; fusion's own repository is divided by the criterion rather than exempted whole: what it ships (rules, prompts, skill bodies, READMEs, docs) is English, its workbench follows its declarations.

A project declares its languages in `CLAUDE.md`: `**Language:** <en|de>` (chat) and `**Artifact language:** <en|de>` (artefacts); a project sharing one language declares only the first. **The fallback chain has no special cases:** `**Artifact language:**` absent, unreadable or invalid means not declared, and `**Language:**` then governs both surfaces; `**Language:**` not declared, by the same three-way test, means `en`. Both fallbacks are silent.

Head labels defined in a shipped template (`**Decidability:**`, `**Domain:**`) stay English in every project; the artefact body under them follows the artefact language. Existing artefacts are not translated.

The reasoning, the stylometric-profile resolution (including the per-family missing-variant fallback and the deliverable-profile case) and the settled edge readings are authored in `rules/project-language.md`, emitted to the `document-editor`; decision `260827-1056_*_which-parts-of-the-language-and-backlog-rules-does-every-dispatch-still-carry.md`, a record in fusion's own workbench, fixed this partition and what the core above must carry.

## Filename Patterns

Patterns attach to the **kind of artefact**, and the kind decides the store too.

| Artefact kind | Written to | Pattern | Control file beside it |
|---|---|---|---|
| Work item | `$OUT_PACKAGES` | `YYMMDD-HHMM-<slug>/YYMMDD-HHMM-<slug>.md` | `package.json` |
| Spec / plan | `$OUT_PLAN` | `YYMMDD-HHMM-<topic>.md` | `<stem>.record.json` |
| Defect | `$OUT_ISSUE` | `YYMMDD-HHMM-<topic>.md` | `<stem>.record.json` |
| Decision record | `$OUT_DECISION` | `YYMMDD-HHMM-<topic>.md` | `<stem>.record.json` |
| Discussion | `$OUT_DISCUSSION` | `YYMMDD-HHMM-<topic>.md` | `<stem>.record.json` |
| Review (code / onto) | `$OUT_REVIEW` | `YYMMDD-HHMM-<sender>-<topic>.md` | `<stem>[.<n>].evidence.json`, when evidence is recorded |
| Analysis | `$OUT_ANALYSIS` | `YYMMDD-HHMM-<topic>.md` | no |
| Consultation | `$OUT_CONSULT` | `YYMMDD-HHMM-<topic>.md` | no |
| Memo | `$OUT_MEMO` | `notes-<person>.md` / `tasks-<person>.md` | no |
| Forum entry | `$OUT_FORUM` | `YYMMDD-HHMM-<checkout>-<slug>.md` | no |
| Cadence digest | `$OUT_MEMO` | `cadence-<checkout>.md` | no |

**A new record's name carries no marker**: its state is in the control file, which `create` writes in the kind's initial state once the narrative is written (`## Record filing`). A name written before `/fusion:migrate` keeps its marker (`YYMMDD-HHMM_o_<topic>.md`, the `.record.json` beside it under the same stem), and that letter encodes no current state: it is where the record stood at migration, and nothing renames it.

**Of the kinds above, a discussion is the only one whose record is written unfinished**: it is on disk from round one, and its state moves at the close rather than when somebody decides something. So read an `open` discussion as interrupted, not as pending.

`<sender>` on a review file is `reviewer`. It is mandatory, and the document header repeats it. Older files carry the senders it replaced: `coderev` and `ontorev`, merged into `reviewer` at v11, and `conceptrev`, retired with its agent on 2026-08-15.

**Cite a record by its storeless basename**, so the citation survives every archive sweep: a markerless name as it stands (`YYMMDD-HHMM-<topic>.md`: a new record, a work package, history, review, analysis, consultation, forum entry), a marked one with the marker wildcarded, `YYMMDD-HHMM_*_<topic>.md`, whatever letter it carries. **A citation carrying a store segment is a violation the checks report** (`shared/<store>/` in front of a record): the segment is what a sweep moves, so a citation spelling it dies at the sweep. The reader resolves either form by one workbench-wide lookup (`find "$WORKBENCH" -name '<basename>'`, the wildcard as a glob), which is correct because no two stamped artefacts share a marker-normalised basename: measured over the live tree and `archive/` at commit `4b8f769d` (2 235 basenames, 0 collisions) and re-taken on every run by `hooks/lib/__tests__/workbench-citation-lint.test.ts`. **A migration's kept originals are outside that scope**: `archive/migrations/<id>/originals/` holds each converted record's pre-migration bytes under its own basename, so the lookup, the checks and the sweep skip that subtree, and an original is reached through the receipt beside it. **A record held in another project's workbench is cited `foreign:<project>:<citation>`**, both leading segments literal and required, as in `foreign:menue-rs:260905-2054-reconciliation.md`; the qualifier is read before any lookup, so such a token is reported neither dangling nor store-prefixed. It is supplied by the writer and never inferred: nothing separates a genuine foreign record from a local one mislabelled, so the form is a claim you are making rather than a fact a lint checked. **A bare stamp is not a citation**: 111 of the 545 stamps in fusion's own corpus are carried by more than one file, measured 260824 over 876 records. **No pattern above changes.** In living text (prompts, rules, docs), which outlives its target, cite a rule file by heading anchor (`file.md` `## Section`), never by line number: an edit above the line moves it silently, and no lint resolves `path:N`. **A resolution line takes the same anchor**, never `:line`: `Resolved:` on an issue and the five decision lines `## Inline State Tracking` spells. `path:line` was the rule until 2026-09-05, and why it moved is `260905-1228_*_does-a-resolution-line-cite-path-line-or-a-heading-anchor.md`'s; the commit still carries the moment, and what is given up is precision inside a file. When the target is a record the path half is its storeless basename (a rule file, a source file or a commit stays a path), and a commit hash takes no locator. **A workbench record's heading anchor into shipped text reads as the heading stood when the record was written**, and no lint resolves it: `hooks/lib/__tests__/reference-resolution-lint.test.ts` excludes the workbench, and `hooks/lib/__tests__/workbench-citation-lint.test.ts` and `bin/fusion-citation-check` read no heading anchor. A record is point-in-time and carried by its commit, so a heading reworded later leaves it correct about its moment and stale about the tree; a count of stale anchors in live records above a handful, which nobody has taken, would reopen this.

**A record somebody deliberately deletes leaves no file and no marker, so the annotation sits on the surviving references.** Deletion is not archival: an archive sweep moves a record and it stays citable at its new path, while deletion preserves nothing and there is no corrected path to write. Whoever deletes a record therefore annotates every citation of it that survives elsewhere, **replacing** the dead citation rather than standing beside it, since a path that resolves to nothing is indistinguishable from an accident whatever sentence sits next to it. The identity is carried as the stamp and the slug in separate spans, and no basename is left behind for a lookup to fail on:

```
Deliberately deleted YYMMDD: `<stamp>`, `<slug>`.
```

A trailing clause after the full stop is free. **A reader recognises the annotation by the literal opening `Deliberately deleted `**, and that is the whole test: an ordinary dead citation carries no such prefix, and a repair that corrects a path never writes one. The obligation rides on the care of whoever deletes, which is weaker than every other rule here and is stated rather than papered over. Binding decision: `260805-1548_*_wie-soll-ein-circle-verschwinden-duerfen-den-jemand-absichtlich-loescht.md`.

The two kinds sharing `$OUT_MEMO` differ in write semantics: the memo and task files are **append** logs (`/fusion:memo` adds to them), while the cadence digest is **overwritten** on each `/fusion:cadence` run (it is a fresh snapshot of the work cadence, not a history of its own runs).

**`<checkout>` is the eight hex characters `bin/fusion-identity` prints as `CHECKOUT=`, and never an OS login.** It keys the cadence digest and `activity-log-<checkout>.md`, which sits in the **project root**, outside the four-class partition, so it takes its one-writer property from the key alone. **`<person>` is the e-mail of the `PERSON=` line, lowercased, each non-alphanumeric a `-`.** A consumer runs `I="$FUSION_PLUGIN_ROOT/bin/fusion-identity"; [ -x "$I" ] && "$I" || true` and reads the line it keys on (`CHECKOUT=` is SessionStart's `$FUSION_CHECKOUT`); the helper's stderr is not discarded, because the reason for a half it could not read is worth more to a human than its absence. No line means no value, and the resolver never substitutes one. **A writer of one of these four files halts and reports when its key is empty**, because an empty key writes `-.md`, the one name every writer would share: for `<checkout>` exit 3 or 5, for `<person>` exit 1, 4 or 5, and a missing helper for either, none of which implies an absent workbench. Nor does a writer fall back to an unkeyed name: `/fusion:memo` and `/fusion:cadence` also halt when there is no workbench above the working directory, so all four logs are keyed or not written. Why the checkout and not the person is argued in `bin/fusion-identity`'s own header, `## What the identifier keys, and why the person does not`; the memo pair takes the person by the user's choice, and one person's two checkouts can conflict on an append.

**A file under the old login-keyed name is adopted, never orphaned.** The workflow that writes one renames `<prefix>-$USER.md` to `<prefix>-<checkout>.md` on its next run (when this checkout's `$USER` is the suffix, since that is what makes the file this checkout's, and nothing already stands at the new name) and reports the rename; `/fusion:memo` instead appends `memos-` and `tasks-` under either this checkout's key to the person's file and removes the old one. In every other case it leaves the file where it is and names it in the report, and nothing else is merged or deleted. `/fusion:cadence` is the activity log's own adoption run, under these same conditions: it writes that log before it digests it, so the party that reads the source is the party that may rename it.

## State Markers — issues and planning

An issue and a plan take four states in `control.state` of their `.record.json`, a discussion two:

| State | Meaning |
|--------|---------|
| `open` | initial, written by `create` |
| `in_progress` | an agent is working on it (not a discussion) |
| `closed` | resolved, or the user closed it. Stays `closed` when a later commit or record reverses the reasoning in its `Resolved:` note; the narrative gains a `Revised by:` line instead (`## Inline State Tracking`) |
| `deferred` | the user deferred it, or confirmed an agent's proposal (not a discussion) |

**A state changes by `bin/fusion-write transition --record <control path> --to <state> --reason <text>` and by nothing else**: no rename, no edit of the control file. `open` moves to any other state, `in_progress` to `closed` or `deferred` (`codec/contract/transitions.json`); closing or deferring an issue carries `--disposition` (`## Inline State Tracking`).

**The marker letters are the legacy grammar**: `_o_`, `_p_`, `_c_`, `_d_` map to these four states, in this order, when `/fusion:migrate` imports a record, and they stand in the names written before it and in `archive/`. Neither is read for state.

History, review, analysis, investigation, consultation, memo and cadence files carry no state.

## State Markers — decisions

A decision's `control.state` separates "the answer is recorded" from "the answer is realised in code or data". Each move into a state carries the payload that state requires, and the narrative gains the matching line (`### Decision files`):

| State | Meaning | Payload |
|--------|---------|---------|
| `open` | filed, not yet answered; initial | none |
| `answered` | a recorded answer exists (an analysis, a plan, a commit message or the record itself); not yet realised in code or data | `--answer-ref` |
| `implemented` | realised: code or data at a commit reflects the decision | `--implementation-ref` |
| `deferred` | the user explicitly pushed it out (to v1.x, a future workbench) | `--deferral`, its target and who ruled |
| `superseded` | a later decision overrode it | `--superseded-by` |

**Neither `answered` nor `implemented` asserts that its subject still stands**: when it was removed with no later decision overriding it, the narrative gains a `Retired:` line and the state does not move.

**The edges** (`codec/contract/transitions.json`): `open` to `answered`, `implemented` or `deferred`; `answered` to `implemented`, `deferred` or `superseded`; `implemented` to `superseded`, the one allowed terminal-to-terminal edge. Revisiting an implemented decision is a NEW decision, which may then supersede it. The legacy letters `_o_`, `_a_`, `_i_`, `_d_`, `_s_` map to these five as their initials say.

**Worked transitions are authored in `rules/decision-record-examples.md`** (emitted to the transition agents, see `bin/fusion-rules` block 1b2; decision `260827-0830_*_do-the-decision-record-worked-examples-stay-on-the-always-on-floor.md`); each transition's line is `### Decision files` below, and a superseding record is cited where it lives, never copied next to the superseded one.

**Current evidence base vs evidence-base history**, mirroring foundation_V3 §1.2's two-layer model: `open` and `answered` are the **current evidence base**, the best-of-knowledge the project is working with; `implemented`, `superseded` and `deferred` are **evidence-base history**, the preserved record of what was decided, including what was replaced or postponed. Each decision store holds both layers, and the state carries the layer. A pass that lists the current evidence base filters on `open` + `answered`, one that shows project history takes all five, and either covers every path in `$SCAN_DECISIONS`, not just the container's.

## Marker globs

**State is never read off a filename.** A new name carries no marker and an old one's letter is history, so no glob over names answers which records are live. Enumerate through the codec: `bin/fusion-record`'s `list`, optionally scoped to a store, answers each pair's `path`, `kind` and `status`, and `show` one record's control data; live means a status outside its kind's `terminal` set in `codec/contract/transitions.json`.

**Where an old name is matched** (a citation's wildcard, the legacy reader, `archive/`), the delimiter is an underscore, not brackets. `[` and `]` are shell-glob metacharacters: a bracketed letter inside a glob is a one-character class that matches nothing and, under `bash`, fails *silently*: the count comes back `0` (`HYG-NO-SILENT-FAIL`).  The underscore is inert in glob, regex and `find -name` alike.

**And a record that states something *about* a citation names file and line, or fences the verbatim form.** A pointer and a statement about one are the same characters, and no reader (human or lint) can tell them apart; star a pointer and leave the letter on a marker that is being *named*, which leaves the second spelling an address that dies at its target's next transition. So do not spell it: name the citing line (`260812-1720_*_the-reference-resolution-lint-does-not-scan-the-workbench-where-citations-are-densest.md:24`) and let the reader open it. A fenced code block is the exception, for where the spelling itself is the datum (a verbatim transcript), and the fence covers the results a **lookup** decides: inside one the lint stops asking whether the record exists, resolves to more than one, or has moved to another marker. It does not cover **`store-prefixed`**, which is read off the token's shape before anything is looked up, so a store segment inside a fence is still reported (`git:ff52dd4a`). The fence does keep the sweep off it, so an exhibit is never machine-rewritten; where the store has to be named, name it in words rather than spelling it into the token. Binding: `260820-0530_*_twenty-six-citations-in-the-corpus-are-statements-rather-than-pointers-and-no-exemption-expresses-that.md`.

## Terminal states are history

The terminal states are the `terminal` sets of `codec/contract/transitions.json`, which the kernel reads: `closed` and `deferred` on an issue or a plan, `closed` on a discussion, `implemented`, `superseded` and `deferred` on a decision, `done` and `dropped` on a work package. No edge leads from one back to a live state, and the codec refuses one. Where continuation is needed, file a new record that cites the terminal one.

**A terminal record is read as evidence and never reconciled in place.** No step, criterion or header change is written into it after the transition (the codec refuses plan progress on a terminal plan), and an unticked box there is not outstanding work. This is what makes a reconciliation pass' scan finite: it opens the live records, and a terminal one tells it nothing it may act on. Binding decision: `260824-2013_*_do-archive-and-terminal-circles-stores-enter-any-scan-set-or-is-the-exclusion-written-down.md` (option 5). **State, not spelling:** respelling a citation's pre-v4 bracket marker to the storeless wildcard names the same target and writes no state, as the sweep already does for an underscore one here (`260921-2002_*_does-reading-the-bracket-marker-form-sweep-the-frozen-stores-or-does-the-sweep-first-learn-to-skip-them.md`).

## Inline State Tracking

**State moves in the control file; the reasoning stays in the narrative.** Each change is one `transition` call, made when the change happens, so that an interruption loses nothing. No narrative line moves a state: a control head line in a live narrative is a `reconcile` finding, and a step mark there is prose.

### Planning files

- A step: `--steps '[{"id":"<n>","state":"in_progress"}]'`, later `"done"`, `<n>` its number under `## Implementation Steps`. The number is the anchor, so a step is never renumbered and none is added (decision `261001-1804_*_what-stable-step-anchor-does-an-imported-plan-carry-and-which-criteria.md`). When only steps move, `--to` names the state the plan stands in.
- A criterion: `--criteria '[{"id":"<id>","met":true}]'`.
- The plan: `--to in_progress` when work starts, `--to closed` when it is done; closing does not require every step done.
- `--steps` updates only anchors the plan has: one per numbered step, imported or filed by `create`.

### Issue files

When an issue is resolved, its executor appends below the narrative's content:
```
---
Resolved: <brief description of what was done>
```
Whoever dispatched the executor then sends `transition --to closed --disposition '{"kind":"fixed","reason_ref":null}'`, once it has read the `Verification:` line, the kind from the closed set `codec/schemas/record.schema.json` gives `disposition`.

When a later commit or record reverses the reasoning a closed issue's `Resolved:` note states, append:
```
---
Revised by: <commit hash, or path to the reversing record> — <one-line reason>
```
(**no transition**: the state stays `closed`.) Leave the `Resolved:` note itself unedited: it records what was decided then, and rewriting it would erase the reversal instead of pointing at it. `Superseded by:` keeps its decision-record meaning and is never used on an issue file.

### Decision files

Decision files have their own resolution lines matching the states: do NOT use `Resolved:` (that's for defect-issues only). Whoever sends a transition first appends its line, `Implemented:` excepted, whose writer and sender differ; a ref payload other than `--implementation-ref` is a `reference` of `codec/schemas/common.schema.json` naming the same target as the line:

```
---
Answered: <citation> — <one-line summary>; ruled by <agent name or "user">, <person>
```
(`--to answered --answer-ref`)

```
---
Implemented: <citation> — <one-line summary>
```
(the executor's note, citing the files and headings it changed and no commit hash, which does not exist yet. The dispatcher reads the `Verification:` line, commits and sends `--to implemented --implementation-ref '"<commit hash>"'`, from `answered`, or from `open` if the implementation skipped the recorded-answer step)

```
---
Deferred: <target> — <one-line reason>; ruled by <agent name or "user">, <person>
```
(`--to deferred --deferral`; the reason stays in the line)

```
---
Superseded by: <citation of the new decision> — <reason>
```
(`--to superseded --superseded-by`)

```
---
Retired: <plan, commit or decision that removed the subject> — <one-line reason>
```
(**no transition**: the state stays.) For a decision whose subject was removed with no later decision overriding it, which `Superseded by:` stays reserved for. On `implemented` the citation names what removed the **implementation**; on `answered` what removed the thing the answer would have been realised against. Nothing moves, so a history pass has to open the narrative to learn it.

**Every citation above is the anchor form**, not `path:line`: `## Filename Patterns` states it and says why it moved.

**Two of the five lines name who ruled, and three do not.** `Answered:` and `Deferred:` record an act only a person performs, which nothing on disk confirms, so the line names the party. `Implemented:`, `Superseded by:` and `Retired:` cite something a reader verifies without trusting anybody, so they name nobody. `<agent name or "user">, <person>` is `**Filed by:**`'s shape, its person half read under `### Who filed it`, halt and both file-anyway branches included. Both parties appear because the writer is not the ruler: the orchestrator writes the line and the user rules (`260905-1042_*_may-a-dispatched-agent-perform-the-open-to-answered-transition-at-all-and-under-which-bound.md`). **Records written before this rule stand as they are, and no lint checks the field**: an absent `ruled by` means the record predates the rule, never that nobody ruled (`260905-1228_*_does-an-answered-record-carry-who-ruled-now-that-only-the-orchestrator-may-transition-it.md`).

### When to update

- After completing each plan step, not just at session end.
- After resolving an issue, before moving to the next task.
- After answering or implementing a decision, before moving to the next task.
- When the user asks to close, defer, supersede, or reopen anything.

## Record filing

**The commit message is the per-commit record.** It already exists, is already read, and travels with git rather than with the workbench. There is no per-commit and no per-dispatch filing obligation: a one-line fix is committed with its message and **no record file at all**, which is the normal case, not a lapse.

A record file is written when the change carries something the diff and its message do not:

| Kind | Store | Filed when |
|---|---|---|
| issue | `$OUT_ISSUE` | a defect exists that this change does not fix |
| decision | `$OUT_DECISION` | a choice was made whose reasoning a later reader would otherwise re-derive |
| plan | `$OUT_PLAN` | work spans more than one dispatch, so an instruction must outlive the dispatch that received it |
| review | `$OUT_REVIEW` | a review pass was run and found something |
| analysis | `$OUT_ANALYSIS` | a question was studied and answered without changing anything |
| discussion | `$OUT_DISCUSSION` | a bounded discussion was run, whatever it concluded |

**The split is over statements, not over events**, which is what makes it disjoint: one statement falls in exactly one row, while one event may raise several. A review pass that finds a defect owes both a review and an issue, which is two answers rather than one filed twice; two files carrying the *same* statement is the duplication to refuse. The seventh branch completes the split and is the common one: no condition held, so nothing is filed. Binding: `260909-1615_*_spec-cut-fusion-to-a-working-minimum.md` `### C5`.

**Where it goes** is resolved for you by `bin/fusion-paths`, and there is no judgment left in it: the resolver applied `## Origin Rule` once at Setup, and a store whose key it did not emit for you is a kind you do not write. **Reach is cited, never copied.** Where a record binds work filed elsewhere, the citing record names it by basename in its `**Cross-references:**` header. Do not copy it, do not move it, do not file a duplicate: one record, one location, many citations.

**Before writing, list what is already there.** One `bin/fusion-record` `list` of every `$SCAN_ISSUES` store, reading the paths of the rows at `open` or `in_progress`: names only, never bodies, because a costlier check gets skipped. A hit is a slug naming the same file or mechanism as yours; append one line to that record's narrative, `Also seen: YYMMDD-HHMM by <agent> — <one clause>`, write no second file and move no state. In doubt, write the new record: a duplicate costs one merge, an unfiled defect costs the defect.

**A record that is owed is its own file.** Never put an issue or a decision inside a plan, a review, an analysis, a code comment or chat output. Embedded items get lost.

**An issue states the defect, the evidence path, and the acceptance test, then stops.** Later passes re-read every record many times; narrative past the close-condition is recurring cost. Counts in it follow `rules/critical-stance.md` §5.

**Filename:** `YYMMDD-HHMM-<topic>.md`, no marker. Write the narrative, then file the pair: `bin/fusion-write create --kind <kind> --narrative-file <workbench path> --origin <the package in scope's control path, else user-request> --actor <you>`; the codec writes the control file in the kind's initial state. Any exit but 0 leaves the narrative unfiled: report it with the `fusion-write:` line and delete nothing.

**Issue file format:**
```
<issue title>
---
<short description>
---
**Filed by:** <agent name or "user">, <person>
<context>
```

**Decision file format**: see the Decision Record Template below.

### Who filed it

Both formats carry `**Filed by:**`, and its `<person>` half is the `PERSON=` line of `"$FUSION_PLUGIN_ROOT/bin/fusion-identity"`, in git's own `Name <email>` form. Call it guarded, as every helper call site is: `[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-identity" ]`. Read it from there and nowhere else; compose no value.

Two of that helper's exit codes are opposite instructions to you. **Exit 1** is a git work tree whose `user.name` or `user.email` is unset, or a `git` that cannot be run at all: **halt, report the reason the helper printed, and file nothing.** **Exit 4** is a tree that is not a git work tree at all, so no identity is owed, and **exit 5** is that tree with the checkout half unresolved too: on both, **file normally, with the person half absent rather than empty.** On exit 0 and 3 `PERSON=` is printed and you carry on; exit 2 is a usage error in your own call. The condition is evaluated in the helper and stated here once.

**What exit 1 rests on:** a tree that intends to commit and cannot is misconfigured, so its records reach no other checkout. A checkout registry that can name the person does not weaken that, because the halt protects the join from a record's author to the surrounding commits' author, not the record's text (`260904-1058_*_does-the-identity-helpers-exit-1-halt-survive-a-registry-that-can-name-the-person.md`, option 1).

**A helper that is not installed is a third branch and neither of those two.** `$FUSION_PLUGIN_ROOT` is the installed copy, pinned for the session, so a helper added between releases is absent there and a bare call is exit 127, which is none of the codes above. When the guard fails, **file with the person half absent as exit 4 does, and report that attribution was dropped because the helper was missing.** The record looks like exit 4's and the reason does not: exit 4 means no identity was owed, this means one was owed and could not be read. Do not halt, or an install one release behind stops every filing in the project.

**Which record kinds owe the field:** every kind whose template carries the line, and those are defects and decisions (the two formats above), review files (`rules/review-contract.md`, where it is a mandated header field), and work packages (`## Work packages`), whose `filed_by` `create` writes from `--actor` and this checkout's `PERSON=`: `user` on every route the user takes, the agent's name when an agent originates one. Binding decision: `260827-1756_*_which-record-kinds-owe-the-person-half-of-filed-by.md` (option 2).

**One precondition:** a person uses the same git identity on every machine. Registering the second checkout in `shared/checkouts/` lifts it for `bin/fusion-events presence`, which joins the two identities and counts that person once. It does not reach a work package's `claim.checkout_id`, which compares on the checkout identifier alone and so reads a person's second machine as another party. That residual is deliberate: a comparison through a pulled file would answer differently across a fetch, and the claim's whole job is to be read the same way in every checkout.

## Decision Record Template

File: `$OUT_DECISION/YYMMDD-HHMM-<topic>.md`, filed by `create --kind decision` once the body is written (`## Record filing`).

Body:

```markdown
# <one-line decision title — phrased as a question or choice point>

---
**Domain:** code | data
**Filed by:** <agent name or "user">, <person>
**Cross-references:** <basenames of related defects, analyses, plans, work packages or decision records. Cite them; never copy them here.>

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
```

No footer: a record gains its annotation line at the transition, per `## Inline State Tracking`. A stub left by the old placeholder footer stays as it stands.

**There is no `Status:` head field, and you do not write one.** It duplicated the marker and
drifted from it: 39 of 94 records carried a header naming a state their marker did not. `control.state` is the state and the
only source, as the marker was before the migration. A record written before the removal still carries the field; leave
it exactly as it stands, including when you transition it: those drifted headers are the
evidence the removal was decided on. Binding decision:
`260818-2212_*_should-the-decision-records-status-field-exist-at-all-now-that-the-circle-records-has-been-removed.md`.

## Rule-file provenance

Every file in a `rules/` directory opens with a `**Provenance:** <citation>` line in its
first ten lines, naming the record or commit that caused it to exist. The three
legitimate citation forms, the placement rule, what
`hooks/lib/__tests__/provenance-header-lint.test.ts` checks and what it cannot, and who
carries the obligation are authored in `rules/rule-file-provenance.md`. Read it before you
create or edit any file under `rules/`. `bin/fusion-rules` emits it to no agent: the one
agent whose routine work includes writing normative rule text is the `policy-curator`, and
`agents/policy-curator.md` reaches this definition by citing it at Setup rather than by emission.

## Session history

**The history store is closed to writes. No agent writes a session log, and there is no
`$OUT_HISTORY` key to write one with.** A run's account of itself is its report to whoever
dispatched it; a commit's account of itself is its commit message; and anything that has to
outlive either is a record in one of the stores that still takes writes: a defect, a decision,
a plan, a review or an analysis.

**The existing corpus is kept, not deleted.** Every `history/` directory in this workbench and in
`archive/` stays readable, and stays where it is until one sweep moves the corpus into `archive/`,
basenames unchanged (`260922-1059_*_is-the-frozen-history-store-audit-evidence-or-typed-record-history.md`).
A citation of a history file that already exists resolves exactly as it did (`## Filename Patterns`,
the markerless form `YYMMDD-HHMM-<topic>.md`), so the resolution lines already written into records
remain true. What no longer happens is a new file arriving in one of those directories.

**Coverage past the cut is nil, and a reader is told so rather than shown a zero.** A pass that
digests the corpus (`/fusion:cadence` is the one that does) states in its own output that the
session-log record ends at the cut, so an empty recent stretch reads as a store that closed and
never as a quiet week.

## Security

Never read or display `.secret` files. If secrets are needed, ask the user to provide them via environment variables.

## Commit lock

The commit-lock protocol (when it activates, mechanism, the `bin/fusion-commit-lock` subcommands, who acquires, tag conventions, failure modes) moved verbatim to `rules/commit-lock.md`.
