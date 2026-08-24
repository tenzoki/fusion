The repunctuation's evidence paragraph carries a count that does not reconcile with its own table

---

`circles/260820-2051-style-rules-arrive-and-get-measured/history/260821-0112-ontocoder-gloss-and-repunctuation-of-the-four-profiles.md`, section "On strength, the second record's fault":

> Five of the six English replacements are the appositive or explanatory case that record prescribes a colon for; none took the comma it names as the defect. The three on line 86 are commas, and are the one place where the choice was not forced.

Commit `02ea2bd` repeats it: "five of the six English replacements are the appositive case the earlier report prescribes a colon for; the sixth departs from the German parallel deliberately".

**The same record's own table gives six English replacements: three colons and three commas.** `chat-voice-en.yaml:4`, `:11` and `:21` are colons; `:86` is three commas. Five cannot be the colon case when only three are colons, and "the three on line 86 are commas" plus "five … are the colon case" is eight against a stated six.

The intended reading is probably that `:4`, `:11` and the two writing profiles' untouched state, or `:4`, `:11` and `:21` with `:21` singled out for departing from the German comma, add up differently than written. Whichever it is, the paragraph as it stands cannot be checked, and it is the paragraph that discharges one of the two criteria the pass was measured against.

**The finding under it is correct and this record does not dispute it.** Judged independently, seven of the eight replacements take the mark the precedent prescribes: an explanatory or appositive break takes a colon (`shared/issues/260816-1330_o_two-of-the-twenty-nine-replacements-chose-a-mark-weaker-than-the-clause-it-replaced.md`, the `:112` finding), and `chat-voice-en.yaml:4`, `:11`, `:21` and `chat-voice-de.yaml:4`, `:11` all do. The eighth, the three commas at `chat-voice-en.yaml:86`, is the real cost and is filed separately. So the verdict holds; only the arithmetic offered for it does not.

**Same class as an already-open record.** `shared/issues/260816-1330_o_the-repunctuations-evidence-paragraph-carries-a-token-count-nobody-can-reproduce-and-an-inverted-capitalisation-claim.md` is the previous instance, from the previous repunctuation pass, and it is still `_o_`. Two passes, two unreproducible counts in the evidence paragraph.

**One argument in the same paragraph is also stated too strongly**, and it is worth correcting in the same edit: "A pronoun opener can only be created by splitting a sentence, and no replacement here did." A colon creates no sentence and can still be followed by a bare demonstrative. The record's own next sentence concedes exactly that ("The clauses that follow a new colon do open with `they`, `that`, `sie` and `dafür`") and then gives the argument that actually works: none of the four words was written by this pass, and each has a concrete antecedent in the same sentence. Verified independently — all four pronouns are present in the pre-change text and none is new. The conclusion is right; the universal above it is not.

**Verified at HEAD `7832553`** by reading the history record's table against `git diff 7135a19..HEAD -- stilwerk/chat-voice-en.yaml stilwerk/chat-voice-de.yaml`, and by checking each of the eight replacement sites for the word following the new mark in both the before and after text.

---
**Found by:** coderev, review of `7135a19..7832553`, review file `circles/260820-2051-style-rules-arrive-and-get-measured/reviews/260821-0145-coderev-turn-1-prose-metric-setup-step-0e-and-the-repunctuation.md`.
**Owner:** `ontocoder` — it is that agent's own history record, and the correction is two sentences of it.
**Severity:** Low. Nothing in the shipped text is wrong. The cost is that the record discharging a criterion cannot be re-derived from itself, in a project that has an open record about the same failure from the previous pass.
**Cross-references:** `circles/260820-2051-style-rules-arrive-and-get-measured/issues/260821-0147_o_the-english-em-dash-entry-lost-its-inline-demonstration-and-the-german-one-still-breaks-its-own-rule.md`.

---
Resolved: fixed — the history record carries the appended correction, three colons and three commas; circles/260820-2051-style-rules-arrive-and-get-measured/history/260821-0112-ontocoder-gloss-and-repunctuation-of-the-four-profiles.md:183
