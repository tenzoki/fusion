# Coder — the three widenings approved at the verb-table (Q3) gate

**Date:** 260801-1520
**Agent:** coder
**Circle:** `circles/260801-1244-guard-bash-inspection`
**Plan:** `planning/260801-1253_o_plan-guard-bash-inspection.md` — amendment to step 2, ahead of steps 3 and 5
**Status:** Complete

## What was implemented

Three changes, each widening the deny surface, applied to the two files step 1 and step 2
produced. `hooks/guard.ts`, `hooks/dist/` and `.claude-plugin/plugin.json` were not touched.

**1. Wrapper programs are seen through.** `WRAPPER_PROGRAMS` is a second exported table
beside `MUTATION_VERBS`: a row per program that runs another program, naming its
value-taking short flags and its own positional count. The gate asked for `sudo`, `env`,
`command`, `nice`, `timeout` and `xargs`; the table also carries `doas`, `ionice`, `time`,
`nohup`, `setsid` and `stdbuf`, because each is the same one-word bypass and a row costs
nothing. `parallel` is deliberately out — its flag grammar is large enough to be its own
false-positive risk — and that omission is named in the module docstring rather than left
implicit.

The flags were the whole difficulty, exactly as the gate framed it. Only SHORT
value-taking forms need listing (`--user=root` and `--kill-after=5s` are single tokens and
fall out of the generic "a token starting with `-` is a flag" rule), `timeout` consumes one
positional for its duration, and `nice -5` needs no entry because it already looks like a
flag. Leading `VAR=value` assignments are consumed too, so `sudo FOO=1 rm …` and
`env FOO=1 rm …` classify. Skipping runs in a loop, so `sudo env rm …` and
`sudo timeout 5 env rm …` reach the same `rm` a bare invocation would.

**The hop cap was a bug I introduced and then removed.** My first version capped chaining
at 8 hops, and `sudo` × 9 walked straight through the classifier — a fixed cap is a bypass
with a published length. Each hop provably drops at least the wrapper's own command word,
so the loop terminates on its own; the bound is now the word count and exists only so a
future edit cannot make the loop unbounded.

**2. An ancestor directory of a protected path is protected.** `ancestorOfProtected`
compares a written operand against each pattern's LITERAL PREFIX — its glob-free leading
segments, truncated on a path-segment boundary (`agents/**` → `agents`, `hooks/config.json`
→ itself) — and denies when the prefix starts with `operand + "/"`. The segment boundary is
what keeps `rules-draft` from reading as an ancestor of `rules/**`. It gets its own deny
reason, naming the pattern the directory contains, because "writes `hooks`, which is under
protection" would be a confusing thing to tell an agent about a path that is not in the
list.

Two decisions inside this one. The check is **uniform across written operands** rather than
special-cased to destructive verbs, so a destination directory is covered too — otherwise
`mv /tmp/config.json hooks/` overwrites a protected file through a directory the classifier
never inspects. And the **project root is excluded**: `.` is an ancestor of everything, but
`cp x .` writes into the root rather than destroying it, and denying that would catch
ordinary work for nothing (`rm -rf .` is refused by `rm` itself).

**3. A command substitution used as an operand is unresolved, not invisible.** In
`shell-parse.ts`, `scanSegments` takes a `filler` parameter; `parseCommand` passes a single
space in blank mode (byte-identical to the historical behaviour) and `SUBSTITUTION_FILLER`
— the token `$(…)` — in capture mode. `resolveWord` then reports the operand
`{ unresolved: true }` and the classifier's existing fail-closed rule fires with **no
classifier change**, which is what the step-2 coder predicted. The filler carries a `$`, no
whitespace, no segment operator and no `=`, so it glues to its neighbours the way the
substitution's value would (`"$(pwd)/build"` stays one word), can never read as a leading
`VAR=value`, and stays readable when a deny reason quotes the segment back at a human.

Closes `issues/260801-1430_c_substitution-operand-is-invisible-to-the-mutation-classifier.md`
as the "yes" branch of its own proposed resolution.

## Verification

`npx tsc --noEmit` clean. `npm test` in `hooks/`: **346 passed, 13 files** — unchanged, with
`git-branch-guard.test.ts` (84) and `shell-parse.test.ts` (30) unmodified and green. The
blank-mode equivalence assertion still holds, which is the direct evidence that the git
classifier did not move.

**The 42-command matrix, rebuilt and run before AND after.** The step-2 history describes it
but the file was scratch, so it was reconstructed from that description: build and test
commands, git read-side plus `git checkout HEAD --`, reads of protected paths (`cat`,
`grep`, `jq`, `wc`, `sed -n`), `cp -R rules /tmp/backup`, build-output destruction
(`rm -rf node_modules`, `dist`, `hooks/dist`, `build/out`), `sed -i` outside the tree, the
`2>&1` forms, the substitution idioms the gate specifically named (`cd "$(dirname "$0")"`,
`echo "$(date) done" >> /tmp/log`), and a wrapper over a harmless program.

