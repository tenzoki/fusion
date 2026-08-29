# The `SegmentJoiner` docstring says both shapes are open, and cites the decision by a filename that no longer exists

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, incremental review of `4f1007f`
**Affects:** `hooks/lib/shell-parse.ts:128-131`
**Kind:** Became false in `4f1007f`. Reported by that Turn's implementer as out of scope and left for filing.
**Cross-references:** `260804-0836_*_…` and `260804-0837_*_…` (the two shapes, both now closed); `260804-0947_*_…`; `260804-1221_*_…` (the same file, the same class).

---

## What is wrong

`hooks/lib/shell-parse.ts:124-132`, the `SegmentJoiner` docstring:

```
 * 2. **`&&` guarantees the AND-OR LIST to its left, not the previous
 *    SEGMENT.** A flat list evaluates left to right, so `A || B && C` is
 *    `(A || B) && C` — reaching `C` proves the list returned zero and says
 *    nothing about whether `B` ran. `|` does not reach past `&&` either, and a
 *    pipeline element runs in a bash subshell. A consumer that reads this field
 *    as "the previous segment ran" is wrong in both shapes; both are open and
 *    argued in
 *    `circles/260801-1244-guard-rules-write/decisions/260804-0947_o_should-the-joiner-be-consulted-for-the-segment-that-moves-as-well-as-the-one-that-writes.md`.
```

Two things are false at HEAD `4f1007f`:

1. **"both are open".** Both are closed. `true || cd build && rm rules/x.md` and
   `echo hi | cd build && rm rules/x.md` deny — measured through the real guard subprocess
   in a fresh project, with the shell effect measured separately in the shell that performs
   each write (bash deletes the file for both; zsh for the `||` row only). The issues carry
   `_c_`.
2. **The citation names `260804-0947_*_…`.** The record is at `_i_` and the file is
   `260804-0947_*_should-the-joiner-be-consulted-for-the-segment-that-moves-as-well-as-the-one-that-writes.md`.
   The `_o_` path does not resolve. This is the class
   `260802-1740_*_a-citation-path-carrying-a-state-marker-dies-on-ordinary-progress.md`
   already describes.

Everything else in the paragraph is true and worth keeping: the grammar statement, the
precedence, and the warning to a consumer.

## Why it is filed rather than fixed

The Turn 9 task scoped `hooks/lib/shell-parse.ts` out explicitly ("beyond reading it"), and
the implementer reported the sentence rather than editing it. That is the right call and the
reason this record exists: a reported-but-unfiled finding lives only in a session history,
which is not a surface anyone scans before the next session.

## Recommended fix

Replace "both are open and argued in" with a statement of where they landed — both closed by
the joiner table in `bash-mutation-guard.ts`, and the consumer warning still standing because
the field itself still means only what it says. Cite the decision without the marker segment,
or by its directory-stable prefix `260804-0947_*_should-the-joiner-be-consulted-for-the-segment-that-moves-as-well-as-the-one-that-writes.md`.

Worth taking together with `260804-1221_*_…`, which is a second thing wrong in the same file
and would otherwise be two passes over one docstring region.

## Anti-vacuity

None available as a test — this is a comment with no behaviour. The only real control is the
one the reconciliation already named: a claim in a docstring about what is open must be run
before it is written, and re-run when the thing it names closes.

## Origin

Reported in `260804-1200-turn9-t9-1-the-joiner-for-the-segment-that-moves.md`
§ "Findings to report, none of them fixed here"; confirmed here by reading the file at HEAD
and by resolving the cited path.

---

**Step 3 disposition (coder, 2026-08-05) — A-shaped, foreign file. STAYS `_o_`.**

Branch A in kind, twice over — a docstring says two closed shapes are open, and cites a
record by a path that does not resolve — and both sentences are in
`hooks/lib/shell-parse.ts`, which step 3 does not own. This step changes no source comment.

One of the six findings whose shape the plan's rule has no branch for; reported to the
orchestrator as such.

**Where it is answered.** `260804-1205-shell-reachability-model` restructures this
exact file by its own Directive, and this issue's own § Recommended fix asks that it be
taken together with `260804-1221_*_the-one-fact-about-a-joiner-guarantee-is-asserted-over-one-file-and-a-second-file-already-holds-the-same-fact.md`, which is a second thing wrong in the same docstring
region. Both are now routed to the same place for the same reason, so the "two passes over
one docstring region" this issue warns about does not happen.

The marker-in-a-citation half is the class
`260802-1740_*_a-citation-path-carrying-a-state-marker-dies-on-ordinary-progress.md`
describes, and it stays that record's to generalise.

---
Resolved: Der Gegenstand existiert nicht mehr. `hooks/lib/shell-parse.ts:128-131` trägt keinen `SegmentJoiner`-Docstring mehr, weil `SegmentJoiner` mit `ba7ccda` aus der Datei entfallen ist — der Schnitt ließ nur stehen, was `git-branch-guard.ts` und `command-word.ts` importieren. Am Baum nachgeprüft in der Reconciliation 260807-1515 gegen HEAD `e684eae`: kein Treffer für `SegmentJoiner` außerhalb `hooks/dist/`. Die verwesende Zitierform, die dieser Befund als zweiten Punkt nennt, ist inzwischen an anderer Stelle als Konvention gelöst (`260806-0015_*_zitierform-fuer-workbench-records.md`, Wildcard-Form) und durch `hooks/lib/__tests__/reference-resolution-lint.test.ts` maschinell geprüft.
