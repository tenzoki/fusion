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
non-build domains ahead of any code count, which is exactly issue `260807-1942`. It also carries no
`counted_by == "none"` case, so an unmeasurable project is silently read as "no code" — issue
`260807-1951` in the same sentence.

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

**Cross-references.** Decision `260810-1822_i_should-the-queue-ground-procedure-become-a-rule-file-
when-one-of-its-three-consumers-cannot-be-emitted-to.md` records the same shape for a different
procedure and names the obstacle (`bin/fusion-rules` cannot emit to a skill) — a cascade rule file
would hit it too.

**Filed by:** coderev, review of session `260810-1646` Turn 1, range `5ef92eb..940d522`.
