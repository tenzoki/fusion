# fusion-workbench Conventions

**Provenance:** No motivating record recoverable; introduced in `git:b05b423`.

Shared conventions for all agents operating on `fusion-workbench/`, and for the rule files those agents load. This file is emitted by `bin/fusion-rules` to every agent at Setup step 2; nothing is auto-loaded. Single source of truth for the workbench layout, the operative half of path resolution, the work-item grammar, the issue/planning and decision marker vocabularies, marker globs, filename patterns, issue and decision filing, inline tracking, timestamps, and the project's two language declarations.

**This document is the definition** of everything it still states in full. Topics that were once defined here now have their own authoring homes, each cited at the point where it left, and each emitted to the audience that actually applies it rather than to every agent:

| Topic | Authoring home | Emitted to |
|---|---|---|
| The resolver's name namespace, key table, and key-set derivation | `rules/workbench-path-resolution.md` | no agent: read when authoring a prompt or the resolver |
| Provenance headers on rule files | `rules/rule-file-provenance.md` | no agent: read when writing a rule file |
| The commit lock | `rules/commit-lock.md` | `orchestrator` |
| Which of a tracked workbench's root entries git holds | `rules/workbench-tracking.md` | no agent: read when writing a project's `.gitignore`, and cited by `/fusion:archive` |
| The language cascade's reasoning and edge semantics | `rules/project-language.md` | `editor` (its deliverable-language halt lives there); the operative core stays in `## Project language` below |

No agent prompt and no skill body may carry a competing or supplementary definition of where artifacts go: they resolve their paths at run time (see `## Path Resolution (Pfadauflösung)`) and cite whichever of these files owns the rule.

**Store-directory path literals.** `hooks/lib/__tests__/path-literal-lint.test.ts` forbids one in any `agents/*.md` or `skills/*/SKILL.md` outside `/fusion:setup` and `/fusion:migrate`; every other consumer resolves through `bin/fusion-paths`. The gate reads neither `rules/` nor `bin/`, so the files that *define* the stores are outside its reach rather than exempted by it. They are enumerated there as `DEFINITION_SITES` all the same: an enumeration somebody has to edit is the difference between a fourth definition site being decided and one merely slipping past a gate that never looked.

## fusion-workbench Layout

**There is one store per artifact kind, and they all live under `shared/`.** Everything the hooks and the `bin/` helpers read stays at the workbench root.

```
fusion-workbench/
├── shared/                            # every store, one per artifact kind
│   ├── backlog/                       # work items, one file per item — see ## Backlog entries
│   ├── planning/                      # specs and plans
│   ├── issues/
│   ├── decisions/
│   ├── analyses/
│   ├── reviews/                       # codereview + ontoreview, merged
│   ├── investigations/                # write-frozen — see below
│   ├── history/                       # write-frozen — see ## Session history
│   ├── consult/
│   ├── memos/
│   ├── forum/                         # messages left for another checkout
│   └── checkouts/                     # one entry per checkout — written by bin/fusion-checkout-name, nothing else
├── archive/                           # target of cleanup's archive step
├── stilwerk/                          # stylometric profiles
├── monitor                            # dashboard binary, copied at setup
├── .fusion-setup                      # setup marker (JSON: timestamp + plugin version)
├── .asset-provenance                  # what setup copied, checksummed at the moment of copying
├── .checkout-id                       # this checkout's identifier, minted once by bin/fusion-identity
│
│   # ── Root-anchored. The hooks, the monitor and the bin/ helpers read these ──
│   # ── HERE, at fixed root-relative paths. Do not move them.               ──
├── orchestrator-events.jsonl           # bin/monitor, bin/fusion-events (hooks/events-query.ts), hooks/lib/orchestrator-events.ts, bin/fusion-commit-lock, hooks/lib/staging-drift.ts
├── .guard-state/                       # bin/monitor, hooks/lib/events.ts, hooks/lib/guard-state-file.ts, hooks/lib/staging-drift.ts
├── .commit-lock/                       # bin/fusion-commit-lock, hooks/lib/staging-drift.ts (created and removed per commit)
├── .cadence-anchors                    # bin/fusion-cadence-anchor
└── .session-marker                     # bin/fusion-session-mark, hooks/lib/staging-drift.ts
```

**Two legacy stores are absent from this tree on purpose.** A workbench may carry `stashes/`, written by the stash skills removed on 2026-08-15, and `.migration-v2-backup/`, left by the retired `/fusion:migrate-workbench-v2` (fusion v2.3–v2.5) as its rollback copy. Nothing shipped writes to either any more: a line in the tree above would read as a store the plugin still creates. Frozen content is not live content, so live-tree consumers keep it out. `skills/log-activity/SKILL.md` and `skills/archive/SKILL.md` exclude both by path. `/fusion:setup` names no exclusion at all: it bounds its probe to the two live trees (`skills/setup/SKILL.md:45`), leaving every frozen store outside by construction. Do not drop the three that remain: `skills/setup/SKILL.md:38` records the cost, a Setup that refuses permanently and routes to a migration with nothing to do.

