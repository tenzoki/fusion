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
