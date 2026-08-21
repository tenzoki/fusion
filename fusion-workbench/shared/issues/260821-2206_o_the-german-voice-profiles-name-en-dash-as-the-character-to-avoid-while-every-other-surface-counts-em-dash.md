The German voice profiles name EN DASH as the character to avoid, while every other surface counts EM DASH

---

**Severity:** Low
**Domain:** data
**Filed by:** ontorev, noticed beside step 4 of `circles/260821-1042-reply-bounded-whole-question-answered/planning/260821-1805_o_plan-reply-bounded-whole-question-answered.md`; the AI02 entries are not part of that change
**Affects:** `stilwerk/chat-voice-de.yaml:80-89`, `stilwerk/default-voice-de.yaml:140-146`, and both `fusion-workbench/stilwerk/` copies

---

## What is wrong

`stilwerk/chat-voice-de.yaml:82` instructs:

> Gedankenstriche (–) für parenthetische Einschübe vermeiden, auch im Chat.

The character in those parentheses is U+2013 EN DASH. Every other surface that names or
counts the fault means U+2014 EM DASH:

- `bin/fusion-prose-metric` counts U+2014 and, per its own header, never U+2013.
- `rules/user-facing-output.md:132` says "Scan for `—`", which is U+2014.
- `stilwerk/default-voice-en.yaml:145` writes "Avoid em-dashes (—)", U+2014.

The German file also disagrees with itself. Measured character by character:

| Line | U+2014 | U+2013 |
|---|---|---|
| `chat-voice-de.yaml:82` (the instruction's own exhibit) | 0 | 1 |
| `chat-voice-de.yaml:84` (the pattern sketch) | 0 | 3 |
| `chat-voice-de.yaml:88` (first example) | 2 | 0 |
| `chat-voice-de.yaml:89` (second example) | 0 | 2 |
| `chat-voice-de.yaml:166`, `:175` (AI11, the file-level example) | 2 | 0 |

So AI02's two examples exhibit two different characters, and the one the instruction names
is the one the measurement ignores. `stilwerk/default-voice-de.yaml:143` carries the same
`(–)`, so the mismatch is the German family's, not one file's.

## Why it matters

An agent applying the German profile literally avoids U+2013 and is told nothing about
U+2014, which is the character the ceiling in `rules/user-facing-output.md:132` and the
metric both govern. The English profiles have no such gap.

Both German chat profiles currently measure clean anyway (`bin/fusion-prose-metric
stilwerk/chat-voice-de.yaml` reports 0 em-dashes in 605 prose words), so nothing is red
today. This is a wrong instruction, not a failing measurement.

## What to do

Replace `(–)` with `(—)` in `stilwerk/chat-voice-de.yaml:82` and
`stilwerk/default-voice-de.yaml:143`, mirror both into `fusion-workbench/stilwerk/`, and
make AI02's second example (`chat-voice-de.yaml:89`) use U+2014 like its first. Same byte
count in each case; U+2013 and U+2014 are both three bytes in UTF-8.

If the intent was that German should avoid **both** dashes, say so in words rather than by
printing one of them, and note that the metric will then be measuring half the rule.

---
**Reconciliation 260821-2349** (reconciler, HEAD `9a68760`). **Confirmed open and untouched.**
`stilwerk/chat-voice-de.yaml:82` still reads "Gedankenstriche (–)" with U+2013, and
`stilwerk/default-voice-de.yaml:143` carries the same character. AI02's second example at
`chat-voice-de.yaml:89` still uses U+2013 where its first uses U+2014. Turn 3 rewrote AI04 in the
same file and did not reach AI02, which is what this record predicted. Both German profiles still
measure zero em-dashes, so nothing is red.
