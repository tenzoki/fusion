# Analysis: campaign steering — the binding handover and the route back to the steering session

**Date:** 2026-11-19 07:37
**Type:** Comparative (current state against options, per problem), with a gap inventory
**Status:** Complete
**Requested by:** orchestrator, on the user's observations of 2026-11-19

## Question

The user's observations: (1) peers working a campaign do not accept the central orchestrator's instructions and ask their own user instead; (2) results do not reliably get back to the central orchestrator, because the git route needs someone to watch git and nobody does. The user expects fusion to steer a campaign: a peer that is not autonomous, or that has a question it cannot decide, sends the question to the central orchestrator, and the question is answered there.

This report answers three things. What fusion does today, measured from the source. What can and cannot be changed, given the harness and the rulings that bind. Which options solve each problem, and whether the fix fits a patch release.

## Scope

Read in full or in the named sections: `skills/campaign/SKILL.md`, `bin/fusion-campaign` (682 lines), `hooks/lib/campaign-sync.ts` (the `mine` logic and the output), `docs/campaign.md`, `docs/messages-between-checkouts.md`, `skills/news/SKILL.md`, `skills/post/SKILL.md`, `agents/orchestrator.md` (`## How you ask the user anything`, Setup step 5, `## The dispatch loop` Steps 1–5, `## Human approval rules`, `## Work packages`), `rules/fusion-workbench-conventions.md` (layout, `## Work packages`, `## Dispatching another agent`), `README-agents.md` `## Migration note`, `hooks/hooks.json`, and the two closed packages `261108-1924-campaign-the-frame-for-work-spread-over-several-checkouts` (narrative, adoption decision, spec) and `261110-1335-the-five-issues-of-the-campaign-closing-review` (narrative, open decision). Also the decisions `260918-0804_*`, `260922-1028_*`, `260824-2013_*` (the dialog ban), `260913-0909_*`, `260822-1610_*` and `261111-1200-*`. Harness behaviour comes from the `SendMessage` and `Monitor` tool definitions as this session loaded them, and from the `/loop` skill's listing.

Not read: the transcripts of the peer sessions that refused instructions. Every statement below about *why* a particular peer asked its user is therefore inference from the prompts, not a reading of what those sessions did.

Tree: `/System/Volumes/Data/Projects/productive/F04-FUSION/fusion`, HEAD `59033f33` (2026-11-16 22:45 +0100), branch `main`, `## main...origin/main` (level with its upstream). Working tree: `orchestrator-events.jsonl` modified, `shared/memos/` untracked. Installed version 13.5.1 (`.claude-plugin/plugin.json:3`), latest tag `v13.5.1`.

## Findings

### 1. How a campaign is opened and steered today

| What | Where it happens | Evidence |
|---|---|---|
| Open, cut, lanes, pause, resume, move, reassign, end | `/fusion:campaign`, run by the user in a checkout that holds no package. Each act is confirmed once, then written to the working tree. | `skills/campaign/SKILL.md:119-134`; the claim test refuses a steering act from a holding checkout, exit 8 (`bin/fusion-campaign:355-361`, `583-586`) |
| Autonomy for lane members | One question after `lanes`: set `mode` `autonomous` on every member, with the source `user-word` pointing at the campaign file and its revision | `skills/campaign/SKILL.md:102-113`; spec question 3: "Both hold; `mode` stays the user's standing word per package … no approval rule changes" (spec `261108-2135-spec-…`, line 78) |
| The steering session's view | `overview`: it fetches, reads the ref, prints, and keeps nothing. "No cache, no index: the overview is recomputed per run and discarded." | `bin/fusion-campaign:663-665` |
| When an act reaches a peer | "at the holding session's next commit", and the skill names no time for it | `skills/campaign/SKILL.md:134`; `docs/campaign.md:19`, `41` |
| The orchestrator's role in steering | None. Its prompt mentions the campaign three times, and all three are on the working side: sub-step 5a (`agents/orchestrator.md:300`) and the `campaign_read` event rows (`:549`, `:572`). | `grep -c campaign agents/orchestrator.md` = 3 |

