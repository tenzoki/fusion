Step 6's acceptance criterion names a file the step does not touch, and is unreachable from inside it

---
Step 6 of this Circle's plan lists two files, the two long-form writing profiles. Its first
acceptance criterion is that `grep -ril "long-form writing profile" stilwerk/` names **all four**
profiles. The fourth, `stilwerk/chat-voice-de.yaml`, refers to its partner only in German, as "das
Langform-Schreibprofil", and is in no step's file list. No later step adds the phrase either: step 7
is repunctuation and changes no word. The criterion cannot be met by the step that carries it.

---

**Domain:** code
**Filed by:** orchestrator
**Cross-references:** `shared/issues/260807-2154_*_the-writing-profile-carries-no-handle-for-the-reference-that-now-points-at-it.md`

## How it surfaced

The ontocoder implementing step 6 did the work, checked the criterion, found it reached three of four
profiles, and declined to mark the step `[DONE]`. Marking it would have asserted an acceptance that
does not hold. The refusal is what surfaced the plan defect; a step marked done on a partial criterion
would have hidden it.

## The residual behind the criterion is real, and it is this repository's own configuration

`CLAUDE.md` declares chat `de` and artifacts `en`, so an agent here loads `chat-voice-de.yaml` and
writes long-form prose under `default-voice-en.yaml`. The German chat profile points at "das
Langform-Schreibprofil"; the English writing profile does not carry that German handle. The pointer
resolves for a reader who already knows which file is meant, which is the same defect the cited record
was filed about, one language pair further along.

Step 6 narrowed it rather than closing it: the German writing profile now names its role in German and
carries the English term once as a parenthetical gloss, so a search in either language finds it. What
is left is the one direction that crosses files.

## Two ways to close it, neither taken here

1. One clause in `stilwerk/chat-voice-de.yaml` carrying the English phrase.
2. Both handles in both writing profiles.

The first is smaller and is the one this Circle should take, in a commit of its own so that a word
change and the repunctuation of the same file never share a diff.

## Acceptance

- `grep -ril "long-form writing profile" stilwerk/` names all four profiles, or step 6's criterion is
  restated to name the three files that step can actually reach.
- The plan step's file list and its acceptance criterion agree about which files are in scope.
