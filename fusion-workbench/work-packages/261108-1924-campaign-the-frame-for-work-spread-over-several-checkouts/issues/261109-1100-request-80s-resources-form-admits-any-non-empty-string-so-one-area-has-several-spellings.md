Request 80's `resources` form admits any non-empty string, so one area has several spellings
---
The form of `resources` that request 80 proposes for `fusion.package/v1` admits any non-empty string as an entry. `/abs/x`, `../x`, `a\b`, `./a` and `a//b` validate, and `a/b` and `a/b/` are two entries for one directory. A path can leave the project root, and the Claude-side overlap reading (equal, or one a prefix of the other at a `/` boundary) and Prior's (an equal string) diverge further than they need to. Prior names this as a defect in its answer to request 80, and the verdict on question 2 is therefore "corrected".
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Evidence.** Prior's answer to request 80, `Prior: docs/design/fusion-campaign-request80-prior-response.md` at Prior commit `557011a9b02e2ab87e2f7cf7d4574d9706f565d2`, `sha256:93388f418a3f72f88173c16162a0817b54acfddc0139bd8d6970c61f8314065d` (the orchestrator read it with `git show` from the commit and compared the digest), `### Question 2: resources` and `## Defects in the proposed forms`. Prior's own record of the defect is `foreign:F09-Prior:261109-0730-request-80s-resources-form-admits-any-non-empty-string-so-one-area-has-several-spellings.md`. The contract's precedent, `workbench_path` in `codec/schemas/common.schema.json`, refuses a leading slash, a drive letter, a backslash and a `..` segment, and still admits `./a`, `a//b` and both spellings of a directory, so the answered form needs a pattern of its own.

**The three corrections Prior rules, each text for `codec/schemas/package.schema.json`.**

- (a) Each entry follows a relative path grammar, and a directory has one spelling. Which spelling fusion takes is fusion's choice; request 80's example writes a trailing slash.
- (b) The description states both overlap readings (the Claude-side prefix reading and Prior's equality test) and that no row of `codec/contract/prior-mapping.json` maps this member onto `packages.Candidate.Resources`.
- (c) The sentence "Every key is required" in the schema's description is reworded in the same change, since `resources` is optional.

**What Prior adds without asking, and what it costs here.** `set-resources` is absent from Prior's host (it exposes codec operations by name and refuses any other), and a package record carrying `resources` is schema-invalid at Prior's current codec pin, because the package schema refuses unknown keys. A workbench in which a newer Claude side has declared areas meets a refusing host until Prior is re-pinned.

**Acceptance.** Plan step 12 lands `resources` in the answered form: optional, absent meaning undeclared and `[]` declared and empty, a pattern of its own that admits one spelling of a directory and refuses the five strings above, corrections (b) and (c) in the description, with a valid and an invalid fixture for each refused shape. Plan step 11's `set-resources` refuses an entry the pattern refuses. The plan says which spelling is taken before step 12 is dispatched.

**Cross-references:** `261108-2301-plan-campaign-the-frame-for-work-spread-over-several-checkouts.md` (steps 9, 11, 12, 15), `codec/fixtures/prior/REQUESTS.md` (`## The campaign on the Claude side (request 80)`, question 2)
