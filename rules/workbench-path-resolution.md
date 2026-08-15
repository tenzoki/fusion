# Path Resolution — the name namespace, the key table, and how a key set is derived

**Provenance:** circles/260801-1244-guard-rules-write

**This document is the definition** for everything below: which name a consumer passes to
`bin/fusion-paths`, what every emitted key means, and why the key set is read out of the
prompt rather than declared anywhere. No other file may carry a competing or supplementary
definition of these three things.

It is the authoring half of `rules/fusion-workbench-conventions.md` `## Path Resolution`,
which keeps the operative half — that the resolver is the single resolution point, that
the call belongs in Setup step 2, the signature, the exit codes, the two invariants, and
the failure behaviour. The split is by ADDRESSEE. An agent resolves its paths, reads
`KEY=value`, and needs none of what follows: it never chooses a key, because the keys it
gets are the ones its own prompt already names. What follows is for whoever writes or
edits a consumer prompt, or changes `bin/fusion-paths` itself.

That is why `bin/fusion-rules` emits this file to no agent. It is reached by the pointer in
the conventions file, and cited by `CLAUDE.md`'s layout table; `bin/fusion-paths` itself
cites only the conventions file.

## The name namespace

`<name>` is an **agent** (`agents/<name>.md`) or a **skill** (`skills/<name>/SKILL.md`). The two share one flat namespace, and **every consumer asks under its own name**: `fusion-paths coder`, `fusion-paths memo`, `fusion-paths log-activity`.

A skill is its own consumer, not a guest in an agent's key set. The alternative — a skill resolving under whichever agent hosts its session — does not work, and not marginally: `/fusion:cadence` writes its digest to `$OUT_MEMO` and reads `$SCAN_HISTORY`, and no agent's prompt names `$OUT_MEMO` at all — a memo is written for the user, not for an agent. There is no agent name that resolves that skill's write. Making one work would mean adding the key to an agent whose prompt performs no such write, which breaks the rule under *Emission is per-consumer* below and turns a key set into "whatever some skill in this session might want".

A name is a lowercase slug. It resolves to exactly one prompt file; a name that is both an agent and a skill is an authoring error and exits 4, because there is no basis to prefer one prompt's key set over the other's. No collision exists today.

**One exception, and it is not a hedge:** `/fusion:setup` passes `orchestrator`. It is the orchestrator's Setup procedure factored into a skill, and the values it resolves are held by the orchestrator for the whole session — including steps that live in `agents/orchestrator.md`. The consumer there really is the orchestrator.

## The second argument: the Circle in scope

`fusion-paths <name> [<circle-dir>]`. The optional second argument is the bare directory name of an **existing** Circle under `circles/`. When it is given, that Circle is the **Circle in scope**, and the substitution is exactly two things: it becomes the `OUT_*` base, and it becomes the Circle half of every `SCAN_*`. Nothing else moves.

Three properties are load-bearing, and each is a refusal rather than a feature.

- **`.active-circle` is not consulted for the substitution and is never written.** The pointer's writer set is closed and enumerated in `rules/fusion-workbench-conventions.md`, and this argument exists precisely so that a consumer can write into a Circle without joining that set. It is still *read and validated* on every call, so an orphaned pointer still exits 3 whether a target was passed or not — an inconsistent workbench stops the run regardless of which Circle the caller asked to write into.
- **`CIRCLE` still names the *active* Circle**, and is still absent when none is active. It answers "which Circle is active", and a target does not make one active. The usual caller is a shaper or planner working an **anticipated** Circle, which by definition is not active, so a `CIRCLE` key that followed the target would make an idea look like running work — the same collapse of `_a_` into `_t_` that writing the pointer at anticipation would have caused, arriving through the output instead. A caller that needs the target's path already holds it: it passed it.
- **A `<circle-dir>` naming no existing directory exits 1.** Not 3, which is the user's pointer to fix and is intact here; not 4, which claims a fusion bug when the caller may be a person mistyping `/fusion:direct`. The argument came from the caller, so the exit code addresses the caller. The same exit covers a target carrying a path separator or a dot segment, which is a safety guard rather than a style one: the value is interpolated into a path.

The argument is additive. Absent it, output is what it has always been, and no shipped prompt passes it except a consumer that has just created a Circle — see `rules/fusion-workbench-conventions.md` `## Path Resolution` → *Where the call belongs* for the one permitted second resolution and why it is conditional on a fact.

