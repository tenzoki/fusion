# Consultation: review of the campaign spec

**Date:** 2026-11-08 22:12
**Status:** Complete
**Requested by:** Kai Stalmann, in chat ("review 261108-2135-spec-campaign-the-frame-for-work-spread-over-several-checkouts.md")

## Question

Does `261108-2135-spec-campaign-the-frame-for-work-spread-over-several-checkouts.md` stand as the specification the work package `261108-1924-campaign-the-frame-for-work-spread-over-several-checkouts.md` runs on, or does it need a revision round first?

## Context

The spec is filed at `open` (`.record.json`, `control.state`), written by the requirements-designer, uncommitted at review time (`git status`: the `plans/` directory is untracked), and not yet adopted into the package's `active_documents` (`package.json` line 28: `[]`). The package is claimed by checkout `114caf11`. The adopting decision `261108-1927-does-the-claude-side-adopt-the-campaign-as-its-one-frame-for-work-spread-over-several-checkouts.md` stands at `answered`.

Every record the spec cites was located in the workbench (nine basenames, `find` over the live tree, none missing); the two foreign records were opened in `ax-k2-3`'s workbench and say what the spec says they say (`261031-1733-…` §4 "Contention map", §5 "Lanes"; `261101-1006-…` rule 6, "Pull with rebase before each commit and push after each"). The seven fixed points of the consultation's Recommendation 4 are each present in the spec (Terms, C1, C2, C3, C5). The schema claims were checked against `codec/schemas/campaign.schema.json`: `campaigns/<id>/campaign.json` (line 5), `paused` in the state enum (line 153), the four terminal outcomes (line 157), `register` and `formation` nullable (lines 15 to 26), the Prior-shaped charter fields (line 82), `resources` on the formation candidate (line 335) and on no `fusion.package/v1` property. The latest Prior request is 79 (`codec/fixtures/prior/REQUESTS.md:7112`). The growth-bound figures were re-derived from the test's baselines and match the spec exactly: 3 921 bytes left on `agents/`, 25 on `skills/`; the test passes (12 of 12).

## Analysis

Ordered by how much each one costs if it reaches the plan unchanged.

### 1. The read point "the pull before each commit" names a pull the orchestrator cannot perform

The spec fixes the working session's read point as the pull before each commit (Terms, "Working session"; C3 criterion 4; charter rule "pull with rebase before every commit, push after every one"). In the orchestrator's commit step the tree is dirty when the commit is about to be made: the executor's edits are in the working tree and `### Step 4 — commit` stages and commits them inside the lock with no pull anywhere in the step (`agents/orchestrator.md:260-300`; a grep of the prompt for `fetch`, `git pull`, `/fusion:news` and `forum` finds nothing, which the spec itself notes under `## Open for Planner`). A rebase pull on a dirty tree is refused by git; run in this checkout now, with its dirty event log, `git pull --rebase` answers "Pull mit Rebase nicht möglich: Sie haben Änderungen, die nicht zum Commit vorgemerkt sind". The way git offers out, a stash or `--autostash`, is the whole-tree command the orchestrator forbids by name (`agents/orchestrator.md:242`, "`git stash` … rewrite files outside the named scope").

So the order that actually works in a fusion session is commit, then pull with rebase, then push; the read of the campaign record then sits after the commit, not before it. The consuming project's rule 6 reads "before each commit" because its sessions committed by hand; the spec carried the phrase over into a procedure with a different shape. The consequence for the acceptance criteria: C3 criterion 4 ("At the pull before each commit, a working session reads …") and criterion 5 ("commits and pushes the work it holds") describe the same moment from two sides and will be read as two moments. The fix is one sentence: the read point is the pull with rebase that follows each commit and precedes its push; "at the holding session's next commit" (criterion 8) stays true as the user-facing phrase.

### 2. Two cardinalities in `## The shape` are asserted and wrong

"Coherence check: nine nodes, eleven edges." Counted off the Mermaid source (lines 14 to 38): seven nodes (`SO`, `CR`, `OV`, `GIT`, `W1`, `W2`, `W3`; the three `subgraph` blocks are groupings, not nodes) and ten edges (lines 19, 20, 30, 31, 32, 33, 34, 35, 36, 37). The sentence is the pattern `rules/critical-stance.md` §5 names: a number beside its list, drifting from it. Either count the members in the sentence or drop the figures; the prose that follows (one high-fan-out node, three alike working checkouts) stands on its own.

### 3. The clarification round is cited by number and letter, and recorded nowhere

