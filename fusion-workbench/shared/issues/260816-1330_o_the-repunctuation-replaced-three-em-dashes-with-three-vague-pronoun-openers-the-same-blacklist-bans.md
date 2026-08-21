The repunctuation replaced three em-dashes with three vague pronoun openers, which is the next entry on the same blacklist

---
Commit `6049d3e` turned ten clauses of `rules/user-facing-output.md` into their own sentences. Three of the ten now open with a bare demonstrative or pronoun: `:22` "Those belong to the long-form writing profile", `:57` "It *is* the shorter form", `:83` "That forces the reader to keep proving the names refer to the same object".

`rules/user-facing-output.md:18`, four lines above the first of them, lists "vague pronoun openers" among the chat profile's blacklist, and `fusion-workbench/stilwerk/chat-voice-de.yaml:104-112` (AI05) bans a sentence that opens with an unspecific back-reference. The whole argument for the repunctuation, stated in `shared/issues/260816-0740_o_the-always-on-rule-corpus-runs-at-sixteen-times-the-em-dash-ceiling-it-states.md`, is that a model follows the register of its conditioning text more reliably than a numeric clause inside that text. If that argument holds for the em-dash it holds for the opener, and the pass moved one blacklisted figure into another rather than out of the file.

---
**Found by:** coderev, review of `b18a8cf..6049d3e`, review file `shared/reviews/260816-1330-coderev-repunctuation-and-gate-contract.md`.
**Owner:** `coder` for the three marks; the change is repunctuation of the same class the original pass performed and needs no rewording.
**Severity:** Low-Medium. Nothing is broken. The cost is that the always-on file still exhibits a figure it names as an anti-pattern, on the exact surface whose conditioning effect is the motivating defect's own premise.
**Filed in the shared store** per the Origin Rule: no Circle is active.
**Cross-references:** `shared/issues/260816-0740_o_the-always-on-rule-corpus-runs-at-sixteen-times-the-em-dash-ceiling-it-states.md` (the parent register defect, still `_o_`); `shared/analyses/260816-0740-rhetorical-register-of-agent-output.md` finding 10.

**Verified at HEAD `6049d3e`.** A case-sensitive comparison of the normalised token streams shows exactly ten tokens gaining a capital and none losing one. Three of the ten are `those`, `it` and `that`:

```
UP  those -> Those   ... or paragraph shape targets Those belong to the
UP  it    -> It      ... in the same way It is the shorter
UP  that  -> That    ... elsewhere for one thing That forces the reader
```

The other seven are an imperative or a noun and raise nothing.

**Strength of the three, honestly.** `:83` is the clearest: "That" carries a whole preceding clause and is the English form of the pattern AI05's own examples ("Das bedeutet, dass...") name. `:22` is the same shape with a plural. `:57` is the weakest of the three, because "It" has a nearby concrete antecedent and reads without effort.

**The fix, and why the original mark was not the only option.** `rules/user-facing-output.md:130` prescribes four replacements: a comma, a colon, parentheses, or two sentences. The pass chose two sentences at all three sites; a colon at `:22` and `:83` and a comma at `:57` remove the em-dash without creating the opener, and each is already on the prescribed list. No wording changes.

**What must not be done instead.** Restoring the em-dashes. The file is at 2.2 per 1000 against a stated ceiling of 1, and three restorations put it back at 3.3.

**Reconciliation 260816-1345 (reconciler, HEAD `dd560ab`): the finding is confirmed and three of its
four line numbers are wrong.** An independent case-sensitive comparison of the normalised token
streams returns the same ten upward changes and none downward, and `those`, `it` and `that` are among
them. At HEAD the three sites are `rules/user-facing-output.md:19`, `:56` and `:85`, not `:22`, `:57`
and `:83`, and the blacklist that bans the figure is at `:18`, one line above the first of them
rather than four. The file has not changed since `6049d3e`, so this is the citation drift
`shared/issues/260808-0030_o_line-number-citations-into-rule-files-go-stale-and-no-gate-reads-them.md`
tracks. Whoever takes the fix should re-grep rather than seek by line.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: All three vague pronoun openers are still present in `rules/user-facing-output.md`, four lines below the blacklist entry that bans them. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.

---
**Reconciliation 260821-0412** (reconciler, domain `code`, HEAD `247abfe`; log `circles/260820-2051-style-rules-arrive-and-get-measured/history/260821-0416-reconciliation.md`).
**STAYS `_o_`. All three sites reproduce, and the line numbers have drifted again.**

Re-read at HEAD by grepping the sentences rather than by seeking to a line, which is what the
260816-1345 reconciliation on this record advised:

- `rules/user-facing-output.md:19` — "Those belong to the long-form writing profile and would fight
  the caps in `## Length`."
- `:61` — "It *is* the shorter form."
- `:90` — "That forces the reader to keep proving the names refer to the same object."

The blacklist entry that bans the figure is at `:18`, one line above the first of them. The
citations in this record read `:22`, `:57`, `:83`; the 260816-1345 pass corrected them to `:19`,
`:56`, `:85`; two of those three have moved again, because `80d1599` and `86edaac` inserted text
into this file. Same drift class as
`shared/issues/260808-0030_*_line-number-citations-into-rule-files-go-stale-and-no-gate-reads-them.md`.

`circles/260820-2051-style-rules-arrive-and-get-measured` repaired five files and this is not one of
them: `rules/user-facing-output.md` was repunctuated in the earlier pass and that Circle only added
clauses to it. So the file that owns the vague-pronoun-opener blacklist still exhibits the figure
three times, four lines below where it bans it. The fix is three replacements of the class the
Circle just performed on four other files.
