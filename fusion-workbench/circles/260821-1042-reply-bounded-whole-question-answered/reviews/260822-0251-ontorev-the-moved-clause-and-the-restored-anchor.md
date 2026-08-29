# The moved clause and the restored anchor

**Reviewed-range:** `dbf259a..d6b867e`
**Not-opened:** `260821-1042-reply-bounded-whole-question-answered`, `260821-2020-reply-length-baseline.md`, `260822-0010-measurement-briefing-does-the-rule-change-shorten-a-reply.md`, `260822-0035-three-before-figures-and-the-after-measurement-defined.md`, `260821-2004_*_what-happens-to-the-directive-when-the-plan-a-circle-runs-on-deliberately-does-not-state-one.md`, `260821-1812-planner-the-plan-for-the-bounded-reply.md`, `260821-2020-analyst-the-reply-length-baseline-is-frozen.md`, `260821-2108-coder-regenerate-two-golden-fixtures-after-step-2.md`, `260821-2132-ontocoder-two-register-habits-in-four-profile-files.md`, `260821-2145-coder-the-cut-that-pays-for-steps-2-and-3.md`, `260822-0019-orchestrator-session.md`, `260822-0035-analyst-three-before-figures-and-the-after-measurement.md`, `260822-0142-coder-the-plan-closes-and-three-records-with-it.md`, `260822-0217-coder-two-commands-in-workbench-documents-corrected.md`, `260822-0234-reconciliation.md`, `260821-2204_*_the-c05-cut-traded-self-contained-text-for-citations-on-a-surface-no-gate-reads.md`, `260821-2204_*_a-growth-bound-lost-half-its-head-room-against-a-stated-stopping-criterion-and-the-finding-lives-only-in-a-history-log.md`, `260821-2349_*_closing-the-plan-and-the-verbosity-record-dangles-seventeen-marker-literal-citations.md`, `260822-0035_*_the-briefings-contamination-grep-marks-49-of-72-transcripts-primed-because-the-setup-skill-body-names-the-files-it-greps-for.md`, `260822-0116_*_commit-e202016s-message-attributes-to-a-log-a-figure-the-log-never-carried.md`, `260822-0116_*_the-after-runs-records-per-session-arm-names-a-join-between-transcripts-and-session-stamps-that-does-not-exist.md`, `260822-0116_*_the-contamination-command-reads-a-scratch-directory-it-never-clears.md`, `260822-0116_*_the-fold-of-the-version-gap-records-dropped-the-fusion-rules-half-and-the-closure-note-says-nothing-was-lost.md`, `260822-0116_*_the-head-room-correction-left-two-figures-for-one-quantity-in-adjacent-clauses.md`, `260822-0116_*_the-report-uses-session-for-two-different-units-and-section-7-compares-counts-across-them.md`, `260822-0122_*_c04s-name-covers-three-of-its-four-sentences-and-the-fourth-belongs-to-c01.md`, `260822-0234_*_the-session-log-stops-one-commit-and-one-turn-short-and-its-head-still-says-the-directive-is-unresolved.md`, `260821-1805_*_plan-reply-bounded-whole-question-answered.md`, `260821-2210-ontorev-two-register-habits-in-the-four-chat-voice-profiles.md`, `260822-0116-coderev-the-measurement-report-reproduces-and-its-after-run-does-not.md`, `260822-0121-ontorev-the-c06-rename-and-the-respelled-pointers.md`, `260801-1020_*_plane-mirror-circle-closed-with-empty-turn-log.md`, `260810-1820_*_an-executor-verified-a-gate-by-mutating-a-file-another-executor-held-in-the-live-tree.md`, `260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md`, `260821-2206_*_the-german-voice-profiles-name-en-dash-as-the-character-to-avoid-while-every-other-surface-counts-em-dash.md`, `260821-2207_*_the-rules-inventory-of-the-chat-profile-names-eight-of-nine-blacklist-entries-and-four-of-six-whitelist-entries.md`, `260822-0026_*_forty-eight-commits-stand-behind-the-manifest-version-so-two-bin-helpers-are-unreleased-and-one-is-absent-from-every-install.md`, `260822-0035_*_two-installed-copies-report-the-same-version-and-differ-in-which-bin-helpers-they-carry.md`, `260822-0115_*_the-german-chat-profile-names-the-referent-three-ways-where-the-english-names-it-once.md`, `260822-0118_*_ai04-denotes-two-different-rules-in-the-two-profiles-a-prose-agent-loads-together.md`, `260822-0119_*_the-prose-metrics-worked-exhibit-reports-six-em-dashes-in-a-file-that-carries-four.md`, `260822-0120_*_the-german-blacklist-forbids-an-ordinary-connective-where-the-english-forbids-a-discourse-marker.md`