**One consumer names the layout literally, and only one:** `/fusion:migrate`. Every other consumer names one layout — the container one — and asks the resolver which store a kind maps to. Migrate is the transition *between* two layouts, so it must name both, and the resolver cannot help it with either side. The old side (`planning/`, `codereview/`, `memos/` at the workbench root) has no keys — the resolver knows only the container layout. The new side would resolve, but to the wrong values: a pre-v4 workbench with a Circle active makes `OUT_PLAN` point into the Circle, whereas the migration must send every unattributed pre-v4 artifact to `shared/` (Origin Rule, corollary 1). Worse, the resolver *refuses* migrate's own input: a pre-v4 `.active-circle` holds the old filename-with-marker form, and `bin/fusion-paths` exits 3 on it — not by recognising the form (the format branch catches only path separators and dot segments), but because no Circle *directory* of that name exists, so the orphan check rejects it (`bin/fusion-paths`, the `[ ! -d "$WORKBENCH/circles/$CIRCLE_NAME" ]` branch). So the one skill that exists to serve pre-v4 workbenches is the one the resolver cannot run against. It still gets its workbench anchor from `bin/fusion-workbench-root` — the same primitive the resolver delegates to — but the store paths it names are literal, and that is correct.

## The key table

In the Value column, `A → B` means: `A` when a Circle is in scope, `B` when none is. `<circle>` is the Circle in scope — the `<circle-dir>` argument when one is given, the active Circle otherwise.

| Key | Value | Notes |
|---|---|---|
| `WORKBENCH` | Absolute path to `fusion-workbench/` | Always emitted. Resolved via `bin/fusion-workbench-root`. |
| `CIRCLE` | `circles/<stamp>-<slug>` | The active Circle directory. Absent when no Circle is active. Never the `<circle-dir>` target — see *The second argument* above. |
| `OUT_PLAN` | `<circle>/planning` → `shared/planning` | Spec and plan writes. |
| `OUT_HISTORY` | `<circle>/history` → `shared/history` | Session history writes. |
| `OUT_ISSUE` | `<circle>/issues` → `shared/issues` | Defect filing. |
| `OUT_DECISION` | `<circle>/decisions` → `shared/decisions` | Decision-record filing. |
| `OUT_REVIEW` | `<circle>/reviews` → `shared/reviews` | codereview / ontoreview writes. |
| `OUT_ANALYSIS` | `<circle>/analyses` → `shared/analyses` | Analysis writes. |
| `OUT_CONSULT` | `shared/consult` | Always shared — never Circle-bound. |
| `OUT_MEMO` | `shared/memos` | Always shared — never Circle-bound. |
| `OUT_BACKLOG` | `shared/backlog` | Always shared — never Circle-bound, and never target-bound either. |
| `OUT_CIRCLE` | `circles` | Where new Circle directories are created (shaper, playmaker). |
| `SCAN_PLANS` | `<circle>/planning shared/planning` | Read/search targets. |
| `SCAN_ISSUES` | `<circle>/issues shared/issues` | |
| `SCAN_DECISIONS` | `<circle>/decisions shared/decisions` | |
| `SCAN_HISTORY` | `<circle>/history shared/history` | |
| `SCAN_REVIEWS` | `<circle>/reviews shared/reviews` | |
| `SCAN_ANALYSES` | `<circle>/analyses shared/analyses` | |
| `SCAN_CONSULT` | `shared/consult` | Read counterpart of `OUT_CONSULT`. Shared-only — see invariant 2. |
| `SCAN_BACKLOG` | `shared/backlog` | Read counterpart of `OUT_BACKLOG`. Shared-only — see invariant 2. |
| `SCAN_CIRCLES` | `circles` | Portfolio-wide scans (playmaker, `/fusion:next`). |
| `PORTFOLIO` | `portfolio.md` | |

### The three unconditionally-shared kinds, and the one that meets the target argument

`OUT_CONSULT`, `OUT_MEMO` and `OUT_BACKLOG` never point into a Circle, and they are one rule rather than three exemptions: none of the three kinds arises from *executing* a Directive, so none of them can originate in a Circle under the Origin Rule. Their read counterparts — `SCAN_CONSULT`, `SCAN_BACKLOG`; `memos` has none, because nothing reads memos — satisfy invariant 2 **vacuously**. The invariant says a `SCAN_*` carries both stores, and for these kinds the Circle store does not exist, so "both" has nothing to range over. That is a collapse, not an exception: no weakening of the rule is involved and none should be written into a prompt.