**The root-anchored surfaces are not negotiable.** Each is bound to a fixed root-relative path by every consumer named beside it in the tree, and none of those consumers has a fallback path: relocating one into `shared/` breaks it silently. The column names a consumer that only *names* the path, in an exclusion or classification list, next to one that reads the file: what breaks on a move is the same dependency either way.

They are root-anchored because none of them belongs to a unit of work. `orchestrator-events.jsonl` is session state, and a session may span work items. `.guard-state/` counters are project-wide. `.commit-lock/` guards the project's git index, which no single Circle owns. `.session-marker` answers "is an orchestrator already running in this project", which is meaningless scoped to a Circle. This placement is what makes the guarantee "hooks behave unchanged across the layout" structural rather than promised.

The list is exhaustive as written, and it is a list rather than a count on purpose: a count goes stale on the next helper that needs project-wide state, and this one already had. When a `bin/` helper or a hook adds a root-anchored surface, it lands in this tree and in the record-or-live-state split in `rules/workbench-tracking.md`, both in the same commit: this document is the definition, and an incomplete tree invites exactly the reasoning-by-omission it exists to prevent.

### Which of them a tracked workbench tracks

Whether a consuming project tracks its workbench at all is that project's decision: fusion ships no `.gitignore` rule for it. Which of the root entries above a project that *does* track it should commit, which it should not, and what preserves the evidence in the ones it does not, are authored in `rules/workbench-tracking.md`, which `bin/fusion-rules` emits to **no agent**: its two readers are a human writing a project's `.gitignore` and `/fusion:archive`.

**One kind, one store, and no placement decision to make.** `bin/fusion-paths` names the store for a kind and there is no second candidate, so an artifact's home follows from what it is. What a citation carries is the record's basename and never its store, which is what lets a record be moved by an archive sweep without breaking a pointer to it (`## Filename Patterns`). Reach is cited, never copied: one record, one location, many citations.

`checkouts/` holds one file per checkout, written by `bin/fusion-checkout-name` and by nothing else; that script's header is the authoritative documentation for the entry grammar, and this document does not restate it. `investigations/` is **write-frozen** since the `investigator` fold of 2026-08-15: the store and its reports stay, nothing writes there any more, and a failure analysis goes to `$OUT_ANALYSIS` like every other analysis.

**The review types collapse into one `reviews/`.** codereview and ontoreview differ by sender, not by kind. The sender is in the filename (`YYMMDD-HHMM-<sender>-<topic>.md`) and in the document header, so they do not earn a directory each.

`fusion-workbench/.checkout-id` holds eight lowercase hex characters naming **this checkout** and nothing else: `bin/fusion-identity` mints it on first read and never again, and it is what a work item's `**Claim:**` names, beside the person. It is class L in `rules/workbench-tracking.md` and never travels, for the reason the field exists at all: a checkout that pulled another checkout's copy would be indistinguishable from it.

`fusion-workbench/.asset-provenance` records what `/fusion:setup` copied into the workbench: one line per asset in the shape `shasum -a 256` prints. The checksum is taken at the moment of copying, then comes the asset's path relative to the workbench. It is the third input that makes "is this project's copy stale, or has the project adapted it" decidable, which the two files alone are not: one difference, two causes. `/fusion:setup` is its only writer and its only reader, and an asset with no line is one the record says nothing about rather than one it classifies.

The `fusion-workbench/` is anchored to the directory where setup was run: the working directory `pwd` reports, not necessarily the git toplevel. A subfolder may legitimately have its own independent workbench, separate from any workbench at a parent level; the plugin's hooks resolve `process.cwd()` directly and follow whichever directory is active.

Within a given working directory there is exactly **one** `fusion-workbench/`. Never create a nested duplicate inside it, and never split one unit of work's artifacts across multiple workbenches in the same tree: they all live in the single workbench at the active `pwd`.

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

**And what a consumer does with a key it cannot use: it stops and names that key.** An empty or unset value is never a default, a fallback, or an empty result: nothing is scanned through it, nothing written through it, and the run halts naming the key. This is the consumer-side end of the exit-4 rule under *Failure behaviour*, not a second rule beside it: the resolver refuses to emit `KEY=` for a reason that holds just as well one step later, where a held value is interpolated into a shell block, a glob or a path join and can go missing long after the resolver exited 0. An empty expansion is silent, so a consumer that does not check reports it as a finding.

`fusion-rules` still takes an **agent** name only. The two helpers stand side by side in the same step with different namespaces, and that is deliberate: `fusion-rules` maps an agent to rule-file patterns, which is an authored fact about an agent and has no meaning for a skill. Their symmetry is the interface (a required name argument, output on stdout, the shared `0/1/2` exit core), not the argument domain.

### Contract

