# Code review — session `260810-1646` Turn 2, range `da8c9db..b3cc034`

**Sender:** coderev
**Scope:** the plugin's own source across all 5 commits of the range. Workbench records and history
files excluded per the dispatch, except where a record's own content is the claim under test.
**Suite state at review time:** `npm test` from `hooks/` — exit 0, 41 files, 1113 tests. Matches every
commit message in the range that asserts it.

---

## Summary

All five repairs do what their messages say, and the five verification claims that could be re-run
were re-run and held. Two things did not: `63deec1` and its own record say seven citations left the
reference lint's existence check when eight did, and the domain-cascade reach gate — the mechanism
the release-blocking fix rests on — does not see a paraphrase that writes its domain names as plain
words, which is a hole the corrected claim does not name. The drift lint's new licence patterns are
all negations, so the ordinary way English softens an instruction ("you may run the drift check")
still passes all 26.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 2 |
| Medium | 4 |
| Low | 5 |

Eleven findings, eleven records filed under `shared/issues/260810-2110_o_*`.

## Verified claims

Re-measured, not accepted:

- **`hooks/dist/` is self-contained.** No `require(…)` anywhere in `dist/`; every `from "…"` is a
  relative `./…` or a `node:` builtin. A fresh `npx tsc --outDir` into a scratch directory produces a
  tree `diff -r`-identical to the committed one, so no build output is stale.
- **The twelve in-flight records are intact.** All twelve present at `da8c9db` are present at
  `b3cc034`, none lost, none renamed away; each new content is an exact byte-prefix match of its old
  content, so every change was an append plus a marker rename. Eleven are `_c_`, one (`…citation-
  rooting-reached-two-of-three-skills…`) is `_p_`, which matches `b3cc034`'s stated deliberate
  remainder. The glob incident of `260810-2024` left no residue.
- **The lock form releases on every exit path it can reach.** `bin/fusion-commit-lock:323` really is
  `trap 'do_release …' EXIT INT TERM`, set inside the `with` branch; `"$@" || rc=$?` captures a
  failing command and the explicit release runs before `exit "$rc"`. A `SIGKILL` still leaks, and the
  60s stale detector is what covers that — the prompt's "every exit path" is the helper's own wording.
- **The monitor block cannot exit before `wait`.** Extracted verbatim and run under `set -euo
  pipefail` across six conditions: real `sleep`, a `sleep` shim rejecting any dotted operand, no
  `sleep` binary, no launcher on `PATH`, a launcher exiting 3, and stderr closed. All six reach the
  end with status 0. The two measurements the commit message singles out both reproduce: a missing
  `uname` yields the empty string and the `*)` arm takes it, and `echo >&2` with stderr closed is
  carried by its `|| true`.
- **The reach gate selects only the definition site.** Run live over every `agents/*.md` and
  `skills/*/SKILL.md`, `findCascadeStatements()` returns exactly `agents/orchestrator.md:168,170,172`
  and nothing else. `cascadeBlocks()` returns one file. The "three domain literals" alternative the
  message says it rejected does fire on six lines. Nothing in `rules/**`, `README*.md` or `CLAUDE.md`
  currently states the cascade; `docs/philosophy.md:19` does fire, exactly as the comment says it
  would.
- **`/fusion:cleanup`'s domain capture runs before the deletion.** The capture is Step 1 item 1
  (`:63-72`), the `agentstate.yaml` deletion is Step 1 item 4 (`:90`). Ordering correct — the
  sentence pointing at it is not (L1).
- **The drift lint's following-sentence hole is real**, as `45d76f0` states. Appending "This is
  optional for a Turn that produced no commit." to a bound `session_end` line is not detected. The
  demonstration was reproduced rather than taken on trust.

## Findings by theme

### A count in a repair of counts

- **H1 — `63deec1` and record `260810-2029` both say "seven citations"; there are eight.**
  `ROOT_VAR_RE` (`hooks/lib/__tests__/reference-resolution-lint.test.ts:212-213`) resolved 5 targets
  in `skills/setup/SKILL.md` and 3 in `skills/next/SKILL.md` at `da8c9db`, and 0 in each at
  `b3cc034`. Seven is not the prose-only count either; that is six. The finding the record makes —
  coverage shrank with the suite green throughout — is correct and important. Its only number is
  wrong.
  → `260810-2110_o_the-citation-rooting-commit-and-its-own-record-both-say-seven-citations-and-there-are-eight.md`

