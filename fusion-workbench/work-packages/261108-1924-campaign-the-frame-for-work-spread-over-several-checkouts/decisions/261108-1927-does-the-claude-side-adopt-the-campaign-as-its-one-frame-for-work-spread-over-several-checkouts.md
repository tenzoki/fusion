# Does the Claude side adopt the campaign as its one frame for work spread over several checkouts?

---
**Domain:** code
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261105-1156-campaign-as-the-frame-for-work-spread-over-several-checkouts.md`, `261009-0644-host-parity-claude-and-prior.md`, `260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`, `260909-1808_*_may-a-helper-compute-an-order-over-work-items-after-the-portfolio-layer-goes.md`, `README-agents.md` `## Migration note` (the bus-protocol bullet), `260927-2319_*_may-an-agent-originate-a-work-package-on-its-own-initiative.md`, `260904-1058_*_does-a-registry-entry-carry-hostname-account-name-and-folder-path.md`, `260922-1059_*_is-a-record-in-issues-a-candidate-or-an-admitted-work-item.md`, `260927-2304-fusion-dual-host-design-review.md`, `261108-1924-campaign-the-frame-for-work-spread-over-several-checkouts.md`

---

## Question

The host-parity analysis left one scope decision open. At `261009-0644-host-parity-claude-and-prior.md:136` it classes Prior's `work-package-manager` role and the campaign workflows as Prior-side orchestration and adds that whether fusion should author them "is a scope decision, not a parity defect". The question this record answers is that decision: does the Claude side implement the campaign, typed in the shared codec as `fusion.campaign/v1` (`codec/schemas/campaign.schema.json`) and used by no Claude-side code, as its frame for work that four to seven checkouts carry in parallel?

The choice has to be made now because the need is already being met by hand and the hand-made answer has failed in a measurable way. The consuming project `ax-k2-3` cut its pipeline work into three lanes in two prose plans; four days after approval the lane plan no longer described the work, four of the five held packages sat in none of its queues, two checkouts held packages outside their lane, and nothing reported any of it (`261105-1156-campaign-as-the-frame-for-work-spread-over-several-checkouts.md` `## Context`). The user has since commissioned the extension as work package `261108-1924-campaign-the-frame-for-work-spread-over-several-checkouts.md`, whose first step is this record. The specification that follows needs the frame settled before it names fixed points.

## Options

1. **Adopt the campaign as the one frame, and build no lane or group concept beside it.** The Claude side implements the campaign for per-checkout queues over work packages, with an overview computed from pulled state and a steering orchestrator in a checkout that holds no package.
   - Pros: the data shape exists and the codec already validates it; `codec/schemas/campaign.schema.json` types the charter, the lifecycle state, the candidate register and the formation plan, and admits `register` and `formation` as `null` for a campaign that never used them (schema `properties`, lines 15 to 26). The lifecycle the steering need asks for (pause, amend, end with a stated outcome) is the schema's own state set, `draft` through `archived` with `paused` and four terminal outcomes among them (`$defs/state`, line 153). The grouping rule the need asks for, packages that touch one code area run in sequence inside one checkout, is the rule the report found Prior's `Form` already implementing and the lane analysis arriving at by hand (report `## Analysis` section 1; Prior `packages.go:86` read by the report at `374a322`, not re-read here). One concept keeps one name and one format in a record format shared with a second host.
   - Cons: three differences stand between Prior's implementation and this need, each of which the specification has to settle: Prior groups candidates into packages where the need groups packages into per-checkout queues; Prior's collaboration refuses any plan without exactly two writers where the need has four to seven; Prior's writers live in workspaces it owns on one machine where the need's writers are independent clones that meet only through `origin/main` (report section 1, table). Every field a session must obey is a format change negotiated with Prior (report section 7; `## Constraints` below). *Inference:* the charter as typed carries Prior-shaped required fields (`budget_account`, `backend_policy`, `limits`, schema line 82) whose Claude-side meaning nobody has stated yet, so adopting the shape is not yet adopting a filled charter.
2. **A Claude-only lane or group concept beside the campaign.** A format of fusion's own for "groups of packages assigned to checkouts", leaving the campaign to Prior.
   - Pros: it could fit the need exactly, with no caps inherited from Prior's formation policy and no two-writer bound; a first version could stay in prose or in a Claude-local file and defer every Prior request.
   - Cons: the method would carry two names and two formats for one thing in a repository whose record format is a contract with a second host (report section 1). A Claude-local file a session must obey is either untracked, in which case it never reaches another checkout (the class L reasoning of `260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` `## The state partition`), or tracked, in which case it is a format change after all. The `extensions` slot cannot carry it (`## Constraints`). It contradicts the user's words in the work package: "kein zweites Konzept daneben".
3. **Keep the status quo: a prose plan per project, as `ax-k2-3` did.** No frame, no helper, no format change.
   - Pros: nothing to build and nothing to negotiate.
   - Cons: the status quo is the measured failure in `## Question`. The lane assignment existed only as prose, no helper read it, and the one rule meant to keep it current (a single checkout transitions the plan) was not followed once (report `## Context`). Two of the seven overview conditions the report lists were verifiably true at the HEAD it read and visible nowhere (report section 3).

