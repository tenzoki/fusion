# Closing review of the bracket-citation package and the dispatch-path re-arming: `49ab50e4..e41e333f`, 24 commits

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `49ab50e4..e41e333f`
**Not-opened:** none
**Domain:** code and data, one pass (the swept workbench records are the data half)
**Work item:** 260922-1420-bracket-citations-read-and-swept-once.md
**Plans reviewed against:** 260922-1628_*_the-grammar-reads-the-bracket-marker-and-the-tree-is-swept-once.md, 260922-1447_*_the-six-rulings-of-260922-and-the-nine-findings-of-the-closing-review.md
**Cross-references:** 260922-0922_*_are-the-dispatch-path-rows-re-armed-at-the-post-cut-totals-and-under-which-event.md, 260921-1718_*_does-the-grammar-read-a-storeless-bracket-marked-citation-or-state-the-asymmetry-as-a-decision.md, 260921-2002_*_does-reading-the-bracket-marker-form-sweep-the-frozen-stores-or-does-the-sweep-first-learn-to-skip-them.md, 260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md

The twelve `hooks/dist/` files the previous pass carried as `**Not-opened:**` were opened this time and are in the range's own scope for four of them. They are listed under `## The carried dist files` below, so `**Not-opened:**` reads `none` rather than carrying them a second time.

## Summary

Both packages do what their plans claim. The grammar reads the bracket marker through one exported rule that the sweep imports rather than copies, the sentence-stop change is the narrowest one that works, 28 exhibits were marked before a byte moved, and all four gates are green over the swept tree. The eleven dispatch-path rows are the measurement, component by component, and I re-took it. Three findings: one shipped step that cannot run in a consuming project, one instrument whose failure message now contradicts the event that moved its own baseline, and a cross-cutting Markdown regression the exhibit fencing left in nine records. Nothing blocks a tag of 11.11.0 on correctness; the first finding is the package's own user-facing deliverable and should land before the tag.

## Verification — every command run here, not quoted from a commit

- `cd hooks && npm test`: exit 0, **58 files, 987 tests**, 32.97 s. Matches `23576fe6`'s claim exactly.
- `node hooks/dist/citation-check.js`: `files=3097 edited-files=226 dangling=297 store-prefixed=405 edited-violations=0 unedited-violations=702 unrewritable-violations=405 undecidable=3785 verdict=clean`.
- `bin/fusion-citation-sweep --dry-run`: `files=0 rewrites=0 residual=3544 record=0 circle-record=0 circle-dir=0 bare-record=0 stamp-bare=0`.
- `bin/fusion-citation-sweep --repair --dry-run`: `files=0 repairs=0 date-field=0 chained-tail=0 doubled=0 spliced-prefix=0`.
- `bin/fusion-review-coverage`: this range's two commits `49ab50e4` and `0cacf3c0` read `uncovered` before this file lands; the twelve carried files are named and are cleared here.
- The eleven dispatch paths, re-measured by the bound's own summation (`statSync` on the prompt, the sum over every path `bin/fusion-rules <name>` emits, `statSync` on `CLAUDE.md`) — table under `## The re-arming`.

## The single large commit, and the red-on-purpose split

`78328863` is red on three gates and `23576fe6` clears them. **The split is sound and the executor's stated reason is the real one**, verified against the guard rather than taken on the commit message: `hooks/citation-sweep.ts` guard (a) refuses a write while an uncommitted change names a file the run's corpus holds, and `hooks/lib/citation-scan.ts` is in that corpus through `fusion.json`'s `citations.extraPaths` (`declared-patterns=4 declared-files=61` in the check output above). The plan's one-commit shape (`260922-1628_*_…` `### Why one commit and not two adjacent ones`) reasoned about which pair (grammar, tree) keeps every gate green and did not reason about the guard, so the shape it chose was not reachable. The executor named the gap in the commit message rather than working around the guard, which is the right order.

The cost is one commit in the history at which `npm test` is red. That is visible, bounded to one commit, and the alternative — relaxing guard (a) — would have spent a real control to buy a tidier history. I would take the same split.

## Findings

### F1 — `/fusion:migrate` Step 6 calls a helper by a path a consuming project does not have. Severity: High

`skills/migrate/SKILL.md:201`:

> Run `bin/fusion-citation-sweep --dry-run`, report its summary … On a yes run `bin/fusion-citation-sweep --write --yes`