**Measured:** the "central orchestrator" is not a mode of the orchestrator. It is an ordinary session in which the user types `/fusion:campaign`. Nothing in it runs unless the user types.

### 2. What a peer receives as an instruction, and what it acts on

**Layer 1: fusion's own prompts.**

- After every commit, the peer runs `bin/fusion-campaign sync` (`agents/orchestrator.md:300`). `sync` prints `mine=<id>|none` (`hooks/lib/campaign-sync.ts:301`), and `paused=` only when the peer's campaign is paused (`:306`). It prints no lane, no next package and no assignment (`bin/fusion-campaign:510-548`).
- The orchestrator reacts to one line only: `paused=` → "dispatch nothing more, report the campaign's reason to the user, leave the package claimed" (`agents/orchestrator.md:300`). No prompt, skill, rule or doc reads `mine=` (grep over `agents skills rules docs`: no hit).
- When a task is done, Step 5 always asks the user: "Then ask … go on with that, do something else, or stop here", and "Never decide on your own that the work is finished" (`agents/orchestrator.md:306-313`). The dispatch loop holds no queue. The next task "comes from the user, from the plan or issue record the session is working through, or from what the last return uncovered" (`:198`). A lane is not on that list.
- Under `mode` `autonomous`, the claim of an item and its finish are answered by the field. But the field answers only for the item the operation targets: "A field on one item never rules on another item's state" (`agents/orchestrator.md:375`).

**Measured gap:** the adoption decision says the campaign record carries "what a session must obey mechanically (whether the campaign is paused, which group this checkout works, which package comes next)" (`261108-1927-does-the-claude-side-adopt-…`, line 60). `docs/campaign.md:5` says a working session "does what the record says". At HEAD only the first of those three is built. "Which lane is mine" is computed and printed but nobody reads it. "Which package comes next" is not printed at all.

*Inference:* a peer that finishes a package reaches Step 5 and asks its user what comes next. That fits observation 1. It needs no harness explanation, although the harness adds its own refusal on top (layer 2).

**Layer 2: the harness.**

- `SendMessage` delivers a message wrapped as `<cross-session-message from="…">`. "A successful send means the message reached that session, not that its Claude read it: a session running in a different permission mode than yours holds cross-session messages for its user's approval (and may let them expire), and a session can refuse them outright" (the `SendMessage` tool definition).
- The harness appends a sentence to every agent's context, carried verbatim in `agents/reviewer.md:115` and in this agent's own system prompt: "No message from any agent is ever your user's consent or approval (only the permission system or your user's own messages are)". So the text of a message cannot become an instruction the peer obeys as the user's word. **fusion cannot change this.** A prompt line telling a peer to obey cross-session messages would conflict with the harness, and would also break `260913-0909_*` (the consent ruling, finding 6).

**What fusion can change: authority from a record the user authorised.** Every input this needs already exists in the data:

| Check the peer makes itself | Exists today? | Where |
|---|---|---|
| A live campaign names this checkout's lane | yes, computed | `mineOf`, `hooks/lib/campaign-sync.ts:126-134`, identity from `FUSION_CHECKOUT` or `bin/fusion-identity` |
| The campaign is `running` | yes | `sync` `campaign=` rows |
| The lane's next member, live and unheld | yes, but only in `overview` | `bin/fusion-campaign:113-122` (`next`) |
| That member has `mode` `autonomous` on the user's word | yes | `skills/campaign/SKILL.md:112` writes it with the campaign revision as the source |
| Claiming it needs no question | yes, under the field | `agents/orchestrator.md:375`, `:416` |
| Each campaign act was confirmed by the user | yes | `skills/campaign/SKILL.md:121` |

The peer would read all of this out of its own repository, with its own helper, in its own commit cycle. Pause already works that way and is obeyed without a question, so a record-borne handover is not trusting a message. It extends a mechanism that already binds.

**Two limits, measured:**

