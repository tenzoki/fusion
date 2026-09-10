# Path Resolution — the name namespace, the key table, and how a key set is derived

**Provenance:** 260801-1244-guard-rules-write

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

## There is no second argument, and no state is read

`fusion-paths <name>`. One argument, and the resolver reads no workbench file at all.

An optional second argument stood here until the Circle container was cut. It named an
existing Circle directory that became the **Circle in scope** — the `OUT_*` base and the
Circle half of every `SCAN_*` — so that a consumer could write a Circle's founding
documents into an anticipated Circle before it was active. Its whole purpose was to select
between two candidate stores for one kind. With one store per kind there is no second
candidate to select, so the argument names nothing, and a call carrying one exits 1 as a
usage error rather than being ignored.

**Exit 3 went with the pointer it was about.** It said `.active-circle` was corrupt or
orphaned — a workbench-state fault, the user's to fix. Nothing reads that file now, so no
state fault of that class exists and the code has no meaning left to carry. `bin/fusion-rules`
still exits 3, for a malformed `rules/context-manifest.yaml`: read a 3 against the helper
that returned it, never against this one. Note what did **not** happen to the code's
meaning: it was not re-pointed at some other fault, because a caller that learned to key on
3 would then be branching on a condition it had never been told about.

**One consumer names the layout literally, and only one:** `/fusion:migrate`. Every other
consumer asks the resolver which store a kind maps to. Migrate is the transition *between*
layouts, so it must name both sides, and the resolver cannot help it with either. The old
sides have no keys — the pre-v4 type folders at the workbench root, and the Circle
container that replaced them and has now gone the same way. The new side would resolve, but
migrate's own input is a tree the resolver's answers do not describe: it is reading files
where they used to be in order to move them where they now belong. Its store paths are
literal, and that is correct.

## The key table

**One kind, one store, one value.** A write key and its matching read key name the same
directory, so the table is one row per kind and no row carries a condition.

| Key | Read key | Value | Notes |
|---|---|---|---|
| `WORKBENCH` | — | Absolute path to `fusion-workbench/` | Always emitted, and the only absolute path. Resolved via `bin/fusion-workbench-root`. |
| `OUT_PLAN` | `SCAN_PLANS` | `shared/planning` | Spec and plan writes. |
| `OUT_HISTORY` | `SCAN_HISTORY` | `shared/history` | **Legacy: the history store is closed to writes** (`rules/fusion-workbench-conventions.md` `## Session history`). No agent names it. The arm survives only while the last skill bodies naming it do, and goes with them. `/fusion:cadence` is the consumer the read key is emitted for; a reader of it says so rather than reporting an empty stretch as a quiet week. |
| `OUT_ISSUE` | `SCAN_ISSUES` | `shared/issues` | Defect filing. |
| `OUT_DECISION` | `SCAN_DECISIONS` | `shared/decisions` | Decision-record filing. |
| `OUT_REVIEW` | `SCAN_REVIEWS` | `shared/reviews` | Review writes, both review domains. |
| `OUT_ANALYSIS` | `SCAN_ANALYSES` | `shared/analyses` | Analysis writes. |
| `OUT_CONSULT` | — | `shared/consult` | `SCAN_CONSULT` was retired on 2026-09-10 with its last consumer; the store and its reports stay. |
| `OUT_BACKLOG` | `SCAN_BACKLOG` | `shared/backlog` | Work items, one file per item. |
| `OUT_FORUM` | `SCAN_FORUM` | `shared/forum` | Messages addressed to another checkout. |
| `OUT_MEMO` | — | `shared/memos` | A memo is written for the user, so nothing reads memos and no read key exists. |

**`CIRCLE` was the one emitted key that was not a store**, and it went with the container:
it named the active Circle, or was absent when none was, and was how a caller told the two
apart. No key answers a question of that shape now, because none is being asked — every
`OUT_*` has one value and a consumer needs no branch. **Three store keys went with it**:
`OUT_CIRCLE` and `SCAN_CIRCLES`, which named the `circles/` container, and `PORTFOLIO`,
which named the ranking file the portfolio layer regenerated.

### Retiring a key, and the worked case for it

