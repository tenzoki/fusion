# Coder — v10.2 release material checked, two measurement fixtures re-approved

---
**Status:** Complete
**Agent:** coder
**Date:** 2026-08-18
**Dispatched by:** user (orchestrator handing back its own version-surface edits for review)
**Verification:** `npm test` in `hooks/` — exit 0, 672 passed (36 files)

---

## What was asked

Check the orchestrator's own version-surface and documentation edits as if they had
been dispatched to this agent, correct what is wrong, re-approve two measurement fixtures
with per-file attribution, and judge the fifth coherence surface and the version number.

## Corrections made to `docs/upgrading-to-v10-2.md`

Every claim was checked against the shipped text at HEAD rather than accepted. Five did not
survive.

1. **"Hook messages no longer cite fusion's own defect records or commit hashes."** False for
   this release. `bd2db5c` removed those four identifiers by hand and is an ancestor of
   `v10.1.0`; `git diff --stat v10.1.0..HEAD -- hooks/ ':!hooks/lib/__tests__'` is empty, so no
   hook behaviour changed here at all. What this release adds is the containment gate
   (`33645a2`, `f3a3565`). Rewritten to say so, and to say that a consuming project's own
   commit hashes are deliberately unaffected — the gate asks where an identifier came from,
   not what it looks like.
2. **"The activation path through `/fusion:next`" listed as unchanged.** It changed:
   `skills/next/SKILL.md` Step 6.2 lost its `**Status:** active` write in this release, which
   is a direct consequence of the page's own headline change. Restated instead of dropped.
3. **"Two ways forward, both fine."** `rules/circle-records.md` states the reason no migration
   ships — a hand conversion deletes the evidence of the contradiction the invariant exists to
   end — and the page presented hand conversion as equally fine. Now weighted, with the rule's
   reason given.
4. **The option list was not complete.** Only two branches were offered where three exist. The
   missing one is the branch the rule names as *the* conversion path: a shaper run in the
   default `**Scope:** spec` does not halt on such a record, it converts it (`agents/shaper.md`
   mode 3, `spec` bullets). Added as option 2 and the list re-weighted.
5. **The exempt-surface change (`e7ca60f`) was absent.** It is consumer-visible: a project that
   ships nothing onward now writes its own `rules/` and `README.md` in its declared artifact
   language, where the old list made those English everywhere. Added to `## Also in this
   release`.

Also: a navigational claim pointed at "the last section" for content that is in
`## What you have to do`; and the page lacked the closing `## Where to read more` that
`docs/upgrading-to-v10.md` — the shape it was written against — ends with. Both fixed.

## Correction made to `skills/help/SKILL.md`

"a shaper run against it halts on purpose" was unconditional and wrong. Only
`**Scope:** directive-only` halts; the default `spec` scope converts the record
(`agents/shaper.md:53-64`). Now names the scope on both sides.

## Claims verified and left standing

`**Scope:**` defaults to `spec` (`agents/shaper.md:51`); the halt is the one the shaper
performs (`:61`); mode 3 accepts `_a_` or `_t_` and refuses terminal (`:49`); the orchestrator
may write only the fixed pointer literal and only riding a field write
(`agents/orchestrator.md:240`); there is no `**Status:**` field and nothing reads one
(`:298`); the template lost the field in this release (diff of `rules/circle-records.md` over
`v10.1.0..HEAD`); no agent, skill or slash command left the release.

## Fixture re-approvals — no growth baseline moved

Both fixtures were re-approved by their own documented procedures. **Neither re-approval moved
a growth baseline**; `git diff hooks/lib/__tests__/surface-growth-bound.test.ts` is empty, so
every `*_BASELINE` map stands as it was.

Head-room after the change:

| Surface | Spent | Head-room | Left |
|---|---|---|---|
| `agents/` (bytes) | 11 360 | 18 000 | 6 640 |
| `skills/` (bytes) | 8 881 | 20 000 | **11 119** |
| hook tests (lines) | 528 | 2 500 | 1 972 |

The golden was regenerated twice, because the second edit was the reference-lint log entry
below and the hook-test surface counts the instrument itself. Both regenerations moved only the
files intended: `help/SKILL.md` +555 bytes, `reference-resolution-lint.test.ts` +24 lines.

### Reference-count attribution, measured by reverting one file at a time

`BASELINE` moves 1133/145/97 → **1142/148/97**. Reverting all five edited files returns the
gate to exactly 1133/145/97, which is what makes the per-file measurement trustworthy.

| File reverted | paths | anchors | records |
|---|---|---|---|
| `README.md` | +1 | 0 | 0 |
| `skills/help/SKILL.md` | +1 | 0 | 0 |
| `install.sh` | 0 | 0 | 0 |
| `.claude-plugin/plugin.json` | 0 | 0 | 0 |
| the migration note (removed) | +9 | +3 | 0 |
| **total** | **+9** | **+3** | **0** |

The five figures sum to 11 paths against a total of 9. That is interaction, not error:
removing the new note also dangles the two citations *of* it, so that one revert measures its
own seven plus those two leaving scope. The note carries eight path-shaped spellings for seven
resolved — the bare `rules/` on its exempt-surface bullet is a directory, not a file.

One anchor of the three was won rather than written. The note first spelled its
`### The Directive is a pointer once a spec exists` citation with a line break between the two
backtick spans; the gate scans line by line, so it was invisible — the same defect the
Directive-pointer re-approval immediately above in the log found standing in
`agents/orchestrator.md`. Reflowing it onto one line is the whole difference between anchors
147 and 148.

## Fifth coherence surface — no drift

`plugin.json`'s `description` and the fusion entry's `description` in the marketplace clone are
still **byte-identical** (compared, not assumed). Nothing in this release falsifies either: the
agent count is 15 (`ls agents/*.md`), the three domain-parameterised agents are unchanged
(`**Scope:**` is a fourth shaper parameter, not a domain one), and the hook layer's behaviour
did not change at all. No edit needed. The marketplace clone was read only and not modified.

## Open judgement returned to the user, since answered

The version number. Recorded in the report rather than acted on, because the number is the
user's and changing it would cascade across four surfaces plus this file's own name.

**Answered the same day: 10.2.0.** The user made the cascade: the manifest, the two
`FUSION_REF` pin examples, the migration note's own filename, and the version strings inside
the note, `README.md` and `skills/help/SKILL.md`. The paths above are written at the name the
note now carries.

## Files changed

- `/Users/k1/Projects/productive/fusion/docs/upgrading-to-v10-2.md`
- `/Users/k1/Projects/productive/fusion/skills/help/SKILL.md`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/reference-resolution-lint.test.ts`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/surface-growth.golden`

Not changed: `.claude-plugin/plugin.json`, `README.md`, `install.sh` (the orchestrator's edits,
found correct), and the marketplace clone (out of scope by instruction).
