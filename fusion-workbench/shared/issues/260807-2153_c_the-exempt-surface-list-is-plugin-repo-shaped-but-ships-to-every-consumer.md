The exempt-surface list is written from the plugin repo's position but is emitted to every consuming project, where its stated reason is false

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, review of `b246996..HEAD` (the two-language declaration split)
**Affects:** `rules/fusion-workbench-conventions.md` `## Project language`, the exempt-surface block (`:259-268` at `f3a3565`, the commit this was fixed against; it stood at `:204-213` when filed)
**Cross-references:** `fusion-workbench/shared/decisions/260807-1515_i_wie-weit-reicht-die-projektsprache-in-den-regelkorpus.md` — its third constraint required naming this repository's double role; `bin/fusion-rules:385` — the unconditional emission that puts this text in front of every agent in every project

---

## The defect

The new block reads:

```
rules/fusion-workbench-conventions.md:259 (at f3a3565; `:204` when filed)
  **Exempt surfaces — English in every project, whatever either line says.** These ship to
  consuming projects of every language, so one project's declaration cannot govern them:

  - rule files under `rules/`,
  - agent prompts under `agents/`,
  - skill bodies under `skills/`,
  - code and code comments,
  - `README.md` and its siblings, and everything under `docs/`,
  - hook and CLI operator strings — banners, deny reasons, halt notices, helper usage and
    error text.
```

`rules/fusion-workbench-conventions.md` is emitted unconditionally to all sixteen agents in
**every** project:

```
bin/fusion-rules:385
  emit_if_exists "$PLUGIN_RULES_DIR/fusion-workbench-conventions.md"
```

So a German consuming project's agents read this list and apply it to *their own* tree. In
a consuming project:

- `rules/` is the project's own fusion-agent rule directory — the second search layer in
  `bin/fusion-rules:461`. It ships nowhere.
- `agents/` and `skills/` do not exist as plugin directories at all; if the consumer has
  such paths they are unrelated.
- `README.md` and `docs/` are the consumer's own documents, written for the consumer's own
  readers.

The reason given — "These ship to consuming projects of every language" — is true for
exactly one repository, this one. In every other project it is false, while the rule it
justifies is stated absolutely ("English in every project, whatever either line says").
The result is that a `de`-declaring consumer is told its own README must be English, on a
ground that does not hold for it.

## Why this is the gap the decision asked to close

`260807-1515` set it as a constraint on any answer:

> Sie muss die Doppelrolle dieses Repositories benennen, statt sie zu übergehen: es ist
> zugleich Quelle des ausgelieferten Regeltexts und ein `de`-Projekt mit eigener Workbench.

The new text takes the plugin repo's exemptions and universalises them instead of naming
the double role. Two of the six bullets survive universalisation on their own merits —
"code and code comments" and "hook and CLI operator strings", the latter with a worked
justification in `hooks/session-start.ts` `## Why the message is English`. The other four
are repository-specific.

## Fix direction

Split the list in two, by who the text reaches:

1. **Universal exemptions** — code and code comments, and operator strings emitted by
   tooling before any agent has read `CLAUDE.md`. These hold in every project and keep the
   `session-start.ts` citation.
2. **Exemptions that belong to a project that ships a rule corpus** — `rules/`, `agents/`,
   `skills/`, `README.md`, `docs/`. State the criterion rather than the paths: *text a
   project ships to consumers of unknown language is English*. Then fusion's own repo
   falls under it by the criterion, a consumer that ships nothing is unaffected, and a
   consumer that does ship a rule corpus gets the same guidance for the right reason.

Whichever shape is chosen, the sentence "These ship to consuming projects of every
language" must stop being offered as the reason for a rule that a project which ships
nothing also has to obey.

---

## Reconciliation 260808-0030 (reconciler, domain `code`) — stays `_o_`; the substance holds, two line citations do not

Re-checked against `c54ead9`, after Turn 2 edited both files this finding names.

