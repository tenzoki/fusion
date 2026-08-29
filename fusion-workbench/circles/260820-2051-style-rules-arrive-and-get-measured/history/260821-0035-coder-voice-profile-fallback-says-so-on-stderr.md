# Coder — the voice-profile fallback says so on standard error

**Status:** Complete
**Agent:** coder
**Date:** 2026-08-21
**HEAD at dispatch:** `dc78da2`
**Domain:** code

---

## What was asked

Step 4 of `260820-2324_*_plan-style-rules-arrive-and-get-measured.md`:
make `emit_voice_profile` in `bin/fusion-rules` announce on standard error that it fell back to the
English variant of a profile family, leave standard output untouched, append the cases to the
existing `hooks/lib/__tests__/rules-voice-profile.test.ts`, and carry the decision record's
qualification into the helper's own comment.

## What was built

**`bin/fusion-rules`, `emit_voice_profile`.** The fallback branch now prints the resolved path to
standard output exactly as before and one line to standard error:

```
fusion-rules: voice profile chat-voice: requested variant de is absent, resolved to en
```

The family, the requested variant and the resolved one, which is what the agent needs to tell a
fallback from a project that declared `en`. Standard output is byte-identical in every case, which is
why the signal went to the other stream rather than into a new line format: the emission contract is
one path per line and `rules-emission-golden.test.ts` holds it.

The branch that emits the notice is exactly the branch where standard output is ambiguous, and the
four cases stay disjoint and complete:

| case | stdout | stderr |
|---|---|---|
| requested variant present | its path | silent |
| absent, lang != en, en present | the en path | the notice |
| absent, lang != en, en absent | nothing | silent — the agent detects the absence |
| lang == en, absent | nothing | silent — same |

**The qualification is in the helper's comment, not glossed.** Standard error makes the event
*detectable*, which is what the mechanism change owes. Whether the agent then writes the history line
stays an instruction-following obligation, and this project has documented such obligations as
overridable under load. The comment says so and says not to read the notice as compliance
(`260820-2314_*_is-the-voice-profile-fallback-capability-in-scope-given-116-lines-of-hook-test-head-room.md`).

**Two cases appended to `hooks/lib/__tests__/rules-voice-profile.test.ts`**, no new file. A prose
agent in a `de/de` project missing `chat-voice-de.yaml` gets `[CHAT_EN, WRITE_DE]` on standard output
and exactly one line on standard error, which pins the notice to the family that actually fell back;
a project declaring `en` gets the same chat path and an empty standard error. The file's single
process seam now captures both streams (`runRulesBoth`), with the old `runRules` a one-line wrapper
over it, so no existing case changed.

## Verification

`cd hooks && npm test` — exit 0, 40 files, 718 tests.

The four acceptance criteria, each observed rather than reasoned about:

1. Scratch project, `**Language:** de`, only `chat-voice-en.yaml` present: standard output carried
   `./fusion-workbench/stilwerk/chat-voice-en.yaml`, standard error carried the one naming line above,
   exit 0.
2. Same project with `**Language:** en`: same standard output, standard error zero bytes, exit 0.
3. `npx vitest run lib/__tests__/rules-emission-golden.test.ts` green, and
   `hooks/lib/__tests__/fixtures/rules-emission.golden` is unmodified in a path-scoped `git status`.
   Standard output did not move. The other fixture in that directory, `surface-growth.golden`, was
   regenerated, which belongs to criterion 4's bound and not to this one.
4. The hook test tree grew 20 293 -> 20 332 lines, **+39**, under the cap of 40, with 43 of the
   surface's 82 lines of head-room left. `npx vitest run lib/__tests__/surface-growth-bound.test.ts`
   green.

**One gate moved and was re-approved rather than routed around.** `reference-resolution-lint`'s count
pin went from 1244/161/115 to 1247/162/115. All four tokens are the helper's new comment: three cited
paths and the anchor `## Project language`. Attributed by restoring `bin/fusion-rules` alone to HEAD
and re-running the gate, which was green at the old numbers. The re-approval note above `BASELINE`
records that, and its six lines are part of the +39 counted above.

## What this does not close, and it is half the record

`260814-1332_*_the-voice-profile-fallback-is-performed-by-the-helper-so-the-agent-cannot-record-it.md`
stays open. The helper-side half is done: the record's option 1 is exactly what landed, and the event
is now detectable. The rule-side half is not, and it is outside this step's file list.

Two things in `rules/fusion-workbench-conventions.md` `## Project language` are now wrong or missing,
both at the paragraph the issue is cited from:

- The sentence "It emits only the resolved path, so an agent cannot today tell a fallback from a
  project that declared `en`" became false with this commit. It still stands.
- The obligation the issue's title is about has no home in the rule any more. Commit `1a36fe4` (the
  curator's first run) replaced "the agent falls back … and records a single line in its session
  history file noting the fallback" with the description of the defect, so the rule no longer asks any
  agent to record the fallback. The current text refers to "the history line this rule asks for" while
  no longer asking for it.

So the agent can now detect the fallback and is instructed by nothing to record it. Closing the issue
would assert an obligation is reachable when the obligation is gone. The note appended to the record
says this and names the edit that would close it.

---

**Files changed**

- `/Users/k1/Projects/productive/fusion/bin/fusion-rules`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/rules-voice-profile.test.ts`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/reference-resolution-lint.test.ts`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/surface-growth.golden`
- `/Users/k1/Projects/productive/fusion/260820-2324_*_plan-style-rules-arrive-and-get-measured.md` (step 4 marked `[DONE]`)
- `/Users/k1/Projects/productive/fusion/260814-1332_*_the-voice-profile-fallback-is-performed-by-the-helper-so-the-agent-cannot-record-it.md` (note appended, stays open)
