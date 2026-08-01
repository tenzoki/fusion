# Code review — guard Bash inspection (`17730b8..e31c0f3`)

**Reviewer:** coderev · **Date:** 2026-08-01 · **Scope:** the eleven commits of Circle
`260801-1244-guard-bash-inspection`, plus the two pre-existing modules they touch.

## Summary

The work is sound and the design is better than the problem required. The classifier is
table-driven, pure, honestly documented, and the residuals it names are real residuals rather than
excuses. Seven issues are filed: two High (each a one-token bypass of the whole table, and both
also bypass the pre-existing git branch policy), four Medium, one Low. Nothing here is a reason to
hold the release; the two High findings are follow-on work of the same kind this Circle already
did four times.

The single most valuable change would be adding the four compound-command heads to
`GRAMMAR_PREFIXES`. It is a one-line edit that closes the cheapest bypass in the system.

## Totals

| Severity | Count |
|---|---:|
| Critical | 0 |
| High | 2 |
| Medium | 4 |
| Low | 1 |

## Verdict against the five questions asked

### 1. Soundness of the classifier

Two constructible bypasses outside the documented residual list. Both are "the classifier reads the
wrong word", not "the classifier cannot know".

- **A compound-command head hides the verb.** `GRAMMAR_PREFIXES`
  (`hooks/lib/bash-mutation-guard.ts:314`) carries `then`, `else`, `do` — the body introducers —
  and not `if`, `elif`, `while`, `until`. `if rm -rf agents; then :; fi` allows; `while :; do rm
  rules/x.md; done` denies, because `do` is in the set. `exec` is the same gap in the wrapper
  table. Filed:
  `260801-1857_o_compound-command-head-hides-the-verb-from-both-bash-classifiers.md`.
- **A backslash-escaped command word is unrecognised.** `stripData` emits escape pairs verbatim
  (`shell-parse.ts:227`) and nothing downstream removes them, so `\rm -rf rules` allows. The one
  backslash residual that is documented (`protected-path-discipline.md:192-194`) reasons about an
  **operand**, where shortening a word is harmless; the reasoning does not transfer to the command
  word, where it renames the program out of the table. Filed:
  `260801-1858_o_a-backslash-escaped-command-word-is-unrecognised-by-both-classifiers.md`.

Both also defeat the git branch policy — `if git switch main; then :; fi`, `\git switch main`,
`sudo git switch main` and `exec git switch main` all allow. That is pre-existing, but it makes
`hooks/guard.ts:11-13` ("a complete choke-point against autonomous branch drift") false in a file
this Circle changed, and commit `3806a49` established that such a claim is treated as a defect.

Everything else I could construct held. `sudo env rm`, `/bin/rm`, `'rm'`, `"rm"`, wrapper chains,
`--`, `-t` in both semantics, `git -C`, `cd`/`pushd`/`popd`/`cd -`, `(…)` scoping, `$(…)` depth
walking, `..` normalisation, absolute paths, trailing slashes, glued and separated redirection,
`2>&1`, heredocs both delimiter forms — all classify correctly. The eight documented residuals
reproduce exactly as written.

### 2. False positives

The corpus is not representative in the one direction that matters.

- **Twenty-two of the 72 commands cannot deny under any protected list** — `npm test`,
  `git status --short`, `date +%y%m%d-%H%M`. They hold nothing down.
- **Not one of the 72 puts a variable or substitution in a written-operand position**, which is
  the largest false-positive family the classifier has: `npm test > "$TMPDIR/x.log"`,
  `rm -rf "$BUILD_DIR"`, `mv "$f" /tmp/`, `for f in build/*.js; do rm "$f"; done`,
  `cd "$TMPDIR" && rm -rf work` all deny. The three "substitution idioms" entries each place the
  substitution somewhere harmless.

The `cd`-tracking half is the exception and is genuinely well covered — 22 subdirectory cases,
`pushd`/`popd`, subshells, `cd -`, absolute-vs-relative. That was the newest and riskiest step and
it shows.

Filed: `260801-1900_o_the-must-never-deny-corpus-omits-the-largest-false-positive-family.md`.

Two false-positive mechanisms are worth separating from the general fail-closed rule, because the
documentation says they do not exist:

- **Redirection carries fail-closed into unrecognised programs.** Three documents state that an
  unrecognised program is allowed however unparseable its arguments are. `npm test > "$LOG"`
  denies. Filed:
  `260801-1859_o_redirection-carries-fail-closed-into-unrecognised-programs-and-three-docs-deny-it.md`.
- **A `>` inside a double-quoted string is read as a redirection.**
  `git commit -m "docs: rules/a.md -> rules/b.md"` denies on `rules/b.md`. Measured against this
  repository's own history: 0 of 257 commit subjects and 4 of 5370 body lines trip it, so it is
  latent rather than painful — but it is a deny on `git commit` with a reason an agent cannot act
  on. Filed:
  `260801-1901_o_a-redirect-operator-inside-a-double-quoted-string-is-read-as-a-redirection.md`.