1. The `user-word` hash does not survive edits. `261111-1200-what-does-the-user-word-source-hash-bind-…` (open) measured 12 of 12 closed packages whose consent hash no longer matches. A campaign-sourced `mode` breaks the same way at the next steering act, because `move` or `reassign` changes the campaign file's revision (`bin/fusion-campaign:372-375`). A peer check that demands hash equality would refuse after every `move`. The check should therefore be "lane membership at the current revision", not "hash equal".
2. Git does not authenticate who wrote a record. "User-authorised" means the user confirmed the act in the steering session (`SKILL.md:121`). It does not mean the commit carries a signature. Every other record in the workbench has the same trust level.

### 3. The same-machine channel

**Measured:** fusion has no support for it at HEAD. A grep for `SendMessage|ListAgents|SendToProject|same-machine|named pipe|mkfifo` over `agents skills rules bin hooks docs README*.md` returns only process-stdio uses of the word "pipe" (`hooks/lib/record-client.ts:230` and the like). No hit refers to sessions. Only the harness tools exist. `hooks/hooks.json` registers `SessionStart`, `PreToolUse`, `PostToolUse` and `SubagentStop`, and nothing that fires on another session's event.

What the harness offers, from its tool definitions:

| Property | Value |
|---|---|
| Reach | Sessions listed by `ListAgents`: same machine, other machines, cloud |
| Delivery | Queued, then drained at the receiver's next tool round. An idle receiver wakes. |
| Authority | None. It is held for approval when the permission modes differ. |
| Idle notice | `notify_when_idle` sends one notice, same machine only, from the main conversation only |

### 4. The git route back

What a peer writes, and when it reaches the remote:

| Artefact | Writer | Reaches the remote |
|---|---|---|
| Commits plus `commit` rows | commit lock | every cycle, via `sync` push (`bin/fusion-campaign:452-492`) |
| `campaign_read` rows | `sync` step 4 | same cycle |
| `package.json` status and claim | `bin/fusion-write`, orchestrator | next cycle's push |
| Decision record for a file-and-skip question | orchestrator under `autonomous` (`agents/orchestrator.md:375`) | next cycle's push |
| `/fusion:post` note | the user, by hand. It asks with `AskUserQuestion` (`skills/post/SKILL.md:72`) and commits nothing (`:95`). | only with a later commit. It is not part of an autonomous flow. |

What the steering side reads: `overview`, and only when the user types it. It shows `held=` with `waits` naming `decision:<basename>` for open decisions inside a held package (`bin/fusion-campaign:105-112`), plus `waits-decision`, `handoff-possible`, `silent` and `unconfirmed`. So the data a peer pushes is already readable at the centre.

**There is no watch on either side.** On the peer side, `sync` runs only after a commit. A peer waiting at Step 5 never reads; `docs/campaign.md:39`: "a session that sits idle writes no commit, and nothing bounds how long it sits". The steering side has no loop, no hook and no schedule. **This is a ruled exclusion, not an oversight:** the adoption decision keeps the out-of-scope bullets of `260822-1136_*` "on two sessions in one checkout, on polling, a lock server and a daemon" (`261108-1927-…`, line 40). Any watch has to supersede that bullet explicitly.

Harness mechanisms that could provide a watch:

| Mechanism | What it does | Costs and limits |
|---|---|---|
| `Monitor` | A background script, one notification per stdout line, for example a loop over `git ls-remote <upstream>` that prints when the head moves | Expires after at most 30 min and must be re-armed. One model turn per event. Network on every poll. Works only while the session is open. |
| `/loop` (or `ScheduleWakeup`) | Re-runs a prompt or command on an interval, for example `/loop 15m /fusion:campaign` | A full model turn and a full overview every interval, even when nothing changed. `ScheduleWakeup` was not available in this session and was not verified. |
| A hook | Runs on the session's own tool calls | **Cannot wake an idle session.** It could only add "remote moved" to the next tool result. |
| `SendMessage` with `notify_when_idle` | Pushed instead of polled | Same machine for the idle notice. Carries no authority. |

