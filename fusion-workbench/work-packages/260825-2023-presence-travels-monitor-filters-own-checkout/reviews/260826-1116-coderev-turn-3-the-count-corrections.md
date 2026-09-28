# Code review — Turn 3, the commit that made the counts right

**Reviewed-range:** `8fb42ce..6deeb33`
**Not-opened:** none
**Reviewer:** coderev, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Date:** 2026-08-26 11:16

## Summary

One commit, sixteen files, all sixteen opened. Its three central counting claims are correct and were
re-measured here rather than taken from the message: three `session_start` emit templates and no
fourth, five Turn-count definition sites and no sixth, five SessionStart prose sites and no sixth.
The README wiring snippet is now structurally identical to `hooks/hooks.json`, verified by parsing
both and comparing the objects. The citation pin's two recorded findings are both correct. The four
findings below are all in `skills/setup/SKILL.md:352` and `agents/orchestrator.md:1279` and
`agents/reconciler.md:21` — none of them changes what any program does, and two of them are the
commit's own subject reappearing one file over.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 2 |
| Low | 2 |

## The three counting questions, answered independently

**Emit templates: three, and all three carry `<ID>`.** `grep -rn 'orchestrator-events\.jsonl'` and
`grep -rn 'echo .*"event"'` over `agents/`, `skills/`, `rules/`, `bin/`, `docs/`, `templates/`, the
three READMEs, `CLAUDE.md` and the uncompiled hook sources return exactly three lines that append a
JSON object to the log: `agents/orchestrator.md:235`, `agents/orchestrator.md:1322` and
`skills/setup/SKILL.md:483`. All three carry `<ID>`. `agents/orchestrator.md:1266` is the
`**Event schema:**` specimen and shows resolved values, correctly literal; `:953` and `:232` are prose.
No fourth template exists. The commit's claim holds.

**Turn-count definition sites: five, one derivation, no sixth.** The five are
`agents/orchestrator.md:100-103` (Setup Step 1's guarded call), `:558` (Phase 2 step 3, where the
definition is stated), `:1122` (the `progress.turn` derivation row), `skills/setup/SKILL.md:387-390`
and, newly converted, `agents/reconciler.md:21`. `grep -rn turn_start` over the same nine trees
returns no sixth prose derivation: the remaining hits are `bin/monitor`'s CSS and session-boundary
logic, `bin/fusion-events`'s header, and the two `events-query` modules, none of which defines the
figure for a prompt. The commit's claim holds.

One thing the criterion does not reach, reported as an observation rather than a finding.
`agents/orchestrator.md:1052` keeps `turns_completed` as an **in-memory counter**, and
`agents/orchestrator.md:1212` renders it as the dashboard's `**Elapsed Turns:**` field beside a
`**Turn:**` field that comes from the helper. It counts a different quantity (completed, not current)
and derives nothing from the log, so it is not a sixth definition site by the record's own test. It is
the last Turn figure in the prompt corpus that is neither the helper's nor derived from a record that
cannot freeze, and it predates this range by weeks. Named here so the next reader does not have to
re-derive that it was considered.

**Acceptance criteria: criterion 5 was still wrong at `6deeb33`, and is being corrected in flight.**
At the reviewed commit the plan reads "all **four** sites that print or define it", against the five
the same commit established. The uncommitted working copy — a sibling coder is editing it now — reads
"all **five** sites" with the miscount stated in the clause, and corrects criterion 6 from three
referred records to six the same way. Both corrections are outside this range and are not findings
against it. `## Data Structures`' "Two fields are added to the object" was checked and is **not** a
third stale count: the sentence is scoped "after step 3", and `session_id` arrived at step 11.

## Findings

### M-1 — the setup skill points at the orchestrator prompt with an unrooted path its own preamble forbids

`skills/setup/SKILL.md:352`, written by this commit:

> Hold the pair as `<ID>`, the fragment defined at `agents/orchestrator.md` Setup step 2.

