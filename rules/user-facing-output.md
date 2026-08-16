# User-Facing Output

**Provenance:** No motivating record recoverable; introduced in `git:c18a946`.

Every piece of output the user reads — status reports, gate prompts, `AskUserQuestion` text, session summaries, error messages, skill confirmations, activation banners — must be **self-contained, plain-English, and action-first**. The user should never have to decode jargon, hunt for what they need to do, or scroll back to understand a question.

This rule is loaded for every agent. If you find yourself writing output that violates it, rewrite before sending. The user reads everything you produce — make it worth reading.

This rule governs short-form output — status reports, gate prompts, `AskUserQuestion` text, session summary headers, dashboard lines, chat replies. Two stylometric profiles layer on top of it, each resolved from its own declaration line in `CLAUDE.md` — the chat profile from `**Language:**`, the writing profile from `**Artifact language:**` (see `rules/fusion-workbench-conventions.md` `## Project language`):

- **Long-form prose** (session summary bodies, consultant replies, analyst reports including failure timelines, playmaker briefings, prose sections of specs and plans) additionally applies the **writing profile** at `./fusion-workbench/stilwerk/default-voice-<lang>.yaml`. Each long-form-prose agent's prompt enumerates which of its outputs the writing profile governs.
- **Short-form chat** additionally applies the **chat profile** at `./fusion-workbench/stilwerk/chat-voice-<lang>.yaml` — see `## Style anti-patterns apply to everything` below.

## Style anti-patterns apply to everything

Short-form chat output (gate prompts, `AskUserQuestion` text, status reports, chat replies) follows the **chat profile** (`./fusion-workbench/stilwerk/chat-voice-<lang>.yaml`), a deliberately lean profile:

- Its **blacklist** is the load-bearing half: em-dash overuse, AI stock phrases, mechanical three-part lists, vague pronoun openers, filler intensifiers, rhetorical question-answer pairs, sycophantic or paternalistic validation, hollow abstractions. These anti-patterns are length-neutral — removing them shortens output, so they never conflict with the length caps below.
- Its **whitelist** is minimal and chat-appropriate: action-first, name the referent (no bare counts or codes), direct address, terse. It carries **no** sentence-length bands or paragraph-shape targets — those belong to the long-form writing profile and would fight the caps in `## Length`.

**Answer, don't validate.** When the user is right, a plain "Yes" or the substantive answer is enough. Do not praise their intuition, instinct, sense, or question ("Great question", "Your instinct is right", "Genau richtig — dein Sprachgefühl stimmt"). Sycophantic validation is filler, and praising the user's judgement reads as paternalistic. State the fact; the user can see for themselves that they were right.

**Do not apply the long-form writing profile (`default-voice-<lang>.yaml`) to chat.** Its consulting-register voice and sentence-length targets are wrong for a one-line gate prompt. Chat gets the chat profile; long-form prose gets the writing profile.

**Structured artifacts are exempt from both profiles.** Dashboard lines (`orchestrator-live.md`), commit messages, monitor strings, event-log JSON, and machine-read tables or ID lists keep their terse, parseable shape. The chat profile is about prose habits, not data formats.

If no chat profile is loaded (no `stilwerk/` in the workbench, or the file is missing), the anti-patterns still hold in spirit: they are language-independent and this rule applies regardless.

**The recurring offender** is the telegraphic-with-parentheses style: a clause, an em-dash, a parenthetical jargon aside, another em-dash, a compressed reason crammed into one breath. This pattern shows up most in gate prompts and `AskUserQuestion` option text. Avoid it.

Before (real example — em-dash pile-up, undecodable parenthetical jargon, bare counts with no referent):

> Opt 1 — ja, aber mit explizit gemachter (a)-Wahl für die 13 und einer ehrlichen Notiz-Formulierung, die 8 (redundant) von 13 (echt gedroppt) trennt.

After (plain sentences, referents named, no em-dash, no bare counts):

