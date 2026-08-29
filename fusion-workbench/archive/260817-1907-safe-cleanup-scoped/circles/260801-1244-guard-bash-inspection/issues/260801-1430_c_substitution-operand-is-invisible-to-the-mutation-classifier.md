A command substitution used as an operand is invisible to the mutation classifier, so `rm $(echo rules/x.md)` is allowed where `rm $VAR` denies

---

The plan's fail-closed rule (`## Approach` → `### The fail-closed rule and its bound`) defines a written operand as **unresolved** when it "survives quote handling still containing `$`, a backtick, or a `~` prefix". For a `$(…)` or backtick substitution that condition can never be met, because the operand does not survive at all.

`hooks/lib/shell-parse.ts:490` (`scanSegments`) lifts the substitution body out into its own segment at `depth + 1` and pushes a single **space** into the outer segment in its place — correctly, because what lands there at run time is the substitution's *value*, not its text. The consequence for the mutation classifier is that the operand disappears rather than becoming unresolvable.

Verified with `parseCommand(cmd, { quoted: "capture" })`:

```
"rm `echo rules/x.md`"   => [{ text: "rm", depth: 0 }, { text: "echo rules/x.md", depth: 1 }]
"rm $(echo rules/x.md)"  => [{ text: "rm", depth: 0 }, { text: "echo rules/x.md", depth: 1 }]
```

The depth-0 segment is a bare `rm` with zero positionals, so `classifyBashMutation` sees no written operand and allows. Confirmed against the implemented classifier:

```
rm $VAR                  -> DENY  (fail-closed, operand carries `$`)
rm ~/x                   -> DENY  (fail-closed, `~` prefix)
rm $(echo rules/x.md)    -> ALLOW  <-- this issue
rm `echo rules/x.md`     -> ALLOW  <-- this issue
$(rm rules/x.md)         -> DENY  (the body is its own segment and is classified)
mv rules/x.md $(mktemp)  -> DENY  (the protected operand is still visible)
```

Only the shape where the **verb is outside and the path is inside** slips through. A substitution in redirection-target position (`echo hi > $(mktemp)`) has the same cause: the operator is left dangling and its target is gone.

## Why it was not fixed in step 2

The fix does not belong in `bash-mutation-guard.ts`. That module sees only post-parse segments, and by then the evidence is gone. The correct fix is in `shell-parse.ts`: in **capture mode only**, leave an unresolvable token behind instead of a space, so `resolveWord` reports `{ unresolved: true }` and the existing fail-closed rule fires with no change to the classifier. Blank mode must stay byte-identical, so the git classifier and the blank-mode equivalence assertion are untouched.

That is a change to a committed step-1 file and, more importantly, a change to the **deny surface** — `rm -rf "$(pwd)/build"` would begin to deny, which is what the fail-closed rule prescribes but is also exactly the class of decision the plan's Q3 human gate exists to review. So it is filed rather than applied.

## Proposed resolution

Take it to the Q3 gate together with the verb table, as a yes/no on one behaviour: *does a run-time-constructed operand of a recognised verb deny (consistent with `$VAR`), or stay allowed (consistent with today)?*

- **If yes** — thread the quote mode into `scanSegments` and push a filler containing a `$` instead of a space. Roughly five lines, no classifier change, and the step-3 suite gains `rm $(echo rules/x.md)` and `` rm `echo rules/x.md` `` as deny cases.
- **If no** — the residual statement in the module docstring and in step 7's documentation must name this case explicitly, alongside the unrecognised-program residual. It is a materially easier bypass than writing a build script.

Until it is decided, `hooks/lib/bash-mutation-guard.ts` documents it in its module docstring under the accepted residual, and the step-3 suite should assert the **current** behaviour (allow) so the expectation is recorded rather than assumed.

## Context

Found while implementing plan step 2 (`260801-1253_*_plan-guard-bash-inspection.md`), by probing `parseCommand` on mutation-shaped commands rather than reasoning about it. Not a defect in step 1: `scanSegments` behaves as designed and as the git classifier needs. It is a gap between the parser's contract and what the plan's fail-closed rule assumed of it.

---
Resolved: Fixed at the Q3 gate, as the "yes" branch of the proposed resolution — a run-time-constructed operand of a recognised verb now denies, consistent with `$VAR`. `hooks/lib/shell-parse.ts` threads a `filler` through `scanSegments` and leaves `SUBSTITUTION_FILLER` (`$(…)`) in the outer segment in CAPTURE mode only, where a single space used to land; `resolveWord` reports it unresolved and the existing fail-closed rule in `bash-mutation-guard.ts` fires with no classifier change. Blank mode still gets the space, so the git classifier and the blank-mode equivalence assertion are byte-identical in behaviour (84 + 30 cases green, unmodified). `rm $(echo rules/x.md)`, `` rm `echo rules/x.md` ``, `rm -rf "$(pwd)/build"` and `echo hi > $(mktemp)` now deny; `cd "$(dirname "$0")"`, `echo "$(date)" >> /tmp/log` and `git commit -m "$(cat msg)"` still allow, because the substitution is not an operand of a recognised verb. The filler glues to its neighbours the way the value would, so `"$(pwd)/build"` stays one word.
