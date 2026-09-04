`citation-sweep.test.ts` is red at HEAD, and was already red before this session started
---
The test asserts that `bin/fusion-citation-sweep --dry-run` reports `rewrites=0` over this repository's own committed workbench. It does not, and it did not at the session-start commit either. `npm test` has been failing on it for some time with nothing recording that.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Evidence, measured rather than inferred.** A detached worktree at `cda72f71`, the commit this session began on, run through `bin/fusion-citation-sweep --dry-run`: `files=12 rewrites=17`. The same command against the working tree at `e2a66a12` reports more, because this session added records of its own. The gate is therefore not a regression from today's work; it was inherited.

**Why it matters more than a stale count.** `a60d1fea` shipped the sweep with the commit subject "the citation sweep ships behind three guards, and its idempotency is a test", and idempotency over this repository's own workbench is precisely what the test measures. A red idempotency gate means either the sweep is not idempotent over the current corpus, or the corpus has since gained citations the sweep would rewrite and nobody swept them. The two have different fixes and the record does not choose between them.

**Why nobody noticed.** No session between `a60d1fea` and today reported a red suite. That is a second, smaller finding: this repository's own release process runs `claude plugin validate` and a coverage read, and nothing in it fails loudly on a red `npm test` before a tag is pushed.

**Acceptance.** `cd hooks && npm test` passes `citation-sweep.test.ts` at HEAD, and the record says which of the two causes applied. If the corpus was the cause, the sweep that repaired it is named by commit. If the sweep was the cause, the non-idempotent rewrite is named and its test case added.
