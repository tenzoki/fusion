The 2122 -> 2123 reference-lint re-approval credits the added path to a record citation the gate does not count
---
The `BASELINE` comment in `hooks/lib/__tests__/reference-resolution-lint.test.ts` puts the +1 path of `628b1d9d` on the `bin/fusion-tmp` header's citation of the package narrative. That token is a record citation, so it counts toward `records`, which `BASELINE` does not pin. The path that was added is `bin/fusion-tmp` in `docs/upgrading-to-v13.md`. The number is right and the audit text is wrong.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261029-1255-reviewer-intermediate-files-closing-pre-tag.md

Evidence: the `PLUGIN_PATH_RE` body copied from that test file was counted over each file at `5c7a1487` and at `628b1d9d`. Results: `bin/fusion-tmp` 3 -> 3, `docs/upgrading-to-v13.md` 43 -> 44, `skills/check/SKILL.md` 19 -> 19. The new token is the **Programs.** bullet's "The table is in the header of `bin/fusion-tmp`". The narrative basename `261027-2242-intermediate-files-in-project-tmp.md` matches no `PLUGIN_PATH_BODY` alternative. `runAll` adds it to `counts.records`, and the assertion compares only `paths`, `anchors` and `stampBare`.

The 2123 -> 2124 entry (`928d3ac7`, the help paragraph's `$FUSION_SRC/docs/upgrading-to-v13.md`) is correctly attributed. Over `skills/help/SKILL.md`, lines with `$FUSION_SRC/` went from 12 to 13, and the dropped 13.1.x paragraph cited nothing.

Acceptance: the 2122 -> 2123 clause names the `docs/upgrading-to-v13.md` token. The numbers stay 2124/382/12.