**The defect is unchanged and still live.** The quoted block is verbatim at
`rules/fusion-workbench-conventions.md:204-213`, including the reason clause "These ship to
consuming projects of every language, so one project's declaration cannot govern them". Turn 2's
`22b0ba8` touched exactly one line of `## Project language` (the commit-message justification at
`:215`) and left the exempt-surface block alone. The emission is still unconditional, so the text
still reaches every agent in every project.

**Two citations in this finding are now stale, both from Turn 2's own commit.** `4992ffb` added a
17-line explanatory block to `declared_lang()`, shifting everything below it:

- `bin/fusion-rules:387` → the emission is now at **`bin/fusion-rules:404`**. Line 387 today is
  `PROJECT_CLAUDE_RULES_DIR=".claude/rules"`.
- `bin/fusion-rules:464` (cited in prose as the second search layer) → now
  **`bin/fusion-rules:481`**, `emit_pattern_in_dir "$PROJECT_RULES_DIR" "$pat"`. Line 464 today is
  a bare comment marker.

Nothing else moved: `PROJECT_RULES_DIR="./rules"` is at `:386`, and the three consuming-project
observations in the analysis are unaffected.

**The fix direction is untouched by this pass.** Both bullets the finding grants as surviving
universalisation — code and comments, operator strings — are still the two that carry an
independent justification, and `hooks/session-start.ts` `## Why the message is English` still
exists and is still cited from the rule at `:213`.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: The quoted block stands verbatim at `rules/fusion-workbench-conventions.md:259` and is still emitted unconditionally at `bin/fusion-rules:385`, so every consuming project loads it. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.

---

**Resolved:** 2026-08-18, `coder`. The exempt-surface block in
`rules/fusion-workbench-conventions.md` `## Project language` is split in two by who the text
reaches, per the `## Fix direction` above and per decision
`shared/decisions/260818-0814_*_what-covers-the-plugin-repo-shaped-exempt-surface-record-now-that-the-convention-rule-was-not-chosen.md`
option 2 — an ordinary defect against the wording of one list, with no rule file created.

**What the text now says.** A **universal** group carrying the two bullets that survived on their
own merits — code and code comments, and hook and CLI operator strings — with the
`hooks/session-start.ts` `## Why the message is English` citation kept as the worked case for the
second. Then a **conditional** group stated as a criterion rather than as paths: *text a project
ships to consumers of unknown language is English*, with both sides of it spelled out, so a project
that ships nothing onward reads that its declarations govern its whole tree, its own `rules/` and
its own `README.md` included. The sentence "These ship to consuming projects of every language" is
gone as a justification, and appears only inside the closing paragraph as the thing that was wrong.

**The double role is named rather than passed over**, which is the third constraint of
`shared/decisions/260807-1515_*_wie-weit-reicht-die-projektsprache-in-den-regelkorpus.md`. A closing
paragraph says fusion's own repository holds both roles at once — source of the shipped rule text
and a `de` project with its own workbench — and that the criterion *divides* it rather than
exempting it whole: the rule files, agent prompts, skill bodies, `README.md` and `docs/` it ships
are English, its workbench artifacts follow its declarations like any other project's. The fourth
bullet of the four-way split at the head of the section was reworded to match, so the pointer into
this block no longer promises a single list.

**Cost.** `rules/fusion-workbench-conventions.md` 56 810 → 58 103 bytes (+1 293). It is always-on,
so every agent pays it on every dispatch. The universal-core growth bound in
`hooks/lib/__tests__/rules-emission-golden.test.ts` passes; the golden fixture was regenerated by
its documented command and moved only this file's size and the per-agent totals.

**Citations verified at `f3a3565`** and corrected above where they had drifted: the emission is
`bin/fusion-rules:385` (this record said `:387`, the 260808 pass said `:404`); the project-rules
search layer is `bin/fusion-rules:461` (this record said `:464`, the 260808 pass said `:481`);
`PROJECT_RULES_DIR="./rules"` is `:367` (the 260808 pass said `:386`). The two numbers inside the
**Reconciliation 260808-0030** note are left as that pass wrote them and are superseded by this
paragraph — they are a dated record of that measurement, not live pointers.
`hooks/session-start.ts` `## Why the message is English` exists at `hooks/session-start.ts:73`.

**Verification:** `npm test` in `hooks/`.
