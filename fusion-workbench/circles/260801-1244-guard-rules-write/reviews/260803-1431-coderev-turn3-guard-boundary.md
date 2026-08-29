# Code review — Turn 3, guard rules-write boundary

**Sender:** coderev
**Circle:** `260801-1244-guard-rules-write`
**Scope:** `c9bf59e..242b723`, excluding `fusion-workbench/` — 13 files, 5 commits
**Method:** every claim below was run against the compiled guard as a subprocess through
`hooks/lib/__tests__/helpers/guard-harness.ts`, one throwaway project per row. Suite
re-run independently: **1080 passed, 23 files** (`vitest run`, no `tsc` step, so the
tracked `hooks/dist/` was not touched).

---

## Summary

One finding, High, filed. The three questions the Turn asked me to answer come back
**yes, yes, and yes** — the refusal-reason mechanism leaks nothing, `coerceState` fails
closed on every dimension that matters, and gate 0 does what its own tests say it does.
But gate 0 is **not** complete against its class: the `..` it refuses is the operand's,
and a `..` inside a `cd -P` operand reaches the same escape by the same mechanism, one
layer to the side rather than one layer down. Everything else in the Turn is sound.

**Totals:** Critical 0 · High 1 · Medium 0 · Low 0.

---

## The three questions

### 1. Is gate 0 complete against its class? — No.

Both call sites are correct. `guard.ts:748-750` passes `rawFilePath`, the untouched tool
input, alongside the collapsed `filePath`; `guard.ts:400-402` hands the classifier
`isExemptRulePath` unchanged and the classifier supplies `Target.spelled`. There is no
third path into `isProjectRulePath` — `rulesWriteRefusal` is reached from
`isProjectRulePath`, `rulesWriteRefusalNote` and nowhere else, and both of those are
reached only through `guard.ts:129` and `guard.ts:148`. The required-argument shape does
what its history claims: a call site cannot lose the gate by defaulting it.

The gap is in what `spelled` contains on the Bash surface. It is
`joinCwd(base, value)` (`bash-mutation-guard.ts:1190`), and `base` has already been
through `normalizePath` in `resolveDir` (`:1143`). For a plain `cd` that collapse is
faithful, because bash's `cd` is logical and collapses `..` textually too. For `cd -P`,
`set -P` and `pushd -P` bash resolves physically, and `firstDirArg` skips `-P` as a flag
(`:1232`) and models it logically anyway.

Measured, `rules/L -> ../agents` planted, flag set:

```
  cd -P rules/L/.. && rm agents/coder.md      guard: allow   bash: agents/coder.md DELETED
  cd -P rules/L/.. && echo pwned > …          guard: allow   bash: OVERWRITTEN
  same commands, flag unset                   guard: DENY
```

Reach is the whole protected list (`agents/**`, `skills/**`, `rules/**` all measured).
Filed as
`260803-1431_*_gate-0-misses-the-dotdot-in-a-cd-p-operand-so-a-planted-link-still-spends-the-grant.md`,
severity High, with the reasoning for High rather than Critical written into the record:
the exploit needs the flag twice, and the no-flag planted-alias residual this Turn
documented already reaches the same files. What it breaks is the invariant, not the
attacker's ceiling.

