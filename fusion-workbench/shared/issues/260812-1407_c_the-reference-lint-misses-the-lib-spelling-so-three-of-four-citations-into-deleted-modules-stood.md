The reference lint misses the `lib/…` spelling, so three of four citations into deleted modules stood

---
Measured during step 6 of the protected-path removal, 260812. `reference-resolution-lint` caught
`README-hooks.md:251` citing `hooks/lib/rules-write-exemption.ts` and **missed three more citations
into the same two deleted modules** — the same module again at `:293`, and `lib/protected-snapshot.ts`
at `:151` and `:174`.

---
**Witness:** the removal, which deleted the modules and expected the gate to name every dangling
citation
**Severity:** medium — the gate's whole purpose is to make a dangling citation fail rather than rot
**Affected:** `hooks/lib/__tests__/reference-resolution-lint.test.ts`

The difference between the caught one and the missed ones is the **spelling of the path**. The
caught citation gives a repository-root-relative path; the missed ones use the `lib/…` form, which
is how this repository's hook modules are most often cited in prose, because that is how they are
imported. The gate does not recognise it, so it resolves nothing and reports nothing.

**Why this is worse than one missed pattern.** A coverage gate that silently skips a spelling
reports green over the citations it did not examine, and there is no way to tell the two apart from
its output. This is the same shape as `260810-2149`, where a coverage *floor* could not see coverage
leaving the examined set, and the answer taken there — pin the counts rather than assert a floor —
applies here for the same reason. Queue entry 26 is that pin, unbuilt.

**Cheapest correct fix:** teach the resolver the `lib/…` form against `hooks/lib/`, then re-run and
report how many citations enter the examined set. That number is the size of what has been unchecked
until now, and it should be recorded rather than absorbed quietly.

**Not to be fixed by widening alone.** If a third spelling exists it will be missed the same way. The
resolver should either enumerate the spellings it accepts and fail on an unrecognised path-shaped
token, or count what it examined and pin the count.

---

**Resolved 2026-08-16**, session `260816-0119`, coder, in one pass with three sibling defects
(`260811-1755`, `260815-1251`, `260810-2149`) — all four live in
`hooks/lib/__tests__/reference-resolution-lint.test.ts`.

`lib` joined the directory alternation in `PLUGIN_PATH_BODY`, and a new `resolveToken()` maps a
`lib/…` token to `hooks/lib/…` for the existence check. The mapping is written in exactly one place
and both consumers use it — the scanner and the `EXAMPLE_PATHS`-is-fabricated guard — so the two
cannot disagree about where a token lives. A behavioural case ("reads the bare lib/… import
spelling as a hook module, both ways") drives the resolving and the dangling half.

**The measured size of what had been unchecked: 34 citations**, exactly the number the record's
"record it rather than absorb it quietly" asked for. `counts.paths` moved 1095 → 1122 (27 resolving
citations), and 7 further occurrences were the dangling ones. All 34 are in `README-hooks.md`.

**Six dead modules, not seven.** The dangling 7 occurrences name six distinct modules —
`lib/bash-mutation-guard.ts`, `lib/protected-snapshot.ts`, `lib/rules-write-exemption.ts`,
`lib/fs-locator.ts`, `lib/reverted-copy.ts`, `lib/state-drift.ts` (cited twice, at `:183` and
`:185`). The dispatch expected seven; the seventh does not exist in the surface. Each is a
deliberate historical citation in the sections that exist *because* the module does not, so each
gained an `EXAMPLE_PATHS` entry naming its removal date and the section that names it — the same
shape as `bin/fu`. The pre-existing "no dead weight" test is what will catch one whose section stops
naming it.

**The record's own falsifier — "not to be fixed by widening alone" — is answered by the sibling
fix.** `260810-2149`'s baseline pin landed in the same pass: `counts.paths`/`anchors`/`records` are
now asserted equal to committed constants, so a *third* spelling silently leaving or never entering
scope moves a pinned number and reddens the suite, rather than being invisible the way this one was.
