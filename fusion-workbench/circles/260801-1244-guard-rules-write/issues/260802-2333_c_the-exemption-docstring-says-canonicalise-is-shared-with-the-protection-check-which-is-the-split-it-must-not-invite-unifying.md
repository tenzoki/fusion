# The exemption's docstring says `canonicalise` is "shared with the protected-path check" — the one claim that invites unifying the split

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, reviewing Turn 2 of `circles/260801-1244-guard-rules-write` (`bf75941..HEAD`)
**Affects:** `hooks/lib/rules-write-exemption.ts` (documentation), `hooks/lib/paths.ts`
**Cross-references:** `hooks/lib/rules-write-exemption.ts:43-48`,
`hooks/lib/rules-write-exemption.ts:12-16`, `hooks/lib/paths.ts:41-95`,
`hooks/guard.ts:566`, `hooks/lib/__tests__/guard-rules-write-integration.test.ts:1069-1082`

---

## The judgement asked for

**Is the split necessary?** Yes, and it is proved rather than argued. The trailing separator
widens whatever set it is matched against, and the two sides want opposite things from that:
`rules/**` compiles to `^rules/.*$`, whose `.*` matches the empty string, so `agents/`
matches the protected list and `agents` does not. Stripping on the protection side turns
`Edit agents/`, `Edit rules/`, `Edit skills/` from denies into allows; not stripping on the
grant side makes `rm -rf rules/` exempt. Both directions are pinned by real cases
(`:1069-1082` for the first, `:512-546` for the second), and both go red if the functions are
unified either way. The implementer was right to decline the one-liner, and right about why.

**Is the reason recorded where a later editor will read it?** In `paths.ts`, yes — twenty
lines of it, at the two definitions, naming both directions and the consequence of each. That
is the right home.

The problem is the *other* file. `rules-write-exemption.ts` is where an editor working on
`isProjectRulePath` actually is, and its docstring now tells them the opposite of what
`paths.ts` says.

## What it says

`rules-write-exemption.ts:43-48`:

> 1. LEXICAL. `canonicalise` (**shared with the protected-path check**, see `paths.ts`)
>    collapses `.`, `..` and trailing separators, and the result must match
>    `RULE_DIR_PATTERNS` under the same `matchesAny` the protected list uses. This is what
>    makes `rules/` and `rules/../agents/coder.md` non-exempt, and **it computes the exempt
>    set by the same mechanism that computes the protected set**.

Both emphasised claims are false as of this commit. The protected-path check calls
`collapseSegments` (`guard.ts:566`); the exemption calls `canonicalise`. They are different
functions with deliberately different behaviour, and they differ in exactly the
trailing-separator dimension the sentence claims they share — the dimension the split exists
for.

The same file's opening argument at `:12-16` reinforces it:

> Writing the boundary twice, once per surface, is two places for a security-relevant rule
> to drift apart.

That argument is about the two *surfaces* asking one predicate, which is still true and still
good. Read next to `:43-48` it lands as a general "one mechanism, not two" principle, which
is precisely the principle a later editor would apply by unifying `collapseSegments` and
`canonicalise`.

## Why this is worth an issue rather than a comment fix in passing

The failure mode is specific and it has already happened once in this Circle: the Turn 1
review recommended exactly that unification as a one-liner, on the strength of the same
reasoning, and it would have removed three denials. The next reader has less context than the
Turn 1 reviewer did and a docstring actively telling them the functions are one.

The test at `:1069-1082` is a real net — it fails loudly on the unification. But a comment
that has to be caught by a test is a comment that sends someone to write the change first.

## Recommended correction

In `rules-write-exemption.ts`, gate 1's paragraph:

- name `canonicalise` as the **grant-side** spelling and `collapseSegments` as the
  protection-side one, explicitly as two functions;
- state the one-line reason for the difference (the trailing separator widens; widening is
  protection on one side and a bigger grant on the other) and point at `paths.ts` for the
  full argument rather than paraphrasing it;
- keep `:12-16`'s two-surfaces argument, and add a clause distinguishing it from the
  two-*sides* asymmetry, so the file does not read as though both are the same principle.

One further note for whoever edits this paragraph: `isProjectRulePath` keeping its own
`canonicalise` call is load-bearing for a second reason the docstring does not give — the
Bash path hands it operands `guard.ts` never collapses. That reason is currently recorded
only in the resolution note on `260802-2230`, which is a closed issue file and not where a
maintainer looks.

## Origin

Found in `circles/260801-1244-guard-rules-write` while judging the split at the reviewer's
specific request. The split is right; its rationale is one file away from where it is needed.

---
Resolved: gate 1's paragraph in `hooks/lib/rules-write-exemption.ts` was rewritten, all three
recommendations taken.

- The two false claims are gone. A subsection headed *"Gate 1 runs `canonicalise`; the
  protection check runs `collapseSegments`"* names them as two functions, says the difference
  is the trailing-separator strip and one line wide, gives the one-line reason (a trailing
  separator widens the set a path is matched against, which is protection on one side and a
  bigger grant on the other), and points at the two definitions in `paths.ts` for the full
  argument instead of paraphrasing it. It also records that the unification has been proposed
  once, by the Turn 1 review, and would have removed three denials — so the next reader meets
  the history rather than repeating it.
- The two-*surfaces* argument at the top of the file is kept and now carries the
  distinguishing clause: one predicate for two callers asking the same question is a single
  source of truth; one function for two checks widening in opposite directions is a lost
  denial.
- The closing note's second reason is now in the file a maintainer is actually in: the Bash
  surface hands over operands nobody collapsed, and the classifier's own `path.normalize`
  keeps a trailing separator, so `rm -rf rules/` arrives spelled exactly that way. A predicate
  trusting its caller would be right on one surface and wrong on the other. It no longer lives
  only in the resolution note on `260802-2230`.

No behaviour changed. The test at `guard-rules-write-integration.test.ts:1069-1082` remains
the net; this closes the comment that was sending people to write the change first.

Session: `history/260803-1314-turn3-t3-2-exemption-prose-and-refusal-diagnostics.md`
