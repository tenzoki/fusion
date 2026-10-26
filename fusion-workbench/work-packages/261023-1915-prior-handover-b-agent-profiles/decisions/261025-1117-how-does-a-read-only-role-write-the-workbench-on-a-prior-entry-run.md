# How does a role whose file tools are read-only write the workbench on a Prior entry run: through `host.exec.v1`, or through file-write classes the entry workflow grants?

---
**Domain:** code
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261024-2111-does-an-entry-run-of-a-repair-role-write-the-workbench-on-prior.md; 261025-1117-reviewer-closing-review-of-prior-handover-b-agent-profiles.md; 261025-1117-prior-parts-read-and-write-through-exec-past-its-64-kib-output-and-32-kib-argument-bounds.md

---

## Question

Decision `261024-2111-does-an-entry-run-of-a-repair-role-write-the-workbench-on-prior.md` (option 1) has the entry workflow grant the workbench write to `code-implementer`, `reviewer` and `state-auditor`. Step 10 (`5544cfca`) realised that grant differently per role. `code-implementer` writes with its file tools, whose ceiling includes `create` and `write`. `reviewer` (`tools_ceiling` `read`, `list`, `search`) and `state-auditor` (`read`, `list`, `search`, `runtime-inspect`, `git-inspect`) keep read-only file tools and write every file through `host.exec.v1`: `["bash", "-c", "printf '%s' \"$1\" > \"$2\"", …]` (`reviewer/parts/17-prior.md`, `state-auditor/parts/03-prior.md`). The only bound on those writes is a sentence: "only ever inside `fusion-workbench/`". Prior's file-class ceiling, which `execution_policy.prior` `prior-enforced` exists to enforce, does not see an exec write. Request 76 has to say which form fusion proposes, because Prior decides the grant.

## Options

1. **Keep the exec write, and say so in request 76.** The `prior` parts stay as they are. Request 76 names the exec write as how a read-only role writes on an entry run and asks Prior to confirm it under `prior-enforced`.
   - Pros: no profile change. It works at the pinned wire. Exec writes are journalled with the tree before and after (`internal/supervisor/exec.go`).
   - Cons: the read-only ceiling no longer bounds the role. Nothing but prose keeps a write inside `fusion-workbench/`. Each file costs an argument under 32 KiB.
2. **The entry workflow grants `create` and `write` for the workbench.** Request 76 asks Prior to widen the file classes per workflow for an entry run, scoped to `fusion-workbench/`, as the earlier decision asks for `writes_workbench`. The `prior` parts then write with file tools, and exec is for commands only.
   - Pros: the grant and the ceiling say the same thing. Prior can enforce the scope. It is the same per-workflow rule D5 and the earlier decision already chose.
   - Cons: it needs a Prior feature, a path-scoped file grant, which nobody has asked for yet. Step 10's parts change again once Prior answers.

## Constraints

- No frozen schema changes, and the repair contract does not move.
- A `prior` part names only the services in its entry's `requires` (`checkEntries`): `host.exec.v1` alone for both roles.
- `## Scope` of both roles forbids any edit of code, data or ontology on both run kinds.

## Recommendation

Option 2, with option 1 as the interim text until Prior answers. A ceiling the role can step around by a second service is not a ceiling. Confidence: inference. How Prior's `prior-enforced` policy treats an exec call that writes the workspace is not stated at the pin.

Answered: the user in chat, 2026-10-26, answer "1" to "answer the decision first (option 2, recommended), then claim F" — option 2: the entry workflow grants `create` and `write` scoped to `fusion-workbench/`; request 76 asks Prior for the path-scoped file grant, and the `prior` parts of `reviewer` and `state-auditor` change once Prior answers; ruled by user, Kai Stalmann <ks@qantr.com>
