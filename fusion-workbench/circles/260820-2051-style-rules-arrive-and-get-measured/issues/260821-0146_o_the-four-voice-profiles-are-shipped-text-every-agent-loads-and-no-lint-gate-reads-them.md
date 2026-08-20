The four voice profiles are shipped text every agent loads, and no lint gate reads them

---

`reference-resolution-lint.test.ts` decides its own corpus in `surface()` at `hooks/lib/__tests__/reference-resolution-lint.test.ts:143-190`. The list is `rules/`, `agents/`, `docs/`, `templates/`, `skills/*/SKILL.md`, the root `README*.md` and `CLAUDE.md`, every `bin/` file with a `#!` shebang, `install.sh`, and the `hooks/**.ts` comment lines. `stilwerk/*.yaml` is on none of them. The same file's citable-target regex at `:274` does include `stilwerk` as a **destination** prefix, which is what makes the omission easy to miss: the directory is a thing citations may point at and not a thing whose own citations are read.

`grep -rln "stilwerk" hooks/lib/__tests__/*.ts` returns five files and none of them scans the shipped profiles as a source surface: `rules-emission-golden.test.ts` names them to declare them out of scope, `rules-voice-profile.test.ts` builds its own fixture copies, and the remaining three are about workbench records.

**Step 5 of this Circle made that gap live.** Commit `5ed284d` removed the duplicated line caps from both chat profiles and replaced them with a citation. `stilwerk/chat-voice-en.yaml:40-42`:

> The line caps for a gate prompt and for a chat reply are stated in rules/user-facing-output.md, section "## Length", and are not restated here.

and the German counterpart at `stilwerk/chat-voice-de.yaml:41-43`. Replacing a copied number with a pointer is the right correction and it is the correction this Circle exists to make. It also moves the file from a class of defect that had already been caught twice (`shared/issues/260816-1330_o_the-override-record-names-the-shipped-chat-profiles-cap-and-the-copy-every-agent-loads-says-otherwise.md`, and the drift `5ed284d` itself repaired: shipped profiles said six and eight where the rule says eight and twelve) into a class nothing checks. `rules/user-facing-output.md` `## Length` exists at HEAD. If either the path or the heading is renamed, both profiles point at nothing and every agent on every dispatch loads the dangling pointer.

`5ed284d` carries no re-approval note above `const BASELINE`, correctly: the count did not move, because the gate never looked.

**Scope is four files and it is the whole shipped `stilwerk/` tree.** All four are copied into every consuming project's workbench by `/fusion:setup` Step 0d and are emitted by `bin/fusion-rules` to every agent (`bin/fusion-rules:431`) or to the prose agents (`:440`).

**Verified at HEAD `7832553`** by reading `reference-resolution-lint.test.ts:143-190` and `:274`, by the `grep -rln` above, and by reading the two cited profile lines.

---
**Found by:** coderev, review of `7135a19..7832553`, review file `circles/260820-2051-style-rules-arrive-and-get-measured/reviews/260821-0145-coderev-turn-1-prose-metric-setup-step-0e-and-the-repunctuation.md`.
**Owner:** `coder` if the answer is to extend `surface()`; `ontocoder` if the answer is to change what the profiles say instead.
**Severity:** Medium. Nothing is broken at HEAD. The exposure is that four files loaded on every dispatch in every consuming project now carry a cross-file citation that no gate reads, on a surface whose other citation classes are gated precisely because they were measured to rot.
**Direction, not a prescription.** Adding `stilwerk/*.yaml` to `surface()` is the obvious move and it is not free: the profiles' `examples:` values are full of deliberate anti-exhibits, and the gate would need the same kind of exemption reasoning the file's header at `:24-95` already works through for comments. Whether that cost is worth paying for four files, or whether the citation should be dropped back to prose that names no path, is the author's call.
