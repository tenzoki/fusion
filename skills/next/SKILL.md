---
description: Portfolio briefing — dispatches playmaker, renders the next-recommended Circle, and offers interactive activation.
argument-hint: "[<circle-dirname>]"
allowed-tools: [Bash, Read, Write, AskUserQuestion, Agent(fusion:playmaker)]
---

# Fusion — next (portfolio briefing + interactive activation)

The user invoked `/fusion:next`. This skill is the user-facing surface for the Circle portfolio: it dispatches the `playmaker` agent, reads the regenerated portfolio file, renders the inline summary (top-recommended Circle + top backlog entry + counts + warnings), and offers an interactive activation prompt for the recommended Circle.

The skill writes nothing on the briefing path. The only writes it performs are part of the activation branch (Step 6): the `_a_→_t_` record rename, the `.active-circle` write, and a dashboard placeholder write. All writes are gated by an explicit user confirmation.

**A path into a file the plugin ships carries the `$FUSION_SRC` root.** Where a step below sends you to an agent prompt or another skill's body, open it at that root — nothing the plugin ships exists at a consuming project's root, so a bare `agents/…` or `skills/…` path resolves to nothing there. Resolve the root once, before the first step that cites one:

```bash
if [ -x "${FUSION_PLUGIN_ROOT:-}/bin/fusion-source-root" ]; then
  FUSION_SRC="$("$FUSION_PLUGIN_ROOT/bin/fusion-source-root")"
elif [ -n "${FUSION_PLUGIN_ROOT:-}" ]; then
  echo "fusion: no bin/fusion-source-root in the installed plugin at $FUSION_PLUGIN_ROOT — the source root falls back to that install copy" >&2
  FUSION_SRC="$FUSION_PLUGIN_ROOT"
else
  FUSION_SRC=""
fi
echo "source root: ${FUSION_SRC:-UNRESOLVED (FUSION_PLUGIN_ROOT is unset)}"
```

Hold the printed path and use it wherever a step below writes `$FUSION_SRC/…`. Each shell call gets a fresh shell, so the one executable check in this file calls the helper again rather than relying on the variable surviving.

**`UNRESOLVED` is not a path, and no step below reads through it.** With `FUSION_PLUGIN_ROOT` unset the variable holds the empty string and every `$FUSION_SRC/…` citation resolves from `/`, finding nothing and saying nothing about why. The check is this print, once, rather than a test at each site. When it prints `UNRESOLVED`, say so in the briefing, name the step that could not open the file it cites, and tell the user to restart the session so the SessionStart hook exports the variable. Do not improvise the content of a section you could not open. That is `rules/fusion-workbench-conventions.md` `## Path Resolution` → *Where the call belongs* applied to a held root: nothing is read through a value that came back empty, and the run names the value instead.

**Why the branch, why it is a call, and why the call is guarded:** `bin/fusion-source-root`'s own header.

**What the root does *not* cover.** A `bin/` helper is always run from `$FUSION_PLUGIN_ROOT`. Whether the work-tree preference reaches helper resolution is part (c) of decision `260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention…` and is **unanswered**; do not assume it. The split is by what you do with the path: read shipped text → `$FUSION_SRC`; run an installed executable → `$FUSION_PLUGIN_ROOT`.

**A Circle is a directory, and the state marker sits on the record inside it** — `circles/<dirname>/_a_circle.md` → `_t_circle.md`. The directory name never changes. See `rules/circle-records.md` `## State Markers — circles`.

**Invocation forms:**

- `/fusion:next` — briefing + interactive confirm on the top-recommended Circle (default).
- `/fusion:next <circle-dirname>` — explicit form. Skips the proposal step and goes straight to the confirm for that specific Circle. `<circle-dirname>` is the **directory name** of an anticipated Circle (e.g. `260716-1847-workbench-umbau`) — no marker, no `.md`.
- `/fusion:next --write-activation <circle-dirname>` — back-compat alias for the explicit form. The explicit form is preferred.

## Step 1 — Pre-flight: resolve paths

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" next
```

Hold the emitted `KEY=value` values for the rest of the skill. `$WORKBENCH` is absolute; every other value is workbench-relative. Never guess a path when the resolver fails — read the exit code, it says whose fault it is (full table in `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes):

