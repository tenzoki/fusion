# Code review — session `260810-1646-orchestrator-session.md` Turn 1, range `5ef92eb..940d522`

**Sender:** coderev
**Scope:** the plugin's own source across all 7 commits of the range. Workbench records and history
files excluded per the dispatch.
**Suite state at review time:** `npx vitest run` over the three touched test files — 38 passed,
0 failed. `hooks/dist/` matches a fresh `tsc` byte for byte.

---

## Summary

The five substantive changes do what their messages say, and three of the four measurements the
messages assert were verified against the artifacts they cite. The heaviest change — executing the
domain cascade instead of reading it — is sound, and its central claim ("there is no second copy")
is false for one reason nobody looked at: `/fusion:cleanup` carries a prose copy of the cascade in
the pre-fix order. The commit-message change fixes the shell-quoting defect and pays for it with a
lock that is released only by good intention, on a justification that does not hold.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 2 |
| Medium | 3 |
| Low | 6 |

Eleven findings, eleven records filed under `shared/issues/260810-1918_o_*`.

## Verified claims

- `hooks/dist/lib/domain-cascade.js` contains no `require`, no `import`, no external reference —
  self-contained as `CLAUDE.md` requires. The whole of `hooks/dist/` reproduces byte-identically
  from a clean `tsc` into a scratch outDir, so no committed build output is stale.
- `045a14f` really is truncated at the apostrophe in `project's` ("…so a consuming projects"), and
  `4f16c60` really carries the repaired message. The Step 3b rationale is measured, not asserted.
- `/fusion:commit` has no `Write` tool (`allowed-tools: [Bash, Read, Glob, AskUserQuestion]`), so
  the heredoc route is correct there, and both skills' `<<'FUSION_MSG_EOF'` delimiter is properly
  quoted.
- `f38f37d` restored all three records; the range contains zero deletions with no successor, and the
  three appear at HEAD as `260810-050{1,2,3}_c_*`.
- `agents/orchestrator.md` in the range carries exactly one hunk, in Step 3b. The four-minute live
  mutation left no residue: Setup Step 5 (`:144-174`) is coherent and the cascade parses, evaluates,
  and passes both gates.
- The monitor `case` is disjoint, total, and `set -u`-safe; both pre-existing gates are byte-identical.
- The drift lint's header is honest about what it buys. Every limit it states holds against the code.

## Findings by theme

### One decision, two definitions

- **H1 — `skills/cleanup/SKILL.md:114` carries a second domain cascade in the pre-fix order, and no
  gate reads it.** `hooks/lib/domain-cascade.ts:19-31` and `README-hooks.md:179` both claim drift is
  "unrepresentable". Both new gates read only `agents/orchestrator.md`. KRK reaches `code` at Setup
  and `strategic` at cleanup, in the same session.
  → `260810-1918_*_the-cleanup-skill-carries-a-second-domain-cascade-in-the-pre-fix-order-and-no-gate-reads-it.md`

- **M3 — `agents/orchestrator.md:429` adds a second criterion for choosing the lock form that
  `rules/workbench-stash-and-lock.md:135`, the authoring home, does not carry.** Folded into H2.

### The commit path

- **H2 — Step 3b drops `with` for a reason that does not apply, and the replacement releases the
  lock only in prose.** After step 3 the message is in a file and reaches git as `-F <literal path>`
  — the case line 429 says `with` stays correct for. The two skills prove it. The four-command block
  at `:419-426` has no `trap` and no `||`; a failed `git add` holds the lock for 60s.
  → `260810-1918_*_step-3b-drops-the-lock-form-that-releases-on-any-exit-for-a-reason-that-does-not-apply.md`

- **M1 — `agents/orchestrator.md:402` still sends the bugfixer-success path to "step 3 (stage +
  commit)"**, which is now "write the commit message".
  → `260810-1918_*_the-bugfixer-success-path-still-points-at-step-3-which-is-no-longer-stage-and-commit.md`

- **M2 — the staging instruction became a shell comment**, and `f38f37d`'s claim that Step 3b
  "already forbids in substance" a directory-wide `-u` does not hold: the surviving text names only
  `-A`.
  → `260810-1918_*_the-explicit-staging-instruction-became-a-shell-comment-and-still-does-not-forbid-add-u.md`

- **L5 — `skills/commit/SKILL.md:84-88` shows the heredoc indented inside a list**, where a verbatim
  copy indents the message and puts the terminator off column 0.
  → `260810-1918_*_the-commit-skills-heredoc-example-is-indented-so-a-verbatim-copy-never-terminates.md`

### Silence where the same range chose to speak

- **M3 — `bin/monitor:1244` `sleep 0.5` is the one command left unguarded before `wait`.** Non-
  fractional `sleep` (BusyBox without `FEATURE_FANCY_SLEEP`, Solaris, AIX) exits 1 under `set -e` —
  the same orphaned-server symptom as `260810-1558_*_a-missing-open-command-exits-the-monitor-wrapper-under-set-e-and-orphans-the-server-it-forked.md`, one line further down.
  → `260810-1918_*_sleep-0-5-is-the-remaining-command-that-can-exit-the-monitor-wrapper-before-wait.md`

- **L1 — the monitor launcher swallows both "absent" and "failed" without a word**, while
  `skills/setup/SKILL.md:251` and `agents/orchestrator.md:126,142` establish the opposite convention
  in the same range.
  → `260810-1918_*_the-monitor-launcher-goes-silent-where-the-same-session-established-naming-the-gap.md`

### Citation rooting

