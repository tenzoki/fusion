# The checker and the sweep key file exemptions on two different spellings of the same file

---
`citation-check.ts` builds a project-root-relative `rel`; `citation-sweep.ts` builds a
cwd-relative one. `RECORD_EXAMPLE_FILES` is keyed on `rel`, so the sweep's file-wide exemption
depends on the directory the sweep was launched from and the checker's does not.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

## The defect

`hooks/citation-check.ts:174` names every corpus file by a fixed project-relative spelling
(`fusion-workbench/<rel>`, `CLAUDE.md`, `rules/<f>`, `docs/<rel>`). `hooks/citation-sweep.ts:585`
computes `rel = relative(cwd, realpathSync(abs))`, so the same file is `rules/x.md` from the
project root and `../rules/x.md` from `hooks/`.

`scanCitationTokens()` opens with `const fileExempt = rel in RECORD_EXAMPLE_FILES`. That table
names `rules/decision-record-examples.md` and `skills/migrate/SKILL.md` — the two corpora whose
every record is fabricated by design. The checker matches them from anywhere. The sweep matches
them only when run from the project root.

This is the asymmetry the range set out to remove. `citation-sweep.ts` `## The declared corpus`
states the principle: "a reporter narrower than the rewriter is how this program came to change
files the checker then declared clean." Here the two share a corpus and disagree about a file's
identity inside it.

## Evidence, at `dcdca34c`

The sweep's own tests show both spellings for one file: `citation-sweep.test.ts:64` asserts
`shared/decisions/...` with cwd set to the workbench, and `citation-sweep.test.ts:147` asserts
`fusion-workbench/shared/decisions/...` with cwd set to the project root.

No effect on this tree today: neither exempt file is in the sweep's corpus, because `fusion.json`
declares `bin/*`, `hooks/*.ts` and `hooks/lib/*.ts` and nothing under `rules/` or `skills/`. A
project that declares either directory, or passes it as a `<path>` argument, gets a sweep that
rewrites the worked-example corpus whenever it is run from a subdirectory.

## The acceptance test

Both programs name a corpus file by one spelling, anchored on the project root, so a file-wide
exemption fires identically in the checker and the sweep from any working directory.