Signature `fusion-paths <name>`. Output: one `KEY=value` line per emitted key on stdout. Paths are workbench-relative except `WORKBENCH` itself, which is absolute. Multi-value keys are space-separated. The resolver takes no second argument and reads no workbench state: one kind has one store, so an `OUT_*` key and its matching `SCAN_*` key name the same directory and nothing selects between candidates.

#### Exit codes

| Code | Meaning | Shared with `bin/fusion-rules`? |
|---|---|---|
| 0 | Success | yes |
| 1 | Usage error, including no workbench found above `pwd` | yes |
| 2 | Unknown name: no such agent and no such skill | yes |
| 4 | Internal error: a prompt names a key the resolver cannot order or value, or one name is both an agent and a skill (a **fusion bug**) | no |

**There is no exit 3.** It said `.active-circle` was corrupt or orphaned, and it went with the pointer.

The `0/1/2` core is shared with `bin/fusion-rules`; 4 is this resolver's own. `bin/fusion-rules` still exits 3, for a malformed `rules/context-manifest.yaml`: read exit 3 against the helper that returned it, and never against this table.

### Two invariants

1. **Every `OUT_*` points into `shared/`, always.** There is no state the resolver reads and no condition under which a key resolves elsewhere, so a consumer needs no branch and there is no "nothing active" error to handle.
2. **Every `SCAN_*` names one store, the same one its `OUT_*` names.** A scan that misses a store is the failure this invariant used to guard against when there were two; with one, a `SCAN_*` value is a single directory and a consumer that searches it has searched the kind.

   There is deliberately no `SCAN_MEMOS`. `memos/` is a store like the others, but no agent reads it: a memo is written for the user, not for an agent. A key is emitted when a prompt reads the kind, not because the symmetry of the table would look better with it.

### Failure behaviour

A key the resolver cannot value exits 4 rather than emitting `KEY=`. An empty right-hand side would send an agent's writes to the workbench root, which is the silent-wrong-place failure this refusal exists to prevent (`HYG-NO-SILENT-FAIL`).

**Exit 4 is ours, not the user's.** It is not fixable from the workbench at all, so a prompt that reports it as something the user should go and repair sends them hunting a fault that is not theirs.

## Issues vs Decisions — when to use which

A **defect** belongs in `issues/`, a **decision** in `decisions/`, and `## Record filing` below says when each is owed. What separates them is the resolution: "go fix it" is a defect, "decide and record" is a decision. A defect resolves to a fix in the tree, verifiable by reading a diff; a decision resolves to a recorded answer and, separately, to the implementation that realises it, which is why the two carry different marker vocabularies (`## State Markers — issues and planning`, `## State Markers — decisions`).

- Defects: "term mapping is missing for entity X"; "test failure in pkg/foo"; "manifest doesn't validate".
- Decisions: "which IdP for v1?"; "should we adopt approach X or Y?"; "what is the cut decision for the platform?".

When in doubt, file as an issue and reclassify in the next reconciliation pass: that round-trip is cheap, the misfile cost is low.

A **work item** is neither: it is the work itself, not a statement about it. "Do this" is a work item, and `## Backlog entries` below is its grammar.

This three-way distinction is about **what kind of thing** an artifact is, and the kind decides the store on its own.

## Backlog entries — work items

A **work item** is one unit of work: something somebody is going to do, or has decided not to. It lives in `shared/backlog/` (`$OUT_BACKLOG`), one file per item, named `YYMMDD-HHMM-<slug>.md` with **no marker on the filename**. One file per item rather than one list file, because two checkouts adding work at the same time then merge with no conflict. No marker, because an item's state is a head field: a state change edits the file instead of renaming it, so every citation of an item stays valid for the item's whole life.

```markdown
# <one-line directive>

---
**Domain:** code | data
**Status:** open | claimed | done | dropped
**Claim:** <8 hex> — <person>, YYMMDD-HHMM
**Depends-on:** <basename>, <basename>
**Filed by:** user, <person>

---

## Directive

<One paragraph: what this item aims for, and how a reader would know it was reached.>
```

`**Claim:**` and `**Depends-on:**` are **absent** when there is nothing to say, never present and empty. Every other field is always written.

**`**Status:**` takes four values and there is no fifth.**

| Value | Meaning | `**Claim:**` |
|---|---|---|
| `open` | nobody is working on it | absent |
| `claimed` | a checkout is working on it now | present, naming that checkout |
| `done` | the work landed | stays, naming the checkout that did it |
| `dropped` | no longer live; the body says why, citing the item that replaced it or the reason | stays if one stood |

It is none of the three marker vocabularies this project already carries, and the differences are the reason. `claimed` is the value none of them has, and it is the one this store exists to carry: it says *which checkout*, which is what stops two people doing one job. Nothing here splits "answered" from "realised" the way a decision's `_a_` and `_i_` do, because an item has no such seam: it is done when the work landed. And `dropped` covers in one value what an issue's `_c_` and `_d_` and the six-marker Circle vocabulary's `_c_`, `_b_`, `_s_` and `_d_` distinguished by marker, because the body says which of them happened and the marker never did more than abbreviate it. The Circle vocabulary's remaining distinction, closed-coherent against bounded closure, rested on a Coherence verdict that no longer exists.

