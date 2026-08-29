The cleanup skill carries a second domain cascade, in the pre-fix order, and no gate reads it

---

`hooks/lib/domain-cascade.ts:19-31` states the design claim of the whole change: *"Why there is no
second copy … Drift is not guarded against, it is unrepresentable — there is one definition, in
`agents/orchestrator.md`, and this file is an interpreter for it."* `README-hooks.md:179` repeats it
in the table row.

There is a second copy. `skills/cleanup/SKILL.md:114`:

> Detect the workbench domain the same way the orchestrator does (Setup Step 5 in
> `agents/orchestrator.md`): `strategic` if decisions dominate, `knowledge` if analyses with no
> code, `data` if data files dominate, else `code`. When unsure, default `code`.

That is not the cascade Setup Step 5 runs. It is the cascade as it stood **before** `2910cf6`: both
non-build domains ahead of any code count, which is exactly issue `260807-1942_*_die-domaenenerkennung-entscheidet-vor-der-codezaehlung-und-erreicht-code-nie.md`. It also carries no
`counted_by == "none"` case, so an unmeasurable project is silently read as "no code" — issue
`260807-1951_*_die-tiefenschranke-der-codezaehlung-sieht-keinen-cargo-workspace.md` in the same sentence.

Neither new gate can see it. `domain-cascade.test.ts:48` and `domain-cascade-order-lint.test.ts:58`
both read `agents/orchestrator.md` and nothing else; `path-literal-lint.test.ts` reads skills for
store literals, not for cascades. So the file that says the decision cannot drift ships beside a
drifted copy of it.

---

**Failure scenario.** The consuming project KRK, unchanged: 108 Rust files, 11 data files, three
open decisions against one open defect record. `/fusion:setup` Step 3 runs Step 5 and reports
`code`. Later the same session `/fusion:cleanup` reaches its reconcile step, applies line 114 —
"decisions dominate" — and dispatches `reconciler` with `**Domain:** strategic`. Under `strategic`
the reconciler runs no code tests. Two surfaces of one session disagree about what kind of project
this is, and the one that decides whether tests run is the stale one.

**Fix direction.** Two shapes, and the choice is worth recording rather than assuming:

(a) Delete the prose branches at `skills/cleanup/SKILL.md:114` and have the step cite Setup Step 5
    at `$FUSION_PLUGIN_ROOT/agents/orchestrator.md` the way `/fusion:setup` and `/fusion:next` now
    cite `#### Reading a queue` — including the presence check, since cleanup has the same no-inline-
    fallback problem.

(b) Widen the gate so it reads every consumer that claims to run the cascade, not only the
    orchestrator prompt. That catches the class rather than this instance, and it is the only shape
    that keeps the module header's claim literally true.

(a) closes it; (b) is what stops the third copy. They are not exclusive.

**Cross-references.** Decision `260810-1822_*_should-the-queue-ground-procedure-become-a-rule-file-
when-one-of-its-three-consumers-cannot-be-emitted-to.md` records the same shape for a different
procedure and names the obstacle (`bin/fusion-rules` cannot emit to a skill) — a cascade rule file
would hit it too.

**Filed by:** coderev, review of session `260810-1646-orchestrator-session.md` Turn 1, range `5ef92eb..940d522`.

---
Resolved: Fix direction (a) and (b) together, since (a) alone leaves the module's claim false.

(a) `skills/cleanup/SKILL.md` Step 3 no longer states the cascade. It takes `session.domain` from
`fusion-workbench/agentstate.yaml` — the verdict the orchestrator's Setup Step 5 already produced —
using the same one-liner `/fusion:next` Step 2, `/fusion:direct` Step 3 and `/fusion:seed-from-plane`
Step 4 use, with the same `code` fallback for a run outside a session. The capture sits in Step 1
item 1, because Step 1 item 4 deletes `agentstate.yaml` before Step 3 runs. The fallback is now
reported (`$DOMAIN_SOURCE`) rather than applied silently.

(b) `hooks/lib/__tests__/domain-cascade.test.ts` gained a reach gate over every `agents/*.md` and
every `skills/*/SKILL.md`, no exemptions: at most one file may state the cascade, in either
representable shape — a fenced block that would run (`cascadeBlocks()`) or a prose line a reader
executes (`findCascadeStatements()`, both in `hooks/lib/domain-cascade.ts`). A statement is a line
naming ≥2 of the four domains and ≥2 of the cascade's own inputs; the threshold was measured against
the whole tree, where it selects Setup Step 5's own prose and this defect and nothing else.

The claim was corrected rather than left standing, in all three places it was made:
`hooks/lib/domain-cascade.ts`'s header, `domain-cascade.test.ts`'s header, and `README-hooks.md`.
A second definition is representable — one shipped. What holds is a measurement with named holes: a
paraphrase spread across a table's rows is not caught, nor is anything outside `agents/` and
`skills/`.

Demonstrated on a copy of the tree, not in it (decision 260810-1820_*_an-executor-verified-a-gate-by-mutating-a-file-another-executor-held-in-the-live-tree.md): with the pre-fix sentence
written back into the copy's `skills/cleanup/SKILL.md`, `npx vitest run
lib/__tests__/domain-cascade.test.ts` fails naming `skills/cleanup/SKILL.md:125`, its four domains,
its three inputs, and the route to take instead. `npm test` on the real tree: exit 0.