The path is relative and unprefixed. In a consuming project — the only place `/fusion:migrate` runs for real — `./bin/fusion-citation-sweep` does not exist; the helper lives at `$FUSION_PLUGIN_ROOT/bin/`. In **this** repository the path happens to resolve, which is why no gate caught it.

Two conventions are missed, both already settled and both followed by the same file eleven lines of prose earlier:

- `skills/migrate/SKILL.md:31` writes `ROOT="$("$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root")"`. Every other helper call in every other skill body takes the same form — `skills/commit`, `skills/post`, `skills/reconcile`, `skills/setup`, `skills/archive`, `skills/cleanup`, `skills/news`. Step 6 is the only bare-relative **invocation** in `skills/`; the other bare `bin/…` strings in skill bodies are prose references to a helper's header, not calls.
- Decision `260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md` is `_i_`, and `README-hooks.md:333` states the consequence: "Every call site guards with `[ -x ]`". Step 6 has no guard, so an install one release behind `fusion --update` gets a shell error at the end of its migration instead of the `helper-missing` sentence `/fusion:news` models at `skills/news/SKILL.md:39`.

This is the package's user-visible deliverable. It is not destructive — the migration itself has completed by the time Step 6 runs — but as written the step cannot do its job for any consumer. Filed as `260922-1717_*_migrate-step-6-calls-the-citation-sweep-by-a-path-a-consuming-project-does-not-have.md`.

### F2 — the dispatch-path bound's failure message says no fourth event exists, and a test pins the sentence. Severity: Medium

`c34c7896` added a fourth re-baselining event, scoped to the dispatch-path bound, authored it in `hooks/lib/__tests__/fixtures/dispatch-path.baseline` (header, `## The re-arming, 2026-09-22`), logged the eleven rows in `README-hooks.md` `#### The dispatch-path re-arming of 2026-09-22`, and updated the doc comment on `DISPATCH_HEAD_ROOM` (`hooks/lib/__tests__/rules-emission-golden.test.ts:957-965`) to name the event's one condition. All of that is right and the user ruled it.

What was not updated is the message a developer actually reads at the moment this bound fails — `hooks/lib/__tests__/rules-emission-golden.test.ts:1048-1055`:

```
"The baseline moves only at the three events in helpers/growth-bound.ts " +
  "`## Re-baselining: the three events at which a baseline moves`, and NO " +
  "RE-BASELINING EVENT COVERS A GROWING CLAUDE.md. That rule was written for a " +
  "surface fusion owns; two of this quantity's three components belong to the " +
  "project, and no fourth event was added for them. Inside this repository a " +
  "larger CLAUDE.md is offset against another component of the same paths or it " +
  "is not landed. Editing the fixture to make this assertion pass is none of the " +
  "three events.",
```

Three sentences in it are now false of this bound: "moves only at the three events", "no fourth event was added", and "Editing the fixture to make this assertion pass is none of the three events" — `c34c7896` edited exactly this fixture, under exactly such an event. And `rules-emission-golden.test.ts:1214` asserts `expect(msg).toContain("## Re-baselining: the three events at which a baseline moves")`, so the stale sentence is pinned by a passing test.

The three other "three events" citations in the same file (`:205`, `:209`, `:373`, `:576`) are about `RULE_BASELINE` and `DRIFT_CEILING`, which are rate surfaces the event explicitly does not reach. They are still correct and must not be swept with this one. The scope of the fix is exactly `dispatchBoundMessage()` and the assertion that pins it.

This is the same class the commit message was careful about everywhere else: it checked that `helpers/growth-bound.ts` `## Re-baselining` stands unedited and that its two pinning assertions still pass, and it did not check the message this bound prints about itself. Filed as `260922-1718_*_the-dispatch-path-bounds-failure-message-still-says-no-fourth-event-exists-and-an-assertion-pins-it.md`.

### F3 — the exhibit fencing split nine Markdown lists across a blockquote boundary. Severity: Low, cross-cutting

`78328863` marked 28 exhibits so they would carry a `reason` before the sweep ran. The mechanism is right and it worked — `blockquoted = /^\s*>/.test(text)` at `hooks/lib/citation-scan.ts:1219` accepts the indented continuation lines, so every marked token is exempt and the gates are green. What it also did, in nine records, is prefix `> ` to **one item in the middle of a list**, which ends the list at that item and starts a new one after it.

