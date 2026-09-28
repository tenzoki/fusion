# Setup Step 5's worked example says this repository counts 88 source files, and the helper beside it returns 118

---

**Severity:** Low
**Domain:** code
**Filed by:** `coderev`, review of `5d29b6d..518926d`, review file `260815-1501-coderev-turn-3-conceptrev-investigator-domain-values.md`
**Owner:** `coder`
**Affects:** `agents/orchestrator.md:178`; echoed in `hooks/lib/__tests__/domain-cascade.test.ts:176` (`SWEEP.code_files`)
**Cross-references:** `260815-1440-coder-step9-domain-values.md`; decision `260809-1731_*_how-should-the-domain-heuristic-count-a-projects-source-files.md`

---

Step 9 rewrote the *"Which project reaches which domain"* paragraph — it had to, because two of the four domains it described were leaving — and carried its worked example through unchanged. The example states a present-tense measurement of this repository that is 30 files low.

---

**Verified 2026-08-15 at HEAD `518926d`**, run from the project root:

```
$ ./bin/fusion-count-sources
code_files=118
data_files=13
counted_by=git-ls-files
```

`agents/orchestrator.md:178` reads:

> **Which project reaches which domain**, with the counts as `bin/fusion-count-sources` returns them. `code` — any tree with source in it (**this repository counts 88 files**, the consuming project above 108); …

The clause is present tense, it names the helper that contradicts it, and it sits eight lines below the code block that runs that helper. An orchestrator at Setup reads the sentence and the output in the same breath.

## Why it is Low and still worth fixing

Nothing decides on it. The verdict comes from the cascade, and 88 and 118 land in the same branch, so no domain changes. What the number does is calibrate a reader: the paragraph's whole job is to say *which shape of project reaches which outcome*, and it does that by naming three real trees (this one, the 108-file consuming project, the 2-against-30 ontology project). A worked example that is wrong about the tree the reader is standing in undermines the other two, which nobody can check.

`hooks/lib/__tests__/domain-cascade.test.ts:176` carries `88` in `SWEEP.code_files` as this repository's anchor value. That one is harmless — a sweep value is not a claim about anything — but it is where the number will be looked up if someone re-measures, so it is named here rather than left to be found later.

## Fix

Re-run `./bin/fusion-count-sources` and write what it returns. Both figures, not just the source count: the paragraph's `data` clause is argued from a ratio and the repository now counts 13 data files, which the sentence never mentions. Consider adding the date the measurement was taken, the way the `RULE_BASELINE` entries in `hooks/lib/__tests__/rules-emission-golden.test.ts` carry `// 2026-08-14 arming` — a dated figure ages honestly, an undated present-tense one does not.

**Do not** turn the example into a derived count. It is prose in a prompt, there is no mechanism to derive it into, and inventing one for a calibration figure would be the additive workaround `rules/critical-stance.md` §2 names.

---

**Reconciliation 260815-1913 (reconciler, HEAD `9306f0a`) — still open, and the gap has changed size
rather than closed.**

`agents/orchestrator.md:187` (was `:178` when this record was filed) still reads *"this repository
counts 88 files"*. Re-run from the project root at HEAD:

```
$ ./bin/fusion-count-sources
code_files=111
data_files=12
counted_by=git-ls-files
```

The example is now 23 files low rather than 30. The helper's answer moved because this Circle
deleted source files, which is the point the record makes about a hand-written present-tense
measurement inside a prompt: it decays without anyone touching it, and no gate reads it. The echo
in `hooks/lib/__tests__/domain-cascade.test.ts:114` (`code_files: 88`) is a fixture and is
unaffected — it exercises the cascade's arithmetic and does not claim to measure this repository.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). Unchanged, and the number has now decayed in the other direction — which is the record's actual thesis, demonstrated a third time.**

`agents/orchestrator.md:187` still reads *"this repository counts 88 files, the consuming project above 108"*. Measured beside it:

```
bin/fusion-count-sources
  code_files=98
  data_files=10
  counted_by=git-ls-files
```

The gap has been 30, then 23, and is now 10 — the sentence never moved and the tree moved three times, once toward it and twice away. The `data` clause still states no figure at all, so the worked example illustrates one half of a two-input heuristic.

A hand-written count of a directory every session writes to is wrong the day after it is written; `CLAUDE.md` has twice removed such a figure rather than re-measuring it, and that is the remedy this line wants. The example does not need the number to work — it needs the shape.

---
Resolved: fixed — the worked example drops this repository's number and keeps the shape, the remedy the 260819 note asked for; agents/orchestrator.md:195
