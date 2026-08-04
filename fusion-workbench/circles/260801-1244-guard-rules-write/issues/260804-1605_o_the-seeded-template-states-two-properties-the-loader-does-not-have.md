# The seeded template states two properties the loader does not have, and is copied verbatim into every project

---

**Severity:** Medium
**Domain:** code (documentation of a security control)
**Filed by:** analyst, independent assessment A1 of C5b
**Affects:** `templates/fusion-guard.json` keys `_protectsItself`, `_inFusionsOwnSourceTree` and `_override`; the byte-identical root copy `fusion-guard.json`
**Cross-references:**
`circles/260801-1244-guard-rules-write/analyses/260804-1600-c5b-independent-assessment.md` `### Coherence across the three commits`,
`circles/260801-1244-guard-rules-write/issues/260804-1601_o_...md`, `260804-1602_o_...md`, `260804-1604_o_...md` — the three findings that falsify the sentences,
`circles/260801-1244-guard-rules-write/history/260804-1502-ontocoder-step7-guard-config-template.md` (where both claims were checked against the code that existed and found true of it)

---

## What is wrong

Three sentences in the seeded template overstate what the loader does. The file is copied
verbatim by `/fusion:setup` Step 0f into every consuming project, so each one propagates.

**One.** `_protectsItself`:

> Once this file exists on disk the guard protects it, whatever this file itself says — an
> agent cannot unprotect the configuration that governs it. Editing, moving or deleting it
> through a guarded tool call is denied.

Falsified twice. `{"guard":{"enabled":false}}` short-circuits above every check, and `Edit
fusion-guard.json` then allows (`260804-1602_o_`). And from any working directory that is not
the project root, the floor names a file that does not exist while the real one is writable
(`260804-1604_o_`). Measured in both cases.

**Two.** `_inFusionsOwnSourceTree`:

> The escalation settings still apply, since the git branch-switch policy stays active even
> there.

True as stated, and I verified it: in a plugin-root project, `blocksBeforeHalt: 2` produces
`haltActive: true` after three denied `git switch` calls. It is incomplete rather than wrong
— the same file can set `guard.enabled: false`, and then the branch policy does not stay
active even there. Measured: `git switch main` allows in a plugin-root project carrying that
file, and denies in the same project carrying the template.

**Three.** `_override`:

> any field you leave out of your object falls back to fusion's built-in default, not to the
> plugin's file

Accurate and materially incomplete. It does not say that fusion's built-in default for
`guard.protectedPaths` is the **empty list**, so a reader who understands the sentence
perfectly still does not learn that adding any `guard` key unprotects the project
(`260804-1601_o_`).

## Why this is filed against the template rather than only against the code

The three code findings may each be answered by changing the code, in which case two of these
sentences become true again and the third still needs the missing clause. So the fix here is
**sequenced after** the code decisions, not before. Writing the correction now would document
a boundary that is about to move — the mistake plan Step 9 has already made once in this
Circle, recorded in the 260804-1021 reconciliation entry.

The author's own verification was sound for the code that existed when it ran. Both claims
were checked against `hooks/lib/config.ts` and `hooks/guard.ts` rather than taken from the
plan. Neither check could have surfaced `guard.enabled`, because nothing in the spec, the
plan or the step named it.

## Suggested direction

After `260804-1601_o_`, `260804-1602_o_` and `260804-1604_o_` are answered, re-read all six
underscore keys against the behaviour the tests then assert, and change the root copy in the
same commit — `config.test.ts` asserts the two files are byte-identical, so they cannot drift
apart silently. Executor `ontocoder`, as Step 7 was.

Add the missing clause to `_override` regardless of how the other three are answered: a
reader has to be told what the built-in default for the protected list actually is.
