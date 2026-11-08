# Consultation: the campaign as the frame for work spread over several checkouts

**Date:** 2026-11-05 11:56
**Status:** Complete
**Requested by:** Kai Stalmann, in a consultant session in the fusion repository

## Question

Kai runs a consuming project in which between four and seven checkouts work packages in parallel. He asks for a solution in fusion that is conceptually sound, integrated and durable, covering three needs:

1. **Planning.** Compute sensible groups of work packages across the whole store (how many groups, what each contains) and the sequence inside each checkout.
2. **An overview above the checkouts.** A run monitor with messages a user understands.
3. **Steering.** A way to intervene when the user sees a discrepancy between groups of agents and has to resolve it.

He also asked which agent takes the steering role. This report is meant as the brief a specification can start from.

## Context

Every statement below was read at fusion `af36d055`, at Prior `374a322` (`/Users/kai/Downloads/Projects/productive/F09-Prior`) and at the consuming project's clone `ax-k2-3`, HEAD `56c19983a`, level with its `origin/main` as of its last fetch.

### The need, as the consuming project already met it by hand

The consuming project holds two records that state the need and a manual answer to it:

- `foreign:ax-k2-3:261031-1733-pipeline-work-dissected-into-parallel-checkout-lanes.md` cuts 23 pipeline packages into three lanes by code area, lists the files each package touches, names the cross-lane files and proposes ten dependency edges. Its §5 also gives the cut for two and for four checkouts.
- `foreign:ax-k2-3:261101-1006-three-checkouts-work-the-pipeline-lanes-in-parallel.md` assigns one lane to each of three checkouts. It carries an ordered queue per lane, an ownership table, eight sync rules for shared files, three hand-offs, the user decisions each lane waits on, and seven working rules. Kai approved it on 2026-11-01.

Four days later the plan no longer describes the work, and nothing reports that:

| Lane | Checkout | done | held | open or paused | dropped |
|---|---|---|---|---|---|
| 1 plan to run | hazel-harbor | 2 | 0 | 1 | 0 |
| 2 selection and catalog | jade-jetty | 0 | 0 | 8 | 1 |
| 3 AI calls | mild-forge | 3 | 1 | 5 | 0 |

The plan's control record still reads `open` with all nine steps `open`. Four of the five packages held at that HEAD sit in none of the three queues. Two of the three lane checkouts hold a package outside their lane, and two further checkouts that hold packages are unknown to the plan. The store carried 55 open and 15 paused packages, and ten checkouts are registered.

Kai calls this plan a hack. We agree with the description: the lane assignment exists only as prose in one plan, no helper reads it, and the one rule meant to keep it current (working rule 7, a single checkout transitions the plan) was not followed once.

### What fusion provides today on the Claude side

- **Several checkouts with git as the transport.** Decided and implemented: `260822-1610_*_how-does-fusion-support-several-people-working-one-project-at-once.md`.
- **One holder per package.** `claim.checkout_id` names the checkout, a second claim inside one workbench is refused, and across checkouts a double claim surfaces as a merge conflict on `package.json` (`rules/fusion-workbench-conventions.md` `## Work packages`).
- **One package per checkout.** The path resolver reads the claim to find the package in scope and refuses two claimed packages with exit 3 (`rules/fusion-workbench-conventions.md` `## Path Resolution (Pfadauflösung)`).
- **A computed order.** `bin/fusion-work-order` orders the live packages over the confirmed `depends_on` edges and marks each `ready`, `blocked` or `paused`. Its item row has five columns: order, depth, blocks, readiness, name. It prints no holder and no grouping.
- **A standing approval per package.** `mode` `autonomous`, written on the user's word.
- **Presence.** `bin/fusion-events presence` lists every other checkout that started a session in a window, with the package named on its latest dispatch. Its `scope=pulled` line states the limit: it reflects only what this checkout has pulled.
- **A checkout registry** with human-readable aliases (`shared/checkouts/`), which by ruling carries no host name and no folder path (`260904-1058_*_does-a-registry-entry-carry-hostname-account-name-and-folder-path.md`).
- **Messages between checkouts.** `/fusion:post` writes a note, `/fusion:news` reads the unread ones out of a fetched ref without touching the working tree. `docs/messages-between-checkouts.md` `## What it does not do` states that the store has no reply, no addressing and no thread.
- **A dashboard per checkout.** `bin/monitor` reads the two event logs and filters to its own checkout, except for `record_change` rows, which pass the filter (`README-hooks.md:333`).

