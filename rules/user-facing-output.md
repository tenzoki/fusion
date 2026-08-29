# User-Facing Output

**Provenance:** No motivating record recoverable; introduced in `git:c18a946`.

Every piece of output the user reads (status reports, gate prompts, `AskUserQuestion` text, session summaries, error messages, banners) is **self-contained, plain-English, and action-first**: no jargon to decode, no hunting for what to do, no scrolling back to understand a question.

This rule is emitted to the agents whose output the user reads directly — orchestrator, consultant, playmaker, shaper, editor, curator (gate `260827-0910_*_does-every-dispatch-carry-the-full-user-facing-style-contract.md`; the others carry the chat profile's anti-patterns via `agent-setup.md` `## Voice profiles`). If you are reading this, you hold a user-facing surface: rewrite before sending anything that violates it.

Two stylometric profiles layer on top, each resolved from its own `CLAUDE.md` declaration (`rules/fusion-workbench-conventions.md` `## Project language`): long-form prose (summary bodies, consultant replies, reports, briefings, spec/plan prose) applies the **writing profile** (`./fusion-workbench/stilwerk/default-voice-<lang>.yaml`); short-form chat applies the **chat profile** (`chat-voice-<lang>.yaml`).

## Style anti-patterns apply to everything

The chat profile is deliberately lean: a load-bearing **blacklist** (em-dash asides, AI stock phrases, vague pronoun openers, filler intensifiers, mechanical enumeration, rhetorical Q+A, announcing structure, hollow abstractions, sycophantic validation — the entries carry their ids in the profile itself) and a minimal **whitelist** (action-first, name the referent, direct address, terse, sketch structure, one name and one formulation per thing). It carries **no** sentence-length bands: those belong to the writing profile and would fight the caps in `## Length`. The anti-patterns are length-neutral — removing them shortens output.

- **Answer, don't validate.** When the user is right, "Yes" or the substantive answer is enough; praising their question or instinct is filler and reads as paternalistic.
- **Correctio earns its place only where the reader would have assumed the rejected term** ("set to `_p_`, not `_c_`" earns it; "Und nachgemessen statt geschlossen" does not — write "Nachgemessen.").
- **Never apply the writing profile to chat**: its consulting register and length targets are wrong for a one-line gate prompt.
- **Structured artifacts are exempt from both profiles**: dashboard lines, commit messages, monitor strings, event-log JSON, machine-read tables stay terse and parseable.
- With no chat profile on disk, the anti-patterns still hold in spirit: they are language-independent.

## Sketch structure instead of narrating it

When the point is a structure (data-model relations, a dependency graph, a state machine, a before/after tree), a small ASCII sketch beats a paragraph:

```
Customer ──<  Order  ──<  LineItem  >──  Product     (A ──< B: one A, many B)
```

ASCII in chat (the terminal renders it); Mermaid only in files rendered elsewhere. A sketch counts against the length cap and earns its place by being shorter than the prose it replaces.

## Information architecture (in this order)

The reply answers the question that was asked; what you noticed on the way is filed per `rules/fusion-workbench-conventions.md` `## Issue and Decision Filing` and named in one line each.

1. **Action first.** The first line answers "what does the user do now?" — or states plainly that there is nothing to do.
2. **Reason second.** One or two sentences, not a paragraph.
3. **Status / results.** What is currently true: counts, verdicts, outcomes.
4. **Details / references.** Hashes, paths, agent names, IDs, marker syntax — in a trailing "Details" section, never in the opening lines, and never as a "Metadata" block at the top.

## Vocabulary

- **Spell out fusion-internal terms on first use** ("the active Circle (`_t_` in the filename)", "the session Directive (your stated goal)"); the short form is fine afterwards.
- **No workbench-internal ID without its human-readable summary**; no abbreviation the user didn't define (project codes need one expansion or a pointer; CLI/API/YAML are fine).
- **Conventional-Commits types are commit language**, not prose: "Task 1 bumped the version", not "T1 chore: bumped version".
- **Prefer the word to the marker** in body prose: *open / active / closed / …*, the marker form in parentheses if helpful.
- **One name per thing, one formulation per claim.** Synonym rotation forces the reader to re-prove identity; a second wording is not truer.

## Questions and gates

- **A response moment is either a question or an explicit "nothing to decide"** — output that is neither reads as a demand the user cannot locate.
- **Every `AskUserQuestion` is self-contained**: Circle name, path or task title inside the question text; the user is reading scrollback.
- **Options in plain English**, internal verbs in parentheses for traceability: "Try again with a refined task list (Revise Artifact)".
- **An option names the thing it decides, not the kind of thing**: "the record still promises a restart that was never built", not "the record promises a constraint that no longer exists". Same length, no licence for longer options.
- **Mark the recommended default** when one choice is far likelier than the rest.
- **Every option says what it forecloses**, separating deferred from given up for good — in the option `description`, or on its own line in plain-text gates; a description that restates the label is the failure this clause stops. **A foreclosure takes its own line**, never folded onto the option's line to buy a line back against a cap.
- **A gate carries at most three options.** Worst case (stem + three labels + three foreclosures) is seven lines against the cap of eight in `## Length`. A decision needing a fourth option is too big for one gate: split it.

## Length

- **Status reports: ~5–15 lines.** Verdict and user action first, trailing details after.
- **Gate prompts: ≤ 8 lines total**, on any surface; `AskUserQuestion`'s per-field ceilings (≤ 6-line stem, ≤ 4-line label, ≤ 2-line description) never override the total.
- **Session summary: ≤ 25 lines total, ≤ 10 before the first "Details" anchor** (decided in `260821-1801_*_what-total-caps-a-session-summary-now-that-no-reply-has-an-uncapped-tail.md`); the rest lives in the linked history file.
- **Chat reply default: ≤ 12 lines**; more goes to a file, linked.
- **A report is sized by what the reader needs, not by how much work there was.** Wide tables and long lists go under "Details".

Every cap is the budget for the whole output, Details included. Count the lines before sending; an over-count comes down by cutting (cuts go where that kind of thing lives: a store record, the history log), never by moving material further down the same reply, and never by relaxing the cap.

## Effort estimates

No agent emits an effort estimate unless the user asked in the current exchange (the monitor's ETA covers the standing need). When asked: exactly one trailing line, `estimated effort (ai-based): about <N> <unit>` — lowercase, the word "about", unit `min`/`h`/`day`, AI-paced rather than human-houred. Never `~5 hours` or `roughly half a day` unprompted.

## Self-review before sending: the readability gate

The known failure mode: under technical load, agents drop the prose discipline and emit telegraphic, jargon-packed output. Treat the rules as a gate you pass the draft through. **Before sending any substantive explanation, run this check and rewrite what fails:**

1. **Thesis first** — the first line carries the finding, and it states the *fact*, not the significance of a fact you withheld ("Schritt 8 fand neun Prosastellen, der Plan führte vier", not "Schritt 8 hat etwas gefunden, das mehr wert ist als seine eigene Arbeit").
2. **No em-dash asides** — one `—` per ~1000 words is the ceiling; the telegram-with-parentheses pattern shows up most in gate prompts and option text.
3. **Whole sentences** — each point has a subject and a finite verb; "Recall top, Precision leck" is a fragment.
4. **Every code glossed on first use** — `S1`, `gate.go`, `must_not` each get a short gloss; the reader does not hold the project's codes in working memory.
5. **Counts are named** — "8 of the 13 open items", not "8 of 13".

The gate applies to long-form bodies and chat alike — a concrete check on the draft, like "count the lines" in `## Length`. The canonical failure and its repair:

> S1s Selektion findet hervorragend, diszipliniert aber nicht — Recall top, Precision/Constraints leck, weil das deterministische Gate mit dem Boot-Flip wegfiel.

> **Befund:** S1, die LLM-basierte Framework-Auswahl, findet die richtigen Frameworks zuverlässig (hoher Recall), hält aber die Constraints nicht ein, weil das deterministische Gate beim Boot-Flip wegfiel. Der Fix: das bewährte Gate aus S4 als deterministischen Filter hinter S1 schalten, vor dem Orderer (der Komponente, die die Treffer sortiert).

Same information, same technical terms, readable.
