# Orchestrator Session — 260904-1050

**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Directive:** Revise the identity decision. Attribution per git user is not sufficient: fusion needs an identity per local instance, so that several checkouts of one consumer project — on one machine or across several machines belonging to one person, possibly with different git identities — can run orchestrators in parallel. The proposed structure is an alias (petname/ahikunator style) carrying a worker-id (machine id, user name on the machine, local folder), the git name and email, and the real person. `person` aggregates work per human for cadence; the petname differentiates workbenches for the same person. The structure is tracked per project in git. Analyse the problem, test the idea, and put concrete proposals to the user.
**Mode:** custom (analysis first, no implementation this Turn)
**Status:** In progress

## Snapshot at session start

- Workbench: `/Users/k1/Projects/productive/fusion/fusion-workbench`
- Detected domain: `code` — 133 source files, 10 data files, counted by `git ls-files`
- Turn budget: 12, resolved from `fusion.json`; the configuration loader reported nothing on stderr
- git HEAD at start: `cda72f71`
- Open defects in scope: 4 (`shared/issues`, markers `_o_`/`_p_`)
- Open decisions in scope: 5 (`shared/decisions`, marker `_o_`)
- Open specs/plans in scope: 1 — `260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`
- Circles: 20 records, all terminal (16 `_c_`, 3 `_b_`, 1 `_s_`). No active and no anticipated Circle, so no portfolio hint was printed.
- Interrupted session: none. `agentstate.yaml` was absent at Setup.
- Setup marker written for plugin version 10.22.0. Stylometric profiles identical to the shipped copies. Permission file already at `bypassPermissions`. Union merge driver for the event log already in force. No helper present in the work tree and missing from the install.

## Prior art the Directive revises

- `260822-1610_*_how-does-fusion-support-several-people-working-one-project-at-once.md` — the answered decision this Directive reopens.
- `260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` — the spec whose answers 1, 3 and 8 fix attribution to the person.
- `260824-0613_*_does-a-filing-agent-halt-in-a-tree-that-is-not-a-git-work-tree-at-all.md` — the non-git branch of the current identity helper.
- `bin/fusion-identity`, `fusion-workbench/.checkout-id`, `rules/fusion-workbench-conventions.md` `### Who filed it`, `rules/circle-records.md` `### The claim field`, `rules/workbench-tracking.md` class L.

## Turns

(none yet)

## Turn 1 — the analysis, and what the user answered

The analyst's report is `260904-1058-identity-per-instance-and-the-checkout-registry.md`,
committed as `23ffbe73` together with four decision records and three defects.

**The user chose the report's Option 1, "Checkout registry as an attribute table, hex stays
the key", in these words: "ok, we go for: Option 1. Checkout registry as an attribute table,
hex stays the key (recommended)".** That answer settles two of the four filed decisions and
neither of the other two.

- The registry exists, in shape (a): one tracked file per checkout, `<8hex>.md`, in a new
  store beside the memo store, class R1, written by the checkout it describes and by no
  other. Fields: the eight hex as key, alias, person, git identity, and an optional worker
  note.
- The alias is an **attribute** of the minted identifier, not the identifier. The hex stays
  the value written into `**Claim:**` and into `checkout:` on every event line, so nothing
  already on disk changes and no migration is owed.

Still open, and not covered by that choice: whether a registry entry carries hostname,
account name and folder path at all, and whether `bin/fusion-identity`'s exit-1 halt
survives a registry that can name the person.

## Turn 1 — the worker-field gate

At the plan's step-1 gate the user was shown the decision record's four options as
written, together with the three values option 2 or 3 would publish out of this
checkout (hostname `k1i9`, account `k1`, path `/Users/k1/Projects/productive/fusion`).
**He answered "1": never written.** No `**Worker:**` field and no `--worker` flag come
into existence, and nothing in this project publishes hostname, account name or folder
path. The alias carries the whole "which checkout is this" job.

Two deviations from the plan step, both deliberate and neither silent. The record was
renamed where it lives, in `shared/decisions/`, rather than in "this Circle's copy" as
the step's wording has it: the record was filed before the Circle existed, and the
Origin Rule keeps one record in one location with citations carrying the reach. And the
transition was performed by the orchestrator rather than by the dispatched `analyst` the
step routes to, because recording a user's gate answer and moving the marker is the
orchestrator's own act under Phase 1 step 3.

## Turn 3 — the exit-1 halt gate

The plan's step-9 gate put the decision record's three options to the user as written.
**He answered "1": the halt stays, with its reason restated to the first clause alone.**
Nothing about the behaviour moves. `bin/fusion-identity` halts in exactly the cases it
halts in today, no filing agent gains a halt anywhere, and what changes is the sentence
that says why: a tree which cannot commit produces records no other checkout will ever
see, which stands on its own, rather than the clause about a record naming nobody, which
a registry carrying the person makes false.
