# Step 4 — the fusion-repository stand-down and the cwd entry point go

**Date:** 2026-08-16
**Agent:** coder
**Status:** Complete
**Plan:** `circles/260816-1741-guard-becomes-observation-only/planning/260816-1915_p_the-compliance-guard-becomes-observation-only.md`, step 4
**Predecessor commits:** `05d848b` (step 1), `2f624ca` (step 2), `9c79202` (steps 3 and 6)

## What the step asked for

Delete `isFusionPluginCwd()` and its module-level cache; keep `isFusionPluginRoot(dir)`
with a header that justifies a module with no caller; correct the working-directory
warning's header in `hooks/session-start.ts`, two false comments in `hooks/tracker.ts`,
and the pairing claim in four `bin/` headers. No behaviour change anywhere.

## What landed

### `hooks/lib/self-detect.ts`

`isFusionPluginCwd()` and the `let cached` module-level variable are gone. The exported
surface is `isFusionPluginRoot(dir)` alone, unchanged byte for byte in its body.

The header is rewritten around the state decision
`shared/decisions/260812-1232_*_does-the-write-guards-fusion-repo-stand-down-survive-the-loss-of-its-subject.md`
records as option 3. It says in the present tense that nothing under `hooks/` calls the
module, that both mechanisms it served are gone (the write-tool stand-down with the
protected paths on 2026-08-12 and then with the guard's last verdict on 2026-08-16, the
churn stand-down with the heatmap on 2026-08-15), and that the module is kept for the
rule rather than against a caller anyone can name. The rule itself — a stand-down is
evaluated in the coordinate space the mechanism keys its state by — is stated in two
sentences and cited to `CLAUDE.md` for the two measurements behind it, per the step's
instruction to cite and compress rather than restate.

Two things the old header got to say and this one has to say differently. The old text
described a cwd caller passing through `isFusionPluginRoot(process.cwd())`; the new one
says that is still exactly how a cwd-keyed caller inside `hooks/` gets its answer, minus
the process-wide cache, which is worth naming because the cache is what forced every
guard test into its own subprocess. And the old text called `bin/fusion-plugin-cwd` the
other half of a pair; the new one says the shell helper is a live consumer-facing
mechanism of its own, not a copy of this file, so neither side has to move when the other
changes.

### `hooks/session-start.ts`

The warning is unchanged and so is every line of its code. What changed is the paragraph
that justified it. It named two cwd-anchored resolutions and both are gone, so the list
becomes one entry with a real subject: the three `bin/` helpers ask
`bin/fusion-plugin-cwd` about cwd with no upward walk, so a session started one directory
down inside this repository reads the installed plugin copy — rules, prompts, and the root
a skill body's citations open against — instead of the work tree being edited. The two
removed resolutions are kept as history in the paragraph below it, dated, so a reader of
an older tree still finds the account.

The step said not to weaken the warning. The header now states the surviving consequence
in its own terms rather than borrowing the old one's severity: nothing is blocked or
reverted wrongly any more, and an agent can still spend a whole session reading from a
copy days stale against the sources in front of it, silently. That is the failure the
work-tree preference was built to end, which is why the warning stays.

A third stale paragraph in the same file was found, corrected, and then deliberately put
back. The "Why the message is English" section names the guard's deny reasons and the
halt notice as its examples of English operator strings, and both were removed by steps 2,
3 and 6. It was rewritten around live examples and reverted on reading
`rules/fusion-workbench-conventions.md` `## Project language`, which carries the same two
examples in its exempt-surfaces list and cites this section as its worked case. Fixing the
hook alone would leave it diverging from the file that quotes it, and `rules/` is out of
scope for this Circle. Both files agree with each other and both disagree with the tree,
which is a better state to hand on than one surface fixed and its authoring home stale.
Filed as
`circles/260816-1741-guard-becomes-observation-only/issues/260816-2115_o_the-why-the-message-is-english-argument-names-two-removed-mechanisms-as-its-examples.md`,
severity low: the argument holds either way, only its illustrations are dead, and nothing
derives from them.

### `hooks/tracker.ts`

Two comments, both false as of `2f624ca`, both corrected without touching behaviour. The
header paragraph at `:53` and the in-function comment at `:460` each ended by pointing at
a surviving stand-down in `guard.ts` that asks a different directory. There is no
surviving stand-down. Both now say that no hook fusion ships treats its own repository as
a special case, and the in-function one adds the consequence that makes the correction
worth the words: a measurement taken in this repository is now representative of one taken
anywhere, which is the property the release procedure's off-repository verification
requirement (step 15) exists to establish.

### The four `bin/` headers

No behaviour change in any of them, verified by running all four.

