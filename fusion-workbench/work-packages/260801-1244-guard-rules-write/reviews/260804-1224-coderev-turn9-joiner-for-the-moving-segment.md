# Code review — Turn 9, `c43a6a2..4f1007f`: the joiner consulted for the segment that moves

**Sender:** coderev
**Circle:** `260801-1244-guard-rules-write`
**Scope:** commit `4f1007f`, diff `c43a6a2..4f1007f`, excluding `fusion-workbench/`. Four files: `hooks/lib/bash-mutation-guard.ts` (+141/-18), `hooks/lib/__tests__/bash-mutation-guard.test.ts` (+194/-0), `rules/protected-path-discipline.md` (+61/-36), `README-hooks.md` (+1/-1).
**Suite at HEAD:** `npm test` — 1252 passed, 24 files, 0 failed.
**Method:** every claim below re-measured rather than accepted. Differential against `c43a6a2` over an independently generated corpus; a second adversarial corpus; a real-guard-subprocess plus real-shell round in fresh throwaway projects; a six-mutation anti-vacuity battery run against a copy of the module.

---

## Summary

The change is sound and the report is accurate — every number in
`260804-1200-turn9-t9-1-…` reproduced under independent measurement, including the
two it would have been easiest to overstate. The five constraints in
`260804-0947_*_…` are met: nothing newly allows on either of my corpora, both
findings close in the shell that performs each write, the cost is stated as a rule with an
open example set in both shipped documents, and `until cd X; do W; done` still denies
under a pin that fails when the behaviour changes.

Four findings, none of them in the change's behaviour: one stale count this commit
introduced into the agent-facing rule file, one structural gap in the guarantee the
decision record's option 4 rests on, one comment left false in an out-of-scope file, and
the corrected evidence for an open issue whose own reproduction this commit invalidated.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 (inherited evidence for an already-open High, not a new defect) |
| Medium | 1 |
| Low | 2 |

---

## The five constraints, checked

### 1. No command may newly allow — **holds, on two corpora I built**

I did not reuse the implementer's generator. Differential `c43a6a2` vs `4f1007f`, both
modules loaded side by side, over **45,657 distinct commands × 2 environments (91,314
evaluations)**:

```
same=88166   newlyDeny=3148   newlyAllow=0
```

The corpus crosses six joiners × thirteen directory-builtin spellings × seven heads × twenty
writes × four inner joiners, plus two-builtin re-prove shapes, `(…)`/`$(…)`/brace scoping,
`if`/`while`/`until`/`for` bodies, seven wrapper and path spellings, seven git subcommands
including `git -C`, five redirection forms, unresolvable operands, and every three-deep
joiner permutation.

Then a **second, adversarial round aimed at the three `movesCallingShell: true` rows** —
the shapes a generator built for this change would not contain: a trailing `&` on the
builtin's own segment, `{ cd X ; } & W`, `( cd X ) & W`, `|&`, `;&`, `case … esac`,
backslash-newline continuations either side of the operator, `trap "cd X" EXIT`, and
background subshells. 2,880 evaluations:

```
newlyDeny=324   newlyAllow=0
```

Structurally this is what the change can do — it only ever calls `degradeUnprovenCd`, and
an unknown directory can only make a relative operand unresolvable, which only denies. The
one path where "unknown" could have been *weaker* than "known" is `resolveTarget`'s
`cwd.kind === "outside"` branch (`hooks/lib/bash-mutation-guard.ts:1458`), which allows;
`degradeUnprovenCd` turns `outside` into `unknown`, which denies. Checked, not assumed.

### 2 and 3. Both findings close, measured in the shell that performs each write — **holds**

Real guard subprocess, one fresh throwaway project per row; the shell effect measured in a
**second** fresh project per shell per row, so no verdict and effect share a tree. **No deny
read `[HALTED]`.**

