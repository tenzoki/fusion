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
