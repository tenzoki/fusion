# Reconciliation — 260818-0814

**Agent:** reconciler
**Domain:** `code`
**Status:** Complete
**Session reconciled:** `shared/history/260818-0708-orchestrator-session.md`
**Range:** `1dc062d..f3a3565` (four commits)
**HEAD at reconciliation:** `f3a3565`
**Active Circle:** none — every record in scope is in the shared stores

---

## What was reviewed

| Store | Read | Changed |
|---|---|---|
| `shared/planning/` | 3 plans, all `_c_` | 0 |
| `shared/issues/` | 190 records (86 `_o_`, 104 `_c_`) | 3 annotated, 0 renamed |
| `shared/decisions/` | 24 active in `shared/` (22 `_a_`, 2 `_o_`) plus 4 active in Circles | 2 annotated, 1 filed |
| `shared/reviews/` | 12, 1 from this session | 1 annotated |
| `shared/history/` | this session's 4 | 0 (this file added) |
| `shared/analyses/` | 17, 1 from this session | 0 |

No marker moved. Every marker the session set was verified correct against disk, and none was found
misstating ground truth.

---

## The four checks the dispatch asked for

### 1. The release — clean, and it is the one thing here that left this repository

Every surface agrees on `10.1.0` and the tag resolves where it should.

| Surface | Value | Read at |
|---|---|---|
| Manifest | `10.1.0` | `.claude-plugin/plugin.json:3` |
| Marketplace entry | `10.1.0` | `<marketplace>/.claude-plugin/marketplace.json:42` |
| Installer pin example | `FUSION_REF=tags/v10.1.0` | `install.sh:27` |
| README pin example | `FUSION_REF=tags/v10.1.0` | `README.md:26` |

- Tag `v10.1.0` is an annotated tag resolving to `c4ead2a`, the release commit, and it is on the
  remote: `git ls-remote --tags origin` returns `refs/tags/v10.1.0^{} → c4ead2ae`.
- The marketplace working clone at
  `/Users/k1/Projects/productive/F03-CLAUDE-plugin-marketplace/claude-plugins` is clean, at `cc1d2a0`
  ("fusion 10.1.0"), and level with `origin/main` (`git rev-list --left-right --count` → `0 0`).
- **The fifth surface, the one that is not a version, is coherent.** `plugin.json`'s `description`
  and the marketplace entry's `description` are byte-identical. `CLAUDE.md` names this as the pair
  that drifts because two prose descriptions can both be well-formed and still disagree; they do not.
- **Nothing in the release commit contradicts what the plugin ships at that tag.** Measured rather
  than assumed: `npm run build` in `hooks/` produced no change to the working tree, so the committed
  `hooks/dist` is byte-identical to a fresh compile of the committed source. Between `v10.1.0` and
  `f3a3565` no hook source and no `dist` file changed — the only diffs are
  `hooks/lib/__tests__/sentence-identifier-containment.test.ts` and the growth golden — so that
  measurement holds at the tag as it holds at HEAD.
- The identifier fixes the release claims (`bd2db5c`, `6b6436d`, `307a696`) all precede `c4ead2a`
  and are inside the tag.

**One state, not a fault, and the session is not over.** The local `main` is **3 ahead of
`origin/main`**: `2d62af6`, `33645a2` and `f3a3565` are unpushed. The release commit and the tag are
pushed. Phase 4 has not run.

### 2. The gate's own claims — the header is accurate against the code

`hooks/lib/__tests__/sentence-identifier-containment.test.ts` (425 lines) was read against what it
executes, claim by claim. The full suite is green at HEAD: **36 files, 672 tests, exit 0.**

Verified true:

- *"it keys on the IMPORTED name"* — `:311` splits on ` as ` and takes `[0]`, the imported half.
- *"the assertion REFUSES that form rather than reading it, for a relative module"* — `NAMESPACE_IMPORT`
  at `:293` requires a specifier beginning `.`; `completenessFault()` at `:324` returns the refusal
  message before any parse. `import * as nodePath from "node:path"` is correctly ignored (`:422`).
- *"one measured case per form, at the foot"* — seven cases at `:362-425`: control, plain named,
  alias dropping the suffix, alias keeping it, multi-line block with an inline `type` specifier,
  relative namespace refused, builtin namespace ignored.
- *"no `why` literal in either module carries a stamp or a hash today, and neither builder emits a
  `why` field"* — checked independently of the header. A grep for a `YYMMDD-HHMM` stamp or a 7-40
  character hex token inside any `why:` literal in `hooks/lib/review-coverage.ts` and
  `hooks/lib/staging-drift.ts` returns nothing, and neither `coverageSentence()` nor
  `stagingSentence()` reads a `why` field.
