# Closing review: `bin/fusion-work-order --format markdown|json` and the `/fusion:wp-order` pass-through

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `f74ec59b..d3311e73`
**Not-opened:** `hooks/dist/order.js`
**Review domain:** code
**Work-item:** 261001-1930-work-order-slash-command-and-machine-readable-output
**Reviewed against:** 261002-0733_*_plan-work-order-markdown-and-json-formats.md, 261001-1934_*_spec-work-order-slash-command-and-machine-readable-output.md (`### C1`, D2)

I did not read `hooks/dist/order.js` line by line. I listed its functions and checked it by gate and by execution instead. `committed-dist.test.ts` is green in `npm test` at `d3311e73` (60 files, 1 012 tests), and every behavioural check below ran the committed build. `hooks/dist/order.d.ts` carries the header comment only (`export {};`). The two workbench files in the range carry nothing in the code domain: the event-log rows and the work package's `**Active spec/plan:**` line.

## Summary

The four renderers really do read one projection. Text and TSV output are byte-identical to the `f74ec59b` build on every store I tried. The defects are in a contract sentence and in test reach, not in the code. One Medium: the JSON contract misstates the `verdict: "empty"` case. Three Low: Markdown escaping is under-pinned, heading anchors into `hooks/order.ts` are resolved by no lint, and the plan's supersession note is incomplete. Nothing blocks 12.2.0. The release act itself (tag, marketplace, coverage statement) is still outstanding.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 1 |
| Low | 3 |

## Verified, no finding

- **One projection.** `main` calls `project(computeWorkGraph(root))` once and hands the `OrderView` to `RENDERERS[format]`. `renderText`, `renderTsv`, `renderJson` and `renderMarkdown` read nothing else. The only constants are `format: 1` and the Markdown marker. This removes the double derivation of `ready=`/`roots=` that the prior closing review flagged as a cross-cutting risk.
- **D2, byte identity.** I extracted `hooks/dist` from `f74ec59b` and ran old and new `order.js` with no argument, with `--format text` and with `--format tsv` over three stores. The stores were this repository's workbench, a scratch store, and a store whose only record is unreadable. The scratch store held two cycles (one a self-edge), an absent field, an empty field, a `paused` and a `claimed` item, an unreadable record, a `done` target and a duplicate entry, plus entries with `\`, a tab, `|`, a backtick, `& * _ [ ] < > ~`. `cmp` was identical on all nine pairs.
- **JSON shape against the header.** Key order is `format, anchor, summary, note, items, cycles, unresolved, unreadable`. Item keys follow `COLUMNS` order by object-literal construction. `note` is `null` or a string, and `cycle` is the index into `cycles`. All of this matches `## The JSON format`, except the `verdict: "empty"` sentence (M1).
- **Markdown shape against the header.** Marker, summary list, `**Note:**` unescaped, the table with `---:` on order/depth/blocks/cycle, a header-only table on an empty store, and the label-plus-list blocks only when non-empty, all one blank line apart and ending in LF. Escaping order is backslash-escape first, then the numeric references, so the references' `&` stays bare. Output over the scratch store matched the contract. inference: GFM would render `\\\|` as `\|` inside a cell. I had no CommonMark parser available to confirm this.
- **Usage errors.** `--wat`, `--format`, `--format yaml`, `--format md`, `--format=json`, `--format=tsv` and a repeated `--format` all exit 1 with empty stdout (pinned in the test loop). No workbench exits 2.
- **Skill exit-1 split.** Step 2's cases are disjoint and complete. Exit 1 with an argument is the user's argument, so the skill quotes the usage line. Exit 1 with none is a fusion defect. Exits 2 and 3 are unchanged. On exit 0 the format branches (tsv/json, markdown, none/text) cover every argument set the helper accepts. Skill size is 5 277 bytes, under the 6 000 ceiling.
- **Test cut.** `fusion-work-order.test.ts` is 80 lines before and after. Hook-test total is 22 281 against `TEST_LINE_HEAD_ROOM` 3 053, unchanged, and no baseline moved. I compared the old file case by case, and every earlier assertion survives in a merged case. The text-equals-no-argument check moved onto the rich fixture, which makes it stronger.
- **BASELINE re-approvals.** I verified them from the diff, not by swapping files. Step 3 is +4 paths: `skills/wp-order/SKILL.md` has two new `` `hooks/order.ts` ``, the `README-hooks.md` roster row one, the `README-agents.md` skill row one. Step 4 is +1: the help paragraph adds `bin/fusion-work-order` and `$FUSION_SRC/hooks/order.ts` and drops `$FUSION_SRC/docs/upgrading-to-v12.md`. 1753 + 4 + 1 = 1758, and the gate is green at 1758. "Anchors unmoved" is correct only because class (b) is `.md`-only (L2).
- **Release surfaces in the tree.** `plugin.json` is 12.2.0. The `FUSION_REF=tags/v12.2.0` pins in `install.sh` and `README.md` are updated. `skills/help/SKILL.md` `### 4. Update` still has three paragraphs, relabelled. The `description` pair in `plugin.json` and `marketplace.json` is equal (compared programmatically) and names no format. `docs/upgrading-to-v12.md` correctly stays unchanged.

