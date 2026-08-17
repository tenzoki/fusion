The Directive promises docs/plane-setup.md verification, and step 10 was deferred with no record

---

The Circle's Directive states that `docs/plane-setup.md` has its command forms and
configuration fields verified against `bin/fusion-plane`. Step 10 of the plan carried that
work. At the Turn 4 gate the user chose five review findings over it, and the session's Turn
budget ran out, so the step was never begun: `git log 267a65c..c0e4219 -- docs/plane-setup.md`
returns nothing.

The plan's own risk table requires this: "If it is deferred, the residual must be filed as an
issue rather than left in the Circle's prose, because the Directive promises the
verification." Until this record existed, the promise lived only in prose, which is what the
reconciler named at Phase 3.

---

**What is unverified.** The whole of `docs/plane-setup.md`, 466 lines. The survey checked it
by grep only. Nothing in it has been read against `bin/fusion-plane`.

**What the step would do**, taken from the plan's step 10 so this record stands on its own:
extract every command form and every configuration field the document names, and check each
against the helper's header usage block, its `usage()` function, its `cfg_get` call sites, and
`templates/plane.config.yaml`. Correct what disagrees.

**The seam is the user's and is exact.** A command form or a configuration field is verified
wherever it appears, including inside the troubleshooting blocks. A claim about what a symptom
means or what to do about it is not verified. The two passages that are rationale and
troubleshooting rather than reference, "Why this is worth doing" and "If a check fails", keep
their prose. That residual is deliberate and must be stated wherever this work is reported, so
a later reader does not mistake the step for a full audit of the document.

**Verification needs no live Plane instance.** The step reads the helper; `fusion-plane doctor`
is not part of it.

**Filed by:** orchestrator, at Phase 3 of session 260813-1815, on the reconciler's finding.
**Cross-references:** `circles/260813-0910-documentation-matches-shipped-plugin/planning/260813-1820_p_documentation-matches-shipped-plugin.md` step 10 and its risk table; `circles/260813-0910-documentation-matches-shipped-plugin/history/260813-2258-reconciliation.md`

---
Resolved: docs/plane-setup.md (the text to be verified) and bin/fusion-plane (the thing to verify it against) were both deleted in d0ddabb.

Closed as part of the Turn-1 housekeeping batch of session 260815-2147, after a re-verification pass against HEAD confirmed the condition no longer holds.
