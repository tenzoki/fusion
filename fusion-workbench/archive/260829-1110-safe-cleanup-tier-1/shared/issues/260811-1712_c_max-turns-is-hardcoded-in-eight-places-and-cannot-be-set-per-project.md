# `max_turns` is hardcoded in eight places in the orchestrator prompt and cannot be set per project

---
**Severity:** Medium
**Domain:** code
**Filed by:** user, via orchestrator, session 260811-0752-orchestrator-session.md
**Affects:** `agents/orchestrator.md:362`, `:366`, `:685`, `:847`, `:849`, `:922`, `:1073`; `templates/fusion-guard.json` (the per-project configuration surface that does not carry it)
**Cross-references:** `skills/circle-stash/SKILL.md:126,131` (a consumer that already reads the value from `agentstate.yaml` rather than assuming it); `hooks/lib/config.ts` (the per-leaf merge this would reuse)

---

## The request

The Turn budget must be configurable per project, and the orchestrator must read it from
configuration at Setup instead of carrying the number in its prompt text.

## The defect

The value `5` is written into `agents/orchestrator.md` in seven places, in four different
spellings, and every one of them is prose a reader has to keep consistent by hand:

| Site | Spelling |
|---|---|
| `:362` | "Maximum 5 Turns (numbered 1 through 5)" |
| `:366` | "set `**Turn:** <N>/5`" |
| `:685` | "Turn limit reached … max-Turns exceeded for Phase-3 Revise-Artifact" |
| `:847` | "the existing 5-Turn circuit breaker … `max_turns` (default 5)" |
| `:849` | "If `max_turns` is already reached (5/5)" |
| `:922` | `max_turns: 5` in the `agentstate.yaml` schema block |
| `:1073` | "show `**Turn:** --/5` … show `**Turn:** 1/5`" |

The circuit-breaker table at Step 3d states the threshold a further time as a table row.

Three consequences, in increasing order of cost:

1. **No project can change it.** A cleanup session over 68 queued records and a two-task bugfix
   session get the same budget. The session that filed this record hit the limit as a real
   constraint, not a theoretical one: it closed 31 records in three Turns with 37 still queued.
2. **The number is stated, not read.** `:847` already calls 5 a *default*, which implies a source
   that can override it. No such source exists, so the word is currently false.
3. **Seven copies of one fact.** This is exactly the class the decision
   `260810-1635_*_where-does-the-obligation-sit-to-update-the-artefact-that-explains-a-behaviour-when-the-behaviour-changes.md`
   was answered on in this same session: a claim lives in one place and is cited from the others,
   because what is stated once cannot go stale in seven places at once. Changing the budget today
   means finding all seven.

## What already exists and should be reused

**Do not invent a configuration mechanism.** `fusion-guard.json` at the project root is the
established per-project configuration surface: it is git-tracked so every change shows in a diff,
`hooks/lib/config.ts` merges it per **leaf** key over the plugin's `hooks/config.json` and then
over built-in defaults, a declared value wins outright, an omitted one inherits, and a value of the
wrong type is dropped and named in an advisory rather than ignored in silence. A Turn budget is the
same shape of setting.

**And one consumer already does the right thing.** `skills/circle-stash/SKILL.md:126,131` reads
`progress.max_turns` out of `agentstate.yaml` instead of assuming 5. So the value is already
treated as data at one site while being prose at seven others.

## Acceptance

- The Turn budget is declarable per project, through the existing per-leaf merge rather than a
  second configuration file.
- `agents/orchestrator.md` obtains it at Setup, alongside the other Setup resolutions, and carries
  it in `agentstate.yaml` where `progress.max_turns` already has a home.
- No site in the prompt states the number. Every site that today writes `5` names the resolved
  value instead, the dashboard's `<N>/<max>` included.
- A default is defined once, in the configuration layer, and `:847`'s word "default" becomes true.
- The out-of-range and wrong-type cases are decided rather than left open: what a budget of `0`,
  a negative value or a non-integer does. The guard loader's existing behaviour — drop, name it in
  an advisory, inherit — is the precedent to follow unless there is a reason not to.
