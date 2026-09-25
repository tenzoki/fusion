# Step 6: the writing profiles carry the handle their siblings point at

**Agent:** ontocoder
**Date:** 2026-08-21
**Status:** Complete, with one acceptance criterion not met as written
**Plan:** `260820-2324_*_plan-style-rules-arrive-and-get-measured.md` step 6
**Decision read first:** `260820-2314_*_does-the-scope-key-go-into-the-two-long-form-writing-profiles.md`
**Issue:** `260807-2154_*_the-writing-profile-carries-no-handle-for-the-reference-that-now-points-at-it.md`, item 2 only

## What changed

Two files, both plugin source. The workbench copies are deliberately untouched; step 8
refreshes them by running the mechanism.

`stilwerk/default-voice-en.yaml`
- Header comment gains a paragraph stating the file's role: it is the long-form writing
  profile, it governs narrative artifacts (session summary bodies, consultant replies,
  analyst reports, playmaker briefings, prose sections of specs and plans), and short-form
  chat is governed by the chat profile instead.
- `description:` gains one sentence carrying the same handle.

`stilwerk/default-voice-de.yaml`
- The same paragraph in German, naming the role as `das Langform-Schreibprofil`, which is
  the exact phrase `chat-voice-de.yaml` uses for it. The canonical English handle appears
  once, as a parenthetical gloss inside that comment, so a search for the English term
  finds this file too.
- `description:` gains one sentence, in German only.

The file data stays German in the German profile. Only the comment carries the English
gloss.

## What was deliberately not done

- **No `scope:` key**, per the decision above. Verified after the edit: `grep -n '^scope:'`
  over both files exits 1. The top-level key set of each file is unchanged, confirmed by
  parsing: `[name, description, whitelist, blacklist, examples, anti_examples, settings]`.
- **No repunctuation.** Both files carried two em-dashes before this change and carry two
  after. The new text introduces none. The repair pass is step 7.
- **No edit to either chat profile**, which is what makes acceptance criterion 1 fall
  short. See below.

## Acceptance

1. `grep -ril "long-form writing profile" stilwerk/` names **three of four** profiles, not
   four: `default-voice-en.yaml`, `chat-voice-en.yaml`, `default-voice-de.yaml`. The
   missing file is `chat-voice-de.yaml`, which refers to its sibling as `das
   Langform-Schreibprofil` and has never contained the English phrase. It is not in step
   6's Files list, and no other step in the plan adds the phrase to it: step 7 is
   repunctuation and changes no word. The criterion as written therefore cannot be reached
   from inside this step. The step is left unmarked in the plan for that reason.
2. Neither writing profile gained a `scope:` key. Verified, `grep -n '^scope:'` exits 1 on
   both.
3. Both files parse as YAML. Verified with Ruby Psych `YAML.safe_load`, exit 0, both key
   sets printed and unchanged.

## Verification

- `ruby -ryaml -e '...YAML.safe_load...'` over both files: exit 0.
- `cd hooks && npm test`: exit 0, 40 test files, 718 tests passed.
- No whole-tree git command was run. The only git call was `git diff -- stilwerk/`.

## The gap worth a second look

The plan's criterion 1 assumes one canonical English handle across all four profiles. The
issue record's own proposed resolution assumes the opposite: a per-language handle, the
English phrase in the English file and `das Langform-Schreibprofil` in the German one.
Those two designs disagree, and neither closes the cross-language pairing on its own. This
repository runs chat `de` with artifacts `en`, so its own agents hold `chat-voice-de.yaml`
next to `default-voice-en.yaml`, and the German pointer still finds no German handle in the
English file. Closing that fully means either the English phrase in all four files, which
needs one clause in `chat-voice-de.yaml`, or both handles in both writing profiles. Neither
is inside this step's scope. Reported to the user rather than decided here.
