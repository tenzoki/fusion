The retired gate's redundancy argument covers one direction, and `CLAUDE.md` still claims the other

---
`da1c62ed` deleted `claudeMdDrift()` and its two `it` blocks from
`hooks/lib/__tests__/derivable-enumerations-lint.test.ts`, leaving a comment (lines 69-74) that
argues the assertions are redundant:

> a `claudeMdDrift()` here asserted over CLAUDE.md the closed enumeration that "README-agents' skill
> table has exactly one row per skill directory" below already asserts in both directions, and the
> open-set half over CLAUDE.md is carried by "no shipped doc cites a phantom skill", whose surface
> list names that file.

**Half of that is right.** The open-set half — every `/fusion:<name>` token in `CLAUDE.md` resolves
to a real skill directory — is genuinely carried: `CLAUDE.md` is in the `surfaces` array at
`hooks/lib/__tests__/derivable-enumerations-lint.test.ts:91`.

**Half is not.** The deleted closed direction was *every skill directory is named in `CLAUDE.md`*.
The surviving check asserts set equality against **`README-agents.md`**
(`rows.map((m) => m[1]).sort()).toEqual(dirs)`, line 85). It is a closed enumeration in both
directions over a different file, and it says nothing about `CLAUDE.md`'s coverage of the skill set.
No other test in `hooks/lib/__tests__/` asserts it. The property is true at HEAD — all thirteen
directories are named — and nothing holds it there.

That would be a quiet loss on its own. It is not quiet, because `CLAUDE.md:21` still describes the
gate that was just removed:

> None of those names may be written in the `/fusion:` form anywhere in this file — the lint reads
> every such token, fails on one that names no directory, **and asserts the match in the other
> direction too, which is why every body under `skills/` is named here.**

`CLAUDE.md` is untouched in `v11.4.1..HEAD`, so the release ships a shipped surface stating that a
gate performs an assertion no gate performs. The retirement comment names step 8 of
`260916-1126_*_implementation-human-facing-docs-leave-claude-md.md` as where that passage leaves
`CLAUDE.md`; the gate went first, and the tag falls between the two.

**Acceptance test:** either the closed direction over `CLAUDE.md` is asserted again, or `CLAUDE.md`'s
sentence stops claiming it — and whichever lands, the two agree in the same commit.

---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

---
Resolved: a gate holds the closed direction again, +23 lines in
`hooks/lib/__tests__/derivable-enumerations-lint.test.ts`, funded by the ruled head-room raise.

**This record's premise had moved and the obvious repair would have asserted something false.** The
claim sentence left `CLAUDE.md` at `72911b86`, and that file now names 2 of the 13 skills, so
restoring the closed enumeration over it would fail on a file that no longer promises completeness.
The sentence sits in `README-agents.md` and still claims a gate holds the direction. The gate is
therefore anchored to the **claim sentence**, located across the shipped-document set, requiring
exactly one carrier and requiring that carrier's line to name every skill directory. Rewording it
fails loudly with instructions rather than passing vacuously.

The table check does not cover it, proved rather than argued: dropping one skill from the bullet
while leaving the table complete failed only the new gate, one failure and not two.

Hard-coding the destination filename was measured at 15 lines against 23. The 8 lines of difference
are what stop the gate being outrun by the next move of the passage, which is precisely the failure
that produced this record, so they were spent deliberately. The shipped-document set was hoisted so
the phantom-skill check reuses it, net +1.
