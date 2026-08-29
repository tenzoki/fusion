The registry-completeness parse misses an aliased and a namespace import, so a correctly named builder still escapes

---

`hooks/lib/__tests__/sentence-identifier-containment.test.ts:256-258` derives the set of sentence
builders from `hooks/tracker.ts`'s import blocks:

```ts
for (const block of readFileSync(trackerPath, "utf-8").matchAll(/import\s*(?:type\s*)?\{([^}]*)\}\s*from/g)) {
  for (const raw of block[1].split(",")) {
    const sym = raw.trim().split(/\s+as\s+/).pop()?.trim() ?? "";
    if (/^[A-Za-z_$][\w$]*Sentence$/.test(sym)) imported.add(sym);
```

Two legal import forms defeat it silently. Measured against a scratch worktree at `33645a2`, with a
third builder `budgetSentence` added to `hooks/lib/review-coverage.ts` and deliberately left out of
`REGISTRY`:

| Import form written into `hooks/tracker.ts` | Suite result |
|---|---|
| `import { budgetSentence, coverageSentence, … }` | **red** — 1 failed, 11 passed. The gate works. |
| `import { budgetSentence as budgetLine, … }` | **green** — 12 passed |
| `import * as rc from "./lib/review-coverage.js";` | **green** — 12 passed |

`.split(/\s+as\s+/).pop()` keeps the LOCAL name and discards the imported one, so an alias that does
not itself end in `Sentence` erases the symbol from the set. A namespace import contains no braces at
all and the regex never sees it.

---

## Why it matters, and why it is Low rather than higher

The header at `:26-28` lists this residual as closed: "builders the registry does not name, hence the
completeness assertion at the foot". The analysis was more careful — `260818-0715-…`
finding 5 says the assertion "rests on a naming convention, so a builder named otherwise still
escapes". What is new here is that a builder named BY the convention also escapes, through a form
nobody would read as evasive.

It is Low because neither form is this codebase's style: `hooks/tracker.ts` uses plain named imports
throughout, and a developer adding a third builder would most likely copy the shape beside it, which
the gate catches. The failure mode is silence, though, which is the property that makes it worth a
record: nothing tells you the gate stopped covering a builder.

## Suggested fix

Two lines, no new mechanism.

1. Add the imported name alongside the alias, so the pre-`as` half is tested too:
   `const names = raw.trim().split(/\s+as\s+/).map(s => s.trim())` and add any of them matching the
   `*Sentence` pattern. An aliased builder then registers under the name the registry would key it by.
2. Assert that `hooks/tracker.ts` contains no `import * as` from a module exporting a `*Sentence`
   symbol — or, more cheaply and with no module scan, that it contains no `import * as` at all, which
   is true today and is a shape the file has no need for.

Neither changes the containment relation and neither adds an allowlist.

**Severity:** Low
**Domain:** code
**Filed by:** coderev, review `260818-0748-coderev-turn-1-range-1dc062d-33645a2.md` (range `1dc062d..33645a2`)
**Cross-references:** `260818-0715-preventing-fusion-internal-identifiers-from-reaching-a-consuming-project.md` finding 5, `260817-2131_*_nothing-stops-a-fusion-workbench-id-returning-to-an-emitted-hook-sentence-because-the-lint-reads-comment-lines-only.md`

---
Resolved: the parse now reads the IMPORTED half of an import specifier
(`raw.split(/\s+as\s+/)[0]`) instead of the local alias, so a builder registers under the name
`REGISTRY` keys it by no matter what it is bound to locally; and a namespace import of a relative
module is REFUSED with its own message rather than passed over, because a parse of this kind cannot
resolve `import * as` to a set of symbols at all. Both halves live in named functions
(`importedSentenceBuilders`, `completenessFault`) that take the source as a parameter, so the seven
new cases in `hooks/lib/__tests__/sentence-identifier-containment.test.ts` drive the real assertion
against a genuinely unregistered third builder instead of asserting the parse by inspection. No
allowlist was added.

Re-measured the filing's own table in a detached worktree at `33645a2`, with `budgetSentence`
injected into `hooks/tracker.ts`'s imports and left out of `REGISTRY` — the reviewer's method, the
same file, so the before column reproduces the record above:

| Import form in `hooks/tracker.ts` | at `33645a2` | with the fix |
|---|---|---|
| `import { budgetSentence }` | 1 failed / 11 passed | 1 failed / 18 passed |
| `import { budgetSentence as budgetLine }` | 12 passed | **1 failed / 18 passed** |
| `import { budgetSentence as spendSentence }` | 1 failed / 11 passed | 1 failed / 18 passed |
| multi-line block, `type BudgetReport` beside it | not measured | 1 failed / 18 passed |
| `import * as budget from "./lib/budget.js"` | 12 passed | **1 failed / 18 passed** |
| `import * as nodePath from "node:path"` | 12 passed | 19 passed (correctly ignored) |
| no third builder (control) | 12 passed | 19 passed |

The two forms this record measured green are now red, and the aliased case names `budgetSentence`
rather than `spendSentence`, which is what says the imported half is the half being read.

What the parse still cannot see is now stated in the header's own paragraph rather than implied
covered: a namespace import is refused, not resolved; `require`, a dynamic `import()` and a
re-export are invisible; a builder reaching the model without passing through `hooks/tracker.ts` is
outside the assertion; and membership still rests on the `*Sentence` naming convention. The
namespace refusal is scoped to relative specifiers, on the ground that no package or `node:` builtin
exports a fusion builder — stated in the regex's own comment so the bound is readable where it is
enforced.
