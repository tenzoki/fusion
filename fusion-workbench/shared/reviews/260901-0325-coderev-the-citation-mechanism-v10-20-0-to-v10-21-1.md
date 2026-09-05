# Code review — the citation mechanism, v10.20.0 to v10.21.1

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `89f67d66..dcdca34c`
**Not-opened:** `README.md`, `README-agents.md`, `README-hooks.md`, `.claude-plugin/plugin.json`, `hooks/lib/__tests__/reference-resolution-lint.test.ts`, `hooks/lib/__tests__/fixtures/surface-growth.golden`, `hooks/dist/citation-check.js`, `hooks/dist/citation-sweep.js`, `hooks/dist/lib/citation-scan.js`, `hooks/dist/lib/config.js`, `hooks/dist/turn-budget.js`

The range is `v10.20.0..v10.21.1`, resolved to the two hashes above because
`bin/fusion-review-coverage` accepts only hex endpoints (`hooks/lib/review-coverage.ts:157`). The
`hooks/dist/*` files were executed for every measurement in this review but not read as text;
`committed-dist.test.ts` is what pins them to their source. `CLAUDE.md`, `agents/orchestrator.md`,
`install.sh`, `skills/help/SKILL.md`, `hooks/turn-budget.ts` and `hooks/lib/__tests__/config.test.ts`
were read as diffs against `v10.20.0` rather than whole, and are not listed as not-opened.

**Verification:** `cd hooks && npm test` — exit 0, 48 files, 832 tests passed, at `dcdca34c` with
the seven new issue records in the tree.

## Summary

The three concerns the dispatch raised as most load-bearing are clean: the `REC_RE` rooting
enumeration destructures correctly across all seven rootings, `citations.extraPaths` drops whole,
and `readsBackWhole()` rejects nothing reachable beyond the two classes it is documented for.

What the pass found instead is one **High** defect that reaches a release gate, and it is not in
the grammar the range rewrote. The `fabricated-name` exemption keys on the substring `foo`, which
fires on `footer`; sixteen store-prefixed citations in this repository's own workbench are
therefore exempt, and the `rewrites=0` gate in `citation-sweep.test.ts` is green over a tree that
still carries the spelling the storeless form retired. The rest are boundary cases the range's own
fixes did not reach: two record patterns got the sentence-stop lookbehind and the third and fourth
did not, and the lookbehind's character class was not brought into step with the tail class widened
one commit earlier.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 3 |
| Low | 3 |

Seven records, all in `shared/issues/`: the pass found them beside the dispatched range rather than
inside an active Directive, and there is no active Circle.

## Findings by theme

### Theme 1 — an exemption that fires on a substring hides real violations

**F1 (High).** `hooks/lib/citation-scan.ts`, the `consider()` exemption chain, exempts a token whose
text includes `foo` with reason `fabricated-name`. The test is a bare substring. Measured over the
checker's own corpus at `dcdca34c`: 22 481 tokens, 42 `fabricated-name` exempt, **17** whose `foo`
sits inside a longer word (`footer`, in every case), of which **16 are store-prefixed**. Fourteen
distinct tokens in twelve files, spanning `shared/`, three live Circles and `archive/`.

The consequence is not a missing row. `rewriteOf()` at `hooks/citation-sweep.ts:457` returns `null`
on `hit.status === "exempt"` before the visibility guard is reached, so those sixteen are never
rewritten either — and `citation-sweep.test.ts:428` asserts `files=0 rewrites=0` over this
repository's workbench as a release gate. The gate is satisfied by invisibility, not by cleanliness.
`node hooks/dist/citation-check.js` prints `store-prefixed=0` at the same commit.

Record: `260901-0318_*_the-fabricated-name-exemption-hides-sixteen-store-prefixed-citations-in-this-repositorys-own-workbench.md`.

