# T4-1 — root-cause analysis of the repeating guard-path defect

**Date:** 2026-08-03 18:03
**Agent:** analyst
**Circle:** `circles/260801-1244-guard-rules-write`
**Task:** T4-1, dispatched by the orchestrator as a gate on three queued coding tasks
**Status:** Complete

---

## What was asked

Whether a single change closes the defect class found four times in this Circle, or whether the
next narrowing is genuinely right. A hypothesis was offered to argue against: that every
instance is the guard computing a lossy lexical path for matching and then reusing it to ask a
filesystem question, with the unifying fix being to carry spelling and match-path as one value
from entry.

## What was done

Read the four issue files, the two neighbouring open issues (`260802-2320` case folding,
`260803-1251` `fs-locator.absolute()`), the case-folding decision record, the Turn 3 code
review, and the five source files named in the brief. Then measured, rather than reasoned,
three questions the reading raised.

Three probes against `hooks/lib/__tests__/helpers/guard-harness.ts`, retained in the session
scratchpad as `probe-cwd.ts`, `probe-cwd2.ts`, `probe-cwd3.ts`. Each runs the real guard as a
subprocess on a throwaway project and then runs the same command through `bash` in the same
project, so the verdict and the effect on disk are read from one run. One fresh project per
row, since three denials halt the guard.

No code, data, ontology or configuration was modified. The one Bash command that would have
written into the project tree was a `sed -i` on a scratchpad file built from a shell variable;
the guard denied it fail-closed, correctly, and the edit was made with the Edit tool instead.

## What was found

**The four instances are two root causes.** Instances 1 and 2 are closed and were closed
correctly, and instance 2 runs opposite to the hypothesis: its fix added a lexical collapse
rather than preserving a spelling. The live half is instances 3 and 4, which do have the shape
the hypothesis describes.

**The unifying proposal does not close instance 4.** The three-argument predicate
`rulesWriteRefusal(path, fs, spelledAs)` already is the spelling/match pair, passed positionally
instead of as a record. Instance 4 lives in `Cwd`, an interior value upstream of every boundary
pair, so a boundary record changes syntax and no reachability.

**Two further entrances, measured, neither involving `-P` or a symlink.** `CDPATH` written into
the command reaches the entire protected list with no flag, by delete and by write, including
`fusion-workbench/.guard-state/escalation.json`. `pushd -n DIR` is modelled as a directory
change that bash does not perform, and reaches the same set. Both share the defect
`260803-1431` named: the classifier asserts a working directory it cannot compute, because
`firstDirArg` skips every flag it does not recognise and `findCommandWord` skips a leading
assignment.

**The recommendation is the review's direction 2 at its general form**: invert `firstDirArg`
from a blanket flag skip to an allow-list, and yield the existing `CWD_UNKNOWN` for anything
else. Measured cost is two command shapes that change verdict (`cd -P docs && rm ../notes.txt`,
`cd -P build && rm out.js`), and the existing deny reason for an unknown working directory is
already diagnosable.

## Artifacts

- `analyses/260803-1803-guard-path-model-root-cause.md` — the analysis
- `issues/260803-1803_o_the-classifier-asserts-a-working-directory-that-cdpath-and-pushd-n-invalidate.md` — the two new entrances, High, open
- `decisions/260803-1803_o_should-the-guard-degrade-its-working-directory-model-when-cdpath-is-set-in-the-ambient-environment.md` — the ambient-`CDPATH` contract question, open, needs the user

## What was deliberately not done

`260802-2320` (case folding) and `260803-1251` (`fs-locator.absolute()`) were examined and
placed rather than refiled. Case folding is the same root cause as instance 2, touches
`paths.ts` only, and has no ordering dependency on the recommendation. The `absolute()` collapse
is the same root cause as instances 3 and 4 one layer down, remains unreachable behind gate 0,
and the recommendation neither closes it nor makes it reachable. Both stay their own tasks.
