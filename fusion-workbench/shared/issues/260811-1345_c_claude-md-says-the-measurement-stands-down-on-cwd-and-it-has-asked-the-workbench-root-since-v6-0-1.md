# CLAUDE.md says the protected-path measurement stands down on cwd, and it has asked the workbench root since v6.0.1

---
**Severity:** Low
**Domain:** code
**Filed by:** orchestrator, on a finding reported by coder during task 36 (Turn 2)
**Affects:** `CLAUDE.md:127`
**Cross-references:** `fusion-workbench/circles/260801-1244-guard-rules-write/issues/260805-1839_c_der-tracker-steht-im-plugin-repo-nur-dann-still-wenn-cwd-exakt-die-repo-wurzel-ist.md` (closed by commit `1d5eed6`)

---

## The defect

`CLAUDE.md:127`, in the "Where to look when something breaks" table, carries this sentence about
the protected-path halt:

> In this repo the measurement stands down entirely, so seeing it here means the cwd was not the
> plugin root.

The second clause has been false since v6.0.1. The measurement's stand-down asks the **workbench
root** it walks up to, through `isFusionPluginRoot(root)` folded into `measurementRoot()`, not cwd.
`CLAUDE.md`'s own opening paragraph says exactly that, two hundred lines earlier: the measurement
root moved up in v6.0.1 to close a subdirectory hole, and its stand-down had to move up with it, or
a session started in `fusion-workbench/` would have begun reverting the developer's own files.

So the file contradicts itself, and the row a reader consults *while debugging a halt* is the wrong
half.

## Why it survived

The sentence was true when written, for the write-tool check, which does still ask cwd
(`isFusionPluginCwd()` in `hooks/lib/self-detect.ts`). v6.0.1 split the two halves deliberately and
updated the opening paragraph. The troubleshooting row was not revisited, and nothing reads it.

## Fix direction

State which half asks which root, or point the row at the opening paragraph rather than restating
it. Restating is what let the two drift apart.

Note that commit `1d5eed6` (task 36, this session) moved the **tracker's churn and event
stand-down** onto the workbench root as well, so at the time of filing two of the three now agree
and the write-tool deny is the one that still asks cwd. Check all three when writing the correction
rather than trusting this paragraph.

---
Resolved: All three gates were read at HEAD before the sentence was written. The write-tool deny
asks cwd (`hooks/guard.ts`, `isFusionPluginCwd()`); the protected-path measurement asks the
workbench root (`hooks/guard.ts` and `hooks/tracker.ts` through `measurementRoot()`); the
tracker's churn and event stand-down asks the workbench root too, moved there by `1d5eed6`. So the
write-tool deny is the only one still keyed to cwd. The troubleshooting row now says the
measurement asks the workbench root, points at the file's opening paragraph as the owner of that
split rather than restating it — restating is what let the two drift — and ends on what a halt
tells a debugger: the root walked up to is not this repository, and nothing about cwd. Suite green
on a quiet tree: 50 files, 1301 tests, exit 0.
