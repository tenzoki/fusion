# Does `catalog.json` gain its `entries` list under `fusion.catalog/v1`, or as `fusion.catalog/v2`?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261023-1846-prior-full-surface-handover-h1-to-h9.md; 261023-1854-plan-prior-full-surface-handover-h1-to-h9.md; 261010-1235-how-is-the-host-neutral-role-text-the-source-of-both-the-claude-agents-and-the-prior-profiles.md

---

## Question

H1 of Prior's hand-over asks for an `entries` list beside `roles` in `catalog/catalog.json`. That file is a published contract: the render copies it byte for byte into the bundle, and two decoders read it with an exact key set and the literal `"schema": "fusion.catalog/v1"`. One is Prior's, `Prior: internal/fusionhost/external_catalog.go` `parseExternalCatalog` (`requiredObject(..., "schema", "roles")`). The other is fusion's own module, `adapters/prior/fusionmodule/internal/steps/catalog.go` `LoadCatalog` (`decodeExact(body, &doc, "schema", "roles")`). `catalog/src/render.ts` mirrors them in `PRIOR_CATALOG_KEYS`. Adding a third key changes the document's shape. The frozen-asset rule for the published schemas (`catalog/README.md` `## The frozen assets`) says a shape change is "a new schema version beside the old one, agreed with Prior, … never an edit under the same name"; `catalog.schema.json` is fusion's own and not frozen, but `catalog.json` is what Prior decodes. The value of `schema` has to be chosen before the entries step writes the file.

## Options

1. **Keep `fusion.catalog/v1` and add `entries`.** Prior widens its v1 decoder to three keys.
   - Pros: no version string moves; the change is one key.
   - Cons: two documents with different shapes carry one schema name. A Prior that predates step 28 refuses the new catalog as an unknown key rather than as an unknown version, and a reader of an installed 13.1.0 bundle cannot tell from the name which shape it holds.
2. **`fusion.catalog/v2`: `roles` unchanged, `entries` added.** fusion's render and module, and Prior's step-28 loader, decode v2; the 13.1.0 bundle Prior installed keeps its v1 document and Prior's v1 path unchanged.
   - Pros: the name says the shape, the rule the frozen assets already follow; an old decoder refuses by version, which is the refusal it already has; the v1 decoder on Prior's side need not change.
   - Cons: one more version string on both sides; Prior has to keep or retire a v1 path by its own choice.

## Constraints

- `roles` keeps its exact shape: the explorer and repair workflows resolve roles through it, and their bundles are qualified.
- Prior's acceptance of the shape comes through the hand-over request; fusion's choice is a proposal there, which Prior may correct.

## Recommendation

Option 2. The document is decoded by two parties with exact key sets, and the version name is the one field both read before anything else; making it say the shape costs a string and removes a class of silent mismatch.

---
Answered: the user in chat, 2026-10-23, answer "1" to the plan approval (approve the plan and the split, decide all five questions as recommended) — option 2, as recommended; ruled by user, Kai Stalmann <ks@qantr.com>
