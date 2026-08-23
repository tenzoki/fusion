Ten `Record:` citations in the Turn 1 review dangle after this Turn's renames, and no gate covers a review file

---

**Severity:** High
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 2
**Affects:** `fusion-workbench/circles/260823-0023-settle-what-travels-between-checkouts/reviews/260823-1110-coderev-c2-turn-1.md:36`, `:41`, `:46`, `:49`, `:52`, `:57`, `:69`, `:74`, `:77`, `:80`
**Cross-references:** `shared/issues/260818-1637_*_no-gate-resolves-a-path-line-citation-and-thirteen-drifted-in-a-single-change.md`, the record this Circle already appended a marker-move instance to; `circles/260819-1645-four-constraints-on-deep-change/decisions/260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`, which defines the corpus

---

## What is wrong

Turn 2 renamed ten defect records from `_o_` to `_c_`: one in `e7454e3`, one in `d23c706` and eight in `18974bc`. Every one of those ten is cited by name, with its `_o_` marker spelled out, on a `Record:` line of the Turn 1 review. All ten citations now name a file that does not exist.

```
reviews/260823-1110-coderev-c2-turn-1.md:36  Record: `260823-1110_o_the-untracked-portfolio-turns-npm-test-red-in-every-fresh-clone-of-this-repository.md`
reviews/260823-1110-coderev-c2-turn-1.md:41  Record: `260823-1110_o_the-conditional-marker-write-has-no-plugin-root-guard-so-an-empty-version-wipes-the-record.md`
reviews/260823-1110-coderev-c2-turn-1.md:46  Record: `260823-1110_o_step-0i-collapses-multiple-active-to-head-1-and-names-one-circle-arbitrarily.md`
reviews/260823-1110-coderev-c2-turn-1.md:49  Record: `260823-1110_o_the-guard-event-log-falls-in-no-class-of-a-partition-that-claims-every-entry-falls-in-one.md`
reviews/260823-1110-coderev-c2-turn-1.md:52  Record: `260823-1110_o_step-0h-reports-unset-and-set-as-merge-driver-names-and-the-rule-enumerates-neither.md`
reviews/260823-1110-coderev-c2-turn-1.md:57  Record: `260823-1110_o_the-cut-shifted-two-line-citations-in-an-always-on-rule-and-one-now-points-at-a-blank-line.md`
reviews/260823-1110-coderev-c2-turn-1.md:69  Record: `260823-1110_o_two-of-six-baseline-re-approvals-carry-no-accounting-and-the-log-now-contradicts-the-constant.md`
reviews/260823-1110-coderev-c2-turn-1.md:74  Record: `260823-1110_o_the-gitignore-comment-still-describes-the-two-group-split-its-authoring-home-replaced.md`
reviews/260823-1110-coderev-c2-turn-1.md:77  Record: `260823-1110_o_the-retired-staging-drift-example-survives-at-two-authoring-sites-and-the-closure-names-one.md`
reviews/260823-1110-coderev-c2-turn-1.md:80  Record: `260823-1110_o_the-done-report-enumeration-omits-step-0i-while-step-0i-instructs-it-to-report.md`
```

## Why no gate saw it

The workbench citation gate's corpus predicate selects Circle records, open issues, live decisions, live plans and the portfolio, and nothing else (`hooks/lib/__tests__/workbench-citation-lint.test.ts:163-172`). A file under a Circle's `reviews/` store matches none of the five, so the densest single concentration of record citations this Circle produced sits outside the gate entirely.

`18974bc` met the same fault one file away and repaired it. Its `Also seen:` line sat in `shared/issues/260818-1637_o_…`, an open issue, so the gate went red and the pass corrected it to the `_*_` wildcard. The commit message calls that "the second instance of it in this range". Ten further instances stood in the file that same commit names as its own `Source:`, and the green suite said nothing, because the corpus does not reach it.

## Verified

Searched at HEAD `b8a4c1a` for `_o_<slug>` and `_a_<slug>` over the whole tree, one exact literal per renamed record, twelve renamed records in all. The ten above are the complete set of hard-marker citations the Turn 2 renames broke. The two decision records renamed by `a76ee8f` produced no `_a_` hits anywhere.

The parser does judge this form: `hooks/lib/__tests__/helpers/citation-scan.ts` scans a `bare-record` token and reports `stale marker '_x_': the record now exists as …`. The citations are pointers under its grammar, not statements about a spelling, so the fence exemption does not apply to them.

## Direction, not a prescription

Two things, and the second is the larger one.

Correct the ten lines to the `_*_` wildcard form, which is what the project's own citation form asks for and what the same pass already applied to the `Also seen:` line.

Then decide whether a review file belongs in the citation gate's corpus. It is a live record by every ordinary reading, it is the durable output of a reviewing pass, and it carries a `Record:` pointer per finding by construction, so a marker move breaks it every time findings are closed. The corpus is a user's recorded answer, so widening it is a gate question rather than a repair, which is exactly the ground `e7454e3` argued one commit earlier for refusing to narrow it. Note the cost of the obvious answer as well: a review file's citations go stale the moment its findings are closed, which is normal and desirable, so admitting reviews would redden the suite on every successful repair pass unless the closing pass corrects the review in the same commit.
---

Resolved: 2026-08-23 by coder. All fourteen hard-marker record citations in
`circles/260823-0023-settle-what-travels-between-checkouts/reviews/260823-1110-coderev-c2-turn-1.md`
were rewritten to the `_*_` wildcard form: the ten this record names, plus four it does not.

**The four extra were resolving at filing and were repaired anyway**, because each is a pointer that
dies at its target's next transition and one of them was about to. The `**Plan:**` field at `:9` named
the plan by `_o_`, and the plan is renamed to `_c_` in this same pass, so leaving it would have been
this record's own fault committed inside its repair. `:64` names the one Turn 1 record still open,
`260823-1110_*_the-merge-driver-unsorts-a-second-event-log-reader-whose-repair-direction-is-positional.md`,
which dangles the day it closes. `:57` carries a second citation beside its `Record:` line, of
`shared/issues/260818-1637_*_no-gate-resolves-a-path-line-citation-and-thirteen-drifted-in-a-single-change.md`.
`:76` is the fourth, an elided form spelling `_c_` for
`260823-0800_*_two-further-surfaces-classify-portfolio-md-as-an-authored-record.md`, which a slug
search does not find and the citation parser still reads as a pointer.

**The Turn 2 review was repaired in the same pass**, seven citations,
`circles/260823-0023-settle-what-travels-between-checkouts/reviews/260823-1318-coderev-c2-turn-2.md`.
Six of them are the `Record:` lines naming the six records this pass closes, so the pass would
otherwise have broken the record of its own findings while repairing the record of the previous ones.
That is the recurrence this finding warns about, one Turn later, and it was met before it landed
rather than after.

**The corpus question this record raises second is deliberately left open.** No gate's corpus was
widened, no predicate was touched, and no test file changed for this item. The corpus is a user's
recorded answer under
`circles/260819-1645-four-constraints-on-deep-change/decisions/260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`,
and the cost this record itself names (a review's citations go stale on every successful repair pass,
so admitting reviews reddens the suite unless the closing pass corrects the review in the same commit)
is a trade nobody has chosen. It stays a question for the user.

**Measured.** Review files sit on no bounded surface. Nothing in `agents/`, `skills/`, the hook tests
or the always-on rules moved for this item.

**Files:** the two review files named above. Uncommitted at the time of writing; the orchestrator commits.
