# coder — the five Medium review findings closed: three false positives, two coverage gaps

**Date:** 2026-08-01 19:42
**Circle:** `circles/260801-1244-guard-bash-inspection`
**Review:** `reviews/260801-1905-coderev-guard-bash-inspection.md`
**Issues:**
`issues/260801-1859_c_redirection-carries-fail-closed-into-unrecognised-programs-and-three-docs-deny-it.md`,
`issues/260801-1900_c_the-must-never-deny-corpus-omits-the-largest-false-positive-family.md`,
`issues/260801-1901_c_a-redirect-operator-inside-a-double-quoted-string-is-read-as-a-redirection.md`,
`issues/260801-1902_c_git-clean-restore-and-stash-mutate-protected-paths-and-are-in-neither-the-table-nor-the-residual-list.md`,
`issues/260801-1903_c_perl-include-flag-glued-to-its-value-is-misread-as-the-in-place-flag.md`
**Status:** Complete

Three of the five are the classifier denying legitimate work; one is the test coverage
that would have caught that family; one is a coverage gap in the other direction. All
five are closed, and the two-sided acceptance criterion — the legitimate command allows,
the dangerous neighbour still denies — is pinned as a test pair in every case.

## 1. Redirection carried fail-closed into unrecognised programs (1859)

**Fixed in the code, not in the documentation.** Three documents said an unrecognised
program is allowed however unparseable its arguments are; `npm test > "$LOG"` denied. The
issue offered both directions. The code was the wrong side, for a reason the issue did
not name: the table already allows `curl -o rules/x.md` — a *literal* protected path with
an unrecognised program — so denying `echo x > "$F"` was not a stricter rule, it was an
inconsistent one. A control cannot be looser on the visible case than on the invisible.

`classifyWords` now runs pass 3 only when the segment names a recognised verb. Passes 1
and 2 are untouched, so redirection still makes any program a mutation for a target the
guard can read.

**Given up:** a segment with no table verb whose redirect target cannot be resolved.
`echo x > "$F"`, `echo x > "rules/$F"` and `cd $D && echo x > y.md` now allow — the last
being the sharpest form, where the operand is an ordinary relative path and only the
directory is unknown. **Still denies:** `npm test > rules/x.md`, `curl -s https://x >
rules/x.md`, `cd rules && echo x > y.md` (resolvable targets, any program) and
`rm /tmp/a > "$F"`, `tee "$LOG"`, `cd $D && rm -rf x > "$F"` (recognised verb).

## 2. A `>` inside a double-quoted string read as a redirection (1901)

`stripData` now mints a capture-mode placeholder for a double-quoted span that expands
nothing, which is what bash does with it — no redirection, no word splitting, no
segmentation. `git commit -m "docs: rules/a.md -> rules/b.md"` is prose again.

Both constraints from the issue held. Blank mode is untouched, so `stripDataRegions` is
byte-identical for the git classifier (pinned by a new case as well as the harvested
corpus). A span carrying `$` or a backtick still arrives as code, so `"$(rm rules/x.md)"`
and ``"`git switch main`"`` are still lifted into their own segments.

One addition to the issue's proposal: **a backslash also vetoes the capture.** An escape
pair is removed by `resolveWord`'s code branch only, so capturing `"a\"b"` would have
resolved it to `a\"b` rather than `a"b`. Excluding it keeps every escaped span on exactly
the path it was on before.

**Given up:** nothing bash would have acted on. A quoted `&&`, `;` or `|` no longer
segments either, which removes three more false positives of the same shape.

**Not fixed, documented instead:** the `#` comment. The lexer has no notion of one, so
`ls -la # writes > rules/x.md` denies on a redirection its comment only describes.
Stripping comments means changing the segmenter that blank mode pins byte-for-byte, and
the residual errs toward deny — the safe direction. It is now a stated residual in all
three documents and an asserted test.

## 3. `perl -Ilib` misread as the in-place flag (1903)

`shortFlagLetters` now takes the per-verb set of letters that consume the rest of the
token and truncates there, keeping the stopping letter: `-Ilib` → `I`, `-i.bak` → `i`,
`-pi` → `pi`. That is the issue's preferred route rather than its special case.

The sed sibling turned out to have the same shape after all, which the issue said it did
not: `sed -fscript.sed` was read as in-place through the `i` in `script`. Same fix.