**This is wider than the record already filed for the same mechanism.**
`260830-2235_*_the-fabricated-name-exemption-keys-on-the-literal-foo-so-every-realistic-probe-fixture-is-read-as-a-real-citation.md`
states the false-positive direction — a fabricated fixture judged as a real citation, costing one
violation row. The false-negative direction is not in it, and it costs a release gate. Whoever
answers either should answer both: a keying property that fixes one direction settles the other,
and its own "Not proposed here" section is where that constraint belongs.

### Theme 2 — the sentence-stop repair reached two of the four record patterns

`4f5834ef` gave `SENTENCE_STOP` to `BARE_RE` and `REC_RE`. Two boundary cases survive it, and they
are the same defect read from two sides.

**F2 (Medium).** `CIRCLE_REC_RE` did not get the lookbehind and still ends with
`(?![A-Za-z0-9_.\/-])`, whose class contains `.`. A `circles/<dir>/_x_circle.md` citation ending a
sentence therefore matches nothing, backtracks to nothing, and is picked up by no other pattern —
`REC_RE` finds no store segment, `CIRCLE_RE` refuses the `/`, `BARE_RE` and `STAMP_RE` refuse the
`/` in front of the stamp. Measured on a scratch workbench: `NO TOKEN`. That is one class worse than
the defect `4f5834ef` repaired, where the citation at least dangled visibly. Not instantiated in
this tree today. Record:
`260901-0321_*_a-circle-record-citation-that-ends-a-sentence-produces-no-token-at-all.md`.

**F3 (Medium).** `SENTENCE_STOP`'s class is `[A-Za-z0-9_…*-]`, which is `BARE_RE`'s tail class minus
the `.`. `REC_RE`'s tail class was widened by `4cffcae4` one commit earlier to admit `[` and `]`,
and the two were not brought into step. A store-prefixed token ending in `]` fails the
word-before-the-stop test, so the greedy tail keeps the sentence's full stop:

```
in : see shared/issues/260519-0438[o].
out: 'shared/issues/260519-0438[o].'   record / store-prefixed
     fix: cite the storeless form '260519-0438[o].'
```

The `fix` tells the reader to write the sentence's own full stop into the storeless form. This is
the ninth case the eight probes in `citation-grammar-boundaries.test.ts`
miss, and they miss it structurally: every probe there is a `bare-record`, and only `REC_RE` admits
a bracket. Record:
`260901-0320_*_the-sentence-stop-lookbehind-does-not-cover-the-bracket-characters-the-record-tail-admits.md`.

### Theme 3 — the declared-paths leaf, and what it does not say

**F4 (Medium).** `declaredCitationFiles()` documents its case split as "disjoint and complete over
five branches". Over patterns it is. Over outcomes it is not: a pattern git names, whose paths all
fail `existsSync`, takes neither the `unmatched` branch nor contributes a file, and produces no
line of output at all. Verified on a scratch project — `git ls-files` names `src/a.go`, the checker
prints `declared-patterns=1 declared-files=0`, stderr empty. An ordinary `rm` without `git rm`
reaches it. The bare `0` is indistinguishable from a matched-nothing pattern, which the same
function goes to one git call per pattern to make nameable. Record:
`260901-0319_*_a-declared-pattern-whose-index-entry-has-no-work-tree-file-reports-declared-files-zero-with-no-note.md`.

**F5 (Low).** `hooks/lib/config.ts`: the advisory for a bad `citations.extraPaths` element reads
`must be an array of strings, got an array`, because `describeValue()` reports the container's type
while `isArrayOfNonEmptyStrings` failed on an element. `expected` also omits the non-empty half of
the rule — the half the function's own docstring calls the one most worth refusing. `config.test.ts`
pins the wording with `toContain("an array of strings")`, which all three of its cases satisfy while
being accurate for one. Record:
`260901-0323_*_the-extra-paths-diagnostic-names-the-containers-type-so-a-bad-element-is-reported-as-an-array.md`.

