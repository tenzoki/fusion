The rewritten tuning-table preamble tells the reader to declare keys in fusion-guard.json, which the first row cannot be

---
`README.md:105` now reads "Declare the ones you want in your project's `fusion-guard.json`". The very next line is the `guard.enabled` row, and `guard.enabled` is the one key the project layer may not set — a declared value is dropped and named in an advisory. The instruction is also inapplicable to the halt-clearing row, which is a shell command rather than a key.
---

## Both sides read

**Documentation side**, `README.md:105-107`:

> The guard isn't all-or-nothing. It runs on a spectrum from full enforcement to advisory to off, assembled from keys the three layers above already carry. **Declare the ones you want in your project's `fusion-guard.json`;** pick the row that matches how much friction you want:
>
> | Goal | Change |
> |---|---|
> | Off entirely | `guard.enabled: false` **in the plugin's `hooks/config.json`. It is the one key a project's `fusion-guard.json` may not set** … |

**Artifact side**, `hooks/lib/config.ts:707` — the project layer is not consulted for that leaf:

```ts
      enabled: plugin.raw.guard?.enabled ?? DEFAULTS.guard.enabled,
```

and `:601-606`, which turns a project declaration into a diagnostic rather than a setting:

```ts
      if (kind === "project" && key === "guard" && leafKey === "enabled") {
        …
          `Guard configuration at ${source}: "guard.enabled" cannot be set by a project — a project does not switch off the guard that governs it. The key was ignored.`,
```

So the preamble's instruction is false for the first row on the spectrum it just described, and the row corrects it one line later.

## Why the line came to say this, and what the correct scope of the edit was

The old preamble said the rows were "assembled from the fields already in `hooks/config.json`", which the two new rows falsified: `orchestrator.maxTurns` is deliberately absent from that file (`hooks/config.json`, read in full — no `orchestrator` key), and `guard.protectedPaths` is retired from it. Correcting the preamble was therefore forced by the additions, not scope creep, and the same holds for the `guard.enabled` row, which under a `fusion-guard.json`-pointing preamble would have told a project to declare a key the loader refuses. The correction simply overshot in the other direction.

`README-hooks.md:229`, the sibling table, avoids the problem by making no such instruction: "assembled from fields already in `config.json`. Pick the row that matches how much friction you want".

## Scope

`README.md` only (shipped doc). No code behaviour is affected. Everything else in the rewritten section was checked and holds: the three layers and their order against `hooks/lib/config.ts:683-721`; the empty `categoryPaths` / `categorySensitivity` / `decisions` against `hooks/config.json`; the seeding of `templates/fusion-guard.json` against `skills/setup/SKILL.md:195`; the `hooks/config.example.json` characterisation against that file, which carries filled-in `categoryPaths` and `decisions` and neither an `orchestrator` key nor `protectedPaths`; and both `README-hooks.md` anchors against its `### Per-project configuration: \`fusion-guard.json\`` heading at `:258`.

## Recommended fix direction

Say where the declaring happens without promising it for every row — most rows are keys you declare in your project's `fusion-guard.json`; the exceptions are named in the rows themselves. Or drop the instruction and let each row carry its own location, which is what `README-hooks.md` does and what the two new rows already do.

Filed by: coderev (review of Circle Turn 2, range `28f3029..5d51abd`, commit `5d51abd`).

---
Reconciled: 260813-2258 — Still open, re-verified at HEAD `c0e4219`: `README.md:104` (moved from `:105`) still reads "Declare the ones you want in your project's `fusion-guard.json`", and the `guard.enabled` row that follows still states the project layer may not set it.