## Rulings this adoption supersedes

Three earlier rulings stand in the way of option 1, and this record is where their supersession is recorded. None of the three was recorded as superseded before (report section 6). Each subsection states where the ruling stands, what it said, and what replaces it; the specification inherits the distinctions drawn here.

### 1. Visibility of another checkout's work is presence only

**Where it stands.** `260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`, a plan record in the shared plan store, control state `open` at HEAD `eab05b13`. The ruling is in `## What the user settled, and what it rules out`, answers 4 and 5; in `## Out of scope`; in the third bullet of `## Constraints`; and in the last sentence of `## Directive`.

**What it said.** Answer 4: visibility of another's work is "presence only", and "queue, running task and dashboard stay private". Answer 5: what travels over git is "the existing event log alone", "accepted as final, not deferred". `## Out of scope` rules out "live presence of any kind. No polling, no shared dashboard, no lock server, no daemon" and "sharing the queue, the running task, `orchestrator-live.md` or `agentstate.yaml`". The Directive closes with "no session ever reads another session's queue, dashboard or running task".

**What falls.** The privacy of the queue and of the held package in answer 4: under the campaign, which group a checkout works and which package comes next are record state every checkout reads (report section 4). The "event log alone" of answer 5: the campaign record and the group membership travel as records beside the package control files, which already carry status and holder (report section 3). The two `## Out of scope` bullets on a shared dashboard and on sharing the queue, and the Directive's clause about the queue: the overview above the checkouts is a shared view of the queues, computed in any checkout from a fetched ref.

**What stands.** Answers 1 (several checkouts, git as the transport, also `260822-1610_*_how-does-fusion-support-several-people-working-one-project-at-once.md`), 2, 3, 6, 7 and 8. The partition's principle that live state never travels: `.session-marker`, `.guard-state/`, `.commit-lock/` and the running dashboard stay in the checkout, and the campaign enters as a record of class R1, not as live state. The Constraints sentence that nothing in fusion may assume two orchestrators run safely against one workbench. The `## Out of scope` bullets on two sessions in one checkout, on polling, a lock server and a daemon: the overview is as old as the slowest checkout's last push and says so (report section 3), which is the after-the-fact visibility answer 1 chose, widened from presence to recorded queue state. Read strictly, "no session reads another session's live state" survives; what is withdrawn is that the queue and the held package count as private.

**How it is recorded.** A plan carries no `superseded` state (`rules/fusion-workbench-conventions.md` `## State Markers — issues and planning`), so the withdrawal lives in this record and is cited from here. What the plan's own closure route does with it stays with the user, as its reconciliation log already says.

### 2. "No agent asserts a ranking, and no field holds one"

**Where it stands.** `rules/fusion-workbench-conventions.md` `## Work packages`, the paragraph on `depends_on`, which closes with that sentence and cites `260909-1808_*_may-a-helper-compute-an-order-over-work-items-after-the-portfolio-layer-goes.md` (option 3) as its source. That record stands at `answered` in the container of `260909-1700-cut-fusion-to-working-minimum`.

**What it said.** The cut specification's C6 had written "Order is the user's and is not computed", aimed at the playmaker's ranking, which "asserts a ranked list from three prose signals with no stated arithmetic" (the record's `## Question`). The user ruled option 3: a helper computes the order from confirmed prerequisite edges and the user overrides where he wants to. The conventions render the ruling as `bin/fusion-work-order` computing the order over confirmed edges, followed by the sentence quoted above.

**The careful reading, which the specification inherits.** The report's section 6 reads the sentence in two halves, and this record adopts that reading. A group assignment and an order computed by a helper from declarations the user has confirmed is consistent with the ruling; it is the ruling's own shape, confirmed inputs in and a computed order out, and the per-checkout queue is the existing order restricted to one group's members (report section 2). What this record withdraws is the second clause alone, that no field may hold an assignment or an order: a campaign record holds which group a checkout works and which package comes next, and a session reads it (report section 4). What stays excluded, in full, is an agent setting priorities by judgment: a ranking from prose signals, a priority an agent asserts, an order nobody confirmed. The test the specification carries forward is the writer of the field: a helper writing from user-confirmed inputs is admitted, an agent writing from its own judgment is not.

**How it is recorded.** `260909-1808_*` itself does not move: option 3 stands in full, and this record narrows only the sentence the conventions derived from it. Restating that sentence in `rules/fusion-workbench-conventions.md` `## Work packages` is work for the specification and whoever edits the rule, not for this record.

### 3. Concurrent sessions exchange work through the user

**Where it stands.** `README-agents.md` `## Migration note`, the bullet "Bus protocol removed (v3.15.0)", at line 392 of HEAD `eab05b13` (the report cites it at 391, read at `af36d055`).

