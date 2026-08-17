# Code review — Turn 2 fixes (`e31c0f3..HEAD`)

**Reviewer:** coderev · **Date:** 2026-08-01 · **Scope:** `5d9bbcc`, `18e2e4f`

## Summary

The unification is sound and the false-positive fixes land where they say they land, with one
exception: the perl/sed flag-letter truncation gives up more than the commit claims, and
`perl -lpi -e` — an everyday in-place form — now allows where it denied. The `git stash` row is a
second, smaller overreach. Six of the seven Turn-1 findings are adequately closed; the Low one is
still open and Turn 2 did not change it. Two new issues filed, both regressions of this Turn.

| Severity | Count |
|---|---:|
| High | 1 |
| Medium | 1 |

## 1. Did the unification preserve behaviour? Yes, verified two ways

**The old git suite passes in full against the new implementation.** I copied `e31c0f3`'s
`hooks/lib/__tests__/` over the new `hooks/lib/*.ts` and ran it: `git-branch-guard.test.ts`
**94/94** and `shell-parse.test.ts` **46/46** pass unchanged. Only `bash-mutation-guard.test.ts`
fails, 5 tests, and all five are accounted for — two are the moved `WRAPPER_PROGRAMS` export, one is
the grown `MUTATION_GIT_SUBCOMMANDS` exhaustiveness check, and two are the deliberate verdict
changes (`echo "x > rules/y.md"`, `cd $D && echo x > out.log`).

**A differential grid finds no loosening.** 31 command-word prefixes × 6 suffixes × 9 git commands
and 9 bash commands, old build against new: **0 DENY→allow** on either classifier, 480 and 210
tightenings respectively. The tightenings are the four claimed bypasses plus the ones sharing them
(`time`, `xargs`, `command`, `env`, `nice`, `timeout`, `"git"`, `/usr/bin/git`).

The reason the git side cannot loosen is structural and worth writing down: `findCommandWord` skips
a strict *superset* of what `findGitInvocation` skipped, and `git` is not in `GRAMMAR_PREFIXES` or
`WRAPPER_PROGRAMS`, so when the old scan found `git` the new one finds the same token at the same
index and `resolveWord`/`programName` are identities on it. `command-word.ts:151-159, 221-242`.

The base git suite held 94 cases, not 84; 99 is the correct new figure.

## 2. Did the false-positive fixes narrow too far? One of them did

I enumerated every DENY→allow change across the four changed areas. Everything in the
double-quote-capture and redirect-fail-closed families is exactly what the commits claim:

- `echo "x > rules/y.md"`, `git commit -m "a -> rules/b.md"` — the fix;
- `echo "a; rm rules/x.md"`, `"a && rm …"`, `"a | rm …"` — the three extra segmentation false
  positives the commit names;
- `npm test > "$LOG"`, `cat a > ~/b.md`, `echo x > $OUT`, `node x.js > $O`,
  `cd $D && echo x > out.log`, `cd $D && npm test > out.log` — the redirect bound, stated as a
  residual in all three documents.

The capture-mode double-quote change is bounded correctly. `shell-parse.ts:309` vetoes on `` $ ` \ ``;
blank mode is untouched (`mode === "capture" &&`), which is what makes the git classifier
byte-identical. The `\` veto is load-bearing and reasoned correctly at `:303-305` — a captured span
would keep an escape pair that only `resolveWord`'s code path removes.

**The exception is `shortFlagLetters` (`bash-mutation-guard.ts:253-261`).** The truncation is right
for a mandatory glued value (`-Ilib`, `-fscript.sed`) and wrong for an optional one. Measured
regressions, all `DENY` at `e31c0f3` and `allow` now:

```
perl -lpi -e 's/a/b/' rules/x.md
perl -lni -e …          perl -lpi.bak -e …
perl -xi / -Ci / -Di / -Vi -e …
sed  -li 's/a/b/' rules/x.md
```

`perl -lpi -e` is the canonical one-liner. Filed **High**:
`260801-1955_o_value-letter-truncation-loses-the-in-place-flag-for-perl-lpi.md`. The closing note on
`260801-1903` ("nothing the tools would honour") is false for this shape — perl reads `-lpi` as
three flags.

**The `git stash` row overreaches.** `stash: { written: "all" }` (`:383`) reads the sub-subcommand
as a written path. The rationale at `:357-361` ("a path that matches nothing") holds only at the
project root: `cd hooks && git stash pop` now denies on `hooks/pop`, and
`git stash push -m "$MSG"` / `git stash show "$REF"` deny fail-closed on a message and a ref. It
also re-opens the redirect case the other fix closed — `git stash list > "$LOG"` denies while
`npm test > "$LOG"` does not. Filed **Medium**:
`260801-1956_o_the-git-stash-row-reads-its-sub-subcommand-and-refs-as-written-paths.md`.

`git clean` and `git restore` are correct. `-e`/`--exclude` as a value flag, `--staged` still
allowed, `--source HEAD~1` reaching `mutatesOnlyWhen` through the asked-first reordering
(`:626-628`) — all verified against the built classifier.

## 3. Are the new residuals real? Yes, both

- **Unresolvable redirect target on a non-table program.** Genuine, and the argument for it is the
  strongest in either commit: the table already allows `curl -o rules/x.md`, so denying an
  *unreadable* target on the same program was inconsistent rather than strict. Stated in the module
  docstring (`:69-84`), `README-hooks.md` and `rules/protected-path-discipline.md`.
- **`#` comments unstripped.** Pre-existing at `e31c0f3`, verified — `ls -la # writes > rules/x.md`
  denies in both builds. Newly documented, not newly caused, and it errs toward deny.