**`done` and `dropped` are terminal.** Reopening one is filing a new item that cites it, never an edit back to `open`. The general rule is `## Terminal states are history` below.

**`**Claim:**` names the checkout, and the checkout is the whole key.** `<8 hex>` is what `bin/fusion-identity` prints as `CHECKOUT=`, and the person half beside it is its `PERSON=` line, read the way `### Who filed it` reads it and absent rather than empty when the helper could not print one. Two checkouts of one person carry one git identity, so the person alone cannot answer whose claim this is; the checkout can, and comparing a claim against this checkout is an equality on those eight characters. **When the checkout half cannot be read at all** (`bin/fusion-identity` exits 3 or 5) the field is not written and the item is not claimed: a claim that names no checkout keys nothing, and writing one would say the item is held while leaving no way to say by whom.

**A takeover overwrites the field.** The item ends up naming one holder, which is what a reader and a helper both need; who held it before is in the commit that took it, which is where this project keeps the per-change record (`## Record filing`). The collision is detected and not prevented: two checkouts that both pull, both see no claim and both claim will conflict on that one line at the next merge, and the one who loses the race picks another item. Nothing here reserves an item ahead of the write, and no field value changes that.

**`**Depends-on:**` is a comma-separated list of item basenames** (`YYMMDD-HHMM-<slug>.md`, the same form a citation of the item takes). It carries only edges the user has confirmed. A helper may read the whole store and **report** an order over those edges, with cycles named; that report is a report, and the user overrides it wherever he wants to. No agent asserts a ranking, and there is no marker for one. Binding decision: `260909-1808_*_may-a-helper-compute-an-order-over-work-items-after-the-portfolio-layer-goes.md` (option 3).

**Two bounds, and only the first survived the cut.** **No agent originates a work item**: the user files, by hand or through `/fusion:memo`; a defect an agent finds is an issue, a choice point a decision record. The second bound, that the backlog is not the work queue, is gone with the queue it distinguished the store from.

**Maintenance is the orchestrator's, at the user's word, with no agent dispatch.** Splitting one item's work across several, merging several statements of one job into one, and moving an item to `done` or `dropped` are edits somebody performs once the user has said so; the user is confirming each one anyway, and dispatching an agent to perform a confirmed edit costs a dispatch to save nothing. None of the operations adds work to the store, which is what keeps the no-agent-originates bound intact across them: the text a merge writes consolidates items already filed.

## Timestamps

Always obtain `YYMMDD-HHMM` from `date +%y%m%d-%H%M`. LLMs have no clock. Never guess or estimate the time.

## Project language

**The surface decides** — every piece of output falls into exactly one of four cases:

- Output the user reads in the terminal (gate prompts, `AskUserQuestion` text, status reports, chat replies): the **chat language**.
- Output that persists as a file **for the project's own use** (specs, plans, records, histories, reviews, analyses, memos, work items — and the profile-exempt persisted surfaces too: dashboard lines, commit messages, monitor strings): the **artifact language**.
- Output that persists **for a reader outside the project** (a customer deliverable): the language **the dispatching task names** — no default, no fallback; the `editor` halts when the task names none.
- Text on an **exempt surface is English**, whatever either declaration says. Universal: code, code comments, hook and CLI operator strings. Conditional: **whatever a project ships onward to readers of unknown language** — a rule corpus, a plugin, a library. A project that ships nothing has no surface in this group; fusion's own repository is divided by the criterion rather than exempted whole: what it ships (rules, prompts, skill bodies, READMEs, docs) is English, its workbench follows its declarations.

A project declares its languages in `CLAUDE.md`: `**Language:** <en|de>` (chat) and `**Artifact language:** <en|de>` (artifacts); a project sharing one language declares only the first. **The fallback chain has no special cases:** `**Artifact language:**` absent, unreadable or invalid means not declared, and `**Language:**` then governs both surfaces; `**Language:**` not declared, by the same three-way test, means `en`. Both fallbacks are silent.

Head labels defined in a shipped template (`**Decidability:**`, `**Domain:**`) stay English in every project; the artifact body under them follows the artifact language. Existing artifacts are not translated.

The reasoning, the stylometric-profile resolution (including the per-family missing-variant fallback and the deliverable-profile case) and the settled edge readings are authored in `rules/project-language.md`, emitted to the `editor`; decision `260827-1056_*_which-parts-of-the-language-and-backlog-rules-does-every-dispatch-still-carry.md`, a record in fusion's own workbench, fixed this partition and what the core above must carry.

## Filename Patterns

Patterns attach to the **kind of artifact**, and the kind decides the store too.