The spec grounds twelve of its decisions in "question N option a" (N from 2 to 7) and three in "ruling A:2", "B:1", "C:1". No file in the workbench carries those labels except the spec itself (`grep -rlE 'ruling [ABC]:[0-9]'` over the workbench returns the spec alone), and the spec never lists the seven questions or says what A, B and C are. A reader can reconstruct most of it from the "Decisions made" lines (2 is areas and size, 3 autonomy, 4 read confirmation, 5 the effect of `paused`, 6 the surface, 7 the source), but question 1 is named nowhere, and A, B, C can only be guessed to be the three the user asked to settle first (grouping level, read point, two-writer bound, in the package narrative's last paragraph). The requirements-designer's own rule is that an answer given in the round "is a line of the spec" (`agents/requirements-designer.md:107`), so the home exists and is empty. One table under `## Terms` or a short `## Clarification round` section, seven rows plus three, closes it.

### 4. C1's full tier reads a "stated window" the record format has no field for

C1 criterion 5 reports "a lane with no held package and no push within the campaign's own stated window". The charter as typed carries `limits` with five integer bounds on attempts, failures, reviews and resource units (`campaign.schema.json:65-77`) and `stop_conditions` as a list of strings (line 92); no field holds a time window, and `additionalProperties: false` on both the root and the charter (lines 7, 81) means none can be added without a schema change. C4 asks Prior three questions and says "three questions, not more", leaving open only whether a fourth is owed for the working-rule string. The window is a second candidate for that fourth question, or it lives in a charter string field the planner picks, or the criterion is reworded to a fixed phrase ("no push in 24 hours"). The spec has to say which; at the moment C1 depends on a value nothing defines.

### 5. The Claude-side writer owes Prior-computed hashes the spec does not mention

Every steering act "is a write to the campaign record" (C3). `fusion.campaign/v1` requires `state.charter_hash` as a `prior_revision`, which is "hex SHA-256 over encoding/json output … Not a fusion sha256: the hashed bytes are Go's marshalling" (`common.schema.json`, `$defs/prior_revision`), and the schema's own description says charter_hash "equals Prior's charterHash over the charter" and each revision "equals Prior's hash of the aggregate with Revision cleared" (`campaign.schema.json:5`). A Claude-side writer that does not reproduce Go's marshalling cannot produce a value Prior would verify. `## Open for Planner` lists the Claude-side values for the charter's required fields but not these state-level hashes. This is a planner question, but it belongs in the list and possibly in the Prior request: is a Claude-written campaign allowed a hash Prior will not verify, or a null, or does Prior publish the canonical bytes? Left unnamed, it surfaces in the first implementation step as a schema validation failure.

### 6. One C2 criterion carries an exception nothing motivates

C2 criterion 3: overlapping declared areas "never land in different lanes unless a confirmed edge forces the order across lanes". A dependency edge says A before B. A lane is sequential, so A then B inside one lane satisfies every edge between them; no edge can *force* two packages apart. The clause may be aiming at balancing (a chain too long for one lane), or at a transitive path through a third lane, but neither is what it says. As written it is a case split with a branch nothing enters (`rules/critical-stance.md` §4). Either state the real reason a pair may be split and the hand-off it creates, or drop the exception.

### 7. The growth-bound authority is cited one record too far

C5: the user ruled on 2026-11-08 that the bounds may be raised as this work needs, "under `260927-2319_*_does-the-growth-bound-on-shipped-text-yield-to-the-dual-host-prompt-set.md`". That record's answer is scoped: "the growth bound does not stop the dual-host work … the concrete measure is decided in the plan for FH03 at measured figures" (its `Answered:` line). It rules on a different piece of work. The authority for this raise is the user's word of 2026-11-08, and the spec is where that word is recorded; the 09-27 record is precedent for the *method* (raise head-room by the measured figure, log it in `README-hooks.md`, move no baseline), not the ruling itself. One word changes it: "as `260927-2319_*` did for the dual-host work", not "under".

### 8. Smaller points, each one line

- The spec is unfiled against the package: `active_documents` is empty. `adopt-plan --role spec` rides the acceptance (`rules/fusion-workbench-conventions.md` `## Work packages`), so it is owed by whoever accepts this spec, and the `plans/` directory is still untracked.
- `.record.json` has `control.criteria: []` while the spec carries 36 acceptance boxes; `bin/fusion-write create --kind plan` takes `--criteria` (its header, line 63). With none declared, no criterion can ever be marked met in the control file. *Inference:* the requirements-designer prompt's filing line (line 123) names no `--criteria`, so this is a prompt gap rather than this spec's lapse; it costs this spec its tickable criteria all the same.
- C3 criterion 4 introduces a fifth machine-written row kind into a log whose module says "Four row kinds are machine-written now, and only four" (`hooks/lib/orchestrator-events.ts:18`). `bin/monitor` reads that log, and C1 says the monitor is unchanged. *Inference:* the plan needs one check that the monitor ignores an unknown row kind rather than failing on it; the spec could name that as a criterion under C3.
- C1 "when that checkout last pushed" is derivable: event rows carry `checkout` (`orchestrator-events.ts:265`, and the live log's rows), and the push time is the fetched ref's commit. Commits themselves carry no checkout, so the helper must join through the log, not through `git log --author`; worth one line under `## Open for Planner`.

### What checked out and needs no change

The three builds in the brief's order; the two-tier overview; declared areas by the `depends_on` route; N as input; the two-writer deviation recorded in three places; `extensions` carrying nothing a session obeys, quoted from `common.schema.json:256`; the request to Prior before the plan with its fallbacks; the single-writer property as acceptance and the mechanism left to the planner; the restated conventions sentence with both halves preserved; `260909-1808_*` untouched. The spec reads cleanly in the writing profile and its acceptance criteria are testable by someone outside the codebase, with the four exceptions above.

## Recommendations

1. **Return the spec to the requirements-designer for one revision round** carrying items 1 to 7; none of them changes the design, and items 1, 4 and 6 change what the planner would build. Dispatch: `requirements-designer`, with this report as input.
2. **Item 1 first.** Reword the read point as the pull with rebase after each commit, before its push, in Terms, C3 criteria 4 and 5, and the charter rule; keep "at the holding session's next commit" as the user-facing phrase.
3. **Item 4 goes to C4 as a decision**: fourth question to Prior, a charter string, or a fixed phrase; the spec picks one.
4. **Item 5 goes to `## Open for Planner`** and, if the planner cannot answer it from the codec alone, into the Prior request as a question about verifiable hashes on a Claude-written campaign.
5. On acceptance, **adopt the spec** into `active_documents` with `--role spec` and commit the pair; both are the accepting session's acts, not the designer's.
6. **No issue is filed from this review.** Every finding is a change to a draft record under review; the revision round is its fix, and a defect record per finding would duplicate this report. If the user prefers issues, items 1, 4 and 6 are the three worth a file each.

## Open Questions

- [ ] Does the user want the clarification round (item 3) in the spec, or is the chat transcript enough for him? The spec's own rule says the spec.
- [ ] Should the fifth row kind (read confirmation) be named to Prior at all, given the event log is not part of the shared format? *Speculation:* no, the log is Claude-local; but the request should say so, since the campaign revision it names is Prior's field.

## Sources

- `fusion-workbench/work-packages/261108-1924-…/plans/261108-2135-spec-campaign-the-frame-for-work-spread-over-several-checkouts.md` and its `.record.json`
- `261108-1924-campaign-the-frame-for-work-spread-over-several-checkouts.md`, `package.json`
- `261108-1927-does-the-claude-side-adopt-the-campaign-as-its-one-frame-for-work-spread-over-several-checkouts.md`
- `261105-1156-campaign-as-the-frame-for-work-spread-over-several-checkouts.md` (`## Recommendations`, `## Open Questions`)
- `foreign:ax-k2-3:261101-1006-three-checkouts-work-the-pipeline-lanes-in-parallel.md` (rule 6), `foreign:ax-k2-3:261031-1733-pipeline-work-dissected-into-parallel-checkout-lanes.md` (§4, §5)
- `260927-2319_*_does-the-growth-bound-on-shipped-text-yield-to-the-dual-host-prompt-set.md` (`Answered:` line)
- `codec/schemas/campaign.schema.json`, `codec/schemas/package.schema.json`, `codec/schemas/common.schema.json`; `codec/fixtures/prior/REQUESTS.md:7112`
- `agents/orchestrator.md:242`, `:260-300`; `agents/requirements-designer.md:107`, `:123`
- `hooks/lib/orchestrator-events.ts:18`, `:265`; `hooks/lib/__tests__/surface-growth-bound.test.ts` (baselines, `AGENT_HEAD_ROOM`, `SKILL_HEAD_ROOM`; run: 12 passed)
- `bin/fusion-work-order` header; `bin/fusion-write` header line 63; `.gitattributes`
- `git pull --rebase` in this checkout at 2026-11-08 22:1x, refused on the dirty tree
