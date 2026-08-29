The Turn-budget record's closing footer says `fusion-guard.json` was not edited, in the commit that commits it

---
`260814-2022_*_this-repository-cannot-set-its-own-turn-budget-…` closes with the sentence "`fusion-guard.json` and `templates/fusion-guard.json` were not edited." The commit carrying that footer, `f0d9d60`, has `fusion-guard.json | 1 +` in its diffstat and says so in its own message: "`fusion-guard.json` is committed with the change that makes it legal." Both sentences describe real and different acts, and the footer is the one that survives as the record.

---
**Found by:** coderev, Turn-6 incremental review of `41c224c..d270666`, review file `260814-2128-coderev-curator-turn-6.md`.
**Owner:** `coder`, or the reconciler at the next pass — it is one sentence in a closed record.
**Severity:** Low.
**Affects:** the `Resolved:` footer of `260814-2022_*_this-repository-cannot-set-its-own-turn-budget-because-a-test-pins-fusion-guard-json-to-the-template.md`.

**Verified 2026-08-14 at HEAD `d270666`.**

## The two true statements

- The Turn-6 task made no edit to either JSON file. The `"orchestrator": { "maxTurns": 12 }` line was already in the working tree, written at 19:35 the previous evening, and the task's whole change was in `hooks/lib/__tests__/config.test.ts`. In that sense the footer is exact.
- `git show f0d9d60 --stat` lists `fusion-guard.json | 1 +`. The commit is where that line entered version control, and the commit message states the intent plainly.

## Why the wording matters here rather than in general

This is the record a future reader opens to answer "why does this repository's guard config differ from the template it is supposed to be a copy of?" The footer is the answer, and it currently reads as though nothing about the configuration changed — while `git log -p -- fusion-guard.json` shows the divergence entering at exactly this commit. `rules/critical-stance.md` §3 is the standard: the claim is verified and the wording under-states what was verified.

## What the fix is

One clause. Something on the order of: *"The task edited neither JSON file; `f0d9d60` commits the working-tree line `"orchestrator": { "maxTurns": 12 }` that had been uncommitted since 19:35, because the test change is what makes it legal."*

The same commit should be read against `260814-2128_*_claude-md-still-calls-the-root-guard-config-byte-identical-to-the-template-…`, which is the shipped-text half of the same omission.

---
Resolved: The closing sentence of `260814-2022_*_this-repository-cannot-set-its-own-turn-budget-…` now separates the two acts instead of reporting only the first. It states that the task itself edited neither JSON file, that commit `f0d9d60` nonetheless commits `fusion-guard.json` because that is where the working-tree line `"orchestrator": { "maxTurns": 12 }`, uncommitted since 2026-08-14 19:35 local, entered version control, and that the test change is what makes the line legal. `templates/fusion-guard.json` was neither edited nor committed, which the sentence still says. `git show f0d9d60 --stat` was read against the claim: it lists `fusion-guard.json | 1 +` and no template. The record stays closed (`_c_`); only its footer changed.
