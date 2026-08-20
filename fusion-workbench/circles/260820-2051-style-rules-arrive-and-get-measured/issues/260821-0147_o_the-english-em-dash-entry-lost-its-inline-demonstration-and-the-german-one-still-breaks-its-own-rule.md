The English em-dash entry lost its inline demonstration, and the German one still demonstrates with the mark it forbids

---

Two halves of the same asymmetry in AI02, judged independently of the executor's report.

**English, `stilwerk/chat-voice-en.yaml:85-86`.** Commit `02ea2bd` replaced the three em-dashes inside AI02's `instruction:` block with commas:

```
before: The telegraphic-with-parentheses pattern (clause — jargon aside — clause — compressed reason)
after:  The telegraphic-with-parentheses pattern (clause, jargon aside, clause, compressed reason)
```

Judged against the criterion in `shared/issues/260816-1330_o_two-of-the-twenty-nine-replacements-chose-a-mark-weaker-than-the-clause-it-replaced.md`, this is the one replacement of the eight that costs something, and the executor says so in `circles/260820-2051-style-rules-arrive-and-get-measured/history/260821-0112-ontocoder-gloss-and-repunctuation-of-the-four-profiles.md` ("Line 86, and what it costs"). This record agrees with the finding and disagrees with the reasoning offered for accepting it.

What the three em-dashes carried was not subordination. They were the demonstrandum: the entry names a pattern whose defining feature is the em-dash joint, and the parenthetical rendered the joints. With commas, `(clause, jargon aside, clause, compressed reason)` is a four-item list that demonstrates nothing, and a reader who does not already know the pattern cannot recover it from the entry's prose.

The history record justifies the choice by citing `rules/user-facing-output.md:132`, which "already reads `(clause, jargon aside, clause, compressed reason, all in one breath)`". That citation is accurate. It is also the weaker of the two forms the same file carries. **`rules/user-facing-output.md:29` states the identical pattern and keeps the schema by naming the mark instead of using it:**

> the telegraphic-with-parentheses style: a clause, an em-dash, a parenthetical jargon aside, another em-dash, a compressed reason crammed into one breath

Zero em-dashes, full demonstration, and it is four lines below the blacklist entry the whole repunctuation programme is anchored on. The profile was brought into line with the degraded sibling rather than the intact one, and the intact one is not cited anywhere in the step's record.

**German, `stilwerk/chat-voice-de.yaml:85-88`.** The counterpart entry still reads:

```
Gedankenstriche (–) für parenthetische Einschübe vermeiden, auch im Chat.
…Das Telegramm-mit-Klammern-Muster (Klausel – Klammer-Jargon – Klausel –
komprimierter Grund) ist das häufigste KI-Signal…
```

The instruction forbids `–` U+2013 and then uses `–` three times in its own prose, one sentence later. `bin/fusion-prose-metric` does not count `–` by design (`bin/fusion-prose-metric:76-83`), so `chat-voice-de.yaml` reports `0 em-dash … ok` while carrying three instances of the mark its own AI02 bans. The executor found this, wrote it up in the same history record ("The German counterpart is now asymmetric with it"), and left it "reported to the user unfiled". It is filed here.

**Verified at HEAD `7832553`** by reading `stilwerk/chat-voice-en.yaml:82-90`, `stilwerk/chat-voice-de.yaml:83-92`, `rules/user-facing-output.md:29` and `:132`, and by `bin/fusion-prose-metric stilwerk/*.yaml`, which returns `chat-voice-de.yaml 0 628 0.0 0 ok`.

---
**Found by:** coderev, review of `7135a19..7832553`, review file `circles/260820-2051-style-rules-arrive-and-get-measured/reviews/260821-0145-coderev-turn-1-prose-metric-setup-step-0e-and-the-repunctuation.md`.
**Owner:** `ontocoder`. Both halves are edits to shipped YAML profile text.
**Severity:** Low-Medium. The English half is a text-quality regression on the surface whose conditioning effect is this Circle's own premise. The German half is a file stating a rule and breaking it in the same entry.
**Direction, not a prescription.** The English half has a repair on the file's own prescribed list that costs no em-dash and no word count: the `:29` form, which names the mark. The German half has no repair inside step 7's scope, because `–` is neither what the metric counts nor what step 7 was scoped to touch, so it needs a scope decision before it needs an edit. Restoring em-dashes to the English entry is ruled out by criterion 1.
**Cross-references:** `shared/issues/260816-1330_o_two-of-the-twenty-nine-replacements-chose-a-mark-weaker-than-the-clause-it-replaced.md` (the precedent this was judged against); the step's own history record, named above, which records both halves honestly.
