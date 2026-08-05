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

---

**Step 3 disposition (coder, 2026-08-05) — A-shaped, foreign file. STAYS `_o_`, and it got WORSE, measured.**

Branch A in kind and unreachable from here: the false sentences are in
`templates/fusion-guard.json` and its byte-identical root copy, which are structured data
and belong to `ontocoder`, as this issue's own § Suggested direction says. Step 3 owns the
two rule layers, the forensics analysis, `README-hooks.md` and the issue files, and changes
no `.json`.

**It stays in this Circle rather than moving to the shared store.** The plan's step 3 lists
it as a finding that "does not belong to this Circle's Directive". That is not right: the
seeded template is named in the Circle's own Directive — "`/fusion:setup` seeds a template
that declares inheritance and lists no paths". Under the Origin Rule this record belongs
here. Reported to the orchestrator as a correction to the plan, not applied silently.

**The sequencing condition is satisfied.** `260804-1601`, `260804-1602` and `260804-1604`
all carry `_c_`, closed by `history/260804-1725-coder-step2-project-layer-boundary.md` and
`260804-1940-…-floor-step4-…`. Two of the three sentences this issue names may now be true
again; that is not verified here and is the re-read the issue asks for.

**What IS verified here is a fourth defect, and it is the biggest one.** `_override` now
states the merge semantics backwards. Read out of `hooks/lib/config.ts:628-631`:

```ts
const pickGuard = <K extends keyof GuardSettings["guard"]>(key: K) =>
  project.raw.guard?.[key] ?? plugin.raw.guard?.[key] ?? DEFAULTS.guard[key];
```

Against the three claims the template ships:

| `_override` says | Actually |
|---|---|
| "The merge is per top-level key" | per **leaf**, one walk over three layers |
| "the object you write REPLACES the plugin's object of that name whole — it is not merged field by field" | it **is** merged field by field |
| "any field you leave out … falls back to fusion's built-in default, not to the plugin's file" | an omitted leaf falls back to **the plugin's file**; only what neither layer declares reaches the built-in default |

All three were true when Step 7 wrote them and were falsified by Step 2 of the C5b
remediation, which changed the merge to close `260804-1601` and its three latent siblings.
So the template is copied verbatim into every consuming project stating the opposite of what
the loader does, and the one property a reader most needs — that narrowing still works,
because a *declared* empty list is still empty — is now stated by an argument that is false
("which a field-by-field merge could never express").

**This raises the priority rather than adding an item.** The whole `_override` key needs
rewriting, not a clause appending, and it should be done before the release ships the
template. Executor `ontocoder`.
