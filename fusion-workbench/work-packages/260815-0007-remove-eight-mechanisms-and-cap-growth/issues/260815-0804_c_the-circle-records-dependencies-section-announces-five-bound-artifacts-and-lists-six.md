# The Circle record's Dependencies section announces five bound artifacts and lists six

---

`_t_circle.md` `## Dependencies` opens *"Five artifacts bind this one and are cited rather than
copied"* and is followed by six bullets. A reader who checks the list against the count finds one
more binding than the sentence admits, and has no way to tell which one the author meant to exclude.

---

**Severity:** Low — every binding is present and correctly cited; only the count is wrong.
**Domain:** code
**Filed by:** `coderev`, reviewing `9a7da8e..7c12d6a` (`260815-0804-coderev-plane-mirror-removal.md`)
**Owner:** `shaper`, or whoever next edits the record
**Affects:** `260815-0007-remove-eight-mechanisms-and-cap-growth:190-212`
**Cross-references:** `260815-0029_*_the-circle-record-cites-the-investigator-case-folder-record-as-an-issue-and-asks-for-a-transition-that-vocabulary-has-no.md` — the sixth bullet is also the one with a wrong store, already filed; `260815-0029_*_plan-…md` `## Open Questions`, second bullet, which leaves open whether this section is edited at all

**Verified 2026-08-15 at HEAD `7c12d6a`.** Six bullets, counted: the armed growth bound
(`260814-0738`), this Circle's own cleanup-gate decision (`260815-0007`), the bounded documentation
Circle (`260813-0910-documentation-matches-shipped-plugin`), the Plane mirror Circle (`260719-1536`), the Setup-permissions defect
(`260810-0326`), and the investigator case-folder record (`260812-0254`).

## The candidate readings, and why neither rescues the sentence

The second bullet is this Circle's *own* decision record, which is arguably not an external artifact
binding it from outside — that is the most plausible thing the author excluded. But the bullet is
inside the list and no wording marks it as different, so the reading is available only to somebody
who already suspects an off-by-one.

The sixth bullet is the one the filed defect `260815-0029` is about: it cites a decision record under
`shared/issues/` and asks for a `_c_` transition the decision vocabulary does not have. If the author
had already discounted it as a broken citation the count would work, but nothing in the section says
so and the bullet reads as binding.

Two available readings and no marker choosing between them is the shape of an off-by-one rather than
a deliberate exclusion.

## What the fix has to establish

Either the count reads six, or the sentence names what it excludes and why. The plan's second open
question — *"Is the Circle record's Dependencies bullet corrected, or left as a historical
statement?"* — already asks whether this section is edited at all; if the answer is no, this record
closes as deferred rather than fixed, and the answer to that question is where it belongs.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). Unchanged, on a now-terminal record.**

`_c_circle.md:193` still announces "Five artifacts bind this one and are cited rather than copied", and `:195-212` still carries six bullets — `260814-0738`, `260815-0007`, `260813-0910-documentation-matches-shipped-plugin`, `260719-1536`, `260810-0326`, `260812-0254`. The record transitioned `_t_` → `_c_` with the miscount in it and is not editable now.

Worth recording beside it: two of those six citations no longer resolve in the live store. `260813-0910-documentation-matches-shipped-plugin` (the documentation Circle) was archived on 2026-08-17, and the `260812-0254` citation names `shared/issues/` while the record lives in `shared/decisions/` as `_s_`. Neither is this record's subject; both are found by the same read.

---
Resolved: moot — a terminal Circle record is not edited, and this record is the correction beside it; `260815-0007-remove-eight-mechanisms-and-cap-growth`.
