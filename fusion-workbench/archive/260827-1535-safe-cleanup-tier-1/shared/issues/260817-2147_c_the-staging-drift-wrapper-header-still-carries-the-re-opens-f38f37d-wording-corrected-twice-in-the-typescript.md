`bin/fusion-staging-drift`'s header still carries the "re-opens f38f37d" wording that two commits corrected in the TypeScript

---

The formulation `bd2db5c` removed from the emitted sentence, and `6b6436d` then replaced with
per-shape justifications, survives verbatim in the shell wrapper's header. It is the third copy
of one sentence, and it is now the only one still making the claim both commits were spent
removing.

---

## The three copies

`hooks/lib/staging-drift.ts:653-657` — corrected twice, currently per-shape:

> … each way of loosening it fails on its own — `-A` and a directory argument are the
> over-staging that shape prevents; `-u` stages a renamed record's deletion and adds nothing in
> its place …

`hooks/lib/staging-drift.ts:33-36` — the head of the same file, which never made the claim:

> The fix therefore cannot be a broader `git add` — loosening the shape is explicitly excluded
> by the issue's own acceptance.

`bin/fusion-staging-drift:51-52` — untouched:

> The answer is therefore not a broader `git add`; loosening the shape re-opens f38f37d, where
> a `git add -u` over a directory took three records out of HEAD.

The middle clause is the one `82a860d:hooks/lib/staging-drift.ts:653` emitted word for word
("loosening it re-opens `f38f37d`") and that `bd2db5c` replaced. "Loosening the shape re-opens
f38f37d" ranges over all four loosenings and is false for three of them: measured on git 2.49.0
over a renamed record, `git add -A <dir>`, `git add <dir>` and `git add '<dir>/*.md'` each stage
the rename whole and cannot take a record out of HEAD. Only `-u` reproduces `f38f37d`.

## What softens it, and what does not

The same clause names `-u` immediately after, so a reader who checks the claim meets the correct
mechanism in the same breath — this copy is less wrong than the emitted one was, and it reaches
no consuming project's session, being a comment in a bash wrapper. That is why it is Low and not
Medium.

What it does not have is a reason to be different from its two siblings. This project has already
paid for a corrected sentence that reached one copy and not the others: `260807-2154_*_corrected-sibling-wording-never-reaches-an-existing-consumer.md`
is the same class, and `260817-2132_*_the-staging-sentences-source-comment-attributes-f38f37d-to-git-add-a-while-the-same-file-attributes-it-to-u.md` was filed for precisely this pattern one file over — a
source comment left disagreeing with the shipped text derived from it, on the ground that
correcting one without the other "leaves the next editor the same trap". The wrapper header is
the file a reader meets when they arrive at this mechanism from `bin/` rather than from
`hooks/lib/`.

## Recommendation

Bring `:51-52` into line with the file it wraps, without importing the per-shape enumeration
(the wrapper header is a summary, and the enumeration belongs where the sentence is emitted).
For example:

> The answer is therefore not a broader `git add`: the shape's own defect record is `f38f37d`,
> where a `git add -u` over a directory of renamed records staged three deletions and added
> nothing, taking those records out of HEAD.

That keeps the incident, keeps the mechanism, and drops the claim that every loosening
reproduces it.

## Scope

`bin/fusion-staging-drift` only — a shell comment, no compiled twin, no emitted text, no test.
Pre-existing: the wrapper was not touched by `bd2db5c` or `6b6436d`.

**Severity:** Low
**Filed by:** coderev, review of `bd2db5c..6b6436d`
**Cross-references:** `260817-2130_*_the-git-add-prohibition-s-restated-justification-holds-for-u-alone-and-is-false-for-the-other-three-shapes.md` (the emitted copy, corrected), `260817-2132_*_the-staging-sentences-source-comment-attributes-f38f37d-to-git-add-a-while-the-same-file-attributes-it-to-u.md` (the same one-copy-corrected pattern, resolved in `6b6436d`), `260807-2154_*_corrected-sibling-wording-never-reaches-an-existing-consumer.md` (the class)

---
Resolved: The third copy at `bin/fusion-staging-drift:51-54` no longer ranges over every
loosening. It now reads "The answer is therefore not a broader `git add`: the shape's own
defect record is f38f37d, where a `git add -u` over a directory of renamed records staged
three deletions and added nothing, taking those records out of HEAD." The incident and the
mechanism both stay; the claim that any loosening reproduces the incident is gone, which
brings the wrapper header into line with the two siblings in `hooks/lib/staging-drift.ts`.
The commit hash stays as provenance — this is a `bin/` header in fusion's own repository,
read by a fusion developer, and the defect was the over-attribution rather than the citation.
The per-shape enumeration was deliberately not imported: the header is a summary and the
enumeration belongs where the sentence is emitted. Shell comment only — no compiled twin, no
emitted text, no test; `npm test` in `hooks/` green all the same (exit 0).
