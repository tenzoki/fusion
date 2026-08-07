# The corrected chat-profile wording never reaches a project that is already set up

---

Step S8 of `shared/planning/260807-2024_c_two-language-declarations.md` replaced the same-language
filename in both chat profiles with a language-neutral role reference. The corrected files reach
new consumers only. Every project set up before v6.1.0 keeps a `chat-voice-<lang>.yaml` that still
names `default-voice-<chat-lang>.yaml` as its long-form sibling — which is exactly the file the
split stops emitting once that project declares `**Artifact language:**`.

---

## Evidence

No skill refreshes an existing workbench's stylometric profiles:

- `skills/setup/SKILL.md:135-138` — all four copies are guarded by `[ -f … ] ||`, and line 140
  states the intent: "existing files are left untouched, so any project-local edits to the
  profiles survive subsequent setups."
- `skills/migrate/SKILL.md:114` — `stilwerk/` is named in the never-touch list.
- `skills/archive/SKILL.md:91` — `stilwerk/` is excluded from archiving.

Verified by `grep -rn "stilwerk" skills/`: no other write path exists.

## Failure scenario

A consuming project set up at v6.0.1 with `**Language:** de` adds `**Artifact language:** en` after
upgrading to v6.1.0. `bin/fusion-rules` then emits
`./fusion-workbench/stilwerk/chat-voice-de.yaml` and
`./fusion-workbench/stilwerk/default-voice-en.yaml`. The workbench's stale `chat-voice-de.yaml`
line 4 tells the agent "NICHT für Langform-Prosa — dafür gilt default-voice-de.yaml", naming a file
that was not emitted for this run.

The agent now holds two contradicting statements: `rules/agent-setup.md:52-56` (shipped fresh with
the plugin, so always current) says the two paths may name different languages and that this is
intended; the workbench's own profile file says the sibling is the same-language one. Resolving
that conflict the wrong way is the behaviour step S6 was written to prevent — see the plan's Risks
row "An agent meets two profile paths in different languages and treats it as a bug".

## Status of this as a known limit

The plan records the reach limit at line 262 ("Note the reach limit: `/fusion:setup` copies a
profile only when absent, so an existing consumer keeps its stale copy until it deletes the file")
and chose the wording change *because* a second filename would not have helped either. What it did
not do is leave a tracked item for the residual. This issue is that item, not a criticism of S8 —
the wording change itself is correct (see the review).

## Candidate resolutions (not yet decided)

1. Have `/fusion:setup` detect a chat profile that still names a `default-voice-*.yaml` filename
   and tell the user to delete the file so the fresh copy lands. Detection is a plain `grep`; the
   overwrite stays opt-in, so project-local edits are still safe.
2. Document the refresh in `README.md` alongside the `**Artifact language:**` line, so a user
   adopting the split is told to remove the two chat profiles once.
3. Accept it and close: the shipped `rules/agent-setup.md` already carries the authoritative
   statement, and the stale comment is only a hint.

Option 1 or 2 needs a decision before implementation — the guarded-copy semantics in
`skills/setup/SKILL.md:140` are deliberate and must not be silently inverted.

## Cross-references

- Plan: `fusion-workbench/shared/planning/260807-2024_c_two-language-declarations.md` step S8, Risks row
- Rule: `rules/agent-setup.md` `## Voice profiles`
- Rule: `rules/fusion-workbench-conventions.md` `## Project language`
- Review: `fusion-workbench/shared/reviews/260807-2154-ontorev-chat-voice-sibling-reference-and-version-bump.md`
