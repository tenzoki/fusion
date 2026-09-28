---
description: Runs a bounded discussion between the agent the user is talking to and the consultant, round by round in the chat, with a claim register that is written to the workbench's discussion store from the first round onward. Begins, inspects and closes a discussion; decides nothing.
argument-hint: "[--begin <reference>] [--infer] [--close]"
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion, Agent(fusion:consultant)]
---

# Fusion — discuss (a bounded two-agent discussion)

The user invoked `/fusion:discuss`. **You are the first partner** — this body is a prompt to the assistant that is currently running, so the partner is whoever received it, whatever agent that is. The second partner is `fusion:consultant`, dispatched once per round with the claim register as its payload. The discussion runs in the chat; the register lives on disk from round one.

**This body performs that procedure and no other.** It runs no other pass, dispatches no other agent, and commits nothing.

Every user-facing sentence below is rendered in the project's chat language, and the record in the artefact language (`rules/fusion-workbench-conventions.md` `## Project language`).

## Step 1 — Roots and paths

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-workbench-root"
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" discuss
```

Halt on a non-zero exit from the first: there is no workbench to write into, and this body creates none — tell the user to run `/fusion:setup` at the project root.

Hold the resolver's `KEY=value` output. `$WORKBENCH` is absolute, `$OUT_DISCUSSION` is relative to it, and that pair is the only spelling of the store in this body. On a non-zero exit read the code before acting — the full table is `rules/fusion-workbench-conventions.md` `## Path Resolution` under Exit codes. Exit 1 is no workbench; exit 3 is scope the resolver could not determine, which the user clears; exit 4 is a fusion bug and their workbench is fine. **Never guess a path and never substitute a default**: an empty `$OUT_DISCUSSION` halts the run naming that key, because an empty expansion writes to the workbench root silently.

## Step 2 — Which switch, and what is already open

- `--begin <reference from the chat>` starts a discussion on that reference.
- **No switch means `--begin`**, taking whatever text follows as the topic and the preceding exchange as the reference.
- `--infer` prints the register's current conclusions and leaves the discussion open.
- `--close` writes the final recommendation, moves the record to its closed state, and ends the discussion.

Those three are the whole switch set. There is no switch for resuming: within one session you carry the thread across operational interruptions yourself.

**One discussion is open per session**, and it is the one this session began — the path you held at Step 4. **Do not scan the store to find one.** A record another session left open is not this session's to take up; that is a new discussion citing the old one.

- `--begin` while one is open: one `AskUserQuestion` naming the open discussion's topic, with two options — close that one first and begin the new one, or keep it and begin nothing. Wait for the answer. Never begin a second silently, because two open discussions make `--infer` and `--close` ambiguous with no argument to disambiguate them.
- `--infer` or `--close` with none open: say in one line that none is running, write no file, and stop.

## Step 3 — The register is the record file

One structure carries the whole state of a discussion: it is the payload of every dispatch, what the stopping rule is evaluated against, what `--infer` prints, and at the end the record. **That structure is the file on disk.** There is no second file, no pointer file, and no state held only in the model.

So a round is three acts: read the file, build the dispatch from it, rewrite it whole. `--infer` and the stopping check read the same bytes. Killing the session after round three then leaves a record carrying three rounds by construction, not by your having remembered to project hidden state onto disk.

**The four claim sections carry the result.** The section an entry block sits in *is* its result, which is why no block carries a result field: written twice, the two copies have somewhere to drift. Every claim appears in exactly one of the four sections.

One entry-block shape, used in all four:

```markdown
### <identifier> — <claim, one sentence>

- **Advanced by:** <first partner | consultant>
- **Entered:** round <N>
- **Last moved:** round <N>
- **Evidence:** <citation, or, under "could not be decided", the missing input>
- **Conceded:** <partner>, round <N> — <citation>
- **Both positions:** <first partner's> / <consultant's>
```

`Conceded` appears only where a partner gave the claim up; `Both positions` only under open dissent. **A field with nothing to say is left out, not emptied.**

