The final-measurement note means two different sets by "always-on", and its headline delta is the smaller one

---
Section 4 of `fusion-workbench/circles/260820-2051-style-rules-arrive-and-get-measured/history/260821-0350-coder-the-final-state-is-measured.md` reports the Circle's
always-on byte delta as **+2 138** over five rule files. Section 5 of the same note reports a corpus
of six files and calls it "always-on total, as `bin/fusion-rules coder` emits it". Neither section
says the two sets differ. What a `coder` dispatch actually gained is **+2 265**.

---
**Found by:** reconciler, final reconciliation of `circles/260820-2051-style-rules-arrive-and-get-measured`, 260821-0413,
re-measuring the note's own figures independently.
**Owner:** `coder`, which wrote the note. An appended clause, not a rewrite: the two figures are
both correct for their own set and the note's section 4 header does name its set.
**Severity:** Low. No number is wrong and no bound is affected. The cost is that this is the fault
class the Circle was opened on, recurring inside the Circle's own closing artifact.
**Filed in the active Circle** per the Origin Rule.
**Cross-references:**
`shared/issues/260816-1345_*_the-register-defects-corpus-table-is-labelled-always-on-and-is-not-the-always-on-set.md`
(the same fault, one Circle earlier, closed by plan step 15 of this Circle);
`circles/260820-2051-style-rules-arrive-and-get-measured/issues/260820-2249_*_the-always-on-corpus-is-said-to-have-grown-by-a-file-that-is-emitted-to-no-agent.md`
(the same fault again, closed by the same step).

## Verified at HEAD `247abfe`

Measured over `7135a19..HEAD`, twice, by two readers independently:

```
five plugin rule files          92 869 -> 95 007   +2 138
the six files fusion-rules
  coder emits (the five plus
  fusion-workbench/stilwerk/
  chat-voice-de.yaml)          100 222 -> 102 487  +2 265
```

The difference is the workbench chat profile, 7 353 to 7 480 bytes, +127, which this Circle changed
in four commits (`5ed284d`, `403b91a`, `ca83e79`, `02ea2bd`) and refreshed into the workbench
in `7832553`.

The growth bound is unaffected either way: `hooks/lib/__tests__/rules-emission-golden.test.ts` puts
the `stilwerk/` profiles out of its scope by construction, so the 3 566 bytes of always-on head-room
the note reports is the right number for the bound it belongs to.

## Why this is worth a record rather than a footnote

The Circle's plan step 15 closed two records for stating the always-on set as a list instead of as a
derivation, and wrote the derivation into four live carriers. The derivation has two parts, the
unindented `emit_if_exists` calls **and** the unconditional `emit_voice_profile` call, and the
second part is exactly what section 4 drops. A reader who takes +2 138 as "what the Circle added to
what every agent loads" is out by 127 bytes for the same reason every earlier reader was out: the
set was written down rather than derived.

## Fix direction

One appended clause on the note: that section 4's figure is the five plugin rule files, that the
emitted set is six and gained +2 265, and that the bound reads the five. Nothing above it changes.
