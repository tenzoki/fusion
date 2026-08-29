# Coder — the 10.2.0 renumbering swept, the skills golden regenerated

---
**Status:** Complete
**Agent:** coder
**Date:** 2026-08-18
**Dispatched by:** user (after renumbering the release from 11.0.0 to 10.2.0 by hand)
**Verification:** `npm test` in `hooks/` — exit 0, 672 passed (36 files)

---

## What was asked

Regenerate the `skills` growth golden after the renumbering moved `skills/help/SKILL.md`,
judge whether the reference-resolution lint needs re-approving, sweep the tree for anything
the string substitution left behind, and read two specific passages the user changed by
machine.

## The golden — regenerated once, at the end

`UPDATE_SURFACE_GOLDEN=1 npx vitest run lib/__tests__/surface-growth-bound.test.ts`, run
after every edit below rather than before, so the fixture was written once against the final
text. Two files move against `HEAD`, both intended:

| File | Golden | Why |
|---|---|---|
| `skills/help/SKILL.md` | 15 162 -> 15 732 | +555 from the previous session's scope correction, +15 from the renumbering |
| `reference-resolution-lint.test.ts` | 1 026 -> 1 050 lines | the previous session's re-approval log entry |

**No baseline moved.** `git diff` over `surface-growth-bound.test.ts` and
`rules-emission-golden.test.ts` is empty, so every `*_BASELINE` map and every head-room
constant stands as committed.

| Surface | Spent | Head-room | Left |
|---|---|---|---|
| `agents/` (bytes) | 11 360 | 18 000 | 6 640 |
| `skills/` (bytes) | 8 896 | 20 000 | **11 104** |
| hook tests (lines) | 528 | 2 500 | 1 972 |

## The reference lint — not re-approved, because its count did not move

`BASELINE` stands at 1142/148/97 and the gate is green. The rename is invisible to it: class
(a) resolves a path against the tree, and the note resolves under its new name exactly as it
did under the old one, so the two citations of it and the seven inside it are all still
counted. A count that did not move is not a count to re-approve, and no log entry was added.

What *was* corrected in that file is the previous entry's prose: it named the release and the
note by the number they carried before the user's decision. Two spellings changed,
`v11` -> `v10.2` and the note's filename. The line count is unchanged at 1050 and `BASELINE`
was not touched, so this is a stale-name fix inside a log entry, not a re-approval.

## The two passages the user asked to be read rather than assumed

**1. The opening oversold, and now does not.** It read "Two things in it that every consuming
project has on disk are affected", which was written to the shape of `docs/upgrading-to-v10.md`,
where the equivalent sentence is true and load-bearing: that release really does strip a file
from every project root. Here it contradicted the page's own body twice over — the
`**Status:**` row says existing records keep the field and nothing reads it, and the
`## Directive` row says existing records keep their prose — and it contradicted the sentence
three lines below it, "no file is rewritten for you". Replaced with what actually changed: the
template rather than the records, both sections present in every record already, neither
rewritten.

**2. The README heading now names the two prior minors, matching `skills/help/SKILL.md`.** It
read "**Upgrading from v10?**", which is the plain-major form its v9 and v8 neighbours use and
which is wrong here for a reason the neighbours do not have: v10.2 is itself v10, so a reader
already on this release cannot tell the paragraph is not for them. The neighbours can use the
plain major because their target was a major. `skills/help/SKILL.md` had already been given the
precise form, so the two surfaces also disagreed with each other. Now
"**Upgrading from v10.0 or v10.1?**" on both.

## The sweep

`grep -rniE 'v11|version 11|11\.0\.0|upgrading-to-v11'` over the whole tree, excluding only
`.git` and `node_modules`, plus `find -iname '*v11*'` for filenames. Three survivors were
found and cleared: the two spellings in the reference-lint log entry above, and the previous
session's own history log, which cited the note at its old path five times and carried the old
number in its title and its filename. That log's closing section recorded the version number as
an open judgement returned to the user; it now records the answer. Both greps return nothing.

One further thing was corrected in the note while reading it whole: its `## Where to read more`
called `docs/upgrading-to-v10.md` "the previous release", which was true when this material was
a major bump and is not now — v10.1.0 is the previous release. It names the v10.0 migration note
instead. No citation was added or removed by any edit on the page, which is why the reference
lint's count held.

## Finding reported, not acted on

`CLAUDE.md`'s `docs/` row states the criterion for writing one of these pages: "written only
when a release removes something an installed base already has on disk". This release's page
does not meet it — that is precisely the claim corrected in the opening above. The row was
already inaccurate before the renumbering, so it is not fallout from it, and `CLAUDE.md` is a
curator surface behind a user gate. Left for `/fusion:cleanup --only claude-md`.

## Files changed

- `/Users/k1/Projects/productive/fusion/docs/upgrading-to-v10-2.md`
- `/Users/k1/Projects/productive/fusion/README.md`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/reference-resolution-lint.test.ts`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/surface-growth.golden`
- `/Users/k1/Projects/productive/fusion/260818-1703-coder-v10-2-release-material-and-two-fixture-reapprovals.md` (renamed from `...-v11-...`)

Not changed: `.claude-plugin/plugin.json`, `install.sh`, `skills/help/SKILL.md` (the user's
renumbering, found correct), `CLAUDE.md` (finding above), and no baseline file.
