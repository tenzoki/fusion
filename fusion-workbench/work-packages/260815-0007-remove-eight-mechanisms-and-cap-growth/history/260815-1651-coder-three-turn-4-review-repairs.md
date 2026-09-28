# Three Turn 4 review repairs

**Agent:** coder
**Status:** Complete
**Turn:** 4 (not a numbered plan step)
**Anchor:** HEAD was `c1e207d` at dispatch; nothing committed by this run.

Three defect records from the Turn 4 reviews, repaired before the cap step. The suite was green at
39 files and 739 tests before and after — no test was added, none removed, and `RULE_BASELINE` was
not touched (nothing under `rules/` was edited).

## 1. The resume shell reported two figures it is forbidden to report

Record `260815-1631_*_the-resume-shell-that-replaced-the-drift-check-prints-a-two-line-figure-and-an-empty-one.md`.

The block that replaced `bin/fusion-state-drift` at both resume paths tested the wrong thing on both
figures. It branched on whether the anchor was *read* (`[ -n "$A" ]`), not on whether it *resolved*,
and it caught `grep -c`'s exit code with `|| echo unavailable` while `grep -c` prints `0` on stdout
in the very case it exits non-zero. So a stale anchor gave a bare `commits=`, and an event log with
no `turn_start` gave `turns=0` followed by a second line reading `unavailable`.

Both figures now branch on their own **outcome**: each is captured into a variable and reported as
`${VAR:-unavailable}`.

```bash
A=$(sed -n 's/.*git_head_at_start: *"\([^"]*\)".*/\1/p' fusion-workbench/agentstate.yaml 2>/dev/null)
C=$([ -n "$A" ] && git rev-list --count "$A"..HEAD 2>/dev/null)
T=$(grep -c '"event":"turn_start"' fusion-workbench/orchestrator-events.jsonl 2>/dev/null)
echo "commits=${C:-unavailable}"
echo "turns=${T:-unavailable}"
```

The `[ -n "$A" ]` test is kept, moved *inside* the command substitution. It cannot be dropped in
favour of the outcome test alone: with `A` empty the range becomes `..HEAD`, which git reads as
`HEAD..HEAD` and counts as a perfectly successful `0` — the forbidden value, produced by the
"cleaner" form. That is the one non-obvious thing in five lines and it is why the guard looks
redundant and is not.

The prose under the block gained one sentence naming both mechanisms and stating that `turns=0` is a
*real* figure — the log was read, the session stopped before Turn 1 — so the next reader does not
"repair" a correct zero back into the broken form. The same sentence is appended to both copies.

The shape follows a precedent in the same file rather than inventing one:
`agents/orchestrator.md:745`, the record-counts block, already distinguishes an anchor that is
absent from one that does not resolve (`WHY_A=no-anchor-in-agentstate` versus
`workbench-not-in-anchor-commit`).

**Verification, in a scratch git repository** — three commits, a synthetic `agentstate.yaml` and a
synthetic event log, both copies run verbatim, under zsh 5.9 and bash 3.2:

| case | commits | turns |
|---|---|---|
| anchor resolves, log has `turn_start` rows | `2` | `1` |
| log present, no `turn_start` yet (Case A) | `2` | `0`, alone |
| log file absent | `2` | `unavailable` |
| anchor present, does not resolve — `deadbeef` (Case B) | `unavailable` | — |
| no anchor field in the state file | `unavailable` | — |
| state file absent entirely | `unavailable` | — |
| anchor equals HEAD | `0` | — |

Every run exited 0. The old form was run against the Case A / Case B inputs in the same repository
and reproduced both reported faults verbatim (`commits=` empty; `turns=0` then `unavailable`).

**Left open.** The block is still two independent spellings with no shared owner, which is the
record's Cross-cutting paragraph and is not closed by making them agree once. Filed as
`260815-1712_*_the-resume-shell-is-two-independent-copies-and-nothing-holds-them-identical.md`, with
the three options costed (helper, lint, accept). It is a design call about how much mechanism five
lines of shell are worth, inside the Circle that is removing mechanisms — an executor should not
settle that in a repair dispatch.

## 2. `queue_empty` restored

Record `260815-1633_*_queue-empty-left-the-event-vocabulary-in-p-10-and-only-queue-built-was-restored.md`.

Read against `queue_built`, the two events are the same case, and the restoration argument covers
both exactly: neither was about the deleted state file, both record the session's initial queue
shape, and P-11 made the event log the sole durable record of that shape. `queue_empty` marks the
one shape in which Phase 2 never runs at all; without it that session's log is indistinguishable
from one that died in Phase 1. No ground was found on which one belongs and the other does not, so
it is restored rather than the pair being re-argued.

- `agents/orchestrator.md:424` — emitted again in the no-routable-tasks paragraph, ahead of the
  dashboard refresh, where P-10 removed it. The payload is spelled at the call site the way
  `queue_built`'s restoration spells its two counts.
- `agents/orchestrator.md:1183` — the event-type row, directly under `queue_built`.

`bin/monitor` unchanged: it never carried a `queue_empty` colour rule (`git log -S queue_empty --
bin/monitor` is empty), so the event renders at the default as it always did. Nothing under `hooks/`
asserts the event vocabulary — the only occurrence of either name is a comment at
`monitor-warnings-panel.test.ts:739`.

## 3. The third dangling ship-exception

Record `260815-1635_*_the-gitignore-sweep-that-removed-two-dangling-ship-exceptions-missed-the-third.md`.

`!bin/fusion-churn-rank` deleted (was `.gitignore:38`; the file is now 112 lines). The count was not
trusted — the list was re-measured against the directory in both directions:

```
$ diff <(grep -o '^!bin/.*' .gitignore | sed 's|^!bin/||' | sort) <(ls bin/ | sort); echo $?
0
```

**No fourth dangling `!bin/` exception**, and no helper lacking a line: twelve helpers, twelve
exceptions, the two sets now equal. One other exception in the file names a nonexistent path,
`!.env.example` at line 51, and is deliberately left: it is a standing allowance for a placeholder
file this repository has never had, not a ship-exception for a deleted helper, and removing it would
change behaviour the day the file is added.

The record's second half — extending `derivable-enumerations-lint` to this list, so the `bin/` roster
has one gate across both of its homes — was not done. The record marks it a suggestion rather than
part of the defect.

## Files

- `/Users/k1/Projects/productive/fusion/agents/orchestrator.md` — resume block, its prose, both
  `queue_empty` sites
- `/Users/k1/Projects/productive/fusion/skills/setup/SKILL.md` — resume block and its prose
- `/Users/k1/Projects/productive/fusion/.gitignore` — one line deleted

Plus the three records closed and one filed, under this Circle's `issues/`. Renames were done with
plain `mv`, not `git mv`: the git index is left exactly as this run found it, so the orchestrator
stages every path itself at commit time. Nothing was committed.