- **L2 — `45d76f0` says eleven licence patterns; twelve were added, and the docstring calls eleven
  items "the eight forms".** `SKIP_LICENCES` went 16 → 26: five left, fifteen arrived, three of those
  being widened re-spellings. "Eleven" is reachable only by counting the two contraction regexes as
  one, which the new control at `:676-707` explicitly does not do.
  → `260810-2110_o_the-skip-licence-commit-says-eleven-patterns-and-twelve-were-added-and-the-docstring-calls-eleven-items-eight-forms.md`

### The reach gate: what it measures and what it still cannot see

The corrected claim in `hooks/lib/domain-cascade.ts:33-45` is a real improvement — it replaces an
argument with a measurement and names three holes. It does not name all of them.

- **H2 — a domain name outside backticks or double quotes is invisible.** `domainLiteralsIn`
  (`:647-656`) matches only `` `code` `` or `"code"`. Measured against the shipped build: *"Detect the
  workbench domain: strategic if decisions dominate, knowledge if analyses exist with no code, data
  if data files dominate, else code."* **passes**. So do the bold and single-quoted spellings. The
  copy this gate was built for backticked its four by the author's habit, not by any convention —
  `agents/taskplanner.md:127` writes them bare. The same shape appears on the input side: a fully
  backticked paraphrase naming its evidence in unlisted words (*"open questions outnumber defects"*)
  also passes, which is a different case from the named "paraphrase naming no input".
  → `260810-2110_o_the-cascade-reach-gate-only-sees-a-domain-name-in-backticks-or-double-quotes-and-that-hole-is-not-named.md`

- **M1 — the detector is line-scoped and a hard-wrapped sentence splits.** The named hole is "a
  paraphrase spread across the ROWS of a table". A two-line wrap of one sentence is the same hole and
  is not named; measured, it passes. The header's argument for the line cut is about tables and does
  not carry to a wrap, and the fix for a wrap (a two-line sliding window) does not re-admit the
  tables.
  → `260810-2110_o_the-cascade-reach-gate-is-line-scoped-and-this-repositorys-own-prose-is-hard-wrapped.md`

- **L5 — the file set is justified as "the files an agent executes", and `rules/` is that too.**
  `rules/agent-setup.md` makes reading every emitted rule mandatory, so a rule file is a consumer.
  Measured: no rule file, README or `CLAUDE.md` states the cascade today, so this is a reasoning
  defect rather than a live second definition — but the stated reason reads as though the class were
  closed when it is not.
  → `260810-2110_o_the-cascade-gates-file-set-is-justified-as-the-files-an-agent-executes-which-is-also-true-of-rules.md`

### Silence where the same session chose to speak

- **M2 — `$FUSION_SRC` becomes the empty string with `FUSION_PLUGIN_ROOT` unset, and says nothing.**
  `skills/setup/SKILL.md:14-17` calls `bin/fusion-plugin-cwd` bare; the `else` branch assigns
  `$FUSION_PLUGIN_ROOT` whatever it holds. Of the five citation sites, the two `SEC=` blocks report
  `queue-check: UNAVAILABLE`; the churn-rank block (`:238`) and the domain-cascade block (`:239`)
  resolve to `/agents/orchestrator.md`, find nothing, and are silent. Those are Setup Step 5's two
  most consequential reads. It contradicts `rules/fusion-workbench-conventions.md` `## Path
  Resolution` → *Where the call belongs*, and departs from the `[ -x ]`-guard convention `26ea3c3`
  established three commits earlier in the same session.
  → `260810-2110_o_fusion-src-resolves-to-the-empty-string-with-no-report-when-fusion-plugin-root-is-unset.md`

- **M4 — the 26 skip licences contain no pattern for permission.** Thirty-six probes measured
  passing, including "you **may** run the drift check", "**consider** running", "**is recommended**",
  "**is advisory**", "**forgo**", "**waive**", "**can wait**". `only when` passes beside the
  `only if` the list has carried all along — the exact defect shape the motivating issue described
  for `unless`, reproduced inside the repair that closed it. The header's honesty about the list
  being a blacklist holds; the gap is that the whole vocabulary is negation-shaped.
  → `260810-2110_o_the-skip-licence-list-has-no-pattern-for-permission-and-misses-only-when-beside-the-only-if-it-carries.md`

### The commit path

- **M3 — `git add` now runs in a different directory than before, and Step 4 does not say which.**
  `bin/fusion-commit-lock:320` runs `cd "$root"` before the `--` command, so the staging list in
  `agents/orchestrator.md:424` resolves from the workbench root rather than from the agent's cwd. The
  layout rule explicitly allows a workbench root below the git toplevel; in such a project every
  staging list composed from `git diff --name-only` fails the pathspec, and the obvious repair an
  agent reaches for is a directory argument — which Step 4 has just spent a paragraph forbidding.
  → `260810-2110_o_moving-git-add-inside-the-lock-wrapper-changes-the-directory-it-runs-in-and-the-prompt-does-not-say-so.md`

