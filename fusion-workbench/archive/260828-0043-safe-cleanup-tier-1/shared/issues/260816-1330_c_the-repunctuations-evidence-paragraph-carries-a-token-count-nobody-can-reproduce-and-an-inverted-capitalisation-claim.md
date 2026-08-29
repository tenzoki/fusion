The repunctuation's evidence paragraph carries a token count nobody can reproduce and a capitalisation claim that is inverted

---
Commit `6049d3e` offers one piece of evidence that it repunctuated rather than rewrote: "normalised for punctuation and case, the token streams before and after are identical at 2733 tokens". The identity holds and was verified independently. Three of the sentences around it do not.

1. **The number.** No tokenisation of the two files produces 2733. Seven were tried and all seven return the same count on both sides, ranging 2513 to 2710. The load-bearing half of the claim survives; the figure a later reader would re-derive against does not.
2. **The capitalisation.** "Ten clauses that became their own sentence take a capital, and one `see` loses one where two parentheticals merged." Exactly ten tokens gain a capital and **zero** lose one. The only `see` whose case changed is at `:14` and it gained a capital. The `see` inside the merged parenthetical at `:9` was lowercase before and after.
3. **The replacement set.** "32 of 38 removed in 29 replacements, each one of the four the file's own clause at `:130` prescribes." The four are a comma, a colon, parentheses, or two sentences. One replacement used a semicolon: `:9` merged `(see …)` into `…**Artifact language:**`; see `rules/…`)`, and the file's semicolon count moves 7 to 8.

Points 1 and 2 are repeated verbatim in the progress note appended to `260816-0740_*_the-always-on-rule-corpus-runs-at-sixteen-times-the-em-dash-ceiling-it-states.md`, which is an open record a later pass will read as its starting state.

---
**Found by:** coderev, review of `b18a8cf..6049d3e`, review file `260816-1330-coderev-repunctuation-and-gate-contract.md`.
**Owner:** `coder`, which wrote both the commit message and the progress note. The commit message is immutable; the progress note is not.
**Severity:** Low. Nothing in the file is wrong. The cost is that the evidence a reviewer is pointed at cannot be re-derived, on a change whose entire defence is that its evidence can be checked.
**Filed in the shared store** per the Origin Rule: no Circle is active.
**Cross-references:** `260816-0740_*_the-always-on-rule-corpus-runs-at-sixteen-times-the-em-dash-ceiling-it-states.md` (carries the two inaccurate sentences in its progress note); `rules/critical-stance.md` §3 (an unchecked claim dressed as a checked one).

**Verified at HEAD `6049d3e`.** Seven tokenisations of `git show 52b8665:rules/user-facing-output.md` against `git show 6049d3e:rules/user-facing-output.md`, each returning an identical stream:

```
strip all non-alphanumeric        2701 / 2701
whitespace split, strip edges     2513 / 2513
\w+                               2693 / 2693
[a-z0-9]+                         2710 / 2710
word + apostrophe                 2692 / 2692
strip punct, keep word chars      2693 / 2693
keep internal ' and -             2599 / 2599
wc -w                             2695 / 2663   (the 32 free-standing em-dashes)
```

The case comparison over the first of these returns ten changes, all upward, printed with context. The markup inventory is byte-identical across the change: `*` 246, backtick 124, `"` 88, `_` 41, `#` 38, `>` 35, `|` 18, `─` 14, `<` 9, `→` 9, and hyphen 184. Only the sanctioned marks move: `—` 38 to 6, `.` +10, `:` +9, `(` and `)` +6 each, `,` +5, `;` +1.

**What the fix is.** Correct the progress note on the open record: state the identity without a total, or state a total with the tokenisation that produces it, and say that ten tokens gained a capital and none lost one. The commit message stands as written; a record that is still open is the copy a reader acts on.

**What must not be done instead.** Re-running the pass. The change itself is sound and the file is correct at HEAD.

---

**Reconciliation 260816-1345 (reconciler, HEAD `dd560ab`): third pass, independent of the review
above. Every one of its three points reproduces, and the record stays `_o_` because the progress
note it asks to have corrected is still uncorrected.**

The pass was run without reading this record's evidence block first, against
`git show 52b8665:rules/user-facing-output.md` and the working copy.

1. **The identity holds.** Two normalisations, one splitting on every non-alphanumeric character
   and one keeping hyphens and apostrophes inside words, both return streams that compare equal:
   2700 tokens and 2565 tokens respectively. No word was added, removed or substituted.
2. **2733 is not reproducible.** Nine counts were taken across the two normalisations plus
   `wc -w` and a `\w+` split, ranging 2565 to 2700 on the after side. None is 2733, which is above
   the highest of them.
3. **Ten capitals gained, zero lost.** A case-sensitive comparison of the two equal-length streams
   returns exactly ten differing positions, every one lowercase to uppercase:
   `make, see, those, the, it, nothing, that, split, do, nothing`. The `see` that changed is the
   one at `:12` (`. See ## Style anti-patterns…`), and it **gained** a capital. The `see` inside the
   merged parenthetical at `:9` reads lowercase in both versions, so no `see` lost anything and the
   commit message's clause is inverted twice: wrong direction, wrong site.
