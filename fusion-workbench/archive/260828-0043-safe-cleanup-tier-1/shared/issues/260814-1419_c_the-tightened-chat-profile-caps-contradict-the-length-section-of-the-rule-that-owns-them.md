The tightened chat-profile caps contradict the `## Length` section of the rule that owns them, and the German edit diverged from the English beyond translation

---
Commit `ae21c87` set the chat profiles' C04 entry to *gate prompts up to 6 lines, chat replies up to 8 lines*. `rules/user-facing-output.md` `## Length` states 8 and 12 for the same two surfaces and instructs the reader to *"count the lines. If a cap is exceeded, move material to Details — do not relax the cap."* Two always-on surfaces now carry different numbers for the same thing and nothing says which governs. Separately, the German edit dropped a clause its English sibling kept and added one the sibling does not have, so the two profiles now differ in content and not only in language, and it left trailing whitespace.

---
**Found by:** coderev, Turn-3 incremental review of `5c843e6..0301909`, review file `260814-1419-coderev-curator-turn-3.md`.
**Owner:** `coder` for the whitespace and the de/en divergence. The cap number itself may need a decision — see below.
**Severity:** Medium.
**Filed in the shared store** per the Origin Rule: `ae21c87` was committed during Circle `260801-1244-curator`'s Turn 3 but was not caused by its Directive.
**Cross-references:** `260814-1419_*_the-shipped-chat-voice-profiles-changed-and-the-workbench-copies-agents-actually-load-did-not.md` (the same commit, the reason neither number is in force here today); `260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md` (the complaint this tightening presumably answers).

**Verified 2026-08-14 at HEAD `0301909`:**

```
$ grep -rn 'up to 8 lines\|≤ 8 lines\|≤ 12 lines\|bis 8 Zeilen\|bis 12 Zeilen' rules/ stilwerk/
rules/user-facing-output.md:99:  - **Gate prompts: ≤ 8 lines** …
rules/user-facing-output.md:102: - **Chat reply default: ≤ 12 lines.** …
stilwerk/chat-voice-en.yaml:40:  Keep it short: gate prompts up to 6 lines, chat replies up to 8 lines.
stilwerk/chat-voice-de.yaml:41:  Kurz halten: Gate-Prompts bis 6 Zeilen, Chat-Antworten bis 8 Zeilen.
```

Both files are always-on for every agent: `rules/user-facing-output.md` is an unindented `emit_if_exists` line (`bin/fusion-rules:395`) and the chat profile is emitted for every agent (`bin/fusion-rules:405`).

**Part 1 — two numbers, no precedence.** The two are not logically contradictory (6 ≤ 8 and 8 ≤ 12, so obeying the profile satisfies the rule), and that is what makes it a drift rather than a break. But `rules/user-facing-output.md` states its caps as *the* caps and forbids relaxing them, and `rules/user-facing-output.md:19` describes the chat profile as *"minimal and chat-appropriate… It carries **no** sentence-length bands or paragraph-shape targets — those belong to the long-form writing profile and would fight the caps in `## Length`."* Line caps are not sentence-length bands, so that sentence is not falsified; the design intent it records — the profile does not restate the caps — is. An agent writing a 7-line gate prompt satisfies one always-on surface and violates the other, and nothing on either surface says which wins.

**The choice is real and belongs to the user, not to a patch.** Either `## Length` moves to 6/8, which is a change to what every agent's output looks like across the whole fleet, or the profile goes back to citing the rule rather than restating a number. Restating a number in a second always-on file is what put the two out of step in one commit.

**Part 2 — the German edit diverged from the English beyond translation.** The two C04 blocks are siblings and should say the same thing in two languages. After `ae21c87`:

```
en: Keep it short: gate prompts up to 6 lines, chat replies up to 8 lines.
    Do not enforce sentence-length bands; short sentences are normal and
    welcome in chat. Details go to the end or to a file, not the opening lines.

de: Kurz halten: Gate-Prompts bis 6 Zeilen, Chat-Antworten bis 8 Zeilen.
    Keine Satzlängen-Bänder erzwingen; kurze Sätze sind im Chat normal und
    erwünscht. Klare Formulierungen, kein Jargon.
    Falls Details notwendig: ans Ende.
```

The German dropped *"or to a file"* and *"not the opening lines"*, and added *"Klare Formulierungen, kein Jargon"*, which has no English counterpart and duplicates `rules/user-facing-output.md` `## Vocabulary` and the readability gate's point 4. The commit message says only that the profiles *"tighten their length caps"*; this second change is not covered by it.

**Part 3 — trailing whitespace.** `stilwerk/chat-voice-de.yaml:43` ends `kein Jargon. ` with a trailing space. Cosmetic, in the same lines as parts 1 and 2.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: All three parts persist: `rules/user-facing-output.md` states 8 and 12 lines while both shipped chat profiles state 6 and 8, with no precedence stated anywhere; the German C04 block is still missing the mirrored clause and still carries the extra one; and the trailing whitespace is still there. Marker stays open. Log: `260817-1836-reconciliation.md`.

---
Resolved: All three parts, in the shipped profiles, under user decision 5 of
`260820-2051-style-rules-arrive-and-get-measured` (the conflict resolves in
favour of the rule, at 8 and 12) and plan step 5 of
`260820-2324_*_plan-style-rules-arrive-and-get-measured.md`.

Part 1: the C04 entry of both chat profiles no longer states a number for either surface. Each now
names `rules/user-facing-output.md` `## Length` as where the two caps are stated and says they are
not restated locally. One number, one surface, and the design intent the rule's own line 19 records
holds again.

Part 2: the German C04 regained the two clauses it had dropped, "or to a file" and "not the opening
lines", and lost "Klare Formulierungen, kein Jargon", which had no English counterpart and duplicated
the rule's `## Vocabulary` section and point 4 of its readability gate. Removed rather than mirrored
into the English file, per the plan step. A clause-by-clause comparison of the two files is recorded
in `260821-0049-ontocoder-chat-profiles-stop-restating-the-caps.md`.

Part 3: the trailing space on the German `kein Jargon. ` line is gone with the clause, and
`grep -n '[[:space:]]$'` now finds nothing in either file.

**What this note does not claim.** The change is in the plugin's source copies. The workbench copies
every agent actually loads still carry the old text, deliberately: they are refreshed by the
mechanism built in step 3 of the same plan rather than by hand, at step 8. That divergence is the
separate defect
`260814-1419_*_the-shipped-chat-voice-profiles-changed-and-the-workbench-copies-agents-actually-load-did-not.md`,
and this record was never about it — its own verification grep read `rules/` and `stilwerk/` only.
