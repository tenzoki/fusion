Two sentences about the work-order helper are false after the TSV format shipped
---
After `df38a5dd`, two sentences about `bin/fusion-work-order` don't match the tree. (1) `README-hooks.md`, the `order.ts` row, says the program is run "by a person — directly or through `/fusion:wp-order` — and by nothing else". Its next sentence says `--format tsv` exists "for a program to read", which is the consumer script the spec was written for. (2) `skills/wp-order/SKILL.md`, the paragraph under its H1, says the computation is in `hooks/order.ts`. It is in `hooks/lib/work-graph.ts`, and `hooks/order.ts` only renders it (its own header: "The computation is `lib/work-graph.ts`").
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261001-1934_*_spec-work-order-slash-command-and-machine-readable-output.md

**Evidence.**
- `README-hooks.md` `## Files`, the `order.ts` row. Spec C2 Directive: "A consuming project can then read item, status, prerequisites … from it". The spec's flowchart has a "Consuming project script" running the helper with `--format tsv`. Spec C3 asked only that it "remains clear that no hook calls the helper and no pipeline step invokes it". It did not ask for "and by nothing else".
- `bin/fusion-work-order`, the "It reports and it blocks nothing" paragraph: "A person runs it, directly or through /fusion:wp-order". It doesn't say "only". So this one is not false. It just doesn't name the consumer route.
- `skills/wp-order/SKILL.md`, the `**The mechanism is not in this body.**` paragraph: "and the computation in `hooks/order.ts`".

**Fix direction.** README-hooks: replace "and by nothing else" with a clause that names the consumer program route and keeps "no hook calls it and no pipeline step invokes it". Skill: name `hooks/lib/work-graph.ts` as the computation, or drop the clause. The helper header already points there. Keep the reference-resolution pin in step with any path change.

**Acceptance test.** `grep -n 'by nothing else' README-hooks.md` no longer matches the `order.ts` row. `grep -n 'computation in .hooks/order.ts.' skills/wp-order/SKILL.md` returns nothing. `npm test` (in `hooks/`) is green.
