The corpus header states a criterion its predicate no longer follows: an open discussion is now inside the blocking citation lint
---
`hooks/lib/citation-corpus.ts` on `fj03d` keeps, in capitals, the criterion under every exclusion: "A KIND THAT A MECHANISM REWRITES IS OUT". Two paragraphs on, the same header says an open discussion is in, "where the marker predicate left it out", although "its record is rewritten at every round, so a repair is futile until it closes", and that "the reader follows the contract, not this comment". The predicate follows the contract. So a discussion that is open while the suite runs is judged by a gate with no baseline, against the reasoning the file gives for the gate's corpus.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md

Severity: Low. Scope: `hooks/lib/citation-corpus.ts` (header and `isLiveRecord`), `hooks/lib/citation-scan.ts` (the comment on `STORES`), `hooks/lib/__tests__/workbench-citation-lint.test.ts`, on `fj03d` at `cd1b5522`.

**Evidence.**

- The header passages quoted above, added in `3a11d9ea`.
- `codec/contract/transitions.json`: kind `discussion`, states `open` and `closed`, terminal `closed`. `isLiveRecord` therefore answers true for an open discussion's narrative.
- Before step 8 the predicate fell through for both discussion states; the removed header text reasoned why at length ("a blocking check over it would fire on a state the design REQUIRES the file to pass through").
- FJ03b recorded the departure for the reporter, `bin/fusion-citation-check`, which blocks nothing. Step 8 carries it into `workbench-citation-lint.test.ts`, which fails `npm test`.
- No case in `workbench-citation-lint.test.ts` places a discussion record: the predicate case covers issue, decision and plan fixtures.

**The question in it.** Either reading is defensible; what is not is a header that argues one and code that does the other. If the discussion kind stays in, the criterion in capitals is no longer the criterion and should say what is: the record's state alone. If it goes out, `isLiveRecord` needs the kind, which the index entry carries.

**Acceptance.** The header's criterion and the predicate agree, in whichever direction the user rules; a case in `workbench-citation-lint.test.ts` places an open and a closed discussion record and pins the answer for both.

Executor: `code-implementer`, after the ruling.

---
Resolved: fj03d `541893ed` — the user ruled that an open discussion leaves the blocking lint. `inCitationCorpus()` in `hooks/lib/citation-corpus.ts` is `isLiveRecord()` less the discussion kind and is the lint's corpus; the reporter keeps `isLiveRecord()`, and the header says which reader follows which. A case pins an open and a closed discussion for both predicates. Verified 2026-10-05 by the orchestrator in the fj03d worktree at `85ea803b`: hooks 1 134 of 1 139, the reds being the four legacy own-tree cases and the known monitor case; no file under `codec/` changed, bundle `c76bbce9…`.