### What already exists under the name campaign

The concept Kai was looking for is the campaign, and it exists in two places that the Claude side does not use.

**In Prior**, the second host of the fusion method, under `modules/fusion/`:

- `campaign/campaign.go` implements a durable charter and lifecycle: `Create`, `Authorise`, `Start`, `RecordAttempt`, `Pause`, `Amend`, `RequestTerminal`, `Finalize`, `Archive` (function list at lines 95 to 292). The charter holds the objective, the policies and the limits.
- `packages/packages.go:86`, `Form`, groups candidates into packages. A candidate joins an existing package when it shares the purpose of a member or when its declared `resources` overlap a member's (`compatible`, line 444), provided the package stays inside three caps: risk, validation cost and size. A candidate that fits no package opens a new one. After grouping, the dependencies between members are lifted into dependencies between packages. Candidates that are unqualified, over budget or blocked by a dependency land in `deferred` with a reason.
- `collaboration/collaboration.go` coordinates parallel writers: each worker has its own workspace, the coordinator records each result and integrates them one at a time into an accepted reference, and it can correct a result or cancel the batch. `Open` (line 84) refuses any plan that does not have exactly two workers.
- `profiles.json` carries a `work-package-manager` role, which `nomenclature.md:96` in the container of `260922-1038-prior-mapping.md` describes as "Qualifies candidates, forms work packages, and maintains the campaign overview".

**In fusion's shared record format**, `codec/schemas/campaign.schema.json` defines `fusion.campaign/v1` with the charter, the lifecycle state, the candidate register and the formation plan, each typed after the Prior structs. The schema says the file is "written only when a campaign is used". On the Claude side nothing uses one: outside `codec/` and the workbench, the only tracked file that names a campaign is `hooks/lib/__tests__/record-write.test.ts` (`git grep -l -i campaign`).

The agreed division of labour puts the concept on fusion's side. `nomenclature.md:14` assigns "campaigns, candidates, work packages and items, … queues" to fusion as the work method and leaves technical execution to Prior. `261009-0644-host-parity-claude-and-prior.md:136` names the campaign workflows as Prior-side orchestration and adds that whether fusion should author them "is a scope decision, not a parity defect". That scope decision is what Kai's request now makes.

## Analysis

### 1. One frame, not a second concept beside it

We recommend that the Claude side implements the campaign, and that no separate lane concept is built next to it. Three reasons carry the recommendation.

The data shape exists and is already validated by the codec. A second, Claude-only format for "groups of packages assigned to checkouts" would give the method two names and two formats for one thing, in a repository whose record format is shared with a second host.

The grouping rule Kai asks for is the rule `Form` already implements. The lane analysis in the consuming project arrived at the same principle by hand: packages that touch the same code area go into one lane, so that work which would collide runs in sequence inside one checkout rather than in parallel across two.

The lifecycle Kai needs for steering (pause, amend, end with a stated outcome) is the campaign's lifecycle.

Adopting the frame does not mean porting Prior's Go flows. Three differences stand between Prior's implementation and this need, and the specification has to settle each one.

| Difference | Prior at `374a322` | The need |
|---|---|---|
| Level of grouping | Groups candidates (defects, possible items) into work packages | Groups work packages into one queue per checkout |
| Number of parallel writers | Exactly two (`collaboration.go:85`) | Four to seven |
| Where the writers live | Workspaces Prior owns on one machine, integrated into an accepted reference | Independent clones that meet only through `origin/main` |

### 2. Planning

