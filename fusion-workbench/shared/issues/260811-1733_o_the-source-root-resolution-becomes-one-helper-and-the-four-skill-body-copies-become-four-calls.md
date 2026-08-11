# The source-root resolution becomes one helper, and the four skill-body copies become four calls

---
**Severity:** Medium
**Domain:** code
**Filed by:** orchestrator, session 260811-0752, realising an answered decision
**Affects:** four skill bodies carrying the executable snippet; a new `bin/fusion-source-root`
**Cross-references:** `shared/decisions/260810-2145_a_should-a-repeated-skill-body-snippet-become-a-bin-helper...md` — the answer this realises; `shared/issues/260811-0109_o_the-source-root-rooting-reached-two-skills-and-two-more-still-cite-the-install-copy.md` — the instance that was paid for

---

Option 1 of the answered decision. `bin/fusion-source-root` prints the source root; the four
copies become four calls.

**The evidence is not hypothetical:** a correction to this fact reached two of the four copies and
left two standing, which is the cited open record. An executable duplicate can diverge in
behaviour without anyone reading the files.

The helper is called from skill bodies, so it meets the convention answered at
`shared/decisions/260810-1544_a_...`: the call is guarded and reports absence in the fixed
vocabulary, because the installed copy of the plugin need not carry a helper added between
releases. Write the guard at all four call sites.

**Out of scope by the same answer:** the domain-capture snippet. It is the weaker case (short,
read-only, fallback stated at every site) and is a separate call once this one has proved itself.

**Acceptance:** one helper, four guarded calls, no fifth copy anywhere in `agents/`, `skills/`,
`rules/` or `bin/`; the two skills that still cite the install copy are corrected with it; suite
green.
