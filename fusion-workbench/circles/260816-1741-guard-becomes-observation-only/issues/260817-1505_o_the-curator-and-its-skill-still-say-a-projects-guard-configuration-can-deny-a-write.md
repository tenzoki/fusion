The curator and its skill still say a project's guard configuration can deny a write

---

Two shipped prompts carry the same sentence, and both state a mechanism that cannot fire at HEAD.

`agents/curator.md:212`:

> Then append the outcome per entry to the same run file: `applied`, `skipped` (not approved),
> `stale`, or `failed` with the reason. **A write denied by the project's guard configuration is a
> `failed` entry carrying the denial reason** — never an applied one.

`skills/curate/SKILL.md:110`:

> **A write the project's guard configuration denied is a `failed` entry**, never an applied one.
> Do not summarise these away: a partial apply reported as a completion is the failure this whole
> shape exists to avoid.

Neither half of the premise survives this Circle. Nothing in the hook layer denies a write —
`hooks/guard.ts` writes `{}` on every path and its own header says "There is no second verdict"
(`hooks/guard.ts:19-21`). And there is no *guard configuration* to deny from: `guard` is one of the
three retired top-level keys the loader names and drops (`hooks/lib/config.ts:343-351`), and the
only live leaf in the whole configuration surface is `orchestrator.maxTurns`
(`hooks/lib/config.ts:305-313`).

**The sentence was live when it was written.** The curator shipped at v8.2.0, when the
decision-governed deny still blocked writes into a project's own governed paths at `high`
sensitivity — and `CLAUDE.md`, `rules/` and decision records, which are exactly what the curator
writes, are exactly what a project would have governed. So this is not a sentence that was always
wrong; it is one whose subject was deleted on 2026-08-16 and that no step reached.

**Why the two sweeps missed it.** `1fb3f32` and `5763550` swept the shipped text for a guard that
decides. Neither opened `agents/curator.md` or `skills/curate/SKILL.md`: the curator is not a hooks
surface, not a configuration surface and not a migration surface, and the word "guard" appears in
those two files only inside this one clause. The clause names no removed identifier and no removed
path, so `reference-resolution-lint` cannot see it either — the same limit `260816-2321` and
`260817-1105` each record from a different direction.

**Effect.** No behaviour changes, because the denial the sentence classifies never arrives. What
it costs is the Directive: the release exists to make the shipped text say the guard decides
nothing, and two agent-facing prompts say the opposite in the present tense. A curator run that
meets a genuinely failed write may also attribute it to a guard that did not cause it.

**Severity:** Medium. Scope: `agents/curator.md` and `skills/curate/SKILL.md` — an agent and the
skill that drives it, so the pair has to move together or the two surfaces disagree about what a
`failed` entry means.

**Suggested fix.** Cut the guard clause from both and keep the classification it was an example of:
a write that did not land is `failed` with the reason, whatever the reason was. Do not replace it
with a fusion-specific cause; the failure classes a curator apply can actually meet now are a
read-only file, a permission denial from the harness, and a disk error, none of which is fusion's.

**Cross-references:**
- `agents/curator.md:212`, `skills/curate/SKILL.md:110`
- `hooks/guard.ts:1-21`, `hooks/lib/config.ts:305-313`, `:343-351`
- `circles/260816-1741-guard-becomes-observation-only/issues/260816-2321_c_step-11s-line-scoped-changes-text-misses-two-stale-lines-in-files-it-already-opens.md`
- `circles/260816-1741-guard-becomes-observation-only/issues/260817-1105_c_readmes-setup-paragraph-still-says-setup-seeds-the-retired-fusion-guard-json.md`

---
Reconciliation 2026-08-17, second Phase-3 pass. **Left OPEN by explicit user decision, against the
shipped v10.0.1. Re-measured at HEAD `d0f13fa`, both sentences stand verbatim.**

`agents/curator.md:212` — "A write denied by the project's guard configuration is a **failed** entry
carrying the denial reason — never an applied one."
`skills/curate/SKILL.md:110` — "A write the project's guard configuration denied is a **failed**
entry, never an applied one."

Both halves of the premise are still false at HEAD, re-checked and not carried over: `hooks/guard.ts`
is 223 lines with no `permissionDecision`, no `"deny"` and no `hookSpecificOutput` anywhere in it,
and every path writes `{}` (`:112`, `:202`); `guard` is a retired top-level key the loader names and
drops.

**This record is the one open item that sits inside the Circle's own Directive.** The Directive's
last clause reads "The shipped text that presents a blocking, halting guard as a live property says
what the guard now is, in code, **in the agent prompts and skill bodies**, in `README-hooks.md` and
in `docs/philosophy.md`" (`_t_circle.md:25-27`). `agents/curator.md` is an agent prompt and
`skills/curate/SKILL.md` is a skill body, and neither says what the guard now is. Every other clause
of that Directive verifies at HEAD. This is why the second pass's Artifact↔Directive edge is flagged
on completeness, and it is flagged as a user-chosen shortfall rather than as drift — see
`circles/260816-1741-guard-becomes-observation-only/history/260816-1841-orchestrator-session.md`
`## Coherence — second pass`.
