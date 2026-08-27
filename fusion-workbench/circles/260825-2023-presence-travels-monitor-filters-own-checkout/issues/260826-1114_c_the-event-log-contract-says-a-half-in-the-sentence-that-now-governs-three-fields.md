# The event-log contract says "a half" in the sentence that now governs three fields

---
R-14 corrected the two sentences of `agents/orchestrator.md` `### 2. Structured Event Log` that said
two fields where the contract names three. The sentence between them still says "half", which is a
two-count word, and it is the sentence that states the absent-rather-than-empty rule the emit
templates execute.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** Low. Nothing behaves wrongly: `agents/orchestrator.md:140` states the same rule for
`session_id` in its own words ("**No line, no key**"), so the third field is governed. The defect is
that the contract section, read alone, appears to scope its own rule to two of the three fields it
just enumerated.

**Cross-references:**
`circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260826-0906_*_the-event-log-contract-names-three-fields-and-two-sentences-under-it-still-say-two.md`
(R-14, the two sentences either side of this one, closed by `6deeb33`).

## What is there

`agents/orchestrator.md:1279`, the three sentences in order, the middle one unchanged by `6deeb33`:

> **`person`, `checkout` and `session_id` stand on every line …** `person` and `checkout` come from
> the guarded `bin/fusion-identity` call at Setup step 2 and `session_id` from the SessionStart line
> read there; none of the three is composed anywhere else. **A half that did not resolve makes its
> field absent rather than empty** …

"Half" is `bin/fusion-identity`'s own word for its two outputs, which is why it was right before
`72a9561`. It is now the only word in the paragraph that states a count, and the count is two.

## Fix direction

One word: "A field that did not resolve makes itself absent rather than empty", or "Any of the three
that did not resolve". Either keeps the rule and drops the count, which is what R-14 did to the two
sentences around it.

Resolved: `agents/orchestrator.md` `### 2. Structured Event Log`: "A half that did not resolve makes its field absent rather than empty" is now "Any of the three that did not resolve is absent rather than empty". Same edit closes `260826-1219`.
