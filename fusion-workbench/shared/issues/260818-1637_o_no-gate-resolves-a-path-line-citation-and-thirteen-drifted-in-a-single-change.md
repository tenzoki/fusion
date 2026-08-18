No gate resolves a `path:N` citation, and thirteen drifted in a single change

---

**Severity:** Medium
**Domain:** code
**Filed by:** orchestrator, re-filing a residual the closing change named and strengthened
**Affects:** every shipped surface carrying `path:N` citations — `agents/*.md`, `skills/*/SKILL.md`, `README-agents.md`, `rules/*.md`
**Cross-references:** `shared/issues/260818-1512_c_the-dispatch-parameter-tables-prompt-line-citations-are-resolved-by-no-gate-and-two-are-already-ten-lines-off.md` — the record this residual outlived, closed by plan `260818-1512` step 5

---

## Why this exists as a second record, with more evidence than the first

The closed record measured two stale line citations in `README-agents.md`. Step 5 corrected those
two. The design question it raised — that `hooks/lib/__tests__/reference-resolution-lint.test.ts`
resolves a *path* but never the `:N` after it — was untouched, and closing the record left it with
no open home.

The evidence got stronger while the plan was being executed. The single change of plan
`260818-1512` required **thirteen** citation corrections, and six of those had drifted onto
unrelated lines beyond the two the original record measured. One of them,
`agents/orchestrator.md:456`, pointed at a blank line.

## Why it matters

A `path:N` citation is read by an agent that will not open the file to check, and a stale one sends
it to the wrong text with no signal that anything is wrong. The failure is silent by construction,
which is what distinguishes it from a broken path: the existing lint catches a path that resolves
to nothing, and a line number that resolves to the wrong line looks exactly like one that resolves
to the right line.

## What the closed record proposed

Its option 1 was to extend the reference lint to resolve the line number as well, by pinning a
short quoted fragment beside the citation. Thirteen corrections in one change is fresh evidence
for it. The counter-argument it also carried is real: every prompt edit that shifts a line then
becomes a lint failure somewhere else, and this project has removed mechanisms whose false-alarm
rate exceeded their catch rate. Whoever takes this weighs that.
