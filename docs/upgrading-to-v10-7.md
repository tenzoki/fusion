# Upgrading to fusion v10.7

**Nothing in your project is rewritten by this release, there is no migration step, nothing is
removed, and nothing at the project root changes.** v10.7 is a defect-closure release: one Circle
closed 250 open records across the agent prompts, the skill bodies, the helpers, the hooks and the
rule files. Most of what changed is text your agents read. What follows is the part you can see.

Upgrading is the ordinary update: `fusion --update`, or the uninstall/install/reload sequence on the
marketplace path. The release is tagged `v10.7.0`, and `FUSION_REF=tags/v10.7.0` pins exactly this
version.

## `fusion.json` reports a fourth retired key

The configuration loader already named `guard`, `decisions` and `escalation` as retired top-level
keys, each earning one advisory per guarded call until deleted. `churn` joins them. The per-file
churn heatmap left on 2026-08-15 with the rest of the guard's warning half, and a project that
carried its old file across rather than starting from the template may still hold the key.

**What to do:** delete the key. Nothing else in the file is affected while the advisory stands, and
the one live setting, `orchestrator.maxTurns`, is read exactly as before. `hooks/lib/config.ts` is
the loader, and `docs/upgrading-to-v10.md` states the other three.

## The reconciler's verdict set is disjoint and complete

The Phase 3 `## Coherence` section the reconciler writes carried three verdicts, and a Circle that
stopped short of its Directive on purpose fitted none of them: nothing had drifted, nothing was
unreachable. Two names are new. The verdict `directive-partially-met` covers that case, and the
recommendation `state Directive` covers a Circle whose Directive edge is `not evaluable` because no
Directive was ever stated.

**What this changes for you:** the Rebalance gate now fires on every verdict but `coherent`, and on
`coherent` too when the recommendation is `state Directive`. Before, `review-needed` and `bounded-closure-proposed` reached the gate and the new verdict had no
name to fire on, so a Circle stopped short on purpose was consumed as coherent, without a question. Under `state Directive`, the
gate's Revise Directive option is the one that states a Directive. `agents/reconciler.md` `### Step 2.5`
carries the set and the rule that derives it; `agents/orchestrator.md` Phase 3 step 3 consumes it.

## Two helpers, one new and one changed

`bin/fusion-session-domain` is new. It is the one place a skill body reads the session's domain from
`agentstate.yaml`, replacing the same two-line read that stood in three skill bodies and had diverged
on the first copy. It prints `domain=` and `source=`, and a fallback to `code` is never silent. Its
own header is the documentation.

`bin/fusion-identity` now exits 1 when `git` is not on PATH. Without git, whether an identity is owed
cannot be determined, so a filing agent halts and says so rather than filing a record with no author.
A tree that is not a git work tree is still exit 4 and still not a halt.

## Smaller things you may notice

- The German voice profiles now count the em-dash they name, U+2014, and the shipped and workbench
  copies are byte-identical again. Setup Step 0e will therefore ask once whether to refresh yours.
- `bin/fusion-paths`'s message for an empty `.active-circle` no longer runs its own placeholder as a
  command; the text you see on that error is the text that was meant.
- The workbench citation lint's positive control no longer requires an open defect record on disk,
  so that gate holds green in fusion's own suite without a live fault in the tree. It runs in
  fusion's repository, not in your project.

## What you have to do

**Nothing**, unless your `fusion.json` still carries `churn`, in which case delete the key.

## What did not change

The workbench layout, the state marker vocabularies and their transitions, the directory structure,
and the portfolio. The hook layer still decides nothing. No agent, skill or slash command arrived or
left; the roster stands at fifteen agents.

## Where to read more

- `agents/reconciler.md` `### Step 2.5` — the verdict set and the recommendation rule.
- `agents/orchestrator.md` Phase 3 step 3 — when the Rebalance gate fires.
- `bin/fusion-session-domain` and `bin/fusion-identity` — each header is its own documentation.
- `hooks/lib/config.ts` — the retired keys and the advisory each earns.
- `docs/upgrading-to-v10-6.md` and `docs/upgrading-to-v10-5.md` — the two previous notes, if you are
  coming from further back and skipped one.
- `/fusion:help` — install, update and configure, answered from your live installation.

The records behind every change here are in fusion's own workbench in the source repo.
