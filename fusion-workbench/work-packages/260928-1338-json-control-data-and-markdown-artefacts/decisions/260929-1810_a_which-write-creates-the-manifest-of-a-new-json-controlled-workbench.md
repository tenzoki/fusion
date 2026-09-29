# Which write creates the manifest of a new JSON-controlled workbench?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260928-1338-json-control-data-and-markdown-artefacts.md, 260929-1810_*_plan-fj03a-the-record-client-the-format-gate-and-scope-and-order-on-json.md, 260928-2251_*_plan-fj02-operation-kernel-revisions-and-local-transactions.md

---

## Question

Section 4.1 of the specification (Prior `e3bc25b`) says a workbench without `workbench.json` is legacy, and that a new workbench carries a manifest whose `migration` is null. No operation of section 6 writes that file: the four reads bootstrap nothing, `create` writes record pairs into a workbench that already is JSON-controlled, and `migration` activates the manifest as the last step of converting an existing workbench (FJ04). `/fusion:setup` is the only workflow allowed to create a workbench (`CLAUDE.md` `## Conventions`), and at fusion `b4c8f7ca` its Step 0 creates the store directories and `.fusion-setup` and no manifest. Once FJ03a's resolvers refuse every workbench that is not JSON-controlled, a workbench set up fresh is refused too, so from FJ03a until this is settled `/fusion:setup` on this branch ends at its own path-resolution step. The ruling is needed before FJ03c (the writers, `/fusion:setup` among them) is planned. It is a contract question, so it goes to the Prior side as a numbered request as well.

## Options

1. **A new operation in the codec creates it.** It takes a caller-supplied workbench id and operation id, refuses when a manifest or any control file already stands, and writes the manifest through the kernel's write discipline.
   - Pros: the kernel stays the one writer of fusion JSON; both hosts create a workbench the same way; the refusal cases are tested where every other refusal is.
   - Cons: a fifteenth operation in a table Prior holds at fourteen; the bundle's digest moves and Prior re-pins; the kernel's sequence starts with the workbench state, so creation is the one operation that must run on a legacy state.
2. **`/fusion:setup` writes the file itself.** A block in the skill body serialises the manifest.
   - Pros: no protocol change, no new digest.
   - Cons: a second writer of fusion JSON, outside the strict serialiser and the schema check; the specification asks for every supported write path to use the same operations.
3. **`migration` covers it.** A migration over a workbench with no record to convert is the creation of a new one, with `migration` null in the manifest it activates.
   - Pros: no new operation; one activation path for the manifest.
   - Cons: nothing can be set up fresh before FJ04 lands; a new project runs a migration it has nothing to migrate with, including survey, plan and receipt.

## Constraints

- A manifest is activated only when every control record beside it is valid; a new workbench has none, which is the one case where that holds trivially.
- The workbench id is a UUID fixed once; a copy of the directory is not a new workbench (section 3).
- `/fusion:setup` stays the only workflow that bootstraps a workbench.

## Recommendation

Option 1, asked of the Prior side with the three refusal cases named (a manifest stands, a control file stands without a manifest, the target is no directory). It is the smallest addition that keeps one writer, and it is additive: no existing request changes its answer.

---
Answered: Prior `docs/design/fusion-fj03a-followup-decisions.md` `## 27. New manifest: a codec-owned initialize operation` at Prior `ddd4973` — option 1: a new codec operation `initialize` creates the manifest; Setup asks for it on an existing empty target directory before it writes scaffolding; a manifest already present, any existing content (legacy Markdown without JSON included) or a target that is no directory is refused; fusion plans the additive kernel change before FJ03c; the user gave the Prior side's follow-up as the answer on 2026-09-29; ruled by user, Kai Stalmann <ks@qantr.com>
