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

---

**Step 3 disposition (coder, 2026-08-05) — branches A and B TOGETHER. STAYS `_o_`.**

This is the finding the plan's first falsification test was written for, and it does not
fit one branch. It is A and B at once: a delivered sentence is false **because** the
classifier's coordinate space is not the one the sentence claims, so correcting the
sentence and writing the residual are one act. Reported as a gap in the rule rather than
pressed into either branch.

**Verified independently before being classified**, as the dispatch required. This record's
measurement was taken through the live hook in one session; I re-measured through the
classifier itself, with the shipped protected list and two working directories, and hit one
trap worth recording: **`hooks/dist` is stale at this commit**, and against it every row
below allows, including the controls. Measured against the TypeScript source built fresh
into a scratch directory, cwd `<project>/fusion-workbench`:

```
rm <project>/rules/x.md                  allow    (DENY from the project root)
mv <project>/rules/x.md /tmp/            allow    (DENY from the project root)
cd <project> && mv /tmp/y rules/         allow    (DENY from the project root)
cd <project> && cp bin/monitor "$SP/x"   DENY     fail-closed, from BOTH directories
rm rules/x.md                            DENY     → a `rules/` under the SESSION's cwd
```

`projectRelative("<project>/rules/x.md", "<project>/fusion-workbench")` returns the
absolute path, and no relative pattern can match one. The last row is the shape of the
whole finding: the guard protects a `rules/` that need not exist and does not protect the
one that does. Confirmed as filed, including the asymmetry.

**Branch A, done.** `rules/protected-path-discipline.md` said "The patterns are
**project-relative**: in a consuming project `rules/**` means that project's own `rules/`
directory, not the plugin's." That is false whenever the session did not start at the root.
The paragraph now says the patterns are matched against the session's working directory,
describes both configurations, carries the measured pair, and closes with the sentence that
discharges the agent-facing half: an allow in that configuration is not a permission, and
writing a protected path because the guard happened to let you is the thing this rule
forbids.

**Branch B, done.** The forensics catalogue gains an entry — one of the two new ones that
open it — carrying the measurement, the `260804-1604` argument this record explicitly does
not reopen, and why that argument does not cover fail-closed.

**Why it stays `_o_`.** Both directions in § Suggested direction are behaviour: scoping
fail-closed to the coordinate space the list can reach, and saying it in the deny reason.
Neither is this step's, and the second is the one this record calls cheapest and most
valuable. What is discharged is the documentation half, in the file every agent loads. The
deny an agent actually meets still does not explain itself.
