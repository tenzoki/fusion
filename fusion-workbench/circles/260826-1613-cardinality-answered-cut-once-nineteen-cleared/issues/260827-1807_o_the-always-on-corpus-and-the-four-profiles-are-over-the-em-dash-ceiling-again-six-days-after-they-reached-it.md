The always-on corpus and the four profiles are over the em-dash ceiling again, six days after they reached it

---
The six files the style-rules Circle repaired to 8 prose em-dashes over 13 292 words (`ff8d15e`, 2026-08-21) read 38 over 10 722 at HEAD `0fb5085`, permitted 10; the four shipped profiles read 14 over 1 256, every file `over`. Nothing reported it, because `bin/fusion-prose-metric` reports and never gates.
---
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Cross-references:** `circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/analyses/260827-1807-the-style-rules-spec-measured-against-the-tree.md` (rows C3.1, C3.6 and the corpus table); `circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2249_*_spec-style-rules-arrive-and-get-measured.md` C3; `shared/issues/260816-0740_c_the-always-on-rule-corpus-runs-at-sixteen-times-the-em-dash-ceiling-it-states.md` (the record this reopens the substance of); `circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260820-2314_o_is-the-em-dash-ceiling-read-per-file-or-across-the-always-on-corpus.md`

## Evidence

`bin/fusion-prose-metric` over `rules/agent-setup.md rules/fusion-workbench-conventions.md rules/decision-record-examples.md rules/user-facing-output.md rules/critical-stance.md fusion-workbench/stilwerk/chat-voice-de.yaml` at HEAD:

| File | em-dash | words | /1000 | permit | verdict |
|---|---|---|---|---|---|
| `rules/agent-setup.md` | 2 | 560 | 3.6 | 0 | over |
| `rules/fusion-workbench-conventions.md` | 15 | 6776 | 2.2 | 6 | over |
| `rules/decision-record-examples.md` | 0 | 332 | 0.0 | 0 | ok |
| `rules/user-facing-output.md` | 15 | 1264 | 11.9 | 1 | over |
| `rules/critical-stance.md` | 1 | 1568 | 0.6 | 1 | ok |
| `fusion-workbench/stilwerk/chat-voice-de.yaml` | 5 | 222 | 22.5 | 0 | over |
| total | 38 | 10 722 | 3.5 | 10 | over |

The set `bin/fusion-rules coder` emits at HEAD is four of these (`user-facing-output.md` and `decision-record-examples.md` are conditional since 260827): 23 over 9 126, permit 9, over.

Where the marks came back, `git show <c> -- <six files>` counted on added and removed lines: `6d72981` +21/−11 (the style diet, 2026-08-27 09:36), `265a86f` +7, `01964e4` +5/−3, `9c056b6` +3, `ae00e84` +3/−4, `43cdde6` +2, `9aa8ecf` +2/−3.

Prose sites at HEAD in the two files still on the floor: `rules/fusion-workbench-conventions.md:176,197,199,207,210,211,212,238,246,266,273,274,276,278,400,417,421`; `rules/agent-setup.md:48,56`. The profiles: `stilwerk/chat-voice-de.yaml:1,11,16,23` and the same entries in the other three.

## Acceptance

`bin/fusion-rules coder | xargs bin/fusion-prose-metric` and `bin/fusion-prose-metric stilwerk/*.yaml` both print `ok` in every row, under the per-file reading the orchestrator recorded in spec correction 3 (`260820-2249_*_spec…:628-629`), with the token-stream evidence the first repair carried (history `260821-0217`, `260821-0242`). Whether the protocol's post-repair window boundary moves with this repair is decided before the repair lands, not after.

**Severity:** Medium. No malfunction; the corpus every agent reads carries the register its own rule forbids, at 3.5 per 1000 against a ceiling of 1.

**Found by:** analyst, plan step 6 measurement, HEAD `0fb5085`.