**Given up:** nothing the tools would honour. In `-Ilib` the `lib` is the include
directory, not `-l -i -b`, so the truncation matches perl's and sed's own parsing rather
than approximating it. **Still denies:** `perl -Ilib -i rules/gen.pl`, `perl -i -Ilib
rules/gen.pl`, `sed -fscript.sed -i '' rules/x.md`.

## 4. `git clean` / `restore` / `stash` (1902)

Decided, then documented. Three rows added; two residuals stated.

| | Row | Allowed | Denied |
|---|---|---|---|
| `clean` | mutates only with `-f` | `git clean -n rules` | `git clean -fdx rules` |
| `restore` | mutates only with `--source` | `git restore rules/x.md`, `--staged` | `git restore --source=HEAD~1 rules/x.md` |
| `stash` | unconditional | `git stash`, `pop`, `list` | `git stash push rules/x.md` |

`git apply` / `git am` name their targets inside the patch file and stay residuals next to
`patch`; a path-less `git clean -fdx` names no directory the ancestor check can compare,
exactly as `rm -rf *` does not, and is a residual for the same reason.

`-e` / `--exclude` are value flags, so `git clean -fdx -e rules/keep build` does not deny
on the pattern it is told to spare — the false positive a naive row would have shipped.

The `inPlaceOnly` seam was generalised to `mutatesOnlyWhen` (same shape, honest name: it
now covers an in-place flag, a force flag and a source flag) and is asked of **every**
flag token rather than only of the ones no other branch consumes. Without that,
`git restore --source HEAD~1 rules/x.md` would have had its `--source` eaten by the
value-flag branch and never counted as a mutation.

## 5. The corpus (1900)

Both halves of the missing family are now in the suite.

- `ORDINARY_AGENT_COMMANDS`: **72 → 102**. The additions are the shapes that must allow —
  a variable or `~` as a redirect target on a program outside the table, prose carrying
  `->`, the new git subcommand forms, `perl -Ilib`.
- New `KNOWN_FALSE_POSITIVES` block: eleven commands that still deny, asserted at their
  current behaviour and labelled accepted rather than intended (`rm -f "$TMPDIR/probe"`,
  `mv "$f" /tmp/`, `tee "$LOG"`, `cd "$TMPDIR" && rm -rf work`, `rm -rf ~/.cache/fusion`,
  …). A companion test asserts each denies for the *fail-closed* reason, which is the
  discriminator between the two blocks: land a command here with no recognised verb in it
  and the bound has been widened again.
- The count floor is gone. `expect(length >= 42)` asserted on the fixture's own size;
  the replacement filters the corpus against a catch-all protected list and floors the
  entries that exercise a **detected write** — 29 of 102 today, floor at 27. Twenty hard
  commands can no longer be swapped for twenty trivial ones.

## Verification

`npm test` green: **730 tests, 16 files** (677 before). `npx tsc --noEmit` clean.

Three verdicts changed deliberately, each named where it was pinned:

1. `echo "x > rules/y.md"` deny → allow. The test that pinned it was titled "denies the
   known double-quote false positive, so a change is visible" — it did its job.
2. `cd $D && echo x > out.log` deny → allow. Moved out of the unknowable-cwd deny list
   into its own case naming it as the cost of finding 1.
3. `git restore --source=…`, `git clean -f…`, `git stash push` allow → deny on a
   protected path. That is finding 4's whole point.

No new `hooks/dist/` files — the four rebuilt outputs (`bash-mutation-guard.{js,d.ts}`,
`shell-parse.{js,d.ts}`) were already tracked, so `git add -u` catches everything.

## Files

- `hooks/lib/bash-mutation-guard.ts` — pass-3 bound, `mutatesOnlyWhen`, flag-letter
  truncation, three git rows, docstrings
- `hooks/lib/shell-parse.ts` — double-quoted capture, docstrings
- `hooks/lib/__tests__/bash-mutation-guard.test.ts`,
  `hooks/lib/__tests__/shell-parse.test.ts`
- `rules/protected-path-discipline.md`, `README-hooks.md`
- `hooks/dist/lib/{bash-mutation-guard,shell-parse}.{js,d.ts}` (rebuilt by `npm test`)

## Left for whoever picks the review up next

The Low finding `260801-1904_o_four-classifier-behaviours-are-deletable-with-a-green-suite.md`
is untouched — it is the mutation-testing finding, not one of the five. Two of its four
survivors are adjacent to work done here (`isSkippedRedirectTarget`, `--` end-of-flags)
and would be cheap now.