Three shipped docstrings assert the closed form and are false as written —
`bash-mutation-guard.ts:296-300` ("the only way to traverse a planted link without naming
it"), `rules-write-exemption.ts:69-71` ("complete against the class BY INSPECTION"), and
`MutationOptions.exempt` at `:213-215`. They are named in the issue rather than filed
separately: they are the same fix's documentation, and splitting them would be padding.

The gates that hold, measured on the same plant: the operand spelling
(`rm rules/L/../agents/coder.md`, `cd -P rules/L && rm ../agents/coder.md`) denies on gate
0; `cd rules/L && rm coder.md` denies on gate 2; plain `cd rules/L/..` allows but bash
leaves the file intact, so the classifier is faithful there.

### 2. Does the refusal-reason mechanism leak a grant? — No.

Verified in code and by measurement. `rulesWriteRefusal` tests gate 1's membership before
gate 0's spelling (`rules-write-exemption.ts:361-368`), and `rulesWriteRefusalNote`
returns null for `not-a-rule-path` (`:429`). `exemptionRefusalNote` returns null whenever
the flag is unset (`guard.ts:147`). On the Bash side the note is computed only inside
`refusalNoteFor`, only for an operand `exempt` was already asked about, and only while a
deny is being rendered (`bash-mutation-guard.ts:1353-1360`).

```
  Edit agents/coder.md, flag SET vs UNSET   reason strings identical: true
  Edit rules/x.md (hard-linked), flag SET   deny + hard-link note
  rm -rf rules, flag SET                    deny, no note          (documented decision)
  rm rules/retired/../x.md, flag SET        deny + gate-0 note, before the STOP sentence
```

The notes tell an agent nothing it should not know. Only the gate-0 note names an action,
and it is reached only after gate 1 proved the path really is a rule file the flag covers.
The other three end in "Rewriting the command will not help — ask the user", and
`refusal()` places all of them ahead of `NO_WORKAROUND` (`bash-mutation-guard.ts:668-686`)
so the cause is read before the instruction, not after it.

One observation, not a finding. A non-exemptible verb gets no note either
(`refusalNoteFor` returns null when `exemptible` is false), so `ln -s ../agents rules/L`
with the flag set is a bare protected-path deny, while the rephrase `cp -P stage/L
rules/L` succeeds. That asymmetry is the stated bound of `exemptible: false` and is
written down at `VerbSpec.exemptible`; it is not new this Turn. It is worth knowing that
it is the plant step of the finding above.

### 3. Does `coerceState` fail closed? — Yes.

Measured across seven malformed files, both surfaces:

```
  escalation.json                     Bash rm notes.txt   Edit agents/coder.md
  {haltActive:true, recentEvents:{}}  DENY [HALTED]       DENY
  {haltActive:true, recentEvents:null} DENY [HALTED]      DENY
  {haltActive:"true", recentEvents:[]} DENY [HALTED]      DENY
  {haltActive:true, junk keys}        DENY [HALTED]       DENY
  {consecutiveBlocks:"2"}             allow (unhalted)    DENY
  [{haltActive:true}]  (array)        allow (unhalted)    DENY
  "haltActive"         (string)       allow (unhalted)    DENY
```

A file that **was** recording a halt cannot lose it to a shape error, as long as it is an
object — every object row above preserves `haltActive` through `Boolean(raw.haltActive)`.
The two rows that lose the halt are a JSON array and a JSON string, and `saveEscalation`
can never write either: it stringifies an object. So the only way to reach those rows is
external corruption or a hand edit, and the pre-fix behaviour for exactly those inputs was
a fail-open allow on the whole protected list. Strictly better, and the protected-path
deny holds on every row.

The write path afterwards is safe. On the halt route nothing is saved (by design — the
halt is not a fresh violation), so the malformed file survives untouched. On the deny
route `recordBlock` + `saveEscalation` replace it with a well-formed file carrying the
coerced values, which is the intended repair. The one real loss is the content of a
malformed `recentEvents`, which is a log, not a control.

---

## Everything else checked

**`bin/monitor` (`aff7486`).** The two-budget split is correct and the early return for
the no-advisory case genuinely preserves the old array rather than approximating it. Four
new cases drive the real binary over HTTP, which is the first executable coverage this
file has had. One narrow caveat, not filed: `merged.sort(key=lambda e: e.get("ts") or "")`
raises `TypeError` if any event line carries a non-string `ts`, where the old code never
looked at `ts` at all. Only the guard writes that file and it always writes
`Date.toISOString()`, so the input does not exist today.

**Documentation (`ce7a125`).** Every behavioural claim in the two rewritten passages was
re-run rather than read. All hold:

```
  under a halt: rm notes.txt DENY[HALTED] · echo hi > out.txt DENY[HALTED]
                rm rules/x.md DENY[HALTED] · cat/ls/git status/git diff allow
                git switch main DENY (branch policy, not the halt)
  the alias residual: ln -s … build/alias allow · cp -l … build/hardalias allow
                      echo pwned > build/alias allow · Edit build/alias allow
  spot-checks: git checkout HEAD -- rules/x.md allow · rm -rf hooks DENY
               cp /tmp/x hooks/ DENY · echo 'rm -rf rules/' allow
```

`rules/protected-path-discipline.md` loads into every agent in every consuming project, so
I read the whole file rather than the diff. It is accurate apart from the two "there is no
override for a protected-path shell write" sentences, which are false at HEAD and are
already tracked — plan Step 9 plus the open
`260803-1402_*_step-9-must-also-document-that-a-hard-linked-rule-file-is-not-exempt.md`.
Not refiled. Note that the new `cd -P` finding is not covered by the residual list either;
the nearest entry, "the classifier cannot walk out and back by name", is a different
mechanism.

**Known open, deliberately not refiled.** `260802-2320_*_case-folding-bypasses-the-entire-protected-list-on-a-case-insensitive-filesystem.md` (case folding), `260803-1251`
(`fs-locator.absolute()`'s lexical collapse), `260803-1352` (two unclamped advisory
details — confirmed still present at `guard.ts:519` and `guard.ts:548`), `260803-1402`
(Step 9 documentation). The stale committed `hooks/dist/` is Step 10's and is named in the
plan's own risk table; I confirmed it is stale (fresh `tsc` differs from `dist/guard.js`,
`dist/lib/bash-mutation-guard.js`, `dist/lib/escalation.js`) and left it alone.

