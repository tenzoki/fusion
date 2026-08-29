# The commit-message-path lint's exemption regex is broad and case-inconsistent

---
**Severity:** Low
**Domain:** code
**Filed by:** coderev, review of `7785330..cac41ef` (Turn 1)
**Affects:** `hooks/lib/__tests__/commit-message-path.test.ts:141`
**Cross-references:** commit `cac41ef`; issue `260811-1141_*_any-workbench-file-whose-name-contains-commit-message-is-classified-as-a-commit-message-and-the-model-is-told-to-delete-it.md` (the same over-broad name pattern, reached through `classify`)

---

## The defect

The "no shipped prompt names a commit-message file inside the workbench" assertion exempts any line
matching:

```ts
if (/Never inside|never inside|leftover|Measured|improvised|fault/.test(line)) continue;
```

Three problems, in order of consequence:

1. **`fault` is a common word in these prompts.** `agents/orchestrator.md` uses it in the Staging
   check section repeatedly. A line that genuinely *prescribed* a workbench message path and also
   used the word "fault" would be exempted, and the gate's whole subject is that prompt.
2. **The case handling is inconsistent.** `Never inside|never inside` is spelled twice to cover two
   cases; `Measured` is capital-only; `leftover`, `improvised` and `fault` are lowercase-only. A
   sentence opening "Improvised at commit time…" is not exempt, "measured here" is not exempt, and
   nothing in the list explains why the case rules differ per word.
3. **It is a blacklist standing in for an allow-list.** The property the gate wants is "this line
   names the path as a defect, not as an instruction". That is prose classification, which is not
   decidable from a keyword set — the same class `state-drift-detection-lint.test.ts:80-91` names
   honestly about its own `SKIP_LICENCES` list.

## Fix direction

The gate does not need to classify prose. The prompts that legitimately name the leftover do so in
exactly two files, and both name one literal path: `fusion-workbench/.commit-msg-tmp`, the file that
actually appeared.

Replace the keyword exemption with an explicit allow-list of the one path that is permitted to be
named as the defect, and flag every other workbench-internal commit-message path unconditionally.
That is decidable, it is a list somebody has to edit, and it does not depend on the wording around
the path.

Add `/i` if the keyword form is kept for any reason, and drop the duplicated
`Never inside|never inside`.

---

**Resolved:** the keyword exemption is gone. `hooks/lib/__tests__/commit-message-path.test.ts`
now carries a module-level constant `NAMEABLE_LEFTOVER = "fusion-workbench/.commit-msg-tmp"`,
and `it("finds none")` subtracts that one literal path from the helper's hits rather than reading
the prose around them. Every other workbench-internal commit-message path is an offence with no
exemption of any kind, so all three defects go at once: no `fault` keyword to be caught by an
ordinary word in `agents/orchestrator.md`, no hand-spelled case list, and no prose classification
standing in for a decision.

Re-measured before relying on the record's line numbers, since `agents/orchestrator.md` was being
edited the same day: the two legitimate lines are `agents/orchestrator.md:420` (the record says
`:418`) and `skills/commit/SKILL.md:88`, and both name exactly `fusion-workbench/.commit-msg-tmp`
and nothing else.

What the allow-list gives up is written into the constant's doc comment rather than left implicit:
a prompt that *prescribed* writing to `.commit-msg-tmp` would now pass this gate. The keyword form
did not cover that case either (whether such a line carried the word "leftover" was the author's
whim), and the run-time half catches the resulting file by location whatever a prompt says.

Verified by mutation, not by the suite going green: replacing the constant's value makes both
`it("finds none")` and the new positive control fail, each with a message naming
`NAMEABLE_LEFTOVER` and the two file:line locations.