- **L2 — the rooting reached two of three skills**, and the paragraph announcing the rule ends with
  a bare `skills/cleanup/SKILL.md:11`.
  → `260810-1918_*_the-citation-rooting-reached-two-of-three-skills-and-its-own-example-is-unrooted.md`

- **L3 — inside this repository the rooted citations now read the installed copy**, reversing the
  work-tree preference `bin/fusion-rules` / `bin/fusion-paths` were given for exactly this reason.
  Correct for consumers; a regression here. Currently masked by both copies being 7.2.0.
  → `260810-1918_*_the-rooted-citations-read-the-installed-copy-inside-the-plugins-own-repo-where-the-helpers-do-not.md`

### Gates

- **L4 — `domain-cascade.test.ts:321-335` asserts a git checkout**, not a property of the code.
  `bin/fusion-count-sources` exits 2 by design outside a work tree; the test reads that as failure.
  → `260810-1918_*_the-live-cascade-test-asserts-a-git-checkout-and-fails-in-any-tree-without-one.md`

- **L6 — `SKIP_LICENCES` misses every negation that does not spell "not"** — "isn't", "not
  required", "except when", "as time allows", "no longer needed", "dropped", "sparingly", "provided
  that". Filed as the header's own standing instruction asks.
  → `260810-1918_*_the-skip-licence-blacklist-misses-every-negation-that-does-not-use-the-word-not.md`

## Cross-cutting observations

**The strongest work in this range is the executed cascade, and the weakest is what surrounds it.**
`hooks/lib/domain-cascade.ts` is the right answer to the "two definitions of one decision" problem —
fail-loud on every unanticipated construct, no truthiness, the absent count modelled as the string
it is, short-circuit matching Python. It is defeated not by anything in its grammar but by the gate's
*reach*: it reads one file, and the decision is stated in two. The same reach question decides H1,
L2 and the already-filed decision `260810-1822_*_should-the-queue-ground-procedure-become-a-rule-file-when-one-of-its-three-consumers-cannot-be-emitted-to.md` about the queue-ground procedure. A gate that reads
`agents/*.md` and `skills/*/SKILL.md` — the file set `path-literal-lint.test.ts` already
enumerates — would cover all three.

**Two obligations were converted from mechanism to prose in one commit, in a project whose own
design rule is that prose obligations get skipped.** The lock release (H2) and the staging
instruction (M2) each moved from something the shell does to something the agent is asked to
remember, in the same edit. The drift-check design one file over says why that does not hold, and
`f38f37d` — the same session, three hours earlier — is the demonstration.

**Blast radius of an unnoticed prompt edit is now asymmetric.** The domain cascade has a runnable
gate; the commit sequence, the staging rule and the browser launcher do not. That is the right
priority order (the cascade decides whether tests run at all), but it means H2 and M2 will only ever
be caught by review.

## Recommended sequencing

**Before the next release tag:** H1 and H2. H1 makes two surfaces of one session disagree about
whether a project has code; H2 can wedge a parallel committer for a minute and does so most often on
the bugfix path, which is already the degraded one. M1 and M2 are one-line and one-paragraph
respectively and belong in the same commit as H2 — all three are Step 3b.

**Next cleanup pass:** M3 (`sleep 0.5`) — one `|| true`. L1, L2, L4, L5, L6.

**Needs a decision, not a fix:** L3. Both options change something the project chose deliberately,
and neither is obviously right.

---

**Filed by:** coderev, session `260810-1646-orchestrator-session.md`.

---

## Reconciliation annotation — reconciler, 260811-0108-reconciliation.md, at HEAD `e2a34f0`

Findings are not rewritten here. Two facts about this document, both measured:

**All eleven records this review filed are closed and their closures hold.** `H1`, `H2`, `M1`, `M2`,
`M3` (monitor `sleep 0.5`), `L1`–`L6` each carry `_c_` under `shared/issues/260810-1918_c_*`, and
each was re-verified against the working tree rather than against its own resolution note. `M3`
(`agents/orchestrator.md:429`) was folded into `H2` by this review and correctly filed no record of
its own.

**The Totals table undercounts by one and reuses a label.** Low is 6 (`L1`–`L6`), not 5, so the table
sums to 11 and the sentence "Ten findings, ten records filed" is short by one against the eleven
records on disk. `M3` names two different findings. Filed as
`260811-0109_*_the-turn-1-reviews-totals-say-ten-findings-and-it-carries-eleven.md`;
same class as queued task 37.

---

## Correction — 260811, against issue `260810-1918`'s successor `260811-0109`

The Totals table above now reads Low 6 and the sentence under it reads eleven, which is what the
annotation directly above this asked for. That annotation is left exactly as the reconciler wrote it:
it describes the document at `e2a34f0`, and rewriting it would remove the only record of what the
table said when the count was taken.

Counted again here, off the body rather than off the annotation: twelve labelled bullets under
`## Findings by theme` — `H1`, `H2`, `M1`, `M2`, `M3` twice, `L1`–`L6` — of which the `M3` at
`agents/orchestrator.md:429` is marked folded into `H2` and filed no record. That leaves eleven
findings with a record each, and `ls 260810-1918_?_*.md | wc -l` answers 11.

Two things this correction deliberately does not do. The duplicate `M3` label is left standing,
because the eleven filed records cite these labels and renaming one would break the citation to fix
a typo. And no `**Reviewed-range:**` / `**Not-opened:**` header is added: this file predates the
mandate `afd7c2e` introduced, `bin/fusion-review-coverage` is right to report it as unusable, and a
hand-written header here would make a range nobody re-opened look covered.