> Option 1 funktioniert, aber nur, wenn du die "beantwortet"-Wahl für alle 13 Einträge ausdrücklich festhältst. Die Abschlussnotiz sollte die 8 redundanten von den 5 echt verworfenen trennen, sonst liest sich der Audit-Trail später falsch.

The principle is language-independent: name the referent, drop the em-dash, spell out the count.

## Sketch structure instead of narrating it

When the point is a structure — relations in a data model, a dependency graph, a state machine, a layout, a before/after of a tree — a small ASCII sketch is usually clearer than a paragraph, and shorter. Prefer the sketch.

This matters most for abstract relational content. Do not spell out "a customer has many orders, each order has many line items, and every line item points at one product in one category" in sentences when a few boxes and arrows say it at a glance:

```
Customer ──<  Order  ──<  LineItem  >──  Product  ──  Category
              (1─*)         (*─1)              (in)

legend:  A ──< B   one A, many B        A >── B   many A, one B
```

Use ASCII in chat — the terminal renders it directly. Reserve Mermaid for files that get rendered elsewhere (history logs, specs, plans); Mermaid does not render in the chat stream.

A sketch that replaces a wall of prose does not count against the chat length cap in the same way — it *is* the shorter form. But keep sketches tight: if the diagram needs a legend longer than the prose would have been, the prose was fine.

## Information architecture (in this order)

1. **Action first.** If the user needs to decide, type, click, approve, or wait, that comes at the very top — before any explanation. The first line answers "what does the user do now?" If there's nothing for the user to do, lead with that explicitly: *"Session complete — nothing for you to do."*
2. **Reason second.** One or two sentences on *why* this action matters or what just happened. Not a paragraph.
3. **Status / results.** What's currently true. Counts, verdicts, outcomes.
4. **Details / references.** Commit hashes, file paths, agent names, history-file paths, internal IDs, marker syntax — these go in a clearly separated trailing section called "Details" or "References", **not** in the opening lines.

**No section called "Metadata" at the top.** Move that content to the bottom.

## Vocabulary

- **Spell out fusion-internal terms on first use** in any given output. Examples:
  - Not "Turn loop" → "the work cycle (one Turn = one batch of tasks + a review)."
  - Not "Directive" alone → "the session Directive (your stated goal)."
  - Not "_t_ marker" → "the active Circle (`_t_` in the filename)."
  - Once spelled out within an output, the short form is fine for the rest of that same output.

- **Never use workbench-internal IDs without their human-readable summary.**
  - Bad: `T2 P:02 Extended-BMC manifest re-edit (10×18)`
  - Good: `Re-edit the Extended BMC manifest (Task 2, 10 entries × 18 fields).`

- **Never use abbreviations the user didn't define.** Project-specific abbreviations (R14, MC-11, Q7.3, BMC, Bundle A/B/C) need at least one expansion on first use, or a pointer to where they're defined. Standard tech abbreviations (CLI, API, YAML, JSON, HTML) are fine.

- **Conventional Commits types are commit-message language, not user-facing prose.** Don't write "T1 chore: bumped version" in a status report. Write "Task 1 bumped the version."

- **No marker syntax in body prose unless explained.** `_o_`, `_a_`, `_t_`, `_c_`, `_b_`, `_s_`, `_d_`, `_p_`, `_i_` are filename markers. In body text prefer the word: *open / anticipated / active / closed / bounded / superseded / deferred / in-progress / implemented*. Use the marker form in parentheses if helpful — *"the active Circle (`_t_` in the filename)."*

- **One name per thing.** Use a single, consistent term for an entity throughout an output. Do not rotate through synonyms ("registry" here, "catalog" there, "uif-framework.yaml" elsewhere) for one thing — that forces the reader to keep proving the names refer to the same object. Pick the most significant, precise name (often the filename or the canonical term) and keep it. When an explanation is requested, you may state the synonyms once ("uif-framework.yaml acts as a registry: a catalog of selectable frameworks"), then use the one term consistently for the rest of the output.

## Questions and gates