`skills/setup/SKILL.md:12`, the body's own rule: "**A path into a file the plugin ships carries the
`$FUSION_SRC` root.** … a bare `agents/…` or `skills/…` path resolves to nothing there." The three
other pointers into that same prompt obey it (`:418`, `:424`, `:455`, all `$FUSION_SRC/agents/…`). A
second, older instance stands at `:480`.

It matters because `:483` no longer carries the two identity fields literally, so the pointer is the
only route to what `<ID>` expands to, and in a consuming project it leads nowhere. No gate sees it:
`scanPluginPaths` resolves the bare token against `pluginRoot`, where the file exists.

**Severity:** Medium. **Scope:** `skills/setup/SKILL.md`, two sites.
**Filed:** `260826-1112_*_the-setup-skill-points-at-the-orchestrator-prompt-with-an-unrooted-path-the-body-forbids.md`

### M-2 — the setup skill calls `<ID>` "the pair", in the commit that removed that word elsewhere

Same sentence. `<ID>` has named three keys since `72a9561`. R-14, in this commit, replaced "the pair"
at `agents/orchestrator.md:1322` for exactly this reason — its own closure note says "so the sentence
stops carrying a count that a fourth field would falsify again" — while R-10 wrote the word into
`skills/setup/SKILL.md:352`.

The second half is the consequential one: `grep -n session_id skills/*/SKILL.md` returns nothing. No
step of the setup skill reads the SessionStart `fusion: session_id=<uuid>` line, so the procedure
`CLAUDE.md` calls the only reliable enforcement of Setup produces a two-key `<ID>` on its own terms.
An orchestrator holds its own prompt too and would recover the third key from Setup step 2 — which is
why this is Medium and not High — but that recovery runs through the pointer M-1 says is unreachable.

The log was checked and proves nothing either way: no line carries `session_id`, and the current
session started at 04:47 while `72a9561` landed at 08:50, so the installed hook could not have printed
one. The finding rests on the text.

**Severity:** Medium. **Scope:** `skills/setup/SKILL.md`.
**Filed:** `260826-1113_*_the-setup-skill-calls-the-id-fragment-the-pair-in-the-commit-that-removed-that-word-elsewhere.md`

### L-1 — the event-log contract says "a half" in the sentence that now governs three fields

`agents/orchestrator.md:1279`. R-14 corrected the sentences either side; the one between them still
reads "**A half that did not resolve makes its field absent rather than empty**". "Half" is
`bin/fusion-identity`'s word for its two outputs and is now the only count in a paragraph that just
enumerated three fields. Nothing behaves wrongly — `:140` states the same rule for `session_id` as
"**No line, no key**".

**Severity:** Low. **Scope:** `agents/orchestrator.md`.
**Filed:** `260826-1114_*_the-event-log-contract-says-a-half-in-the-sentence-that-now-governs-three-fields.md`

### L-2 — the converted reconciler site drops the "`turns=0` is a real figure" clause

`agents/reconciler.md:21` states the degradation rule as "Report it as `unavailable` whenever the
helper is absent or prints no `scope=checkout` line, never as `0`". Four of the five converted sites
close the same rule with "`turns=0` is a real figure: the log was read and the session stopped before
its first Turn" (`agents/orchestrator.md:107`, `skills/setup/SKILL.md:394`, verbatim). Read against
`hooks/lib/events-query.ts:418-436`, a session with a `session_start` and no `turn_start` yields
`turns=0`, `scope=checkout`, exit 0 — a measured figure the reconciler's wording can be read into
refusing.

**Severity:** Low. **Scope:** `agents/reconciler.md`.
**Filed:** `260826-1115_*_the-converted-reconciler-site-drops-the-turns-zero-is-a-real-figure-clause-the-other-four-carry.md`

## What was checked and found correct

