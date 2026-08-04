# The accepted floor residual reaches the guard's own state directory, one step past what the decision record says it reaches

---

**Severity:** Medium
**Domain:** code (security control)
**Filed by:** coder, implementing plan Step 6 (the C5b loader)
**Affects:** `circles/260801-1244-guard-rules-write/decisions/260802-1912_a_does-the-self-protection-floor-apply-before-the-config-file-exists.md` (the residual's stated bound); `hooks/lib/config.ts` (the floor); `rules/protected-path-discipline.md` and `README-hooks.md`, which Step 9 owes a sentence about this residual
**Kind:** NOT a regression. Step 6 is what makes the residual reachable at all — before it, no project configuration existed to narrow anything. The issue is that the residual's stated bound is narrower than its measured reach, not that Step 6 chose wrongly.
**Cross-references:**
`hooks/lib/__tests__/guard-rules-write-integration.test.ts`, `describe("what a project configuration can currently reach — measured, not endorsed")` — both halves of this are asserted there,
`shared/planning/260801-1122_o_spec-normative-consolidation.md:301` (the floor as an invariant),
plan `260802-1856_o_plan-guard-rules-write.md` `### Q2` (where the residual is first written down).

---

## What is wrong

Decision `260802-1912` chose that the self-protection floor applies **once `fusion-guard.json` exists on disk**, and accepted one residual in these words:

> in a project where the file has never been created, an agent may create one that narrows `protectedPaths`, and the guard will honour it from the next tool call onward.

That is true and it is bounded, in the record, by the file being git-tracked so the creation appears in a diff.

What the record does not say is **which** paths the narrowing reaches. `fusion-workbench/.guard-state/**` is an ordinary entry on the plugin's `protectedPaths` list, so a narrowing configuration drops it along with everything else — and that directory is where `escalation.json` lives, which holds `consecutiveBlocks` and `haltActive`. The residual therefore reaches the escalation machinery itself, not only the file list.

## Measured, not argued

Real guard subprocess, throwaway consuming project, shipped `hooks/config.json`, no environment flag set, no `fusion-guard.json` present:

```
  Edit  fusion-workbench/.guard-state/escalation.json     DENY     (before)
  Write fusion-guard.json                                 allow    (floor not yet in force)
        …file written with {"guard":{"protectedPaths":[]}}
  Edit  fusion-workbench/.guard-state/escalation.json     allow    (after, next tool call)
  rm -rf fusion-workbench/.guard-state                    allow
  Edit  fusion-guard.json                                 DENY     (the floor closed behind it)
```

Four tool calls, no flag, both surfaces.

## What bounds it, measured too

The door this does **not** open is the halt, and that is worth recording next to the rest so the residual is not read as wider than it is. A halted guard blocks the narrowing write itself: `CHECK 1` sits above `CHECK 2` on the write-tool path, and the Bash halt fires on `mutation.mutates` before any protected-path question, so both `Write fusion-guard.json` and `echo '{}' > fusion-guard.json` deny while a halt is active. An agent cannot narrow its way out of a halt it is already in; it can only narrow its way out of halts it has not yet earned.

The git-diff bound from the decision record still holds and is the main one. This issue does not dispute it.

## Why it is filed rather than fixed

Three reasons, in order of weight.

**It is a decision, not a defect.** The obvious fix — a second floor entry keeping `fusion-workbench/.guard-state/**` protected regardless of the project's list — widens the hardcoded floor from one path to two, and the spec authorises exactly one (`:301`, "the project configuration file itself"). Widening a floor is the direction a guard may move safely, but it is still a choice about what a project is allowed to configure, and this Circle has already sent one such choice to the user rather than settling it in a docstring.

**The honest bound may be enough.** The residual was accepted on the strength of the git diff, and a `fusion-guard.json` that empties `protectedPaths` is about as visible as a diff gets.

**Step 9 already owes a sentence here.** Reconciliation 260803-1516 recorded that the residual is owed a statement in `rules/protected-path-discipline.md` and it is still not there. Whatever is decided, the sentence that lands should describe the measured reach rather than the narrower one the decision record states.

## Suggested direction

Either add `fusion-workbench/.guard-state/**` to the floor alongside `PROJECT_CONFIG_FILENAME` — one line in `hooks/lib/config.ts`, and the two integration cases that measure the reach today become the cases that pin it closed — or leave it and correct the residual's stated bound in the decision record and in Step 9's documentation. Not both, and not neither.
