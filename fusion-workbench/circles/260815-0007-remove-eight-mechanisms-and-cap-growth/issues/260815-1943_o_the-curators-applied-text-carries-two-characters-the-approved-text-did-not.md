The curator's applied text carries two characters the approved text did not
---
Entry L06 of the curator's change ledger was approved ending "and always did." and landed as "and always did.. " — a doubled period and a trailing space, at `CLAUDE.md:72`. Cosmetic in isolation. It matters because the apply pass's entire contract is that what lands equals what was gated, the run verifies byte-identity of the *before* text and nothing checks the *after* text, and this is the smallest thing that gap can produce.
---
**Severity:** Low for the text, Medium for the missing check.

**Verified at HEAD (`9306f0a`).** The applied line as it landed in `e8052e7`:

```
$ git show e8052e7 -- CLAUDE.md | grep -o 'and always did.*' | head -1
and always did.. Empty or absent `circles/` preserves single-Circle behaviour. …
```

The approved After text in the ledger (`history/260815-1706-curator-run.md`, entry L06) ends `and always did.` — one period, no trailing space.

**Why the check is the finding.** The commit body states that "Every before-text was re-read from disk and all twelve matched byte for byte." That claim is about the *before* text, it is true, and it is the wrong half to verify alone: the before-text check protects against applying an entry to text that has moved under it, while nothing at all protects against the applied text differing from the approved text. The curator's contract with the user at the gate is that the user is approving the exact bytes that will land. Eleven of twelve entries honoured that; the twelfth did not, and no mechanism noticed.

**Direction.** After writing each entry, re-read the region and compare it against the ledger's own `**After:**` block. The ledger already stores the approved text verbatim, so the comparison needs no new data — only a second read where there is currently one. That belongs in `agents/curator.md`'s apply phase rather than in a lint, because the ledger is a per-run artifact and no shipped file is involved.

**Two ledger-internal citation slips found alongside, both inside `history/260815-1706-curator-run.md` and neither reaching a shipped surface** — L01 attributes the deletion of `templates/plane.config.yaml` to `d0ddabb` when it was `7c12d6a`, and L07 cites `rules/fusion-workbench-conventions.md:294` for a line that stands at `:296` after entry L12's own two-line insertion into the same file. Recorded here rather than filed separately; a workbench record is not a normative surface.

**Found by:** coderev, review of `1e29572..9306f0a`, commit `e8052e7`.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). Both halves stand.**

```
grep -o 'and always did..\{0,3\}' CLAUDE.md | od -c
  a n d   a l w a y s   d i d . .   E \n
```

The doubled period is still in `CLAUDE.md` (the trailing space has collapsed into ordinary sentence spacing). And `agents/curator.md:210` still verifies only the **before** text — *"Before applying an entry, re-read its before-text from disk. Where disk and ledger disagree, mark the entry `stale`"* — with no comparison of what was written against the ledger's `**After:**` block.

The two characters are trivial and the mechanism gap is not: a gated pass whose whole value is that the user approved a specific text has no check that the approved text is what landed. A second curator run has been through this file since (`e8052e7`) without the check being added or the characters removed.