The clearest instance, `260717-1945-reconciliation.md:33-40` — a six-item list, five fenced and the sixth left outside:

~~~
```
- `260716-1910[p]→[c]-plan-workbench-umbau-circle-container.md` (Status, Schritte 9/10, Reconciliation Log)
…
- `260717-0033[a]→[i]-derive-fusion-paths-key-sets-from-prompts-instead-of-declaring-them.md`
```
- `260717-1832-orchestrator-session.md` (`## Coherence` angehängt)
~~~

The other eight, each a `> ` on one item of a list that continues on both sides:

- `260717-1959_*_plan-marker-format-underscore.md:33` (2-item list), `:119` and `:149` (a `- Changes:` bullet lifted out from between `- Files:` and `- Dependencies:`)
- `260812-2136_*_the-citation-grammar-reads-one-ellipsis-and-one-marker-syntax-and-the-workbench-uses-two-of-each.md:24-31` (one blockquote split into two by the blank line between paragraph and list)
- `260812-1720_*_circle-first-placement-and-the-backlog-store.md:684` (ordered item 3 of 3 pulled out below items 1 and 2)
- `260805-1839_*_kommentar-drift-in-den-beiden-bin-helfern-klammer-marker-und-veraltete-zaehlungen.md:6` (ordered item 2 of 3)
- `260806-0022-coder-track1-vier-code-fixes.md:32` (bullet 4 of 5)
- `260805-2353_*_plan-textschicht-gegen-code.md:151` (a `- Verification:` bullet between `- Dependencies:` and `- Falsifier:`)
- `260812-1720_*_the-reference-resolution-lint-does-not-scan-the-workbench-where-citations-are-densest.md:34` (bullet 3 of 6)
- `260806-1154-coderev-implementation-vs-intention-textschicht-delta.md:23` (bullet 3 of 4)

No sentence was reworded and nothing was deleted, which is what `78328863`'s message claims and what holds. What the message does not say is that the *structure* moved: a list that read as one now reads as two with a quotation between them. Where the exhibit sits in a standalone paragraph (`_c_circle.md:16`, `260717-1959_*_…:9`, `260801-2038_*_…:5`, `260805-1841_*_…:3`, `260830-1842_*_…:12`) the blockquote is clean and I have no objection to it. The cheaper instrument on a list item is the one already used once in the same commit at `260812-1720_*_circle-first-placement…:14` — an `e.g.` on the line, which changes no block structure at all.

One secondary note under the same heading: `blockquote` is documented at `hooks/lib/citation-scan.ts:980` as "another author's text". Five of the fenced sites are the record's own prose, including the `## Question` body of a deferred decision (`260830-1842_*_may-the-grammar-resolve-a-bracket-marked-record-that-a-frozen-store-keeps-permanently.md:12`), which now reads as a quotation of someone else. The plan sanctioned the instrument (step 5) so this is not a deviation, but the reason's own definition and its new use have drifted apart.

Filed as `260922-1719_*_the-exhibit-fencing-blockquoted-single-list-items-and-split-nine-lists.md`.

## The re-arming — re-measured, not read

The eleven rows in `README-hooks.md` `#### The dispatch-path re-arming of 2026-09-22` and in `hooks/lib/__tests__/fixtures/dispatch-path.baseline` **are the measurement**. I re-took it at `e41e333f` by the bound's own summation:

| path | README `after` | measured at `e41e333f` | delta |
|---|---|---|---|
| analyst | 198 789 → 123 995 | 123 992 | −3 |
| coder | 188 256 → 106 836 | 106 833 | −3 |
| consultant | 197 679 → 122 046 | 122 043 | −3 |
| curator | 227 066 → 187 121 | 187 118 | −3 |
| editor | 202 739 → 127 524 | 127 521 | −3 |
| ontocoder | 191 869 → 110 546 | 110 543 | −3 |
| orchestrator | 380 065 → 222 589 | 222 586 | −3 |
| planner | 202 428 → 127 593 | 127 590 | −3 |
| reconciler | 206 384 → 120 813 | 120 810 | −3 |
| reviewer | 189 012 → 114 309 | 114 306 | −3 |
| shaper | 250 768 → 135 872 | 135 869 | −3 |

Every prompt component and the `CLAUDE.md` component (8 021) match the log exactly. Every row is uniformly 3 bytes under, which is `af8d7fe0`'s stated net −3 in `rules/fusion-workbench-conventions.md` landing on all eleven paths through a shared component. That is the instrument behaving as its header describes, and it is evidence the rows were summed rather than guessed: a guess does not land eleven paths on one offset.

