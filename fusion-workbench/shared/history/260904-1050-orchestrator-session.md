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
