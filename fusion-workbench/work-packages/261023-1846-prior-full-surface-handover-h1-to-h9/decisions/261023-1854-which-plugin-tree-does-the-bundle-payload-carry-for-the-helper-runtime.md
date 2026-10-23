# Which plugin tree does the bundle payload carry for the helper runtime: the hand-over's lists, or the whole installed tree?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261023-1846-prior-full-surface-handover-h1-to-h9.md; 261023-1854-plan-prior-full-surface-handover-h1-to-h9.md; 261014-0830-does-a-shipped-file-change-after-a-release-tag-take-a-version-bump-when-the-bump-changes-the-prior-bundle-digest.md

---

## Question

H8 asks the payload to carry what `host.exec.v1` mounts: `bin/`, `rules/`, `codec/dist/`, `templates/`, `stilwerk/`. H9 adds `hooks/hooks.json`, `hooks/dist/`, `agents/orchestrator.md` and `.claude-plugin/plugin.json`. Prior's executor mounts exactly those parts (`Prior: internal/supervisor/exec.go` `helperRequired`, `helperDeferred`, at `08c57fb`). Reading fusion at `8530c67c` shows the union is not what the 27 entries read at run time:

- `bin/fusion-paths` resolves its key set from `agents/<name>.md` or `skills/<name>/SKILL.md` (its lines 259 and 260), and `bin/fusion-rules` reads the same prompts, so every profile's Setup fails without the whole `agents/` and `skills/`.
- Sixteen `bin/` helpers start `hooks/dist/*.js` (`grep -c hooks/dist bin/*`), so H8's runtime is broken without H9's.
- `/fusion:help` reads `docs/`, `README.md`, `README-agents.md` and `README-hooks.md` through `$FUSION_SRC`.
- Whether `codec/dist/fusion-record.js` and the hooks read `codec/contract/` or `codec/schemas/` at run time rather than inlining them is not settled by reading the bundle text (inference: inlined, since the bundle carries `*_default` constants); the hooks' `lib/record-client.js` names `codec/src/` paths.

So the payload's helper tree has to be chosen, and Prior's mount list follows the choice.

## Options

1. **The hand-over's lists exactly.**
   - Pros: matches H8 and H9 as written; Prior's mount list stands.
   - Cons: every Setup step fails at `fusion-paths`/`fusion-rules`, and `help` cannot read what it cites; the structural effect Prior compares against the Claude Code baselines cannot be reached.
2. **The tree an install holds.** The payload carries, at its root and in the plugin's own layout, every git-tracked file under the entries of `install.sh`'s copy loop at the build commit, which is what `install.sh` copies from the GitHub tarball. A test holds the assembler's list equal to that loop, so the loop stays the one authority (`README-agents.md` `### HTTPS installer (install.sh)`). Prior is asked to mount each top-level entry of that list.
   - Pros: the helpers, hooks and skills see under Prior the tree they see under Claude Code, which is the parity the comparison runs need; no per-file prediction of what a helper reads, so no list to drift; the build already refuses an untracked or modified file.
   - Cons: about 1 530 files and 12 MB (`git ls-files` over the loop's entries, `8530c67c`), most of them `codec/fixtures/`, which no entry reads; Prior's mount list changes.
3. **The lists plus measured additions.** H8 and H9 plus what a measurement shows each entry needs, found by running each entry's Setup and its helper calls from an unpacked payload.
   - Pros: a smaller payload.
   - Cons: the measurement covers the paths the reference tasks exercise and no others, so a later fusion change that reads one more file breaks Prior silently; this is predicting reads, the shape `rules/critical-stance.md` §4 records as having failed once already.

## Constraints

- The hooks' layout is fixed: `hooks/dist/lib/` sits three levels below the plugin root (`resolveIdentity` in `hooks/lib/orchestrator-events.ts`).
- The payload root also holds the module's own files (`module.json`, `catalog.json`, `profiles/`, `workflows/`, `schemas/`, `build-identity.json`, `bin/fusion-module`, `bin/<os>-<arch>/`). No install-tree entry collides with them except the shared `bin/`, where no helper is named `fusion-module` (`ls bin/` at `8530c67c`).
- The runtime tree is not listed in the manifest's `data`, so the module, which reads every data file at start with a 1 MiB bound per file, never loads it.

## Recommendation

Option 2. The question "which files does fusion read at run time" is not decidable from fusion's text with confidence, and the install tree is the answer Claude Code itself runs on. Carrying it costs bytes and no correctness; the request names the mount list Prior is asked to widen.

---
Answered: the user in chat, 2026-10-23, answer "1" to the plan approval (approve the plan and the split, decide all five questions as recommended) — option 2, as recommended; ruled by user, Kai Stalmann <ks@qantr.com>
