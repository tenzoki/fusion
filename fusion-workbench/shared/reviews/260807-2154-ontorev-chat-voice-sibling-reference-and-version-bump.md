# Ontology review — chat-profile sibling reference and the 6.1.0 version bump

**Sender:** ontorev
**Date:** 260807-2154
**Range:** `b246996..HEAD` (`0e9e39f`)
**Scope:** `stilwerk/chat-voice-{de,en}.yaml`, `fusion-workbench/stilwerk/chat-voice-{de,en}.yaml`,
`.claude-plugin/plugin.json`. `stilwerk/default-voice-{de,en}.yaml` read as context, not reviewed
as changed. Shell, tests and rule prose were out of scope and went to `coderev` in parallel.

## Summary

The wording change is correct. All four YAML files parse cleanly under three independent parsers,
the shipped and workbench copies are byte-identical per pair, and the parsed data is unchanged
except for the two `description` strings — every other edited line is a comment. The new phrasing
holds in all four chat/artifact language configurations, and the German file's
`Beratungs-` → `Langform-` change is within the step's remit rather than beyond it. The version
bump to 6.1.0 is the right increment. Three findings, none of them a defect in the edit itself:
one about reach (the correction never arrives at an existing consumer), one about the release gate
being half-walked, one about the reference having no landing point in its target file.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 2 |
| Low | 1 |

Nothing in the five reviewed files needs to be edited to fix a defect.

## Verification performed

**Parsers.** Ruby `Psych` (`YAML.safe_load`, aliases disabled), perl `YAML::XS` (libyaml), and
pure-perl `YAML.pm`. All three parse all four profile files without error. `.claude-plugin/plugin.json`
parses under `node` and Ruby `JSON`, and `claude plugin validate .` reports "Validation passed with
warnings" — the single warning is the pre-existing, expected one about the root `CLAUDE.md` not
being shipped.

**Structure.** Both chat profiles carry top-level keys `[name, description, scope, whitelist,
blacklist, examples, settings]`; `scope: short-form`; whitelist ids `C01 C02 C03 C04 C05 C06`;
blacklist ids `AI02 AI01 AI05 AI06 AI04 AI07 AI08 L04 AI11` in that order; `settings.fit_threshold
0.85`, `settings.max_iterations 3`. No duplicate ids, no entry missing `name` or `instruction`. All
of that matches the expected inventory exactly.

**Byte-identity.** `cmp` and `sha256` on all four pairs: `stilwerk/<f>` and
`fusion-workbench/stilwerk/<f>` are identical for `chat-voice-de.yaml`, `chat-voice-en.yaml`,
`default-voice-de.yaml` and `default-voice-en.yaml`. Independently confirmed at the parsed level:
each workbench copy loads to an object equal to its shipped counterpart. Working tree is clean
against HEAD for all five reviewed files.

**Hygiene.** No BOM, no CR characters, trailing newline present in all three edited file kinds.

## Findings by theme

### 1. Integrity of the four files — clean

Nothing to report. The one thing worth recording because a reviewer could get it wrong: four of the
six changed lines are YAML **comments**, which every parser discards. They still matter, because an
agent reads these files as text through `Read`, not through a parser. The edit correctly treated
comments and the `description` scalar as one surface.

### 2. The wording is correct in all four configurations — no finding

The test is whether each sentence stays true when the chat language and the artifact language
differ. Laid out exhaustively:

| chat | artifact | emitted chat profile | emitted writing profile | sentence holds |
|---|---|---|---|---|
| en | en | `chat-voice-en` | `default-voice-en` | yes |
| de | de | `chat-voice-de` | `default-voice-de` | yes |
| de | en | `chat-voice-de` | `default-voice-en` | yes |
| en | de | `chat-voice-en` | `default-voice-de` | yes |

All six replacement strings name a **role**, never a language and never a file:

- `chat-voice-en.yaml:4-5` "NOT for long-form prose — that uses the long-form writing profile."
- `chat-voice-en.yaml:8` "Short-form companion to the long-form writing profile."
- `chat-voice-en.yaml:12-13` "Long-form prose uses the long-form writing profile, not this one."
- `chat-voice-de.yaml:4` "NICHT für Langform-Prosa — dafür gilt das Langform-Schreibprofil."
- `chat-voice-de.yaml:7` "Kurzform-Begleiter zum Langform-Schreibprofil."
- `chat-voice-de.yaml:12` "Für Langform-Prosa gilt das Langform-Schreibprofil, nicht dieses."

This is not merely filename-avoidance. "Companion" and "Begleiter" express a role pairing
(short-form half, long-form half), which is invariant under the language split, so no residual
same-language implication survives. Two further properties hold that the step did not have to
achieve and did anyway:

- The English phrase matches the corpus term exactly. `rules/user-facing-output.md:23`,
  `rules/fusion-workbench-conventions.md:198` and `rules/agent-setup.md:48` all say "long-form
  writing profile". That satisfies the chat profile's own `C06` ("one name per thing") for the
  entity it references.
