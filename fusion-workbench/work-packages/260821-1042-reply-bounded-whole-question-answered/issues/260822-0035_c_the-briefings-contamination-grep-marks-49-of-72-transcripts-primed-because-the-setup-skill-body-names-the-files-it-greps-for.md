The briefing's contamination grep marks 49 of 72 transcripts primed, because the setup skill body names the files it greps for

---

**Severity:** High
**Domain:** code
**Filed by:** analyst, running the measurement that briefing commissions
**Affects:** `260822-0010-measurement-briefing-does-the-rule-change-shorten-a-reply.md`, `## The contamination rule, stated once`
**Cross-references:** `260822-0035-three-before-figures-and-the-after-measurement-defined.md` section 4, which carries the corrected test; `260820-2354-prose-register-measurement-protocol.md`, the protocol the exclusion comes from

---

## What is wrong

The briefing defines the mechanical test for an unprimed session:

> Its transcript mentions neither the Circle directory name, nor `user-facing-output`, nor
> `chat-voice`, nor the words for reply length in either project language. A `grep -l` over
> the transcript files is the test.

**Run as written, it excludes the population the measurement is about.** Over the 72
transcripts of this project, `grep -lF user-facing-output` matches 49 and
`grep -lF chat-voice` matches 48. Those are not sessions primed on reply length. They are
sessions that ran `/fusion:setup`, whose skill body is injected into the transcript as a
message and which names `chat-voice-{en,de}.yaml`, `default-voice-{en,de}.yaml` and the
stylometric profiles in the prose of its Step 0d. The transcripts that do *not* match are
largely sessions that never ran an agent Setup at all, which are the least representative
sessions in the corpus.

The failure is structural rather than accidental: every fusion session receives that skill
body, before and after the rule change alike, so the token carries no information about
priming in either window.

## Why the briefing could not see it

The briefing's own session was primed and was reasoning about which *names* signal the
subject, which is the right question. What it did not check is whether those names appear
in a transcript for reasons unrelated to what the session was thinking about. A transcript
is not a record of a conversation; it also carries injected skill bodies, tool results and
whole file contents, and a `grep` over the file reads all of them.

## The correction, already made

Section 4 of
`260822-0035-three-before-figures-and-the-after-measurement-defined.md`
narrows the surface to human prompts and agent replies before applying the pattern, using
`.origin.kind=="human"` on `user` records, which is the same field the baseline's reading C
already uses to find human prompts. On that surface `user-facing-output` matches 5
transcripts rather than 49, and the full pattern marks 19 of 72 primed and 53 unprimed.

That corrected test is written out runnable in the report and is what the after-run must
use. **This record exists because the briefing is the document a later session reads first**,
and a reader who follows its `## The contamination rule` section without reaching section 4
of the report will build an after-corpus out of the wrong sessions.

## What to do

One of two.

1. **Amend the briefing** to point at section 4 of the report for the test, leaving its
   statement of the *rule* (a primed session may measure history but may not contribute
   replies) intact, since that half is correct and is the half the protocol authorises.
2. **Leave the briefing as the historical record** and rely on the report, which cites the
   briefing and corrects it in place. Cheaper, and it leaves a wrong command standing in a
   document whose stated purpose is that a later session can run the measurement "without
   re-deciding anything".

Route 1 is recommended. The briefing was written to be executed, not to be read as history.

**Verified at HEAD `084c626`** by `grep -lF user-facing-output` and `grep -lF chat-voice`
over the 72 transcript files, by opening three matching transcripts and finding each match
inside the Step 0d prose of the setup skill body, and by re-running the same pattern over
the narrowed surface.

---
Resolved: Route 1, as the smaller half of it. A dated correction note was added to the briefing's `## The contamination rule, stated once` section: it says the test as written does not work, gives the one-clause reason (a whole-file grep reads the injected setup skill body, which names the same files), and points at section 4 of the measurement report for the working test. The corrected command is deliberately **not** copied into the briefing, so that one command does not become two that drift; the note says so. The rule itself, that a primed session may measure history but may not contribute replies, is left as it stood, since that half was never wrong.
