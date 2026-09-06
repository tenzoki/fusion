# The write-time citation sentence stops naming a fusion record

**Status:** Complete
**Agent:** coder
**Issue:** `260906-0322_*_the-write-time-citation-sentence-carries-a-fusion-record-identifier-into-a-consuming-projects-session.md`

## What changed

`CitationHit.fix` is the only part of a citation hit that reaches a consuming
project's session, because `citationFormSentence()` renders it verbatim into the
PostToolUse hook's `additionalContext`. The two verdicts that hook reports each
ended their `fix` with a fusion decision stamp. Both parentheticals were deleted
at the one place the strings are authored, `hooks/lib/citation-scan.ts`:

- `store-prefixed`: `cite the storeless form 'X' (decision 260828-0904, the form)` → `cite the storeless form 'X'`
- `stale-marker`: `cite the marker position as '_*_' (decision 260806-0015, wildcard form)` → `cite the marker position as '_*_'`

Nothing was composed in their place, so no second statement of the storeless form
entered the tree. The sentence's closing clause already pointed at
`rules/fusion-workbench-conventions.md` `## Marker globs`, which is the route the
record's acceptance names and which every consuming project can open because
`bin/fusion-rules` emits that file on every dispatch.

`dangling` keeps its stamp: it is not in `REPORTED_STATUSES`, so its only reader
is the release gate's own failure text inside this repository, and the substance
rule it names is stated nowhere the sentence points. The contract and that
exception are documented on the `fix` field itself.

## The premise the original design rested on was false

The module carried the stamps deliberately, on the ground that
`bin/fusion-citation-check` already printed the same string into a consuming
project's terminal. It does not. That program's row builder prints `problem` and
never `fix`; the only other reader of `fix` is `report()`, called from
`workbench-citation-lint.test.ts` inside this repository's own suite. Measured
against a scratch consuming root, the checker's output is byte-identical before
and after this change. So the hook sentence was the single path by which a `fix`
string could reach anyone outside fusion, and removing the stamps costs no
agreement between the two callers.

## Files

- `hooks/lib/citation-scan.ts` — both `fix` strings; the `fix` field's contract
- `hooks/lib/citation-form.ts` — header section rewritten from a stated residual to a statement of what the sentence now carries, with the false premise recorded
- `hooks/lib/__tests__/reference-resolution-lint.test.ts` — the stale-marker assertion now pins the ABSENCE of a stamp; the store-prefixed equality table updated
- `hooks/lib/__tests__/sentence-identifier-containment.test.ts` — fixture `fix` and the header note that described the old string
- `hooks/dist/**` — rebuilt

Both test edits are line-count-neutral (`4/4` and `12/12`), so no bounded surface
moved and `fixtures/surface-growth.golden` was left alone and still matches.

`README-hooks.md` was not edited: its two rows describe the module and the
grammar and quote no part of the sentence, so nothing there became false.

## Verified against a consuming root

Scratch root outside this repository, workbench marker only, one record tripping
each reported verdict, driven through `hooks/dist/tracker.js` as PostToolUse.

```
before  cite the storeless form '260906-0500-coder-a-scratch-note.md' (decision 260828-0904, the form)
after   cite the storeless form '260906-0500-coder-a-scratch-note.md'

before  cite the marker position as '_*_' (decision 260806-0015, wildcard form)
after   cite the marker position as '_*_'
```

The only stamps left in either sentence are the scratch project's own record
names, which is the correct content.

## The pinned count moved, and none of it is this change

`npm test` fails on `reference-resolution-lint.test.ts`: paths 1631 → 1643,
anchors 225 → 227, `stampBare` unmoved. Attributed by reverting all four of this
change's files to HEAD and re-running the gate: it reads 1643/227 with them
reverted, identical, so this change's share is exactly 0. That holds by
construction as well — `hooks/lib/*.ts` is scanned `recordsOnly`, so a comment
edit there cannot move `paths` or `anchors`, and `hooks/lib/__tests__/` is not in
the gate's surface at all. The movement belongs to the other work in flight in
this tree: `docs/upgrading-to-v10-24.md` (new), `README.md`, `install.sh` and
`.claude-plugin/plugin.json`. The baseline was not re-approved here.
