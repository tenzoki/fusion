The commit lock's worked example names a site that no longer uses the form it illustrates

---

`rules/workbench-stash-and-lock.md:135` reads: *"The `with` form is canonical; explicit
`acquire`/`release` is for special cases like internal control-flow (retry after bugfixer in
orchestrator Phase 2 Step 3b)."*

The criterion is right. The parenthetical is now wrong twice over.

Step 3b was rewritten this session (`260810-1918_c_step-3b-drops-the-lock-form…`) to take the lock
through `with` again, so the one site the rule names as its worked example of the explicit form no
longer uses the explicit form at all. And the retry it points at sits at step 2, outside the held
region, which begins at step 5 — so even before the rewrite, that retry was not an instance of
control-flow *inside* the lock. It was never the example the sentence needed.

---

**Why this is worth a record rather than a passing edit.** The parenthetical is the only worked
example the rule offers, and a reader reaching for the explicit form will read it as the licence.
That is how Step 3b came to use the explicit form in the first place: the executor of `260810-1535`
took "internal control-flow" as covering the bugfixer retry, and the reason was recorded in the
prompt rather than checked against the rule. The wrong example produced the wrong call site, then the
call site was cited back as evidence.

**What the executor who found it recommends**, and the reasoning is worth keeping: replace the
parenthetical or drop it and leave the criterion bare. A criterion with no example is weaker guidance
and cannot mislead; a criterion with a false example is worse than either. If an example is kept it
must name a site that genuinely holds the lock across control-flow, and there may be none — in which
case the honest form of the rule says the explicit form exists for a case that has not yet arisen.

**Also worth settling in the same pass.** The same section's "Who acquires" list says the orchestrator
acquires "at Phase 2 Step 3b — before staging and committing". After the rewrite the acquisition and
the staging are one `with`-held command, so "before staging" is no longer a separate moment. Small,
but it is the same drift.

**Scope note.** The rule file was read-only to the executor that found this, deliberately, because
`rules/**` is a protected path in a consuming project and this repository's stand-down is not a
reason to edit rules casually. Whoever takes this touches a rule file and should read
`rules/rule-file-provenance.md` first.

**Filed by:** orchestrator, session `260810-1646`, on the Turn-2 commit-procedure executor's proposal.

---
**Second gap in the same section, found in Turn 3 and belonging to the same pass.** `## Commit lock`
does not state that `with` performs a `cd`. Measured rather than read off the code: the `with` branch
calls `resolve_root`, which runs `bin/fusion-workbench-root` and walks up from the **caller's**
working directory to the nearest ancestor holding `fusion-workbench/.fusion-setup`, then `cd`s there.
So the wrapped command runs at the workbench root — not the workbench directory, and not the git
toplevel.

That distinction decides whether a staging list works. In a scratch repository whose git toplevel,
workbench root and caller directory were three different places, toplevel-relative and
caller-relative staging both exited 128 with nothing staged, while workbench-root-relative, absolute
and the `:/` magic pathspec all succeeded.

`agents/orchestrator.md` Step 3b now says it at its own call site and prescribes absolute paths.
`skills/cleanup/SKILL.md` runs the same shape and was deliberately **not** given a third copy of the
sentence — this rule file is the authoring home, and the two call sites should cite it rather than
restate it. Whoever edits the worked example above should state the `cd` in the same pass.

---
**Reconciliation 260817-1836** (reconciler, domain `code`, HEAD `2552586`; log `shared/history/260817-1836-reconciliation.md`). Both halves still hold, and the file moved without them being fixed. The rule is now `rules/commit-lock.md` (renamed from `workbench-stash-and-lock.md` on 2026-08-15); its worked example at `:42` still names the orchestrator Phase 2 Step 3b retry-after-bugfixer as internal control flow, while `agents/orchestrator.md:546` uses the `with` form there. The second half is worse than unfixed: the fact that `with` performs a `cd`, and that pathspecs must therefore be absolute, is documented at the call site (`agents/orchestrator.md:537`) and still absent from the rule file that is its stated authoring home.