Also filed: `260801-1903_o_perl-include-flag-glued-to-its-value-is-misread-as-the-in-place-flag.md`
(Low), where `perl -Ilib` trips `isPerlInPlaceFlag` although the docstring three lines above says
`-I` is excluded.

### 3. The two Bash invariants

**Sound.** The source-text assertions alone would not be — `expect(bashPathCode()).not
.toContain("resetBlockCounter")` (`guard-bash-wiring.test.ts:76`) passes if a helper defined
outside the extracted range does the reset, and `stripComments` deletes the very comments that
document the property — but they are not alone. `guard-bash-wiring.test.ts:374-403` runs the real
hook as a subprocess against a throwaway project and reads `escalation.json` and `events.jsonl`
back: an innocuous call writes neither file, and an innocuous call between two blocks leaves the
counter at 1. That is the property itself, not a proxy for it.

The structural gate is still worth keeping: it fails at the point of edit rather than at the point
of consequence, and `:83-87` ("keeps both on the write-tool path, so the gate cannot pass by
deletion") closes the obvious way to satisfy a `not.toContain` assertion.

One gap, not filed: the invariants are behaviourally tested only on the git-clean route. The
override-allow route (`guard.ts:289-305`) writes escalation state deliberately, and the test at
`:310-332` asserts `consecutiveBlocks` is 0 after — but it was 0 before, so it does not discriminate.
Blocking once first would make it a real assertion.

### 4. The self-detect decision

**Agreed, and for the reason given.** The mutation check is a write-guard concern. Leaving it
active while `Edit` stands down would mean `Edit rules/x.md` allowed and `mv rules/x.md
rules/retired/` denied, which teaches an agent that the route around the guard is the working one —
the precise failure `rules/protected-path-discipline.md` exists to prevent. The branch policy's
argument genuinely does not transfer: a human switches branches in their own terminal, which the
hook never sees, so gating the agent there costs the developer nothing.

What depends on it, all of it consistent:

- `helpers/guard-harness.ts` is built entirely on the stand-down being `process.cwd()`-only, with no
  upward walk and a per-process cache. That is what makes a temporary project root sufficient and a
  fresh subprocess per case mandatory. Both are asserted rather than assumed
  (`makeProject`'s realpath invariant, `guard-bash-integration.test.ts:389`).
- The consequence the Circle accepted: every false positive found in this review lands in consuming
  projects only, which is also where nobody is positioned to notice a pattern and file it. That is
  the argument for the corpus carrying the weight, and it strengthens the corpus finding above.
- `rules/protected-path-discipline.md` is loaded into agents running in this repo, where its central
  claim is false. The final bullet (`:198-200`) says so. Adequate.

### 5. Test quality

**656 pass; the suites are above average for a security classifier**, and the step-6 harness in
particular is the strongest part of the Circle — fail-loud on a fail-open guard, no skip
conditions, the macOS realpath trap reproduced on purpose so a vacuous pass cannot come back
silently.

I mutation-tested the unit suites the same way step 6 was checked: `hooks/` copied to scratch, one
behaviour neutralised at a time, five suites run, with a no-op control to prove the harness reports
survival correctly. Nine of thirteen mutations were caught, several with double-digit failure
counts. Four survived — `--` end-of-flags, `isSkippedRedirectTarget`, `ancestorOfProtected`'s
segment boundary, and `cd ~` → `outside` — and in each case the intended discriminating command is
absent or defeated by its own choice of fixture. Filed:
`260801-1904_o_four-classifier-behaviours-are-deletable-with-a-green-suite.md`, which also records
that roughly 86 deny assertions check only the boolean and that the `normalize` stub is unpinned
against `guard.ts`.

Nothing tautological, nothing asserting a mock, no test pinning a bug as correct. The five pinned
residuals (`rm -rf *`, `cd .. && cd project`, sibling `$(…)`, brace expansion, `xargs` on stdin) are
calibrated disclosure and belong where they are.

## Cross-cutting observations

1. **Both High findings are the same shape and hit both classifiers.** The mutation classifier got
   `GRAMMAR_PREFIXES`, `WRAPPER_PROGRAMS` and `programName` because "a wrapper is a one-word bypass
   of the whole table" was understood. The git classifier, five months older, got none of them. The
   two now sit side by side consuming one lexer, which makes sharing the command-word resolution the
   obvious next move — and makes the current asymmetry look accidental rather than decided.
2. **The documentation is unusually good and therefore unusually load-bearing.** Three separate
   surfaces (module docstring, `README-hooks.md`, `rules/protected-path-discipline.md`) state the
   fail-closed bound, and all three state it wrongly in the same way. When a claim is repeated three
   times, correcting it is a three-file edit; that is the cost of the (correct) decision to document
   the same thing for three audiences.
3. **The residual list is the review surface, and it is one entry short in three places.** The
   compound-command head, the escaped command word, and the absent git subcommands are each the kind
   of thing the list was built to hold. Adding them is worth as much as fixing them, because an
   agent that meets a bypass and knows it is a bypass behaves differently from one that does not.
4. **`MutationOptions.exempt` (`bash-mutation-guard.ts:136-137`) is never wired.** `guard.ts` passes
   only `protectedPaths` and `normalize`. It is labelled a future seam; if C5a is not imminent, it
   is two dead branches in the hot path. Not filed — noted for whoever owns C5a.

## Recommended sequencing

**Before the next release of the guard** (each is small and self-contained):

1. `GRAMMAR_PREFIXES` += `if`, `elif`, `while`, `until`; `exec` as a wrapper row. One line each,
   two tests each.
2. Correct the fail-closed bound in the three documents, and add the compound-command head, the
   escaped command word and the git subcommands to the residual list. Do this even if the code fixes
   land, because the residual list is what agents read.
3. Narrow `guard.ts:11-13`'s "complete choke-point" to match what `rules/git-branch-discipline.md`
   already says, plus the four forms found here.

**Next Circle, in this order:**

4. The escaped-command-word fix in `resolveWord`, with the two ordering decisions settled first.
5. `KNOWN_FALSE_POSITIVES` in the suite, then the four discriminating test cases from the mutation
   run.
6. The double-quoted-`>` fix, which needs a design decision about capture mode and must not flip
   the git classifier's fail-closed direction.

**Cleanup, no urgency:** `perl -Ilib`; the `git clean` / `git restore` decision; the unwired
`exempt` seam.

## What is right, stated plainly

The verb table is the right abstraction and the written/read distinction is the right axis. The
wrapper loop is bounded by word count rather than a fixed cap, and the comment explains why a fixed
cap would be worse. The virtual-cwd walk models `$(…)` depth and `(…)` parens separately because the
parser reports one and not the other, and it says so. `row()` uses `Object.hasOwn` so a program named
`constructor` is not a table row, and there is a test for it. The dangling-redirect adoption exists
because `2>&1` would otherwise be a false positive on nearly every shell call, and the reasoning is
written down where the next reader will need it. `dist/` is in sync with source, verified by
rebuilding to a scratch tree and diffing; `npm test` now runs `tsc` first, which is what makes that
stay true.

The residuals are stated without hedging, in three places, including the sentence that matters most:
"no claim that `protectedPaths` is enforced should be made without that qualification." That is the
right posture for this control, and it is why the two High findings are follow-on work rather than
a retraction.

---

## Reconciliation annotation — 260801-2029 (reconciler)

Findings not rewritten; disposition only, verified at HEAD `9ab5a2a`.

| Filed issue | Severity | State | Evidence |
|---|---|---|---|
| `260801-1857` compound-command head | High | `_c_` | `5d9bbcc` — `GRAMMAR_PREFIXES` driven off the exported set in both directions; `exec` added to the wrapper table |
| `260801-1858` backslash-escaped command word | High | `_c_` | `5d9bbcc` — shared `hooks/lib/command-word.ts`, consumed by both classifiers |
| `260801-1859` redirection fail-closed on unrecognised programs | Medium | `_c_` | `18e2e4f` — pass 3 runs only for a recognised verb; three docs corrected |
| `260801-1900` must-never-deny corpus gap | Medium | `_c_` | `18e2e4f` — corpus 72 → 102, `KNOWN_FALSE_POSITIVES` block, count floor replaced by a detected-write filter |
| `260801-1901` redirect operator inside a double-quoted string | Medium | `_c_` | `18e2e4f` — capture-mode placeholder for double-quoted spans that expand nothing |
| `260801-1902` git clean / restore / stash | Medium | `_c_` | `18e2e4f`, corrected by `9ab5a2a` — rows added, `mutatesOnlyWhen` seam |
| `260801-1903` perl `-Ilib` misread as in-place | Medium | `_c_` | `18e2e4f`, **regressed and re-fixed** by `9ab5a2a` — see `260801-1955` |
| `260801-1904` four behaviours deletable | Low | `_o_` | still open; `rm -- -rf` absent from the suite, `normalize` stub still unpinned |

The review's headline recommendation — "the single most valuable change would be adding the four compound-command heads to `GRAMMAR_PREFIXES`" — was taken. Its claim that both High findings also defeat the pre-existing git branch policy was correct and is what pulled the fix into the shared command-word resolver rather than into the mutation classifier alone.

Two of the seven fixes introduced regressions that the next review caught (`260801-1955`, `260801-1956`). Both are closed at HEAD.