**There were four until 2026-08-15, and the fourth is the worked case for retiring a key.** Investigations were the same class of kind, and `shared/investigations/` is still in the layout and still holds reports — what went is the pair of keys, `OUT_INVESTIGATION` and `SCAN_INVESTIGATIONS`, when the `conceptrev` and `investigator` agents were removed. The criterion is the one this section already states in *Emission is per-consumer* below: a key set is a restatement of the prompts, so a key no prompt names restates nothing. Both were measured at zero shipped consumers, and they were the only two of the table's keys at zero. **The store's survival is not an argument for the keys' survival** — that was the reasoning that kept `SCAN_INVESTIGATIONS` standing for a week after its last reader left, and it confuses "the directory holds files" with "a consumer writes or reads them". Nor is the retirement silent: a later prompt naming either key exits 4 against the ORDER check in `bin/fusion-paths`, naming the prompt, the key, and both places to add it back. Retire a key the same way — measure the consumers, and let the guard cover the return.

`OUT_BACKLOG` is where that reasoning has to be stated rather than inherited, because it is the first key of its class to exist alongside the `<circle-dir>` argument, and the argument is a second way for a Circle to reach a key. It does not reach this one. The substitution replaces the Circle in scope, and a backlog entry has no Circle in scope to replace: it **precedes** every Directive by construction — that is what makes it a backlog entry rather than an issue or a plan — so the target names a Circle the entry cannot belong to any more than the active one could. A caller that passes a target *and* writes an entry writes it to `shared/backlog` both times, and `hooks/lib/__tests__/fusion-paths.test.ts` `the backlog keys` asserts exactly that, under a target with and without a Circle active.

The general form, for whoever adds the fifth such kind: an unconditionally-shared value is written as a literal in `value_for`, not routed through `scan_value` or `$OUT_BASE`, and it is therefore immune to both the pointer and the argument by construction rather than by a condition somebody has to maintain. Keep it that way.

## Emission is per-consumer, and derived from the prompt

The resolver emits only the keys a consumer needs — a coder gets no `OUT_PLAN`, a playmaker gets no `OUT_ISSUE`. This table defines what each key *means*; **the prompt defines which keys a consumer gets.**

**The key set is not declared anywhere. It is read out of the prompt.** `bin/fusion-paths <name>` greps `agents/<name>.md` or `skills/<name>/SKILL.md` for its own `$OUT_*`, `$SCAN_*` and `$PORTFOLIO` references, and those references *are* the set. `WORKBENCH` is emitted unconditionally; `CIRCLE` whenever a Circle is active; neither belongs to a set. A prompt that names no key gets `WORKBENCH` alone — a true answer, not a failure.

This is what makes the rule below hold **by construction** rather than by audit:

> Every directory a consumer's prompt *reads* has a `SCAN_*` key in its set; every kind it *writes* has an `OUT_*`. `OUT_*` is a write key, `SCAN_*` is a read key.

Under-emission — a prompt naming a key the resolver withholds — is now impossible: the prompt naming it is what creates it. That was the defect that mattered, and it was live. The sets were once declared by hand, built by a deliberate line-by-line audit of all 15 prompts; the audit went 14/15, missing that the reconciler files decision records. `$OUT_DECISION` expanded to the empty string and every record it filed landed at the workbench root — silently, because the write succeeded. A declared set is a second copy of what the prompt already says, and every prompt edit re-rolls the dice on the copy (`HYG-SOT`).

Over-emission — a key emitted that no prompt names — is likewise impossible now, and the signal it used to carry has moved. When a declared set held a key its prompt never used, the finding was usually *"this prompt is missing a step"*, not *"this key is spare"*. That is a prompt-completeness question, found by reading the prompt. It was visible here only by accident, as the diff between a human's belief about a prompt and the prompt's text.

Two consequences for authors:

- **A missing path in a prompt is now a prompt bug, and only a prompt bug.** It cannot be patched by adding a key to the resolver, because the resolver has no key list to add to. Write `$SCAN_ISSUES` where the prompt performs the read.
- **A key mistyped in a prompt stops the run.** `$SCAN_ISUES` is not in the resolver's key table, so it exits 4 naming the prompt and the key, rather than silently expanding to nothing (`HYG-NO-SILENT-FAIL`).

Derivation happens at run time and costs one grep over one file: the set is built for the requested name only. There is no generated table, because a generated table would go stale exactly the way the declared sets did — whenever someone edits a prompt and does not re-run the generator.

`bin/fusion-rules` still hand-maintains its own agent → rule-pattern mapping, and that divergence is deliberate: an agent's prompt does not name the rule files that apply to it, so that mapping is an authored fact with no source to derive from. A key set is not a fact; it is a restatement of the prompt.