- **Exit 1** — no workbench above `pwd`. Halt:

  > *No fusion workbench found above `$(pwd)`. Run `/fusion:setup` once at the project root first.*

  Exit cleanly. Do NOT bootstrap a workbench from here — `/fusion:setup` is the single point of workbench creation.

`CIRCLE` is emitted only when a Circle is active. Its presence or absence is how this skill tells the two states apart — do not read `.active-circle` yourself to decide.

Then check whether any Circle exists at all:

```bash
if [ ! -d "$WORKBENCH/$SCAN_CIRCLES" ] || [ -z "$(ls -A "$WORKBENCH/$SCAN_CIRCLES" 2>/dev/null)" ]; then echo empty; fi
```

If empty or absent, print exactly one line and exit — do NOT dispatch playmaker, do NOT create the directory (that is `/fusion:setup`'s job):

> *No Circles yet. Give the orchestrator a request and the first one comes into being.*

Otherwise proceed to Step 2.

## Step 2 — Detect domain

Decide which `**Domain:**` value to pass to playmaker. The read has one home, `bin/fusion-session-domain`, whose header carries the contract; call it guarded, as every helper call site is, because an installed copy may predate it:

```bash
if [ -x "$FUSION_PLUGIN_ROOT/bin/fusion-session-domain" ]; then "$FUSION_PLUGIN_ROOT/bin/fusion-session-domain"; else printf 'domain=code\nsource=helper-missing\n'; fi
```

`domain=` is `<detected-domain>` ∈ `{code, data}` for the remainder of this skill. A `source=` other than `agentstate` is a fallback: report it beside the value, never apply it silently.

## Step 3 — Dispatch playmaker

Use the `Agent` tool with target `fusion:playmaker`. The dispatch prompt's first non-empty content line MUST be the domain parameter; the rest of the prompt is empty for the default invocation (playmaker resolves its own paths at its Setup and reads what it needs from the workbench).

Prompt body:

```
**Domain:** <detected-domain>
```

No other parameters. Playmaker reads, ranks, regenerates the portfolio file, writes its own history file, and returns. It never renames Circle records and never writes `.active-circle`.

**Explicit-form short-circuit:** if the user invoked `/fusion:next <circle-dirname>` (or the `--write-activation` alias), the dispatch in this step is still useful — it keeps the portfolio fresh and re-runs cycle and warning checks before we mutate state — but the briefing render in Step 5 may be skipped. In that case go straight to Step 6 with `<circle-dirname>` as the target, **which skips Step 5b too** — 5b is reachable only from the end of Step 5. Backlog operations this dispatch proposed are therefore never put to the user; they stay in the portfolio until the next default-form `/fusion:next` asks about them. If the explicit target does not exist, or its record does not carry the `_a_` marker, halt with a clear mismatch report; do not fall back to the recommended one.

## Step 4 — Read the portfolio

```bash
cat "$WORKBENCH/$PORTFOLIO"
```

The file was just regenerated by playmaker. Treat its current content as authoritative.

## Step 5 — Render inline to the user

Present the following, in this order. All four come from the portfolio file. The specimen lines below are written in English because this file ships to projects of every language; render them in the project's chat language (`## Tone`).

1. **Top recommendation** — the first entry of the `## Anticipated (_a_) — ranked` section names a Circle directory and a rationale. Render it as one clear line, e.g. *"Recommended: `260511-1100-rebuild-auth` — its three dependencies are all closed, one open decision cited."* If the section reads `(none)`, say so plainly.

2. **The backlog's top entry** — the first line of the `## Backlog — ranked` section, plus how many further open entries the section lists when it lists any. One line, e.g. *"From the backlog: `<entry path>` — one idea, ready to shape. 4 further entries open."* Print nothing at all when the section reads `(none)`, or when the portfolio carries no such section because it was generated by a playmaker that predates it — an empty backlog is not news, and the briefing is about what there is.

   **Print the `/fusion:direct <entry>` invocation only when the portfolio carries one, and never construct one yourself.** The section's first line comes in two forms and that is exactly what separates them: `Recommended to shape:` carries the invocation on the next line, and `Recommended to split first:` deliberately omits it. Running `/fusion:direct` on a multi-idea entry would make one Circle of every idea in the file and retire the lot in a single rename, because the promotion path takes an entry whole. Copy the line that is there, or copy no line. Which form applies is playmaker's judgement, made against the entry as it actually reads, and this skill re-makes none of it.

3. **Counts, and when the ranking was made** — the number of Circles per marker class, then the portfolio's provenance. Either count entries within the portfolio's four state sections, or read explicit per-section counts when the file already carries them. The provenance is the `**Generated:**` value in the portfolio header, read as it stands: do not stamp a time of your own, which would report when the briefing was rendered rather than when the ranking was made, and the two differ by exactly the staleness the value exposes. Render both compactly, e.g. *"State: 1 active, 4 anticipated, 12 closed, 2 bounded. Ranked 260823-0800, over what this checkout has pulled."*

   **The checkout clause is not decoration.** `portfolio.md` is class L in `rules/workbench-tracking.md` `## The four classes`: regenerated per checkout, never travelling between them. A colleague's closures reach this ranking only after a pull and a fresh playmaker run, and the stamp is what lets a reader notice a ranking made before them.

   **Presence** — the `bin/fusion-events presence` block in `$FUSION_SRC/skills/setup/SKILL.md` `## Step 0c`, rendered by the policy there.

4. **Warnings** — quote (verbatim or summarised) any content in the `## Warnings` section: `dependency-cycle-detected`, `MULTIPLE-ACTIVE`, `STALE-POINTER`, `POINTER-MISMATCH`, `MISSING-POINTER`, parent-grounding-stale cross-references. If it reads `(none)`, omit this part.

After rendering the briefing, proceed to Step 5b.

## Step 5b — Put the backlog proposals to the user, and relay the answer back

Playmaker's report from Step 3 may name backlog operations it proposed and could not perform — a split, a merge, a close, a deferral. It could not perform them because it had no way to ask: the `AskUserQuestion` grant in this skill's frontmatter belongs to the skill body running in the main session, and it does not travel to a sub-agent the skill dispatches. So the skill asks, and a second dispatch performs. That is the whole of this step.

**No proposals, no step.** When the returned report names none, do nothing here — ask nothing, print nothing, go to Step 6. Most runs are that run.

**1. Read the proposals out of the portfolio**, from the `## Backlog — ranked` section of the file Step 4 read, one operation to a line. The four line forms are fixed by the portfolio template in `rules/circle-records.md` `## Backlog — ranked`; the returned report only says whether this run proposed anything, and is not parsed for the lines.

**2. Ask, once — and a second time only to narrow.** One `AskUserQuestion` naming the operations in plain words with their entry paths shown, and three options: perform all of them, choose which, perform none. **Perform none is an ordinary answer**, not a failure — record it in one line and move on. Follow the tone rules in `## Tone` below; the operations are the content, the mechanics of the relay are not.

**On "choose which", ask the follow-up and let it answer the whole subset.** One further `AskUserQuestion`, one option per proposed operation in the order the report listed them, `multiSelect` so the user marks everything they approve in a single pass. What comes back marked is the approved set; everything unmarked is declined, and neither needs a third question. Step 6 makes exactly this follow-up on **Pick another**, for the same reason — the first question asks how much, the second asks which — so this is that shape rather than a second one. A split is put to the user one produced entry to an option, not whole: its approved entries are relayed under the `split <entry path>:` header and the unmarked ones dropped, which is the partial split the store actually holds. If only one operation was proposed there is nothing to narrow: the option is equivalent to perform-all and you merge the two, the way Step 6 merges its single-entry case. If the follow-up comes back with nothing marked, that is perform-none — record it in one line and dispatch nothing.

**"Once" bounds the shape, not the count.** Two questions at most, the second strictly narrowing the first's answer, and no third. Do not re-put an operation the user has declined, do not ask them to confirm the set they have just marked, and do not open a question about anything other than the operations already on the table. Choosing a subset is the ordinary answer here, not an edge case: the four fixed line forms in `rules/circle-records.md` `## Backlog — ranked` are one operation to a line precisely so a person can approve them one at a time.

**3. Dispatch playmaker a second time** — target `fusion:playmaker`, as in Step 3 — but only when at least one operation was approved. When none was, dispatch nothing at all. The prompt carries the approved lines **verbatim**, copied from the report rather than paraphrased, so the second run matches its instruction to the first run's analysis without re-deriving it:

```
**Domain:** <detected-domain>
**Confirmed operations:**
- split <entry path>:
  - <slug> — <title>
  - <slug> — <title>
- merge <entry path>, <entry path> into: <slug> — <title>
- close <entry path> — <reason>
- defer <entry path> until <target>
**Proposal source:** <portfolio> `## Backlog — ranked`, generated <stamp from the portfolio header>
```

List only the approved operations and drop the rest. `<portfolio>` is the portfolio path as Step 1 resolved it and `<stamp>` is the `**Generated:**` value in its header; between them the second run needs to redo none of the first run's reading. `agents/playmaker.md` `## Two mandates, by dispatch path` carries the same block and states what a run does with it. **The stamp is load-bearing, not decoration:** that section tells the second run to compare it against the `**Generated:**` header of the portfolio it finds, and to perform nothing and write nothing when the two disagree. So write nothing into the portfolio yourself between the two dispatches, and do not dispatch anything else that would — the window between them is exactly what the check can see.

**This skill holds no key into the backlog store, and no step here may name one.** `bin/fusion-paths` derives a consumer's key set by one grep over its prompt, so a single write- or read-key token anywhere in this file — a fenced example included — would hand `/fusion:next` a scope it does not need and should not have. The relay carries **text**: entry paths travel as the words playmaker wrote, and nothing in this file resolves a path into the store. Write them as `<entry path>` placeholders.

**4. Say what was performed.** Re-read the portfolio, which the second run regenerated:

```bash
cat "$WORKBENCH/$PORTFOLIO"
```

Report in one line what its `Performed this run:` lines say. If an approved operation is not among them, say which one plainly — that, and not a silent portfolio, is how a broken relay announces itself.

**If the second run reports a stale proposal-source stamp**, it performed nothing and wrote nothing: something regenerated the portfolio while the user was answering. Say that plainly, name the operations that did not happen, and dispatch nothing further. The proposals were made against a portfolio that no longer exists, and re-putting them is a fresh `/fusion:next`, not a retry from here.

Then proceed to Step 6, unchanged.

**Why this relay exists and what it is not.** It is not the proposal-return protocol that fusion's own record `260813-0858_*_does-a-non-interactive-playmaker-run-perform-the-confirm-gated-backlog-operations.md` declined. That was a return path out of an orchestrator's Phase 4 dispatch, with no user present and a Circle closing. This is `/fusion:next`, where the user is already here confirming an activation, and nothing about the Phase 4 path changes. The comparison is drawn once, in that Circle's plan `260813-1306_*_the-playmaker-maintains-the-backlog-store.md` `## Approach`; do not re-argue it here.

## Step 6 — Interactive activation

Two entry paths:

- **Default (no argument).** Use the top-recommended anticipated Circle from Step 5. If none exist, skip Step 6 entirely — the briefing was the whole output.
- **Explicit (`/fusion:next <circle-dirname>`).** Use the cited directory name as the target.

**Gate — a Circle is already active.** `fusion-paths` emitted a `CIRCLE=` line in Step 1 exactly when one is. If it did, do NOT offer activation. Print one line naming the active Circle and exit; the briefing has already done its job. This is what keeps the activation branch from stomping an in-progress Circle.

**Prompt.** Use `AskUserQuestion`. Follow `rules/user-facing-output.md` and the chat profile at `./fusion-workbench/stilwerk/chat-voice-<lang>.yaml`; the language comes from the `**Language:**` line in `CLAUDE.md` (see `rules/fusion-workbench-conventions.md` `## Project language`). The prompt is specified here in English; render it in that language:

> **Question:** Activate Circle `<candidate-dirname>` now? That renames the record from `_a_` to `_t_`, sets the `.active-circle` pointer, and starts a fresh orchestrator session.
>
> **Option "Activate"** (default): Performs the rename and the pointer write.
> **Option "Pick another"**: Lists the anticipated Circles to choose from.
> **Option "Just look"**: Ends without changing anything.

On **Pick another**, list the anticipated Circles from the portfolio's `## Anticipated` section as a follow-up `AskUserQuestion` (one option per directory name), then proceed with the chosen one. If the section has only one entry, this option is equivalent to **Activate**; merge them.

On **Activate** (or after a selection) carry out the following in order.

### 6.1 — Verify the target

Read the target Circle's record and confirm it carries the `_a_` marker. Enumerate it rather than globbing per state: the block below reads the marker as data in one pass (`rules/fusion-workbench-conventions.md` `## Marker globs`).

```bash
CDIR="$WORKBENCH/$SCAN_CIRCLES/<candidate-dirname>"
REC=""; while IFS= read -r f; do REC="$f"; done < <(find "$CDIR" -mindepth 1 -maxdepth 1 -name '*_circle.md' 2>/dev/null)
MARKER="$(basename "$REC" | sed -nE 's/^_([a-z])_.*/\1/p')"
```

If `$CDIR` is not a directory, `$REC` is empty, or `$MARKER` is not `a`, halt and report the mismatch. Do not rename, do not write the pointer. A directory holding no record, or more than one, is a workbench-state fault the user must resolve — say which it is.

**Where `$MARKER` is `t`, the refusal is in the claim's terms and not the marker's.** Read the record's `**Claim:**` and this checkout's identity from `"$FUSION_PLUGIN_ROOT/bin/fusion-identity"`, guarded with `[ -x ]` as every helper call site is. Where the field opens with `Claimed ` and names another identity, name the holder and the claim's time, the name from `"$FUSION_PLUGIN_ROOT/bin/fusion-checkout-name" resolve <the claim's checkout>` under the same guard, its misses in that helper's header. **That renders and decides nothing:** the comparison stays on the hex and the person as written, values both sides hold locally; one reading a pulled file would answer differently across a fetch. Then offer one override at an `AskUserQuestion`: *Take it over here* / *Leave it alone*. Taking it appends the `Overridden ` sentence per `$FUSION_SRC/rules/circle-records.md` `### The claim field`, then writes `.active-circle` (Step 6.3) and nothing more: the record already carries `_t_`, so nothing is renamed. Leaving it writes nothing. `Unclaimed`, an absent field, or this checkout's own identity is the mismatch above and is reported as one. A partial identity (exits 3, 4 and 5) is that section's business: read the value and the comparison there, and compose nothing.

### 6.2 — Rename the record

Only the record is renamed. The directory name never changes; that stability is the whole point of the marker-on-the-record design (`rules/circle-records.md` `## State Markers — circles`).

```bash
mv "$CDIR/_a_circle.md" "$CDIR/_t_circle.md"
REC="$CDIR/_t_circle.md"
```

Both names are literal arguments to `mv`, not globs — the underscore marker needs no escaping and no special handling here. It is only *pattern matching* against marker names that needs care (see `rules/fusion-workbench-conventions.md` `## Marker globs`).

**The head fields are written at the act that moves them, and this act moves exactly one, `**Claim:**`.** `$FUSION_SRC/agents/orchestrator.md` `## Circle head fields` defines all three — when each is written, what value it takes, and why `(none yet)` is a value rather than a gap. Do not restate it here. Write the claim's activation value from there, in the same command as the rename; the other two are left honest:

- There is no `**Status:**` field to set. It was dropped from the record template, because it duplicated the marker and drifted from it; the marker on the filename is the state. A record written before the removal still carries the field — leave it exactly as it stands rather than correcting it.
- `**Active session history:**` stays `(none yet)`. No session is running this Circle yet — the one that will starts at Step 6.5 — so any path written here would name a file that is not on disk, which the field's readers handle worse than the empty value. The orchestrator sets it at its Setup step 6, when it creates the file.
- `**Active spec/plan:**` is left exactly as it stands. If shaper's portfolio-activation mode already pointed it at a spec (a storeless basename), that citation is current; if it reads `(none yet)`, this skill has no way to find the right file and must not guess one. And because it writes no path here, it never replaces the record's `## Directive` either: the pointer literal rides a write of that field and nothing else (`$FUSION_SRC/rules/circle-records.md` `### The Directive is a pointer once a spec exists`).

### 6.3 — Write `.active-circle`

The pointer holds the **directory name** — no marker, no `circles/` prefix, no `.md`:

```bash
printf '%s\n' "<candidate-dirname>" > "$WORKBENCH/.active-circle"
```

### 6.4 — Overwrite the dashboard placeholder

The dashboard may carry stale state from a previous session ("Session: Complete", a final commit list). Overwrite it so the prior session's final state cannot be mistaken for the current one. Use the `Write` tool to overwrite `$WORKBENCH/orchestrator-live.md` with this exact content (substitute the directory name):

```markdown
# Orchestrator — Live

**Active Circle:** <candidate-dirname>
**Session:** Not started — orchestrator Setup will refresh this dashboard on next session start

## Current
  [READY] orchestrator -> Activation complete; awaiting Turn 1
```

This is a minimal placeholder — the orchestrator overwrites it in full at the next Setup.

### 6.5 — Chain into a fresh orchestrator session

Print the following, rendered in the project's chat language (`## Tone`), changing nothing but the substitution:

> *Activated. The Circle now stands at `_t_` and the `.active-circle` pointer names it.*
>
> *Circle `<candidate-dirname>` is ready to run. An orchestrator session against it runs Setup (which overwrites the dashboard) and proceeds with Phase 0 → Phase 1 → Phase 2; if this message is all that happens next, say "go" and it starts.*

The session Directive is not read off the record here or by any orchestrator step: the Coherence gate resolves it from the active plan, else the active spec, else the session history's `**Directive:**` line, and that chain is the whole resolution.

**Then act on it in the same turn, and who you are decides how.** If you are the orchestrator, this activation is one of the self-initiated runs your own MANDATORY section anticipates: run your Setup now, then continue into Phase 0. Its steps are not restated here and must not be. If you are any other agent, stop here. The printed message stands as the user's next step, and this skill starts no session on its own.

## Boundaries

The skill's writes are the record rename (`_a_`→`_t_`), the `**Claim:**` value that rides it (or the `Overridden ` sentence, on the Step 6.1 takeover), the `.active-circle` write, and the dashboard placeholder — all in Step 6, all gated by explicit confirmation. **Step 5b adds no write of its own** — it asks and it dispatches; the backlog operations the user approves there are performed by playmaker on the second dispatch, out of the key it holds and this skill does not. **It writes no Circle *content* at all**: no section of the record is touched and the one head field it sets is `**Claim:**`, both path fields left to the writers Step 6.2 names. The portfolio file is written by playmaker, not by this skill. Safe to invoke during an active orchestrator session — playmaker reads everything, and its writes are four: the three appended sections on Circle records, the portfolio, its own history log, and the backlog store it maintains under `agents/playmaker.md` `## Two mandates, by dispatch path`. The active Turn loop writes none of the four, so it cannot interfere with the Turn loop's writes. The Step 6 activation branch is short-circuited when a Circle is already active.

## Tone

User-facing output follows `rules/user-facing-output.md` (loaded into every agent via `bin/fusion-rules`) plus the chat profile for the project's chat language, resolved per `rules/fusion-workbench-conventions.md` `## Project language` — the `**Language:**` line in `CLAUDE.md`, with the profile at `./fusion-workbench/stilwerk/chat-voice-<lang>.yaml`. Write every prompt and every rendered line in that language. This file is English because a skill body ships to projects of every language; what it tells you to render is not. For this skill specifically:

- The briefing leads with the **recommendation** (action), then counts, then warnings. No leading metadata block.
- Marker syntax in prose uses the **words** ("1 active, 4 anticipated"), not the bracket codes. The bracket codes belong in filenames.
- The activation confirmation leads with the **user action**, not a paragraph of Turn-loop jargon.

Concise. One line for the recommendation, one for counts, the warnings list if any. The user invoked `/fusion:next` for a snapshot, not a discussion. The activation confirm is one short prompt with three clear options.