**Filed by:** ontorev
**Domain:** data
**Circle:** 260821-1042-reply-bounded-whole-question-answered
**Commit in scope:** `746ae4d` "C04's fourth sentence moves to the entry that owns its subject, and its section pointer returns"

---

## Summary

The four shipped profile files are clean. Both plugin/workbench pairs are byte-identical, all
four parse, every byte figure the commit claims is exact, `C01` still reads as one subject after
gaining the sentence, `C04` reads whole with three, the restored anchor resolves, and the German
is German. Two findings, both in the commit's **records** rather than in its text: a verified
scope claim about moved citations that misses four of them, and an argument verified against the
English file and applied to the German one, where its premise is false.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 1 |
| Low | 1 |

## What was checked and passed

**Both pairs byte-identical, all four parsing.** `diff -q` reports no difference on either pair.
`ruby -ryaml` loads all four; each yields 6 whitelist and 9 blacklist entries. No trailing
whitespace, no tabs, wrap widths even at 70 to 80 columns through both edited entries.

**The byte claim is exact.** `git show 53ff99f:<path> | wc -c` against the tree:

```
stilwerk/chat-voice-en.yaml                    6751 -> 6743    −8
fusion-workbench/stilwerk/chat-voice-en.yaml   6751 -> 6743    −8
stilwerk/chat-voice-de.yaml                    7316 -> 7306   −10
fusion-workbench/stilwerk/chat-voice-de.yaml   7316 -> 7306   −10
```

Each file is net negative on its own side. Line counts are 183 English and 186 German, unchanged.
English line *numbering* is unchanged: a `diff` over the `id:` lines of the two English versions
is empty. Nothing was taken from the always-on rule corpus, which the commit does not touch.

**`C01` still reads as one subject.** The entry is an ordering and its whole content is that
ordering: open with the action, reason after, details last. It already carried the second slot
("Reason comes after") before this commit and nobody filed it, so the third slot extends the
dimension the name already covered rather than introducing a new one. This is not a fourth
instance of the AI04/C06/C04 defect, where a name stated one dimension and the instruction stated
a second. It also lands where `rules/user-facing-output.md` `## Information architecture (in this
order)` puts it, as points 1, 2 and 4 of the same list.

The dropped negation ("not the opening lines") costs nothing in `C01`: the entry's first sentence
claims the opening for the action, so the negation would have been the entry's own subject
restated, which `C06` forbids. That reasoning is the record's and it holds on reading.

**`C04` reads whole with three sentences.** Keep it short; the caps are stated elsewhere; do not
enforce sentence-length bands. No dangling connective, no orphaned example, and the entry has no
`examples:` key to orphan. The name covers all three.

**The restored anchor resolves.** `## Length` stands at `rules/user-facing-output.md:99`, in a
file of 20 142 bytes under nine `##` headings, three of which could plausibly carry a line cap.
The distinction from `C05` holds **in English, exactly**: `rules/user-facing-output.md:34` and
`stilwerk/chat-voice-en.yaml:46` are the same string character for character, so `C05`'s anchor
carried nothing. In German it does not hold as stated, which is finding 2.

