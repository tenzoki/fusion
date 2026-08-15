The next skill's Status note is decided from a file-wide grep, not from the write's result, and the silent skip returns by another door

---
`skills/next/SKILL.md:218-227` replaced a `grep` pre-guard with an unconditional `sed` plus a verification `grep`, and the prose beside it states *"The note is decided from the **result** of the write, never from a separate test of the input."* It is decided from neither: `grep -qE '^\*\*Status:\*\* active$' "$REC"` tests the whole output file. Two consequences measured on fixtures. A record with no head `**Status:**` field but a column-0 `**Status:** active` line anywhere else gets no write and no note — the same silent skip this change closed, re-entered from the output side. And when the write genuinely fails, the note fires claiming the record "carries no `**Status:**` field", which is false and misattributes the cause.

---

## What the change does right, and it should not be lost

The valueless-field case is fixed, and the metacharacter question the review asked has a clean answer. Measured against six fixtures with the exact shipped commands:

| fixture | result | note |
|---|---|---|
| `**Status:** anticipated` | → `active` | none — correct |
| `**Status:**` (valueless) | → `active` | none — **this is the fix, and it works** |
| no field at all | unchanged | fires — correct |
| `**Status:** a\|b&c\1 .*[x]` | → `active` | none — correct |

Regex metacharacters in the field's *value* cannot affect the rewrite: the pattern is fixed, `.*` consumes the value, and the replacement is a literal with no `&` and no backreference. The `\|` delimiter is in the input, not the pattern. That question is closed — the shape is safe there.

## Defect 1 — the verification reads the wrong thing

The test is over the whole file. A column-0 line `**Status:** active` anywhere in the record satisfies it, whether or not the head field exists.

Fixture: a record with `**Directive:** x` and a fenced block containing `**Status:** active` at column 0, and no head Status field. The `sed` rewrites the fenced line to what it already was, the `grep` finds it, and the note is suppressed. The record is activated with no Status field and nobody is told — which is exactly the failure the change set out to remove.

Is the fixture realistic? `rules/circle-records.md:70` is a column-0 `**Status:** <anticipated | active | …>` line inside the Circle-record template's fence, so a record that quotes its own template carries one. **Measured against the real corpus: all fifteen `*_circle.md` files in this workbench carry exactly one column-0 `**Status:**` line**, so no record exhibits it today. This is a latent hole, not a live break.

## Defect 2 — the note's text asserts a cause it did not test

Fixture: `$REC` in a read-only directory, so `> "$REC.tmp"` fails.

```
NOTE-FIRED: "note: …/f8 carries no **Status:** field, so none was set;
             the marker on the filename is the state"
--- f8 ---
**Status:** anticipated
```

The field is present, reads `anticipated`, and the write failed. The note names the one cause it did not check. A user reading it goes looking for a missing field that is not missing.

## Defect 3 — the sed rewrites every matching line

`sed -E 's|^\*\*Status:\*\*.*$|…|'` has no line address, so a record with two column-0 `**Status:**` lines gets both set to `active`. Measured: a two-line fixture came back with both rewritten. The old form had the same shape, so this is not a regression — but the new pattern also matches the valueless spelling, so the set of lines it can reach is strictly larger.

## Fix direction — one pass, three touches

1. **Decide the note from the write, not from a re-read.** Capture the `sed`/`mv` exit status and branch on it, so a failed write reports a failed write.
2. **Verify against the head field, not the file.** Either restrict the match to the record's head block (before the first blank-line-terminated section, or before the first fence), or count substitutions — GNU/BSD-portable: compare `grep -cE '^\*\*Status:\*\*'` before and after, or drive the whole thing off `awk` with a `NR` bound.
3. **Address the `sed` to the first match** if the head field is the only one meant to move.

The instruction the change added — *"Put no `grep` guard in front of the `sed`: that was the shape this replaced, and its two patterns asked different questions"* — is right and should stay. The problem is the verification behind the `sed`, not a guard in front of it. Correct the sentence at `:225` at the same time: it currently claims a property the code does not have.

**Growth note:** the fix lands in `skills/`, whose bound has 14 138 bytes of head-room and has already absorbed 5 862 this session. Keep the correction to the shape and drop a sentence elsewhere if it runs long.

**Found by:** coderev, reviewing `f4f01b0..3a0408a` (commit `8c1bd74`). Fixtures reproducible; commands taken verbatim from `skills/next/SKILL.md:218-222`.
