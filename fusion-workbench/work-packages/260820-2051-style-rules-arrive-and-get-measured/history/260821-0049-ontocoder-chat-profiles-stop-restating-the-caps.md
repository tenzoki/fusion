# The chat profiles stop restating what the rule owns

**Agent:** ontocoder
**Date:** 2026-08-21 00:49
**Circle:** `260820-2051-style-rules-arrive-and-get-measured`
**Plan step:** 5 of `260820-2324_*_plan-style-rules-arrive-and-get-measured.md`
**Status:** Complete

---

## What changed

The `C04` entry of both shipped chat profiles stated a number for two surfaces that
`rules/user-facing-output.md` `## Length` already owns: gate prompts at 6 lines, chat replies at 8,
against the rule's 8 and 12. Both numbers are gone. Each profile now names the rule and the section
and says the caps are not restated locally, which is user decision 5 of the Circle record: the
conflict resolves in favour of the rule, one number on one surface.

Nothing else in either file moved. No punctuation was touched, by the plan's own instruction: the
repunctuation of these four files is step 7 and is kept out of this diff so that a register change and
a content change never arrive together.

## The two files, clause by clause

This is the step's second acceptance criterion, and it is the one no test covers. The comparison was
made from the parsed YAML rather than from the text, so an ordering or nesting difference could not
hide behind matching prose.

**Structure.** Both files carry the same seven top-level keys in the same order (`name`,
`description`, `scope`, `whitelist`, `blacklist`, `examples`, `settings`), the same six whitelist ids
in the same order (C01, C02, C03, C04, C05, C06), the same nine blacklist ids in the same order
(AI02, AI01, AI05, AI06, AI04, AI07, AI08, L04, AI11), the same per-entry example counts
(whitelist 0/0/0/0/1/2, blacklist 2/6/2/5/0/2/3/3/6), two top-level examples each, and identical
`settings` (`fit_threshold: 0.85`, `max_iterations: 3`).

**Clause by clause.** Each row states the shared content; where the two files differ, the difference
is named and classified.

| Entry | Shared content | Difference |
|---|---|---|
| header comment | short-form chat surfaces named; complements `rules/user-facing-output.md`; not for long-form prose | none |
| `description` | terse and direct, plain words over codes, second person, no AI stock phrases, no em-dash chains, short-form companion to the writing profile | none |
| `scope` comment + `scope: short-form` | structured artifacts exempt, long-form prose uses the writing profile | none |
| C01 action first | open with what the reader does (decide, type, confirm, wait), reason after, say so plainly when there is nothing to do | the closing quotation uses an em-dash in English and a comma in German. Punctuation, and step 7's |
| C02 name the referent | no bare count or code without its referent, same two worked counts, workbench IDs only with their summary | none |
| C03 direct address | address the reader directly and consistently, no impersonal passive, same worked pair | German additionally names the `du` form. German must choose between `du` and `Sie` and English has no such choice, so this is the translation, not a divergence |
| C04 terse | keep it short; the caps live in `rules/user-facing-output.md` `## Length` and are not restated here; no sentence-length bands; details to the end or to a file, not the opening lines | none. This is the entry the step rewrote |
| C05 sketch structure | same four structure examples, prefer a small ASCII sketch, boxes and arrows over listed relations, ASCII in chat because the terminal renders it, Mermaid only for files rendered elsewhere, a sketch replacing a paragraph does not count against the line cap | none. The one example differs only in the words `ein A, viele B` / `one A, many B` |
| C06 one name per thing | one term per entity, no rotating synonyms, pick the most significant precise name, synonyms may be stated once on request; same avoid/better example pair | none |
| AI02 em-dash overuse | avoid the dash for parenthetical asides in chat too, use commas, parentheses or colons or two sentences, the telegraphic-with-parentheses pattern is the most common tell in gate prompts and option text; two examples each | German names the en-dash `–` as the Gedankenstrich, which is the German typographic convention for the same fault, and its second example uses that character while its first uses an em-dash. Punctuation, and step 7's |
| AI01 generic AI phrases | remove characteristic AI patterns; six examples each | the six examples are each language's own stock phrases rather than translations of the English six. That is what the entry is for |
| AI05 vague pronoun openers | avoid an unspecified back-reference as an opener, name the referent; two examples each | none |
| AI06 filler intensifiers | remove empty intensifiers; five examples each | none |
| AI04 mechanical triads | no three-part lists as the default rhythm, two or four when the count is justified | none |
| AI07 rhetorical question-answer pairs | no self-answered rhetorical questions, state it directly; two examples each | none |
| AI08 announcing structure | do not pre-announce rhetorical or structural moves; three examples each | none |
| L04 hollow abstractions | avoid abstractions replaceable by "stuff"/"Sachen" without loss, name the concrete thing; three examples each | none |
| AI11 sycophancy | do not praise the reader or their intuition, instinct, sense or questions; a direct "Yes."/"Ja." or the fact itself; no opening flattery; validating judgement reads as paternalistic; six examples each | none |
| top-level `examples` | the same before/after pair, the same counts inside it (8 redundant of 13, 5 genuinely dropped) | none |

