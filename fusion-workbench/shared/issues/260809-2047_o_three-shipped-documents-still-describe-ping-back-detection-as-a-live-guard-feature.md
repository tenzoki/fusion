# Three shipped documents still describe ping-back detection as a live guard feature

---

**Severity:** Medium — the removal in `c353196` reached the code, the two READMEs and `CLAUDE.md`, and stopped there; the surfaces a user is pointed at still promise a feature that no longer exists
**Domain:** code
**Filed by:** coderev (incremental review of `6b94e17..HEAD`)
**Affects:**
`docs/philosophy.md:17`, `docs/working-model.md:81`, `skills/help/SKILL.md:84`
**Cross-references:**
`c353196` (the removal), decision `260809-2004`, `README-hooks.md:25` (the accurate statement these three should agree with)

---

## What is wrong

`c353196` removed the cross-file ping-back tracker: `lib/cross-file.ts`, its
tests, the `crossFile` block in `hooks/config.json` and
`hooks/config.example.json`, the `cross_file_warning` / `cross_file_critical`
members of `GuardEventType`, and the monitor's panel membership and render
branch. That part is complete — a repository-wide search for the identifier
finds only retrospective comments naming the decision.

Three shipped documents were not updated, and each is a surface a user reaches
on purpose:

- `docs/philosophy.md:17` — "A compliance guard watches every edit — tracking
  per-file churn, **detecting ping-back loops (A→B→A→B edit cycles)**, and
  halting when an agent revisits the same file too often." `/fusion:help` points
  at this file for the philosophy topic. The second half of the sentence is also
  wrong independently of this change and always was: churn never halts, it is
  observation-only (`README-hooks.md:24`).
- `docs/working-model.md:81` — a bullet headed "**Churn and ping-back —
  observation only**", describing the guard as watching "for back-and-forth edit
  loops (file A → file B → file A)".
- `skills/help/SKILL.md:84` — routes a user to `README-hooks.md` and
  `config.example.json` for "Categories, churn thresholds, escalation behavior,
  **ping-back detection**". Neither destination mentions it any more, so the
  pointer is to a section that does not exist.

## Suggested direction

- `docs/philosophy.md:17` — drop the ping-back clause; correct "halting when an
  agent revisits the same file too often" to a warning, or move the halting
  claim onto the surfaces that do halt (protected paths, three consecutive
  blocks).
- `docs/working-model.md:81` — reduce to churn, keep "observation only".
- `skills/help/SKILL.md:84` — drop "ping-back detection".

None of the three is a rule file, so no provenance header is involved.

## Acceptance criteria

- [ ] `grep -ri "ping-back\|pingback" docs/ skills/ agents/ README*.md` returns
      only retrospective mentions that name decision `260809-2004`.
- [ ] `docs/philosophy.md` no longer attributes a halt to churn.