| Version | 42 ordinary commands | Acceptance denies | Acceptance allows |
|---|---|---|---|
| Baseline (`HEAD`, step 2 as committed) | **42/42 allow** | 13/46 | 27/27 |
| After the three changes | **42/42 allow** | **45/46** | 27/27 |

The one acceptance case still allowing is `cd fusion-workbench && rm -rf .guard-state`,
which is plan step 4 (virtual working directory) and not one of the three changes. It was in
my deny list by mistake; it is out of scope and left as it was.

Every case the gate named passes: `sudo rm rules/x.md`, `env rm rules/x.md`,
`xargs rm rules/x.md`, `sudo env rm rules/x.md`, `rm -rf hooks`, `mv hooks /tmp`,
`rm $(echo rules/x.md)` all deny; `rm -rf node_modules` and `rm -rf dist` still allow.

**A second, wider hunt for false positives.** Because "42 still allow" only proves the
matrix I wrote, a separate 52-command corpus of plausible agent work was diffed
verdict-by-verdict against the committed baseline — node housekeeping, workbench moves,
`xargs` pipelines, substitution idioms, `install`/`dd`/`truncate`/`ln` outside the tree.
**Four verdicts changed, all of them the approved semantics:**

- `mv hooks/dist/guard.js hooks/` — ancestor as destination (see below)
- `cp build/out.js "$(mktemp -d)/out.js"`, `mv /tmp/x "$(pwd)/y"`, `rm -rf "$(pwd)/build"`
  — constructed operands of recognised verbs, which is the fail-closed rule doing exactly
  what it says

No new false positive survived. Wrapper flag handling was probed separately against 16
adversarial forms (`xargs --max-args=1`, `timeout --preserve-status 5`, `timeout 5s`,
`env -u FOO`, `nice -5`, `sudo -E -H`, `sudo timeout 5 env`, `stdbuf -o 0`, the sudo chain);
all deny. The wrapper and verb tables share no name, asserted rather than assumed.

Matrices are scratch, not committed. Step 3 still owns the systematic suite and should adopt
these cases.

## What the gate did not anticipate

**The ancestor rule denies writing INTO an ancestor directory, not only destroying one.**
`cp /tmp/x hooks/` and `mv build/out.js hooks/` now deny, because `hooks` is a written
operand in both. The gate's accepted consequences were the destructive ones (`rm -rf hooks`,
`mv hooks /tmp`). This is a strict superset and I kept it deliberately: it is the only thing
that stops `mv /tmp/config.json hooks/` from overwriting a protected file through a
directory-shaped operand. It is cheap to narrow later (apply the ancestor check only to
operands a verb destroys or relocates) at the cost of that case. **It is worth a yes/no
from the user**, since the affected set in this project is exactly `hooks/`, `bin/`,
`fusion-workbench/` and `.claude-plugin/`.

**The three changes compound in one direction only, and it is the intended one.** Wrapper
skipping exposes an inner command word to the same table, so it can only ever turn an
unrecognised program into a recognised one — it cannot make a resolved operand unresolved.
The other two act on operands after the verb is known. So `sudo rm -rf hooks` denies through
both changes 1 and 2, and `sudo rm -rf "$(pwd)"` through all three, but no combination
produces a deny that neither change produces alone. The 52-command hunt is the evidence:
4 changed verdicts, each attributable to exactly one change.

**One residual got slightly worse and should be named at step 7.** `find … | xargs rm -rf`
still allows: `xargs` is now skipped, but the operands arrive on stdin and there is nothing
to classify. Change 1 makes `xargs rm <path>` deny while leaving the piped form — the form
agents actually write — untouched. Closing it would mean fail-closing on any `xargs` over a
mutation verb, which denies a great deal of ordinary work; I did not.

Also still open by design: `rm -rf *` and `rm -rf .` name no directory the ancestor check
can compare (a glob is matched as literal text), so neither is caught. Both are now stated
in the module docstring.

## Files

- `hooks/lib/bash-mutation-guard.ts` — `WRAPPER_PROGRAMS` + `skipWrapper`, `literalPrefix` +
  `ancestorOfProtected` + the ancestor deny reason, an own-property `row()` lookup so a
  program named `constructor` cannot match an inherited `Object.prototype` member, and the
  docstring rewritten (wrappers, ancestors, the revised residual list)
- `hooks/lib/shell-parse.ts` — `SUBSTITUTION_FILLER`, the `filler` parameter on
  `scanSegments`, docstrings
- `planning/260801-1253_o_plan-guard-bash-inspection.md` — step 2 amended with the gate
  outcome. Q3's checkbox left for the orchestrator.
- `issues/260801-1430_c_substitution-operand-…` — `Resolved:` appended, `_o_` → `_c_`

Not committed — the orchestrator commits.
