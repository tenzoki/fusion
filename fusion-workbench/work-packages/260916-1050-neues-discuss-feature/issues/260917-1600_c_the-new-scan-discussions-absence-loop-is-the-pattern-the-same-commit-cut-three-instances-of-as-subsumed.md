The new `SCAN_DISCUSSIONS` absence loop is the pattern the same commit cut three instances of as subsumed

---
`f7cd6d04` removed three "emits no `<key>` to anyone" loops from `fusion-paths.test.ts` on the ground that the parameterised set-equality case already catches them, and added a fourth loop of the same shape in the same file, on a surface with 22 lines of margin.

---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**The added lines**, `hooks/lib/__tests__/fusion-paths.test.ts:228-232`:

```
for (const name of [...AGENTS, ...SKILLS]) {
  expect(parse(run(project, name).stdout).SCAN_DISCUSSIONS, name).toBeUndefined();
}
```

with a five-line comment above it, eight lines in total inside the new case.

**Why it catches nothing the file does not already catch.** `SCAN_DISCUSSIONS` has no `value_for()` arm and no entry in `ORDER` (`bin/fusion-paths:415-418`). It therefore falls in exactly the class the cut's own analysis labels **B2** — "prefixed, absent from `ORDER`" — whose members it lists as `OUT_CIRCLE`, `SCAN_CIRCLES`, `OUT_INVESTIGATION`, `SCAN_INVESTIGATIONS`, `SCAN_CONSULT`, `SCAN_MEMOS` (`260917-1508-the-cut-search-on-both-bounded-surfaces.md`, the flowchart and the paragraph "The six prefixed keys exit 4"). A prompt naming the key exits 4 with no output, and the parameterised case at `:460-474` fails on its own `expect(r.status, …).toBe(0)` before it compares any set. Adding an arm and an `ORDER` entry with no prompt naming it emits nothing, because emission iterates `ORDER` filtered by `has_key()` over the prompt-derived set (`bin/fusion-paths:460-469`) — so that path is caught by nothing, exactly as the analysis found for the investigation pin whose stated rationale it called false.

**What the same commit did to the same pattern.** `README-hooks.md`, the cut entry, records four pins removed "subsumed twice over" and one kept by hand because both its keys resolve. `SCAN_DISCUSSIONS` resolves for nobody, so it belongs with the four, not with the one.

**The surface this is charged against.** `hooks/lib/__tests__/**.ts` stands at 22 046 lines against a budget of 22 068 — 22 lines of margin, the first above zero in four raises (`README-hooks.md`, "What is left of it: 22 lines"). The eight lines are a third of the margin the cut bought.

**Not a request to reverse the ruling.** The absence of a `SCAN_DISCUSSIONS` key is spec `## Out of Scope` and stays. What is asserted twice is the assertion, not the ruling; the comment's reasoning about what a later reader would be reversing is worth keeping wherever it lands.

**Acceptance test.** Mutating `bin/fusion-paths` to emit `SCAN_DISCUSSIONS` — by any route a real edit could take — fails at least one case in `fusion-paths.test.ts` with the loop removed. If it does, the loop comes out and the file drops eight lines. If it does not, the loop stays and its comment says which mutation it is the only catch for.

**Cross-references:** `260917-1508-the-cut-search-on-both-bounded-surfaces.md`, `260917-1119_*_spec-fusion-discuss-a-two-agent-discussion-loop.md` `### C8`

---
**Resolved:** 260917-1615, coder — the loop is removed; `SCAN_DISCUSSIONS` is class **B2**, as filed.

**The measurement, not the reading.** A scratch plugin root (copies of `bin/`, `agents/`, `skills/`, a `.fusion-setup` workbench) drove the real resolver under each route a real edit could take:

| route | edit | result |
|---|---|---|
| 1 | a prompt names `$SCAN_DISCUSSIONS`, resolver untouched | **exit 4**, no stdout (`bin/fusion-paths:442-450`) |
| 2 | `value_for()` arm + `ORDER` entry added, no prompt names it | exit 0, key emitted to **no** consumer (agents and skills swept) |
| 3 | both | exit 0, `SCAN_DISCUSSIONS=shared/discussions` emitted |

Route 1 is the single-edit route and the parameterised case at `:460-474` fails on its own `expect(r.status).toBe(0)` — as do three further cases. That is the B2 criterion the cut applied, so the loop comes out. Route 2 emits nothing, so there is nothing for any case to catch.

**Where the verdict is narrower than the acceptance test as written.** Route 3 — arm *and* `ORDER` *and* a prompt, three coordinated edits — is emitted, the emitted set equals the prompt-named set, and the set-equality case passes. Only the loop failed on it. But that residual is **key-independent**: emission is `for key in ORDER: if has_key(key)` and the set-equality case compares the emitted set against the prompt's text, so route 3 escapes it identically for `OUT_CIRCLE`, `SCAN_INVESTIGATIONS`, `SCAN_CONSULT` and `SCAN_MEMOS`. The four pins `f7cd6d04` cut carried exactly this residual, and keeping this one on that ground would reopen all four. Route 3 is also not an accident: it is the deliberate reversal the comment now names, and the spec is where it is refused.

**The ruling survives the lines.** The `## Out of Scope` reasoning moved into the surviving case's comment (`fusion-paths.test.ts:218-224`): the kind has a write key and no read key by ruling rather than oversight, adding `$SCAN_DISCUSSIONS` reverses that ruling, the spec is what to change first, and the absence needs no pin because the key has no arm and no `ORDER` entry. The case title lost "and hands nobody a way back", which named an assertion that is no longer there. The spec citation is kept unbroken on one line.

**The surface.** `hooks/lib/__tests__/**.ts` 22 046 -> 22 042 lines against an unchanged budget of 22 068 (floor 19 228 + head room 2 840): **margin 22 -> 26**. Net -4 rather than the -8 estimated here, because the ruling's record costs seven comment lines. No baseline, constant or fixture was touched by this fix; the golden's regeneration in the work tree is another checkout's.

**Verification:** `cd hooks && npm test` — exit 0, 942 tests, 56 files.
