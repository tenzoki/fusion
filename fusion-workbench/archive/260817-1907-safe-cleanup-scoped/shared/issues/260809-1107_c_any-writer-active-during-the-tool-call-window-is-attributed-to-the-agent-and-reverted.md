# Any writer active during the tool-call window is attributed to the agent and reverted

---

**Severity:** High — the guard destroys human work, which is the failure the before-fingerprint was introduced to prevent
**Domain:** code (security control)
**Filed by:** analyst, during the guard-enforced-policies analysis
**Affects:** `hooks/tracker.ts` (`measureProtectedPaths`), `hooks/lib/protected-snapshot.ts` (`## The BEFORE fingerprint is the condition of admissibility`), `rules/protected-path-discipline.md` (`## The route to the file does not matter`, the two conceded prices)
**Cross-references:**
`fusion-workbench/shared/analyses/260809-1103-guard-enforced-policies.md` §Findings 2c-2,
`circles/260807-0923-guard-misst-statt-orakelt/issues/260807-1026_c_rueckrollen-auf-head-kann-menschliche-vorarbeit-verwerfen.md` (closed; the same failure in its `HEAD`-restore form)

---

## What is wrong

The measurement attributes a change to a **time window**, not to a tool call. Everything that writes a protected path between the PreToolUse fingerprint and the PostToolUse one is treated as the agent's doing, reverted, and reported to the model as "changed during this tool call".

Concurrent writers exist and are ordinary: the user's own editor saving a rule file, a file watcher, a dev server writing into a protected tree, a second Claude session against the same project (which `CLAUDE.md` documents as possible and merely advises against), a background build the agent started in an earlier call.

The window is not short. It is the full duration of the tool call, so a `Bash` call running a test suite or a build holds it open for minutes.

The reverted content is not preserved anywhere. It is overwritten by the before-fingerprint's bytes and is gone.

## Measured

Real hooks as subprocesses, scratch consuming project, `"protectedPaths": ["rules/**"]`. No agent write anywhere in the sequence:

```
1. PreToolUse for a Bash call            rules/x.md = "ORIGINAL human content"
2. the human saves in their editor       rules/x.md = "HUMAN EDIT made during the tool call"
3. PostToolUse

   -> "rules/x.md was modified and has been restored to its content from before
       this tool call. The guard is now HALTED..."
   -> rules/x.md = "ORIGINAL human content"
   -> escalation.json: haltActive true, trigger protected_path_measured
```

The human's edit is gone, the agent is told it caused it, and the session is halted.

## Why this is not one of the conceded prices

`rules/protected-path-discipline.md:23-26` states two prices and presents them as the whole of what the measurement costs: the change happens before it is seen, and a read is not a change. Neither describes this. Both are about what the guard *fails to prevent*; this is about what the guard *actively destroys*.

`hooks/lib/protected-snapshot.ts:61-69` argues that comparing two snapshots around one tool call "is what makes the measurement attributable, and attribution is what makes reverting permissible at all". The argument is sound and the premise is too strong. Two snapshots around one tool call attribute the change to the interval, and the interval is not exclusively the agent's.

The closed record `260807-1026` fixed the same failure in its earlier form, where the restore target was `HEAD` and a human's staged work was discarded. Carrying the content closed that instance. The window remained.

## Suggested direction

Ordered by cost, and the first two are worth doing whether or not the third is.

1. **Say it.** Add the third price to `rules/protected-path-discipline.md` and to the module header. An agent that meets an unexplained revert works around it; a user who does not know the window exists cannot avoid it. This is the cheapest half and it discharges the agent-facing obligation on its own.
2. **Do not destroy the reverted bytes.** Before writing the before-fingerprint back, write the observed content to `fusion-workbench/.guard-state/` under a timestamped name, and name that file in the sentence the model receives and in the `guard_block` event. A revert that is recoverable is a different failure from one that is not.
3. **Narrow the window where it is cheap.** For the four write tools the agent's target path is in the payload, so a change to a protected path *other* than the one named is evidence of a concurrent writer rather than of the agent. That distinction is decidable from the inputs the hook already has and is worth taking before any attempt to narrow the `Bash` case, where it is not decidable at all.

Point 3 must not be read as re-opening prediction. It does not ask what a command will write; it compares two facts the hook already holds.

## Acceptance criteria

- [x] The window is stated as a third price in `rules/protected-path-discipline.md`, with the measured example.
- [x] A reverted path's observed content is preserved under `.guard-state/` and named in the message the model receives.
- [x] The message no longer asserts that the change was made by this tool call when the hook cannot know that.
- [x] A test writes a protected path from outside the tool call, between the two hooks, and pins the behaviour that is decided on.

---
Resolved: `d8745f0` — all three of the suggested directions were taken, the
third in the wider form the user chose at the plan gate. (1) The observed bytes
are preserved before the write-back, under
`fusion-workbench/.guard-state/reverted/`, retained by count
(`RETAINED_COPIES = 20` in `hooks/lib/reverted-copy.ts`) and named both in the
sentence the model receives and in the `guard_block` event. (2) The message
stopped asserting that this tool call made the change; `measureProtectedPaths`
and the module header now say in as many words that the pair of fingerprints
bounds an interval and not an author. (3) Per
`shared/decisions/260809-1527_*_should-the-revert-narrow-to-the-payload-path-for-the-four-write-tools.md`
(option 2) the revert itself narrows for `Write`, `Edit`, `MultiEdit` and
`NotebookEdit`: a changed protected path other than the payload's is preserved,
described and halted on, but left standing. `Bash` keeps the full revert, and a
test pins that half explicitly so a later refactor cannot quietly extend the
narrowing. Step 6 of
`shared/planning/260809-1229_*_plan-five-severe-guard-defects.md` added the
window as the third price in `rules/protected-path-discipline.md`, with the
measured example from this record.

**Reconciliation 260809-1651 (reconciler, domain `code`) — closure confirmed against the tree, and the decision's four obligations checked separately.**
All four acceptance criteria verified at HEAD `fb262d8`. The third price is in `rules/protected-path-discipline.md` `## What the measurement costs` with this record's measured example. `preserveObserved` writes the observed bytes under `.guard-state/reverted/` before any write-back (`hooks/tracker.ts:508-513`, `hooks/lib/reverted-copy.ts:107-123`) and the copy is named in the message and in the `guard_block` event. The narrowing from `shared/decisions/260809-1527_*` is implemented as that record's option 2 and its four obligations hold: `narrowingTarget` returns `null` for anything outside `WRITE_TOOLS` (`hooks/tracker.ts:285-286`), a spared path is still preserved, described and emitted (`:515-531`, `:535-549`), the halt is raised for a spared path exactly as for a reverted one (`:552-560`), and the `Bash` half is pinned by the case named "OBLIGATION 4" (`hooks/lib/__tests__/protected-snapshot-integration.test.ts:1448`). All five cases under "the revert narrows to the payload path at the four write tools" pass.
