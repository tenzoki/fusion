Every session runs one release behind on a bin/ helper the same repository just added

---
`bin/fusion-identity` landed in the work tree at 260824-1130 and reached the installed copy
at `$FUSION_PLUGIN_ROOT` only at 260825-0829, on the next `fusion --update`. For those 21
hours every `[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-identity" ]` call site in every prompt took
its miss branch, in a repository whose own work tree held the helper the whole time. This is
the direct cause of the 28 unattributed records, and it is structural rather than a one-off.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260825-1250_*_twenty-eight-records-filed-since-the-attribution-rule-landed-carry-no-person-half-and-no-stated-reason.md (the consequence this explains); CLAUDE.md `## Release process` (the two-session shape, stated for agents only); 260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md (the guard convention that makes the miss silent)

## What was measured

Timestamps, 260825:

| Fact | When |
|---|---|
| `bin/fusion-identity` added to the work tree (`3ba7a46`) | 260824-1130 |
| `### Who filed it` added to the rules (`2b055a0`) | 260824-1214 |
| Installed copy at `$FUSION_PLUGIN_ROOT` refreshed | 260825-0829 |
| Every silent record's filename stamp | between 260824-1621_*_the-filing-rules-residual-branch-promises-a-person-line-that-exit-5-does-not-print.md and 260824-2155 |

Every one of the 28 records lacking the field falls inside the window in which the helper
was in the tree and not in the install. Not one falls outside it.

## Why this is structural and not an accident of one release

`bin/fusion-rules`, `bin/fusion-paths` and `bin/fusion-source-root` prefer the work tree when
`bin/fusion-plugin-cwd` says cwd is this repository, so **rules** written here take effect in
the same session. Helper **resolution** does not: every call site is written
`"$FUSION_PLUGIN_ROOT/bin/<name>"`, which is the installed copy, pinned for the session.
Whether the work-tree preference should reach helper resolution is part (c) of
`260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention...`
and is deliberately unanswered.

The consequence is that this repository can never exercise a helper it just wrote, in the
session that wrote it, through the call sites that use it. `CLAUDE.md` `## Release process`
states exactly this shape for **agents** ("a Circle that builds an agent and proves it by
running it is a two-session shape") and says nothing about helpers, although the pin is the
same pin and the window is longer, because a helper needs no restart to be noticed missing,
only to be noticed present.

## Why the miss is silent, which is the part that hurts

The guarded call convention (decision `260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md`, option a1: tolerate and report) has each
call site print one line on stderr and continue. That is right for a single call. Across a
session it means the absence is reported once per call site into a stream nobody aggregates,
and the agent proceeds down a branch whose output is indistinguishable from ordinary work
unless the agent also writes the reason down. Of the 42 records filed while the helper was
unreachable, 14 wrote the reason and 28 did not: a 67 per cent failure rate on the branch
that only exists for this situation.

## Candidate directions, none preferred here

1. **Answer part (c) of `260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md`**: let helper resolution prefer the work tree in this
   repository, as rule resolution already does. Closes the window at its source, and only for
   fusion's own development.
2. **Setup measures the gap once** and says so: compare `bin/` in the work tree against
   `$FUSION_PLUGIN_ROOT/bin/`, and name any helper present in one and absent in the other. One
   line in the Done report, no behaviour change, and it makes a 21-hour blind window visible on
   its first screen instead of a day later.
3. **Extend the `CLAUDE.md` two-session paragraph to helpers**, which costs nothing and fixes
   nothing, but stops the next person rediscovering it.

## Severity

Medium in effect and high in reach: every helper this repository adds carries the same window,
and every prompt that calls one takes the miss branch inside it.

---

**Reconciliation 260825-1430 (reconciler, domain `code`, HEAD `3d4b181`). Stays `_o_`. The
mechanism is unchanged; two counts in the body are superseded.**

Nothing in `a99e680..3d4b181` touches helper resolution. Every call site is still
`"$FUSION_PLUGIN_ROOT/bin/<name>"`, part (c) of `shared/decisions/260810-1544_*` is still
unanswered, and neither of the two candidate directions is built. The defect is open on its
own terms.

**What is stale is arithmetic, not analysis.** This record states *28 unattributed records*
in its summary and at `## What was measured`, and *42 records filed while the helper was
unreachable* under `## Why the miss is silent`. Both numbers came from the first pass over
the set. The cross-referenced record was corrected in `3d4b181` and now states 31 and 45
against the same predicate; I reproduced its table independently at HEAD and read 70 total,
25 person, 14 reason, 31 neither. So the failure rate this record quotes as *67 per cent*
(28 of 42) is 69 per cent (31 of 45). The body is left as written, because the correction
belongs where the measurement lives:
`260825-1250_*_twenty-eight-records-filed-since-the-attribution-rule-landed-carry-no-person-half-and-no-stated-reason.md`
`## What was measured` and its `### Three passes produced three different counts of one set`
carry the current figures and why three passes disagreed.

**One claim of this record was verified rather than carried over.** The 21-hour window is
real: `bin/fusion-identity` was added to the work tree in `3ba7a46` at 2026-08-24 11:30:31
and the installed copy at `~/.fusion/bin/fusion-identity` carries mtime 2026-08-25 08:29.
All 31 records in the set are stamped between `260824-1621_*_the-filing-rules-residual-branch-promises-a-person-line-that-exit-5-does-not-print.md` and `260824-2155`, inside that
window without exception, and every in-window record stamped `260825` carries its person
half.

---
Also seen: 260826-0904 by coder — the orchestrator's own Setup on 2026-08-26 took the `[ -x ]` miss branch on `bin/fusion-events`, added to this work tree in `97407df` earlier in the same Circle and still absent from `$FUSION_PLUGIN_ROOT`.

**Second instance, verified rather than carried over.** `git log --diff-filter=A -- bin/fusion-events`
puts the helper in the work tree at `97407df`; `~/.fusion/bin/fusion-events` does not exist. So the
Setup step that reads the session's Turn count found no helper to run and fell back to a hand-scoped
read of `fusion-workbench/orchestrator-events.jsonl`, which is exactly the branch the guard is written
for. Nothing malfunctioned: `260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md`
requires the guard, and the guard behaved. What the instance adds is that the lag now reaches the
helper this Circle built to fix a different reading fault, so the Circle could not use its own output
in the session that produced it.

**Not discharged by `260825-2023-presence-travels-monitor-filters-own-checkout`.** The Circle's
Directive is presence and per-checkout reading; helper resolution is untouched by every commit in its
range, each call site is still `"$FUSION_PLUGIN_ROOT/bin/<name>"`, and part (c) of
`260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md` stays
unanswered, so neither candidate direction in `## Candidate directions, none preferred here` is built.
The marker stays `_o_`. This note records a sighting, not a closure.

---
Resolved: 260827-2020-coder-setup-skill-steps-5-18b-c4.md by coder (plan `260827-1756` step 18b, candidate direction 2). `skills/setup/SKILL.md` Step 2 now, when `bin/fusion-plugin-cwd` exits 0, lists every `bin/` executable present in the work tree and absent from `$FUSION_PLUGIN_ROOT/bin/`, and the Done report names each. It measures the window and changes no resolution: whether the work-tree preference reaches helper resolution is part (c) of `260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md` and stays deliberately unanswered.
