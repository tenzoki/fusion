The citation sweep is not idempotent: a truncated citation gains a marker tail on rewrite
---
`hooks/scripts/citation-sweep.mjs` tokenises a truncated citation (`<stamp>_o_*`, `<stamp>_*_`, pre-v4 `<stamp>[o]-slug`) as a bare stamp, replaces the stamp with the full basename and leaves the tail standing: `<basename>.md_o_`, `<basename>.md[o]-slug`. 239 such tails in 89 workbench files were stripped by hand in step 10; a second dry run over the swept tree still offers 211 chained rewrites of this kind. The plan's risk line calls the sweep idempotent.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

Evidence: step-10 coder history in this Circle's history store (260829-1331). Acceptance: the grammar recognises a truncated citation as its own class (or the sweep refuses to rewrite a stamp followed by a marker tail), `citation-sweep.test.ts` carries the three truncated shapes as fixtures, and a `--dry-run` over an already-swept tree reports `rewrites=0`.

---
Reconciled 260829-1343: still open. `node hooks/scripts/citation-sweep.mjs --dry-run` at HEAD `e9f2ed0b` reports `files=107 rewrites=208 residual=3336 stamp-bare=208`, all chained rewrites of the kind described (211 at filing). Nothing in the session range touched the script's tokenisation after commit B. The tails the hand pass did not strip are filed separately as `260829-1343_*_fifty-nine-marker-tails-the-sweep-produced-still-stand-in-terminal-records.md`.

---
Resolved: 260829-1420, coder (Turn 2 task R1). A truncated citation (`<stamp>_o_`, `<stamp>_*_`, `<stamp>_d`, `<stamp>_…`) is one `bare-record` token now and is rewritten whole (literal marker to `_*_`) or left whole; the `stamp-bare` rewrite that chained the tails is removed from `citation-sweep.mjs`. `citation-sweep.test.ts` carries the three truncated shapes and a second dry run over the fixture as the idempotency check. Over this repository, after `--repair --write` and one `--write` (119 literal markers on truncated citations the first sweep could not see), `node hooks/scripts/citation-sweep.mjs --dry-run` reports `files=0 rewrites=0`.

Reconciled: 260829-1805, reconciler. Closure verified at `3276b1e1` and re-verified at `a60d1fea`: `bin/fusion-citation-sweep` dry-run over the tree prints `rewrites=0`, `bin/fusion-citation-check` prints `store-prefixed=0`, `npm test` 805 green.
