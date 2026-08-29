`declared_lang` prefix-matches the value, so `deutsch`, `denmark` and `de-DE` all resolve to `de` while three shipped texts say they resolve to nothing

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, review of `b246996..HEAD` (the two-language declaration split)
**Affects:** `bin/fusion-rules:278-285` (`declared_lang`), and the three places that describe it wrongly: `rules/fusion-workbench-conventions.md:193`, `bin/fusion-rules:129-133` (header block), `bin/fusion-rules:264-266` (function docblock). One test case, `hooks/lib/__tests__/rules-voice-profile.test.ts:245-252`, asserts the wrong generalisation and passes for a narrower reason than its title claims.
**Cross-references:** `260807-2024_*_two-language-declarations.md`; `260807-1515_*_wie-weit-reicht-die-projektsprache-in-den-regelkorpus.md`

---

## The defect

The extraction regex captures the first two lowercase letters of the value and discards
the rest:

```
bin/fusion-rules:278-280
  extracted=$(grep -E "^\*\*$label:\*\* *[a-z]{2}" "$claude_md" 2>/dev/null \
              | head -n 1 \
              | sed -E "s/^\*\*$label:\*\* *([a-z]{2}).*/\1/")
```

`.*` after the capture swallows whatever follows. So any value beginning with a lowercase
`en` or `de` is accepted as that code. Measured against the work tree, in a temp project
carrying all four profile files:

| `CLAUDE.md` | emitted chat profile | emitted writing profile |
|---|---|---|
| `**Language:** en` + `**Artifact language:** deutsch` | `chat-voice-en.yaml` | `default-voice-de.yaml` |
| `**Language:** en` + `**Artifact language:** denmark` | `chat-voice-en.yaml` | `default-voice-de.yaml` |
| `**Language:** en` + `**Artifact language:** de-DE` | `chat-voice-en.yaml` | `default-voice-de.yaml` |
| `**Language:** en` + `**Artifact language:** english` | `chat-voice-en.yaml` | `default-voice-en.yaml` |
| `**Language:** deutsch` (alone) | `chat-voice-de.yaml` | `default-voice-de.yaml` |

`denmark` is the clearest case: a value that names no language fusion supports silently
selects the German writing profile for every artifact the nine prose agents produce.

## Why it is filed now, given the regex is older than this change

The regex is unchanged from `resolve_lang_code`, and the old docblock was wrong about it
in the same way. Two things changed:

1. **A new reachable direction.** Before the split there was one declaration and one
   default (`en`), so a garbage value degraded toward the default that most projects
   wanted anyway. Now a garbage *artifact* value does not fall back to the chat language
   as documented — it overrides it. `**Language:** en` + `**Artifact language:** denmark`
   is documented to give English artifacts and gives German ones.
2. **The wrong claim was promoted into shipped rule text.** It is no longer only a comment
   in a bash file; `rules/fusion-workbench-conventions.md` is emitted to every agent in
   every consuming project, and line 193 states:

   > `**Artifact language:**` absent, unreadable, or **carrying anything other than `en` or
   > `de`** all mean the same thing — not declared — and then `**Language:**` governs both
   > surfaces.

   That is false for every value in the table above. The same claim is repeated at
   `bin/fusion-rules:129-133` and `:264-266`.

## The test that does not catch it

```
hooks/lib/__tests__/rules-voice-profile.test.ts:245
  it("treats a spelled-out language name as not declared", () => {
    // `English` never even reaches the value test: the pattern is
    // case-sensitive and wants exactly two lowercase letters.
    ... claudeMd: "**Language:** de\n**Artifact language:** English\n"
```

The inline comment is accurate — capital `E` is what makes this case green. The test
*title* is not: a spelled-out name in lowercase (`english`, `deutsch`) is treated as
declared. The neighbouring case at `:238` (`xx`) does discriminate correctly, because `xx`
is not a prefix of a supported code.

## Fix directions (pick one, they are exclusive)

**a. Anchor the value.** Require the code to be the whole value:

```
grep -E "^\*\*$label:\*\* *(en|de)[[:space:]]*$"
```

Then `deutsch`, `denmark` and `de-DE` all land in the "not declared" branch, and the three
shipped texts become true as written. This is the reading the rule text already promises,
so it is the smaller documentation change. It does tighten `**Language:**` for existing
consumers — a project carrying `**Language:** de (Deutsch)` would flip to `en`. Worth a
grep of known consumers before choosing it.

**b. Keep prefix matching and say so.** Change the three texts to describe what the code
does ("the first two lowercase letters of the value are read as the code"). Cheaper, but it
leaves `denmark` → `de` as documented behaviour, which is hard to defend as anything but an
accident.

Either way, add a test case with a lowercase spelled-out value (`deutsch` and `english`,
both directions) and retitle `:245` to name case-sensitivity, which is what it actually
pins.

## Related, same function — not a defect today

`$label` is interpolated unescaped into both a `grep -E` pattern and a `sed -E`
substitution (`:278`, `:280`). Both call sites pass fixed literals with no metacharacters,
so nothing is broken. The docblock at `:259` invites reuse ("e.g. `Language` or
`Artifact language`"), and a future label carrying `/`, `.`, `*` or `[` would break the
`sed` expression or widen the `grep` silently. A one-line comment restricting the parameter
to metacharacter-free literals costs nothing and closes it.

---
Resolved: Fixed in Turn 2 of session 260807-2020-orchestrator-session.md. The extraction in `declared_lang` no longer
decides which values are supported: the `sed` now strips the label and trailing whitespace and
nothing else, so the `case "$extracted" in en|de)` that was already there sees the whole value and
becomes the single place the supported set lives. The reviewer's option (a) was considered and not
taken, because it would have written `en|de` into a second place inside one 30-line function.
Trailing whitespace and a CRLF line ending still resolve, which the previous `.*` swallowed by
accident and the strip now handles on purpose. `deutsch`, `denmark`, `de-DE` and the chat-side
`deutsch` are pinned by four new test cases, each verified red against a scratch copy carrying the
old extraction. Suite is 16 green, up from 12. Case `:245` was retitled: it pinned case sensitivity,
not spelled-out names. The unescaped `$label` interpolation is documented in the docblock rather
than escaped, because both call sites are fixed metacharacter-free literals.
