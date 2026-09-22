# Is the rename→citation obligation dissolved, now that the mandated citation form stales nothing?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260816-0119_*_can-anything-carry-the-rename-to-citation-obligation-when-a-record-marker-moves.md` (the record this one replaces); `260806-0015_*_zitierform-fuer-workbench-records.md` (the wildcarded citation form); `260830-1816_*_do-the-frozen-stores-enter-the-sweeps-and-the-checkers-corpus-the-way-the-live-tree-does.md` and `260831-0032_*_which-mechanism-enumerates-a-declared-citation-path-and-what-happens-where-git-will-not-answer.md` (the sweep that rewrites shipped text, and the corpus it runs over); `260922-1859-curator-run.md` (the survey that raised the contradiction, section `## 3a`)

---

## Question

`260816-0119_*_can-anything-carry-the-rename-to-citation-obligation-when-a-record-marker-moves.md` asked who carries the obligation to follow a record's marker rename into the text that cites it. It was answered on 2026-08-16 with option 1, nothing new: the reference lint stays the whole mechanism, and the answer's stated ground was that no fusion mechanism rewrites shipped text.

Two things have moved since, and each on its own reaches that record.

**The obligation has no subject left.** `rules/fusion-workbench-conventions.md` `## Filename Patterns` now mandates the wildcarded form, `YYMMDD-HHMM_*_<topic>.md`, for every citation of a marked record. A citation written in the mandated form names no marker, so a marker rename stales nothing and there is nothing for a carrier to carry. The question the old record poses can still be read, but it no longer describes anything that happens.

**Its stated ground is false at HEAD.** `bin/fusion-citation-sweep` rewrites citations across a declared corpus, and `fusion.json` declares `citations.extraPaths` as `bin/*`, `hooks/*.ts`, `hooks/*.mjs` and `hooks/lib/*.ts`, all of it shipped text. Two sentences in the rule corpus describe that rewriter as normative: `rules/fusion-workbench-conventions.md` `## Marker globs` and the same file's `## Terminal states are history`. An agent holding the old record's clause and those two sentences cannot obey both.

The old record was also the only member of the class named in its own reconciliation notes: an answer to build nothing, which no commit or path can be cited as realising, so it could never reach the implemented state under the rule as written. That is the third reason it needs settling rather than another reconciliation note.

## Options

1. **Annotate the old record as retired and leave it answered.** A `Retired:` line naming the sweep and the mandated form, no rename.
   - Pros: one line, no new record; the old text stays readable beside the annotation.
   - Cons: the record stays permanently unrealisable, which is the condition its own notes flag three times; a reader still meets the false clause as the record's live answer.
2. **Supersede it with this record.** This record carries the dissolution, the old one is marked superseded and cites it.
   - Pros: the question is closed rather than annotated; the false clause stops standing as a live answer; the supersession is a concrete edit at a commit, so this record can itself be realised and the class-of-one trap does not recur here.
   - Cons: one more record in the store.
3. **Leave both sides alone.** The contradiction stays and every survey reports it again.
   - Pros: nothing is written on a judgement about a record two years of notes declined to make.
   - Cons: the recurring report is the cost, and the false clause keeps binding whoever reads it as written.

## Constraints

- The old record's `Answered:` line is not edited. It records what the user answered on 2026-08-16, and rewriting it would erase the reversal instead of pointing at it (`rules/fusion-workbench-conventions.md` `## Inline State Tracking`).
- Nothing here reopens what option 1 of the old record chose. No mechanism is built for stale marker citations, and the reference lint stays the whole mechanism for them.
- The two rule sentences describing the sweep are true and are not touched.

## Answer

**Option 2.** The obligation is dissolved: the mandated citation form names no marker, so a rename stales nothing and no carrier is owed. The clause "No fusion mechanism rewrites shipped text" is retired with it — `bin/fusion-citation-sweep` rewrites shipped text, under its own decisions, for store-prefixed citations rather than for marker renames.

What survives unchanged from the old record: no mechanism is built for stale marker citations, and the reference lint remains the whole mechanism for them. What does not survive is the ground the old answer rested on, and the obligation the question was about.

---
Answered: 260922-2125_*_is-the-rename-to-citation-obligation-dissolved-now-that-the-mandated-form-stales-nothing.md `## Answer` — option 2: the obligation is dissolved and the shipped-text clause retired with it; the old record is superseded by this one; ruled by user, Kai Stalmann <ks@qantr.com>.
