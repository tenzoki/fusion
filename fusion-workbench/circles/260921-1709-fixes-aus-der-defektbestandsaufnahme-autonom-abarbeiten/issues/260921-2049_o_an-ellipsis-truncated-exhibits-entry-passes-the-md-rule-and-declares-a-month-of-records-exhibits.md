An ellipsis-truncated `citations.exhibits` entry passes the `.md` rule and declares a month of records exhibits
---
The loader's rule for `citations.exhibits` checks only that an entry ends in `.md`, but the matcher the scanner resolves the entry through reads `…` and `...` as `.*`. So `"2601….md"` is accepted and silences every record stamped `2601…`, and `"….md"` silences the whole corpus, which is exactly the prefix declaration the rule says it refuses.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Site.** `hooks/lib/config.ts` `explainArrayOfRecordBasenames`: the only test past the array rule is `entry.endsWith(".md")`. `hooks/lib/citation-scan.ts` `basenameMatcher()` (the function at line 805 as of `64b607a9`): `cited.split(/…|\.\.\./)` and `segs.join(".*")`, so an ellipsis inside the entry is a wildcard, and `createScanner()` maps every exhibit entry through that same function (`exhibitRes`).

**Probe (run at `64b607a9` against `hooks/dist/citation-check.js`).** A scratch project with two open records in its shared issues store, stamped 260101-0101 and 260102-0102 (slugs `exhibit` and `pointer`), each holding one fenced store-prefixed token, and `fusion.json` reading `{"citations":{"exhibits":["2601….md"]}}`: the checker prints `declared-exhibits=1`, `store-prefixed=0`, `verdict=clean`. The same project with `["2601"]` is refused as documented (`… the element at index 0 does not end in .md`, `store-prefixed=2`, `verdict=violations`).

**What states the guarantee that does not hold.** Four sites, in the same commit `a891c50e`: the `citations.exhibits` paragraph in `hooks/lib/config.ts` ("a silencing declaration that read `2609` would declare every record of a month an exhibit, so the whole array is dropped and named when one entry is a prefix"); the declared-exhibit paragraph in `hooks/lib/citation-scan.ts`'s header ("the leaf's own rule in `lib/config.ts` refuses an entry that is not a `.md` basename, since a prefix there would declare a month of records at once"); `README-hooks.md` `#### citations.exhibits` ("a citation may be a prefix, a silencing declaration may not"); the `_citations` note in `fusion.json` and `templates/fusion.json` ("each ending in .md").

**Why it matters.** The residual the feature accepts is that a project can silence one genuine violation by naming one record. This lets one entry silence a month, or everything, while `declared-exhibits=` still reads `1`, so the figure printed to make the leaf visible understates what it silenced.

**Fix direction.** Refuse an entry containing `…` or `...` in the same rule, with the index named, as the `.md` miss is; or require the full record shape (`^\d{6}-\d{4}[_-]` … `\.md$`, no ellipsis) so an entry names exactly one basename pattern. One case in `hooks/lib/__tests__/config.test.ts` or `declared-citation-paths.test.ts`: the ellipsis entry drops the array with an advisory. Then the four sites above are true as written.

**Acceptance.** The probe above with `["2601….md"]` prints the advisory, `declared-exhibits=0` and `store-prefixed=2`; `cd hooks && npm test` exits 0.
