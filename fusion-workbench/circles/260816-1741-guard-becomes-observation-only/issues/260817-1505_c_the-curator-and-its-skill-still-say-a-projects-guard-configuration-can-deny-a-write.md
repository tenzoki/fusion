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
path, so `reference-resolution-lint` cannot see it either — the same limit `260816-2321_*_step-11s-line-scoped-changes-text-misses-two-stale-lines-in-files-it-already-opens.md` and
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
- `260816-2321_*_step-11s-line-scoped-changes-text-misses-two-stale-lines-in-files-it-already-opens.md`
- `260817-1105_*_readmes-setup-paragraph-still-says-setup-seeds-the-retired-fusion-guard-json.md`

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
`260816-1841-orchestrator-session.md`
`## Coherence — second pass`.

---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass, third pass) — STAYS `_o_`. Both sentences stand verbatim at HEAD `e435f03`, two releases past the Bounded Closure that named this record as the reason for it.**

```
agents/curator.md:212   … A write denied by the project's guard configuration is a **failed**
                        entry carrying the denial reason — never an applied one. …
skills/curate/SKILL.md:110  … A write the project's guard configuration denied is a **failed**
                        entry, never an applied one. …
```

Both line numbers are still exact — `git log --oneline d0f13fa..HEAD -- agents/curator.md skills/curate/SKILL.md` is empty. Neither file has been opened since the Circle closed, through v10.0.2, v10.1.0, v10.2.0 and v10.3.0.

Both halves of the premise are still false, re-measured rather than carried over: `hooks/guard.ts` is 223 lines with no `permissionDecision`, no `"deny"` and no `hookSpecificOutput`, and writes `{}` on every path; `guard` is one of the three retired top-level keys the loader names and drops.

**This is the live obligation, singular — the one the Bounded Closure is made of.** The `_b_` closure note states it directly: the Directive's last clause asks that the shipped text say what the guard now is *"in the agent prompts and skill bodies"*, `agents/curator.md` is an agent prompt, `skills/curate/SKILL.md` is a skill body, and neither says it. Every other clause of that Directive verifies at HEAD. Bounded Closure means the Directive was **reachable and deliberately not reached**, not that it was abandoned — the user scoped this out of v10.0.1 knowing what it was, and nothing has taken it since.

**What a reader planning a deep change needs to know.** Four releases have shipped over this sentence. A curator run that meets a genuinely failed write will attribute it to a guard that cannot have caused it, and the two shipped surfaces that describe fusion's own gated normative-edit path are the ones saying it. The remedy is unchanged and is a cut, not a rewrite: drop the guard clause from both, keep the classification it illustrated — a write that did not land is `failed` with the reason, whatever the reason was — and do not substitute a fusion-specific cause, because the failure classes a curator apply can now meet (read-only file, harness permission denial, disk error) are none of fusion's.

**The pair moves together or not at all.** An agent and the skill that drives it disagreeing about what a `failed` entry means is worse than both being wrong in the same way, which is the state today.

---
Resolved: fixed — the guard clause is cut from the prompt and the classification kept, a write that did not land being `failed` with whatever reason it had; the `skills/curate/SKILL.md` half is plan step 10; `agents/curator.md:212`

Step 10 note: the `skills/curate/SKILL.md` half landed — the guard clause is cut and a `failed` entry carries whatever reason it had; `skills/curate/SKILL.md:106`
