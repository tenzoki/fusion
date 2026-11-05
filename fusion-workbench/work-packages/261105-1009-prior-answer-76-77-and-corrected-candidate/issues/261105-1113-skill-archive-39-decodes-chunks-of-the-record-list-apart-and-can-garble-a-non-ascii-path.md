skill-archive 39 decodes chunks of the record list apart and can garble a non-ASCII path
---
The `node -e` that replaced `grep -o` in `skill-archive/parts/39-prior.md` appends raw stdin chunks to a string, so a multi-byte character across a chunk boundary becomes U+FFFD in a candidate path. Severity: Low; no live path in this workbench is non-ASCII.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer
**Cross-references:** 261105-1023-plan-fusion-13-4-2-corrected-candidate.md

**Evidence.**

- `catalog/profiles/skill-archive/parts/39-prior.md`: `process.stdin.on("data",d=>s+=d)`, with no `setEncoding`, over the whole `{"op":"list"}` answer.
- That answer is 240 963 bytes here, so it arrives in several chunks. It holds no non-ASCII byte today.
- Reproduced on a piped synthetic list with `ü` in each path: one record came back as `shared/issues/��1480x.record.json`. `grep -o` over bytes did not have this.
- The other replacements read short answers: `skill-archive/05`, `skill-check/15`, `skill-discuss/05`, `skill-wp/05`. Same pattern, and the first `inspect` field they use is ASCII.
- This part also has no `try` around `JSON.parse(s).result.records`, unlike its siblings. A refusal then prints a TypeError on stderr with no candidates, which still ends with no candidate as the old form did, so that alone is no defect.

**Fix direction.** `process.stdin.setEncoding("utf8")` before the handlers.

**Acceptance.** The synthetic list through the new form holds no U+FFFD, and `FUSION-CATALOG` exits 0.
