# From a subdirectory working directory the protected list matches nothing, while the fail-closed rule still denies

---

**Severity:** Low
**Domain:** code
**Filed by:** coder, during Step 5 of the C5b remediation plan
**Affects:** `hooks/lib/project-relative.ts` (`projectRelative`), `hooks/guard.ts` (the `!isFusionPluginCwd()` gate on the Bash mutation policy), `rules/protected-path-discipline.md`
**Cross-references:**
`circles/260801-1244-guard-rules-write/issues/260804-1604_c_the-self-protection-floor-is-matched-cwd-relative-while-the-file-is-read-root-relative.md` (closed; states this degradation for `rules/**` and calls it arguably correct, and labels its own reachability *inference, not measured*),
`circles/260801-1244-guard-rules-write/planning/260804-1633_o_plan-c5b-remediation-and-ship.md` Step 1

---

## What is wrong

Two things, and the second is the one worth fixing.

**The measurement `260804-1604` did not have.** That record's reachability section says: *"Inference, not measured against a real Claude Code session: the trigger is a session whose working directory is a subdirectory of a fusion-set-up project. I did not verify how Claude Code sets the hook's working directory beyond the harness."* This session is that measurement. Its working directory is `<project>/fusion-workbench`, one level below the project root, and from there the whole relative half of `guard.protectedPaths` matches nothing in the real project. The trigger is not hypothetical and it is not exotic: it is where this session was started.

**The asymmetry that is not in any record.** From that same working directory, a literal write to a genuinely protected path is *allowed*, while an operand the classifier cannot resolve is *denied* fail-closed. The two halves of one policy disagree about whether the policy applies at all. An agent meets a deny whose reason ends "STOP and ask the user" for a scratch-file copy, one command after a `mv` into the project's real `rules/` went through unremarked.

## Measured

Three calls, this session, through the real hook (`hooks/dist/guard.js`, the artifact `hooks/hooks.json` executes), cwd `/Users/k1/Projects/productive/fusion/fusion-workbench`:

```
cd <project> && cp bin/monitor "$SP/monitor.orig"     DENIED  fail-closed, unresolvable operand
cd <project> && mv rules/no-such-file-zzz-probe.md /tmp/   ALLOWED (ran; failed ENOENT)
cd <project> && mv /tmp/no-such-zzz-probe rules/           ALLOWED (ran; failed ENOENT)
Edit bin/monitor                                       ALLOWED
```

Rows 2 and 3 name a protected pattern (`rules/**`) and a protected-ancestor destination; row 4 names `bin/monitor`, which is on the list literally. Both `mv` rows executed rather than being denied, which is the guard's verdict and not the shell's — a denied command never runs at all, and these reported the shell's own `ENOENT`.

## The chain, stated as reasoning rather than as a second measurement

The Bash mutation policy is gated on `!isFusionPluginCwd()`, which reads `process.cwd()`. Row 1 was denied *by that policy's own fail-closed branch*, so the classifier ran, so the gate was open, so the guard does not consider itself in the plugin's repository — correct, because its working directory is `fusion-workbench/`, which holds no `.claude-plugin/plugin.json`. The policy is therefore fully active. `projectRelative(filePath, cwd)` then anchors every pattern at that same working directory, so `/…/fusion/rules/x` lands outside it and comes back as an absolute path, which no relative pattern can match. Rows 2, 3 and 4 follow. **This is inference from the four measured verdicts plus the code, not an instrumented read of the hook's working directory.**

## Why this is not simply `260804-1604` again

`260804-1604` closed the floor's half and argued the rest away in one sentence: *"`rules/**` degrades the same way from a subdirectory, and for `rules/**` that is arguably correct: `sub/rules/` genuinely is a different directory from `project/rules/`, and the protected list is documented as project-relative."* That argument stands on its own terms, and this record does not reopen it.

What the argument does not cover is fail-closed. Fail-closed is not project-relative — it fires on the *shape* of an operand, before any question of which directory it names. So in exactly the configuration where the list protects nothing, the policy is at its most obstructive. An agent that meets that deny reads the rule file, finds "the whole check stands down in the fusion plugin's own repository", sees its own project untouched by the list, and has no account of what it just met. `rules/protected-path-discipline.md` names precisely that outcome as the failure it exists to prevent.

## Suggested direction

Not "widen the matching to the project root" — that is a security-policy change, it would newly deny, and the spec authorises one floor entry rather than a re-anchoring. Two smaller shapes, both cheap:

1. **Scope fail-closed to the coordinate space the list can reach.** When an operand resolves outside the working directory and the effective list holds no absolute pattern that could match it, the unresolved-operand deny is protecting nothing and could allow. This narrows a deny and so needs the same "nothing newly allows" measurement in the other direction.
2. **Say it in the deny reason and in the residual list.** Cheapest, and it discharges the agent-facing half on its own: the rule file's `## Where this check does not reach` gains an entry stating that the patterns are matched against the session's working directory, so a session started below the project root protects only what the floor names, and that fail-closed still applies there.

Option 2 is the one to take if only one is taken. The defect that costs is an agent working around an unexplained deny, not the deny itself.
