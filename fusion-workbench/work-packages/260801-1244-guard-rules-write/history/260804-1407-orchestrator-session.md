# Orchestrator Session — 260804-1407-orchestrator-session.md

**Directive:** Build C5b — plan Steps 6, 7 and 8. The project-level `fusion-guard.json` loader, the template and this repository's own copy, and the `/fusion:setup` seeding. This is the half of the Circle's Directive that has never been started.
**Mode:** plan
**Status:** In progress
**Predecessor session:** `260804-1243-orchestrator-session.md`

## Why this, now

Eleven sessions have gone into hardening the guard's shell classifier, which the Circle kept
meeting while working near its Directive. The Turn-10 review's ledger put this at the top and
said plainly what the record showed: C5b appears in no issue store, is visible only in one
line of the plan file, and a Coherence verdict cannot be clean against a Directive whose
second half was never built. The user chose to build it.

Deliberately not in this session: `260804-1344_*_the-git-option-walk-stops-at-an-unknown-options-value-so-a-c-behind-it-is-invisible.md` and `260804-1345_*_git-checkout-treeish-dash-dash-dot-overwrites-the-whole-protected-list-and-allows.md`, the two High fail-opens
still open in the shell classifier. They gate plan Step 10, the ship, and not this work.

## What makes these three steps awkward

**Eleven of the Circle's twelve acceptance criteria describe behaviour in a *consuming*
project**, and the write guard stands down in this repository. Nothing here can be verified by
editing a file and seeing what happens; every check has to run through the integration harness
against a throwaway project root. The Circle's own record named this at activation as the most
likely way the work ships broken.

**Step 7 routes to `ontocoder`** and is therefore a human gate by project convention.

**Three decision records have waited on Step 6 since the Circle began.** Step 6's design
answers at least one of them by construction (the self-protection floor), and the others may
turn out to be genuinely open. Surfacing which is part of the step, not a follow-up.

## Per-Turn Log

(Turn in progress.)

## Per-Turn Log — Turn 1, `95a325d..7f3d789`

C5b is built. Three steps, three commits, suite 1299 → 1344.

**Step 6, `46d8333`** — the loader. A project with no `fusion-guard.json` produces an
effective config byte-identical to before, asserted against a verbatim transcription of the
old loader's output; the mutation that applies the self-protection floor unconditionally
fails both identity cases. Every criterion was checked through the harness against a
throwaway project root, and two cases deliberately run the same configuration in both
places so the stand-down difference is measured rather than assumed.

Two corrections to the plan, both found by building it. Its `ConfigSources` sketch would have
made the whole unit suite lie: an explicit `projectRoot: null`, written the obvious way, is
indistinguishable from an omission and walks up from cwd, which in this repository finds the
plugin root, so every case meaning "no project layer" would have silently acquired one. And
the plan never said what the floor does when the file exists but does not parse; it keys on
existence, because the alternative lets a project unprotect its own configuration by breaking
it.

**Step 7, `557340d`** — the template and this repository's copy, byte-identical. It lists no
paths; the effective list stays in the plugin's `hooks/config.json`. The reasoning generalises
this Circle's most expensive lesson: four enumerations that were copies of something
authoritative elsewhere have been falsified here, and the file declines two more.

The second of its three test cases is the one that earns its place. The obvious case — load
the template, compare against the plugin — is passed by a template that grew a
`protectedPaths` key listing today's nine paths verbatim, which would silently end the
inheritance the step exists for. The second case loads against a synthetic plugin layer whose
every top-level key differs from the defaults, so any key the template declares is replaced
whole, falls back, and fails.

**Step 8, `7f3d789`** — the seeding, and it does not have the shape the plan asked for. The
plan wanted one guarded `cp`. That form would have been **denied**, every time: Step 6's floor
keys on the file's existence and the classifier is static, so it sees a `cp` writing a
protected path whether or not the shell would have declined it. `/fusion:setup` runs at the
start of every orchestrator session, so the one-command form would have denied once per
session forever in every consuming project, incrementing `consecutiveBlocks` each time.
Rewording it was not available — that is the workaround `protected-path-discipline.md`
forbids, and the deny is correct. So the step probes first and copies only in the absent
branch, which is Step 0c's own shape.

That is the plan's design colliding with a rule the same plan established three steps earlier,
caught by measurement rather than by review.

## Decisions

`260802-1912_*_does-the-self-protection-floor-apply-before-the-config-file-exists.md` moved to implemented, realised exactly as answered. Its residual turned out
wider than the record bounded it — the narrowing also drops `fusion-workbench/.guard-state/**`,
so the reach is the escalation machinery — filed at `260804-1427_*_the-accepted-floor-residual-reaches-the-guards-own-state-directory-not-only-protectedpaths.md`.

`260803-1314` was deliberately not answered in code and its status changed anyway. Before
Step 6 no project could declare a `protectedPaths` list, so whether the rules-write exemption
outranks a project's own entry was hypothetical. It is live now, and not deciding ships one of
its options. The current behaviour is pinned by a test that disclaims endorsement and cites
the record.

## Status

**Complete.** C5b is built and the Circle's Directive now has both halves. Not done, and named
so the next session does not have to re-derive it: plan Step 9 (documentation, whose scope has
changed twice), plan Step 10 (the rebuild and version bump that makes any of this live), the
two High fail-opens in the shell classifier (`260804-1344_*_the-git-option-walk-stops-at-an-unknown-options-value-so-a-c-behind-it-is-invisible.md`, `260804-1345_*_git-checkout-treeish-dash-dash-dot-overwrites-the-whole-protected-list-and-allows.md`) which gate Step 10,
and decision `260803-1314`, which Step 6 made consequential.

No review was run over these three commits. That is the next thing, not an omission to
discover later.