The two clauses the German file had dropped are back: "in eine Datei" for "or to a file", and "nicht
in die ersten Zeilen" for "not the opening lines". The clause it had added alone, "Klare
Formulierungen, kein Jargon", is gone rather than mirrored into the English file, because it
duplicated `rules/user-facing-output.md` `## Vocabulary` and point 4 of its readability gate. The two
punctuation asymmetries in the table are the only differences left, and both are step 7's subject.

## Verification

| Check | Command | Result |
|---|---|---|
| no numeric line cap remains | `grep -nEi '[0-9]+ ?(lines\|zeilen)' stilwerk/chat-voice-*.yaml` | no cap; the surviving hits are `# Scope:` prose ("dashboard lines") and the wrapped words `opening lines` / `die ersten Zeilen` |
| the rule is cited | `grep -n 'user-facing-output.md' stilwerk/chat-voice-*.yaml` | both files, in C04 and in the header comment |
| no trailing whitespace | `grep -n '[[:space:]]$' stilwerk/chat-voice-de.yaml stilwerk/chat-voice-en.yaml` | exit 1, no match. It was one line before the change |
| both parse | `ruby -ryaml -e 'YAML.load_file(...)'` on both | parsed; key and id sets printed above |
| the suite | `cd hooks && npm test` | exit 0, 40 files, 718 tests |

`python3 -c "import yaml"` is unavailable on this machine, so the YAML check was run through Ruby's
bundled parser instead. It is a parse, not an assumption.

## The record this step closes, and what closing it does not claim

`260814-1419_*_the-tightened-chat-profile-caps-contradict-the-length-section-of-the-rule-that-owns-them.md`
named three parts and all three are repaired at the surface the record measured. Its own verification
grep read `rules/` and `stilwerk/`, which is the shipped text this step edited. Part 1 is the number,
now absent and replaced by the citation. Part 2 is the German file's divergence beyond translation,
now repaired in the direction the plan chose. Part 3 is the trailing space, gone with the clause that
carried it. The record is renamed `_o_` → `_c_` with a `Resolved:` note.

What closing it does not claim: the workbench copies every agent in this project actually loads still
carry the old text. That is deliberate. They are refreshed by the mechanism built in step 3 rather
than by hand, at step 8, which is what makes step 3 the thing that carries this change. The
divergence is the separate defect
`260814-1419_*_the-shipped-chat-voice-profiles-changed-and-the-workbench-copies-agents-actually-load-did-not.md`
and it stays open.

**One record whose premise this change moves without closing it.**
`260816-1330_*_the-override-record-names-the-shipped-chat-profiles-cap-and-the-copy-every-agent-loads-says-otherwise.md`
is about the shipped cap disagreeing with the loaded copy. The shipped files now name no cap at all,
so its first term no longer exists in the form the record states. Its subject is still the
workbench-copy divergence, so it is left untouched here rather than half-edited by a step whose file
list does not include it.

## The marker move reddened the citation gate, as its own decision says it would

Renaming the record turned `hooks/lib/__tests__/workbench-citation-lint.test.ts` red on four
citations that spelled the old marker literally. Under
`260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`
(option 1, and its `Implemented:` note) that is the gate working, and the remedy is the citation. All
four were starred to `_*_`:

- `260820-2249_*_spec-style-rules-arrive-and-get-measured.md:507`
- `260814-1419_*_the-shipped-chat-voice-profiles-changed-and-the-workbench-copies-agents-actually-load-did-not.md:43`
- `260816-1330_*_the-foreclosure-clause-does-not-say-whether-it-costs-a-line-per-option-and-the-cap-two-sections-below-forbids-relaxing.md:15`
- `260816-1330_*_the-override-record-names-the-shipped-chat-profiles-cap-and-the-copy-every-agent-loads-says-otherwise.md:15`

Two further files cite the record with the old marker and are outside the gate's corpus, so they were
left as written: the review that filed it,
`260814-1419-coderev-curator-turn-3.md:89`, and the curator run
log `260816-1251-curator-run.md:97`. Both are records of what was true when they were
written, and rewriting a history log to match a later rename would erase the sequence rather than
document it.

---

**Files changed**

- `/Users/k1/Projects/productive/fusion/stilwerk/chat-voice-de.yaml`
- `/Users/k1/Projects/productive/fusion/stilwerk/chat-voice-en.yaml`
- `/Users/k1/Projects/productive/fusion/260814-1419_*_the-tightened-chat-profile-caps-contradict-the-length-section-of-the-rule-that-owns-them.md` (renamed from `_o_`, `Resolved:` note appended)
- `/Users/k1/Projects/productive/fusion/260820-2324_*_plan-style-rules-arrive-and-get-measured.md` (step 5 marked `[DONE]`)
- the four citation repairs listed above
