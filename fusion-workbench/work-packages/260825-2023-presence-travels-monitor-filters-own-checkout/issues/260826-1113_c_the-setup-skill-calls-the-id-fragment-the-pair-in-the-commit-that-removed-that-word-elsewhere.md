# The setup skill calls the `<ID>` fragment "the pair", in the same commit that removed that word from the orchestrator prompt

---
`<ID>` has named three keys since `72a9561` added `session_id`. `6deeb33` carried finding R-14, whose
whole point at `agents/orchestrator.md:1322` was to stop the sentence "carrying a count that a fourth
field would falsify again" — it replaced "the pair" with "the identity fragment". In the same commit
R-10 wrote "Hold **the pair** as `<ID>`" into `skills/setup/SKILL.md:352`. The wave removed the word
from one site and introduced it at another. Separately, and with the same cause: the skill body names
`session_id` nowhere, so the procedure it inlines never reads the SessionStart line that carries it.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** Medium. An orchestrator holds both texts, so in the ordinary run its own Setup step 2
supplies the third key and the emitted line is correct. What is wrong is the skill body read on its
own terms: it is the surface `CLAUDE.md` calls the only reliable enforcement of Setup, it states a
field count that is one short, and it gives the reader no instruction that would produce the third
field. A `session_start` short one key is not detectable afterwards — an absent key is the defined
degradation, indistinguishable from a hook that printed no line.

**Cross-references:**
`260826-0906_*_the-event-log-contract-names-three-fields-and-two-sentences-under-it-still-say-two.md`
(R-14, the same defect one file over, closed by the same commit);
`260826-0906_*_a-fourth-session-start-emit-template-was-created-in-this-range-and-left-out-of-the-id-conversion.md`
(R-10, the edit that wrote the sentence);
`260826-1112_*_the-setup-skill-points-at-the-orchestrator-prompt-with-an-unrooted-path-the-body-forbids.md`
(the same sentence's other defect: the pointer that would correct this one is unreachable in a
consuming project).

## What is there

`skills/setup/SKILL.md:352`, Step 0i:

> Hold the pair as `<ID>`, the fragment defined at `agents/orchestrator.md` Setup step 2.

`agents/orchestrator.md:139-140`, the definition it points at, in two bullets:

> Hold the pair as one JSON fragment, `<ID>` = `,"person":"<PERSON>","checkout":"<CHECKOUT>"` …
>
> **Which Claude Code session.** A SessionStart hook prints one line into your context, `fusion:
> session_id=<uuid>`. Read the value there; no command reproduces it. Extend `<ID>` with
> `,"session_id":"<uuid>"`.

`grep -n 'session_id' skills/*/SKILL.md` returns nothing. No step of the setup skill reads the
SessionStart line, and Step 5's template at `:483` emits `<ID>` unexpanded by anything the body says.

The measured state of the log is consistent with the gap but does not prove it: no line in
`fusion-workbench/orchestrator-events.jsonl` carries `session_id`, and the current session started at
04:47 while `72a9561` landed at 08:50, so the installed hook could not have printed one either way.
The claim here rests on the text, not on the log.

## Fix direction

Two sentences at `:352`, or one. Say "the fragment", not "the pair", so no count is stated; and add
the `session_id` half — either by extending the pointer to name both bullets of Setup step 2, or by
carrying the one instruction the skill needs ("a SessionStart hook prints `fusion: session_id=<uuid>`
into your context; extend `<ID>` with `,"session_id":"<uuid>"`, and no line means no key"). The
second costs bytes on a bounded surface; the first does not, but only works once the pointer is
rooted (see the cross-referenced record).

---
Resolved: 260827-2020-coder-setup-skill-steps-5-18b-c4.md by coder. `skills/setup/SKILL.md` Step 0i says "the identity fragment `<ID>`", states no count, points at both bullets of the rooted `$FUSION_SRC/agents/orchestrator.md` Setup step 2, and carries the one instruction the skill needed: the second bullet extends `<ID>` with the `session_id` a SessionStart hook printed, and no line means no key.

Revised: 260827-2103 by coder (Circle 260826-1613 Turn 2, issue `260827-2042_*_step-0i-points-at-both-bullets…`). The Resolved note above describes a two-bullet shape orchestrator Setup step 2 does not have: one bullet ("Who, which checkout, which session") defines `<ID>` and already carries `session_id`; the next is the Turn budget. Step 0i now points at that one bullet.