### Theme 4 — the two hand-run helpers still disagree about a file

The range's stated principle is that the reporter and the rewriter share one corpus, because a
reporter narrower than the rewriter is how the sweep came to change files the checker declared
clean. Two residual asymmetries.

**F6 (Low).** `hooks/citation-check.ts:174` names every corpus file by a project-root-relative
spelling; `hooks/citation-sweep.ts:585` computes `relative(cwd, realpathSync(abs))`. The file-wide
exemption `RECORD_EXAMPLE_FILES` is keyed on that string, so the checker matches it from anywhere
and the sweep only from the project root. The sweep's own tests carry both spellings for one file
(`citation-sweep.test.ts:64` and `:147`). No effect on this tree — neither exempt file is in the
sweep's corpus — but a project declaring `rules/` or `skills/` gets a sweep whose worked-example
exemption depends on the directory it was launched from. Record:
`260901-0324_*_the-checker-and-the-sweep-key-file-exemptions-on-two-different-spellings-of-the-same-file.md`.

**F7 (Low).** `hooks/citation-sweep.ts:582,610` accumulate the residual in one flat array and sort it
by line then column with no file key, so the "in file order" the header promises interleaves files
by line number. Verified on this repository's dry run: rows at 852, 860 and 873 from three different
files, consecutive. Introduced at `a60d1fea`, so it ships in v10.20.0 and predates this range; filed
here because this is the pass that opened the file. Record:
`260901-0322_*_the-sweeps-residual-list-is-sorted-by-line-number-across-every-file-not-in-file-order.md`.

## What the dispatch asked about, verified clean

- **`REC_RE`'s rooting enumeration and the positional destructure.** No index shift. `ROOTING`,
  `LEFT_ANCHOR`, `MARKER_SLOT` and `SENTENCE_STOP` contribute no capture group, so groups 1–6 are
  `circles/<dir>`, `shared`, `<dir>`, `<store>`, `<stamp>`, `<rest>` exactly as
  `hooks/lib/citation-scan.ts:817` reads them. Driven over all seven rootings — bare store, `shared/`,
  `circles/<dir>/`, bare Circle directory, `../fusion-workbench/`, `archive/<sweep>/`,
  `fusion-workbench/circles/<dir>/` — and the reported `segment` is correct in every one, with the
  token spanning its own rooting.
- **`citations.extraPaths` drops whole.** `isArrayOfNonEmptyStrings` judges the array and its
  elements as one value, `validateLayer()` omits the leaf entirely on failure, and `pickCitations`
  then inherits `DEFAULTS`. Resolved value comes back `[]` in every failing case. The wording of the
  advisory is F5; the drop itself is right.
- **An empty pattern list never reaches git.** `patterns.length === 0` returns before
  `git rev-parse` (`hooks/lib/citation-scan.ts:1069`), so a project that declares nothing gets
  `unavailable: false` and no advisory. Separately confirmed that the empty pathspec really is worth
  refusing: `git ls-files -- ':(glob)'` lists every tracked file under cwd. Also confirmed that
  stacked pathspec magic cannot escape the prefix — `:(glob):(top)*.go` matches nothing rather than
  reaching the toplevel.
- **`readsBackWhole()` rejects nothing reachable beyond its two documented classes.** A candidate
  that tokenises as `stamp-bare` (guard (c)) and the pre-v4 bracket form are the two, and both are
  intended. The reachable silent non-rewrite is upstream of the guard, in the exemption chain, and
  is F1. One theoretical rejection remains unmeasured: a malformed Circle directory name carrying
  `--` or a trailing `-` would not read back whole, and I found no such directory in this tree.
- **The archive-sweep index entry.** `circleDirs()`'s `one()` helper accumulates rather than
  overwrites, so a sweep and a Circle sharing a name report `ambiguous` with both paths;
  `citation-grammar-boundaries.test.ts:87` drives that path directly rather than resting on the
  measurement. Worth stating as a consequence rather than a defect: `partition()` puts `ambiguous` in
  `undecidable`, so on a collision such a citation reaches **no verdict** at all — it becomes neither
  resolved nor a violation.