| Artifact kind | Written to | Pattern | State marker |
|---|---|---|---|
| Work item | `$OUT_BACKLOG` | `YYMMDD-HHMM-<slug>.md` | no: the state is the `**Status:**` head field |
| Spec / plan | `$OUT_PLAN` | `YYMMDD-HHMM_S_<topic>.md` | yes (issues/planning vocabulary) |
| Defect | `$OUT_ISSUE` | `YYMMDD-HHMM_S_<topic>.md` | yes (issues/planning vocabulary) |
| Decision record | `$OUT_DECISION` | `YYMMDD-HHMM_S_<topic>.md` | yes (decisions vocabulary, richer set) |
| Review (code / onto) | `$OUT_REVIEW` | `YYMMDD-HHMM-<sender>-<topic>.md` | no |
| Analysis | `$OUT_ANALYSIS` | `YYMMDD-HHMM-<topic>.md` | no |
| Consultation | `$OUT_CONSULT` | `YYMMDD-HHMM-<topic>.md` | no |
| Memo | `$OUT_MEMO` | `memos-<checkout>.md` / `tasks-<checkout>.md` | no |
| Forum entry | `$OUT_FORUM` | `YYMMDD-HHMM-<checkout>-<slug>.md` | no |
| Cadence digest | `$OUT_MEMO` | `cadence-<checkout>.md` | no |

`<sender>` on a review file is `coderev` or `ontorev`. It is what distinguishes the two review kinds now that they share one `reviews/` directory: it is mandatory, and the document header repeats it. Older files may carry a third sender, `conceptrev`, retired with its agent on 2026-08-15.

**Cite a record by its storeless basename with the state marker wildcarded**, `YYMMDD-HHMM_*_<topic>.md`, so the citation survives every marker move and every archive sweep. **A citation carrying a store segment is a violation the gates report** (`shared/<store>/` in front of a record): the segment is what a sweep moves, so a citation spelling it dies at the sweep. A markerless artifact (work item, history, review, analysis, consultation, forum entry) is cited as `YYMMDD-HHMM-<topic>.md`, which is the same form a work item's `**Depends-on:**` entries take and needs no grammar of its own. The reader resolves either form by one workbench-wide lookup (`find "$WORKBENCH" -name '<basename>'`, the wildcard as a glob), which is correct because no two stamped artifacts share a marker-normalised basename: measured over the live tree and `archive/` at commit `4b8f769d` (2 235 basenames, 0 collisions) and re-taken on every run by `hooks/lib/__tests__/workbench-citation-lint.test.ts`. **A record held in another project's workbench is cited `foreign:<project>:<citation>`**, both leading segments literal and required, as in `foreign:menue-rs:260905-2054-reconciliation.md`; the qualifier is read before any lookup, so such a token is reported neither dangling nor store-prefixed. It is supplied by the writer and never inferred: nothing separates a genuine foreign record from a local one mislabelled, so the form is a claim you are making rather than a fact a gate checked. **A bare stamp is not a citation**: 111 of the 545 stamps in fusion's own corpus are carried by more than one file, measured 260824 over 876 records. **No pattern above changes.** In living text (prompts, rules, docs), which outlives its target, cite a rule file by heading anchor (`file.md` `## Section`), never by line number: an edit above the line moves it silently, and no gate resolves `path:N`. **A resolution line takes the same anchor**, never `:line` — `Resolved:` on an issue and the five decision lines `## Inline State Tracking` spells. `path:line` was mandated here until 2026-09-05, on the argument that a resolution line is point-in-time and carried by its commit. That argument is real but narrow: it holds for a target frozen at the citing commit and failed for the one these lines then most often named, a session history the session went on appending to after the citation was written. The corpus said the same — measured over the live tree on 2026-09-05, 1 of 30 `Answered:` lines wrote `path:line` and 11 wrote the anchor — so the rule moved on evidence, not on taste (`260905-1228_*_does-a-resolution-line-cite-path-line-or-a-heading-anchor.md`). The commit still carries the moment; what is given up is precision inside a file. When the target is a record the path half is its storeless basename (a rule file, a source file or a commit stays a path), and a commit hash takes no locator.

**A record somebody deliberately deletes leaves no file and no marker, so the annotation sits on the surviving references.** Deletion is not archival: an archive sweep moves a record and it stays citable at its new path, while deletion preserves nothing and there is no corrected path to write. Whoever deletes a record therefore annotates every citation of it that survives elsewhere, **replacing** the dead citation rather than standing beside it, since a path that resolves to nothing is indistinguishable from an accident whatever sentence sits next to it. The identity is carried as the stamp and the slug in separate spans, and no basename is left behind for a lookup to fail on:

```
Deliberately deleted YYMMDD: `<stamp>`, `<slug>`.
```

A trailing clause after the full stop is free. **A reader recognises the annotation by the literal opening `Deliberately deleted `**, and that is the whole test: an ordinary dead citation carries no such prefix, and a repair that corrects a path never writes one. The obligation rides on the care of whoever deletes, which is weaker than every other rule here and is stated rather than papered over. Binding decision: `260805-1548_*_wie-soll-ein-circle-verschwinden-duerfen-den-jemand-absichtlich-loescht.md`.

