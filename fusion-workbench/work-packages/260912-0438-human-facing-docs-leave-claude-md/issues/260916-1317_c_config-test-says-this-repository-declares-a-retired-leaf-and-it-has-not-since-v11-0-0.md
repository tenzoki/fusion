`config.test.ts` says this repository declares a retired leaf, and it has not since v11.0.0

---
`hooks/lib/__tests__/config.test.ts` states twice that this repository's own `fusion.json` carries
`orchestrator.maxTurns`:

- line 705, in the doc comment of `PROJECT_SET_KEYS`: *"`orchestrator` is NOT [documented for a
  project to set]: both of its leaves are retired, and it stays on this list only because this
  repository's copy still declares `maxTurns` — cut so the comparison holds every shared
  documentation note byte for byte instead of failing on that one line."*
- line 885, in the drift case: *"its copy also still carries `"orchestrator": {"maxTurns": N}`, which
  is now a retired leaf it has not yet deleted."*

`fusion.json` at the repository root declares one key, `citations`, and no `orchestrator`. The key
was removed in `e6a0dc67` (2026-09-10), first tagged in v11.0.0 — six days and four releases before
this range.

Two consequences.

**The exemption is now inert.** `PROJECT_SET_KEYS` (line 709) is `["orchestrator", "citations"]`, and
`cutTopLevelEntry(copyText, "orchestrator")` returns its input unchanged, because `findTopLevelKey`
finds nothing. The drift check's own anti-vacuity assertion covers only the template side
(`expect(withoutProjectSetKeys(templateText)).toBe(templateText)`), so nothing notices. The member
survives as a standing permission for this repository to declare an `orchestrator` container without
the drift check seeing it — which, since every leaf in that container is retired, would also put a
`guard_advisory` on every guarded tool call while the comparison stayed green.

**`CLAUDE.md` states the opposite**, in the `fusion.json` row: *"The other, the `orchestrator`
container, holds nothing but two retirements since 260910 … and this repository declares neither."*
That row is right and the test comment is wrong, so a reader who checks one against the other finds a
contradiction with no way to tell which is stale.

This file was in the `**Not-opened:**` list of
`260916-0740-reviewer-pre-tag-pass-over-the-log-activity-cadence-merge.md` and reached this pass by
that carry-forward.

**Acceptance test:** no comment in `hooks/lib/__tests__/config.test.ts` claims this repository
declares an `orchestrator` key, and either `PROJECT_SET_KEYS` drops the member or its comment states
a reason that holds at HEAD.

---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

---
Resolved: four sites in `hooks/lib/__tests__/config.test.ts` corrected, all line-neutral. The
`PROJECT_SET_KEYS` doc comment and the drift case's not-compared comment now say what is true —
`citations` is the one top-level key this repository's copy declares. Two further sites had to move
with them: `findTopLevelKey`'s worked example named `orchestrator` for a scan that no longer looks
for it, and the five synthetic cut-helper cases drove `cutTopLevelEntry` through a key that had left
the file. Both were retargeted to `citations`, so all five still run both branches.

The question this record raised, answered from the code rather than from the comment: the member
rested on nothing as an exemption. `cutTopLevelEntry(copyText, "orchestrator")` returned its input
unchanged, because `fusion.json` lost the container in `e6a0dc67`, and its one live consumer was the
five synthetic cases, which needed a key on the list and had no other reason to pick that one. It was
removed rather than left standing, since a member nothing exempts is a standing permission to declare
an advisory-earning container unseen. That removal goes past this record's own acceptance test, which
asked only for the two false statements; it was reported rather than made silently, and it is named
in the commit.