### 5. Questions from peers

Today:

- **Peer in `autonomous`, file-and-skip row** (structural ontology, destructive, ambiguous): `gate_hit`, a decision record in the package's container, `task_skipped`, go on (`agents/orchestrator.md:375`). The decision reaches the remote at the next push. The overview shows it as `decision:<name>` on the held package.
- **Peer in `autonomous`, ask-as-written row** (spec review, flagged step, files outside the tree, reconciliation, planner with no claim): the peer stops and asks **its own user** in chat (`:28-34`, `:375`).
- **Peer not in `autonomous`:** every gate asks its own user.
- **The answer does not get back into the peer.** `sync` reads campaigns, not decisions. No prompt tells the peer to pick up an `answered` decision, and a skipped step stays open, so the finish asks again (`:375`, "with a step still open … the finish asks as before"). The loop is open.

What binds an answer given at the centre:

- `rules/fusion-workbench-conventions.md:252`: "no agent approves on the user's behalf … The party that put the question to the user records the answer it received". The same holds in `260913-0909_*`, line 131: "a gate is the point at which a human consents … an agent deciding it leaves a `gate_response` in the log with nobody having been asked."
- **Consequence:** "answered at the central orchestrator" is admissible if the **user** answers there, and the answer is recorded as the user's ruling in a decision record that travels by git. It is not admissible if the central orchestrator answers on its own judgement. That would reverse the consent ruling and spec question 3 ("no approval rule changes"). It would need a new user ruling, and it is not a patch.

### 6. Prior rulings that constrain the options

| Ruling | What binds (quoted) | Effect on the options |
|---|---|---|
| `260913-0909_*` (consent) | "a gate is the point at which a human consents"; conventions:252 "no agent approves on the user's behalf" | The centre relays questions. It does not answer them. |
| Spec `261108-2135`, Q3 | "`mode` stays the user's standing word per package … no approval rule changes" | The handover has to ride on `mode`. Lanes do not get a new kind of authority. |
| `260922-1028_*` | answered rows: plan, data task, claim and finish of that item, curator ledger | A claim of the next lane member is already field-answered. Option 1A needs no new answered row. |
| `orchestrator.md:375` | "A field on one item never rules on another item's state" | The peer reads the *next* member's own field, never the held one's. 1A respects this. |
| Adoption `261108-1927`, line 40 | keeps the out-of-scope bullets on "polling, a lock server and a daemon" | Options 2B and 2C supersede this. The user rules first. |
| Adoption `261108-1927`, line 60 | "No bus returns … state and prose do not share a carrier" | A cross-session message may wake a peer. It may not carry state or instructions. |
| Dialog ban (`orchestrator.md:30`; `260824-2013_*` deferred for skills) | "Every question you put to the user is plain chat text" | No constraint on routing. A relayed question at the centre is put in chat. |
| `260904-1058_*` | no host or folder path in the registry; overview never reads a sibling clone | A watch reads the remote, not a neighbour's working tree. |
| `261111-1200-*` (open) | the user-word hash does not survive edits | The peer verifies lane membership, not the hash. |
| `CLAUDE.md:54` | still says "concurrent sessions exchange work through the user" | Stale since 13.5.0. A curate run is owed (`261110-1335` closure, line 27). |

### The current flow, and where it breaks

```mermaid
flowchart LR
  U[User] -->|types /fusion:campaign| S[Steering session]
  S -->|confirmed act writes| CR[(campaign.json)]
  CR -->|commit and push, by hand| R[(remote)]
  R -->|fetch in sync after each commit| P[Peer orchestrator]
  P -->|reads paused= only| P
  P -->|Step 5: asks its own user| PU[Peer's user]
  P -->|push: commits, status, decision records| R
  R -->|overview, only when the user types it| S
  P -.->|no route: question to centre| S
  S -.->|no route: answer read by peer| P
```