**What can be computed, and from which inputs.** `Form` needs four inputs per member: its dependencies, the areas it touches, its purpose and a size estimate. A fusion package carries only the first. `codec/schemas/package.schema.json` has the fields `active_documents`, `claim`, `depends_on`, `domain`, `evidence`, `extensions`, `filed_by`, `id`, `mode`, `narrative`, `origin`, `outcome`, `provenance`, `references`, `schema`, `status` and `workbench_id`. There is no field for touched areas or for size.

**The load-bearing question is not decidable in advance, and the mechanism has to reflect that.** "Which packages will collide" cannot be answered for a package that has no plan yet, because nobody can enumerate the files it will touch. The consuming project's plan says so in its own `**Decidability:**` line. Under `rules/critical-stance.md` §4 an approximation is not a solution here. The decided question that serves the same purpose is a pair:

- *Which areas does each package declare?* This is a statement somebody makes, so it is decidable once made. The pattern exists: a `depends_on` entry is proposed by an agent, confirmed by the user and only then read by a helper (`rules/fusion-workbench-conventions.md` `## Work packages`). Declared areas should follow the same route.
- *Which committed paths fell outside the declaring group's areas?* This is a comparison of `git log` paths against the declaration, taken after the fact. It replaces the prediction that cannot be made with a detection that can.

**The claim model does not have to change.** A group is an ordered queue assigned to one checkout, and the checkout still holds one package at a time. The resolver's refusal of two claims stays as it is. The consuming project's working rules 1 to 3 already describe this: one claim, front to back, close before the next claim.

**The sequence inside a checkout is the existing order, restricted.** `bin/fusion-work-order` already computes order and readiness over the confirmed edges. Restricted to one group's members it yields that checkout's queue. An edge that crosses two groups is a hand-off, and the helper can name every one of them, because both ends are packages it already reads.

**How many groups.** `Form` derives the number of groups from its caps. The user's situation has a second bound, the number of checkouts available. The lane analysis shows why the number should stay a user input rather than a computed optimum: it recommends three lanes over four because the fourth lane's packages wait on the user rather than on code, and concludes that "more lanes mean more questions per day, not more throughput". We recommend that the computation takes the number of checkouts as input, reports the cut for that number and states what a cut with one more or one fewer checkout would change.

**Who proposes the declarations.** In the consuming project an analysis did this work: it read the narratives and the code and wrote the contention map. That is a judgment about the project, which is what an analysis dispatch is for. The computation that follows is mechanical and belongs in a helper.

### 3. The overview above the checkouts

**The data already travels.** Each package's status and holder is in its `package.json`, which git carries. The event log `orchestrator-events.jsonl` is the one workbench file every checkout appends to, and it merges with `merge=union` (`rules/workbench-tracking.md`, class R2). Group membership and campaign state would travel the same way once they are records. The overview is therefore a computation over state that is already in the repository, not a new transport.

**It can be taken without touching the working tree.** `bin/fusion-forum` already reads a store out of a fetched ref (`README-hooks.md:359`). An overview that reads `origin/main` the same way is as current as the last fetch and runs in any checkout, including one that is itself mid-work.

**Its freshness has a hard limit, and the campaign has to set the rule that bounds it.** A clone cannot see another clone's unpushed commits. The registry carries no folder path by ruling, so reading sibling clones on the same disk is not available as a shortcut and would not work across machines anyway. The overview is as old as the slowest checkout's last push. The consuming project's working rule 6 (pull before each commit, push after each) is the rule that keeps that lag at one commit. We recommend that a campaign states this rule as part of its charter.

**What it should report, in the user's terms.** Each of the following is decidable from pulled state:

- which checkout works which group, on which package, and when it last pushed;
- a group with no held package and no recent push;
- a package held by a checkout outside the group the package belongs to;
- a held package that belongs to no group of the running campaign;
- a group whose next package waits on a user decision, with the decision named;
- a hand-off that has become possible because the package it waited on is terminal;
- commits by one group in areas another group declared.

