# The coderev pass of session 260807-2020 filed four issues and wrote no review file

---

**Severity:** Low
**Domain:** code
**Filed by:** reconciler, Phase 3 pass of session `260807-2020`
**Affects:** `fusion-workbench/shared/reviews/` (the absent document); `agents/coderev.md:69,76,87` (the obligation)
**Cross-references:**
`fusion-workbench/shared/issues/260807-2152_c_declared-lang-prefix-matches-so-deutsch-resolves-to-de.md`,
`fusion-workbench/shared/issues/260807-2153_*_the-exempt-surface-list-is-plugin-repo-shaped-but-ships-to-every-consumer.md`,
`fusion-workbench/shared/issues/260807-2154_c_the-artifact-language-is-mechanised-for-nine-agents-and-asserted-for-sixteen.md`,
`fusion-workbench/shared/issues/260807-2155_c_three-language-claims-outside-the-authoring-home-still-describe-the-single-declaration.md`
(the four findings, each carrying `**Filed by:** coderev`),
`fusion-workbench/shared/reviews/260807-2154-ontorev-chat-voice-sibling-reference-and-version-bump.md` (the sibling reviewer's pass, which did write one)

---

## The defect

Four issues in `shared/issues/` carry `**Filed by:** coderev, review of b246996..HEAD`. No
corresponding review document exists. `shared/reviews/` holds two files from this session —
`260807-2035-conceptrev-plan-two-language-declarations.md` and
`260807-2154-ontorev-chat-voice-sibling-reference-and-version-bump.md` — and its only `coderev`
entries are `260731-2247` and `260806-1154`, both from earlier sessions.

Confirmed against git rather than against the directory listing alone:
`git log --diff-filter=A --name-only b246996..HEAD | grep -i coderev` returns nothing. The file was
never written, as opposed to written and lost to a staging fault.

## Why it matters

`agents/coderev.md:69` makes the review file the pass's only durable record, and says so as the
reason no history entry is kept:

> You write no separate session-history entry — your review file under `$OUT_REVIEW` is this
> session's durable record, and a history log would only duplicate it.

`:76` and `:87` name the path and the mandatory `coderev` sender segment. With neither the review
file nor a history entry, this pass left no record of its own scope: what commit range it read,
which files it covered, what it looked at and found clean, and how many findings it judged the tree
to hold in total. The four issues are the findings; nothing states they are *all* the findings.

The practical loss is at the next review. A later coderev pass over the same surface has no way to
tell what its predecessor already cleared, so it either re-reads everything or silently assumes
coverage it cannot verify. The ontorev pass on the same night left exactly that document, which is
what makes the gap visible rather than invisible.

## What is not wrong

The four findings themselves are intact, well-evidenced and correctly routed — three closed within
the session, one still open and re-verified in this reconciliation pass. This is a missing
record, not a missing review.

## Fix directions (none chosen)

1. **Reconstruct the review file from the four issues.** Cheap and honest if it states plainly that
   it was assembled after the fact by the reconciler from the filed findings, and that the pass's
   clean-surface coverage is therefore not recoverable. Half a record is not the record.
2. **Accept it for this session and treat the gap as an instance rather than a defect.** The
   findings survived; the reconstruction would document what was filed, which the issues already
   document.
3. **Ask why the step was skipped before writing anything.** One instance is not a pattern, and
   nothing here establishes whether the obligation is unclear in the prompt, whether the dispatch
   omitted it, or whether the pass simply ran out of turn. That question is worth one look at the
   next coderev dispatch before any prompt is edited.

Option 3 first, then 1 or 2. Editing `agents/coderev.md` on a single instance would be a fix
applied ahead of a diagnosis.

---
Also seen: 260810-1907 in the KRK project, reported by the user on 260811-2030 — a coderev pass
over that project's Turn 2 likewise filed its findings and left no review document. Not transferred
as a record of its own: it is the same defect, and what it changes here is the **count**.

That matters more than a second data point usually would, because this record's chosen procedure
is keyed to the count. It asks for option 3 first — ask why the step was skipped, before writing
anything — on the stated ground that "one instance is not a pattern, and nothing establishes
whether the obligation is unclear in the prompt, the dispatch omitted it, or the pass ran out of
turn". Two instances, in two projects, against two different prompts' worth of dispatch wording,
narrows that: whatever is at fault is not local to one dispatch, because the two dispatches were
written months apart by different sessions. The remaining candidates are the obligation's own
wording in `agents/coderev.md` and the conditions under which a pass runs at all.

The diagnosis-first order still holds — it is now cheaper to satisfy, not less necessary. What has
changed is that "accept it as an instance" (option 2) is no longer available: an instance that
repeats across projects is a pattern, and the record should be worked rather than closed as a
one-off.

Second witness's detail, as reported: the reporting project also observed the asymmetry this
record names — an ontorev pass the same night wrote exactly the document the coderev pass did not.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: No review file for the cited range exists in `shared/reviews/`, and neither the reconstruction nor the diagnosis note was produced. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.