**The README wiring snippet against `hooks/hooks.json`.** Extracted the fenced JSON from
`README-hooks.md` `### 1. Verify hooks are wired`, parsed both files and compared the objects:
identical, including the fourth SessionStart command. A user copying the snippet back no longer
deletes the hook. The `## Architecture` tree and the `## Files` table both carry `session-id.ts`.

**The citation pin's two recorded findings, both correct.** `scanPluginPaths`
(`hooks/lib/__tests__/reference-resolution-lint.test.ts:302-360`) iterates the lines `scannedLines`
returns, which applies `commentRe` and nothing else — there is no fence tracking anywhere in the class
(a) path, so a `$VAR`-rooted plugin path inside a JSON fence counts. And R-14's two edits to
`agents/orchestrator.md` add no path-shaped token at all: `:1279` carries the same single
`bin/fusion-identity` before and after, `:1322` carries none, so the zero is right.

**The pin's arithmetic.** The three shares were re-derived from the diff against `PLUGIN_PATH_BODY`:
R-12 is `bin/fusion-events` twice plus one `agents/orchestrator.md` = 3; R-10 is one
`agents/orchestrator.md` = 1; R-7 is `hooks/session-id.ts` and
`${CLAUDE_PLUGIN_ROOT}/hooks/dist/session-id.js` = 2. The removed
`fusion-workbench/orchestrator-events.jsonl` and the bare `session-id.ts` tokens are outside the
pattern's directory set, as the comment says. 1424 + 6 = 1430, and the gate reports 1430.

**Whether the comment states enough for the next re-approver.** It does: the total, the anchors, the
per-finding split with its measurement method, and the two properties that cannot be re-derived from
the number. One wording slip, not worth a record: "1 + 3 + 2 = 6, which is the 1430 this gate reports
here" equates a delta with a total.

**The growth measurement.** `surface-growth.golden` matches the tree byte for byte: `agents/` 417 796,
`skills/` 240 423, hook-test lines 20 349, and each file's own entry. No baseline moved.

**The full suite.** `cd hooks && npm test` — 44 files, 776 tests, exit 0, matching the commit's
verification line exactly.

**`hooks-wiring.test.ts`'s new comment.** "This pins that the two later arrivals did not absorb or
displace either of the two that were already there" is what the two assertions actually check, and
its pointer at `hooks/session-start.ts`'s header resolves: that header (`:99-104`) names `session-id.ts`
as the sibling and states the one-process-one-stdout argument.

## Cross-cutting observation

Three of the four findings are the same shape as the commit's own subject: a count word written when
it was true, left standing when the thing it counted changed. R-14 removed "the pair" from one
sentence while R-10 wrote it into another in the same commit; "a half" survived between the two
sentences R-14 rewrote. The recurrence is not carelessness — each task's brief named its own files and
none of them named a sibling's. What would catch it is a gate on the count words themselves, which
does not exist and is not obviously cheap. Naming it here rather than proposing one.

## Recommended sequencing

Nothing here blocks the Circle's close or a release. M-1 and M-2 are one sentence and should be fixed
together, M-1 first, since M-2's cheapest fix is a pointer that only works once M-1's is rooted. L-1 is
one word. L-2 is one clause and is bounded by the `agents/` budget rather than by difficulty.

---

**Reconciliation annotation — 2026-08-26, reconciler, HEAD `7774d56`.** All four findings of this
review reached records and all four are open, by the user's closure decision rather than by omission:
`260826-1112_*_…unrooted-path`, `260826-1113_*_…calls-the-id-fragment-the-pair`,
`260826-1114_*_…says-a-half`, `260826-1115_*_…turns-zero-is-a-real-figure`. Nothing in this range was
re-opened or reversed by the reconciliation pass.

This review closes the Circle's own counting theme with the corrections in `6deeb33`, and the pass
after it found the theme was not finished: `rules/workbench-tracking.md` names three readers where
four apply the scoping, and five shipped sites say the Turn-count helper replaced four whole-file
`grep -c` copies where there were two. Both filed at `260826-1127` in this Circle's issue store.
