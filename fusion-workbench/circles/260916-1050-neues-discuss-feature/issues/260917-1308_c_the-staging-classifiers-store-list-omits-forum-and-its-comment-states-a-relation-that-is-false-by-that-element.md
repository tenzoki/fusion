The staging classifier's store list omits forum, and its comment states a relation that is false by that element

---
`hooks/lib/staging-drift.ts`'s `STORES` carries a comment saying the list is `TYPE_FOLDERS` minus the three
retired review folders. `TYPE_FOLDERS` also carries `forum`, and `STORES` does not. `forum` is not retired:
`bin/fusion-paths` resolves `OUT_FORUM` and `SCAN_FORUM` to `shared/forum`, and `hooks/lib/__tests__/fusion-paths.test.ts`
asserts both. So the stated relation is false by exactly one element, and was false before the `discussions`
work touched the file.

Two consequences, both live at HEAD:

- A forum entry sitting uncommitted under the workbench classifies as `unclassified` rather than `record`, so
  the staging check says in the same line that it makes no claim about it. A message left for another checkout
  is exactly the kind of authored artifact the `record` class exists to name.
- `hooks/lib/citation-scan.ts`'s `STORES` alternation omits `forum` as well, so a citation written
  `shared/forum/<stamp>-<checkout>-<slug>.md` is not reported store-prefixed, while the same shape under any
  other store is.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

Found by the coder while adding `discussions` to both lists, in the course of step A4 of
`260917-1124_*_implementation-fusion-discuss-a-two-agent-discussion-loop.md`. The addition preserves the false
relation exactly rather than changing it, which was the right call for that step: the plan gave the file a
one-token change and a comment it stated would stay true.

Whether `forum` belongs in either list is a real question and not a typo to correct on sight. A forum entry is
written by one checkout, read by another, and never rewritten, which is the property the citation corpus's
criterion turns on. But nothing in this work established that, and the fix is nobody's task in the plan.

The acceptance test: `STORES` in `staging-drift.ts` and the alternation in `citation-scan.ts` each either contain
`forum` or carry a comment that names its absence and the reason. The relation a comment states about another
list is true when read against that list, or it is not stated.

**Cross-references:** `260917-1124_*_implementation-fusion-discuss-a-two-agent-discussion-loop.md`, `260917-1124_*_does-a-machine-rewritten-record-kind-enter-the-citation-corpus.md`

---
Resolved: the commit that carries this line replaces both hand-kept lists with sets composed from `hooks/lib/stores.ts`: `STORES` in `hooks/lib/staging-drift.ts` is `RECORD_STORES` plus `LEGACY_STORES` and contains `forum`, its comment now stating that composition and the one deliberate inclusion (`checkouts`) rather than a relation to another file's list; the alternation in `hooks/lib/citation-scan.ts` is the same two arrays minus `checkouts`, with the comment naming that absence and its reason (a registry entry carries no stamp, so no record citation can name one). A forum entry uncommitted under the workbench classifies `record`, and a citation carrying `shared/forum/` is reported store-prefixed: three such tokens in two records of the message-between-checkouts container were repaired in the same commit (two pointers rewritten to the storeless form, one fenced exhibit given a `<forum>` placeholder for its store segment).
