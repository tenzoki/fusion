# Which English name does `stilwerk/` take, and at which point does it become a supported Fusion contract?

---
**Domain:** code
**Filed by:** shaper, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260922-1045_*_spec-prior-nomenclature-plugin-source.md, 260922-1038-prior-mapping.md, nomenclature.md (this container)

---

## Question

`stilwerk/` holds the stylometric voice profiles (`chat-voice-<lang>.yaml`, `default-voice-<lang>.yaml`) that `/fusion:setup` seeds from the plugin's shipped templates and `bin/fusion-rules` emits to every agent. The nomenclature marks it Review: "the concept does not define `stilwerk`; choose an English name when this becomes a supported Fusion contract". Two questions are folded into that row, the name and the moment, and the second gates the first. Filed so part (2) rules on both rather than renaming a directory in every consumer's workbench root on a naming pass.

## Options

1. **Keep `stilwerk` until the profiles are a supported contract**, and rename then, in one release, with the seeding and the emission changed together.
   - Pros: the nomenclature's own sequencing; no consumer root changes now.
   - Cons: a German proper name on an English surface for the interim.
2. **Rename now to an English name for the area** (`voice-profiles/` or `style/` are the two candidates the helper headers suggest), as part of the consumer migration.
   - Pros: one migration pass reaches every renamed directory at once.
   - Cons: the profiles are not yet a defined contract, so the name may not survive the contract's definition; the rename reaches `bin/fusion-rules`, `/fusion:setup`, `.asset-provenance` lines and the shipped `stilwerk/` templates.
3. **Treat `stilwerk` as the proper name of the profile format** and keep it.
   - Pros: no rename ever.
   - Cons: contradicts the nomenclature's direction to prefer English machine names.

## Constraints

- No file moves before the answer: `nomenclature.md` `### Fusion workbench migration` says its table "defines naming direction, not an authorised bulk move", and the part (1) spec keeps this store unchanged in name and content.
- The answer is realised by part (2), the consumer migration, and its spec cites this record; part (1) reads and writes the store where it stands today.
- Every citation of a record in this store keeps resolving through the move, whatever the answer: the basename is the citation, the store is not (`rules/fusion-workbench-conventions.md` `## Filename Patterns`).

---
Answered: 260922-1059_*_which-english-name-does-stilwerk-take-and-when.md `## Options` — option 3: `stilwerk` is the proper name of the profile format and stays for good; the nomenclature takes an exception for it; ruled by user, Kai Stalmann <ks@qantr.com>