- *"0.375^7, about 1 in 960 for the seven-character short hash"* — re-derived: (6/16)^7 = 0.0010428,
  one in 959.
- *"every branch below and the two silent ones included"* — the control flow of both builders was
  walked. `coverageSentence()` has an uncovered branch, a carried branch with and without
  `carriedFrom`, and the empty return; `stagingSentence()` has a records branch, a commit-message
  branch, and the empty return. The nine registry cases drive all of them. No path is undriven.
- *"No bound went red and no baseline was edited"* (both commit messages) — `AGENT_BASELINE`,
  `SKILL_BASELINE`, `TEST_LINE_BASELINE`, the three head-room constants and
  `helpers/growth-bound.ts` are untouched across `1dc062d..f3a3565`. The two edits to
  `hooks/lib/__tests__/fixtures/surface-growth.golden` are regenerations of a per-file inventory;
  that file's own header states that regenerating it moves no baseline.

**Nothing was found claiming more than the file enforces.** The correction that landed in `f3a3565`
(issue `260818-0746`) holds: the header now says the relation catches an identifier a *builder*
authors, and says plainly that one authored into a report field is contained by construction and
passes. The residual list at `:36-61` is accurate and does not understate.

One residual the header states obliquely rather than wrongly, recorded here and **not** filed: the
completeness assertion covers the set of *builders*, and nothing covers the set of *branches* per
builder. A new conditional path added to a registered builder is not driven until someone adds a
branch by hand. The header's `WHAT IT DOES NOT COVER` opens with "Branches nobody drives", which is
the statement — it is just the shortest sentence in a long list, and it carries the largest residual.

### 3. Review coverage — measured, not taken from the summary

`bin/fusion-review-coverage` at HEAD:

```
since=1dc062d  head=HEAD  commits=4  reviews=1  unusable=0  uncovered=1
verdict=uncovered
  uncovered f3a3565 fix(hooks): the completeness assertion reads the imported name, and refuses what it cannot read
  review shared/reviews/260818-0748-coderev-turn-1-range-1dc062d-33645a2.md range=1dc062d..33645a2 not-opened=none covers=3
carried=none
```

So: **one commit uncovered, `f3a3565`, by the user's decision.** `c4ead2a` and `2d62af6` are inside
the single review's declared range, which is what the dispatch summary said.

Neither review file claims a range it did not open. `260818-0748` declares
`**Reviewed-range:** 1dc062d..33645a2` and `**Not-opened:** none`, both parse, and its narrative
scope ("the gate added by `33645a2`, plus confirmation that `c4ead2a` and `2d62af6` carry no code")
sits inside its declared range rather than outside it. Its claim that the two carry no code is true
in substance: `c4ead2a` changes three lines, one of them a comment line in `install.sh`, all three
version strings.

**One correction to the dispatch summary: this session produced one review file, not two.**
`shared/reviews/` holds a single file dated `260818`. The two dated `260817` belong to the previous
session (`260817-2037`), and `1dc062d` — that session's last commit, before this session's anchor —
is what appended to them. The count of agent history files is right if the orchestrator's own file
is counted: three agent logs (analyst `260818-0715`, coder `260818-0733`, coder `260818-0759`) plus
`260818-0708-orchestrator-session.md`.

### 4. The two open exposure records — both still hold at HEAD

Re-read rather than assumed; the annotations are on the records themselves.

- `260818-0715_o_four-shipped-surfaces-use-a-real-fusion-circle-directory-name-as-the-format-example.md`
  — all four sites carry `260716-1847-workbench-umbau` verbatim at the filed line numbers
  (`bin/fusion-paths:262`, `rules/fusion-workbench-conventions.md:27` and `:91`,
  `skills/next/SKILL.md:42`), and the Circle directory still exists, so the lint still resolves it.
  Two further occurrences are outside the record's scope as written and are named on the record so a
  one-change fix does not sweep them: `rules/circle-records.md:41` is a provenance citation that must
  keep the real name to resolve, and `hooks/lib/__tests__/fusion-paths.test.ts:82` is a test constant.
- `260818-0715_o_the-orchestrator-prompt-names-a-fusion-record-inside-the-instruction-for-what-to-report-to-the-user.md`
  — `agents/orchestrator.md:866`, `:811` and `:819` all carry `260810-1205` verbatim at the filed
  line numbers. No commit in the range touched `agents/`, so none of the three options was taken and
  none was foreclosed.

Neither was silently resolved. Both stay `_o_`.

