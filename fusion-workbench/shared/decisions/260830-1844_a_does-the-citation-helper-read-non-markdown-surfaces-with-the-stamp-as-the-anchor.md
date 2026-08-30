# Does the citation helper read non-Markdown surfaces, with the stamp as the anchor?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260830-1841_*_citation-mechanism-four-defect-repair.md` (the plan this was surfaced by, the deliverable), `260828-0904_*_does-fusion-ship-a-citation-checker-to-consuming-projects.md` (the corpus this would widen), `260823-1414_*_does-the-workbench-citation-gates-corpus-cover-review-files.md` (the other open corpus question, related but not the same)

---

## Question

Raised by the consuming project `unite-co-creator`, which is blocked on it with no date of its own.

`markdownFilesUnder()` in `hooks/lib/citation-scan.ts` filters on `.name.endsWith(".md")`, and `hooks/citation-check.ts` adds only `CLAUDE.md`, `rules/*.md`, `.claude/rules/*.md` and `docs/**/*.md`. So a record citation written into a `.py`, `.ts`, `.yaml` or any other non-Markdown surface is outside the corpus: it is never reported when it dangles, never rewritten by the sweep, and never counted. That project measured roughly **950** such citations on code surfaces.

The consumer's proposal is that the stamp itself, `[0-9]{6}-[0-9]{4}`, is a strong enough anchor to scan any text file, Markdown or not.

## Options

1. **Leave the corpus at Markdown.** Non-Markdown surfaces stay out.
   - Pros: no change; the fence and blockquote exemptions, which are the whole of the pointer-versus-statement distinction, are Markdown constructs and stay meaningful.
   - Cons: roughly 950 citations in one measured project are unreadable to every fusion citation mechanism, and the project cannot tell a live pointer from a dead one on those surfaces.

2. **Widen the corpus to every text file, keeping the same grammar.**
   - Pros: one corpus rule; the stamp anchor is already the strictest part of the grammar.
   - Cons: the exemptions do not transfer. A citation inside a Python docstring or a string literal has no fence around it, so the only two "this is an exhibit, not a pointer" signals fusion has are unavailable, and every fixture string in a test file becomes a judged token. `citation-sweep.ts` already carries an ad-hoc version of this problem (`isTestFixture`, skipping `.ts` under `lib/__tests__`), which is evidence that a general rule is needed rather than that one exists.

3. **Widen the corpus and give non-Markdown surfaces their own exemption vocabulary**: comment blocks, string literals, or an explicit per-language rule.
   - Pros: the distinction the fence carries in Markdown gets a per-language equivalent.
   - Cons: a per-language lexer inside a grammar whose header calls itself one tokeniser with no path arithmetic. The cost scales with the number of languages a consuming project uses, and it never finishes.

4. **Widen the corpus in the reporting checker only, and never in the sweep.** Non-Markdown surfaces are reported and never rewritten.
   - Pros: the consumer gets the measurement it is blocked on, at zero risk to files no exemption protects. Rewriting is the half that can damage; reporting is the half that cannot.
   - Cons: a corpus that differs between the reporter and the rewriter, which is exactly the split this plan's defect 3 removes for the frozen stores. Reintroducing it needs a stated reason, and "one half can damage and the other cannot" is that reason or it is not.

## Constraints

- Whatever is chosen applies to `bin/fusion-citation-check` and `bin/fusion-citation-sweep` through the one grammar. No second detector.
- `hooks/lib/__tests__/workbench-citation-lint.test.ts` is a blocking gate over this repository's own tree; widening its corpus makes somebody's suite red over text nobody compiled.
- The consuming project has worked around the gap locally. It is owed the answer, not a rush.

## Recommendation

None yet. The question turns on whether the exemption vocabulary can be carried to a non-Markdown surface at all, and that is answerable by measurement rather than argument: sample the roughly 950 citations the consumer counted and ask, per token, whether a Markdown-shaped exemption would have been needed. Option 4 is the cheapest thing that unblocks the consumer if the answer is "not cleanly", and it needs the split it reintroduces to be stated, not glossed.

## Option 5, added after the four above were measured against a real tree

**The project declares which non-Markdown paths carry citations, and fusion reads exactly those.**
A `citations.extraPaths` list of globs in the project's `fusion.json`; the checker and the sweep
add those files to the corpus and nothing else changes.

- Pros: it replaces an undecidable question with a decidable one. Options 2 and 3 both founder on
  "is this token a pointer or an exhibit", which no reader of the token can settle outside Markdown,
  where the fence answers it. "Did the project declare this file as citation-bearing?" is answered by
  somebody having written it down. Test fixtures are not on the list, so the noise those two options
  produce never arises. It is the same move that repaired defect 1 on the same day: stop guessing
  where a citation may begin, name a closed set of places instead.
- Cons: it puts a list in a project's hands, and a list nobody maintains covers nothing. The
  declaration is per project rather than a property of fusion, so two projects can disagree about
  what a citation-bearing file is. It also does not help a project that has not yet noticed it has
  citations on code surfaces, which is the state this record was filed from.

## The measurement the options above were missing

Taken 2026-08-30 with fusion's own grammar at `5907b4ae`, over the reporting project's 21 875 code
files, its own workbench excluded. Read-only.

| kind | count | what it means for this question |
|---|---|---|
| `stamp-bare` | 4751 | undecidable by design, in every file type. Widening the corpus reports nothing new for them. |
| `store-prefixed` | 707 | the old spelling, never converted, because the sweep does not open these files |
| `resolved` | 514 | fine today, invisible to every check |
| `dangling` | 115 | dead pointers nobody can currently see |
| `stale-marker` | 34 | a literal marker whose record has moved on |
| `exempt` | 16 | |

**The population this record was filed about is the wrong one.** The roughly 950 citations the
reporting project measured are mostly the 4751 bare stamps, and no option here helps them: a stamp
alone names a minute, not a file. What a widening actually buys is the 856 broken judgeable
citations underneath, of which 741 are mechanically repairable.

## What was done with that, before this record was answered

The 707 were repaired without any fusion change, by naming the files as extra path arguments to
`bin/fusion-citation-sweep`, which takes a named file whatever its extension. 158 rewrites across
89 files landed in the reporting project as `4f8aab36`. So the repair route already exists; what is
missing is that nothing walks it routinely, and `/fusion:cleanup` calls the checker with no extra
paths at all.

Two findings from that run belong here because they bound any answer:

- The sweep's visibility guard declined roughly 550 of the 707. Where a store-prefixed token's
  storeless form would be a bare stamp — a store segment followed by a stamp and nothing else, no
  marker and no slug — the guard leaves the token wrong rather than making it undecidable. One such
  line survived the repair run untouched in `codebase/go/dist-mac/unite/co-creator/ontology/uif-framework.yaml`,
  beside rewritten lines in the same file. Any widening inherits that behaviour, and should.
- Ten of the 89 files were gitignored build output. Guard (a) checks that the work tree is clean and
  the workbench tracked; it does not check that each extra path is tracked, so those were written
  with no revert available. Filed separately.

---
Answered: 260830-1844_*_does-the-citation-helper-read-non-markdown-surfaces-with-the-stamp-as-the-anchor.md — user chose **option 5** on 2026-08-31, in the session that repaired the reporting project's code surfaces: the project declares its citation-bearing paths in `fusion.json` and both the checker and the sweep read them. The answer was given after the measurement above replaced the record's original premise, and after the repair route was demonstrated on a real tree.
