A __proto__ key in extensions is dropped when the codec reserialises a record
---
**Severity:** Low. Violates "preserved verbatim" for `extensions` and `legacy_fields`; the stored revision changes on the next write.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Defect.** `codec/src/store.ts` `order()` builds its output with a plain object literal:

```ts
const out: Record<string, unknown> = {};
...
for (const key of Object.keys(value)) {
  if (!(key in out)) out[key] = value[key];
}
```

Assigning `out["__proto__"]` hits the prototype setter, so the key vanishes.

**Evidence.** Run 261010 through vite-node over `codec/src`: a record with `"extensions":{"__proto__":{"x":1},"a":2}` passes `strictParse` and schema validation, and `serialise` emits `{"a":2}`.

**Acceptance test.** Either `order()` builds `out` with `Object.create(null)` or `Object.defineProperty` and the key round-trips, or the strict reader refuses a `__proto__` key with a typed error. A fixture pins whichever is chosen.
