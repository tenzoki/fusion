`citation-sweep.test.ts` is red at HEAD, and was already red before this session started
---
The test asserts that `bin/fusion-citation-sweep --dry-run` reports `rewrites=0` over this repository's own committed workbench. It does not, and it did not at the session-start commit either. `npm test` has been failing on it for some time with nothing recording that.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Evidence, measured rather than inferred.** A detached worktree at `cda72f71`, the commit this session began on, run through `bin/fusion-citation-sweep --dry-run`: `files=12 rewrites=17`. The same command against the working tree at `e2a66a12` reports more, because this session added records of its own. The gate is therefore not a regression from today's work; it was inherited.

**Why it matters more than a stale count.** `a60d1fea` shipped the sweep with the commit subject "the citation sweep ships behind three guards, and its idempotency is a test", and idempotency over this repository's own workbench is precisely what the test measures. A red idempotency gate means either the sweep is not idempotent over the current corpus, or the corpus has since gained citations the sweep would rewrite and nobody swept them. The two have different fixes and the record does not choose between them.

**Why nobody noticed.** No session between `a60d1fea` and today reported a red suite. That is a second, smaller finding: this repository's own release process runs `claude plugin validate` and a coverage read, and nothing in it fails loudly on a red `npm test` before a tag is pushed.

**Acceptance.** `cd hooks && npm test` passes `citation-sweep.test.ts` at HEAD, and the record says which of the two causes applied. If the corpus was the cause, the sweep that repaired it is named by commit. If the sweep was the cause, the non-idempotent rewrite is named and its test case added.

---
Resolved: the corpus, not the sweep. `bin/fusion-citation-sweep --dry-run` reported `files=8 rewrites=15`, every one of class `bare-record` — the one-line rule that wildcards a literal marker — so the sweep is idempotent and what drifted was the workbench. Fifteen citations written with a literal marker were repaired by hand to `_*_` per `rules/fusion-workbench-conventions.md` `## Filename Patterns`: one in this Circle's record, one plan pointer in each of six coder history records, and eight in `260904-1636-playmaker-direct-dispatch.md`. None was a statement about a citation and none was fenced, so no finding was deleted. Census after: `files=0 rewrites=0`. `cd hooks && npm test` exits 0, 48 of 48 suites, `citation-sweep.test.ts` among them.

---
Revised by: 260904-1050-orchestrator-session.md `## The sweep gate was green at session start, and this record's title is wrong` — the measurement this record was filed on used the wrong binary, and the gate was never inherited red.

**What was measured wrong.** The filing ran `bin/fusion-citation-sweep` **from the installed plugin** against a detached worktree at `cda72f71` and read `files=12 rewrites=17`. The gate does not run that binary: `citation-sweep.test.ts` executes the repository's own compiled `hooks/dist/`. Re-measured with the work tree's own sweep inside that same worktree, `cda72f71` reports `files=0 rewrites=0`. **The gate was green at session start.**

The two readings differ because the installed copy is version 10.22.0 while this checkout and `origin/main` stand at 10.20.0, so the installed sweep carries a later grammar. Being one release *ahead* rather than behind is the reverse of the condition `260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md` describes, and neither this record nor that one had a reason to expect it.

**What follows.** The gate went red **during** this session, from citations this session's own history records introduced, and the repair closed exactly those. The `Resolved:` line above is right that the cause was the corpus rather than a non-idempotent sweep, and wrong in calling the drift inherited: it was ours. The title is wrong and stays, records not being renamed for content.

**What does not follow.** Nothing about the repair changes. The sixteen tokens were genuinely wrong against `## Filename Patterns`, and the gate is green at HEAD with the work tree's own binary.
