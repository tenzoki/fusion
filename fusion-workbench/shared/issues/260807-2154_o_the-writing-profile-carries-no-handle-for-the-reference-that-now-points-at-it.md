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

- Plan: `fusion-workbench/shared/planning/260807-2024_c_two-language-declarations.md` step S8
  ("`default-voice-*.yaml` carries no such pointer and is not touched")
- Rule: `rules/agent-setup.md` `## Voice profiles`
- Rule: `rules/fusion-workbench-conventions.md` `## Project language`
- Review: `fusion-workbench/shared/reviews/260807-2154-ontorev-chat-voice-sibling-reference-and-version-bump.md`