**What it said.** Earlier versions shipped a workbench-mediated message bus under `fusion-workbench/bus/`; it was removed in v3.15.0, and "concurrent agent sessions exchange work through the user (copy-paste between chat windows) again".

**What replaces "through the user".** Campaign state and the user's rulings travel as records carried by git: the campaign record for what a session must obey mechanically (whether the campaign is paused, which group this checkout works, which package comes next), and decision records for a discrepancy the user resolved (report section 4). A working session reads them at a defined point, which the specification names; the report's inference, unmeasured, is the pull before each commit that the consuming project's working rule 6 already prescribes. Today no such point exists: `agents/orchestrator.md` mentions neither `/fusion:news`, nor `git fetch`, nor `git pull`, nor the forum store (a grep for the four returns nothing at HEAD). No bus returns. The message store stays exactly as `docs/messages-between-checkouts.md` documents it, a note a person reads with no addressing, no reply and no thread (`## What it does not do`), and state and prose do not share a carrier.

**What stands of the note.** Its historical statements: the bus was removed, the bus-era decision records left the workbench, and the reviewer files findings as issues rather than messages.

## Rulings this adoption keeps

The design needs none of the following broken, so each stands as it is (report section 6):

- **One claimed package per checkout, and release or transition by the holder only** (`rules/fusion-workbench-conventions.md` `## Work packages`, `## Path Resolution (Pfadauflösung)`). A group is an ordered queue for one checkout, and the checkout still holds one package at a time, so the resolver's refusal of two claims is untouched (report section 2).
- **A `depends_on` entry stands on the user's confirmation** (`## Work packages`, binding records cited there). Declared touched areas follow the same route: proposed by an analysis, confirmed by the user, read by a helper (report section 2).
- **The registry carries no host name and no folder path** (`260904-1058_*_does-a-registry-entry-carry-hostname-account-name-and-folder-path.md`, state `implemented`). The overview therefore reads a fetched ref and never a sibling clone on the same disk (report section 3).
- **One `issues/` store, with the state as the classification** (`260922-1059_*_is-a-record-in-issues-a-candidate-or-an-admitted-work-item.md`, state `answered`). It bears on whether a Claude-side campaign needs a candidate register at all; the schema admits `register: null`.

One ruling already cleared the way: `260927-2319_*_may-an-agent-originate-a-work-package-on-its-own-initiative.md` (state `implemented`) withdrew the bound that only the user files a package, so a campaign that forms packages no longer contradicts the conventions, as the dual-host review had found it did (`260927-2304-fusion-dual-host-design-review.md`, finding G1).

## Constraints

- **The `extensions` slot carries nothing a session must obey.** `codec/schemas/common.schema.json:254-256` defines `extensions` as preserved verbatim and states that "ignorance of an extension may change neither state nor an execution decision; otherwise it needs a required feature in the workbench manifest". A field that stops a session, assigns it a group or names its next package is exactly such a decision, so it is a typed field, not an extension.
- **Every format change goes through a numbered request in `codec/fixtures/prior/REQUESTS.md`.** The file is append-only; at HEAD `eab05b13` its latest numbered entry is request 79, the open release request for 13.4.4 (the report, at `af36d055`, counted 77). Declared areas per package, group membership and a field a session obeys are each such a request, and the work package's step c) puts them before the plan.
- **The campaign's shape is `fusion.campaign/v1` as typed**, `register` and `formation` nullable; a Claude-side use fills it, it does not fork it.
- **Approvals are asked in the orchestrator's own loop and nowhere else** (`rules/fusion-workbench-conventions.md` `## Dispatching another agent`), which is why the steering role is the orchestrator's, in a checkout that holds no package, as the work package states.

## Recommendation

We recommend option 1: the campaign becomes the one frame on the Claude side for work spread over several checkouts, and no lane or group concept is built beside it. The recommendation is the report's own, `261105-1156-campaign-as-the-frame-for-work-spread-over-several-checkouts.md` `## Recommendations` item 1, and the supersession recorded above is its item 2, carried out in the same act as the report asked. The user ruled for it in chat on 2026-11-08, in the words the work package narrative quotes: "Es soll der eine Rahmen für diese Arbeit werden, kein zweites Konzept daneben."

What the specification settles next, not answered here, are the report's eight open questions (`## Open Questions`): the level at which a Claude-side campaign groups; the name of the per-checkout queue; whether a package declares touched areas and a size in fields of its own; the point at which a working session reads campaign state and how long an intervention may take to arrive; how a checkout confirms it has read a ruling; whether Prior's two-writer bound stays; whether a charter replaces the per-package `autonomous` mode; and how much of the head-room on `agents/*.md` and `skills/*/SKILL.md` is spent.

---
Answered: 261108-1924-campaign-the-frame-for-work-spread-over-several-checkouts.md `## Directive` — option 1, the campaign is the one Claude-side frame for work spread over several checkouts, and the three rulings in `## Rulings this adoption supersedes` are superseded as recorded there; ruled by user, Kai Stalmann <ks@qantr.com>.
