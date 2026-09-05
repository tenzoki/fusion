# A citation of another project's workbench record gets a form that expresses it

**Date:** 2026-09-05 23:05
**Agent:** coder
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Status:** Complete
**Read at:** HEAD `4db7dddb`, three sibling coders editing `skills/setup/SKILL.md`,
`hooks/citation-sweep.ts` and `rules/fusion-workbench-conventions.md` concurrently
**Cross-references:** `260830-2254_*_a-record-citing-another-projects-workbench-record-is-reported-dangling-forever-and-no-citation-form-expresses-it.md` ·
`260905-2158-the-nine-open-defects-after-loop-1-and-what-loop-2-should-do.md` (entry 6) ·
`260905-2213_*_two-concurrent-sessions-share-one-tmp-commit-message-path-so-one-can-commit-the-others-message.md` (the live instance) ·
`260901-0320_*_the-sentence-stop-lookbehind-does-not-cover-the-bracket-characters-the-record-tail-admits.md` (the comment residue)

## What landed

Two changes, both in `hooks/lib/citation-scan.ts` and its own test file.

**The comment residue.** The 2026-09-05 repair replaced the `SENTENCE_STOP` constant
with the `recordTail(chars)` derivation and left two present-tense references to the
deleted name behind, at `:336` and `:384`. Both now name the derivation. `grep -c
SENTENCE_STOP hooks/lib/citation-scan.ts` reads 0.

**The foreign-record form.** A record held in a consuming project's workbench is now
spelled `foreign:<project>:<citation>` — for the live instance,
`foreign:menue-rs:260905-2054-reconciliation.md`. The qualifier sits in front of the
token, is read off the line's own text by `carriesForeignQualifier()` before any
lookup, and puts the token in the `exempt` bucket with the reason `foreign-record`.

## The three properties the dispatch named

**Writer-supplied, never inferred.** The predicate is a literal two-segment marker in
`before`. Nothing about the token's own name, and nothing about how the lookup went,
can produce it.

**Read before the lookup.** It sits in the same `reason` chain as
`announced-illustration` and `footer-template`, which is evaluated in full before
`check()` runs, so a foreign citation never reaches the resolver. That is what answers
the record's own §4 objection: a failed lookup is exactly the evidence a genuinely dead
citation produces, so resolution failure could not be the criterion.

**It cannot silence an ordinary dangling citation by accident, and the honest limit is
pinned.** Nothing in the text separates a foreign record from a local one a writer
mislabelled — the exemption shares that with the fence, the blockquote, the `e.g.` and
the `foo` placeholder. What bounds it is stated in the docstring and pinned by a case:
the token is never counted as resolved, `grep -rn 'foreign:'` enumerates every use in
one command, and the marker is two literal segments no ordinary spelling reaches.

## Two decisions worth the record

**Both segments are required, and the second one was measured rather than judged.** A
bare `<project>:` in front of a stamp would have been enough syntax, and it is too
wide by **214 tokens** in this corpus — the legacy `I:`, `D:` and `CR:` task-id
spelling in archived planning files, every one of them naming a LOCAL record that would
have stopped being judged. `foreign:<project>:` matches nothing in the tree, measured
over every `.md` in it on 2026-09-05. The project segment stays mandatory because a
pointer that does not say whose record it is leaves the reader exactly where the
workaround did.

**It is read AHEAD of `fenced-code` and is absent from
`RESOLUTION_PREMISED_EXEMPTIONS`, so it reaches `store-prefixed` too.** Its premise is
the referent, not resolution: the storeless form is this project's spelling rule and an
archive sweep here moves nothing in another project's tree, so telling a writer to drop
a store segment out of a foreign path is telling them to break the pointer. That is
what the live instance observed — its first version spelled the path out, the gate
reported it `store-prefixed`, and the sweep stood ready to rewrite a path that names
nothing here and never will. The sweep needed no edit: it declines every hit carrying a
`reason`.

## What is NOT done

**The form is not written where a writer will read it.** `rules/fusion-workbench-conventions.md`
teaches the citation vocabulary and a sibling holds that file this Turn, so the note
saying `foreign:<project>:<basename>` exists belongs to a later dispatch. Until then the
form works and nobody is told about it.

## Verification

`cd hooks && npx vitest run lib/__tests__/citation-grammar-boundaries.test.ts
lib/__tests__/workbench-citation-lint.test.ts lib/__tests__/citation-sweep.test.ts
lib/__tests__/reference-resolution-lint.test.ts` — exit 0, 91 tests, 4 files.
`npx tsc --noEmit` — exit 0. `hooks/dist/` deliberately not rebuilt; the orchestrator
builds once.

The fourth file is not in the dispatch's mandated set and was run because the change
enters its corpus: `reference-resolution-lint` scans `hooks/lib/*.ts` comment lines, and
the docstring's own `foreign:menue-rs:…` example is a token it reads. That example is
now a canary — remove the exemption and the file's own documentation reddens the gate.

Hook-test surface: **+45 lines** of the 2 243 that were free.
