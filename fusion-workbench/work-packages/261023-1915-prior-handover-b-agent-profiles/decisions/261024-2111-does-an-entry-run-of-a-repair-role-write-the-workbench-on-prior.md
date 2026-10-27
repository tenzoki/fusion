# Does an entry run of `code-implementer`, `reviewer` or `state-auditor` write the workbench on Prior, when their shared profile says `writes_workbench.prior` is `false`?

---
**Domain:** code
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261024-2111-agent-span-map-for-entry-profiles.md; 261023-1854-which-schemas-bind-an-entry-run-of-an-agent-that-is-also-a-workflow-role.md; 261023-1854-plan-prior-full-surface-handover-h1-to-h9.md

---

## Question

Under D5 (`261023-1854-which-schemas-bind-an-entry-run-of-an-agent-that-is-also-a-workflow-role.md`, option 1), an agent has one profile, and plan step 10 leaves the three repair profiles' `profile.json` unchanged. All three declare `writes_workbench` `{"claude-code": true, "prior": false}`. Their `prior` parts say so in prose: "this role writes no workbench record on Prior" (`code-implementer` parts 05 and 13, `reviewer` part 05, `state-auditor` part 06). The `code-implementer` part 03 also says "There is no shell". Prior's repair loader refuses a profile whose `writes_workbench.prior` is `true` (Prior `internal/fusionhost/repair_catalog.go:33`). Under Claude Code, an entry run of the same agents writes records. Prior's own inventory says so: `record-edit`, `record-create`, `record-state-change` and review files (`docs/qualification/fusion-surface/inventory.json`, entries 20, 22 and 23). Step 10 adds `host.exec.v1` to these `prior` parts. Before that, someone has to say what an entry run of these three may write on Prior, and the text has to say it. Otherwise one profile states two contradicting rules.

## Options

1. **The workflow grants the write, as D5 has the workflow bind the schemas.** `profile.json` stays as it is, so repair's refusal holds. `entry.v1` states that an entry run writes the workbench in its workspace, and the host captures and integrates those writes. The `prior` parts of the three become conditional on the role input: an implementer, review or audit request is the repair run as today, and an entry request is the Claude behaviour through `host.exec.v1`. Request 76 asks Prior to read the write grant per workflow.
   - Pros: one rule for schemas and grants, the one D5 already chose. Repair does not move. The structural effect matches Claude Code.
   - Cons: Prior has to evaluate `writes_workbench` per workflow, not per profile (`internal/fusionhost/role_grants.go` names the profiles that may declare it). The `prior` parts of the three grow a two-way branch.
2. **Keep `false`, and report the difference.** On Prior, an entry run of these three writes no record. Their reports carry what Claude Code would have filed. Request 76 lists this as a deliberate departure from H3.
   - Pros: no change on either side.
   - Cons: `reviewer` files no review and no issue, and `state-auditor` moves no state. So the "same structural effect" that the hand-over sets as its goal is missed for three of the 27 entries.
3. **Separate entry profiles for the three.** This is D5 option 3, which the user did not choose.
   - Pros: each profile states one rule.
   - Cons: it reopens D5. It is the special case keyed on history that D5's own record rejected.

## Constraints

- No frozen schema changes, and the repair contract Prior accepted at request 69 does not move (`catalog/schemas/FROZEN`).
- Whatever is chosen, a `prior` part names only the entry services in its entry's `requires`, here `host.exec.v1` alone (`checkEntries`).

## Recommendation

Option 1. It is the rule D5 set, carried from schemas to grants. Prior answers the one open half in request 76. Confidence: inference. Prior's entry admission (its step 28) is not written yet, so how it reads `writes_workbench` for an entry run is unknown.

---
Answered: 261024-2111-does-an-entry-run-of-a-repair-role-write-the-workbench-on-prior.md — option 1, the workflow grants the write as D5 has it bind the schemas; profile.json stays, the three prior parts branch on the role input, request 76 asks Prior to read the grant per workflow; ruled by user, Kai Stalmann <ks@qantr.com>, in chat 2026-10-24 ("B1")

---
Superseded by: 261027-1833-does-fusion-keep-the-repair-route-on-prior-beside-the-step-17-entry-model.md — repair is withdrawn in 13.4.1, so the three repair roles become ordinary entry profiles and the carve-out this record kept goes
