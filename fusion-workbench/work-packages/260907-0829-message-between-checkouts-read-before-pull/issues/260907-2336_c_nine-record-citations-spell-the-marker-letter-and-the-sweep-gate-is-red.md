Nine record citations spell the marker letter, so `citation-sweep.test.ts` is red

---

`npm test` fails one test of 924. `citation-sweep.test.ts > --dry-run over this repository's workbench reports rewrites=0` reads `files=8 rewrites=9 residual=3040 bare-record=9`. Every one of the nine is the same fault: a record cited with its literal state marker (`_o_`, `_c_`) where `rules/fusion-workbench-conventions.md` `## Filename Patterns` mandates the wildcard, so the citation dies at the record's next marker move.

---

**Filed by:** coder, Kai Stalmann <ks@qantr.com>

**Evidence:** `./bin/fusion-citation-sweep --dry-run`, run at `3546c47d` plus this step's two golden regenerations and the pin re-approval. The eight files and their counts:

- `260907-0710-planability-of-the-bounded-dispatch-spec.md` — 2, both citing the bounded-dispatch backlog entry
- `260907-2249-coder-fusion-forum-helper.md` — 1
- `260907-2252-coder-resolver-test-forum-keys.md` — 1
- `260907-2255-coder-three-sites-a-bin-helper-owes.md` — 1
- `260907-2258-coder-s8-skills-news.md` — 1
- `260907-2300-coder-fusion-forum-test.md` — 1
- `260907-2303-coder-s9-claude-md-and-readme-agents.md` — 1
- `260907-1507-playmaker-direct-dispatch.md` — 1

Six of the nine cite this Circle's own plan with its `_o_` marker spelled, one per coder history log from steps 4 through 9. Those six are this Circle's own writing and are why this record sits in its store.

**Two of the nine predate this Circle, and the gate was already red before step 12 began.** The planability analysis stands unchanged at `abcaa823`, the commit the plan measured its head-room at, with both its marker-spelled tokens already in place, so `npm test` was red at that commit and the plan's Current State did not notice. The playmaker history landed at `9fac4483`. By the Origin Rule those two were found beside this Directive rather than caused by it; they are named here rather than split into a second record because one gate failure is one fix, and a reclassification is cheap.

**Recurrence, not a first occurrence.** `260906-0115_*_three-agents-in-one-session-wrote-a-citation-the-always-on-rule-forbids-and-only-a-later-gate-caught-it.md` is the same mechanism recorded two days ago and closed, and `260904-1839_*_citation-sweep-test-is-red-at-head-and-was-already-red-before-this-session-started.md` is the same red gate arriving the same way. Whether the fix is another round of repairs or something that stops an agent writing the token is the question those closures did not settle.

**Acceptance test:** `cd hooks && npm test` exits 0, and `./bin/fusion-citation-sweep --dry-run` reports `files=0 rewrites=0`. The nine tokens are corrected by hand, not by `--write`: the sweep's own guards refuse a tree with pending changes, and this tree has them.

---

**Resolved:** all nine corrected by hand, one edit per token, in the eight files named above and no others. `./bin/fusion-citation-sweep --dry-run` now reports `files=0 rewrites=0 bare-record=0`, and `cd hooks && npm test` exits 0 at 924 passed of 924, 53 files. The sweep was never run with `--write`.

Each token was tested against `rules/circle-records.md` `### Citation form in the portfolio` before it was touched, and **all nine came back pointers**, so all nine were starred and nothing was reworded or fenced. Eight are unambiguous: six coder history logs opening on `Step N of <the plan>` and two entries in the planability analysis's `## Scope` and `## Sources` reading lists, where the letter carries no claim at all. The ninth needed the test asked out loud. `260907-1507-playmaker-direct-dispatch.md:64` reads `` `<entry>` renamed `_o_` → `_p_` ``, and the line *is* a statement about a marker — but the statement lives in the arrow, not in the path token, and the arrow is untouched. Starring the token cost the line nothing and repaired a pointer that was already dangling: the entry stands on disk today as `260814-1733_*_attach-the-rule-to-the-act.md` with `_p_`, so the spelled `_o_` pointed at a filename that no longer existed, written stale by the very run that renamed it.

One further marker-spelled token in this Circle's history store was found and **deliberately left alone**: `260907-2328-coder-readme-agents-cleanup-step-numbers.md:55-56` spells `_o_` and `_c_` inside a fenced `from:`/`to:` rename transcript, where the spelling is the datum. The sweep already exempts it and never listed it among the eight.

**Two of the nine were repaired outside this Circle's origin, and the call was deliberate.** `260907-0710-planability-of-the-bounded-dispatch-spec.md` belongs to `260906-2258-bounded-executor-dispatches` and `260907-1507-playmaker-direct-dispatch.md` to `shared/`. The Origin Rule decides where a defect is *filed* — which is why this record sits here and names them rather than claiming them — but it does not decide whether a red gate stays red. `workbench-citation-lint` and `citation-sweep.test.ts` recompute their corpus from the tree on every run and carry no approvable baseline, so either token left in place would redden `npm test` for every checkout until somebody edited it, whatever Circle it was born in.

**What this record does not settle** is the question its own `Recurrence` paragraph raises and the two prior closures did not answer: this is the third time the same token has been repaired by hand rather than prevented. Nothing here stops an agent writing the next one.

**Resolved by:** coder, Kai Stalmann <ks@qantr.com>
