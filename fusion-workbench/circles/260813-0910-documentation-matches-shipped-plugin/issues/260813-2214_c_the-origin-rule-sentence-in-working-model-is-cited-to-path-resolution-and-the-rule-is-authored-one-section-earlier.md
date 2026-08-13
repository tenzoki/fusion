The Origin Rule sentence in `docs/working-model.md` is cited to `## Path Resolution`, and the rule is authored one section earlier

---
`docs/working-model.md:78` writes "an artifact belongs to the Circle whose Directive caused it" —
the Origin Rule, near-verbatim — and cites it to `rules/fusion-workbench-conventions.md`
`## Path Resolution`. The rule is authored at `## Origin Rule (Herkunftsregel)`
(`rules/fusion-workbench-conventions.md:97-99`), one section above. The sentence's second half
does belong to `## Path Resolution` (`:134`), so one pointer is carrying a two-part claim and
names the half it does not contain.
---

## Both sides read

**Documentation side**, `docs/working-model.md:78`:

> This is the Circle-first placement rule the workbench follows generally: an artifact belongs to
> the Circle whose Directive caused it, and once a Circle is in scope, every spec, plan, issue and
> decision written for it lands inside it
> ([`rules/fusion-workbench-conventions.md`](../rules/fusion-workbench-conventions.md)
> `## Path Resolution`).

**Artifact side**, `rules/fusion-workbench-conventions.md:97-99`:

> ## Origin Rule (Herkunftsregel)
>
> **An artifact belongs to the Circle whose Directive caused it to come into existence. With no
> active Circle, it goes to `shared/`. Cross-cutting relevance is expressed by citation, not by
> placement.**

and `:116`, `:134`, `## Path Resolution (Pfadauflösung)`, which carries the other half:

> **One second resolution is permitted, and only one.** A consumer that *creates* a Circle mid-run
> resolves once more immediately after creating it … The shaper's anticipated-circle mode is the
> case …

The section headings are `## Origin Rule (Herkunftsregel)` at `:97` and `## Path Resolution
(Pfadauflösung)` at `:116`; nothing under the second states the first.

`skills/help/SKILL.md:71`, edited in the same Turn, cites the pair correctly for the same rule:
"(`## fusion-workbench Layout`, `## Origin Rule`)".

## Why this is not caught by the lint

`hooks/lib/__tests__` scans `docs/` for citations and resolves them — the step-7 history record
notes that every citation added there was resolved (`history/260813-2150-coder-…:102-104`). The
cited section exists, so the citation resolves; what does not hold is that the cited section
contains the claim. The check is structural, and this class of defect is below it.

## Why it matters

The pointer is the only route a reader has from this sentence to the rule's reasoning, and the
reasoning is the load-bearing part: `## Origin Rule` explains at `:101` why placement is decided by
origin rather than by future reach, and carries the three worked examples and the two corollaries.
A reader sent to `## Path Resolution` finds the resolver contract, concludes the Origin Rule is a
resolver behaviour, and misses that it is the rule the resolver implements. The step's completion
note in the plan records the citation as deliberate ("the Circle-first placement sentence is cited
to `rules/fusion-workbench-conventions.md` `## Path Resolution`"), so this is a reading to correct
rather than an oversight to point out.

## Scope

`docs/working-model.md` only, one citation. The conventions file is correct and the partition
between its two sections is intentional.

## Recommended fix direction

Cite both sections, in the order the sentence uses them: `## Origin Rule` for "an artifact belongs
to the Circle whose Directive caused it", `## Path Resolution` for the Circle-first placement that
follows from a mid-run creation. Or split the sentence and give each half its own pointer.

Filed by: coderev (review of Circle Turn 4, range `93388bc..c663a1f`, commit `a489966`).

---

Resolved: 2026-08-13 — taken in the same pass, since it is one citation in a file already being
edited for the other three findings. `docs/working-model.md:80` now cites
`rules/fusion-workbench-conventions.md` `## Origin Rule` for the placement claim and names
`## Path Resolution` only for the extra resolution a mid-run creation is allowed. Checked against
`rules/fusion-workbench-conventions.md:97-99`, where `## Origin Rule (Herkunftsregel)` states "An
artifact belongs to the Circle whose Directive caused it to come into existence. With no active
Circle, it goes to `shared/`", and against the same file's `## Path Resolution (Pfadauflösung)` at
`:116`, whose *Where the call belongs* half carries the one permitted second resolution — the half
`agents/shaper.md:76` cites for the same act.
