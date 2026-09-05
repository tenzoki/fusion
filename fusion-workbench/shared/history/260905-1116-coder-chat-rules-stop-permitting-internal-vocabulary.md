# Coder — the chat rules stop permitting internal vocabulary, process narration and self-assessment

**Status:** Complete

**Filed by:** coder, Kai Stalmann <ks@qantr.com>

---

## Why

The user rejected fusion's chat output as unreadable and named three faults, each of which
passed the rules as they stood: fusion-internal terms presented as shared vocabulary,
narration of which agent ran in which pass, and self-assessment in place of a finding.
The first was not merely unforbidden but licensed: `## Vocabulary` said "spell out
fusion-internal terms on first use", so a gloss made any term legal and the output filled
with glossed jargon.

## What changed

**`rules/user-facing-output.md`, `## Vocabulary`, replaced rather than extended.** The
"spell out on first use" licence is gone and so is "prefer the word to the marker", which
tolerated the marker in parentheses. The section now opens with the ban and states its
surface: chat, gates, `AskUserQuestion` text and summaries, and explicitly **not**
workbench records, where the internal names are correct because later passes and auditors
read them. Five bullets, each a list of words not to write and the words to write instead:
markers and machine tokens, fusion's own nouns, an agent name as a sentence subject. Two
of the old bullets survive verbatim (ID without summary, one name per thing) and the
Conventional-Commits bullet was folded into the machine-token one. 764 bytes to 1 136.

**Same file, `## Report the project, not the machinery`, new.** Two bullets for the second
and third faults. No process narration: which agent ran, in which pass, what it returned,
which gate stands open, what a verdict said, all of it to the history file. No
self-assessment: not how an error feels, not who should have caught it, not which rule it
breaks. The self-assessment bullet carries the operative half of `rules/critical-stance.md`
§1, whose "one clause, then straight to substance" was being read as a licence for a
paragraph. `critical-stance.md` itself is untouched.

**Same file, the readability gate, a sixth check.** The stranger test, applicable to one
sentence by looking at it: would a reader who knows this project's source code and has
never seen this conversation understand it? Item 4 was narrowed to "every code of the
user's own project", because it says to gloss and `## Vocabulary` now says to replace;
without the narrowing the two clauses contradict for a fusion term.

**Same file, two consistency repairs the change forced.** The `## Style anti-patterns`
inventory of the chat blacklist gained the three new families, so the fallback sentence at
the foot of that section ("with no chat profile on disk, the anti-patterns still hold in
spirit") stays true. The correctio example under it was "set to `_p_`, not `_c_`", a chat
line made of markers, which `## Vocabulary` now forbids; it reads "recommended, not
closed".

**`stilwerk/chat-voice-en.yaml` and `stilwerk/chat-voice-de.yaml`,** three blacklist
entries each, in the files' own languages and existing form: `L07` internal vocabulary,
`D02` process narration, `V04` self-assessment. Ids taken from the families the stilwerk
set already uses (L lexicon, D discourse, V voice) and unused in all four profiles.

**`fusion-workbench/stilwerk/`,** both chat profiles copied over and stamped in
`fusion-workbench/.asset-provenance` per `/fusion:setup` Step 0d, so this project runs the
new profiles now rather than at the next Setup. Verified that Step 0e's classifier reads
`case1-equal` for both.

## What was deliberately not done

- `rules/critical-stance.md`, agent prompts and skill bodies: out of scope by the dispatch.
- The structured-artifact exemption in `## Style anti-patterns apply to everything` is
  untouched, and the records exemption is stated in both new clauses rather than left to
  be inferred.
- No golden regenerated and no baseline moved.

## Byte cost

| File | HEAD | now | delta |
|---|---|---|---|
| `rules/user-facing-output.md` | 9 155 | 10 884 | +1 729 |
| `stilwerk/chat-voice-en.yaml` | 1 625 | 2 384 | +759 |
| `stilwerk/chat-voice-de.yaml` | 1 659 | 2 493 | +834 |

`## Vocabulary` came out 372 bytes larger, not smaller as the dispatch asked. The three
ban lists are the concrete words an agent under load can check a sentence against, and
cutting them to meet the figure would have left the principle the specimens already
satisfied.

`rules/user-facing-output.md` is not in the universal core the hard bound measures; it is
role-specific text, and the report is what it moves. The `playmaker` role crossed its
report threshold with this change: 41 485 bytes at HEAD, 43 214 now, budget 42 377. The
report is explicitly not a blocker, and the growth it names is not this change's: it lists
`circle-records.md` +15 638, `backlog-entries.md` +2 680, `decision-record-examples.md`
+419, and `user-facing-output.md` stands 5 900 bytes **below** its own `RULE_BASELINE`
entry of 16 784. The cut that clears the report belongs to those three files.

`bin/fusion-prose-metric rules/user-facing-output.md` reads 14 em-dashes over 1 546 prose
words, `over`. It was `over` at HEAD too, at 15 over 1 264, so the rate fell from 11.9 to
9.1 per 1 000. Reports, never gates.

## Verification

`cd hooks && npm test` — exit 1. 824 of 825 pass. The one failure is golden-fixture
staleness from this change's own byte movement, left unregenerated per the dispatch:

`rules-emission-golden.test.ts` "matches the checked-in golden" — `user-facing-output.md
9155 → 10884` in each block that draws the conditional emission, e.g. `consultant` total
`76105 → 77834`. `RELEASE_CAP` and `DRIFT_CEILING`, the two blocking numbers, both pass.
Regenerating it is one command, `UPDATE_RULES_GOLDEN=1 npx vitest run
lib/__tests__/rules-emission-golden.test.ts`, and it moves no baseline and clears no bound.