## Findings by theme

### The JSON contract

**M1, Medium: "On `verdict: "empty"` every count is 0 … and every array is empty" is false.** `verdict` counts nodes only (`hooks/lib/work-graph.ts` `computeWorkGraph`). An unreadable record is never a node. Over a store with one `**Status:** bogus` record, `--format json` prints `"unreadable-head": 1`, `"verdict": "empty"` and `"unreadable": ["260101-0001-g"]`. The code is right and the sentence is wrong. A consumer written from the contract would drop the unreadable signal under the same condition the prior M1 fixed in the skill. Issue: `261002-0926_*_the-json-contract-says-every-array-is-empty-on-verdict-empty-while-the-helper-prints-unreadable-records-there.md`.

### Test and gate reach

**L1, Low: Markdown escaping is pinned for `\`, `|`, the backtick and the tab only.** Removing `&`, `*`, `_`, `~`, `[`, `]`, `<` or `>` from `mdEsc` leaves the suite green. `&` is the escape the header calls load-bearing for losslessness. Issue: `261002-0926_*_the-markdown-tests-pin-three-of-the-eleven-escaped-characters-so-dropping-the-ampersand-escape-stays-green.md`.

**L2, Low: heading anchors into source-file headers are resolved by no lint.** `ANCHOR_RE` requires a `.md` file token. The range cites `hooks/order.ts` `## The JSON format` / `## The Markdown format` from `skills/wp-order/SKILL.md`, `skills/help/SKILL.md`, `README-hooks.md` and `README-agents.md`. Renaming either section would leave every citation dangling, and the suite would stay green. The same form already points at `hooks/session-start.ts` and `hooks/lib/__tests__/helpers/growth-bound.ts`, so the gap predates the range. Issue: `261002-0926_*_heading-anchors-into-source-file-headers-are-resolved-by-no-lint-and-the-format-contracts-are-cited-that-way-on-four-surfaces.md`.

### Record traceability

**L3, Low: the plan names only D1 as superseded.** For `tsv`, `json` and `markdown`, the skill also departs from four `### C1` criteria: chat language, the note repeated as a sentence, each row's meaning explained, and exit 1 always a fusion defect. The plan argues for each in its Approach and Risks, but neither record lists them as departures. The spec is still `_o_`. Issue: `261002-0926_*_the-plan-names-only-d1-as-superseded-while-the-pass-through-formats-also-relax-four-c1-criteria-of-the-spec.md`.

## Cross-cutting observations

- **The empty-store blind spot came back.** M1 has the same cause as the closed `261001-2157_*_wp-order-stops-on-verdict-empty-and-drops-the-unreadable-rows-the-helper-printed.md`: "empty" is read as "nothing at all", when it means "no node". Both times the fixture was a store with no records, which cannot show the difference. A future format or consumer will meet the same trap unless the empty-store fixture carries an unreadable record.
- **The hook-test bound counts lines, and the cut packed them.** `fusion-work-order.test.ts` went from 6 306 to 8 025 bytes (+27 %) at an unchanged 80 lines. It now has six lines over 200 characters (longest 284), up from two (longest 230). The plan's accounting is honest: it names the merges, and no assertion was lost. Still, a line bound that a denser line satisfies measures less than its name suggests. No record filed. If it matters, it is a question for the user about the bound's unit, not a defect of this range.
- **Nits, not filed.** The edited sentence in the `bin/fusion-work-order` header was not rewrapped (105 characters, "aliases such as `md` included."). In `README-hooks.md`, the `order.ts` row reads "each contract in `hooks/order.ts` …", which wants "each with its contract in".
- **The skill interpolates the user's words into a shell line** (`<the user's arguments>`). This is the user's own input in their own session, so I see no boundary crossed. I am noting it in case the skill is ever driven by something other than a person.

## Recommended sequencing

- **Before the tag (release act, not a defect):** `git tag -l 'v12*'` lists no `v12.2.0`. The marketplace working clone's `marketplace.json` still says `12.1.0`. The release commit does not state `bin/fusion-review-coverage --since v12.1.0`, which `README-agents.md` `## Releasing` step 0 asks for, in the commit or the session log. With this file in place, that run reports `uncovered=2`: `b56032fb` and `f74ec59b`, the range's exclusive lower end. Both touch the workbench only.
- **Patch release or next touch of `hooks/order.ts`:** M1 is a single sentence plus a dist rebuild. L1 is a line-neutral fixture widening. Both can go into one commit.
- **Whenever convenient:** L2 (lint scope), and L3, which belongs to whoever closes the work package.

---
**Reconciliation 261002-1155 (state-auditor, HEAD `23e97066`).** M1 resolved at `e0032f06` (`hooks/order.ts` `## The JSON format`; 261002-0926_*_the-json-contract-says-every-array-is-empty-on-verdict-empty-while-the-helper-prints-unreadable-records-there.md closed). L1, L2 and L3 are unchanged at HEAD and their three records stay open. The release act named under `## Recommended sequencing` is done: `git tag -l 'v12*'` lists `v12.2.0`.