The identifier is short, stable and unique within the discussion (`C1`, `C2`, …), so a later round can name an earlier claim. **Never renumber**: an identifier that moves breaks every reference already written to it.

**The three result classes, and there is no fourth:**

1. **Checked.** The consultant opened the underlying source and the claim holds.
2. **Refuted.** The consultant opened the underlying source and the claim does not hold.
3. **Not decidable from the inputs at hand.** The entry names the input that would decide it.

Disagreement is not a fourth class. The result is the consultant's finding; open dissent records that you refuse it and neither side concedes. Keeping the two apart is what keeps the three classes exhaustive and the stopping rule's count unambiguous.

**Conceding is allowed and wanted.** A concession that does not name the claim that falls and the evidence that felled it is not recorded as one, because without those two the entry says only that somebody stopped arguing.

## Step 4 — `--begin`: the record exists before the first result

Take the stamp, the person and the domain, each guarded:

```bash
STAMP="$(date +%y%m%d-%H%M)"
[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-identity" ] && "$FUSION_PLUGIN_ROOT/bin/fusion-identity"
[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-session-domain" ] && "$FUSION_PLUGIN_ROOT/bin/fusion-session-domain"
```

Never guess the stamp (`rules/fusion-workbench-conventions.md` `## Timestamps`); read `PERSON=` for the second half of `**Filed by:**` and `domain=` for `**Domain:**`. Then `mkdir -p "$WORKBENCH/$OUT_DISCUSSION"` and write one file:

```
$WORKBENCH/$OUT_DISCUSSION/<STAMP>_o_<topic>.md
```

`<topic>` is a kebab-case slug of the one-line topic, lowercase, articles dropped, six words at most. The marker is `_o_` while the discussion is open and `_c_` once it closes, the issues-and-planning vocabulary with no other state in between.

**Write it before round one's result reaches the chat**, carrying every head field it will ever carry, an empty register, `**Rounds:** 0` and `**Outcome:** still running`. A record that appears only after a round is one an interrupted session loses.

The template, with the entry block of Step 3 inside every claim section:

```markdown
# <one-line topic>

---
**Domain:** code | data
**Filed by:** <agent name>, <person>
**Partners:** <first partner> and consultant
**Rounds:** <count actually run>
**Ceiling:** <the ceiling in force, and each extension>
**Outcome:** still running | converged | did not converge after <N> rounds | nothing to check
**Cross-references:** <basenames>

---

## Question

<What was put up for discussion, and the point in the conversation it came from.>

## What held up

<One entry block per claim whose result is checked.>

## What fell

<One per refuted claim. Where a partner gave it up, the block carries **Conceded:**.>

## What could not be decided

<One per undecidable claim, whose **Evidence:** names the input that would decide it.>

## Open dissent

<One per contested claim, carrying **Both positions:**. Omitted when there is none.>

## Recommendation

<Qualified, and binding nothing. Written at `--close`.>
```

`**Partners:**` names you and the consultant, so the record says who held which position. `**Cross-references:**` carries storeless wildcard citations in the form `rules/fusion-workbench-conventions.md` `## Filename Patterns` defines.

## Step 5 — A round

Read the record. Then use the `Agent` tool with target `fusion:consultant` — namespaced, or the dispatch does not resolve. The parameter line comes first, on its own line:

```
**Round:** <the number about to run>
```

Then four blocks, in this order:

1. **The register, verbatim.** The four claim sections exactly as they stand after the previous round, pasted in full — not summarised and not pointed at. The consultant has no chat and reads only what the dispatch carries. In round one this is the claims you open with.
2. **The material.** Paths, commit hashes, and the point in the conversation the discussion came from. Name them and let the consultant open them; do not quote your own conclusions from them.
3. **The return contract.** One result per entry, from the three classes: a citation for checked and for refuted, the missing input for undecidable. It may advance claims of its own, which enter at a result in the same round.
4. **The symmetry statement.** A claim that holds up is a complete and cost-free result, and nothing in this dispatch or in the record rewards a refutation over a confirmation.