One doc imprecision, not filed: `protected-path-discipline.md` says the fail-closed rule applies
"once the segment names a table verb". The gate is `verbWritten.length === 0`, so a *recognised but
non-writing* call is on the allow side — `sed 's/a/b/' x > "$F"` and `git status > "$F"` allow.

## 4. Is the corpus growth real? Yes, and the floor is a real measurement

102 entries, 29 of which deny under `["**"]` — both figures reproduce exactly. The additions
exercise what they claim: nine conditional/loop forms for the widened `GRAMMAR_PREFIXES`, nine
variable-in-written-position allows, four prose-with-`>` cases, five git-subcommand read forms,
three `perl -Ilib` forms.

The floor is a genuine improvement — `exercisesADetectedWrite` measures the classifier rather than
the fixture's length, so twenty trivial substitutions no longer satisfy it. It is not
*untrivialisable*: 27 variants of `rm -f /tmp/aN.txt` would still pass. That is a much narrower
attack than the old count floor and I would leave it.

`KNOWN_FALSE_POSITIVES` (11) is the right shape, and the companion assertion that every entry's
reason matches `/fail-closed/` is what makes it a discriminator rather than a snapshot.

**Mutation-tested all eleven new behaviours** (pass-3 gate, double-quote capture, each of the three
veto characters, the `resolveWord` unescape, the new grammar heads, the `exec` row, the flag-letter
truncation, the asked-first reorder, the three git rows, the wrapper loop). Every one is caught,
3-19 failures each. The new coverage is not decorative.

## 5. The Low finding — unchanged, and my Turn-1 count was one too high

Re-ran the four mutations against HEAD:

| Mutation | Turn 1 | Now |
|---|---|---|
| `--` end-of-flags dropped | survives | **survives** |
| `isSkippedRedirectTarget` → `length === 0` | survives | **survives** |
| `ancestorOfProtected` segment boundary removed | survives | **survives** |
| `cd ~` → `outside` branch deleted | survives | caught |

The fourth is caught by `"treats a bare cd and a ~ as somewhere outside the tree"` — and I ran the
same mutation against `e31c0f3`, where it is **also** caught. So Turn 2 did not fix it; my Turn-1
finding miscounted, and the number was three from the start. Turn 2 added no new deletable
behaviour. `260801-1904` stands, with the count corrected to three.

## Sequencing

1. `260801-1955` (High) before this Circle closes — it is a regression of this Turn on the guard's
   core purpose, and the discriminating test pair (`perl -lpi` deny / `perl -Ilib` allow) is what
   proves any fix is not just the old behaviour back.
2. `260801-1956` (Medium) with it or immediately after; the `-m` value flag is a one-line partial.
3. `260801-1904` (Low) whenever, with the count read as three.

## What is right, briefly

Putting the resolver above the lexer and below both classifiers is the correct layering, and the
docstring says why in one sentence (`command-word.ts:15-18`). `GRAMMAR_PREFIXES` now states its
membership rule and its rejections with reasons, which is what makes the next addition checkable
rather than guessed. The escape fix's pinned ordering (`shell-parse.ts:778-783`) is the one place a
plausible reading costs an allow, and it is pinned in the direction that costs a deny. `dist/` is in
sync — rebuilt to a scratch tree and diffed. 730 tests pass.

---

## Reconciliation annotation — 260801-2029 (reconciler)

Findings not rewritten; disposition only, verified at HEAD `9ab5a2a`.

| Filed issue | Severity | State | Evidence |
|---|---|---|---|
| `260801-1955` value-letter truncation loses `perl -lpi` | High | `_c_` | `9ab5a2a` — two-class `ShortFlagGrammar`, letter classes measured against perl 5.34.1 and both seds |
| `260801-1956` git stash row reads refs as written paths | Medium | `_c_` | `9ab5a2a` — `SubcommandDispatch` / `GIT_STASH` at `hooks/lib/bash-mutation-guard.ts:491-551`, model measured against git 2.53.0 |

Both were regressions this review's own scope (`5d9bbcc`, `18e2e4f`) introduced, and both were fixed inside the same session. The review's correction of the base git-suite figure (94 cases, not 84) is carried forward: the suite is 753 tests across 16 files at HEAD.

The review's judgement that the Turn-1 Low finding was untouched by Turn 2 is confirmed independently — `260801-1904` remains `_o_`.

Worth recording because it is the sharper lesson: `260801-1903`'s resolution note claimed "nothing the tools would honour" was given up, and that claim was false. The issue file now carries the correction in its own body, appended when `260801-1955` closed. A resolution note that asserts a bound should be verified against the family it changes, not only against the cases the fix was written for.