```
GUARD  bash effect                zsh effect     command
DENY   rules/x.md:GONE            GONE           true || cd build && rm rules/x.md
DENY   rules/x.md:OVERWRITTEN     OVERWRITTEN    true || cd build && echo pwned > rules/x.md
DENY   rules/x.md:GONE            GONE           true || cd build && rm -rf rules
DENY   rules/x.md:GONE            GONE           true || cd build && mv rules/x.md /tmp/…
DENY   agents/coder.md:GONE       GONE           true || cd build && rm agents/coder.md
DENY   SKILL.md:OVERWRITTEN       OVERWRITTEN    true || cd build && echo pwned > skills/demo/SKILL.md
DENY   rules/x.md:GONE            GONE           mkdir -p build || cd build && rm rules/x.md
DENY   rules/x.md:GONE            intact         echo hi | cd build && rm rules/x.md
DENY   rules/x.md:GONE            intact         true | cd build && rm rules/x.md
DENY   rules/x.md:OVERWRITTEN     intact         ls | cd build && echo pwned > rules/x.md
DENY   agents/coder.md:GONE       intact         ls | cd build && rm -rf agents
DENY   rules/x.md:GONE            GONE           cd rules && true || cd /tmp && rm x.md
DENY   rules/x.md:GONE            intact         cd rules && true | cd /tmp && rm x.md
DENY   agents/coder.md:GONE       intact         cd agents && ls | cd /tmp && rm coder.md
DENY   rules/x.md:GONE            GONE           true || pushd build && rm rules/x.md
DENY   rules/x.md:GONE            GONE           true || cd build<newline>rm rules/x.md
DENY   rules/x.md:GONE            GONE           cd rules; true || cd /tmp && rm x.md
DENY   rules/x.md:GONE            intact         echo hi | cd build; rm rules/x.md
DENY   rules/x.md:intact          intact         [ -d nope ] || cd build && rm rules/x.md  (control)
DENY   rules/x.md:GONE            GONE           until cd nonexistent; do rm rules/x.md; break; done
ALLOW  build/out.js:GONE          GONE           true; cd build && rm out.js
ALLOW  build/out.js:GONE          GONE           ls & cd build && rm out.js
ALLOW  n/a                        n/a            cd build && rm -rf out / rm -rf node_modules / pushd build && ls; popd
```

The zsh column is the load-bearing half: the four `|` rows write in bash and not in zsh, so
neither shell alone would have measured `260804-0837_*_a-cd-inside-a-pipeline-runs-in-a-subshell-in-bash-and-the-model-follows-it-anyway.md`. The classifier takes bash's answer for
both, which is the pessimistic one and the right one.

Five of those rows are mine rather than the implementer's — `true || pushd build`, the
newline form, `cd rules; true || cd /tmp`, `echo hi | cd build;` and the two-builtin `|`
sibling — and all five deny with the file gone in the unguarded shell.

### 4. Cost stated as a rule, measured with a cross-product — **holds, and the shape claim survives an independent check**

Both shipped documents state it as a rule over an open example set:
`rules/protected-path-discipline.md:159-213` (the four questions, the joiner table written
out in prose, "Anything not in this table counts as **no** to both", and a third surprising
word — *"written", not "run"*) and `README-hooks.md:184`.

I re-ran the implementer's structural shape claim on **my** corpus rather than theirs. Every
one of the 3,148 newly-denying rows was re-parsed and asked which joiner sits in front of a
segment naming a directory builtin:

```
1510  "||"          eg  true || cd build && rm x.md
1510  "|"           eg  true | cd build && rm x.md
  64  "start,||"    eg  cd rules && true || cd /tmp && rm x.md
  64  "start,|"     eg  cd rules && true | cd /tmp && rm x.md
```

Zero rows with any other joiner in front of the builtin, and zero rows with no directory
builtin at all. The cost is exactly the shape the rule names and does not spill.

All 35 illustration rows across both documents were run through the classifier and behave as
documented, including the eight rows this commit added.

### 5. `until cd X; do W; done` still denies, and the pin is not vacuous — **holds**

It denies, and it deletes the file in both shells when the `cd` cannot be made, so the deny
is correct rather than incidental. The pin is a case of its own with the reason written in
it.

Non-vacuity proved by mutation rather than asserted. Six mutations applied to a copy of the
module, each the plausible wrong version of one claim:

| Mutation | Tests that fail |
|---|---|
| the move-side give-up removed (the pre-fix module) | 4 — the `\|\|` family, the `\|` family, the re-prove row, the control row |
| `\|` marked as moving the calling shell (zsh's answer) | 3 — the `\|` family, the re-prove row, the table cell |
| the unknown joiner falls through as safe | 1 — `answers a joiner it has never heard of with 'neither'` |
| the condition stated over "a builtin new in this segment" | 1 — `denies a cd that RE-PROVES the directory…` |
| `;` marked as carrying a `cd` forward | **7 — including `keeps `until cd X; do W; done` denying`** |
| a third place compares a joiner literal | 1 — `keeps one fact about a joiner in one place` |

The battery reproduces the implementer's table exactly. The `until` pin fails under mutation
5, so it is measuring something.

---

## The three things specific to this change

### The departure from the record is justified and the sibling leak is real

The record proposed gating on "a builtin new in this segment"; the shipped condition is
stated over `state.moved` alone. Mutation 4 above is exactly the record's weaker form, and it
fails the re-prove test. The leak it leaves open is real and I measured it end to end:
`cd rules && true || cd /tmp && rm x.md` deletes `rules/x.md` in **both** shells, and the
absolute `cd /tmp` is what re-proves a directory bash skipped. My corpus shows 128 rows of
that family (`start,||` and `start,|`), all newly denying, none newly allowing. The stronger
form costs nothing that the weaker form did not, on either of my corpora.

### The one-fact-not-two property is real for one file and narrower than the record needs

The test is live — mutation 6 fails it — but it reads **one file**, and
`hooks/lib/shell-parse.ts:678-686` already holds one of the two facts as a literal
comparison (`pending === "&&"`, glossed as *"`&&` is the only joiner that guarantees
anything"*). The two agree today and I could not construct a divergence, but they are
inverted with respect to each other: the table is a safe-list, the lexer branch is an
unsafe-list keyed on `&&`, and the next Circle restructures the lexer. Filed as
`260804-1221_*_…`, Medium, with the two candidate directions.

The docstring's own one-line check is also wrong as written: `grep -c '\.joiner'` returns
**3**, not 1, because two of the hits are the docstring stating the recipe. Third generation
of an audit recipe in this module that does not survive being run (`260804-1027_*_the-replacement-audit-recipe-went-stale-in-the-turn-after-it-was-written-and-omits-moved.md` is the
second). Folded into the same record.

### The three hand-ons — all three confirmed

- **`hooks/lib/shell-parse.ts:128-131` carries a false sentence.** Confirmed: "both are open"
  is false at HEAD, and the citation names `260804-0947_*_…`, a path that no longer resolves
  now the record is `_i_`. Filed as `260804-1222_*_…`, Low, so it does not live only in a
  session history.
- **`260804-1025_*_the-decision-procedure-tells-an-agent-the-model-stays-exact-for-the-two-commands-that-delete-a-rule-file.md` is no longer reproducible by its own steps.** Confirmed — the new question
  2 stops both of its commands before they reach the clause. **And it must not be closed on
  that basis:** the clause still returns "the model stays exact" for six commands that deny
  (`cd -P`, `cd $D`, `command cd`, `pushd -n`, ambient `CDPATH`). The recommended fix is
  unchanged. Filed as `260804-1223_*_…` carrying the replacement evidence, explicitly to be
  closed with `260804-1025_*_the-decision-procedure-tells-an-agent-the-model-stays-exact-for-the-two-commands-that-delete-a-rule-file.md` rather than instead of it.
- **`260804-0839_*_the-flat-joiner-model-ignores-shell-precedence-so-a-pipeline-and-an-if-body-degrade-a-cd-the-shell-guarantees.md` is unrelieved, as instructed.** Confirmed: all four shapes deny
  identically before and after (`if cd hooks; then rm -rf dist; fi`,
  `while cd build; do rm out.js; break; done`, `cd hooks && npx tsc | tee typecheck.log`,
  `{ cd build; } && rm out.js`).

---

## Findings

| # | Severity | File | What |
|---|---|---|---|
| `260804-1220_*_the-illustration-block-still-points-at-three-questions-in-a-procedure-that-now-has-four.md` | Low | `rules/protected-path-discipline.md:218` | The illustration block still points at "the three questions" — this commit made them four. Introduced here. Also: the new question 2's gloss restates the safe-list as the closed pair `\|\|`/`\|`, three paragraphs after the table says otherwise. |
| `260804-1221_*_the-one-fact-about-a-joiner-guarantee-is-asserted-over-one-file-and-a-second-file-already-holds-the-same-fact.md` | Medium | `bash-mutation-guard.ts:1706-1730`, `shell-parse.ts:678-686`, the source test | The "one fact about a joiner in one place" guarantee — the mitigation option 4 rests on — is asserted over one file, and a second file already holds the `carriesCdForward` fact as a literal comparison. Inert today, in the allow direction if a `carriesCdForward: true` joiner is ever added. Plus the self-refuting `grep` recipe. |
| `260804-1222_*_the-segmentjoiner-docstring-says-both-shapes-are-open-and-cites-the-decision-by-a-filename-that-no-longer-exists.md` | Low | `shell-parse.ts:128-131` | "both are open" is false, and the decision is cited by a `_o_` filename that no longer resolves. |
| `260804-1223_*_260804-1025s-reproduction-is-stale-but-its-clause-still-overclaims-here-are-the-commands-that-replace-it.md` | High (inherited) | `rules/protected-path-discipline.md:189-190` | `260804-1025_*_the-decision-procedure-tells-an-agent-the-model-stays-exact-for-the-two-commands-that-delete-a-rule-file.md`'s corrected reproduction. Six commands still reach the "model stays exact" clause and deny. Close with `260804-1025_*_the-decision-procedure-tells-an-agent-the-model-stays-exact-for-the-two-commands-that-delete-a-rule-file.md`, not instead of it. |

Nothing was found in the change's behaviour. The ten lines and the table do what they claim.

---

## The parent Circle's remaining ledger — the three-item list is incomplete

The list I was given — `260804-1024_*_git-c-supplies-a-directory-the-model-skips-so-a-relative-operand-resolves-off-the-protected-list.md`, `260804-1025_*_the-decision-procedure-tells-an-agent-the-model-stays-exact-for-the-two-commands-that-delete-a-rule-file.md`, and a review of `048f3db` and `cc012fc`
— is correct in what it names and correct in its ordering, and it is **not** the whole set.
All three are real:

- `260804-1024_*_git-c-supplies-a-directory-the-model-skips-so-a-relative-operand-resolves-off-the-protected-list.md` — verified still live at HEAD: `git -C rules rm x.md`,
  `git -C agents rm coder.md`, `git -C rules clean -fdx` and `git --work-tree=rules rm x.md`
  all **allow**, while `git rm rules/x.md` and `git clean -fdx rules` deny. High, and the
  only remaining item that fails *open*.
- `260804-1025_*_the-decision-procedure-tells-an-agent-the-model-stays-exact-for-the-two-commands-that-delete-a-rule-file.md` — still open, with the caveat above.
- `048f3db` (Turn 6) and `cc012fc` (Turn 8) carry no review. Confirmed against
  `reviews/` (Turns 3, 4, 5, 7 only) and the reconciliation's own section G.

What the list omits, in the order I would work it:

1. **`260804-1026_*_git-checkout-treeish-overwrites-a-protected-path-and-is-in-neither-the-verb-table-nor-the-residual-list.md`, Medium — `git checkout <treeish> -- <protected>`.** Verified live:
   `git checkout HEAD~5 -- rules/x.md` and `git checkout otherbranch -- rules/x.md` allow
   and overwrite a protected rule, while `git restore --source=HEAD~1 rules/x.md` denies.
   Same operation, different spelling, opposite verdict. This is a **second write route into
   `rules/**` that fails open**, it is not in `MUTATION_GIT_SUBCOMMANDS` and it is on no
   residual list. It belongs beside `260804-1024_*_git-c-supplies-a-directory-the-model-skips-so-a-relative-operand-resolves-off-the-protected-list.md`, not below it — the boundary sentence this
   Circle wants is false while either is open.
2. **Plan Steps 6, 7 and 8 — the whole of C5b, unstarted.** The Circle's Directive is two
   halves: the `FUSION_ALLOW_RULES_WRITE` exemption *and* the per-project `fusion-guard.json`
   loader, template and `/fusion:setup` seeding. Steps 1-5 are done; 6, 7, 8 have not
   started (`260802-1856_*_plan-guard-rules-write.md:4`, re-verified by two
   reconciliations). **This is the largest omission on the list.** A Coherence verdict cannot
   be clean against a Directive whose second half was never built — the answer is either to
   build it or to renegotiate the Directive, and either way it is a decision, not an
   oversight.
3. **Plan Step 10 — rebuild `hooks/dist/`, bump `plugin.json`, push.** Nothing in eleven
   commits is live for any consuming project; `origin/main` is 36 commits behind and the
   installed `rules/protected-path-discipline.md` is the 275-line pre-Circle copy. The
   sequencing question the new Circle's record raises is real and belongs here: shipping now
   makes `260804-0839_*_the-flat-joiner-model-ignores-shell-precedence-so-a-pipeline-and-an-if-body-degrade-a-cd-the-shell-guarantees.md`'s over-deny live, holding leaves the no-flag write routes open in the
   field. Reconciliation `260804-1021-reconciliation.md` recommends shipping after items 1 and 2 of its own
   list.
4. **Plan Step 9, rescoped — `260803-1402_*_`, Low.** Three files still carry the false
   sentence "There is no override for a protected-path shell write", including `CLAUDE.md`.
   `rules/protected-path-discipline.md` now both names `FUSION_ALLOW_RULES_WRITE` and denies
   it exists, 372 lines apart.
5. **`260804-0842_*_the-git-gold-fixture-carries-no-double-pipe-pipe-or-ampersand-joiner-and-no-allow-only-row.md`, Low — the git gold fixture** carries no `||`, `|` or `&` joiner and no
   allow-only row. It is the fixture that insulates the git classifier from every change to
   this module, including this one, and this Turn is the third to lean on it.
6. **`260804-1027_*_the-replacement-audit-recipe-went-stale-in-the-turn-after-it-was-written-and-omits-moved.md`, Low** — the replacement audit recipe. Now with a sibling in
   `260804-1221_*_the-one-fact-about-a-joiner-guarantee-is-asserted-over-one-file-and-a-second-file-already-holds-the-same-fact.md`.
7. **`260803-1352_*_`, Low** — two guard-advisory details skip the 200-char clamp
   (`hooks/guard.ts:532`, `:560`).
8. **The four findings this review filed** — `260804-1220_*_the-illustration-block-still-points-at-three-questions-in-a-procedure-that-now-has-four.md`, `1221`, `1222`, `1223`.
9. **The three open decision records** — `260803-1314_*_`, `260803-1402_*_`, `260802-1912_*_does-the-self-protection-floor-apply-before-the-config-file-exists.md`.
   None blocking; all three wait on Step 6, which is item 2.

**`260804-0839_*_the-flat-joiner-model-ignores-shell-precedence-so-a-pipeline-and-an-if-body-degrade-a-cd-the-shell-guarantees.md` is correctly *not* on the list.** It moved to
`260804-1205-shell-reachability-model` by the user's option-4 choice, and that
Circle's Directive names it as the live cost it closes. It stays physically in this Circle's
`issues/` with `_o_` — worth a pointer line on the record so a reader does not count it
twice.

### Corrected ordering

`260804-1024_*_git-c-supplies-a-directory-the-model-skips-so-a-relative-operand-resolves-off-the-protected-list.md` and `260804-1026_*_git-checkout-treeish-overwrites-a-protected-path-and-is-in-neither-the-verb-table-nor-the-residual-list.md` first (both fail open, both in `resolveGit`'s neighbourhood,
one pass) → the Turn 6 / Turn 8 review → `260804-1025_*_the-decision-procedure-tells-an-agent-the-model-stays-exact-for-the-two-commands-that-delete-a-rule-file.md` + `260804-1223_*_260804-1025s-reproduction-is-stale-but-its-clause-still-overclaims-here-are-the-commands-that-replace-it.md` + `260804-1220_*_the-illustration-block-still-points-at-three-questions-in-a-procedure-that-now-has-four.md`
(one edit to one section) → **the Step 6-8 decision** → Step 9 → Step 10 (the ship) →
the Low tail.

The item most likely to be lost is number 2. It is not an issue in any store — it is the
unbuilt half of the Directive, visible only in the plan's `**Status:**` line.

---

## Reproduction

Measurement scripts are in this session's scratchpad
(`rev/diff.ts`, `rev/corpus.ts`, `rev/shape2.ts`, `rev/shell.ts`, `rev/adv.ts`, `rev/probe.ts`,
`mut/mutate.mjs`). Nothing under `hooks/` was modified: the differential loads a `git show`
of `c43a6a2`'s module beside the working-tree one, and the mutation battery runs against a
copy of `hooks/lib` outside the repository. `git status` on `hooks/` is unchanged by this
review.