The two kinds sharing `$OUT_MEMO` differ in write semantics: the memo and task files are **append** logs (`/fusion:memo` adds to them), while the cadence digest is **overwritten** on each `/fusion:cadence` run (it is a fresh snapshot of the work cadence, not a history of its own runs).

**`<checkout>` is the eight hex characters `bin/fusion-identity` prints as `CHECKOUT=`, and never an OS login.** It keys the four personal logs: those three files, and `activity-log-<checkout>.md`, which sits in the **project root** rather than the workbench and stays there — what was wrong was the key, and a root file is outside the four-class partition anyway, so it takes its one-writer property from the key alone. A consumer runs `I="$FUSION_PLUGIN_ROOT/bin/fusion-identity"; [ -x "$I" ] && "$I" || true` and reads the `CHECKOUT=` line, which is the same value SessionStart exported as `$FUSION_CHECKOUT`; the helper's stderr is not discarded, because the reason for a half it could not read is worth more to a human than its absence. No line means no value, and the resolver never substitutes one. That reaches the activity log alone — `/fusion:memo` and `/fusion:cadence` both halt earlier when there is no workbench — and the log is then written unsuffixed as `activity-log.md`, the run saying so: a project with no workbench has no multi-checkout arrangement to key for. **Two checkouts carrying one `$USER` collide on nothing, because no filename reads `$USER`.** Why this key and not the person is argued in `bin/fusion-identity`'s own header, `## What the identifier keys, and why the person does not`.

**A file under the old login-keyed name is adopted, never orphaned.** The skill that writes one renames `<prefix>-$USER.md` to `<prefix>-<checkout>.md` on its next run — when this checkout's `$USER` is the suffix, since that is what makes the file this checkout's, and nothing already stands at the new name — and reports the rename. In every other case it leaves the file where it is and names it in the report. Nothing is merged and nothing is deleted. A legacy file that really did have two writers carries both people's lines and the rename does not separate them: no line in these files records who wrote it, so nothing can. Until the activity log's own adoption run, `/fusion:cadence` reports that source absent even with the legacy file in front of it: cadence is read-only on the activity log and so cannot be the party that adopts it.

## State Markers — issues and planning

Defect files and spec/plan files carry a state marker: `YYMMDD-HHMM_S_<topic>.md`.

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
| `_a_` | Answered: a recorded answer exists somewhere on disk (typically an analysis, a plan, a commit message, or the decision record itself). The file body MUST cite the answer's location and name who ruled: `Answered: <citation> — <one-line summary>; ruled by <agent name or "user">, <person>`. Both halves take the forms `## Filename Patterns` and `## Inline State Tracking` define. The decision is not yet realised in code or data. `_a_` does not assert that realising it is still possible: when the subject was removed before anyone built against it, the body gains a `Retired:` line and the marker does not move. |
| `_i_` | Implemented: the answer has been realised, and code or data on disk now reflects the decision. The file body MUST cite the implementation with `Implemented: <commit hash> or <citation> — <one-line summary>`. This is the terminal state for decisions whose realisation is verifiable. `_i_` does not assert that the implementation still exists: when it is later removed and no decision overrode it, the body gains a `Retired:` line and the marker does not move, so the marker alone cannot tell a live implementation from a retired one. |
| `_d_` | Deferred: the user explicitly pushed the decision out (to v1.x, to a future workbench, etc.). The file body MUST cite the deferral target and name who ruled, in the form `## Inline State Tracking` spells. |
| `_s_` | Superseded: a later decision has overridden this one. The file body MUST cite the superseding decision file: `Superseded by: <citation> — <reason>`. |

**Worked transitions are authored in `rules/decision-record-examples.md`** (emitted to the transition agents — see `bin/fusion-rules` block 1b2; decision `260827-0830_*_do-the-decision-record-worked-examples-stay-on-the-always-on-floor.md` in the shared store); each rename's annotation form is `### Decision files` below, and a superseding record is cited where it lives, never copied next to the superseded one.

**`_i_` and `_s_` are terminal.** Do not rename them back to `_o_` or `_a_`. If an implemented decision needs revisiting, file a NEW decision, which may then supersede the `_i_` one: append `Superseded by:` and rename `_i_` → `_s_` (the one allowed terminal-to-terminal transition).

**Grounding-Stand vs Grounding-Historie:**

The marker vocabulary mirrors foundation_V3 §1.2's two-layer Grounding model:

- `_o_` (open) and `_a_` (answered, awaiting realisation) are **Grounding-Stand**: the current best-of-knowledge the project is working with.
- `_i_` (implemented), `_s_` (superseded), and `_d_` (deferred) are **Grounding-Historie**: preserved record of what was decided, including elements that have been replaced or postponed.

Each decision store holds both layers; the marker carries the layer information. Reconciliation passes that "list active Grounding" filter on `_o_` + `_a_`; passes that "show project history" include all five. A scan for active Grounding must cover every path in `$SCAN_DECISIONS`, not just the Circle's.

## Marker globs

