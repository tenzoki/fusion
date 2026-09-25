`CLAUDE.md`'s dangling-citation set grew from two to four at 7b, and the row that carries the two new ones is now false in its entirety

---

`260816-2123_o_*` and the plan amendment's step 16 both state the count as **two** —
`CLAUDE.md:29` and `:129`, each naming `hooks/lib/project-relative.ts`, deleted at `3c2e1c6`.
Measured at HEAD by running the gate, it is **four**:

```
CLAUDE.md:29   'hooks/lib/project-relative.ts'
CLAUDE.md:30   'templates/fusion-guard.json'      <- new at 6890ea2
CLAUDE.md:30   'hooks/config.json'                <- new at 6890ea2
CLAUDE.md:129  'hooks/lib/project-relative.ts'
```

(`cd hooks && npx vitest run lib/__tests__/reference-resolution-lint.test.ts`, 29 dangling
references across 7 files.)

Both new ones are on one line, and that line is the Layout table row headed
`` `fusion-guard.json` + `templates/fusion-guard.json` ``. Neither file exists any more; the row's
subject is gone. Read past the two dangling paths, the row's prose is false in four further
places, none of which any lint can see:

- "The per-project guard configuration" — it is fusion's per-project configuration and configures nothing about the guard.
- "git-tracked so every change to how strictly the guard reads that project shows in a diff" — the guard reads nothing about the project.
- "The loader merges per **leaf** key — project, then plugin `hooks/config.json`, then built-in defaults" — two layers, not three (`hooks/lib/config.ts:4-18`).
- "`guard.enabled` is the one key the project layer may not set … `guard.protectedPaths` is the one **retired** key" — both are now retired *containers* or leaves inside one; `RETIRED_TOP_LEVEL_KEYS` at `hooks/lib/config.ts:343-350` holds `guard`, `decisions`, `escalation`, and the leaf-scoped table folded away (`:99-103`).

**Why this is filed separately from `260816-2123_*_claude-mds-two-dangling-citations-keep-the-citation-lint-red-and-no-step-in-this-plan-may-fix-them.md`.** That record's subject is the two
`project-relative.ts` citations, their cause (`3c2e1c6`), and the argument that step 11 may not
touch `CLAUDE.md`. This one has a different cause (`6890ea2`, step 7b), a different remedy — the
row needs rewriting, not a path corrected — and it changes a number both that record and the plan
amendment state. `260816-2123_*_claude-mds-two-dangling-citations-keep-the-citation-lint-red-and-no-step-in-this-plan-may-fix-them.md` has been given an `Also seen:` line pointing here, per the filing rule; its own
text is left as written.

**What it costs if nobody re-counts.** Step 16's Scope paragraph enumerates the citations known at
the Turn 1 gate (`:29`, `:129`, plus `:8` and `:36` for `isFusionPluginCwd()`) and says the two
dangling ones "are the reason the step exists, not its bound". So the bound is fine; the *survey*
is what has to find `:30` on its own, and a curator that treats the amendment's enumeration as the
work list leaves the lint red and the release blocked behind it for a reason no record names.

**Severity:** Medium. It does not change what step 16 is allowed to do; it changes what step 16
has to find, and it makes a stated count wrong in two records.

**Scope:** `CLAUDE.md`, this repository only. Not shipped to consuming projects.

**Cross-references:**
- `260816-2123_*_claude-mds-two-dangling-citations-keep-the-citation-lint-red-and-no-step-in-this-plan-may-fix-them.md`
- `260816-1915_*_the-compliance-guard-becomes-observation-only.md` `### Step 16 (new): the curator reconciles `CLAUDE.md``
- `hooks/lib/config.ts:4-18`, `:99-103`, `:343-350`

---
Resolved: step 16's curator pass found the row on its own — which is exactly what this record said it had to do, since the amendment's enumeration stopped at two and this record's count was four. Landed as `5763550`.

Both halves are verified at HEAD, and separately, because a green lint would only have proved the first.

**The two new dangling paths are gone.** `cd hooks && npx vitest run lib/__tests__/reference-resolution-lint.test.ts` — 34 cases, 0 failures. `CLAUDE.md:30` no longer names `templates/fusion-guard.json` or `hooks/config.json`.

**The row was rewritten rather than repaired at its two paths**, which is the remedy this record asked for and the half no lint can see. `CLAUDE.md:30` now heads `` `fusion.json` + `templates/fusion.json` `` and each of the four false statements is corrected in its own terms: it is "the per-project configuration" and not a guard configuration; it is git-tracked "so every change to it shows in a diff" rather than so a change to how strictly the guard reads the project does; the merge is stated as "per **leaf** key across **two** layers — this file, then the built-in `DEFAULTS`"; and retirement is stated at its two new scopes, `RETIRED_PROJECT_FILES` for the leftover file and `RETIRED_TOP_LEVEL_KEYS` for `guard`, `decisions` and `escalation`, with the leaf-scoped table gone.
