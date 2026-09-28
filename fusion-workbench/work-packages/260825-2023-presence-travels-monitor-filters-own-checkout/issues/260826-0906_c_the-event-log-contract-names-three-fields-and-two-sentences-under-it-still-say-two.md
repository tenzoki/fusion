# The event-log contract names three fields and two sentences under it still say two

---
`72a9561` widened the `### 2. Structured Event Log` contract from two identity fields to three. The
sentence immediately after it still reads "Both values come from the guarded `bin/fusion-identity`
call at Setup step 2 and are composed nowhere else", which is now false for the third field:
`session_id` comes from a SessionStart hook and from no helper. A second sentence, in the same
section, still calls `<ID>` "the pair".
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** Low. Both readings are recoverable from the definition at `agents/orchestrator.md:139-140`,
which is correct. What they cost is one sentence that says the wrong provenance for a field the
model has to obtain from somewhere else, in the paragraph a reader goes to for exactly that.

**Cross-references:** `72a9561`; `agents/orchestrator.md:139-140` (the `<ID>` definition and its
extension).

## The two sentences

`agents/orchestrator.md:1279`. The bold lead was rewritten to "**`person`, `checkout` and
`session_id` stand on every line**", and the next clause was left as it was:

> Both values come from the guarded `bin/fusion-identity` call at Setup step 2 and are composed
> nowhere else.

Read against the three-field lead, it says `session_id` is a `bin/fusion-identity` output. It is not:
`agents/orchestrator.md:140` says the value arrives on a line the SessionStart hook prints into the
model's context, and `hooks/session-id.ts` is what prints it. `bin/fusion-identity` knows nothing
about it.

`agents/orchestrator.md:1322`:

> `<ID>` is the pair held from Setup step 2.

The fragment is defined as a pair at `:139` and extended to a third field at `:140`, so at the point
this sentence is read it is up to three fields. "The pair" is now a floor rather than a description,
and this is the sentence a reader consults when writing an ad-hoc emit.

## Fix direction

Two clauses. At `:1279`, name the two sources rather than one: person and checkout from the guarded
`bin/fusion-identity` call at Setup step 2, `session_id` from the SessionStart line read at the same
step, and none of the three composed anywhere else. At `:1322`, "the identity fragment held from
Setup step 2" rather than "the pair", so the sentence stops carrying a count that a fourth field
would falsify again.

---
Resolved: both clauses corrected in place, the section otherwise untouched. `agents/orchestrator.md:1279`
now names the two sources: `person` and `checkout` from the guarded `bin/fusion-identity` call at Setup
step 2, `session_id` from the SessionStart line read there, and none of the three composed anywhere else.
`agents/orchestrator.md:1322` reads "the identity fragment held from Setup step 2" instead of "the pair",
so the sentence carries no field count for a fourth field to falsify.