`bin/fusion-plugin-cwd` — the "shell half of `isFusionPluginCwd()`" claim becomes: this is
the only cwd-anchored implementation of the criterion, the TS side keeps the root-anchored
`isFusionPluginRoot(dir)`, and the two are different coordinate spaces rather than a pair.
The "one criterion, two implementations / change one, change the other" discipline stays,
narrowed to the *criterion* (top-level `"name": "fusion"`), because the two still have to
agree on what a fusion manifest is even though they no longer agree on which directory to
ask. The consumer list also lost a stale member: it credited `bin/fusion-rules` with "the
guard-internals emission gate", and that emission went with `protected-path-internals.md`
on 2026-08-12. `IN_PLUGIN_REPO` has two use sites in that script today (`:357` the rules
directory, `:459` the double-emission guard) and neither is an internals gate.

`bin/fusion-rules` and `bin/fusion-paths` — each named the helper as the shell half of the
deleted function. Both now name it as the only cwd-anchored implementation and point at
its own header for the split.

`bin/fusion-source-root` — its no-upward-walk bound was justified as congruence with
`hooks/lib/self-detect.ts`. There is nothing left to be congruent with, so the bound is
restated on its own reason: a walk here would resolve a skill's citation against a
repository root the caller never named. The paragraph now also points at the SessionStart
warning as the thing that makes the one surprising case audible, which is the same
correction the session-start header receives from the other side.

## Verification

| Command | Result |
|---|---|
| `cd hooks && npm run build` | exit 0 |
| `cd hooks && npx vitest run lib/__tests__/session-start-subdirectory.test.ts` | 6 passed, 0 failed |
| `./bin/fusion-rules coder` | exit 0, six paths, the five plugin rules under `/Users/k1/Projects/productive/fusion/rules/` |
| `./bin/fusion-paths orchestrator` | exit 0, eleven keys, `bash -x` shows `PLUGIN_ROOT=/Users/k1/Projects/productive/fusion` |
| `./bin/fusion-source-root` | exit 0, prints `/Users/k1/Projects/productive/fusion` |
| `./bin/fusion-plugin-cwd` at root / from `/tmp` | exit 0 / exit 1 |

The work-tree preference is what those last four lines establish. `fusion-rules` emits
`/Users/k1/Projects/productive/fusion/rules/…` and not `/Users/k1/.fusion/rules/…`, which
is the preference visible in the output. `fusion-paths` does not show it in its output —
the preference only decides which prompt the key set is derived from — so it was traced:
`bash -x ./bin/fusion-paths orchestrator` assigns `PLUGIN_ROOT=$PWD` and reads
`/Users/k1/Projects/productive/fusion/agents/orchestrator.md`.

The build pruned the deleted export from the compiled output:
`hooks/dist/lib/self-detect.d.ts` now declares `isFusionPluginRoot` only.

### The red set is unchanged

Full suite before and after, compared per file from the JSON reporter:

```
BEFORE  11 files / 44 cases
AFTER   11 files / 44 cases
DELTA   none, per file
```

`session-start-subdirectory.test.ts` was green before and is green after, which is the
assertion the step cares about most. `reference-resolution-lint.test.ts` was already red
on both of its cases and stays at two: its five dangling references are all in
`README-hooks.md` and `README.md`, which step 11 owns, and none came from this change. Its
resolved-path count moved 1117 → 1118, one net citation added by the rewritten headers,
against a pin of 1122 that steps 9 and 10 re-approve.

## What this step did not do

**The decision record is not annotated.** `260812-1232_a_does-the-write-guards-…` is still
`_a_`. The plan routes every decision transition in this Circle to step 13, held by
`ontocoder`, explicitly so the nine-record walk does not land partial; the step's own note
says so. Annotating it here would be the partial landing that note exists to prevent.
Nothing was committed either, per the dispatch.

**Four surfaces outside `hooks/` and `bin/` still name the deleted function as live.**
`CLAUDE.md:8` states that the surviving write-tool check reads cwd through
`isFusionPluginCwd()` and that the module keeps both entry points; `CLAUDE.md:36` calls
`bin/fusion-plugin-cwd` the shell half of it; `README-hooks.md:187` says the same in its
`hooks/lib` table. All three are out of scope by the dispatch: `CLAUDE.md` is the curator's
gated path and `README-hooks.md` belongs to step 11. The step's stated acceptance —
`grep -rn isFusionPluginCwd` hitting nothing outside `fusion-workbench/` — therefore cannot
hold at this commit and is not claimed. What holds is the load-bearing half: no *caller*
remains, no import of the module remains anywhere under `hooks/`, and the compiled output
carries no such export.

Two mentions of the identifier survive in files this step wrote, both deliberate and both
historical rather than referential: one in `hooks/lib/self-detect.ts`'s header naming what
was deleted from that very module, and one in `bin/fusion-plugin-cwd`'s header naming what
its pairing claim used to point at. Step 2 set the precedent at `hooks/guard.ts:48`, which
names the same function in the same way in an already-approved commit.
