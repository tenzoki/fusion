`circleDirs()` did not learn the archive prefix that `findRecord()` did, so an archived Circle directory stays unexpressible

---

Step 6b taught `findRecord()` in `hooks/lib/__tests__/helpers/citation-scan.ts` to resolve a record
whose directory sits under one `archive/<sweep>/` prefix, on the user's answer to
`260819-2213_o_the-citation-grammar-cannot-express-a-record-inside-archive-*`. Its sibling
`circleDirs()` was not changed, and nothing in that answer says it should have been.

The consequence is the same defect one level up: a citation of `archive/<sweep>/circles/<dir>/` — an
archived **Circle directory** rather than a record inside one — still scans as `dangling`, and the
only form the scanner accepts is a path that does not exist on disk.

---

**Found by step 7 of this Circle**, which met thirteen such citations and could not fix the cause:
`hooks/` was outside its file set. It worked around them by citing each Circle's **record** at its
archive path (`archive/<sweep>/circles/<dir>/_c_circle.md`) instead of the bare directory. That is a
true path, it is more precise than the directory, and it yields no token at all because `CIRCLE_RE`
does not match a directory followed by a further path segment. Step 7 states plainly that this is a
workaround and not a fix, which is why this record exists.

**It is latent, not blocking.** After step 7 no such citation is left dangling, so step 9's gate does
not open red on it. What is inherited is the inability to express one: the next time a sweep archives
a Circle and somebody cites its directory, the citation is wrong in a way no correct spelling repairs.

**The fix is the same shape the user already chose**, applied to the sibling function — one archive
sweep, prefix-tolerant, with the same stated cost that an archived copy stops being distinguishable
from a live one sharing its name. It is deliberately **not** taken here, because extending a user's
answer from the function it named to a function it did not name is a decision, and a consumer report
relayed to this project on the same day named exactly that move as the failure worth avoiding: twice
in one session somebody decided silently and both times it was wrong.

**Two things that travel with it**, both already recorded elsewhere and repeated here because whoever
takes this record will want them in one place. The one-sweep bound in `anchoredUnder` is held by a
pattern and a comment and by no test; the two-sweep negative control is the case that decides whether
the gate can go red at all. And whether an archived record should be a citation target **at all** —
rather than archiving ending a record's life as one — is the question `260819-2213` raised and its
answer explicitly did not settle. Deciding that one may remove the need for this one.

Filed by the orchestrator of session `260819-2006` from step 7's report. It arose from this Circle's
Directive, so it stays in the Circle's store under the Origin Rule.

---
**Reconciliation 260820-0830** (reconciler, domain `code`, HEAD `04db0b0`) — **still open,
reproduces.** `circleDirs()` at `hooks/lib/__tests__/helpers/citation-scan.ts:286-294` reads
`<workbench>/circles` and nothing else; it has no archive prefix and no call to `anchoredUnder`,
which is at `:367`. The latency the record claims also holds: the corpus scan at HEAD reports zero
violations over 195 files, so nothing is red on this today. Marker unchanged.

---
Resolved: `circleDirs()` resolves one archive sweep through `ARCHIVE_SWEEP_RE`, the same bound `anchoredUnder()` holds — the user's fix shape 1 from `260819-2213` applied to the sibling function and stated as that at the branch rather than presented as new. It returns a map of name to resolved paths instead of a set, so an archived Circle reports the archive path it actually resolved to rather than a `circles/<dir>` that is not on disk, and a live-plus-archived name collision reads `ambiguous` exactly as the Circle-record form already does. 188 tokens moved from dangling to resolved across the workbench, all inside `archive/`; the blocking gate's verdict is unchanged because it excludes that tree.