## Cross-cutting observations

**Every finding above is a boundary between two things that were written to agree and were not
checked against each other.** `SENTENCE_STOP`'s class against `REC_RE`'s tail class (F3); the four
record patterns against each other (F2); the checker's `rel` against the sweep's (F6); the
diagnostic's `expected` string against the check beside it (F5); a documented case split against the
code's actual outcomes (F4). The range fixed exactly this class of defect three times and left five
instances of it.

**Two mechanisms in this file are stated as one thing and implemented as a list.** `readsBackWhole()`
is the good case: one property, asked of the output, subsuming every shape. The exemption chain in
`consider()` is the other: eight branches, one of them a substring test, and it is the one that
produced the High finding. The chain is where the next defect of this kind will be.

**A gate whose green depends on an exemption is not measuring what its message says.**
`citation-sweep.test.ts:428` tells the reader "the committed workbench still carries a
store-prefixed citation the sweep would rewrite" when it fails. It cannot say anything about the
sixteen it never sees. Any answer to F1 should make the gate's assertion and its message name the
same set.

## Recommended sequencing

1. **F1** before the next release. It is the only finding that makes a shipped gate's verdict wrong,
   and it is measured rather than inferred.
2. **F2 and F3** together, as one repair to the grammar's boundary handling: derive `SENTENCE_STOP`'s
   class from the tail it is appended to, and give `CIRCLE_REC_RE` the same ending the other two
   have. One commit, and `citation-grammar-boundaries.test.ts` grows two rows.
3. **F4** with whatever next touches `declaredCitationFiles()`. The leaf is new and unmeasured in the
   field; a silent short count is worth closing before a project depends on the figure.
4. **F5, F6, F7** as cleanup. None changes a verdict today.

---

**Reconciliation annotation, 260905-2015 (reconciler, HEAD `5b84b13a`). Findings only; nothing above
is rewritten.**

**F1 — confirmed resolved.** Both halves landed. `7af91d5c` made the exemption a word test
(`FABRICATED_NAME`, `hooks/lib/citation-scan.ts:439`), and `d30ca04a` swept the sixteen it had been
hiding, 12 files and 16 rewrites. `node hooks/dist/citation-sweep.js --dry-run` reports
`files=0 rewrites=0` at HEAD, and the gate at `citation-sweep.test.ts:428` is now green over a tree
where the invisibility is gone rather than green because of it, which is what this finding asked for.
The record closes at this pass.

**F2, F3 — confirmed open, and the recommended sequencing still holds.** `SENTENCE_STOP` at
`hooks/lib/citation-scan.ts:296` still restates `BARE_RE`'s tail class rather than deriving from the
tail it closes, and `CIRCLE_REC_RE` at `:339-345` still ends in the lookahead that refuses a full stop.
Both reproduce by probe at HEAD. The one-commit repair this section recommends is still the whole of
the work.

**F4 — confirmed open.** The drop at `hooks/lib/citation-scan.ts:1231` still has no note and no
counter, and `declaredCitationNotes()` still has nothing to emit for it.

**F5, F6, F7 — confirmed open.** The residual sort in `hooks/citation-sweep.ts:621` still carries no
file key while the header at `:196` still promises file order; the `extraPaths` advisory in
`hooks/lib/config.ts` still composes a constant `expected` against the container's own type; and the
checker and the sweep still name a corpus file by two different spellings, project-relative at
`hooks/citation-check.ts:248` and cwd-relative at `hooks/citation-sweep.ts:596`.

The cross-cutting observation this review closes on — that the exemption chain is where the next defect
of this kind will be — has since been paid twice over: the same chain carries the still-open
false-positive direction of F1, and the foreign-record question that no exemption expresses.
