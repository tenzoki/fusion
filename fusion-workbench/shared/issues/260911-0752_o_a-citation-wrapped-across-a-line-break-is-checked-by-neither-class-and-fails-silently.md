A citation wrapped across a line break is checked by neither class and fails silently
---
`reference-resolution-lint`'s anchor pattern is applied per line. A citation written as a filename followed by a heading anchor resolves as neither a path nor an anchor when the two halves land on different lines, so the gate never checks it and never reports it. It is not reported dangling; it is not seen.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** e2f7036a (step S5, which met it); 260906-0335_*_nine-of-twelve-line-number-citations-in-shipped-text-name-the-wrong-line-and-no-gate-resolves-one.md

**How it was found, which is the part worth keeping.** Step S5 re-approved the gate's count pin and attributed the movement per file. Two citations written in that step landed wrapped, and the attribution is what exposed them: the anchor delta was two lower than the citations written accounted for. Reflowing both onto one line restored the count. Nobody was looking for this; a measurement that had to add up found it.

**Why it is worse than a dangling citation.** A dangling citation is reported, and somebody fixes it or restates it. This one passes the gate by being invisible to it. The corpus-recomputing gates are this project's answer to citations rotting, and a silent class inside one is the failure mode those gates exist to remove — the same shape as the store-prefixed item record that produced no token at all before step S9 widened the grammar.

**Scope is unmeasured and that is deliberate.** The shipped text is reflowed prose and long rule files, so wrapped citations are likely to exist beyond the two found here, but this record does not guess at how many. The count is a measurement the fix should take, not a number to assert now.

**Acceptance.** The gate reads a citation whose halves are on adjacent lines, or it reports one it cannot read rather than passing it over. The commit that fixes it states how many wrapped citations the shipped corpus held at that moment, which is the count this record deliberately does not invent.