Two of these seven conditions were verifiably true in the consuming project at the HEAD read, and neither was visible anywhere: four held packages belonged to no group, and the two hand-offs out of lane 1 had become possible (its first package is `done`) while both receiving packages stood `open` and unheld. Lane 2 also had no held package; whether it had a recent push, whether its paused package waits on a user decision, and whether any group committed into another's areas we did not measure.

**Message wording is part of the requirement.** `rules/user-facing-output.md` already forbids process narration and internal vocabulary in anything the user reads. The overview should state what is true in the project and what the user can do about it, for example that selection work has stood still for three days while its checkout works on something else.

### 4. Steering

**Most interventions need no channel at all.** The session that steers can do the following in its own checkout, at the user's word, and git carries the result: file, split, merge or drop packages, write confirmed dependencies, re-form the groups, move a package between groups, reassign a group to another checkout, and record a ruling as a decision. `agents/orchestrator.md` `## Work packages` already lists these as operations performed at the user's word without a dispatch.

**Two interventions cannot be done from outside, by design.** `bin/fusion-write` refuses a release or a transition out of `claimed` by any checkout other than the holder, and a takeover stands on the user's word per package (`rules/fusion-workbench-conventions.md` `## Work packages`). Stopping a checkout that is mid-package, or telling it to change course, therefore needs the holding session to act.

**The real gap is that a running session never looks.** `agents/orchestrator.md` contains no line that mentions the message store, `/fusion:news`, a fetch or a pull (a grep for those four terms returns nothing). A session working a package in `autonomous` mode has no point at which a decision made elsewhere can reach it. Building a channel without building that point changes nothing.

*Inference:* the natural point is the one the consuming project's rule 6 already prescribes, the pull before each commit. A session that pulls can read the campaign's state and whatever is addressed to its checkout before it continues. We have not verified how often an autonomous session commits in practice, so the delay between an intervention and its effect is unmeasured.

**State and prose should not share one carrier.** The campaign record should hold what a session must obey mechanically: whether the campaign is paused, which group a checkout works, which package comes next. The message store is documented as having no addressing and no reply, and it suits what it was built for, a note a person reads. *Inference:* a discrepancy the user resolves is a ruling, which already has a home as a decision record; what is missing is that each affected checkout confirms it has read the ruling, so that the overview can show whether an intervention arrived.

### 5. Who steers

**The orchestrator, running in a checkout of its own that holds no package.** Four verified facts support that answer.

- It is the agent a session starts as by default (`README.md:80`, `install.sh:162`).
- The steering acts are the ones its prompt already reserves to it: maintaining the package store at the user's word (`agents/orchestrator.md` `## Work packages`).
- Approvals are asked only in the orchestrator's own loop, and only the orchestrator records the user's answer (`rules/fusion-workbench-conventions.md` `## Dispatching another agent`). A different steering agent would need the same right, which that section rules out for every agent but the orchestrator.
- The rule of one orchestrator per project is a per-checkout marker that never travels (`.session-marker`, class L in `rules/workbench-tracking.md`), so a steering orchestrator in its own checkout does not collide with the orchestrators working the groups.

The parts of the role that are not the orchestrator's stay where they already are. Proposing which areas a package touches is an analysis. Computing groups, order and overview is a helper's work. The orchestrator carries the user's decisions and performs the confirmed operations.

Prior models the role as a separate profile, `work-package-manager`. That difference is acceptable under the host-parity analysis, which treats Prior's extra roles as Prior-side orchestration, but the specification should state the mapping so that the method has one name for the role on both hosts.

**How the role should be shipped.** `agents/orchestrator.md` measures 95 734 bytes and is the largest prompt. The project's convention is that critical procedures are user-invocable skills, never directives added to an agent prompt (`CLAUDE.md` `## Conventions`). The campaign's procedures (form, show the overview, intervene) should therefore be skills that call one helper.

