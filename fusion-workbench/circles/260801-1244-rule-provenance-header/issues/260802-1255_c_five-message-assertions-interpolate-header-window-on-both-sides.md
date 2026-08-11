Five message assertions interpolate `HEADER_WINDOW` on both sides, so they cannot fail

---

**Severity: Low.** Weak assertions, not wrong ones. Also a divergence from the three
sibling gates the plan required this one to follow.

**Evidence.** `hooks/lib/__tests__/provenance-header-lint.test.ts`.

`report()` builds its message with the constant interpolated (`:89`):

```ts
`  ${rel}  no 'Provenance:' line in the first ${HEADER_WINDOW} lines\n` +
```

Five assertions then check for the same interpolation:

| Line | Assertion |
|---|---|
| 161 | ``expect(report(["rules/fixture.md"])).toContain(`first ${HEADER_WINDOW} lines`)`` |
| 239 | ``expect(msg).toContain(`no 'Provenance:' line in the first ${HEADER_WINDOW} lines`)`` |
| 253 | ``expect(msg).toContain(`first ${HEADER_WINDOW} lines`)`` |
| 274 | ``expect(msg).toContain(`no 'Provenance:' line in the first ${HEADER_WINDOW} lines`)`` |
| 295 | ``expect(msg).toContain(`first ${HEADER_WINDOW} lines`)`` |

Each compares a template literal against its own substring. Set `HEADER_WINDOW = 3` and
all five still pass while the gate silently narrows to three lines and the message
truthfully advertises the wrong rule. Acceptance criterion 3 is about the message stating
the fix; a message that states a wrong window would satisfy these five.

The window constant itself is well covered elsewhere: `:150-162` pins the accept/reject
boundary at 10 and 11 with real arithmetic, and `:159` independently asserts the fixture
really has its header at line 11. The gate's *behaviour* is safe. Only the message
assertions are hollow.

**Sibling divergence.** All three corpus-lint gates use plain literals in every
`toContain`: `path-literal-lint.test.ts:241-243`
(`"agents/coder.md:5"`, `"fusion-workbench/planning/"`, `"bin/fusion-paths"`),
`marker-format-lint.test.ts:182-184` (`"agents/coder.md:5"`, `"[c]"`, `"_c_"`),
`glob-nomatch-lint.test.ts:136` (`"find"`). None interpolates a constant it is testing.
The plan (`260802-1131_o_plan-rule-provenance-header.md`, "The shape reference") required
this gate to follow their shape.

The literal-string assertions in the same tests are sound and should stay:
`:240`, `:241`, `:242`, `:243`, `:254`, `:296`. They pin the spec's verbatim wording,
which is exactly what a message test is for.

**Fix.**

1. Write `"first 10 lines"` and `"no 'Provenance:' line in the first 10 lines"` as
   literals at `:161`, `:239`, `:253`, `:274`, `:295`. A window change then forces a
   deliberate test edit, which is the point.
2. Move `:161` out of the `describe` block titled "the window is exactly the first ten
   lines". It asserts nothing about the fixture that block builds, and `:246-255` already
   makes the identical assertion where it belongs.

---
Resolved — `hooks/lib/__tests__/provenance-header-lint.test.ts`, session `260811-1315`.
Closed in place: this Circle is closed, and the Origin Rule places the record where the Directive
that caused it ran.

**The five assertions now test the message.** Four of them carry plain literals, as the three
sibling gates do: `"no 'Provenance:' line in the first 10 lines"` at the two full-message sites and
`"first 10 lines"` at the two window-only sites. Set `HEADER_WINDOW = 3` and each of the four fails,
which is the property they lacked — a human reading the failure learns the window size, and that is
now something a wrong window can break.

**The fifth was removed rather than rewritten.** It sat in the `describe` block titled "the window
is exactly the first ten lines", asserted nothing about the fixture that block builds, and the
negative-fixture case "negative 2: the only header sits at line 11" already makes the identical
assertion where message assertions belong. Moving it there would have duplicated it, so it is gone
and its counterpart stands.

**The reasoning lives at the constant, not at the assertions.** `HEADER_WINDOW = 10` now carries a
`CHANGING THIS NUMBER BREAKS TESTS ON PURPOSE` note: the behavioural tests read the constant (a
fixture at `HEADER_WINDOW + 1` is the boundary wherever the boundary is), the message tests spell
the ten out, and the note says why, citing this record. That is the one place someone editing the
window will look.

Verification: `cd hooks && npm test` → exit 0, 1246 tests, unchanged from HEAD `619dfb7` (an
assertion is not a case, so removing one moves no count).
