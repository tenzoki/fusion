The write-time citation check is silent on the class that produced every violation of this session

---
`REPORTED_STATUSES` in `hooks/lib/citation-form.ts` is `store-prefixed` and `stale-marker`. A
citation that spells the cited record's **current** marker is neither: the lookup finds exactly one
file, so the scanner returns `resolved` and the hook says nothing. That token is still a violation
of `rules/fusion-workbench-conventions.md` `## Filename Patterns`, which mandates the wildcard, and
`citation-sweep.test.ts` fails on it. So the commonest way to write the fault is the one way the
write-time check cannot see.

---
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>

**Measured in this session, not inferred.** Nine tokens across eight records took `npm test` red at
step 12 of this Circle's plan. Six were coder history logs each opening on `Step N of` the plan
cited with `_o_` spelled out — and the plan stood at `_o_` on disk at the time, so every one of the
six resolved and was silent. The check itself was live and working throughout: it fired three times
this session, all three on `store-prefixed`, recorded as `citation_form` rows in the guard event
log. The mechanism is not broken; its reported set does not contain the class that recurs.

**The closure it bears on.** `260906-0115_*_three-agents-in-one-session-wrote-a-citation-the-always-on-rule-forbids-and-only-a-later-gate-caught-it.md`
was closed two days earlier on that mechanism. Its acceptance reads "A citation that violates the
form is reported to the writer at the moment the record is written", and it says outright that
closing on the three instances being repaired is not acceptance. Its closure note and the module
header both name one uncovered class, `dangling`, and give a reasoned argument for leaving it out.
Neither names this one. So the closure is sound for what it claims and its stated coverage is
narrower than its acceptance sentence reads, in a direction nobody wrote down.

**Why this class is not `dangling`'s case.** The argument for excluding `dangling` is that a failed
lookup cannot be told from a probe fixture, a foreign record or a record about to be created, and
`rules/critical-stance.md` §4 forbids approximating an undecidable question. Nothing of that holds
here. The token resolved: the record exists, the marker letter is in the token, the wildcard
spelling is mechanical, and `bin/fusion-citation-sweep` already computes exactly that rewrite for
every such token without judgement. The verdict is decided from the token's own shape plus a lookup
that succeeded, which is at least as safe as the two classes already reported.

**Evidence.** `hooks/lib/citation-scan.ts`, the `CitationStatus` union and `SHAPE_DECIDED_KINDS`;
`hooks/lib/citation-form.ts`, `REPORTED_STATUSES` and the header section on which verdicts are left
out; the nine repaired tokens listed in
`260907-2336_*_nine-record-citations-spell-the-marker-letter-and-the-sweep-gate-is-red.md`, whose
own closing paragraph says the third hand repair of the same token settles nothing.

**Acceptance test.** A record written with a citation spelling the cited record's current marker is
reported to its writer at the write. Failing that, `260906-0115`'s closure note and the module
header both state this class as excluded and why, so the next reader of either is not told the
moment has moved for a fault it has not moved for.

**Cross-references:** `260906-0115_*_three-agents-in-one-session-wrote-a-citation-the-always-on-rule-forbids-and-only-a-later-gate-caught-it.md`;
`260907-2336_*_nine-record-citations-spell-the-marker-letter-and-the-sweep-gate-is-red.md`;
`260904-1839_*_citation-sweep-test-is-red-at-head-and-was-already-red-before-this-session-started.md`.
