C05 in both chat profiles still carries the bare rule filename the 0146 closure says is gone
---
The `Resolved:` note on `circles/260820-2051-style-rules-arrive-and-get-measured/issues/260821-0146_*_the-four-voice-profiles-are-shipped-text-every-agent-loads-and-no-lint-gate-reads-them.md:28` says the C04 cap pointer now names the rule in prose "so no citation stands ungated". C04 was repaired; C05 was not. `stilwerk/chat-voice-en.yaml:49` and `stilwerk/chat-voice-de.yaml:51` still end their instruction with the token `user-facing-output.md`, and the workbench copies match byte for byte. The profiles are on no lint surface, so this pointer is exactly the ungated class the record described.
---
**Filed by:** ontorev
**Severity:** Low
**Domain:** data
**Affects:** `stilwerk/chat-voice-en.yaml:49`, `stilwerk/chat-voice-de.yaml:51`, `fusion-workbench/stilwerk/` copies of both
**Cross-references:** triage row 187 of `circles/260824-1853-close-every-open-defect/planning/260824-1905_*_plan-close-every-open-defect.md`; commit `43cdde6`

Fix direction: give C05 the same prose form C04 got ("the rule on user-facing output"), in both languages and both copies, and keep the four `diff -q` pairs empty. Verify with `grep -n 'user-facing-output.md' stilwerk/chat-voice-*.yaml` printing nothing.