---

## Changes made

| File | Change |
|---|---|
| `shared/issues/260817-2131_c_…lint-reads-comment-lines-only.md` | `Revised by:` footer appended, no rename |
| `shared/issues/260818-0715_o_…format-example.md` | reconciliation evidence appended |
| `shared/issues/260818-0715_o_…report-to-the-user.md` | reconciliation evidence appended |
| `shared/decisions/260816-1707_o_…emitted-when-its-consumers-are-a-human-and-a-skill.md` | search recorded, marker held |
| `shared/decisions/260817-1613_o_…read-by-a-human-or-not-at-all.md` | search recorded, marker held |
| `shared/reviews/260818-0748-coderev-turn-1-range-1dc062d-33645a2.md` | three findings confirmed against disk |
| `shared/decisions/260818-0814_o_…convention-rule-was-not-chosen.md` | **filed** |
| `shared/history/260818-0708-orchestrator-session.md` | `## Coherence` appended |

### Why `260817-2131` gained a `Revised by:` and not a rename

The record is closed and stays closed — the gate was never in question. What moved is a claim in its
`Resolved:` note. That note states that the companion assertion means "a third builder wired into the
funnel fails the suite until it is registered", and at `33645a2` that guarantee did not hold: the
parse kept the local alias and discarded the imported name, so `import { budgetSentence as budgetLine }`
and `import * as rc from "./lib/…"` both left the suite green with an unregistered builder present.
`260818-0745` measured it; `f3a3565` made the sentence true. That is precisely the shape the
`Revised by:` footer was added for, in `1dc062d`, one commit before this session's anchor — a closed
record whose stated reasoning a later commit moved, with no rename and the `Resolved:` note left
unedited. The footer also notes the note's "273 lines" is the file at `33645a2` and is 425 at HEAD.

### Why a decision record was filed

`shared/decisions/260818-0814_o_what-covers-the-plugin-repo-shaped-exempt-surface-record-now-that-the-convention-rule-was-not-chosen.md`.

The user's gate on analysis `260818-0715` took recommendations 1 and 2 and declined 3, the convention
rule. That choice is recorded in exactly two places, and neither is the decision store:
`agentstate.yaml` `plan_context.user_directive`, which Cleanup deletes, and the closing paragraph of
`260817-2131`'s `Resolved:` note, which is a defect record's account of its own scope. The convention
of this workbench is that a design fork gets a decision record.

The rejection itself needs no further answer. Its stated consequence does. Recommendation 3 says in
its own text that the convention rule "is also the only surface that covers `260807-2153`" — a record
open since 2026-08-07 about `rules/fusion-workbench-conventions.md`'s exempt-surface list being
written from the plugin repository's position while shipping to every consumer. With 3 declined,
nothing in the workbench names a route to it. The record is filed `_o_` rather than `_a_` because the
open half is what needs the user, and because reconstructing a user's answer from a state file is not
the same act as recording it.

---

## Filed during this pass

- `shared/decisions/260818-0814_o_what-covers-the-plugin-repo-shaped-exempt-surface-record-now-that-the-convention-rule-was-not-chosen.md`

No new defect was filed. Nothing found in this pass is a defect: the three items worth the
orchestrator's attention are a bookkeeping divergence, an unpushed range and a Grounding gap, and
each is stated in `## Coherence` on the session's own history file.

## Misfiled — should be a decision

None found this pass.

---

## For Phase 4, three things this pass will not do itself

1. **The two recorded Directives do not agree, and the state file claims zero revisions.**
   `shared/history/260818-0708-orchestrator-session.md` reads "Release the version that fixes the
   leaked identifiers, and have the general prevention of fusion-internal identifiers reaching
   consumer projects **examined**". `agentstate.yaml` `session.directive` reads "Release the
   identifier fix, and **gate the composed channel** so a fusion-internal identifier cannot return to
   an emitted sentence", with `control.directive_revisions_this_session: 0`. The session satisfied
   both readings — it examined (`2d62af6`) and it gated (`33645a2`, `f3a3565`) — so no work is in
   question. What is in question is the record: two files state different destinations and neither
   says a revision happened. One of them should be corrected at Phase 4, and the history file is the
   durable one.
2. **The uncovered commit has to be named in the closure note, not counted.** Decision
   `260815-2109_a_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md` is answered
   (options 3 then 1: coverage stays advisory, the gap is named in the closure note) and unrealised.
   Its obligation is live: name `f3a3565` and its subject, not "one commit".
3. **Three commits are unpushed.** `2d62af6`, `33645a2`, `f3a3565`.