**A correction to what was said in the chat.** We told Kai that the agent prompts have no room left. That was wrong. The zero head-room `CLAUDE.md` mentions is its own, as a file charged to every dispatch path. `agents/*.md` is bounded at 18 000 bytes of head-room and `skills/*/SKILL.md` at 39 260 (`README-hooks.md:527-528`). How much of either is spent we did not measure. The ruling `260927-2319_*_does-the-growth-bound-on-shipped-text-yield-to-the-dual-host-prompt-set.md` also says the bound is adjusted before it stops dual-host work. The recommendation to prefer skills over a twelfth agent stands on the convention above and on the approval rule, not on a lack of room.

### 6. Rulings this work touches

**Three rulings are superseded once the work begins, on Kai's word in this session.** None of the three supersessions is recorded yet.

| Ruling | Where it stands | What it says |
|---|---|---|
| Visibility of another checkout's work | `260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`, answers 4 and 5 and `## Out of scope` | Presence only; queue, running task and dashboard stay private; no shared dashboard; no session reads another session's live state |
| No agent ranks | `rules/fusion-workbench-conventions.md` `## Work packages`, from `260909-1808_*_may-a-helper-compute-an-order-over-work-items-after-the-portfolio-layer-goes.md` | "No agent asserts a ranking, and no field holds one" |
| Sessions exchange work through the user | `README-agents.md:391` | The workbench-mediated message bus was removed in v3.15.0 |

The second ruling needs a careful reading rather than a blanket withdrawal. A group assignment computed by a helper from confirmed declarations is consistent with it; an agent that sets priorities by judgment is what it excluded. The specification should say which of the two it introduces.

**Rulings that the design should keep, because it does not need to break them:**

- one claimed package per checkout, and release or transition by the holder only;
- a `depends_on` entry stands on the user's confirmation;
- the registry carries no host name and no folder path;
- one `issues/` store, with the state as the classification (`260922-1059_*_is-a-record-in-issues-a-candidate-or-an-admitted-work-item.md`), which bears on whether a campaign on the Claude side needs a candidate register at all.

**One ruling already cleared the way.** `260927-2319_*_may-an-agent-originate-a-work-package-on-its-own-initiative.md` withdrew the bound that only the user files a package, so a campaign that forms packages no longer contradicts the conventions, as the dual-host review had found it did (`260927-2304-fusion-dual-host-design-review.md`, finding G1).

### 7. Cost that is easy to overlook

The record format is a contract with Prior. Every change to it has so far gone through a numbered request in `codec/fixtures/prior/REQUESTS.md`, which stands at request 77. Declared areas on a package, a group that names a checkout, or a campaign state a session obeys are each a format change or a use of the `extensions` slot. `codec/schemas/common.schema.json:254-256` limits that slot: ignorance of an extension may change neither state nor an execution decision. A field that tells a session to stop cannot live there.

## Recommendations

1. **Adopt the campaign as the frame on the Claude side, and build no parallel lane concept.** Kai rules on this as the scope decision the host-parity analysis left open. Route: orchestrator, which commissions the decision record from the analyst (type 7).
2. **Record the supersession of the three rulings in the same act**, with the careful reading of the ranking rule in section 6. Same route.
3. **File the work as a work package and have the requirements-designer write the specification**, with this report and the two records from the consuming project as its inputs.
4. **Give the specification these fixed points**, each argued above:
   - a group is an ordered queue for one checkout, and the single-claim rule stays;
   - touched areas are declared, proposed by an analysis and confirmed by the user, and overlap outside the declaration is detected from committed paths;
   - the number of checkouts is an input to the computation;
   - the overview is computed from a fetched ref and states its own age;
   - the steering session is an orchestrator in a checkout that holds no package;
   - the procedures ship as skills over one helper, with no twelfth agent in the first version;
   - a working session reads campaign state at a defined point, and the specification names that point.
5. **Raise the format questions with Prior before the plan is written**, not after, since section 7 makes them the long pole.
6. **Build the overview first, contingent on the format question for group membership being settled.** It is read-only, it would have shown the consuming project's drift from its own plan on the day this was written, and it gives the steering session something to act on before any steering mechanism exists. Without group membership it can still report checkout, held package, last push and what each waits for.

## Open Questions

