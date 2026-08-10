The skip-licence blacklist misses every negation that does not spell the word "not"

---

`hooks/lib/__tests__/state-drift-detection-lint.test.ts:152-169` declares `SKIP_LICENCES` and the
header at `:62` gives a standing instruction: *"Add to `SKIP_LICENCES` when a new one is found."*
This is that filing.

The header's honesty is not at issue and should be preserved — it states plainly that the list is a
blacklist, that it is incomplete by construction, that the scan is per-sentence and only over
sentences mentioning the check, and that "the absence of a failure" proves nothing. All four claims
hold against the code. What follows is coverage, not a correction of the stated limit.

Phrasings that read as a licence to a human and pass every regex in the list:

| Phrasing | Why it passes |
|---|---|
| "…run the drift check; this is **not required**" | `\bdo(?:es)? not\b` needs the auxiliary; `\bnot run\b` needs the verb adjacent |
| "…the drift check **isn't** run at this point" | no `not` token at all after `plain()`; `\bdon't\b` covers only that one contraction |
| "…run the drift check, **except when** the Turn produced no commit" | `\bunless\b` is listed, its synonym is not |
| "…run the drift check **as time allows**" / "**best effort**" / "**where practical**" | none of the three is on the list; the two near-neighbours `\bif you have time\b` and `\bwhere time permits\b` are |
| "…the drift check is **no longer needed** once Turn 2 starts" | `\bno need\b` requires the two words adjacent |
| "…this check can be **dropped** for a single-Turn session" | `\bskip…\b` and `\bomit…\b` are listed; `drop` is not |
| "…run it **sparingly**" / "**at most once per session**" | no listed token |
| "…run the drift check **provided that** the event log is fresh" | conditionalises without `only if` |

`isn't` and `not required` are the two worth weighing most: they are the ordinary English forms of
the two inversions the list *does* catch (`\bnot run\b`, `\bdo not\b`), so a rewording that changes
nothing semantically walks straight through.

One structural gap alongside the vocabulary one, and it is the harder half: the scan only reads
sentences that themselves match `/drift check/i` (`:232`). A licence in the following sentence —
"Run the drift check in the same command as that `turn_end` emission. This is optional for a Turn
that produced no commit." — is invisible, because the second sentence never names the check. The
header does state the per-sentence scoping, so this is a known limit rather than a broken claim; it
is recorded here because it is the cheaper of the two to close (widen the scan to the sentence
following a matching one, or to the whole window once any sentence in it mentions the check).

---

**Failure scenario.** An editor softens `agents/orchestrator.md` Step 3e to "…run the drift check in
the same command as that `turn_end` emission — this isn't required when the Turn produced no
commit." `npm test` stays green: the binding phrase "in the same command" is intact, the mention is
intact, and no regex matches "isn't required". The check is now optional at the one call point that
fires every Turn, which is the condition issue `260801-2038` measured four times.

**Fix.** Add the eight rows above to `SKIP_LICENCES`, each with a control in the second `describe`
block so none is merely declared. Decide separately whether to widen the sentence scope; that one
changes what the gate reads and deserves its own note in the header.

**Cross-references.** `shared/issues/260810-0502_c_the-state-drift-lint-anchors-on-the-phrase-it-
checks-and-one-negative-control-is-a-duplicate.md`;
`shared/issues/260810-1813_o_the-condition-table-test-accepts-a-row-whose-drift-when-cell-is-empty.md`
(the other named remainder of the same rewrite).

**Filed by:** coderev, review of session `260810-1646` Turn 1, range `5ef92eb..940d522`.

---

**Resolved, route 1, and the class is still open** — session `260810-1646` Turn 2,
`hooks/lib/__tests__/state-drift-detection-lint.test.ts`.

Eleven patterns added for the eight forms in the table above (two contraction families,
`not required|needed|necessary|mandatory`, `no longer`, `except when|where|if|for`,
`provid(ed|ing) that`, `as time allows|permits`, `best effort`, `where|when|if practical`,
`drop(s|ped|ping)`, `sparingly`, `at most`); `skip`, `defer` and `omit` widened to their `s`/`ing`
forms. Each of the eleven was spliced one at a time into the Step 3e sentence of a **scratch copy**
of `agents/orchestrator.md` (never the real one — decision `260810-1820`): all eleven pass the
pre-change lint and fail the changed one.

The header's standing instruction became structural rather than a sentence. `SKIP_LICENCES` is now
`{ re, example }` pairs, and a control requires each entry to be the *first* in the list that matches
its own example and that example to be rejected in an otherwise bound sentence. A pattern cannot be
declared without a witness, and a subsumed pattern fails rather than sitting dead — which found two
dead entries on the first run: `\bdon't\b` (covered by the contraction family) and
`\bmay be skipped\b` (covered by `\bskip…\b`). Both removed; neither removal narrows what is
rejected.

**The structural gap in §"One structural gap alongside the vocabulary one" is NOT closed, and
widening the sentence scope is not the cheap half it looked like.** Measured: the Setup Step 1 act
window in the real prompt carries "**Skip steps 2-6**" (`:84`) and "skip already-completed tasks"
(`:95`), both legitimate, both matching `\bskip…\b` — so a window-wide scan fails on the current
prompt on the day it lands. The narrow scope is what holds the blacklist's false-positive rate at
zero; the two approximations prop each other up. Appending "This is optional for a Turn that produced
no commit." as a following sentence still leaves the scratch prompt at 16 passed.

**Proposal, not filed as a fix.** What would close the vocabulary class is a change of mechanism
(`rules/critical-stance.md` §4), not a longer list: pin the check-mentioning sentences of each act
window, whitespace-normalised, against a baseline literal held in the test, making the decided
question "is this the text a human last approved?" rather than "does this prose permit skipping?".
About forty lines, plus a re-approval on every legitimate rewording of those four sentences. Not
taken here for sequencing: a queued task in the same session rewrites the drift-check prose in
`agents/orchestrator.md`, and a pin landed first would hand that executor a red suite in a file it
does not own. Recorded in the test file's header. History:
`shared/history/260810-2029-coder-drift-lint-residuals.md`.