- **L3 — the heredoc fix breaks the numbered list it sits in.** Moving `skills/commit/SKILL.md:84-96`
  to column 0 ends the procedure list, so step 6's two `fusion-commit-lock` commands render outside
  the step that introduces them and `7. Show result` starts a new list. The shell reasoning in the new
  paragraph is correct; the document structure is the cost.
  → `260810-2110_o_the-heredoc-example-was-de-indented-to-column-0-and-that-terminates-the-numbered-list-it-sits-in.md`

### One decision, four statements — again

- **L4 — the domain-capture one-liner is now in a fourth skill body, and the three existing copies are
  the stated justification.** `skills/cleanup/SKILL.md:65-71` joins `next`, `direct` and
  `seed-from-plane`. Cleanup's version adds `DOMAIN_SOURCE`, so the four are already not identical on
  the day the fourth landed.
  → `260810-2110_o_the-domain-capture-one-liner-is-now-copied-into-a-fourth-skill-body-and-the-copying-is-the-stated-justification.md`

### Wording

- **L1 — `skills/cleanup/SKILL.md:63` says "step 4 below removes `agentstate.yaml`"**, where the
  removal is Step 1's item 4 and the same sentence's "Step 3" means the top-level heading. The commit
  message gets it right ("its Step 1.4"); the shipped text does not.
  → `260810-2110_o_the-cleanup-domain-capture-cites-step-4-for-a-deletion-that-happens-in-step-1-item-4.md`

## Cross-references to records already open

Not refiled:

- The staging rule is stated for `git add` and not for `mv` or `git rm`, which is exactly what the
  glob incident turned on — `260810-2024`, whose own text makes the point.
- `rules/workbench-stash-and-lock.md:135` still names Step 3b as the worked example of the explicit
  lock form, which Step 3b no longer uses — `260810-2025`.
- The monitor's new browser-gap line has no executable gate — `260810-2027`.
- `ROOT_VAR_RE` does not know `$FUSION_SRC` — `260810-2029` (its count is H1 above).
- The source-root branch has no single home — `260810-2030`.
- The load-sensitive commit-lock timing case named itself this Turn — `260810-1135`, third
  observation appended, nothing widened. Correct handling.

## Cross-cutting observations

**Every finding in this range is about the boundary of a mechanism, not its interior.** The lock
wrapper works and releases; what is unstated is the directory it works in. The cascade interpreter is
right; what it cannot see is a paraphrase without backticks. The licence list rejects what it lists;
what it never considered is a whole grammatical mood. The reach gate reads two directories; the
reason given for those two does not survive contact with a third. This is a different failure class
from Turn 1, where the defects were inside the changes. It is the class you get when repairs are
scoped tightly and correctly — the fix lands, and the question of how far it reaches is answered by
prose rather than measured.

**The project keeps discovering "one decision, several statements" and keeps closing it one instance
at a time.** Four instances are now in play: the cascade (closed, with holes), the source root
(`260810-2030`, open), the domain one-liner (L4, new), and the marker-rename authority
(`260810-2024`, open). Each has been filed with the same diagnosis and each is being answered
separately. The common shape — a criterion with one implementation and several restatements, no
mechanism keeping them equal — is now well enough evidenced to be worth one design pass rather than
four fixes.

**Counts in this repository's commit messages are load-bearing and are the weakest link in them.**
Turn 1 found two false claims; the review that found them miscounted its own findings (ten claimed,
eleven filed); this range's repair miscounts twice (H1, L2). Every prose claim in these messages that
could be re-measured held. Only the numbers slipped. A count is the one part of a message that can be
checked mechanically, and nothing checks it.

## Recommended sequencing

**Before the next release tag:** H2. The reach gate is the whole mechanism behind this session's
release-blocking fix, and the plainest possible second copy — four unmarked domain names in a
sentence — walks past it. Either widen `domainLiteralsIn` and re-measure the false-positive cost, or
say in the header that it is not covered. M2 belongs in the same pass: two of Setup's five citation
sites go silent on an unset root, and the guard convention to fix it already exists three commits
back.

**Next cleanup pass:** M3 (one sentence in Step 4), M1, M4, L5. M4 should be weighed against the
baseline-pin proposal in `260810-2032` rather than answered with more patterns.

**Bookkeeping, cheap:** H1, L1, L2, L3.

**Needs a decision, not a fix:** L4, jointly with `260810-2030`. Two duplicated criteria in the same
four skill bodies is a thicker case for one `bin/` helper than either was alone.

---

**Filed by:** coderev, session `260810-1646`, Turn 2.
