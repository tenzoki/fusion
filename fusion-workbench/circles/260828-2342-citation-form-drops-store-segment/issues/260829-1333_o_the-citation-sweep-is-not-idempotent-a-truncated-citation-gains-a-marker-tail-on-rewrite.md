The citation sweep is not idempotent: a truncated citation gains a marker tail on rewrite
---
`hooks/scripts/citation-sweep.mjs` tokenises a truncated citation (`<stamp>_o_*`, `<stamp>_*_`, pre-v4 `<stamp>[o]-slug`) as a bare stamp, replaces the stamp with the full basename and leaves the tail standing: `<basename>.md_o_`, `<basename>.md[o]-slug`. 239 such tails in 89 workbench files were stripped by hand in step 10; a second dry run over the swept tree still offers 211 chained rewrites of this kind. The plan's risk line calls the sweep idempotent.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

Evidence: step-10 coder history in this Circle's history store (260829-1331). Acceptance: the grammar recognises a truncated citation as its own class (or the sweep refuses to rewrite a stamp followed by a marker tail), `citation-sweep.test.ts` carries the three truncated shapes as fixtures, and a `--dry-run` over an already-swept tree reports `rewrites=0`.