`DISPATCH_HEAD_ROOM` is still `0` (`hooks/lib/__tests__/rules-emission-golden.test.ts:966`). `hooks/lib/__tests__/helpers/growth-bound.ts` is untouched by the whole range (`git diff --name-only 49ab50e4..e41e333f -- hooks/lib/__tests__/helpers/` is empty), so `AGENT_HEAD_ROOM`, `SKILL_HEAD_ROOM`, `TEST_LINE_HEAD_ROOM` and `TEST_LINE_BASELINE` in `surface-growth-bound.test.ts` are untouched too — that file is not in the range at all. The only thing missing is F2.

## The swept tree — was anything garbled?

**46 distinct tokens were rewritten, 111 occurrences in 45 files.** I resolved every one against the workbench index rather than reading the diff for plausibility. Every token carrying a slug resolves to exactly one record. The 46 include no token whose meaning changed: the marker letter played no part in any lookup, because `findRecord('<stamp>[a]')` returns 0 in every case and the wildcard retry is what resolved them before the rewrite as well as after.

**Nothing marked as an exhibit moved.** `rewriteOf()` declines every hit carrying a `reason`, and the verifying run above confirms it: `rewrites=0` with the 28 sites still spelling the bracket. The transition-notation run the plan singled out as the case a respelling would garble — `260717-1945-reconciliation.md:33-37`, the `[p]→[c]` arrows — survives verbatim inside its fence.

**Two observations, neither filed as a defect.**

1. Eight of the 111 rewrites are **slugless**: `<stamp>[x]` with no topic, which becomes `<stamp>_*_` and then matches 2 to 5 records. Example: the archived container record of `260717-1638-marker-format-ohne-glob-metazeichen`, line 34, where the bracket-marked token on stamp `260716-1910` became `260716-1910_*_` and now names two records at once, the workbench-umbau plan and the circle-marker decision. The tool never read the letter, so nothing the tool does changed — but a human reading the marker letter could tell the decision from the plan and a human reading `_*_` cannot, and the status moved from a reported `stale-marker` to a silent `ambiguous`, which `citation-scan.ts:1727` counts as undecidable and no verdict reads. **This is not a regression of this package**: 111 slugless `_*_` tokens in the tree resolve to ≠1 record, and 103 of them predate this sweep. It is the sweep's standing behaviour, met by a wider population. The question of whether a rewrite should decline when its result resolves to more than one record is filed as a decision, `260922-1720_*_should-the-sweep-decline-a-rewrite-whose-result-resolves-to-more-than-one-record.md`, not as a defect.
2. One rewrite landed inside a **verbatim quotation of another record's line** — `260812-1720_*_does-the-circle-first-migration-reverse-a-recorded-promotion-out-of-a-circle.md:25`, which opens ``(`_c_circle.md:49`): *"Der zsh-Glob-Fix-Plan …*`` and whose quoted bracket-marked token on stamp `260717-1918` is now `260717-1918_*_`. A quotation of another author's text is the documented use of the `blockquote` reason, so this is the one site the classification pass arguably should have marked. It costs nothing here: the quoted source was swept in the same commit and now reads `260717-1918_*_skill-glob-nomatch-zsh-hardening.md` at `…/_c_circle.md:92`, so quote and source agree; the `:49` locator was already stale before this range.

## The grammar — read against the five specimens and probed

`hooks/lib/citation-scan.ts:588-592`, `:341`, `:372-380`, `:849-851` and `hooks/citation-sweep.ts:574-606`. Four things I checked rather than accepted:

- **The stop widening is strictly narrowing, so "no token is lost" is structurally true, not just measured.** `recordTail()` (`citation-scan.ts:465-467`) derives `stop` as a *negative* lookbehind `(?<![<chars>-]\.)`. `REC_TAIL`'s class is `BARE_TAIL`'s plus `\[\]`, so the wider class **forbids more** end positions and can only shorten a token by the trailing `.` it was eating. Since `BARE_TAIL.cls` is `*`-quantified, a token shortened by one character still matches. The only characters that differ are `[` and `]`, which a `BARE_RE` tail cannot contain — so nothing but a bracket-marker token is affected at all. This is the narrowest change that fixes the class, and the comment at `:578-587` says exactly this.
- **`markerAtHead()` is behaviour-preserving on the underscore arm.** Its `^_([a-z])(_|$)` is the same expression the two call sites carried before: `storelessBase()`'s old `rest.replace(/^_[a-z](?:_|$)/, "_*_")` and `candidateFor()`'s old `/^_[a-z]_/`. The `complete` flag is what separates them, and it separates them exactly where they differed before — `<stamp>_d` is wildcarded for a lookup and declined for a rewrite.
- **The bracket arm's optional hyphen is right.** `\[([a-z])\]-?` absorbs the delimiter, which matches `/fusion:migrate`'s own `s/\[([oatcibspd])\]-/_\1_/g` (`skills/migrate/SKILL.md:184`), so a citation and the file it names arrive at the same spelling. Without it the sweep would have written `_*_-<topic>` and every one of the 111 pointers would have resolved to nothing. `citation-sweep.test.ts:191-215` pins it.
- **The alphabet asymmetry is symmetric and therefore not a defect.** `MARKER_SLOT` and `BRACKET_SLOT` both admit `[a-zA-Z*]` while `markerAtHead()` reads `[a-z]`, so a bracket carrying an UPPERCASE letter tokenises and reports `dangling` rather than `stale-marker`. I probed it: the underscore spelling of the same uppercase letter behaves identically, so the bracket arm mirrors the underscore arm exactly rather than introducing a new gap. No instance exists in this tree.

The four new grammar cases at `citation-grammar-boundaries.test.ts:59-62` pin all five plan specimens including the `[foo]` non-match, and the falsified comment at `:82-86` was corrected rather than left.

## The carried dist files

All twelve were opened, plus the four this range changed. They are `tsc` output with comments preserved and no hand edits, and the proof is mechanical rather than visual: `hooks/lib/__tests__/committed-dist.test.ts` extracts the committed source at `HEAD` with `git archive`, compiles it with the pinned toolchain into a temp tree, and walks both trees comparing every file (`:64-67`, `:280-281`). It is one of the 987 green tests. I additionally confirmed by hand that `dist/lib/citation-scan.js:341,372,552,850`, `dist/lib/citation-scan.d.ts:29,60` and `dist/citation-sweep.js:380,574-606` carry `BRACKET_SLOT`, `markerAtHead` and the two rewritten `candidateFor()` branches in the shape their sources define.

## Cross-cutting observations

- **Two of the three findings are the same shape: a change landed and the text describing it did not follow.** F2 is a failure message describing a rule its own commit changed; F1 is a new step not following a convention its own file follows eleven lines earlier. The previous closing review found the same shape (`57e2b7eb` changed a gate and four describing surfaces stayed behind). That is three passes in a row. The pressure point is consistent: what the executor verifies is the gate, and a gate does not read prose.
- **The bounded surfaces worked exactly as designed, twice.** Step 1 found its 150 bytes by cutting three restatements the header table already authors, and step 7 found its bytes by compressing the longest line in `skills/migrate/SKILL.md` (39 701 → 39 688). Both funded themselves in the same file rather than spending head-room. The eleven rows at slack 0 are now doing the job the re-arming was for.
- **Every figure in both commit messages that I re-took was correct**, including the ones nothing gates: 111 rewrites in 45 files, 28 exhibits in 17 files, 987 tests, `verdict=clean`, the eleven before-and-after rows. That is worth stating plainly because it is what let this pass spend its budget on the three things that are wrong instead of re-checking the things that are right.

## Recommended sequencing

- **Before the 11.11.0 tag:** F1. It is the package's shipped deliverable and it cannot run for a consumer. One-line fix.
- **Before the tag if it is cheap, otherwise next:** F2. It is a correctness statement inside the instrument that governs every future always-on addition, and it is pinned by a test, so it will not decay quietly — but it reddens nothing today.
- **Cleanup, at the user's discretion:** F3. Workbench content, no information lost, nine records.
- **Not blocking, needs a ruling rather than a fix:** the slugless-wildcard ambiguity decision.

## Release verdict for 11.11.0

**Nothing blocks the tag on correctness.** `.claude-plugin/plugin.json` reads `11.11.0`, the working tree is clean but for the event log, all four package gates are green, `dist/` is the compilation of its source, and the two `_a_` decisions this package realises stand at `_i_` with an `Implemented:` line. F1 should land first because the tag is what puts that step in front of consumers.
