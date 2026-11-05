Request 78 calls the whole predicate the codec's rule, though the character clauses are Prior's
---
`### D-F1 and the last status` says of the full predicate "it is the codec's rule". The names, dot and archive clauses are. The `\`, `:`, NUL, tab, CR and LF clauses are not in the codec. Severity: Low; request text only.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Executor:** data-implementer, by an appended correction in `codec/fixtures/prior/REQUESTS.md`
**Cross-references:** 261105-1023-plan-fusion-13-4-2-corrected-candidate.md

**Bundle bytes:** no. `controlrecord.go`'s comment says the same less sharply: it names the codec for "the three names" and "the dot entries and the root's archive/", then Prior for the rule. It needs no change for this.

**Evidence.**

- Request 78: "A path … without `\`, `:`, NUL, tab, CR or LF, with no segment starting with a dot and a first segment that is not `archive`, and whose last segment is … That is `entryControlRecord` (`EW:284`), and it is the codec's rule (`codec/src/store.ts:446` `isControlFile`, `:454` `controlFiles`)."
- `codec/src/store.ts:446` tests the name alone. `controlFiles` from `:454` skips dot entries and archived paths. Neither tests a character, and a search of `codec/src/*.ts` for a colon test found none. By reading, `a:b.record.json` is a control file to the codec. I did not run this through the codec.
- The character clauses are Prior's: `EntryRelativePath` (`moduleapi/v1/entry_service_wire.go`, `\x00\t\r\n`) and `assetPath` (`internal/fusionhost/external_catalog.go:138`, `\\:\x00`). Prior's own comment above `entryControlRecord` scopes it: "names are the codec's".
- `Select` and `entryControlRecord` remain equal, as 3 000 000 paths in the earlier review showed. The error is the attribution, not the rule.

**Fix direction.** Append one sentence: the names, dot and archive clauses are the codec's, and the character clauses are Prior's, which the module copies.

**Acceptance.** The appended sentence states the split. `git diff --numstat` on the file shows additions only.
