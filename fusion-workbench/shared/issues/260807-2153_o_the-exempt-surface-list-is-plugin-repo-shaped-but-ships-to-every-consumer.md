The exempt-surface list is written from the plugin repo's position but is emitted to every consuming project, where its stated reason is false

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, review of `b246996..HEAD` (the two-language declaration split)
**Affects:** `rules/fusion-workbench-conventions.md:204-213` (`## Project language`, the exempt-surface block)
**Cross-references:** `fusion-workbench/shared/decisions/260807-1515_i_wie-weit-reicht-die-projektsprache-in-den-regelkorpus.md` — its third constraint required naming this repository's double role; `bin/fusion-rules:387` — the unconditional emission that puts this text in front of every agent in every project

---

## The defect

The new block reads:

```
rules/fusion-workbench-conventions.md:204
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
bin/fusion-rules:387
  emit_if_exists "$PLUGIN_RULES_DIR/fusion-workbench-conventions.md"
```

So a German consuming project's agents read this list and apply it to *their own* tree. In
a consuming project:

- `rules/` is the project's own fusion-agent rule directory — the second search layer in
  `bin/fusion-rules:464`. It ships nowhere.
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
