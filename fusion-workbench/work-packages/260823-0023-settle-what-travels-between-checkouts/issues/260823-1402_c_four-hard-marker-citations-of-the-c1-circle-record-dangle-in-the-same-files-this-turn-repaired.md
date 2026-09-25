Four hard-marker citations of the C1 Circle record dangle, in three of the four files this Turn opened to repair that exact class

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 3
**Affects:** `260822-2219-what-two-checkouts-of-one-project-actually-share.md:6`, `:294`; `260822-2219-analyst-two-checkout-isolation-measurement.md:6`; `260822-2239-reconciliation.md:5`
**Cross-references:** `260823-1318_*_the-closure-claim-that-nothing-else-cites-the-two-decisions-by-a-hard-marker-is-false-in-four-files.md`, whose repair touched three of these four files; `260823-1318_*_ten-record-citations-in-the-turn-1-review-dangle-after-this-turns-renames-and-no-gate-covers-reviews.md`, which names the gap that hides them

---

## What is wrong

`a2a18f9` rewrote fourteen citations to the `_*_` wildcard, four of them in the C1 Circle's files, on the ground that a hard marker is a pointer that dies at its target's next transition. Four citations of the **C1 Circle record itself** stand in those same files under the marker `_t_`, and the record has carried `_c_` since `4aaabc3`:

```
circles/260822-1921-measure-what-two-checkouts-share/analyses/260822-2219-what-two-checkouts-of-one-project-actually-share.md:6
  **Requested by:** orchestrator, as the single measuring task of Circle `circles/…/_t_circle.md`
circles/260822-1921-measure-what-two-checkouts-share/analyses/260822-2219-what-two-checkouts-of-one-project-actually-share.md:294
  - `circles/…/_t_circle.md`
circles/260822-1921-measure-what-two-checkouts-share/history/260822-2219-analyst-two-checkout-isolation-measurement.md:6
  **Circle:** `circles/…/_t_circle.md`
circles/260822-1921-measure-what-two-checkouts-share/history/260822-2239-reconciliation.md:5
  **Circle:** `circles/…/_t_circle.md`
```

**All four are pointers, not statements about a marker.** `rules/circle-records.md` `### Citation form in the portfolio` gives the test: a statement whose subject *is* a transition keeps its letter, a pointer loses nothing by starring. None of the four says anything about a transition. The strongest case is `:294`, which sits third in a list whose first two entries already carry `_*_`.

**The repair pass reached three of these four files and did not see them.** `260823-1318_*_the-closure-claim-…` was verified by "a tree-wide search for both records under every hard marker", scoped to the two decision records it was about. A Circle record is the one target whose marker moves at closure by construction, so it is the citation most certain to die, and no pass in this Circle searched for it.

## Verified

Resolved each of the four as written against the tree at `a2a18f9`: zero matches. Fences and inline exhibits excluded. `git show b8a4c1a:` on the analysis file shows lines 6 and 294 unchanged, so all four predate this range; `4aaabc3` is the `R068 _t_circle.md → _c_circle.md` rename. The fifth `_t_circle.md` token in that analysis, at `260822-2219-what-two-checkouts-of-one-project-actually-share.md:117`, is **not** in this finding: it names a scratch Circle built for the measurement harness, which never existed in this tree, and it reads as a statement about what the harness held.

## Direction, not a prescription

Rewrite the four to `_*_`. The class is worth one search rather than four: every Circle record cited by a `_t_` or `_a_` marker anywhere outside a fence will dangle the moment that Circle transitions, and no gate reaches history or analyses.

---

Resolved: 2026-08-23 by coder. All four citations were rewritten to the `_*_` wildcard form, at
`260822-2219-what-two-checkouts-of-one-project-actually-share.md:6`
and `:294`,
`260822-2219-analyst-two-checkout-isolation-measurement.md:6`,
and
`260822-2239-reconciliation.md:5`.

**Three tokens in the same analysis were left standing, deliberately, and each for its own reason.**
`:117` is the scratch Circle this record already excludes. `:49` is a table row whose subject is the
class `circles/<c>/_t_circle.md` rather than any file — the path is already a placeholder, so there
is nothing for a star to point at. `:193` and `:194` are verbatim `git` output inside a fenced block,
where the spelling *is* the datum.

**The tree-wide search this record's Direction asked for was run, and its result is a number rather
than a repair.** Over `circles/*/reviews/`, `shared/reviews/`, the history and analysis stores, the
class is far larger than these four: 270 dangling record citations stand in 64 of the project's 90
review files alone. Repairing them was outside this pass's scope and is not what closes this record;
the measurement was filed instead, with the question of whether any gate should reach that text, as
`260823-1414_*_does-the-workbench-citation-gates-corpus-cover-review-files.md`.

**Measured.** No shipped surface moved for this item; all four files are workbench records, which sit
on no bounded surface.