- A gate pins that no bare Turn-budget literal returns to the prompt, in the shape of the existing
  prompt lints under `hooks/lib/__tests__/`.

## Note on scope

Whether the *other* fixed budgets should move with it — the Directive-revisions cap of 1
(`progress.directive_revisions_this_session`), the one-bugfixer-attempt-per-task rule, the
three-errors-per-Turn cascade threshold — is deliberately not decided here. They are the same
shape and a single mechanism could carry all four, but widening this record without measuring the
other three would be a guess. Decide it when this lands.

---

## Resolved — 260811, coder, task `I:260811-1734c`

The budget is now `orchestrator.maxTurns`, resolved through the loader that already
merges per leaf. Every acceptance line, with where it landed:

- **Declarable per project through the existing merge.** `hooks/lib/config.ts` gained one
  container, `orchestrator`, with one leaf. A project declares
  `{"orchestrator": {"maxTurns": 12}}` in its own `fusion-guard.json` and the same walk
  every guard setting takes does the rest — project, then plugin, then defaults. No second
  configuration file, no second rule for a project owner to learn.
- **Obtained at Setup, carried in `agentstate.yaml`.** `bin/fusion-turn-budget` →
  `hooks/turn-budget.ts` prints one line, `max_turns=<n>`. The orchestrator calls it at
  Setup Step 2, behind the same `[ -x ]` guard the churn ranking and the source count
  carry, and holds the value as `<max-turns>` for the session.
  `progress.max_turns` keeps its home, which is where `/fusion:circle-stash` was already
  reading it as data.
- **No site in the prompt states the number.** All eight are gone — the seven listed above
  and the Step 3d table row. Measured: the eight patterns in
  `hooks/lib/__tests__/turn-budget-lint.test.ts` find all eight sites in the pre-fix file
  at `bb9d66d` and none in the current one.
- **The default is defined once.** `DEFAULTS.orchestrator.maxTurns` in `hooks/lib/config.ts`,
  and deliberately **not** restated in the plugin's `hooks/config.json`. Every other leaf is
  spelled in both files, and that module's own docstring is the standing complaint that
  nothing keeps the two copies agreeing. `:847`'s word *default* is now true.
- **Out-of-range and wrong-type are decided, on the stated precedent.** The budget reuses
  `isPositiveInteger` — the check `escalation.blocksBeforeHalt` already uses, for the same
  reason. A `0`, a negative, a decimal, a string: dropped, named in an advisory, inherits
  the default, which is the one behaviour an absent, an unusable and an unwritten key are
  all required to share. No upper bound, deliberately: a project that wants 60 Turns has
  said so in a git-tracked file.
- **The gate.** `hooks/lib/__tests__/turn-budget-lint.test.ts`, in the shape of the prompt
  lints beside it. Its failure message names the two legitimate routes — declare the key in
  a project's `fusion-guard.json`, or change `DEFAULTS` — so the next person who wants a
  different number takes one of them instead of writing a literal back into the prose.

**One case decided that the record left open: what happens when the read fails.** Three
routes reach it — the helper absent from an older install, exit 2 (no workbench), exit 3
(compiled hooks missing). They take one branch, and that branch is a *state*, not a
substituted number: the budget is UNRESOLVED, Setup says so and names the remedy,
`progress.max_turns` is **omitted** from `agentstate.yaml` (a word there would be read as a
garbled number by `/fusion:circle-stash`, while an absent key is a case it already handles),
the dashboard shows `--` on the right of the slash, and the Max-Turns row of the
circuit-breaker table is not evaluated. The loop is still bounded by the other five
conditions and by convergence — but not by a count, and the session is told so.

**The scope bound held.** The Directive-revisions cap of 1, the one-bugfixer-attempt rule
and the three-errors-per-Turn threshold were not touched. What deciding them would need is
recorded in the session history beside this note.