- [ ] At which level does a campaign on the Claude side group: work packages into per-checkout queues only, or also candidates into work packages as Prior does?
- [ ] What is the per-checkout queue called? Prior's formed unit is a "package", which on the Claude side already names the unit of work. `nomenclature.md:177` offers "agent group" for bounded parallel collaboration.
- [ ] Does a package declare its touched areas in a field of its own, and does a size estimate enter the format at all? Both are requests to Prior.
- [ ] At which point does a working session read campaign state, and how long may an intervention take to arrive? The commit cadence of an autonomous session is unmeasured.
- [ ] How does a checkout confirm that it has read a ruling addressed to it?
- [ ] Does Prior's two-writer bound stay, and if so, is a campaign with more than two checkouts a Claude-side capability only?
- [ ] Does a campaign's charter replace the per-package `autonomous` mode for its members, or do both stand?
- [ ] How much of the 18 000-byte head-room on `agents/*.md` and the 39 260 on `skills/*/SKILL.md` is spent? One run of `hooks/lib/__tests__/surface-growth-bound.test.ts` answers it.

## Sources

**fusion, at `af36d055`**

- `codec/schemas/campaign.schema.json`, `codec/schemas/package.schema.json`, `codec/schemas/common.schema.json:254-256`, `codec/fixtures/prior/REQUESTS.md`
- `bin/fusion-work-order` and `bin/fusion-events` (their headers), `bin/fusion-session-mark` (header)
- `agents/orchestrator.md` `## Work packages`; `wc -c agents/*.md`
- `rules/fusion-workbench-conventions.md` `## Work packages`, `## Path Resolution (Pfadauflösung)`, `## Dispatching another agent`; `rules/workbench-tracking.md`; `rules/critical-stance.md` §4
- `README-hooks.md:333`, `:359`, `:525-529`; `README-agents.md:391`; `README.md:80`; `install.sh:162`; `docs/messages-between-checkouts.md`
- `260822-1610_*_how-does-fusion-support-several-people-working-one-project-at-once.md`
- `260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`
- `260719-2141_*_concurrency-worktree-slots-vs-single-active-circle.md`
- `260909-1808_*_may-a-helper-compute-an-order-over-work-items-after-the-portfolio-layer-goes.md`
- `260918-0804_*_what-stops-two-checkouts-from-working-one-job-when-the-work-hangs-on-no-item.md`
- `260904-1058_*_does-a-registry-entry-carry-hostname-account-name-and-folder-path.md`
- `260922-1059_*_is-a-record-in-issues-a-candidate-or-an-admitted-work-item.md`
- `260927-2319_*_may-an-agent-originate-a-work-package-on-its-own-initiative.md`
- `260927-2319_*_does-the-growth-bound-on-shipped-text-yield-to-the-dual-host-prompt-set.md`
- `260927-2304-fusion-dual-host-design-review.md`
- `261009-0644-host-parity-claude-and-prior.md`
- `nomenclature.md` in the container of `260922-1038-prior-mapping.md`, lines 14, 59 to 62, 96 and 177

**Prior, at `374a322`** (`/Users/kai/Downloads/Projects/productive/F09-Prior`)

- `modules/fusion/packages/packages.go:86-168` (`Form`), `:444-455` (`compatible`)
- `modules/fusion/campaign/campaign.go` (function list; bodies not read)
- `modules/fusion/collaboration/collaboration.go:19-60` (types), `:84-142` (`Open`, `Dispatch`), `:226-265` (`Integrate`); the remaining functions by signature only

**The consuming project, clone `ax-k2-3` at `56c19983a`**

- `foreign:ax-k2-3:261101-1006-three-checkouts-work-the-pipeline-lanes-in-parallel.md` and its control record
- `foreign:ax-k2-3:261031-1733-pipeline-work-dissected-into-parallel-checkout-lanes.md`
- every `package.json` in its package store, read for status and holder; its ten checkout registry entries
- `bin/fusion-events presence --days 14` and `bin/fusion-work-order`, run read-only in that clone

**Not available.** Stored chat transcripts reach back only to 2026-10-06, so an earlier conversation about the campaign could not be read.
