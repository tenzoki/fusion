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

## The second argument, and what it is for

`fusion-paths <name> [<item-dir>]`. The second argument names the work item in scope; with
no second argument the resolver reads this checkout's claim instead. The operative half —
the signature, what a claim is, what two claimed items produce, and why a checkout holding
none is answered rather than refused — is the *Contract* subsection of
`rules/fusion-workbench-conventions.md` `## Path Resolution`, and none of it is restated
here. What belongs to this file is what the argument is **for**, which that contract does
not say.

**It selects between two candidate stores for one kind, and that is its whole purpose.**
Every artifact kind has a store inside a work item's container and a store under `shared/`
(`rules/fusion-workbench-conventions.md` `## Origin Rule (Herkunftsregel)`), so a write has
two candidate destinations and something has to pick. The claim is how an agent picks for
itself. The argument is how a **dispatcher** picks on its behalf, and it buys exactly one
thing the claim cannot: writing into an item this checkout has not claimed. Two prompts
carry a dispatch parameter for it, `planner` and `shaper`, rostered in
`README-agents.md` `## Dispatch parameters`; each passes its value straight through to the
resolver.

**The argument left and came back, and a reader should take that as one rule rather than as
a reversal.** It named an existing *Circle* directory until the Circle container was cut,
went with it because one store per kind leaves nothing to select between, and returned
naming a work-item directory when the per-work-item container was restored. The rule under
both moves is the same: the argument is present exactly when a kind has two stores, and
absent when it has one. None of the Circle's other machinery came back with it — no state
marker on the directory's record, no portfolio layer, no pointer file.

**Exit 3 came back the same way and carries a different fault.** It used to say
`.active-circle` was corrupt or orphaned. That pointer is gone and nothing reads it, so the
old meaning was retired outright rather than re-pointed at some other condition — a caller
that had learned to key on 3 would otherwise have been branching on something it was never
told about. What the code says now is that the item in scope cannot be **determined**: two
or more claimed items, or a checkout identifier unreadable inside a git work tree. It is
written into the conventions' exit table before any caller keys on it, which is the same
care the retirement took. `bin/fusion-rules` still exits 3 for a malformed
`rules/context-manifest.yaml`: read a 3 against the helper that returned it, never across
the two.

**One consumer names the layout literally in order to move it, and only one:**
`/fusion:migrate`. Every other consumer asks the resolver which store a kind maps to.
Migrate is the transition *between* layouts, so it must name both sides, and the resolver
cannot help it with either. The old sides have no keys: the pre-v4 type folders at the
workbench root, a flat `circles/*.md` that never had a directory of its own, and a record
stating its state in a filename marker. The new side would resolve, but migrate's own input
is a tree the resolver's answers do not describe — it is reading files where they used to
be in order to move them where they now belong. Its store paths are literal, and that is
correct.

**`/fusion:setup` is the second exemption the path-literal gate carries, and it is not this
one.** Setup names the pre-v4 type folders in the probe that refuses them, and it `mkdir`s
the current stores; neither act is a transition between layouts, and neither could be
expressed as a resolver key — one is about a layout that has no keys, the other creates the
directories the keys name. The two exemptions are enumerated in
`hooks/lib/__tests__/path-literal-lint.test.ts` and recorded in
`rules/fusion-workbench-conventions.md`, in the *Store-directory path literals* paragraph
above its layout tree.

## The key table

**One kind, two candidate stores, and the resolver picks between them.** A write key and its
matching read key name the same *kind*; what each carries depends on whether a work item is
in scope. An `OUT_*` resolves under that item's container, or under `shared/` when none is.
A `SCAN_*` names **both** stores, container first and the shared one second, and collapses
to the shared store alone when nothing is in scope. `<scope>` below stands for whichever
base the resolver chose, so one row states both readings. Four rows carry a literal instead,
and each says why it has no second candidate.

| Key | Read key | Value | Notes |
|---|---|---|---|
| `WORKBENCH` | — | Absolute path to `fusion-workbench/` | Always emitted, and the only absolute path. Resolved via `bin/fusion-workbench-root`. |
| `OUT_PLAN` | `SCAN_PLANS` | `<scope>/planning` | Spec and plan writes. |
| `OUT_HISTORY` | `SCAN_HISTORY` | `<scope>/history` | **Legacy: the history store is closed to writes** (`rules/fusion-workbench-conventions.md` `## Session history`). No agent names it. The arm survives only while the last skill bodies naming it do, and goes with them. `/fusion:cadence` is the consumer the read key is emitted for; a reader of it says so rather than reporting an empty stretch as a quiet week. |
| `OUT_ISSUE` | `SCAN_ISSUES` | `<scope>/issues` | Defect filing. |
| `OUT_DECISION` | `SCAN_DECISIONS` | `<scope>/decisions` | Decision-record filing. |
| `OUT_REVIEW` | `SCAN_REVIEWS` | `<scope>/reviews` | Review writes, both review domains. |
| `OUT_ANALYSIS` | `SCAN_ANALYSES` | `<scope>/analyses` | Analysis writes. |
| `OUT_CONSULT` | — | `shared/consult` | Literal: a consultation answers to nobody's directive, so no container holds one. `SCAN_CONSULT` was retired on 2026-09-10 with its last consumer; the store and its reports stay. |
| `OUT_BACKLOG` | `SCAN_BACKLOG` | `circles` | Literal, and it is the container store itself rather than a directory inside one container. A work item's record lives in its own container (`rules/fusion-workbench-conventions.md` `## Backlog entries — work items`), so the pair names the store whole and a consumer walks it at depth 2. |
| `OUT_FORUM` | `SCAN_FORUM` | `shared/forum` | Literal: a message is addressed to another checkout, not to a unit of work. |
| `OUT_MEMO` | — | `shared/memos` | Literal, for the same reason. A memo is written for the user, so nothing reads memos and no read key exists. |

**`CIRCLE` was the one emitted key that was not a store**, and it did not come back with the
container. It named the active Circle, or was absent when none was, and was how a caller
told the two apart. Nothing asks a question of that shape now: the resolver decides scope
and hands over finished values, so a consumer never learns whether an item was in scope and
never branches on it. **Three store keys went with it, and none returned.** `OUT_CIRCLE` and
`SCAN_CIRCLES` named the `circles/` container — the container has keys again, but they are
`OUT_BACKLOG` and `SCAN_BACKLOG`, the names every prompt already used, so no consumer had to
learn one. `PORTFOLIO` named the ranking file the portfolio layer regenerated, and that
layer has no writer at all.

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
Circle container was cut, and the two that named `circles/` show the criterion surviving
that store's return: the directory is written to again, under `OUT_BACKLOG`, and the retired
keys stayed retired because no prompt names them.

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
