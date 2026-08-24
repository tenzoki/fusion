`bin/fusion-session-domain`'s header says the value may be "quoted or bare", the `sed` accepts double quotes only, and the new test's own comment counts four fallback reasons where the script has three
---
Two small gaps between the helper and the test `011cc92` gave it. First, `bin/fusion-session-domain:41` ("with the value quoted or bare") and the `sed` at `:75` (`"?([^"[:space:]]*)"?`): a YAML single-quoted value is rejected. Reproduced with `session:\n  domain: 'data'`: stderr "carries session.domain='data', which is neither code nor data", `domain=code source=default`. No shipped writer produces that form (`agents/orchestrator.md:1073` writes `domain: "<...>"`), so no live path is affected; but the header states a contract wider than the read, which is the class the closed record `260824-2056_*_the-session-domain-helpers-header-claims-a-scope-its-grep-does-not-have...` was about. Second, `hooks/lib/__tests__/fusion-session-domain.test.ts:14` says "the four-way stderr reason on a fallback" and the record's `Resolved:` note lists "the four fallback reasons (missing file, missing key, invalid value, uncapturable value)"; the script's `case` at `:80-93` has three branches, and "invalid" and "uncapturable" are one of them (the test at `:157-158` pins the same substring for both).
---
**Filed by:** coderev (person half absent: the installed plugin at `$FUSION_PLUGIN_ROOT` carries no `bin/fusion-identity`, so attribution was dropped rather than composed)

Scope: `bin/fusion-session-domain:41,75`; `hooks/lib/__tests__/fusion-session-domain.test.ts:14`. Range `01964e4..13aaa85`.

Fix direction: either widen the `sed` to `["']?...["']?` and add one `it.each` row (`["single-quoted", "session:\n  domain: 'data'\n"]`, one line, which needs a one-line cut elsewhere: hook-test head-room is 0), or narrow the header to "double-quoted or bare"; and change the test comment's "four-way" to "three-way" (same line count).

Severity: Low.