---

## Verdict

**Sound enough to build on.** Four of the five commits close what they claim to close, and
the two mechanisms most likely to be wrong in the way the previous Turns were wrong — the
refusal note and the state coercion — are right. The boundary has moved once more, but
sideways rather than downwards: the same class, entered through the `cd` instead of the
operand, with the same fix shape available (narrow the grant, do not widen the resolver).
That is a smaller step than lexical grant → canonicalise → filesystem → `..` collapse, and
it does not put the Turn's other work in doubt.

**Recommended sequencing.** The `cd -P` finding is a release blocker for the flag, not for
the Turn: it is inert in any project that never sets `FUSION_ALLOW_RULES_WRITE`. Land it
with the three docstring corrections before Step 9 writes the flag into the shipped
documents, so the user-facing text is not written against a boundary that is about to
move again.

---

**Reconciliation 260803-1516 (reconciler, domain `code`) — findings and citations confirmed. No content rewritten.**

Every code citation in this review was re-read at HEAD `fa81589` and every one resolves to what the review says is there: `hooks/lib/bash-mutation-guard.ts:296-300`, `:213-215`, `:1190-1191`, `:1133-1144`, `:1232`, and `hooks/lib/rules-write-exemption.ts:69-71`, `:361-368`, `:429`. The three docstrings the review calls false as written are unamended.

The suite figure was reproduced independently rather than taken on trust: `cd hooks && npx vitest run` → **1080 passed, 23 files**, exit 0, `hooks/dist/` untouched. Same method the review used, same result.

The two line numbers this review reports for the unclamped advisory details (`guard.ts:519`, `guard.ts:548`) are correct, and they disagree with the issue that filed the defect. `260803-1352_*_…` has been annotated with the correction.

**Status of the four items listed under "Known open, deliberately not refiled":** all four are still open, and each now carries reconciliation evidence — `260802-2320_*_case-folding-bypasses-the-entire-protected-list-on-a-case-insensitive-filesystem.md` (case folding, direction now decided, bypass still live), `260803-1251` (`fs-locator.absolute()`, confirmed still unreachable), `260803-1352` (unclamped advisory details), `260803-1402` (Step 9 documentation). Nothing was closed by accident and nothing was duplicated.

The High finding `260803-1431` is open and unaddressed. The recommended sequencing — land it before plan Step 9 writes the flag into shipped documents — has been recorded on the plan's Step 9 as part of a `[SCOPE CHANGED]` note.
