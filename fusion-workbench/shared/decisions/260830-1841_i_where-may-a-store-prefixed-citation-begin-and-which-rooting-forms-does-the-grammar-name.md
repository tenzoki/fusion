# Where may a store-prefixed citation begin, and which rooting forms does the grammar name?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260830-1841_*_citation-mechanism-four-defect-repair.md` (the plan this was surfaced by, defect 1), `260829-1225_*_which-path-shaped-tokens-does-the-storeless-form-reach-beyond-a-record-citation.md` (the storeless form this anchors), `260828-0904_*_does-fusion-ship-a-citation-checker-to-consuming-projects.md`

---

## Question

`REC_RE`, `CIRCLE_RE` and `CIRCLE_REC_RE` in `hooks/lib/citation-scan.ts` carry **no left boundary**. Every other pattern in that file has one: `BARE_RE` and `STAMP_RE` both open `(?<![\/0-9A-Za-z_-])`, and these three do not. So a store name is recognised wherever it appears: inside a longer word, and after any foreign path segment.

Verified against `cda72f71` by running the compiled scanner over single lines:

```
"pytorch/issues/260101-1200_o_x.md"    -> record store-prefixed col=8  'issues/260101-1200_o_x.md'
"myplanning/260101-1200_o_x.md"        -> record store-prefixed col=2  'planning/260101-1200_o_x.md'
"docs/subhistory/260101-1200-note.md"  -> record store-prefixed col=8  'history/260101-1200-note.md'
"mycircles/260101-1200-widget-bar"     -> circle-dir store-prefixed col=2 'circles/260101-1200-widget-bar'
"vendor/circles/260101-1200-widget-bar/_t_circle.md"
                                       -> circle-record store-prefixed col=7
```

`rewriteOf()` in `hooks/citation-sweep.ts` slices the token at its last `/` and the sweep splices at the token's own column, so everything left of the store segment survives and is glued to the stamp: `pytorch/260101-1200_*_x.md` (a wrong path), `my260101-1200_*_x.md` and `docs/sub260101-1200-note.md` (corrupt tokens). The result is invisible afterwards, because `BARE_RE`'s lookbehind refuses a stamp preceded by a letter or a slash.

The question the grammar is asking today is **"is this arbitrary path a workbench path"**, and it cannot answer it: `pytorch/issues/` and `shared/issues/` are indistinguishable to a pattern with no left bound. So the answer is not a better heuristic, it is a different question (`rules/critical-stance.md` §4): **which closed set of workbench-rooting prefixes may stand between a token's left boundary and its store segment**, which is decidable because the set is read off the layout.

Two shapes make the enumeration a real choice rather than a formality, because each is a citation somebody writes and each is refused by a plain lookbehind:

- `<stamp>-<slug>/<store>/<basename>`, a record cited through its Circle's bare directory name, without the literal `circles/` prefix. Measured **150 occurrences** in the consuming project `unite-co-creator`; **1** in this repository (`260819-1400-reconciliation-circles.md` line 54).
- `archive/<sweep>/(shared|circles/<dir>)/<store>/<basename>`, a record cited at its post-archive location. Measured **2** in this repository, both exempt today (one fenced, one caught by the `glob` exemption).

## Options

1. **A left lookbehind alone**: prefix the three patterns with `(?<![A-Za-z0-9._\/-])` and leave the rooting alternatives as they stand.
   - Pros: one character class, one place; kills every foreign-path and word-prefix match.
   - Cons: refuses both shapes above. The 150-occurrence Circle-directory shape stops being a citation fusion detects at all, and a `stamp-name` token still resolves at column 0 of the same text, so the checker reports something for part of a token it no longer reads whole. Refuses `./fusion-workbench/…` too, which appears 161 times in this repository's markdown.

2. **The lookbehind plus a closed rooting enumeration**: one shared fragment used by all three patterns: an optional `(?:\.{1,2}\/)*`, an optional `fusion-workbench/`, an optional `archive/<sweep>/`, and one of `circles/<dir>/`, `shared/`, `<dir>/` or nothing, with the lookbehind in front of the whole thing, so the token spans its own rooting.
   - Pros: the token's left edge is the rooting's left edge, which is what makes the splice correct: the corruption is repaired by anchoring rather than by making `rewriteOf` smarter. Both measured shapes stay detected. `<dir>` is `[0-9]{6}-[0-9]{4}-[a-z0-9-]+`, which no foreign segment satisfies, so the widening opens no hole. `SWEEP_DIR_RE` already exists in the file for the archive shape and `circleDirs()` already resolves into `archive/<sweep>/circles`, so the enumeration reuses what the file already commits to.
   - Cons: four capture groups where `REC_RE` had three, so the destructuring at the call site shifts and the `segment` string the violation reports must learn the bare-directory case. One more alternative to keep in step with the layout if the layout ever gains a store root.

3. **Require the store segment to be preceded by a form the grammar already names** (`fusion-workbench/`, `shared/`, `circles/<dir>/`, or start-of-token) and nothing else.
   - Pros: smallest enumeration.
   - Cons: refuses both measured shapes, and refuses `./fusion-workbench/…`. It answers the Circle-directory question by dropping 150 real citations in one consuming project without saying so.

## Constraints

- The rewritten token must be one the grammar can still see. A rewrite that produces an unreadable token is defect 2 of the same plan and is refused there by construction.
- One tokeniser, three callers: the gates, `bin/fusion-citation-check` and `bin/fusion-citation-sweep` must keep reading the same grammar. No second detector.
- `bin/fusion-citation-sweep --dry-run` over this repository's committed workbench must still print `rewrites=0`; `citation-sweep.test.ts` pins it as a release gate.
- `hooks/lib/__tests__/workbench-citation-lint.test.ts` must stay green. Measured prediction for option 2: `dangling` holds at 246 and `store-prefixed` at 0, because both newly-rooted tokens in this repository are already exempt; `resolved` drops by 1 as the Circle-directory shape merges into one longer token.

## Recommendation

Option 2. Option 1 and option 3 answer the boundary question by narrowing what a citation is, and they do it silently: the 150 occurrences do not become errors, they become invisible. Option 2 states the set of rooting forms in one place and makes the token span it, which is the property the sweep actually depends on: a token that does not include its own rooting cannot be spliced without leaving the rooting behind.

---
Answered: 260830-1841_*_citation-mechanism-four-defect-repair.md — user approved the plan at the Phase 0b plan-review gate on 2026-08-30, choosing option 2: the three store-prefixed patterns gain a shared left anchor plus a closed rooting enumeration read off the layout, and the bare Circle-directory form is named in that enumeration so a token spans its own rooting.

---
Implemented: hooks/lib/citation-scan.ts:201 — LEFT_ANCHOR and ROOTING are shared source fragments carried by REC_RE, CIRCLE_RE and CIRCLE_REC_RE alike, and REC_RE's container group gained the bare Circle-directory alternative so a token spans its own rooting. The probe yields no token for the five foreign-path shapes and one whole-span token for each rooted one; resolved fell by exactly 1 where two overlapping hits merged into one, and no violation figure moved.
