The override record names the shipped chat profile's cap, and the copy every agent actually loads says otherwise

---
`shared/history/260816-1251-curator-run.md:332` records what the user weighed before approving the foreclosure clause: "A per-option foreclosure costs roughly one line per option in a chat-text gate, against a line cap that is in dispute between `rules/user-facing-output.md:99`, which says 8 lines, and the always-on chat profile, which says 6". The same framing appears at `:99` and `:181` of that file.

The always-on chat profile says 8, not 6. `bin/fusion-rules:285-313` (`emit_voice_profile`, called at `:396`) emits `./fusion-workbench/stilwerk/chat-voice-<lang>.yaml`, and that copy's C04 reads "Gate-Prompts bis 8 Zeilen, Chat-Antworten bis 12 Zeilen" (`fusion-workbench/stilwerk/chat-voice-de.yaml:41`). The 6 lives in `stilwerk/chat-voice-de.yaml:41`, the shipped copy, which `bin/fusion-rules` never emits. That divergence is itself an open defect, `260814-1419_o_the-shipped-chat-voice-profiles-changed-and-the-workbench-copies-agents-actually-load-did-not.md`, and the run file conflated it with its sibling.

So the two always-on surfaces the user was told disagree in fact agree, at 8. The conclusion the user reached is unaffected, because the arithmetic fails at 8 as well. What is affected is the durable record of a user override, which names the wrong number as the one in force.

---
**Found by:** coderev, review of `b18a8cf..6049d3e`, review file `shared/reviews/260816-1330-coderev-repunctuation-and-gate-contract.md`.
**Owner:** `curator` for the run file it wrote, or `reconciler` on its next pass. A history file is a record of a run and is not retro-edited freely; the correction belongs as an appended note, not a rewrite of section 9.
**Severity:** Low. Nothing depends on the number at runtime. The cost is that section 9 is the ledger entry for a decision taken outside the evidence rules, and it is the entry a later reader will use to judge whether the override was informed.
**Filed in the shared store** per the Origin Rule: no Circle is active.
**Cross-references:** `shared/issues/260814-1419_o_the-shipped-chat-voice-profiles-changed-and-the-workbench-copies-agents-actually-load-did-not.md` (why the shipped copy is not the one in force); `shared/issues/260814-1419_*_the-tightened-chat-profile-caps-contradict-the-length-section-of-the-rule-that-owns-them.md` (the 6-versus-8 dispute, real but not yet reaching any agent here); `shared/issues/260816-1330_*_the-foreclosure-clause-does-not-say-whether-it-costs-a-line-per-option-and-the-cap-two-sections-below-forbids-relaxing.md` (the clause the override approved).

**Verified at HEAD `6049d3e`:**

```
$ grep -A4 'id: C04' fusion-workbench/stilwerk/chat-voice-de.yaml | grep Zeilen
      Kurz halten: Gate-Prompts bis 8 Zeilen, Chat-Antworten bis 12 Zeilen.
$ grep -A4 'id: C04' stilwerk/chat-voice-de.yaml | grep Zeilen
      Kurz halten: Gate-Prompts bis 6 Zeilen, Chat-Antworten bis 8 Zeilen.
$ bin/fusion-rules coderev | grep voice
./fusion-workbench/stilwerk/chat-voice-de.yaml
```

**One thing the run file got right and should keep.** Its own closing note in section 9 states that the curator did not observe the gate and records only what the apply dispatch reported. That is the qualification which makes this correctable rather than a contested account, and it is why this is filed as an inaccuracy in a relayed fact rather than as a misrepresented approval.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: The workbench copy at `fusion-workbench/stilwerk/chat-voice-de.yaml` C04 still says 8 and 12 lines while the shipped `stilwerk/chat-voice-de.yaml` C04 says 6 and 8, so the divergence stands. This is the same class as `260814-1419`. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.

---
**Reconciliation 260821-0412** (reconciler, domain `code`, HEAD `247abfe`; log `circles/260820-2051-style-rules-arrive-and-get-measured/history/260821-0416-reconciliation.md`).
**STAYS `_o_`, against plan step 16's `Closes:` line, which claims it. The annotation landed and it
supersedes the premise instead of correcting the fact.**

`shared/history/260816-1251-curator-run.md:415` gained the appended note step 16 promised, in the
form this record asks for: appended, section 9 not rewritten. Verified from the diff of `abdf1ad`.

What the note says is that the dispute is over: the rule owns the numbers alone and the chat profile
now states none. That is true and it is a different statement from the one this record makes. This
record's finding is that the run file names **6** as the always-on chat profile's cap when the copy
every agent loaded said **8**, so the two surfaces the user was told disagreed in fact agreed. The
note repeats the 6-versus-8 framing as a description of the superseded premise and nowhere says the
6 was wrong at the time.

Why that still matters, in this record's own terms: its stated cost is that section 9 is the ledger
entry a later reader uses to judge whether a user override was informed. A reader reaching it now
learns the dispute has since dissolved and still takes the wrong number as the historical fact.

One sentence closes it: that the profile in force at the time read 8 and 12, not 6 and 8, and that
the shipped copy carrying 6 was never emitted. The distribution defect behind it is separately met,
see the reconciliation on
`shared/issues/260814-1419_*_the-shipped-chat-voice-profiles-changed-and-the-workbench-copies-agents-actually-load-did-not.md`.
