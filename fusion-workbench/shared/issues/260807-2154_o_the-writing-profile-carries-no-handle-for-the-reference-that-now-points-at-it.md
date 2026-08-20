# The long-form writing profile carries no handle for the reference that now points at it

---

With the filename removed, "the long-form writing profile" / "das Langform-Schreibprofil" is the
only handle each chat profile offers for its sibling. Neither `default-voice-en.yaml` nor
`default-voice-de.yaml` contains that phrase, and neither declares a `scope:` key, while both chat
profiles do. The reference resolves only via `rules/agent-setup.md`; the target file itself gives
the reader nothing to match on.

---

## Evidence

Reference side, after the change:

- `stilwerk/chat-voice-en.yaml:4-5, 8, 12-13` — "the long-form writing profile"
- `stilwerk/chat-voice-de.yaml:4, 7, 12` — "das Langform-Schreibprofil"

Target side, unchanged and deliberately out of S8's scope:

- `stilwerk/default-voice-en.yaml:1,4` — `name: "Consulting & Strategy - Professional Voice"`
- `stilwerk/default-voice-de.yaml:1,4` — `name: "Consulting & Strategy (German)"`
- Neither file declares `scope:`. Verified by parsing all four with Ruby's Psych and with perl
  `YAML::XS`: the chat profiles' top-level key set is
  `[name, description, scope, whitelist, blacklist, examples, settings]`, the writing profiles'
  is `[name, description, whitelist, blacklist, examples, anti_examples, settings]`.
- Verified by `grep -i "chat\|kurzform\|short-form"` over both writing profiles: no match. Neither
  file names the other family at all, in either direction.

## Failure scenario

An agent in this repository's own configuration (chat `de`, artifacts `en`) is handed
`chat-voice-de.yaml` and `default-voice-en.yaml`. It reads the German chat profile, which says
long-form prose is governed by "das Langform-Schreibprofil". It opens the other emitted file and
finds a document that calls itself "Consulting & Strategy - Professional Voice" and declares no
scope. Nothing in that file confirms it is the thing the pointer meant. The match happens only
because `rules/agent-setup.md:48-50` says a `default-voice-*.yaml` path is the long-form writing
profile. Remove or reword that one sentence and the reference dangles.

Before the change there were two handles: the filename (exact) and, in German, "Beratungs-" against
the target's own "Consulting & Strategy". Both are now gone. That is the correct trade — the
filename had to go — but it makes the target file's silence load-bearing where it previously was
not.

## Proposed resolution — needs user approval before implementation

Give the writing profiles the reciprocal handle:

1. Add `scope: long-form` to both `default-voice-*.yaml`, mirroring `scope: short-form` in the
   chat profiles. **This is a schema change to the profile family and must not be made without
   the user's approval** — it adds a key to a file every consuming project holds a copy of.
2. Add one header comment line to each writing profile naming its role ("the long-form writing
   profile" / "das Langform-Schreibprofil"), so a plain text match succeeds. This half is a
   comment only and carries no schema risk.

Both are language-neutral, so neither re-introduces the coupling S8 removed. Applying only item 2
already closes the dangling-reference half.

## Severity

Low. The reference does resolve today, through a rule every agent reads at Setup before it reads
either profile. This is a robustness gap, not a live fault.

## Cross-references

- Plan: `fusion-workbench/archive/260817-1907-safe-cleanup-scoped/shared/planning/260807-2024_*_two-language-declarations.md` step S8
  ("`default-voice-*.yaml` carries no such pointer and is not touched")
- Rule: `rules/agent-setup.md` `## Voice profiles`
- Rule: `rules/fusion-workbench-conventions.md` `## Project language`
- Review: `fusion-workbench/shared/reviews/260807-2154-ontorev-chat-voice-sibling-reference-and-version-bump.md`

---

## Reconciliation 260808-0030 (reconciler, domain `code`) — stays `_o_`; every claim re-verified, no citation moved

Re-checked against `c54ead9`. Turn 2 touched no file under `stilwerk/` (last change there is
`b6bca62`, Turn 1), so the reference-side citations are as filed and were re-read line by line:

- `stilwerk/chat-voice-en.yaml:4-5, 8, 12-13` — "the long-form writing profile", three sites.
- `stilwerk/chat-voice-de.yaml:4, 7, 12` — "das Langform-Schreibprofil", three sites.
- `stilwerk/default-voice-en.yaml:1,4` and `default-voice-de.yaml:1,4` — the two `Consulting &
  Strategy` names, unchanged.
- `grep -n '^scope:'` over both writing profiles — no match; the `scope:` asymmetry holds.
- `grep -in 'chat\|kurzform\|short-form'` over both writing profiles — no match; neither family
  names the other from the writing side.
- `rules/agent-setup.md:48-50` — still the sentence the reference resolves through, still at that
  range. Turn 2 appended below it and inserted nothing above.

**One thing this session added, and it does not close the finding.** Turn 2's `22b0ba8` gave
`rules/agent-setup.md` a new paragraph at `:58-61` telling an agent that holds only the chat
profile to resolve the artifact language from `CLAUDE.md`. That addresses a different gap — the
seven agents with no writing profile at all — and adds no handle to the writing profile itself.
The dangling-reference half is exactly as filed.

Severity stays Low, and both proposed items still need user approval: item 1 is a schema change to
a file every consuming project holds.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: Neither `stilwerk/default-voice-en.yaml` nor `-de.yaml` declares a `scope:` key or carries the long-form-writing-profile phrase, so the reference still resolves only through `rules/agent-setup.md`. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.

---

## 260821-0100 (ontocoder, plan step 6) — item 2 landed; stays `_o_` for item 1

**Item 2 is done.** Both writing profiles now name their own role in their own text, so the
target side is no longer silent:

- `stilwerk/default-voice-en.yaml:3-8` and its `description:` — "This file is the long-form
  writing profile", with the artifacts it governs enumerated and the chat profile named as
  the surface it does not govern.
- `stilwerk/default-voice-de.yaml:3-9` and its `description:` — the same in German, naming
  the role `das Langform-Schreibprofil`, the exact phrase `chat-voice-de.yaml` uses. The
  English handle appears once as a parenthetical gloss in the comment, so the English term
  matches this file too. Neither file names the other's language.

**Item 1 stays open, and it is why this record keeps its `_o_` marker.** No `scope:` key was
added, by
`circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260820-2314_*_does-the-scope-key-go-into-the-two-long-form-writing-profiles.md`,
which chose option 2: the text handle alone, the key deferred. That decision was answered by
the orchestrator during an unattended run and is itself still open, so the schema question
reaches the user as a live question rather than as a change already made. Verified after this
edit: `grep -n '^scope:'` over both writing profiles exits 1, and each file's top-level key
set is unchanged at `[name, description, whitelist, blacklist, examples, anti_examples,
settings]`.

**One thing this edit does not close, and it was not in scope to.** The failure scenario in
this record is the cross-language pairing, chat `de` against artifacts `en`, which is this
repository's own configuration. An agent holding `chat-voice-de.yaml` reads "das
Langform-Schreibprofil" and opens `default-voice-en.yaml`, which now carries the English
handle but no German one. The German pointer still finds no plain-text match there. Closing
that needs either the English phrase added to `chat-voice-de.yaml` or both handles carried in
both writing profiles. Neither file was in step 6's scope.

Verification: `ruby -ryaml -e 'YAML.safe_load'` on both files, exit 0. `cd hooks && npm
test`, exit 0, 718 tests. Log:
`circles/260820-2051-style-rules-arrive-and-get-measured/history/260821-0100-ontocoder-writing-profiles-carry-the-handle.md`.