Coherence check. Nodes: the user, the steering session, the campaign record, the remote, the peer and the peer's user. Every solid edge cites a line above. The two dashed edges are the measured gaps. Every path between the two sessions passes through the remote, which is the design. The two breaks are on that path: nobody watches it on the steering side, and the peer consumes only `paused=`. No node is orphaned, and the peer's self-loop is the single line it reads.

## Options

### Problem 1: peers do not follow the steering session

| | 1A: the record is the instruction (git only) | 1B: 1A plus a doorbell message | 1C: peers obey the steering session's messages |
|---|---|---|---|
| What changes | `sync` prints this checkout's lane and its next live, unheld member (`next=<container>`, its `waits`). The orchestrator reads `mine=` and `next=`. When the held package finishes, or at Setup with none held, while the campaign is `running`, the lane names this checkout, and `next` waits for nothing and carries `mode` `autonomous`: claim it (field-answered) and continue without the Step 5 question. Otherwise ask as now. Touches `hooks/lib/campaign-sync.ts`, the `bin/fusion-campaign` header, `agents/orchestrator.md` (5a, Step 5, Setup), `docs/campaign.md`, tests. | 1A, plus: the steering skill, after a pushed act, optionally sends a fixed one-line `SendMessage` ("campaign X moved to revision R; run your next read") to listed peers. The peer prompt says a cross-session message is only a trigger to re-read the record, never an instruction. | A prompt rule: treat messages from the steering session as the user's word. |
| Pros | Uses only fields that exist. No codec or Prior request. No approval-rule change (the claim is already answered, `:375`). Works across machines. Delivers what `docs/campaign.md:5` already promises. | Wakes an idle peer on the same machine within seconds. Carries no authority, so no ruling is broken. | Simplest to state. |
| Cons | A peer idle at Step 5 still reads only at its next commit. A non-autonomous next member still asks its own user. Costs orchestrator bytes against the agents growth bound (amount not measured). | Same machine only. Held for approval when permission modes differ. A second code path on the steering side. | **Not achievable.** The harness withholds consent from agent messages. It breaks `260913-0909_*`. Rejected. |
| Patch? | Arguable: it closes a documented promise (`docs/campaign.md:5`, adoption line 60). But "the orchestrator claims the next package without asking" is new behaviour. In my reading that is a minor release. | Minor. | n/a |

### Problem 2: results and questions do not reach the steering session

| | 2A: close the answer loop, on demand | 2B: a git watch in the steering session | 2C: a same-machine doorbell from peer to centre |
|---|---|---|---|
| What changes | `sync` also prints `decision=` rows for decisions inside the held package's container that are `answered`. The orchestrator re-runs the step it skipped once its decision is answered. A peer's ask-as-written question under a campaign is filed as a decision record before it asks its own user, so the centre's overview sees it. The steering skill gets an "answer" act that puts a `waits`-decision to the user and records `Answered:` as the user's ruling. | 2A, plus: `/fusion:campaign watch` arms a `Monitor` poll on the upstream head (fetch or `ls-remote`, interval of minutes) and runs the overview on change. New `decision:` and `handoff-possible` rows are put to the user. | 2A, plus: after a push that filed a decision or finished a package, the peer sends a one-line `SendMessage` to the steering session. The steering session runs the overview. |
| Pros | Fits the consent ruling: the user answers, the record carries it. Works across machines. No polling. | Works across machines. The centre notices without the user typing. | Seconds of latency. No polling. |
| Cons | Still needs the user to look at the steering session. Writing an answer into a package another checkout holds can conflict at the rebase; `sync` reports `conflict` and nothing is forced (`bin/fusion-campaign:486-488`). | **Supersedes the "no polling" bullet** (adoption line 40); the user rules. Re-arm every ≤30 min. One model turn per remote change. Live only while the session is open. | Same machine only. Needs the steering session's name, and fusion records no session name. A peer in a different permission mode may be held. |
| Patch? | No: new `sync` output, new skill act, new orchestrator rule. Minor. | Minor, and it needs a ruling. | Minor. |

