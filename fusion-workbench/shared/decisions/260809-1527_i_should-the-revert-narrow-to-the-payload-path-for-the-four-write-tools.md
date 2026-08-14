# Should the guard's revert narrow to the payload path for the four write tools, or only its message?

---
**Domain:** code
**Status:** implemented
**Filed by:** orchestrator
**Cross-references:** `shared/planning/260809-1229_*_plan-five-severe-guard-defects.md` (Step 5, and Open Questions item 1); `shared/issues/260809-1107_*_any-writer-active-during-the-tool-call-window-is-attributed-to-the-agent-and-reverted.md`; `shared/analyses/260809-1103-guard-enforced-policies.md`

---

## Question

The guard measures protected paths before and after a tool call and writes back
any path whose fingerprint moved. It cannot tell who moved it. A human editor
saving a file, a file watcher, a build, or a second Claude session are
indistinguishable from the agent inside that window, so the guard today reverts
a human's concurrent work and halts the session for it. That is defect
`260809-1107`, and it is the failure the before-fingerprint was introduced to
prevent, arriving from the other side.

One distinction *is* decidable. For the four write tools (`Write`, `Edit`,
`MultiEdit`, `NotebookEdit`) the tool payload names the path being written, and
`extractFilePath` already reads it. A protected path that changed while being
something other than the payload's path is therefore evidence of a writer that
is not this tool call.

The question is how far that evidence is allowed to travel: into the sentence
the model reads, or into what the guard actually reverts.

## Options

1. **Message only.** The revert is unchanged; the wording stops asserting the
   agent caused the change, and the observed bytes are preserved before being
   written back.
   - Pros: opens nothing. Every path that changed is still restored.
   - Cons: the guard keeps destroying concurrent human work. Preservation makes
     the destruction recoverable, not absent.

2. **Narrow the revert too, for the four write tools only.** A changed protected
   path other than the payload's path is reported and preserved but not written
   back. `Bash` is untouched and keeps the full revert.
   - Pros: removes the actual destruction rather than making it recoverable. The
     residual is genuinely small, because a write tool writes what its payload
     names and has no second write to hide.
   - Cons: it is a narrowing of enforcement, and narrowings are how a guard
     erodes. If a write tool ever does reach a second path (through a link the
     path check missed, or a future tool whose payload does not name everything
     it writes), that change now stands.

3. **Defer and take option 1 in the meantime.**
   - Pros: no decision made under time pressure.
   - Cons: leaves a High-severity defect half-closed, with the destructive half
     intact.

## Constraints

- `Bash` must keep the full revert. The narrowing rests on the payload naming
  the target, and a `Bash` payload names nothing of the kind. Extending this to
  `Bash` would reintroduce exactly the undecidable question that v6.0.0 removed.
- Preservation stays regardless of the answer. It is what makes any wrong
  revert recoverable.
- The halt is unaffected. Whatever is not reverted is still reported.

## Recommendation

The plan recommended option 1, on the constraint that no step may open the
guard's behaviour.

## Decision

**Option 2.** The user chose to narrow the revert as well as the message, at the
gate on 2026-08-09.

The reasoning that supports it, stated so the choice is auditable rather than
merely recorded: a write tool physically writes the path its payload names, so
for those four tools the narrowing has almost nothing to give away. The plan's
counter-example, an `Edit` of A that also changes protected B, has no mechanism
behind it — the Edit tool has no second write. The exposure is not zero, and it
is named in the Cons above, but it is far smaller than the plan's phrasing
implied, and it is bounded by the constraint that `Bash` keeps the full revert.

Against that stands a measured, recurring failure: the guard reverting a human's
save and halting the session, which is precisely how agents end up blocked in a
way nobody can explain.

## Implementation obligations

Any implementation of this decision must satisfy all four:

1. The narrowing applies to `Write`, `Edit`, `MultiEdit` and `NotebookEdit` only.
   `Bash` reverts every changed protected path exactly as it does today.
2. A path that is not reverted is still preserved, still reported in the message,
   and still recorded in the `guard_block` event. Silence is not an option.
3. The halt behaviour is unchanged.
4. A test asserts the `Bash` half explicitly, not only the narrowed half, so a
   later refactor cannot quietly extend the narrowing to `Bash`.

---
Answered: this record, `## Decision` — user chose option 2 at the plan gate, 2026-08-09
Implemented: d8745f0 — the revert narrows to the payload path for the four write tools; Bash reverts every changed protected path unchanged, pinned by the OBLIGATION 4 test and measured by mutation M2 (extending the narrowing to Bash fails it plus 19 existing tests)
Deferred:
Superseded by:

---

**Reconciliation 260809-1651 (reconciler, domain `code`) — `_i_` confirmed. All four implementation obligations are demonstrable in the tree at HEAD `fb262d8`, not only in the `Implemented:` line.**

1. *Narrowing applies to the four write tools only; `Bash` reverts everything.* `narrowingTarget` returns `null` unless `input.tool_name` is in `WRITE_TOOLS = ["Write", "Edit", "MultiEdit", "NotebookEdit"]` (`hooks/tracker.ts:285-286`, `:86`). A `null` spare makes the narrowing branch at `:515` unreachable, so every changed path takes `restorePath`.
2. *A spared path is still preserved, reported and recorded.* `preserve` runs before the branch, for every violation without exception (`hooks/tracker.ts:508-513`); the `left-in-place` outcome carries `preserved` and `sparedBy` (`:518-523`); the `guard_block` loop emits one event per changed path with the comment naming this obligation (`:535-543`); `describe` renders the spared case at `:335`.
3. *Halt behaviour unchanged.* `raiseHalt` is reached from the same place for both verdicts, over a summary built from all outcomes (`:552-560`), with the obligation named in the comment.
4. *A test asserts the `Bash` half explicitly.* `hooks/lib/__tests__/protected-snapshot-integration.test.ts:1448`, "OBLIGATION 4: Bash still reverts every changed protected path, narrowing nothing". It passes, alongside the four narrowed cases in the same describe block.

Obligation 2 carries one implementation detail the record did not ask for and that is worth recording: the spare comparison folds case (`foldCase(change.path) !== foldCase(spared)`, `:515`), because the protected patterns are matched folded and an unfolded comparison would spare `RULES/x.md` from a payload naming `rules/x.md` on a case-insensitive volume. That is a narrowing of the narrowing, in the safe direction.

The record stays `_i_`. `_i_` is terminal; if the exposure named in its own Cons is ever measured, that is a new decision superseding this one, not a reopening.
