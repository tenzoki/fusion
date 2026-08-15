# Two history entries inventory "two remaining Plane mentions" in `CLAUDE.md` and there are three

---

Both step 2's and step 3's history entries hand the curator a closed list of what `CLAUDE.md` still
says about Plane, and both name the `templates/` row and the `docs/` row. A third mention stands at
`CLAUDE.md:73`, and the same claim was **deleted** from `rules/circle-records.md` in this range, so
the two surfaces now contradict each other.

---

**Severity:** Low — no shipped behaviour depends on it, but the curator's pass at gate G1 is told the
list is two long, and the surface that survives is the one that disagrees with the rule file.
**Domain:** code
**Filed by:** `coderev`, reviewing `9a7da8e..7c12d6a` (`reviews/260815-0804-coderev-plane-mirror-removal.md`)
**Owner:** `curator` at gate G1; the correction to the two history entries is `coder`'s or nobody's
**Affects:** `CLAUDE.md:73`; `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/history/260815-0742-coder-remove-plane-mirror-code-and-prose.md:124`; `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/history/260815-0751-ontocoder-remove-plane-data-files-and-fixtures.md:73`
**Cross-references:** `rules/circle-records.md:30`, where the same justification was removed by `d0ddabb`; `issues/260815-0803_o_two-claude-md-inventory-rows-went-stale-and-neither-lint-gate-can-see-them.md` — `ontorev`'s record on the same file, covering rows 51 and 52 and the reason no gate sees them. This record is the **third** row that neither of us was told about, and the only one whose claim is now contradicted by a rule file. The two are adjacent, not duplicates: theirs is about the instrument, this one is about a surviving statement.

**Verified 2026-08-15 at HEAD `7c12d6a`**, by grep over the whole tree excluding `fusion-workbench/`,
`.git/`, `node_modules/` and `hooks/dist/`. Three `CLAUDE.md` hits, not two.

## The third mention

`CLAUDE.md:73`, in the Circles conventions bullet:

> The state marker sits on `_t_circle.md`, not on the directory (the directory name is stable across
> the whole lifecycle, so references into a Circle never break, **and the later Plane mirror gets an
> immutable natural key**).

## Why it is worse than a stale word

`d0ddabb` removed the identical justification from the rule file that owns this design.
`rules/circle-records.md:30` went from

> Two reasons this is worth the small oddity. First, **path stability**: … Second, **an immutable
> natural key**: the later Plane mirror needs a per-Circle identifier that does not mutate, or the
> guarantee "transferring twice creates no duplicates" cannot hold.

to

> What makes this worth the small oddity is **path stability**: …

That edit is correct and is the right call. Its effect is that the authoring home for the
marker-on-the-record design now gives one reason and `CLAUDE.md` gives two, the second of which names
a mechanism that does not exist. A reader who takes the design from `CLAUDE.md` takes away a
constraint the rule file has dropped.

## Why the inventories missed it

Both entries reached their list by asking which mentions the gates would fail on.
`reference-resolution-lint` resolves path-shaped tokens, and line 73 writes "Plane mirror" as prose
with no path in it — the same reason the `templates/` row survived, which step 3's entry works out
explicitly for that row (*"the templates row writes the bare filename, not `templates/plane.config.yaml`"*).
The method was right and it was applied to a `grep` that stopped at the Layout table.

## What the fix has to establish

Delete the clause at `CLAUDE.md:73`, so that the two statements of the design agree and path
stability is the reason on both surfaces. Correct the count in both history entries, or leave them
and let this record be the correction — a history entry is a record of what an agent did and saw, and
rewriting one after the fact has its own cost. Whichever, the curator's G1 ledger needs the third row.
