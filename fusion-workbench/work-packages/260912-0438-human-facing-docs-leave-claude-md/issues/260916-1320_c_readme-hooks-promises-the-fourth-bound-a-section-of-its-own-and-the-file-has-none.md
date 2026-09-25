`README-hooks.md` promises the fourth bound a section of its own, and the file has none

---
`README-hooks.md:473`, the opening paragraph of `### Growth bounds on the shipped text`:

> A fourth bound, the per-dispatch-path total, works differently and **has its own section below**.

There is no such section. The headings after line 471 are `#### When each event was used, and what
governs it` (498), `#### The head-room raises, and the reduction read on 2026-10-10` (523),
`### Rebuilding after TS changes` (564) and `## Origin` (578). The bound is named three more times —
line 481 (*"The per-dispatch-path bound below"*), line 500 and line 536 (*"the failing bound this
section's table does not list"*) — and each time as something documented elsewhere. A reader sent
"below" four times never arrives.

Where it is actually authored: `hooks/lib/__tests__/rules-emission-golden.test.ts:1030` onward
(`THE DISPATCH-PATH BOUND`, `DISPATCH_HEAD_ROOM = 0`, the baseline at
`hooks/lib/__tests__/fixtures/dispatch-path.baseline`).

This matters more than a loose sentence would, because `CLAUDE.md` routes readers here for exactly
this: *"Which surfaces are bounded, at what head-room, at what each is measured from, and what no
bound covers is one table in `README-hooks.md` `### Growth bounds on the shipped text`."* The
zero-head-room bound that charges `CLAUDE.md` to all eleven dispatch paths — the one a `CLAUDE.md`
edit meets first — is the one that table does not carry and the section does not add.

Nothing resolves it: `hooks/lib/__tests__/reference-resolution-lint.test.ts` class (b) checks an
anchor only in the adjacent `` `file.md` `## Section` `` form, and "has its own section below" carries
no token of any pinned class.

Pre-existing rather than introduced here — the sentence arrived in `a5bb2a63` — and named in this
pass because the same section's head-room figures moved in `v11.4.1..HEAD`.

**Acceptance test:** `### Growth bounds on the shipped text` either carries the per-dispatch-path
section it promises, or cites where that bound is authored in the adjacent file-plus-anchor form the
citation gate resolves.

---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

---
Resolved: the pointers were corrected rather than the section written, and the choice was made on
where the content lives. `hooks/lib/__tests__/rules-emission-golden.test.ts` carries a long banner on
the dispatch-path bound — what it measures, why it is not the core bound, the thirteen-day replay,
why its head-room is zero, why the baseline is a fixture — and `fixtures/dispatch-path.baseline`
carries its own header with the eleven rows and the arming provenance. A README section would have
been a second home for figures that move, which is the failure this very section's last paragraph
records about the head-room raise log. So `### Growth bounds on the shipped text` now names both
authoring sites and states that it neither restates them nor lists the bound in its table, because
it measures a rate of growth while that bound measures the level one dispatch reads. The stale
"below" is gone; the two later mentions already named the test file and needed nothing. The two new
path tokens moved the reference-resolution pin 1603 to 1605, attributed by in-place swap with no
residual and no interaction, appended to the existing comment line.