- The non-prose agents improved. `bin/fusion-rules` emits no writing profile for `coder`,
  `ontocoder`, `coderev`, `ontorev` and the rest. The old text pointed those agents at a filename
  they were never handed; the new text points at a role that simply does not apply to them.

The German fallback case also holds: artifact `de` with `default-voice-de.yaml` missing falls back
to `default-voice-en.yaml`, and "das Langform-Schreibprofil" still names it correctly.

### 3. `Beratungs-` → `Langform-` — the change is right and within remit

**Ruling: right, and inside the step's remit rather than beyond it.** Three grounds, in descending
weight.

The plan asked for it literally. Step S8 of
`260807-2024_*_two-language-declarations.md:166` says "Replace the filename with a
language-neutral reference to **'the long-form writing profile'**". `Langform-Schreibprofil` is that
phrase in German. The editing agent did not choose a new term; it translated the one the plan named.

Removing the filename forces the surviving phrase to carry the whole reference. Keeping
`Beratungs-Schreibprofil` while deleting `(default-voice-de.yaml)` would have left a term appearing
nowhere else in fusion — it matches neither the rules corpus ("long-form writing profile") nor the
target file's own `name:` ("Consulting & Strategy (German)") exactly. So the term choice is part of
the deletion, not an extra change riding along with it.

It removes a pre-existing asymmetry between the two files. Before the change, the English chat
profile already said "the long-form writing profile" while the German said "Beratungs-". Since the
step's whole purpose is to make one sentence hold uniformly across configurations, aligning the two
files is in scope.

