# Three shipped documents still describe ping-back detection as a live guard feature

---

**Severity:** Medium — the removal in `c353196` reached the code, the two READMEs and `CLAUDE.md`, and stopped there; the surfaces a user is pointed at still promise a feature that no longer exists
**Domain:** code
**Filed by:** coderev (incremental review of `6b94e17..HEAD`)
**Affects:**
`docs/philosophy.md:17`, `docs/working-model.md:81`, `skills/help/SKILL.md:84`
**Cross-references:**
`c353196` (the removal), decision `260809-2004_*_should-the-latching-churn-and-cross-file-criticals-be-bounded-or-dropped.md`, `README-hooks.md:25` (the accurate statement these three should agree with)

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
      only retrospective mentions that name decision `260809-2004_*_should-the-latching-churn-and-cross-file-criticals-be-bounded-or-dropped.md`.
- [ ] `docs/philosophy.md` no longer attributes a halt to churn.

---
Resolved: `97d5846`, verified at HEAD by the reconciler (260809-2252) — the record was
closed by rename with no resolution note, so this footer is the reconciler's, not the
closing agent's. Both criteria re-derived against the tree rather than read off the commit
message.

Criterion 1 — CONFIRMED. `grep -rin "ping-back\|pingback" docs/ skills/ agents/ rules/
README*.md CLAUDE.md bin/monitor` returns exactly one hit, `README-hooks.md:25`, and it is
retrospective and names decision `260809-2004_*_should-the-latching-churn-and-cross-file-criticals-be-bounded-or-dropped.md` ("The same decision removed the cross-file
ping-back tracker outright").

Criterion 2 — CONFIRMED. `docs/philosophy.md:17` now reads "Per-file churn is counted beside
all of that and only ever warns"; no halt is attributed to churn. The other two named sites
are also correct: `docs/working-model.md:81` is reduced to churn and states "observation
only", and `skills/help/SKILL.md:84` no longer names ping-back detection.

One thing this fix did not carry, filed rather than absorbed and correctly still `_o_`:
`260809-2243`, the stray `</content>` at the end of the same document.
