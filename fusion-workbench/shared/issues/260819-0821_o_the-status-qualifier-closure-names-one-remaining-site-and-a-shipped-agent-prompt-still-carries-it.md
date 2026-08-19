The `Status:` qualifier closure names one remaining site and a shipped agent prompt still carries it

---

`260819-0041_c_the-status-position-carves-an-exception-for-a-record-you-are-transitioning-and-never-says-what-it-is.md`
was closed with the note "**The qualifier is gone.**" and one named residual,
`docs/upgrading-to-v10-2.md`. Its own **Fix direction** was "Drop the qualifier in **all three
places**… One clause, three files". The change dropped it in one file. A second shipped surface —
an agent prompt loaded on every orchestrator dispatch — still carries the clause verbatim, and is
named neither in the `Resolved:` note nor in the follow-up record filed for the residual.

---

**What was fixed.** `rules/fusion-workbench-conventions.md:525-527`, the decision-record position:

> A record written before the removal still carries the field; leave it exactly as it stands,
> including when you transition it: those drifted headers are the evidence the removal was decided on.

Unconditional, and it names the transition case rather than excluding it. Correct.

**What still stands.** `agents/orchestrator.md:302-303`, the Circle-record position:

> A record written before the removal still carries
> the field; leave it exactly as it stands — nothing writes it, nothing reads it, and hand-correcting
> it on a record you are not transitioning destroys the evidence the removal was decided on.

That is the clause the closed record identified as the *origin* of the phrasing — "The clause comes
from `agents/orchestrator.md:298-303`, whose Circle-record paragraph carries it verbatim". It is
untouched by `06ab15b`: `git show 06ab15b -- agents/orchestrator.md` changes only Phase 4 step 2b and
one `## Observability` row.

**What the follow-up record covers, and does not.**
`260819-0756_o_the-v10-2-migration-note-still-states-the-status-position-with-the-qualifier-the-rule-just-dropped.md`
was filed in `83488e9` for `docs/upgrading-to-v10-2.md:88`. It names that file only. So of the two
shipped surfaces that carried the qualifier before the change, one was fixed and one is now
unrecorded anywhere.

**Why it is not cosmetic.** The two paragraphs are about two different removals — the Circle record's
(decision `260815-2312`) and the decision record's (`260818-2212`) — but they state the same
position, and the reason the qualifier was dropped applies identically to both: a transition is the
only moment an agent touches a pre-removal record at all, so a justification scoped to records you
are *not* transitioning says nothing about the case that occurs. The orchestrator prompt is where an
agent actually reads it.

Verified at HEAD `83488e9` by
`grep -rn "a record you are not transitioning" agents/ skills/ rules/ docs/` — two hits,
`agents/orchestrator.md:303` and `docs/upgrading-to-v10-2.md:88` — and by
`git show 06ab15b --stat` showing `agents/orchestrator.md` with 6 changed lines, none of them in the
`Status:` paragraph.

**Fix direction.** Rewrite `agents/orchestrator.md:302-303` the way the conventions file was
rewritten: unconditional, naming the transition case. One clause, one file, and it shrinks the
paragraph. Then either add the site to `260819-0756` or state in that record why it is out of scope.

Found in the coderev pass over `5ec26b2..83488e9`, session `260818-2301`, Turn 2. No Circle active,
so it is filed in the shared store under the Origin Rule.