The counter-argument deserves stating and does not survive: the German writing profile's `name:`
field really is "Consulting & Strategy (German)", so the reference no longer echoes the target's
self-description. But `name:` answers "what does this voice sound like" and the reference answers
"when does this profile apply" — different axes, no contradiction, and the rules corpus itself uses
both in the same breath (`user-facing-output.md:23`: "the long-form writing profile … its
consulting-register voice"). The residual is that the target file offers no matching handle at all,
which is finding 6 below, not an argument for reverting this one.

### 4. Version bump 6.1.0 — right increment, JSON well-formed (Medium finding attached)

**The increment is correct.** The repository's practice is semver and is consistent across the last
thirty bumps: features take minor (`5.1.0` selective context loading, `5.2.0` the editor agent,
`5.7.0` the cadence skill), fixes take patch (`5.9.1`, `3.25.1`, `3.24.1`), breaking changes take
major (`4.0.0` workbench restructure, `5.0.0` marker delimiter, `6.0.0` classifier removal). The
optional `**Artifact language:**` declaration is functionality added backwards-compatibly, which is
minor by definition.

**One correction to the stated reasoning.** The argument given — "the stdout shape of
`bin/fusion-rules` is unchanged and a project adding no second line gets byte-identical output" —
establishes that the change is *not major*. It does not establish that it is not a *patch*. What
rules out patch is the new feature: a project can now declare a second language. Worth separating,
because the same sentence would justify 6.0.2 equally well.

**JSON.** Well-formed under two parsers, six keys unchanged from 6.0.1, no BOM, no CRLF, trailing
newline present, `claude plugin validate .` green.

**Finding (Medium):** the other version surfaces did not move. Filed as
`260807-2154_*_plugin-json-says-6-1-0-while-tag-marketplace-and-both-pin-examples-say-6-0-1.md`.
`marketplace.json:42`, `install.sh:27`, `README.md:26` and the tag set all still read 6.0.1, while
the HEAD commit titles itself a release. The plan deferred these to a user-run release gate twice
(step S11 and Out of Scope), so the issue is a tracking record for the deferred half rather than a
criticism of S11. Note that the same drift class has been filed and closed twice already, in
`circles/260801-1244-guard-rules-write/issues/260805-1150_c_*` and `260805-1840_c_*`.

### 5. Nothing else changed — confirmed, with one correction to the premise

The parsed structural diff of `b246996` against HEAD is decisive: for both chat profiles the
top-level key sets are equal and **`description` is the only key whose value differs**. Every
whitelist and blacklist entry, every example, and the entire `settings` block are byte-equal after
parsing. No data moved.

**Correction:** the English file grew by **two** lines, not one — 181 to 183. Two separate comment
blocks were rewrapped, each gaining a line: the header comment at line 4 and the scope comment at
line 12. The shift below is uniform `+2`, verified against anchors: `scope:` 12→14, `C01` 15→17,
`blacklist:` 77→79, `C04` 35→37, `examples:` 168→170, `AI11` 152→154, `settings:` 179→181. The
German file did not shift at all (185 lines before and after) — both of its rewraps stayed within
their line budget.

**Consequence, observation only, not filed.** Three line citations into `chat-voice-en.yaml` are now
off by two, all in historical workbench records that describe the file as it stood:
`260706-1902-user-facing-agents-garbled-language-rootcause.md:27` and `:95`, and
`260706-1902_*_consultant-chat-misrouted-to-longform-voice.md:26`, all citing
`chat-voice-en.yaml:36-42` for `C04`, which now sits at 37-44. The issue is closed and the analysis
is a historical record; neither is a live instruction. Recorded here so a later reader is not
misled, deliberately not filed as a defect.

### 6. The reference has no landing point in its target (Low)

Filed as
`260807-2154_*_the-writing-profile-carries-no-handle-for-the-reference-that-now-points-at-it.md`.

Neither `default-voice-en.yaml` nor `default-voice-de.yaml` contains the phrase "long-form writing
profile", and neither declares a `scope:` key although both chat profiles declare
`scope: short-form`. Verified by parsing: the writing profiles' key set is `[name, description,
whitelist, blacklist, examples, anti_examples, settings]`. Verified by grep: neither writing profile
mentions the chat family in any form, so the plan's claim that they carry no sibling pointer holds
independently.

Before the change the reference had two handles (the exact filename, and "Beratungs-" against
"Consulting & Strategy"). It now has one, and it resolves only through `rules/agent-setup.md:48-50`.
That rule ships with the plugin and is always current, so the reference does resolve today — this is
a robustness gap, not a live fault, hence Low. The clean close is to give the writing profiles the
reciprocal handle, but adding `scope: long-form` is a schema change to a file every consumer holds a
copy of and needs the user's approval first. The comment-only half needs none.

### 7. The correction never reaches an existing consumer (Medium)

Filed as
`260807-2154_*_corrected-sibling-wording-never-reaches-an-existing-consumer.md`.

`/fusion:setup` copies stylometric profiles only when absent (`skills/setup/SKILL.md:135-138`, with
line 140 stating the intent), `/fusion:migrate` names `stilwerk/` in its never-touch list
(`skills/migrate/SKILL.md:114`), and `/fusion:archive` excludes it (`skills/archive/SKILL.md:91`).
Verified by `grep -rn "stilwerk" skills/`: no write path exists. So a project set up before v6.1.0
keeps a chat profile naming `default-voice-<chat-lang>.yaml` — precisely the file the split stops
emitting once that project adopts `**Artifact language:**`. The agent then holds the fresh
`rules/agent-setup.md` saying a mismatch is intended and a stale profile comment saying the sibling
is the same-language file. Resolving that the wrong way is the behaviour step S6 exists to prevent.

The plan named the reach limit in its Risks table (line 262) and chose the wording change *because*
a second filename would not have helped either. What it left open is any follow-up. The issue is
that follow-up.

## Explicitly checked and clean

- Both copies of each profile identical, at byte and parsed level.
- Entry ids, order, and the `settings` block unchanged in both chat profiles.
- `default-voice-*.yaml` untouched, and independently confirmed to carry no sibling pointer.
- `plugin.json` structurally valid, six keys unchanged, manifest validator green.
- No test or fixture pins the changed strings — verified by grep for
  `Beratungs-Schreibprofil`, `Langform-Schreibprofil`, `long-form writing profile`,
  `Kurzform-Begleiter` and `Short-form companion` across the repository. The new suite
  `hooks/lib/__tests__/rules-voice-profile.test.ts` asserts emitted **paths**, never file contents.
- No working-tree drift: all five reviewed files are clean against HEAD.

## Recommended sequencing

1. **Decide the release gate** (issue `…_o_plugin-json-says-6-1-0…`). Highest urgency of the three,
   because the documented pin `tags/v6.1.0` does not resolve and `/plugin install` still serves
   6.0.1. Cheapest to resolve: it is `CLAUDE.md` `## Release process` steps 2-6, or an explicit
   decision to leave `plugin.json` ahead.
2. **Decide the reach fix** (issue `…_o_corrected-sibling-wording…`). Needs a user decision because
   the guarded copy-if-absent semantics in `/fusion:setup` are deliberate. A README sentence is the
   zero-risk option; a setup-time detection is the thorough one.
3. **Close the reference gap** (issue `…_o_the-writing-profile-carries-no-handle…`). Lowest
   priority. The comment-only half can land any time; `scope: long-form` needs approval.

Nothing here blocks the change under review. It is correct as committed.

---

**Reconciliation 260808-0030 (reconciler, domain `code`).** All three findings re-checked against
`c54ead9`. The version-pin finding is resolved: `.claude-plugin/plugin.json:3`, the marketplace
entry at `tenzoki/claude-plugins@0c091d9`, `install.sh:27` and `README.md:26` all read `6.1.0`, and
tag `v6.1.0` exists locally and on the remote at `fd74b89` — four version surfaces coherent, closed
as `260807-2154_*_plugin-json-says-6-1-0-while-tag-marketplace-and-both-pin-examples-say-6-0-1.md`.
The two structured-data findings remain open and were re-verified line by line; see the
reconciliation notes appended to
`260807-2154_*_corrected-sibling-wording-never-reaches-an-existing-consumer.md` and
`260807-2154_*_the-writing-profile-carries-no-handle-for-the-reference-that-now-points-at-it.md`.