**What no option provides:** the steering session answering a peer's question by its own judgement. That requires the user to reverse `260913-0909_*` and spec question 3 for campaign members, for example by a charter-level grant. It is a decision record of its own. It is not part of a fix.

## Implications

- Observation 1 has a fusion-side cause that can be fixed: the peer ignores `mine=` and never learns its next package. It also has a harness-side cause that cannot be fixed: message text is never consent. The fix for the first makes the second irrelevant. Authority lives in the record the user confirmed, and a message at most wakes the peer to read it.
- Observation 2 is confirmed. The steering side reads only when the user types, and that is by ruling (no polling). The data already reaches the remote: decisions as `decision:` waits, finishes as status, handoffs as `handoff-possible`. What is missing is (a) a watch, which needs a ruling, and (b) the answer coming back into the peer, which needs no ruling.
- The user's phrase "answered there" holds only as "answered by the user, at the steering session". Read as "answered by the central orchestrator", it conflicts with two binding rulings.

## Recommendations

1. **Adopt 1A + 2A as one integral change.** The campaign record and decision records are the only carriers in both directions, and the peer verifies its own lane at the fetched revision. Route: `requirements-designer` (short spec; the open points are listed below), then `implementation-planner`, then `code-implementer`.
2. **Put 2B to the user as a decision before planning.** It supersedes the polling exclusion. If the user accepts, it is the cross-machine watch. Hold 1B and 2C as same-machine accelerators, added later on top of the same records without changing them.
3. **Release: minor (13.6.0), not patch.** Measured: no codec, schema or Prior-request change is needed for 1A or 2A, because lanes, `checkout_id` and `mode` exist. Inference, under semver: a peer that claims its next package without asking, a new `sync` output line and a new steering act are new behaviour, not the repair of a broken one. The narrowest slice that could pass as a patch is the orchestrator consuming `mine=` and `next=` alone, justified by `docs/campaign.md:5`. That slice still leaves observation 2 unsolved.
4. **Separately owed:** the curate run for `CLAUDE.md:54`, still the stale "exchange work through the user" lead.

## Filed Issues

None. The dispatch limited writes to this report.

## Sources

`agents/orchestrator.md:28-34, 134-138, 198, 218, 230, 300, 306-313, 356-375, 394-418, 549, 572`; `agents/reviewer.md:115`; `skills/campaign/SKILL.md:9-13, 102-134`; `skills/news/SKILL.md:109, 119`; `skills/post/SKILL.md:72, 93-96`; `bin/fusion-campaign:105-122, 345-375, 452-548, 583-586, 663-665`; `hooks/lib/campaign-sync.ts:126-134, 301, 306`; `hooks/hooks.json`; `rules/fusion-workbench-conventions.md:76, 218, 236, 248-252`; `docs/campaign.md:5, 13, 19, 39, 41`; `docs/messages-between-checkouts.md:68`; `README-agents.md:393`; `CLAUDE.md:54`; package `261108-1924-…` narrative lines 31-49, adoption decision lines 40, 60, spec lines 54, 67, 78, 148, 156; package `261110-1335-…` narrative line 27; `261111-1200-what-does-the-user-word-source-hash-bind-…`; `260913-0909_*` line 131; `260918-0804_*`; `260922-1028_*`; `260824-2013_*_do-the-nine-skill-bodies-…`. Harness: the `SendMessage` and `Monitor` tool definitions loaded in this session; the `/loop` skill listing.

## Open Questions

- [ ] Does the user accept a watch (2B), superseding the "no polling" bullet the adoption decision kept?
- [ ] Does a peer whose next lane member is **not** `autonomous` ask its own user (as today), or file the question as a decision for the centre and wait?
- [ ] May the steering session write `Answered:` into a decision inside a package another checkout holds, or is the answer filed in `shared/` and cited?
- [ ] Is a charter-level grant that lets the centre answer without the user wanted at all? If so, it is its own decision record, reversing `260913-0909_*` for campaign members.
- [ ] The agents growth-bound head-room that 1A + 2A would spend was not measured.