**The German reads as German.** The clause that moved into `C01`
(`Erst danach die Begründung, Details ans Ende oder in eine Datei.`) is the wording the German
file already carried in `C04`, gapped on `kommen` in both halves, which is ordinary telegraphic
instruction register and matches the rest of the file (`Kurz halten.`,
`Bei Struktur eine kurze ASCII-Skizze statt Prosa.`). `stehen in X unter "## Length"` is idiomatic
and takes no comma before `und werden`. Nothing here adds a third instance to the two open calqued-
German records, and neither of those is restated in this review.

The ragged wrap the previous review noted at `stilwerk/chat-voice-de.yaml:44` is gone. Confirmed:
the German `C04` instruction now runs 79/70/80/28 columns with no short line mid-paragraph.

## Findings

### Medium: the line shift moved four citations the two surveying notes do not name

`260822-0251_*_the-german-line-shift-moved-four-citations-in-three-further-records-and-neither-note-names-them.md`

German lines 22 to 45 moved down by one, correctly measured. Both `260822-0122_*_c04s-name-covers-three-of-its-four-sentences-and-the-fourth-belongs-to-c01.md:135-137` and
`260822-0200-ontocoder-c04s-fourth-sentence-moves-and-its-section-pointer-returns.md:71-73` then state that the affected citations reach only two closed
records and two review files, and `260822-0122_*_c04s-name-covers-three-of-its-four-sentences-and-the-fourth-belongs-to-c01.md` states it under a **Verified.** heading. Four
citations in three further records were exact at `53ff99f` and are one line off now, two of the
three records open: `260822-0115_*_` (`:24` twice and a bare `:26`),
`260821-0146_*_the-four-voice-profiles-are-shipped-text-every-agent-loads-and-no-lint-gate-reads-them.md` (`:41-43`), and
`260816-0740-rhetorical-register-of-agent-output.md` (`:23` and `:31`). The pointers are cheap to recover because
each citing record quotes its target string. The durable defect is the claim, which a closing
Circle will not revisit.

The record also names one citation that looks like a fifth instance and is not one
(`260816-1330_*_:6`, stale in content since `5ed284d` and not this commit's).

### Low: the anchor split is verified in English and asserted for German

`260822-0252_*_the-c04-c05-anchor-split-is-verified-in-english-and-asserted-for-german-where-its-premise-is-false.md`

"C05's anchor was character-for-character C05's own `name:` field" is true of
`stilwerk/chat-voice-en.yaml:46` and false of `stilwerk/chat-voice-de.yaml:48`, where the removed
anchor was the **English** heading and the German name field is a translation of it. The
originating record verified the claim against the English file and said so; the resolution note
dropped the qualifier and applied it to four files.

Separately, `dbf259a` counted it a gain that it "removed an English heading string sitting inside
German prose", and the review at `260822-0121-ontorev-the-c06-rename-and-the-respelled-pointers.md:133-136` endorsed that half specifically.
German `C04` now reads `unter "## Length"`, putting one back. That is defensible, because the heading
exists in no other language, but it is not argued anywhere, and both records price the anchor at
"+18 in both languages" as though the two files pay the same thing.

The record proposes **no change to the four profiles**, only an appended note. Restoring German
`C05`'s anchor would trade a written-down reason for a byte cost the budget has already spent.

## Recommended sequencing

1. `260822-0251_*_` first, and its part 2 before this Circle closes: `260822-0115_*_`
   is next to be worked and its whole argument is anchored to two lines that moved.
2. `260822-0252_*_the-c04-c05-anchor-split-is-verified-in-english-and-asserted-for-german-where-its-premise-is-false.md` is an appended paragraph on a closed record and can go with any later pass.

Neither finding blocks the Circle. Both are record corrections; the shipped text is correct as it
stands.

## What I did not verify

The other six commits in the range touch workbench records only and were outside the dispatch.
I did not open them and they are named in `**Not-opened:**` above; no reviewer has opened them
either, and `bin/fusion-review-coverage` will say so.

I did not run `npm test`. The commit's history file reports it green at 40 files and 718 tests,
and no gate in this repository reads `stilwerk/`, so the claim is plausible and unchecked here.
