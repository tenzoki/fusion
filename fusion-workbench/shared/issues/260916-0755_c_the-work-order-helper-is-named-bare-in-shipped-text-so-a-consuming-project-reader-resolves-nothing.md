The work-order helper is named bare in shipped text, so a consuming-project reader resolves nothing

---
`bin/fusion-work-order` was written without a root at two sites a reader acts on: `skills/help/SKILL.md`'s "Coming from an 11.2.0 install" paragraph and `docs/working-model.md`'s `**Depends-on:**` paragraph. `bin/` is fusion's own work tree; in a consuming project that path is the project's own `bin/`, or nothing. Shipped in v11.3.0 and v11.4.0.

---
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260916-0830_*_a-guardrail-citation-is-truncated-so-no-gate-reads-it-and-no-reader-resolves-it.md

**Evidence.** `skills/help/SKILL.md` states the governing rule in its own header — *"A path into a file the plugin ships carries the `$FUSION_SRC` root … nothing the plugin ships exists at a consuming project's root, so a bare `docs/…` or `rules/…` path resolves to nothing there."* — and then broke it four topics later. `$FUSION_SRC` is the read root; an executable takes `$FUSION_PLUGIN_ROOT`, because the work-tree preference never reaches which helper is run (`CLAUDE.md` `## Release process`, the `fusion --update` paragraph).

**Why the bare form is not the defect by itself.** Over `agents rules skills docs templates README*.md`, `grep -rhoE '(\$FUSION_PLUGIN_ROOT/|\$FUSION_SRC/|~/\.fusion/)?bin/fusion-[a-z-]+'` counts 264 bare tokens against 114 prefixed, across 23 distinct helpers. Bare is the majority and it is correct in its own role: the token is a **name** (`bin/fusion-identity` prints, `bin/fusion-paths <name>` is the single resolution point, the `README-hooks.md` helper roster, which is repository-relative by construction). What separates the two sites above is that each introduces the helper as a thing the reader runs. So the exception is not "one helper missed a sweep" — it is two sentences that crossed from naming into invoking without changing form.

**What no gate sees.** No lint keys on invocation form. `reference-resolution-lint` resolves paths that exist in this repository, and `bin/fusion-work-order` does exist here — the token only fails where this repository is not the tree. Three review passes in the two days before this filing read the same lines for status values and dead references and none of them asked the question.

**Acceptance test.** `grep -rn 'bin/fusion-work-order' skills docs | grep -v '\$FUSION_PLUGIN_ROOT/bin'` returns nothing, and the `skills/` growth bound stays green.

Resolved: 260916-0755 by coder — both sites now read `$FUSION_PLUGIN_ROOT/bin/fusion-work-order`. The acceptance grep returns nothing. `rules/fusion-workbench-conventions.md:226` was ruled bare and left: the token stands in possessive form (`…-work-order`'s graph), which cannot be typed, and the file carries 27 backticked bare helper tokens in that same naming role (`grep -roE '\x60bin/fusion-[a-z-]+[^\x60]*\x60' rules/fusion-workbench-conventions.md | wc -l`), so prefixing one of them would make one form mean two things in one file. `README-hooks.md`'s two rows are repository-relative and correct. Bounds after the fix: `skills/` 576 → 556 bytes of margin, the two sites costing 20 bytes each on one surface; `agents/` 59 315 bytes, hook-test lines 9, and every dispatch path unchanged, tightest `reviewer` at 24 384.