The delimiter is an underscore, not brackets, and that choice is what keeps the marker cheap to read as a glob. `[` and `]` are shell-glob metacharacters: a marker written in bracket form inside a glob is silently a *character class* matching the single marker letter, so a glob written with a bracketed `o` resolves to a one-character class, matches the empty set, and under `bash` fails *silently*. The unmatched pattern expands to itself, the customary `[ -e "$f" ] || continue` guard drops it, and the count comes back `0` on a workbench full of records (`HYG-NO-SILENT-FAIL`). That trap was hit five times in a single session. The underscore is inert in both glob and regex: `_o_spec-foo.md` matches literally, with no escaping and no character-class surprise.

Two forms are correct. Use them verbatim:

| Purpose | Form |
|---|---|
| Records in one state | `"$WORKBENCH/$SCAN_ISSUES"/*_o_*.md` |
| All records, marker read from the name | `"$WORKBENCH/$SCAN_ISSUES"/*.md`, then `basename` → `sed -nE 's/^[0-9]{6}-[0-9]{4}_([a-z])_.*/\1/p'` |

The second form is preferred wherever the task is counting or enumerating: it reads the marker as data rather than requiring one glob per state.

`find` needs no special handling: `find "$WORKBENCH" -name '*_o_*.md'` is correct as written. The underscore is not a metacharacter to `find`'s `-name` matcher any more than it is to the shell.

This applies to every marker in both vocabularies (`_o_`, `_p_`, `_c_`, `_d_` on issues and plans; `_o_`, `_a_`, `_i_`, `_s_`, `_d_` on decisions) anywhere a filename carrying one is matched by a glob, in any agent prompt or skill body. A work item carries no marker at all, so none of this reaches it: enumerate the store with `*.md` and read `**Status:**` out of the file.

**And a record that states something *about* a citation names file and line, or fences the verbatim form.** A pointer and a statement about one are the same characters, and no reader (human or gate) can tell them apart; star a pointer and leave the letter on a marker that is being *named*, which leaves the second spelling an address that dies at its target's next transition. So do not spell it: name the citing line (`260812-1720_*_the-reference-resolution-lint-does-not-scan-the-workbench-where-citations-are-densest.md:24`) and let the reader open it. A fenced code block is the exception, for where the spelling itself is the datum (a verbatim transcript), and the fence covers the verdicts a **lookup** decides: inside one the gate stops asking whether the record exists, resolves to more than one, or has moved to another marker. It does not cover **`store-prefixed`**, which is read off the token's shape before anything is looked up, so a store segment inside a fence is still reported (`git:ff52dd4a`). The fence does keep the sweep off it, so an exhibit is never machine-rewritten; where the store has to be named, name it in words rather than spelling it into the token. Binding: `260820-0530_*_twenty-six-citations-in-the-corpus-are-statements-rather-than-pointers-and-no-exemption-expresses-that.md`.

## Terminal states are history

`_c_` and `_d_` on an issue or a plan, `_i_`, `_s_` and `_d_` on a decision, `done` and `dropped` on a work item: these are **terminal**, and a rename or an edit back to a live state is disallowed. Where continuation is needed, file a new record that cites the terminal one.

**A terminal record is read as evidence and never reconciled in place.** No step mark, ticked criterion or header change is written into it after the transition, and an unticked box there is not outstanding work. This is what makes a reconciliation pass' scan finite: it opens the live records, and a terminal one tells it nothing it may act on. Binding decision: `260824-2013_*_do-archive-and-terminal-circles-stores-enter-any-scan-set-or-is-the-exclusion-written-down.md` (option 5).

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
Answered: <citation> — <one-line summary>; ruled by <agent name or "user">, <person>
```
(rename `_o_` → `_a_`)

```
---
Implemented: <commit hash> or <citation> — <one-line summary>
```
(rename `_a_` → `_i_`, or `_o_` → `_i_` if the implementation skipped the recorded-answer step)

```
---
Deferred: <target> — <one-line reason>; ruled by <agent name or "user">, <person>
```
(rename to `_d_`)

```
---
Superseded by: <citation of the new decision> — <reason>
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

**Every citation above is the anchor form**, not `path:line` — `## Filename Patterns` states it and says why it moved.

**Two of the five lines name who ruled, and three do not.** `Answered:` and `Deferred:` record an act only a person performs, and nothing on disk confirms one, so the line names the party and a reader has something to check instead of nothing. `Implemented:`, `Superseded by:` and `Retired:` each cite something a reader verifies without trusting anybody — code at a commit, a record carrying its own `**Filed by:**` and its own ruler, the plan, commit or gate that removed the subject — so a name there would restate an attribution that already exists or attach one to a fact needing none. `<agent name or "user">, <person>` is `**Filed by:**`'s own shape, and its person half is read the same way: `### Who filed it` governs it unchanged, halt and both file-anyway branches included. Both parties appear because the writer is not the ruler — the orchestrator writes the line and the user rules (`260905-1042_*_may-a-dispatched-agent-perform-the-open-to-answered-transition-at-all-and-under-which-bound.md`). **Records written before this rule stand as they are, and no gate checks the field**: an absent `ruled by` means the record predates the rule, never that nobody ruled (`260905-1228_*_does-an-answered-record-carry-who-ruled-now-that-only-the-orchestrator-may-transition-it.md`).

