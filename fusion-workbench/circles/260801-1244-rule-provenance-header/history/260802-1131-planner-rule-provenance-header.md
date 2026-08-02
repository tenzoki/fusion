# Planner — implementation plan for the provenance-header Circle

**Date:** 2026-08-02 11:31
**Agent:** planner (dispatched, domain `code`, executors `coder` + `ontocoder`)
**Circle:** `circles/260801-1244-rule-provenance-header`
**Output:** `circles/260801-1244-rule-provenance-header/planning/260802-1131_o_plan-rule-provenance-header.md`

## What was planned

Four steps, all assigned to `coder`, implementing C8 against the user-approved spec at `circles/260801-1244-rule-provenance-header/planning/260802-1103_o_spec-rule-provenance-header.md`. The order is backfill, then conventions section, then lint gate, then an acceptance sweep, chosen so `npm test` is green at every commit boundary.

## The five items the spec left open, and how each was settled

1. **Where the gate lives.** A new file, `hooks/lib/__tests__/provenance-header-lint.test.ts`. The suite already holds three corpus-lint gates, one per concern, all named `<concern>-lint.test.ts`. None of them reads `rules/`, so this is a fourth corpus rather than an addition to an existing gate. Read `path-literal-lint.test.ts` and `marker-format-lint.test.ts` in full before choosing.
2. **How the ten lines are read and how fixtures are built.** A `headerLine(text): number | null` function splitting on newline and testing the spec's regex against the first ten lines, returning the 1-based line number so a test can assert the window boundary exactly. Fixtures are in-memory strings, matching both sibling gates; the only on-disk fixtures in the suite belong to `bin/fusion-plane`, which needs a real tree to walk.
3. **Backfill by hand or by script.** By hand, ten `Edit` calls. Ten different citation strings make a script a lookup table plus an insertion, which saves nothing, and `Edit`'s exact-match semantics fail loudly where a `sed -i` loop can write silently. Shell mutation is permitted here, so this is a reviewability choice, not a permission one.
4. **The conventions-section prose.** Written out verbatim in the plan, ready to paste: the keyword, the three citation forms with the reason each is chosen by history rather than preference, canonical line-3 placement plus why the window is ten, the exact admission wording, the gate's reach and its two stated limits, the file-scoped/section-scoped distinction, the curator's forward obligation, and the closing `Binding decision:` line citing D3.
5. **Order.** Backfill first. Landing the gate first would put ten failing tests in one commit, and the only thing that red run proves is already required to be permanent and fixture-based by criterion 5. The conventions section goes second so the gate's failure message cites an existing section and so the gate can test that the conventions file passes on its own line-3 header rather than on the `Provenance:` string in its documentation of the rule.

## One planner choice worth flagging

Header placement is line 3 in all ten files, including the two whose lede is a blockquote. The spec computes where an after-the-blockquote header would land (line 10 and line 9) when justifying the constant ten; both placements satisfy criterion 2, and the spec explicitly sanctions the above-the-blockquote form. Uniform placement removes per-file reasoning from the backfill and leaves seven lines of margin instead of zero.

## Two spec claims verified rather than taken on trust

- **The backfill table.** All ten citations re-derived at HEAD `e8988d9` with `git log --diff-filter=A`, not a sample: six admission hashes (`dac82b8`, `b05b423`, `bd5f6e6`, `b05b423`, `4950ffa`, `c18a946`) all match, and the four Circle citations are consistent with the files' introducing dates. Both cited Circle directories exist. No correction needed, none made.
- **`bin/fusion-rules` is inert to file content.** Rule files reach its output only through `emit_if_exists` (line 156, a `[ -f ]` test) and `emit_pattern_in_dir` (line 160, a filename glob). Its content reads are `CLAUDE.md` line 185, `.active-circle` line 241, the Circle record line 250, and `./rules/context-manifest.yaml` line 313. Criterion 7 holds by construction; Step 1 verifies it empirically by diffing emitted output across the backfill.

## Open, not blocking

Two items left for the user at the plan gate: whether this Circle bumps `.claude-plugin/plugin.json`, and whether `CLAUDE.md` gains a line about the new gate. Neither is in the acceptance criteria; the recommendation on both is to handle them through the normal session-close flow. No decision record filed, because neither binds the implementation.

## Not done

No implementation, no agent dispatched, no code or rule file touched. Read-only outside `planning/` and `history/`.
