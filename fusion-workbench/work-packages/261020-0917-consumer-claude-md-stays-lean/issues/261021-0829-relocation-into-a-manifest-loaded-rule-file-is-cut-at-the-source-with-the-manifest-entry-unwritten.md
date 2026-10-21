A relocation into a manifest-loaded `./rules/` file is cut at the source while the manifest entry stays unwritten
---
`rules/context-lean-claude-md.md` `### Relocating in a consuming project` says an entry whose destination is "the manifest" stays `stale` until a data-implementer step writes it. The curator's apply procedure has no such hold. The manifest is never a ledger `Destination:`. The destination is the `./rules/<topic>.md` file, which the curator may write. So the source is cut, and the manifest registration that would make anyone load the passage is excluded from the curator's remit.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Evidence.**

- `rules/context-lean-claude-md.md` `### Step 3 — what a passage that fails the test becomes`, the paragraph added in `93d28b29`: "A fusion-only rule goes to `./rules/<topic>.md` behind the manifest."
- `rules/context-lean-claude-md.md` `### Relocating in a consuming project` (added in `6c49365d`): "An entry whose destination is a header or the manifest stays `stale` ... until a code-implementer step (header) or a data-implementer step (manifest) has written it".
- `agents/policy-curator.md` `### Pass 2 — apply. Approved entries only.`, relocation step 3: a hold happens only when the destination is "A file outside those three" surfaces. `./rules/<topic>.md` is inside them (`## Scope`: "The consuming project's `./rules/` and `.claude/rules/` files, including ... creating one"). So steps 3 to 5 write it and cut the source.
- `agents/policy-curator.md` `### Explicitly not in your remit`, exclusion 4: "Any change to which rule files load for which agent. `bin/fusion-rules` and the consuming project's `./rules/context-manifest.yaml` own that". The curator may not register the new file.
- `bin/fusion-rules` emits a project `./rules/` file only by a filename pattern word (the `PATTERNS=` case block, then `emit_pattern_in_dir "$PROJECT_RULES_DIR"`) or by a manifest unit (the block gated on `MANIFEST="$PROJECT_RULES_DIR/context-manifest.yaml"`). Claude Code does not load `./rules/` at all. So a passage moved to an unregistered `./rules/<topic>.md` whose name has no pattern word reaches no fusion agent and no session. That is the "exists nowhere" outcome the apply ordering was built to prevent (`### Pass 2`: "a relocation that stops halfway leaves the passage at the source rather than nowhere").

**Scope.** The rule text and the curator prompt together. Code is unaffected. It bites only on a `**Placement:** on` run whose destination kind is a fusion-only `./rules/` file.

**Acceptance.** One of these holds, and the subsection and the curator prompt then state the same mechanism:
(a) the curator's apply procedure holds a relocation into `./rules/` `stale` until the file is reachable (a pattern-word name, or a manifest unit naming it), and files the manifest issue;
(b) the destination-by-kind text names only destinations the curator can make reachable by itself (a `paths:`-scoped `.claude/rules/` file, or a `./rules/` file whose name carries the reader's pattern word);
(c) another ruling recorded in a decision.
`### Relocating in a consuming project` no longer claims a hold the apply procedure does not perform.

---
Resolved: option (a). `### Pass 2 — apply` holds a relocation into an unreachable `./rules/` file `stale`, source uncut, and files the manifest unit as an issue for data-implementer; `rules/context-lean-claude-md.md` `### Relocating in a consuming project` states the same mechanism; commit "fix: closing-review findings of the lean-CLAUDE.md package", 2026-10-21.
