# Which decidable property, if any, exempts a realistic probe fixture from the citation gate?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260830-2235_*_the-fabricated-name-exemption-keys-on-the-literal-foo-so-every-realistic-probe-fixture-is-read-as-a-real-citation.md (the defect this answers), 260921-1653-open-defect-survey-at-11-9-1.md (row 3), 260820-0530_*_twenty-six-citations-in-the-corpus-are-statements-rather-than-pointers-and-no-exemption-expresses-that.md (the fence and file-and-line rule already in force), 260921-1709-fixes-aus-der-defektbestandsaufnahme-autonom-abarbeiten.md (the work item whose plan takes the recommendation as its working answer)

---

## Question

`hooks/lib/citation-scan.ts` exempts a token as `fabricated-name` only when it carries the placeholder word `foo`. A fixture written to look like a real record carries a real-looking stamp and slug, so it is judged like a citation and reported `dangling` (six instances by four writers on 2026-08-30, per the defect record). The defect record forbids a wider substring list on `rules/critical-stance.md` §2 and §4 grounds and leaves open whether the answer is a fifth exemption, a convention the prompts carry, or nothing at all. It must be answered now because the record cannot close on any other route, and the work item asks that every still-present record close.

## Options

1. **State the bound and close.** No new exemption. The scanner's header states that `foo` is the one placeholder it reads because it is the one decidable placeholder, that a realistic fixture in running prose is fenced or restated as a sentence naming file and line (`rules/fusion-workbench-conventions.md` `## Marker globs` already binds every agent to that), and that a fixture written to look real will be reported until it is fenced.
   - Pros: no code, no always-on bytes (the conventions already carry the rule, and every always-on byte is charged to all eleven dispatch paths at zero head-room), no new residual. The write-time check (`hooks/lib/citation-form.ts`) deliberately does not report `dangling`, so no mechanism exists at write time that this option withholds.
   - Cons: the defect's acceptance, "without the writer having to know that fencing is what makes it safe", is not met; the writer has to know the rule. The six instances happened to writers who had the rule.
2. **An `exhibit:` qualifier, on the model of `foreign:`.** A token opening `exhibit:` is read before any lookup and reported neither dangling nor store-prefixed; the qualifier is a claim the writer makes, as `foreign:` is.
   - Pros: decidable from the token's shape alone; reuses the one qualifier mechanism the grammar already has; lets a fixture sit inline in a sentence a fence would break.
   - Cons: the writer has to know the qualifier as they had to know the fence, so the defect's acceptance is still unmet; a grammar change, a test, and a paragraph in the always-on conventions at zero head-room; a second writer-asserted exemption nothing mechanical checks.
3. **Exempt a token that resolves to nothing and sits in a table cell or a line opening with a fixture word (`fixture`, `probe`, `example`).** Reads intent from context.
   - Pros: catches the measured instances (a fixture table, a reproduction block).
   - Cons: the undecidable shape §4 forbids: context words are a substring list one level up, and the next fixture is described with a word the list lacks.

## Constraints

- No exemption may read intent from a token: the property keyed on is decidable from the token's own text or its position (the defect record's own bound).
- Fenced blocks and blockquotes stay exempt; `**Date:**`-style bare stamps stay exempt.
- No always-on byte is added without a cut of the same size (`CLAUDE.md` `## Conventions`, growth bounds).

## Recommendation

Option 1. The rule the writer needs already stands in the always-on corpus, and the two mechanisms that work, the fence and the file-and-line restatement, are unchanged; what the defect asks for beyond that is a gate that reads intent, which §4 rules out. The residual is stated rather than hidden: a writer who quotes a fixture unfenced meets a `dangling` row at the next scan, repairs it once, and the row is the instruction the record says is invisible at write time. If the user wants a mechanism instead, option 2 is the one that costs the least and it is written up here so the choice is on the table with its price.
