# Coder — steps 7 and 8 of the protected-path removal

**Date:** 2026-08-12 14:28
**Agent:** coder
**Status:** Complete
**Dispatched by:** orchestrator
**Plan:** `shared/planning/260812-1232_p_remove-the-protected-path-half-of-the-compliance-guard.md`, steps 7–8

---

## What was asked

The configuration half, as one commit: the loader stops declaring, merging, validating
and reporting `guard.protectedPaths` and gains a diagnostic for a project that still
declares it (step 7), and the four data files stop declaring it (step 8). Split across
two commits there would be a boundary where the shipped `hooks/config.json` declares a
key the loader has just started calling retired, and fusion's own diagnostic would fire
against fusion.

## Verification

`cd hooks && npm test` — exit 0.

| | Test files | Tests |
|---|---|---|
| Baseline at `60c9cd8` | 48 | 1000 |
| After steps 7–8 | 48 | 986 |

`legacy-halt-clearing.test.ts` — 6 cases, green. A consuming project's halt, raised by a
trigger no surviving code produces, still loads, still blocks and still clears after the
configuration change as it did after the code change.

Per the dispatch, the wall clock is not reported: the suite's timing on this machine is
unreliable under load and the exit code is the measurement. (69.9 s against a 61.4 s
baseline, both measured, neither attributable.)

