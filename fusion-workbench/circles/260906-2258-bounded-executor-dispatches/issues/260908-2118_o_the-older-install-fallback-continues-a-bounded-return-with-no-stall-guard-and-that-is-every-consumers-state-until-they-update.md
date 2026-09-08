# The older-install fallback continues a bounded return with no stall guard, and that is every consumer's state until they update

**Filed by:** coderev, Kai Stalmann <kai@qantr.com>
**Severity:** Medium
**Found in:** `260908-2110-coderev-bounded-dispatch-closure.md`, finding M3
**Range:** `637d0b04..20796615`

## What is wrong

`agents/orchestrator.md:466`, the last sentence of `### Bounded dispatches`:

> Before acting, read `$FUSION_PLUGIN_ROOT/rules/bounded-dispatch.md`
> `## For the orchestrator: continuing a bounded return` in full: it holds the five sites,
> the stall guard and four rules across them. Do not act from memory. **Absent (older
> install): continue at the same site in a fresh dispatch and say so.**

The sentence names the stall guard as something the rule file holds, then gives a fallback
for when that file is absent — and the fallback carries no guard. It says continue, and
nothing says when to stop continuing.

`rules/bounded-dispatch.md:111-116` is explicit that nothing else bounds the count:

> A run may be continued more than once, and nothing caps the count in advance.
>
> **The stall guard.** If two consecutive continuations return having completed nothing,
> stop dispatching and fall through to that site's own not-completed path.

So the stall guard is the *only* cap, and the degraded path drops it. An agent that stops
at its bound having completed nothing — a `coder` whose first unit is longer than the whole
bound, which the rule's own overshoot passage at `rules/bounded-dispatch.md:45-48` says is
a real case — is re-dispatched, stops again having completed nothing, and is re-dispatched
again, with no written stopping condition.

## Why this is not a hypothetical branch

`rules/bounded-dispatch.md` is new in this range, and `$FUSION_PLUGIN_ROOT` is the
installed copy, pinned for the whole session. So **every consumer is in this branch until
they run `fusion --update` and restart** — the standing one-release-behind cost `CLAUDE.md`
records for `bin/` helpers, reaching a rule file here. The absent-file branch is the
default state of the installed base at release, not an edge.

Two things bound it in practice and neither is this mechanism: the Phase-2 Turn budget, and
the user watching. Both were true of every unbounded loop this project has previously
found and filed.

## Fix direction

Put the stall guard in the fallback sentence itself, since it is the one rule the fallback
cannot look up. Something of the shape: *Absent (older install): continue at the same site
in a fresh dispatch and say so; stop after two consecutive continuations that completed
nothing and take the site's own not-completed path.*

**Byte cost is the constraint here**, and it is why I am not proposing more. `agents/`
finished this Circle at 698 bytes of head-room against a hard bound, and the shortest
honest form of that clause is roughly 130 bytes. If it does not fit, the alternative is to
drop the fallback's instruction to continue at all — an orchestrator that cannot read the
protocol taking the site's own not-completed path is a defensible degradation and costs
fewer bytes than the guard does.

## Scope

`agents/orchestrator.md` only. The five in-file continuation sites all cite the rule
correctly and are unaffected; this is the one path that runs without it.
