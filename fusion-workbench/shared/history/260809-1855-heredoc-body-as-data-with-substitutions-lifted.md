# Treat an unquoted heredoc body as data, with its substitutions lifted out

**Status:** Complete
**Agent:** coder
**Task:** tasklist task 4, `I:260809-1111-heredoc`
**Source record:** `260809-1111_*_a-plain-line-in-an-unquoted-heredoc-body-is-classified-as-a-command.md`

---

## What was wrong

`stripData` (`hooks/lib/shell-parse.ts`) blanked a quoted-delimiter heredoc body
and kept an unquoted-delimiter one whole, as code. The segmenter then split on
newlines, so every line of such a body became its own candidate command.
Reproduced against the work-tree build before touching anything:

```
DENY    cat <<EOF > runbook.md / git switch main / EOF
allow   cat <<'EOF' > runbook.md / git switch main / EOF
```

The module argued the preservation as fail-closed, because bash expands in an
unquoted body. It was right about expansion and wrong about execution. A
substitution in that body runs; the surrounding text is written to the file,
exactly as under a quoted delimiter. Newline segmentation erased the difference.

## What was done

One behavioural change, in the heredoc branch of `stripData`:

```ts
out += hd.strip ? blankData(body) : blankHeredocBody(body);
```

`blankHeredocBody` walks the body and blanks every character except the `$(…)`
and backtick regions, which it keeps **in place and verbatim**. Newlines survive,
as in `blankData`.

The lifting is then not a second mechanism. `extractCommandSegments` already
pulls a `$(…)`/backtick body out as a segment of its own, wherever in a command
it stands; leaving those regions where they stood hands them to it unchanged. So
the suggested direction — "extract the substitutions and append them as segments"
— is realised by *what survives blanking* rather than by passing a segment list
out of a function whose contract is to return a string. Nothing in the segmenter
had to learn about heredocs, and nothing reads the body text for what it "looks
like".

`findSubstitutionClose` was factored out of `extractCommandSegments`'
balanced-paren scan and is now called by both, so "where does this substitution
end" has one answer and the region the segmenter lifts is the region the blanker
kept, by construction. The extracted scan is character-for-character the loop
that was inline; the gold-verdict fixture pins that it did not drift.

## Where fail-closed stays

- A substitution in an unquoted body still classifies — that is the half of the
  original argument that was true, and it is now the only half being paid for.
- An **unbalanced** `$(` or an **unpaired** backtick has no knowable extent, so
  the rest of the body stays code rather than being blanked on a guess.
- A heredoc whose terminator never appears is untouched: still code, still denies.
- A quoted delimiter is unchanged — its body is blanked whole, substitutions
  included, because bash writes those literally.

Stated as a limitation rather than fixed: a backslash escape inside the body is
not honoured, so bash's literal `\$(git switch main)` — written to the file, never
run — still denies. That over-blocks, which is the safe direction, and it is
documented on `blankHeredocBody` rather than left to be rediscovered.

## Measured after

Against the built classifier (`hooks/dist/lib/git-branch-guard.js`), all five
acceptance criteria:

```
allow  bare line in unquoted heredoc          DENY   $( ) in unquoted heredoc
allow  prose paragraph in unquoted heredoc    DENY   backtick in unquoted heredoc
allow  quoted heredoc, bare line              DENY   unquoted heredoc, no terminator
allow  quoted heredoc, backtick               DENY   real switch, no heredoc
                                              DENY   real worktree add, no heredoc
                                              DENY   real switch after the terminator
```

The last row is the one that is easy to lose: the blanking has to stop at the
terminator and not swallow the command after it. It is pinned as a test.

## The corpus baselines did not move

Both fixtures are untouched and were not regenerated:

- `fixtures/git-corpus-451a07e.json` — no row contains a heredoc at all, so no
  baseline verdict can move; the no-new-allow direction stays green.
- `fixtures/git-verdicts-head.json` — 98 rows, of which the heredoc-bearing ones
  are the quoted forms and the harvested body fragments. The one unquoted
  multi-line case is `cat <<'EOF'\ngit switch main\n` (quoted, unterminated), which
  this change does not touch. Every recorded verdict still reproduces byte for
  byte.

Worth stating plainly, because this change is the first in the queue that can
move a verdict toward **allow**: it does, on purpose, and only on the case the
issue names. The fixture is the evidence that it moved nothing else.

## The tests

- `shell-parse.test.ts` — the case that asserted the opposite ("still classifies
  an UNQUOTED-delimiter heredoc body as code") is now the case that asserts the
  fix, including that the unquoted form produces segment-for-segment what the
  quoted form produces. Four more: substitutions lifted out of an unquoted body,
  substitutions *not* lifted out of a quoted one, fail-closed on an unsettled
  extent, and a body whose terminator ends the command.
- The continuation case ("does not reinterpret a continuation inside a heredoc
  body") lost its asymmetry: both delimiter forms now blank, so both expect the
  same two segments.
- `git-branch-guard.test.ts` — six cases appended to the existing
  `260716-2005_*_branch-guard-false-positive-on-markdown-backticks-in-heredoc.md` describe, which is where the other half of this family already
  lives. Two of them are the pair that cannot be green by accident: one body that
  contains both a prose mention and a substitution (denies), and the same body
  with the substitution removed (allows).
- `stripDataRegions`' unit case for the unquoted body now asserts both halves —
  the backtick survives, the prose around it does not.

## Scope kept

Task 6 (attached-value global options) edits `git-branch-guard.ts` and the same
guard test file next. Nothing of it was absorbed; the new cases sit inside the
existing heredoc describe and touch no shared helper.

## Two things NOT edited, deliberately

1. `rules/git-branch-discipline.md` — task 10 rewrites it last. Checked: this
   change makes **no** sentence in it false. The file describes the segmentation
   surface (`;`, `&&`, `||`, `|`, `&`, newlines, continuations, `(…)`, `$(…)`,
   backticks) and never claims anything about heredoc bodies.
2. `hooks/lib/git-branch-guard.ts:470-474` — a comment, outside this task's file
   scope, that now reads falsely: *"Code regions where bash DOES expand (double
   quotes, unquoted heredocs) are preserved, keeping the guard fail-closed."*
   Only the substitution regions of an unquoted heredoc body are preserved now.
   Flagged for whoever takes task 6, which edits that file.

## Files changed

- `hooks/lib/shell-parse.ts` — `blankHeredocBody`, `findSubstitutionClose`, the
  heredoc branch, and the four doc comments that described the old reading
- `hooks/lib/__tests__/shell-parse.test.ts` — one case rewritten, four added, the
  continuation case corrected
- `hooks/lib/__tests__/git-branch-guard.test.ts` — six cases added, one
  `stripDataRegions` case rewritten
- `hooks/dist/**` — rebuilt

`npm test` in `hooks/`: 35 files, 1138 tests, all passing.

Not committed: the orchestrator commits under the commit lock. The source record
was left at `_p_` and un-renamed, as the dispatch instructed; its acceptance
boxes are ticked and a `Resolved:` block is appended.