- **A response moment is either a question or an explicit "nothing to decide".** When your output lands where the user may be expected to answer, either put the decision as a question or say in the first line that nothing needs deciding, per `## Information architecture` point 1. Output that does neither reads as a demand the user cannot locate.
- **Every `AskUserQuestion` question must be self-contained.** The user is reading chat scrollback. They should not have to scroll up to understand the question. Include the relevant Circle name, file path, task title, or context inside the question text itself.
- **Options must be plain English, not internal verbs.**
  - Not "Revise Artifact" → "Try again with a refined task list."
  - Not "Bounded Closure" → "Accept what's been learned and end the session."
  - Internal verbs may follow in parentheses for traceability: *"Try again with a refined task list (Revise Artifact)."*
- **Default options should be the most-likely choice.** Don't make the user pick between four equal-weight options if 90% of the time it's option A. Mark the recommended default explicitly.
- **Every option says what it forecloses.** Per option, state what choosing it costs and what it rules out afterwards, and separate what is merely deferred from what is given up for good. Carry it in the `AskUserQuestion` option `description` field, or on the option's own line when the gate is plain chat text. A `description` that restates the label in other words is the failure this clause exists to stop.

## Length

- **Status reports: ~5–15 lines for normal cases.** A successful session report doesn't need a wall of facts. Lead with the verdict and what (if anything) the user needs to do, then trailing details.
- **Gate prompts: ≤ 8 lines** including the question and the option list. Anything longer means the gate is doing too much work in one prompt — split it or move context to a referenced file.
- **`AskUserQuestion` text: ≤ 6 lines for the question stem, ≤ 4 lines per option label.** Option labels are scannable choices, not paragraphs.
- **Session summary header: ≤ 10 lines before the first "Details" anchor.** The header is what the user reads in scrollback; details live below the fold.
- **Chat reply default: ≤ 12 lines.** If more is needed, move detail to a "Details" trailing block or to a file and link it.
- **Wide tables and long lists belong in "Details," not the opening summary.**

Before sending, count the lines. If a cap is exceeded, move material to Details — do not relax the cap.

## Effort estimates

- **No agent emits an effort estimate unless the user explicitly asked for one in the current exchange.** Unsolicited estimates are noise — the monitor's session-scoped ETA already covers that need.
- **When the user asks**, write exactly one line at the end of the relevant document or reply, in the form `estimated effort (ai-based): about <N> <unit>`. The phrasing is locked: lowercase, the word "about" (not `~`), and an explicit unit — `min`, `h`, or `day`.
- **The number is AI-paced** — roughly aligned with what the monitor's session-scoped ETA would predict for this kind of work, not a human-hour estimate.

Banned patterns: do not write `~5 hours`, `roughly half a day`, or any hour count not preceded by an explicit user request in the current exchange.

**Before / after:**

Before: `Bundle A: ~6 steps, 5 hours`

After: `Bundle A: 6 steps` — followed, only if the user asked, by a separate trailing line `estimated effort (ai-based): about 45 min`.

## Self-review before sending: the readability gate

The style rules above are necessary but not self-enforcing. The known failure mode: when the content gets technically dense, agents drop the prose discipline and emit telegraphic, jargon-packed output the user cannot parse. The stylometric profiles already ban this (em-dash overuse, telegraphic style, undefined terms), yet it slips through under load. Treat the rules as a gate you pass the draft through, not as background advice.

**Before you send any substantive explanation — a chat reply, a report body, a recommendation, a finding — run this five-point check on your draft and rewrite anything that fails:**

1. **Thesis first.** Does the first line carry the finding or the recommendation? If the reader reaches paragraph three before learning the point, move it up.
2. **No em-dash asides.** Scan for `—` used as a parenthetical break. Replace each with a comma, a colon, parentheses, or two sentences. The telegraphic-with-parentheses pattern (clause, jargon aside, clause, compressed reason, all in one breath) is the single most common offender. One `—` per ~1000 words is the ceiling, matching the stylometric profiles.
3. **Whole sentences, not fragments.** Each point is a grammatical sentence with a subject and a verb. "Recall top, Precision leck" is a fragment; "S1 hat hohen Recall, aber leckende Precision" is a sentence.
4. **Every code and abbreviation glossed on first use.** This covers project-domain jargon, not only fusion-internal terms. `S1`, `gate.go`, `must_not`, `Orderer`, `AC`, `N=10` each get a referent or a short gloss the first time they appear. The reader does not hold the project's internal codes in working memory; do not assume it.
5. **Counts are named.** "3 phantom failures", not "3 Fails". "8 of the 13 open items", not "8 of 13".

