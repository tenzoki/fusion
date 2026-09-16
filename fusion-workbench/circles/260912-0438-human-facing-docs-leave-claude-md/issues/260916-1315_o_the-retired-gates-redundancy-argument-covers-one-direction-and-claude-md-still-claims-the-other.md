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