**These instructions close the dispatch, and each is stated rather than left to be inferred:**

- **Write no file.** The consultant's own prompt gives it a consultation-report mode and a store to write into; during a discussion it writes nothing at all.
- **You have no `AskUserQuestion`.** It runs non-interactively as a child run, so a question it cannot resolve is an undecidable result naming the missing input — the third class doing the job it exists for.
- **Do not acknowledge and wait.** Your prompt's startup procedure assumes a session you hold directly. There is no second turn: the results come back in this one.

Wait for it. When it returns, fold the results into the register: move each entry into the section its result names, set `**Last moved:**` on every entry whose result changed, add the claims the consultant advanced, and record your own concessions and any open dissent. Then **rewrite the whole file** from the register and set `**Rounds:**` to the count now run. The rewrite happens every round and before the stopping check, never after it.

## Step 6 — The stopping rule

Evaluated after the rewrite, from the register alone. **Condition A is evaluated before condition B.**

**Condition A, convergence.** The register holds no entry with the undecidable result, and that round produced no new refutation: no entry entered at refuted, and no entry moved to refuted from another result.

**Condition B, the ceiling.** The round count reaches eight.

A before B means a discussion that converges on round eight is recorded as converged rather than as not converged. Where the ceiling fires, the outcome is `did not converge after <N> rounds`; that is a regular outcome and is recorded as one, never as a failure.

**The empty register.** A register holding no claims after round one stops under condition A with the outcome `nothing to check`. Without this clause the degenerate case would be recorded as a convergence, which would be false.

**The user may extend the ceiling** by a number of rounds he names. Ask only where the ceiling fired, never assume an extension, and write each extension and the ceiling it produced into `**Ceiling:**`.

`**Rounds:**` carries the count actually run, in every case including the two stops above. The point of recording it is measurement: the count tells the project later what these discussions really cost.

## Step 7 — `--infer`

Prints the register's current conclusions in the chat and **leaves the discussion open**: no round runs, no dispatch goes out, and the file does not move. Print what held up, what fell, what could not be decided and on which missing input, and any open dissent — then the round count and the ceiling in force. Write nothing.

## Step 8 — `--close`

Write the recommendation into `## Recommendation`, replace `**Outcome:** still running` with the one the stopping rule produced, and rename the marker `_o_` → `_c_`. **Nothing else.** Only the marker changes; the stamp and the topic stay exactly as they were. Use `git mv` where the file is tracked, `mv` otherwise.

**The recommendation is qualified and says in its own text that it binds nothing.** A decision record may rest on this discussion; the discussion itself decides nothing. The closed state is terminal, so taking the subject up again means beginning a new discussion that cites this one.

Commit nothing. Tell the user in one line that the record is uncommitted.

## Step 9 — What the user sees

**One line per round**, as the round completes: how many claims stand checked, how many refuted, how many not decidable, and what newly fell in that round. That is the whole of the per-round output. Eight rounds of full wording is unreadable, which would cost the user the thread the visibility was meant to give him.

**The full wording comes once, at the end** — the claims, their verdicts and their evidence — with the summary: which condition fired and after how many rounds, the outcome, and the record's path. On that summary the user decides whether to continue with additions of his own or to close.

## Boundaries

- **Writes one file**, the record, and rewrites it once per round.
- **Dispatches `fusion:consultant`** and nothing else, once per round. No other agent, no sub-dispatch of its own.
- **Commits nothing** and pushes nothing.
- **Decides nothing.** The record holds what was disputed, what survived, what was given up and a recommendation that binds nothing.
- **Claims no work package and changes no status.** Where the store goes is the Origin Rule's answer, resolved once at Step 1: a discussion started under an item's brief lands in that item's container.
- **Overrides no result on the consultant's behalf.** A claim you believe and it refuted is refuted with your position recorded as open dissent — not quietly re-filed under what held up.