The gate applies to long-form report bodies and short-form chat alike. It is the same forcing-function shape as "count the lines" in `## Length`: a concrete check you run on the draft, not a principle you hold in the abstract.

### Canonical anti-example (a real failure)

What the gate exists to stop — dense engineering jargon, em-dash chains, bare codes, fragments:

> S1s Selektion findet hervorragend, diszipliniert aber nicht — Recall top, Precision/Constraints leck, weil das deterministische Gate mit dem Boot-Flip wegfiel. Der Fix ist nicht "besserer Prompt", sondern S4s Gate als deterministischen Post-Filter vor den Orderer ziehen.

The same content through the gate — thesis first, no em-dash, whole sentences, each code glossed once:

> **Befund:** S1, die LLM-basierte Framework-Auswahl, findet die richtigen Frameworks zuverlässig (hoher Recall), hält aber die Constraints nicht ein. Precision und Regel-Treue lecken, weil das deterministische Gate beim Boot-Flip wegfiel. Der Fix ist kein besserer Prompt, sondern das bewährte Gate aus S4 als deterministischen Filter hinter S1 zu schalten, noch vor dem Orderer (der Komponente, die die Treffer sortiert).

Same information, same technical terms, readable.

## Examples

### Example 1 — session report

**Before** (cryptic, jargon-heavy, no clear user action):

> Verdict: coherent (Phase 3 reconciler) Commits: 6 (4 task + 1 reconciliation + 1 session-close) - 60e009b T1 CLAUDE.md Framework Topics bullet + Bundle C validator-status - 17cf23d T2 3 Bundle-C coderev Notes closed (loader/validator topics) - 4414f18 T3 typical_engine_types → typical_shapes (R14 ratified) - d1d59e7 T4 Q7.x _a_→_i_ walk × 5 + plan 260510-2151 _o_→_c_

**After** (action-first, plain-English, details at the bottom):

> **Session complete — nothing for you to do.**
>
> The reviewer confirmed the work is consistent with your original goal. 6 commits landed across 4 tasks + 1 reconciliation pass + 1 session-close.
>
> **Optional next steps** (if you want to keep going):
> - Pick up the ontology-coverage plan (Bundle A — 6 steps)
> - Or draft the Stefan consult in parallel (1 step)
>
> **Details:**
>
> | Commit  | What it did |
> |---------|-------------|
> | 60e009b | Updated CLAUDE.md framework topics bullet (Task 1) |
> | 17cf23d | Closed 3 reviewer notes about the loader and validator (Task 2) |
> | 4414f18 | Renamed `typical_engine_types` → `typical_shapes` per ratified decision R14 (Task 3) |
> | d1d59e7 | Walked 5 decision records from anticipated to implemented + closed plan 260510-2151 (Task 4) |
>
> Full log: `fusion-workbench/shared/history/260511-2129-orchestrator-session.md`

### Example 2 — activation confirmation

**Before** (one sentence packs five unrelated ideas, all jargon):

> The next orchestrator session will pick up the Turn loop against this Circle's Directive — close the 7 Stefan-blocked open issues by source-querying normative/extracts/, landing changes with pending-stefan provenance markers, escaping to decisions/_o_ on ambiguity, and consolidating per-issue close-notes + dossier under consult/.

**After** (clear action, brief reason, no jargon dump):

> **Circle activated. To start the work, just say "go" or "run the active Circle."**
>
> The session will work through 7 open issues that are blocked on input from Stefan. For anything ambiguous, it'll file a new question (decision record) rather than guess.