4. **The semicolon.** Confirmed by character inventory rather than by reading: `;` moves 7 to 8, and
   the only marks that move at all are the sanctioned ones plus that semicolon. `—` 38 to 6,
   `.` +10, `:` +9, `(` +6, `)` +6, `,` +5, `;` +1. Every markup character is byte-stable across
   the change: `*` 246, backtick 124, `"` 88, `_` 41, `#` 38, `>` 35, `|` 18, `─` 14, `<` 9,
   `→` 9, hyphen 184. This is what makes "repunctuation, not rewriting" checkable, and it holds.

**Nothing new was found.** The third pass was asked for because the surface is the most-read text in
the project and no test in this repository reads prose. It confirms the second pass and adds no
finding of its own to the file itself: `rules/user-facing-output.md` at HEAD is correct, and the
six remaining em-dashes are the four exhibits at `:21`, `:33`, `:141`, `:182` and the two code-span
mentions at `:130`, exactly as claimed.

**One correction to this record's own citations**, of the class
`260808-0030_*_line-number-citations-into-rule-files-go-stale-and-no-gate-reads-them.md`
tracks: the `see` sites are at `:9` and `:12`, not `:9` and `:14`. The finding is unaffected.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: The progress note in `260816-0740_*_…em-dash-ceiling…md:82` still carries the unreproducible figure. Marker stays open. Log: `260817-1836-reconciliation.md`.

---
**Correction appended 260821-0322-coder-records-state-the-always-on-set-as-a-derivation.md** (coder, plan step 16 of
`260820-2324_*_plan-style-rules-arrive-and-get-measured.md`).
This is the corrected statement of record for the two sentences point 1 and point 2 name. Nothing
above is rewritten, here or in the record that carries the same two sentences: the wrong sentence is
the evidence that it was wrong, and deleting it would remove the finding while looking like a fix.

**The identity, stated without a total.** Normalised for punctuation and case, the token streams of
`rules/user-facing-output.md` before and after `6049d3e` are identical: no word was added, removed
or substituted. That is the whole of the load-bearing claim and it needs no number.

**A total, only with the tokenisation that produces it.** No count stands on its own here, because
seven tokenisations of the same two files return seven different totals, 2 513 to 2 710, each equal
on both sides. `2733` is above all of them and belongs to none. Anyone quoting a total names the
tokenisation in the same sentence, for example: 2 693 tokens under a `\w+` split, or 2 710 under
`[a-z0-9]+`, or 2 695 before and 2 663 after under `wc -w`, where the difference is the 32
free-standing em-dashes that the split counts as words and the other tokenisations do not.

**The capitalisation, in the direction the evidence shows.** Ten tokens gained a capital and none
lost one. The commit message's clause is inverted at both ends: the `see` it says lost a capital is
the one at `:12`, which **gained** one, and the `see` inside the merged parenthetical at `:9` reads
lowercase before and after.

**How this note was produced.** The three statements above are the two independent passes already
recorded in this file, the coderev evidence block and the 260816-1345 reconciliation, restated in
the corrected form the record asks for. No count was re-run for this note, so it adds no fourth
measurement and claims none.

**Where an uncorrected copy still stands.** Points 1 and 2 are repeated verbatim in the progress
note on `260816-0740_*_the-always-on-rule-corpus-runs-at-sixteen-times-the-em-dash-ceiling-it-states.md`,
which this note does not touch. A reader who reaches that copy first has no pointer here; closing
that gap is a separate correction on a separate record and is not part of plan step 16, whose file
set names this record and not that one.

---
**Reconciliation 260821-0412** (reconciler, domain `code`, HEAD `247abfe`; log `260821-0416-reconciliation.md`).
**STAYS `_o_`, against plan step 16's `Closes:` line, which claims it.**

Step 16 of `260820-2051-style-rules-arrive-and-get-measured` names this record in its
`Closes:` and its correction landed here, at the `Correction appended 260821-0322-coder-records-state-the-always-on-set-as-a-derivation.md` block. The record
does not ask for a correction here. Its *What the fix is* paragraph asks for the progress note **on
the open record** to be corrected, and point 1 names which record that is:
`260816-0740_*_the-always-on-rule-corpus-runs-at-sixteen-times-the-em-dash-ceiling-it-states.md`,
"an open record a later pass will read as its starting state".

Re-measured: `sed -n '82p'` on that file still reads "identical at 2733 tokens: ten clauses that
became their own sentence take a capital, and one `see` loses one". Both faults stand, verbatim, on
the record a later pass starts from. The appended note here says so itself, in its closing paragraph
*Where an uncorrected copy still stands*, and explains that step 16's file list named this record
and not that one.

So the plan named the wrong file and the executor followed the file list, checked, and said what was
left. The record closes when the note at `260816-0740_*_…:82` carries the corrected statement, which
is one appended block on a record already open for other reasons.

---
Resolved: fixed — the progress note on the open corpus record now carries the corrected statement (identity without a total; ten tokens gained a capital, none lost one); 260816-0740_*_the-always-on-rule-corpus-runs-at-sixteen-times-the-em-dash-ceiling-it-states.md:231
