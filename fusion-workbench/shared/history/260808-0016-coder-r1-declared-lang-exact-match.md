# R1 — `declared_lang` matches the declared value whole instead of by prefix

**Status:** Complete
**Agent:** coder
**Date:** 260808-0016
**Closes:** `shared/issues/260807-2152_o_declared-lang-prefix-matches-so-deutsch-resolves-to-de.md` (record left open; the dispatcher closes and commits)

## What changed

Two files, both named in the dispatch:

- `bin/fusion-rules` — `declared_lang()` (the extraction pipeline and its docblock)
- `hooks/lib/__tests__/rules-voice-profile.test.ts` — one retitled case, four new ones

## The mechanism

The reviewer's option (a) anchors the supported set inside the `grep` pattern
(`^\*\*$label:\*\* *(en|de)[[:space:]]*$`). That fixes the behaviour but writes `en|de`
into a second place: `declared_lang` already ends in a `case "$extracted" in en|de)`, so
after option (a) the supported set is spelled out twice in one 30-line function, and
adding a third language means finding both.

The behavioural constraint is "the value is matched whole against the supported set". The
`case` was already the whole-value matcher. What defeated it was the `sed`, which
pre-truncated the value into a shape the `case` would accept. So the extraction now stops
deciding and hands over the whole value:

```
grep -E "^\*\*$label:\*\*"                 # select the declaration line, no value test
  | head -n 1
  | sed -E "s/^\*\*$label:\*\* *//;        # drop the label and the separating spaces
            s/[[:space:]]*\$//"            # drop trailing whitespace (and a CRLF's \r)
```

The supported set now lives in exactly one place, the `case`, and the function's own
docblock claim — "this one extracts, it does not decide" — becomes true of the code.

Two properties of the pipeline are deliberate rather than incidental:

- **The trailing strip is load-bearing.** `**Language:** de ` and a CRLF file's `de\r`
  both resolved to `de` while `.*` was swallowing them. Without `s/[[:space:]]*$//` the
  fix would turn both into "not declared", which is a regression dressed as a tightening.
  Both are verified below.
- **The leading separator stays ` *`, not `[[:space:]]*`.** A tab-separated value
  (`**Language:**\tde`) is not declared today and is not declared after. Widening it to a
  tab would be a second, unrequested behaviour change.

## The three `set -eu` verifications

Run against a temp project carrying all four profile files, agent `planner`, expecting
exit 0 and the full 10-line emission (7 always-on rules, 2 profile paths,
`design-diagrams.md`):

| Case | exit | emitted lines | resolution |
|---|---|---|---|
| no `CLAUDE.md` at all | 0 | 10 | both families `en` |
| `CLAUDE.md` present, no matching line | 0 | 10 | both families `en` |
| `CLAUDE.md` present, `chmod 000` | 0 | 10 | both families `en` |

The unreadable case still reaches the `[ -f ]` guard, then `grep` fails with its stderr
suppressed and prints nothing; the pipeline's status is `sed`'s, which is 0 on empty
input, and the empty `*)` branch of the `case` is 0 as well. No emission was truncated in
any of the three.

## Behaviour, measured before and after

Same temp project, the pre-fix extraction restored into a scratch copy of the script for
the "before" column:

| `CLAUDE.md` | before | after |
|---|---|---|
| `**Language:** en` + `**Artifact language:** deutsch` | `default-voice-de` | `default-voice-en` |
| `**Language:** en` + `**Artifact language:** denmark` | `default-voice-de` | `default-voice-en` |
| `**Language:** en` + `**Artifact language:** de-DE` | `default-voice-de` | `default-voice-en` |
| `**Language:** deutsch` (alone) | `chat-voice-de` + `default-voice-de` | both `en` |
| `**Language:** de` | unchanged | `chat-voice-de` + `default-voice-de` |
| `**Language:** de ` (trailing space) | unchanged | `chat-voice-de` + `default-voice-de` |
| `**Language:** de\r\n` (CRLF) | unchanged | `chat-voice-de` + `default-voice-de` |

## The consumer-tightening check

The reviewer flagged that exact matching would flip a project carrying something like
`**Language:** de (Deutsch)`. Grepped every `CLAUDE.md` up to four levels under
`/Users/k1/Projects` (excluding `node_modules`): three declarations exist in two projects,
all of them exactly `de` or `en`. No known consumer changes resolution.

## The unescaped `$label`

Chose the comment over escaping. `$label` is interpolated into two ERE patterns; escaping
it would need a `printf | sed` metacharacter escape, which adds a subprocess and a second
piece of machinery to a private function with two call sites, both fixed literals in this
same file. The docblock now states the constraint on the parameter directly, next to the
parameter, where a future caller reads it.

## Tests

`hooks/lib/__tests__/rules-voice-profile.test.ts`: **16 cases, all green** (was 12).

- Retitled `treats a spelled-out language name as not declared` →
  `treats a capitalised value as not declared, the pattern being case-sensitive`. The old
  title claimed the generalisation; the case only ever pinned the capital `E`.
- Added `deutsch`, `denmark`, `de-DE` on the artifact declaration, and `deutsch` alone on
  the chat declaration (the other direction of the same defect, and the one that drove
  *both* families to German).
- All four new cases were run against the pre-fix extraction and are red there.

None of the 12 existing cases changed behaviour: each carries a value that is either
exactly `en`/`de`, or a value (`xx`, `English`) that the prefix test already rejected.

`rules-emission-golden.test.ts` fails on byte counts for `agent-setup.md` and
`fusion-workbench-conventions.md`. That is the parallel dispatch's rule-text edits, not
this change: the emitted *path list* is identical and no profile path is involved. Golden
not regenerated, `RULE_BASELINE` not touched, per the dispatch.