### When to update

- After completing each plan step, not just at session end.
- After resolving an issue, before moving to the next task.
- After answering or implementing a decision, before moving to the next task.
- When a review confirms a plan step, issue, or decision is done — the reviewing agent marks it.
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

**The split is over statements, not over events**, which is what makes it disjoint: one statement falls in exactly one row, while one event may raise several. A review pass that finds a defect owes both a review and an issue, which is two answers rather than one filed twice; two files carrying the *same* statement is the duplication to refuse. The sixth branch completes the split and is the common one: no condition held, so nothing is filed. Binding: `260909-1615_*_spec-cut-fusion-to-a-working-minimum.md` `### C5`.

**Where it goes** is resolved for you by `bin/fusion-paths`, and there is no judgment left in it: one kind has one store, and a store whose key the resolver did not emit for you is a kind you do not write. **Reach is cited, never copied.** Where a record binds work filed elsewhere, the citing record names it by basename in its `**Cross-references:**` header. Do not copy it, do not move it, do not file a duplicate: one record, one location, many citations.

**Before writing, list what is already there.** One `ls` over the open (`_o_`) record names in every `$SCAN_ISSUES` store — names only, never bodies, because a costlier check gets skipped. A hit is a slug naming the same file or mechanism as yours; append one line to that record, `Also seen: YYMMDD-HHMM by <agent> — <one clause>`, write no second file and move no marker. In doubt, write the new record: a duplicate costs one merge, an unfiled defect costs the defect.

**A record that is owed is its own file.** Never put an issue or a decision inside a plan, a review, an analysis, a code comment or chat output. Embedded items get lost.

**An issue states the defect, the evidence path, and the acceptance test — then stops.** Later passes re-read every record many times; narrative past the close-condition is recurring cost. Counts in it follow `rules/critical-stance.md` §5.

**Filename:** `YYMMDD-HHMM_o_<topic>.md` (always `_o_` on creation, for issues and decisions alike).

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

**Which record kinds owe the field:** every kind whose template carries the line, and those are defects and decisions (the two formats above), and review files (`rules/review-contract.md`, where it is a mandated header field). Binding decision: `260827-1756_*_which-record-kinds-owe-the-person-half-of-filed-by.md` (option 2).

**One precondition:** a person uses the same git identity on every machine. Registering the second checkout in `shared/checkouts/` lifts it for `bin/fusion-events presence`, which joins the two identities and counts that person once. It does not reach a work item's `**Claim:**`, which compares on the checkout identifier alone and so reads a person's second machine as another party. That residual is deliberate: a comparison through a pulled file would answer differently across a fetch, and the claim's whole job is to be read the same way in every checkout.

## Decision Record Template

File: `$OUT_DECISION/YYMMDD-HHMM_o_<topic>.md`

Body:

```markdown
# <one-line decision title — phrased as a question or choice point>

---
**Domain:** code | data
**Filed by:** <agent name or "user">, <person>
**Cross-references:** <basenames of related defects, analyses, plans, work items or decision records. Cite them; never copy them here.>

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
drifted from it: 39 of 94 records carried a header naming a state their marker did not, a
ratio that held six days across three hand corrections. The marker on the filename is the
state and the only source. A record written before the removal still carries the field; leave
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
agent whose routine work includes writing normative rule text is the `curator`, and
`agents/curator.md` reaches this definition by citing it at Setup rather than by emission.

## Session history

**The history store is closed to writes. No agent writes a session log, and there is no
`$OUT_HISTORY` key to write one with.** A run's account of itself is its report to whoever
dispatched it; a commit's account of itself is its commit message; and anything that has to
outlive either is a record in one of the stores that still takes writes — a defect, a decision,
a plan, a review or an analysis.

**The existing corpus is kept, not deleted.** Every `history/` directory in this workbench and in
`archive/` stays where it is and stays readable. A citation of a history file that already exists
resolves exactly as it did (`## Filename Patterns`, the markerless form `YYMMDD-HHMM-<topic>.md`),
so the resolution lines already written into records remain true. What no longer happens is a new
file arriving in one of those directories.

**Coverage past the cut is nil, and a reader is told so rather than shown a zero.** A pass that
digests the corpus — `/fusion:cadence` is the one that does — states in its own output that the
session-log record ends at the cut, so an empty recent stretch reads as a store that closed and
never as a quiet week.

## Security

Never read or display `.secret` files. If secrets are needed, ask the user to provide them via environment variables.

## Commit lock

The commit-lock protocol (when it activates, mechanism, the `bin/fusion-commit-lock` subcommands, who acquires, tag conventions, failure modes) moved verbatim to `rules/commit-lock.md`, which `bin/fusion-rules` emits to `orchestrator` only.
