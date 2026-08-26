# One of the three harness properties the cut removed does not hold by consequence

---
`c649556` removed the harness-capability block on the claim that "both properties now hold by
consequence". The removed case asserted three, and it said so in its own comment: `files` **adds** a
path not in the seed, **replaces** one that is, and **merges** with the rest of the seed. Add and
merge do fail loudly by consequence, verified. Replace does not, and no surviving case in the suite
exercises it.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** Low. Nothing in the suite depends on the replace half today, so its loss costs no
coverage of the product. What it costs is the guard on one specific regression, and the commit
message records the property as held when it is not.

**Cross-references:**
`c649556`, cut 3 ("Harness capabilities the project-configuration cases depend on");
`hooks/lib/__tests__/guard-project-config-integration.test.ts:38-49` (the header note recording what
left);
`hooks/lib/__tests__/helpers/guard-harness.ts:232-252` (`SEED_FILES`) and `:353` (the merge).

## The two that do hold, measured

**Add.** Every surviving case that asserts an exact advisory list writes its configuration through
`configFiles()`, which is the `files` option. Drop the option and no configuration file is written,
the loader produces no diagnostics, and `guard-bash-integration.test.ts:297` — which asserts
`readEvents(root).map(e => e.event)` equals exactly `["guard_advisory"]` — sees `[]`. Loud.

**Merge.** If `files` substituted for `SEED_FILES` rather than merging over it,
`fusion-workbench/.fusion-setup` would be gone, `findWorkbenchRoot()` would return null, `emitEvent`
would no-op, and the same exact-list assertion would see `[]`. Loud, by a different route.

## The one that does not

`guard-harness.ts:353` is `seed(root, { ...SEED_FILES, ...(opts.files ?? {}) })`. Invert that spread
to `{ ...(opts.files ?? {}), ...SEED_FILES }` and add and merge both still hold: the seed survives,
and a key not in the seed is still written. Only replace breaks — a caller-supplied file whose path
IS in the seed is silently overwritten by the seed's own content.

Nothing catches it. `grep -n 'files: {' hooks/lib/__tests__/*.ts` returns two call sites outside the
removed block, both in `guard-state-shape.test.ts` (`:143`, `:235`) and both keyed on
`THROTTLE_FILE`, which is not in `SEED_FILES`. Every other use is `configFiles()`, keyed on
`fusion.json`, which is not in `SEED_FILES` either. The removed case was the only one that ever
passed a seeded path, and it did so precisely to hold this property.

## What the cut got right, stated so it is not re-litigated

The **second** property in that block, `expect(PROJECT_CONFIG).not.toBe(RETIRED_CONFIG)`, does hold
by consequence as the commit says. If `PROJECT_CONFIG_FILENAME` were changed back to
`fusion-guard.json`, `guard-bash-integration.test.ts:294-300` would write it via `configFiles`, the
loader would raise a parse diagnostic **and** a retired-file diagnostic, and the exact single-element
event list would see two. Loud.

## Fix direction

Either restore one clause — a `files` entry keyed on a seeded path, asserted to have replaced it,
which is three lines rather than the 62 the whole block cost — or record in the harness beside
`:353` that the spread order is load-bearing and unasserted. The second is honest and free; the
first is cheap and closes it.