A key set is a restatement of the prompts, so **a key no prompt names restates nothing** —
that is the whole criterion, and it is what retires a key. Measure the shipped consumers;
if the count is zero, the key goes.

The worked case is investigations, retired on 2026-08-15. `shared/investigations/` is still
in the layout and still holds reports — what went is the pair of keys,
`OUT_INVESTIGATION` and `SCAN_INVESTIGATIONS`, when the `conceptrev` and `investigator`
agents were removed. **The store's survival is not an argument for the keys' survival.**
That was the reasoning that kept `SCAN_INVESTIGATIONS` standing for a week after its last
reader left, and it confuses "the directory holds files" with "a consumer writes or reads
them". Nor is the retirement silent: a later prompt naming either key exits 4 against the
ORDER check in `bin/fusion-paths`, naming the prompt, the key, and both places to add it
back. `OUT_CIRCLE`, `SCAN_CIRCLES` and `PORTFOLIO` were retired the same way when the
Circle container was cut, and there the store went with the keys.

**Two kinds have a write key and no read key**, and it is this criterion applied to one
half of a pair. Nothing reads memos: a memo is written for the user, so a `SCAN_MEMOS`
would be a key no prompt has ever named. `SCAN_CONSULT` did have consumers and lost them —
`playmaker` read every store and went at v11, and `/fusion:archive` then named the key in
one sentence about deriving a shared store out of a two-valued `SCAN_*`, a derivation that
went with the second value. A key is emitted when a prompt reads or writes the kind, not
because the symmetry of the table would look better with it.

## Emission is per-consumer, and derived from the prompt

The resolver emits only the keys a consumer needs — a coder gets no `OUT_PLAN`, an editor gets no `OUT_ISSUE`. This table defines what each key *means*; **the prompt defines which keys a consumer gets.**

**The key set is not declared anywhere. It is read out of the prompt.** `bin/fusion-paths <name>` greps `agents/<name>.md` or `skills/<name>/SKILL.md` for its own `$OUT_*` and `$SCAN_*` references, and those references *are* the set. `WORKBENCH` is emitted unconditionally and belongs to no set. A prompt that names no key gets `WORKBENCH` alone — a true answer, not a failure.

This is what makes the rule below hold **by construction** rather than by audit:

> Every directory a consumer's prompt *reads* has a `SCAN_*` key in its set; every kind it *writes* has an `OUT_*`. `OUT_*` is a write key, `SCAN_*` is a read key.

Under-emission — a prompt naming a key the resolver withholds — is now impossible: the prompt naming it is what creates it. That was the defect that mattered, and it was live. The sets were once declared by hand, built by a deliberate line-by-line audit of all 15 prompts; the audit went 14/15, missing that the reconciler files decision records. `$OUT_DECISION` expanded to the empty string and every record it filed landed at the workbench root — silently, because the write succeeded. A declared set is a second copy of what the prompt already says, and every prompt edit re-rolls the dice on the copy (`HYG-SOT`).

Over-emission — a key emitted that no prompt names — is likewise impossible now, and the signal it used to carry has moved. When a declared set held a key its prompt never used, the finding was usually *"this prompt is missing a step"*, not *"this key is spare"*. That is a prompt-completeness question, found by reading the prompt. It was visible here only by accident, as the diff between a human's belief about a prompt and the prompt's text.

Two consequences for authors:

- **A missing path in a prompt is now a prompt bug, and only a prompt bug.** It cannot be patched by adding a key to the resolver, because the resolver has no key list to add to. Write `$SCAN_ISSUES` where the prompt performs the read.
- **A key mistyped in a prompt stops the run.** `$SCAN_ISUES` is not in the resolver's key table, so it exits 4 naming the prompt and the key, rather than silently expanding to nothing (`HYG-NO-SILENT-FAIL`).

Derivation happens at run time and costs one grep over one file: the set is built for the requested name only. There is no generated table, because a generated table would go stale exactly the way the declared sets did — whenever someone edits a prompt and does not re-run the generator.

`bin/fusion-rules` still hand-maintains its own agent → rule-pattern mapping, and that divergence is deliberate: an agent's prompt does not name the rule files that apply to it, so that mapping is an authored fact with no source to derive from. A key set is not a fact; it is a restatement of the prompt.
