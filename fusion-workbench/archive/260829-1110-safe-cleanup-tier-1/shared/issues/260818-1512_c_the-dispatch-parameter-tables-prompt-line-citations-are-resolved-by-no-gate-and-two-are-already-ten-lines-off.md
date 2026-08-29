README-agents' dispatch-parameter table cites prompt line numbers that no gate resolves, and two of them are already ten lines off

---

`README-agents.md` `## Dispatch parameters` is the single authoring home for the seven agents that
read a run-time parameter. `CLAUDE.md:58` points every other surface at it and forbids a second
copy. Each row ends in a citation of the prompt line the row was read against, in the form
`agents/orchestrator.md:319`.

No gate resolves the line number. `hooks/lib/__tests__/reference-resolution-lint.test.ts` class (a)
checks that the cited *file* exists, and its `resolveToken` strips nothing and reads nothing past
the path. Class (b) resolves a heading only in the adjacent `` `file.md` `## Section` `` form. A
line suffix is neither, so a row keeps passing while the line under it moves.

## The measured drift

Two rows in that table cite the wrong lines at HEAD `83d3b04`:

| Row | Cites | Actual line |
|---|---|---|
| `shaper` / `**Circle file:**`, who passes it | `agents/orchestrator.md:319` | 329 |
| `shaper` / `**Initiated by:**`, who passes it | `agents/orchestrator.md:320` | 330 |

Lines 316 to 322 hold the distinguishing-rule paragraph ("an inferred choice is your decision
wearing the user's name"); the three parameter lines sit in the fenced block at 327 to 331. Both
citations land inside a paragraph about *whether* to dispatch, ten lines above the block that
shows *what* the dispatch carries. A reader following either citation reads the wrong thing and
has no signal that they did.

The five `agents/shaper.md` citations in the same table still resolve. That is the shape of the
failure rather than an exoneration: the drift is per-file and arrives whenever anything above a
cited line is edited, so a passing citation today says only that its file has not been edited
above it yet.

## Why this is not the same class as a dangling path

A dangling path fails loudly the moment somebody opens it. A stale line number resolves to *a*
line, and that line is usually still plausible prose from the same document. The reader gets a
wrong answer that looks like a right one, which is the silent-wrong failure `HYG-NO-SILENT-FAIL`
is written against, arriving through a citation form rather than through a code path.

The obligation is also unowned. `260810-1635_*_where-does-the-obligation-sit-to-update-the-artefact-that-explains-a-behaviour-when-the-behaviour-changes.md`
answers the general question for behaviour changes; a line-number citation drifts on edits that
change no behaviour at all, so nothing brings the obligation into view.

## Suggested fix

Three options, in ascending cost:

1. **Drop the line numbers**, keeping the file citation and, where a section exists, the heading in
   the adjacent form the lint already resolves. Cheapest, and it converts an unresolvable citation
   into a resolvable one. Costs the reader a search inside the file.
2. **Extend the lint** to resolve `path:N` by asserting the file has at least N lines. Catches
   deletion past the end and nothing else, which is most of the drift class not at all.
3. **Extend the lint to resolve `path:N` against an expected token** written into the citation.
   Correct and the most expensive: every citation gains a payload somebody has to write.

Option 1 is the one that removes the failure rather than measuring part of it. Option 3 is what a
gate would need to actually check the claim, and the payload it requires is close to the citation
being a quote rather than a coordinate.

Whichever is chosen, the two rows above are wrong today and should be corrected independently of
the design question.

**Severity:** Low
**Domain:** code
**Filed by:** planner, while planning `260818-1512_*_the-circle-records-directive-becomes-a-pointer-and-gains-a-writer.md`
**Cross-references:** `README-agents.md` `## Dispatch parameters` (rows for `shaper` / `**Circle file:**` and `shaper` / `**Initiated by:**`), `CLAUDE.md:58` (the single-authoring-home rule that makes this table load-bearing), `hooks/lib/__tests__/reference-resolution-lint.test.ts` (the gate that does not reach it), `260818-0715_*_four-shipped-surfaces-use-a-real-fusion-circle-directory-name-as-the-format-example.md` (same direction: a citation form the lint is satisfied by for the wrong reason)

---
Resolved: 2026-08-18, **the measured drift only** — closed on the user's instruction at the plan
gate, which named this record as step 5 of
`260818-1512_*_the-circle-records-directive-becomes-a-pointer-and-gains-a-writer.md`.
The two rows in the table above were wrong and are now right: `**Circle file:**` and
`**Initiated by:**` cite `agents/orchestrator.md:343` and `:345`, which are the parameter lines
themselves inside the fenced block, not the paragraph ten lines above it. Every other citation the
step's own edits shifted was re-measured against the file rather than arithmetically adjusted, and
six were corrected past their old values because they had already drifted onto unrelated lines:
Phase 1 `:410`→`:447`, Phase 3 `:667`→`:699`, Phase 4 `:868`→`:875`, the planner dispatch
`:396`→`:434` (twice), the editor dispatch `:456`→`:485` — that one had come to name a blank line —
and `:1411`→`:1321`. The `agents/shaper.md` citations moved with mode 3's rewrite: `:55`→`:66`,
`:57`→`:68`, `:59`→`:70`, `:62`→`:73`, `:82`→`:93`, `:106`→`:117`.

**What is NOT fixed, stated here because closing the record leaves it with no open home.** The
design question is untouched: no gate resolves a `path:N` citation, so every number above is correct
today and unowned tomorrow, and the three options this record ranks — drop the numbers, assert a
line count, assert a token — remain unchosen. This close records a measurement, not a mechanism. The
count of corrections needed for one change to two prompts is itself evidence for option 1. Re-file
if the design question should stay tracked.