The −14 accounts exactly: `config.test.ts` 84 → 68 and
`guard-project-config-integration.test.ts` 14 → 16. Inside the 68: three describes deleted
whole (22 cases — provenance 5, `projectDeclaredProtectedPaths` 7, the self-protection
floor 10), one further case deleted (the shipped list's eight patterns), seven added for
the retired key. Nothing failed quietly into the count.

## Step 7 — the loader

`GuardSettings.guard` loses `protectedPaths`; `GuardConfig` loses `protectedPathsSource`
and `floorPaths`; `projectDeclaredProtectedPaths` is deleted; `DEFAULTS` and
`CONTAINER_LEAF_RULES` lose their entries; the provenance computation and the two-spelling
floor come out of `loadConfig`. `ConfigLayer` survives, as the plan says, and now carries a
note saying why it survived the field that was its only public reader.

### The diagnostic, which is the substantive part

```
Guard configuration at <path>: "guard.protectedPaths" no longer exists — fusion removed
the protected-path mechanism it configured, so declaring the list protects nothing and
nothing reads it. The key was ignored; the rest of this file is unaffected. Delete the
line to stop this advisory.
```

One line, no wrapping, `<path>` being the file the layer was read from.

It is a **table**, `RETIRED_CONTAINER_LEAVES`, mirroring `CONTAINER_LEAF_RULES` next to it,
and it introduces a third state a key can be in. A key this loader knows is validated; a
key it does not know is carried through untouched and undiagnosed, and must be, because the
seeded template is mostly underscore-prefixed documentation keys. A RETIRED key looks
exactly like an unknown key to the validator and must not be treated as one. The value is
dropped and the sentence is emitted, per leaf, in `validateLayer` — which is what makes it
repeat on every guarded tool call, since `hooks/guard.ts` emits one `guard_advisory` per
entry of `config.diagnostics` and the loader runs once per hook process.

Four things the wording carries, each because leaving it out costs something:

- **the key**, so the reader can find the line;
- **"no longer exists"**, so it reads as a removal rather than a typo the reader should go
  and fix. The plan asked for exactly this and it is why the message is not routed through
  the type-validation frame, which would have said "must be an array of glob strings";
- **"the rest of this file is unaffected"**, so a project does not read the advisory as
  "my configuration was dropped" and rewrite settings that are being honoured;
- **"Delete the line to stop this advisory"**, so the noise has a stated end.

**It is UNSCOPED — both layers — and that is a departure from the `guard.enabled` refusal
it is modelled on.** That refusal is project-only because the plugin layer may legitimately
set the key. A retired key is retired for everybody, so scoping it to the project layer
would encode a distinction that no longer exists, and a stale plugin `config.json` still
carrying the key would then say nothing. The precedent is the absent-plugin-file diagnostic
in `readLayer`, which is also a per-call advisory only a reinstall can silence.

### One diagnostic rewritten that the plan did not name

`readLayer`'s absent-plugin-file message said "fusion ships the only non-empty
protectedPaths list in that file, so nothing is protected beyond what this project
declares". That was the whole argument of `260809-1101` and it is now false. The diagnostic
stays — a file fusion ships is missing — with a smaller and stated claim: every leaf falls
through to `DEFAULTS`, which the shipped plugin file agrees with leaf for leaf, so the
measurable cost of the absence today is nothing. Its docstring says so in those words
rather than leaving the reader to notice that the reason evaporated.

### The floor is a loss, and it is recorded as one in three places

Nothing in the guard defends `fusion-guard.json` from an agent any more. `260804-1604` (two
spellings) and `260802-1912` (only once the file exists) are implemented decisions whose
subject this deletes. The module docstring, the test file where the eleven floor cases
stood, and the seeded template each say it in their own register, and each names the one
thing that still bounds it: the file is git-tracked, so a change to it appears in a diff.
That was already the bound on the gap the floor never covered — the window before the file
exists — and it is now the only bound there is.

## Step 8 — the data files

`hooks/config.json` and `hooks/config.example.json` lose the eight patterns; `escalation`
and `churn` are untouched, as directed. `hooks/config.json`'s `_comment` said the file
"defines what the guard protects" and no longer does, so it was rewritten in the same edit.

`templates/fusion-guard.json` loses `_inherits`, `_protectsItself` and
`_inFusionsOwnSourceTree`; `_override` is rewritten; `fusion-guard.json` at the root is a
byte-identical copy, which `config.test.ts` pins and `cmp` confirms.

### What the remaining prose was checked against, since the dispatch asked

The two notes the dispatch reported measured stale on another project this morning — a
per-top-level-key merge, and a branch policy — **are not in this template**. It says "per
LEAF", which is what the loader does, and it makes no git claim at all. Those two must be in
that project's own seeded copy, which is a **different and older revision of this file**,
and that is worth stating plainly: `/fusion:setup` copies this template once, at setup, and
nothing updates a project's copy afterwards. Every consuming project set up before today
keeps prose describing a floor and an exemption that no longer exist, and this edit does not
reach any of them. The retired-key advisory is the only thing that does, which is the
loudness argument from the other side.

Of the four notes the plan says to keep, three are true as written and were left alone:

- `_what` — read from the project root on every guarded tool call, merged over the plugin
  file then the defaults; verified against `guard.ts`. Its "keys the parser does not
  recognise are never reported" needed one clause, since that is now false for exactly one
  key, and it points at `_override` for which.
- `_turnBudget` — every claim holds: read by `bin/fusion-turn-budget` and no hook, the
  default defined once in `DEFAULTS`, out-of-range values dropped and named, no ceiling.
  `turn-budget-lint.test.ts` pins the parts that are checkable and passes.
- `_guardEnabled` — holds, including "on every guarded call until the line is removed",
  which is the same mechanism the new advisory uses.

`_gitTracked` was **rewritten, not kept**, and the plan did not foresee it. Two sentences in
it were false the moment the floor went: it said the file "decides what the guard protects",
and it closed by naming the gap in `_protectsItself` — a key this step deletes, so the
citation dangled as well. It now says what the file actually decides and states the loss
directly: fusion used to defend this file against its own agents, that defence is gone, and
the git history is where you see an agent edit it.

## Test-side judgement calls

**Re-pointed, not deleted, wherever the subject survives** — the same principle step 2 used.
Every merge, validation, cache and template case was written on `protectedPaths` because it
was the one leaf whose declared value differed visibly from both other layers; their subject
is the leaf walk, not the list, and they are re-pointed at `categoryPaths`. Deleted outright
only where the subject *was* the list: the three describes and the shipped-list case.

**The byte-identity reference lost its constraint, not its case.** `loadConfigAsOfStep5` is a
transcription of the loader before the project layer existed, and it was written to pin that
no path protected today becomes unprotected. That constraint died with the mechanism.
`protectedPaths` is struck from the transcription and the case now pins the weaker property
it can still measure: introducing a project layer moved nothing for a project without one.
Said in the header comment rather than left for a reader to work out from a shorter object.

**"An explicit null project root is honoured" had to be rebuilt.** Its only witness was the
floor: a resolved project root appended `fusion-guard.json` to the effective list, so the
absence of that entry proved the walk had not happened. With no floor there is nothing
observable — in this repository the walk finds a root whose configuration declares no
setting, so a `??` default would produce an identical object. The case now builds its own
witness: a temporary workbench root with a `fusion-guard.json` that declares
`defaultSensitivity`, a `chdir` into it with a `finally`, an assertion that the walk *would*
find it (so the case cannot pass vacuously), and then that the explicit `null` does not.
Stronger than what it replaces, because it no longer depends on where the runner started.

## The two integration cases, in a file the plan does not list

`guard-project-config-integration.test.ts` gains a describe. The unit cases pin the sentence
the loader produces; they cannot pin that it leaves the loader. The two cases are: the
advisory reaches the event log from a real subprocess naming the key, while the write is
allowed and no block is counted; and three guarded calls — `Edit`, `Bash`, `Write` — produce
three advisories, which is the "on every guarded tool call" claim that a once-per-session
diagnostic would fail.

This is the natural home (it is the file carved out in step 3 for exactly this subject) and
it is two cases, not a re-opening of the file.

## What the plan got wrong

1. **Step 7's file list is incomplete: `guard-project-config-integration.test.ts`.** The
   plan names `config.ts` and `config.test.ts` and calls for a diagnostic whose defining
   property — repetition on every guarded call — is not a property of the loader at all. It
   belongs to `guard.ts`'s emission loop, and no unit case over `loadConfig` can reach it.
   The two cases above are the only place the plan's own acceptance criterion is measured.

2. **`readLayer`'s absent-plugin-file diagnostic is not in any step.** Its text names the
   protected list as the reason the plugin layer's absence matters. Step 7 does not mention
   it, step 9's inventory is prose surfaces, and it is an operator string a consuming project
   reads. Fixed here because it is in the file step 7 owns.

3. **`_gitTracked` cannot be kept verbatim.** Step 8 says keep it; it carries a false claim
   and a citation of a key the same step deletes.

4. **The plan reads the seeded template as fusion's surface to a consuming project, and for
   every project already set up it is not.** Nothing propagates a template edit into a
   project's existing copy. This is not a defect in the plan's reasoning about *this* file,
   but it does mean step 8 improves the surface only for projects set up from tomorrow, and
   the plan's Directive ("every test and prose surface that describes any of it") is
   unreachable for the copies already out there.

## Out of scope, found, and not touched

- **`hooks/lib/project-relative.ts` justifies its own existence by the deleted key**, at
  `:26` ("so the relative globs in `guard.protectedPaths` can match it") and at `:75` (the
  function's docstring: "`filePath` as it should be matched against `guard.protectedPaths`").
  The module is live — `guard.ts` CHECK 3 and `churn.ts` both call it — so these are current
  docstrings describing a dead reason, not history. Not in step 6's list, not in step 9's.
- **`skills/help/SKILL.md:104`** points a user at `hooks/config.example.json` for "Categories,
  protected paths, churn thresholds, escalation behavior". After this step that file has no
  protected paths. `skills/` is not in step 9's file list, so nothing in the plan removes it.
- `README-hooks.md` was **not** touched. Nothing in these two steps forced it: the two lint
  gates that caught step 6 read the `hooks/lib` file table and citation tokens, and this step
  deletes no module and adds no citation. It remains as step 6 left it — more internally
  inconsistent than before, and step 9's to finish.

## Not done, and deliberately

- **No commit.** The orchestrator commits.
- **Step 9 untouched**: `rules/protected-path-discipline.md` still ships and `bin/fusion-rules`
  still emits it; `CLAUDE.md`, the READMEs and `docs/` still describe the mechanism.
- **No verification against a non-fusion project root.** Step 10. The suite's integration
  cases do spawn throwaway roots that are not this repository — both new cases above are such
  roots — but that is not the standing measurement step 10 asks for.

## For the reconciler

`circles/260801-1244-guard-rules-write/decisions/260802-1912_i_does-the-self-protection-floor-apply-before-the-config-file-exists.md`
and `.../260804-1604` (filed as an issue, closed) are the floor's records. The plan's
supersession list names three `_i_` decisions whose subject it deletes and does not name
`260802-1912`, whose subject — the floor's existence condition — this step deletes outright.
