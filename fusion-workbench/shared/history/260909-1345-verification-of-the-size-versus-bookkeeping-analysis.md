# Verification pass over the size-versus-bookkeeping analysis

**Date:** 2026-09-09 13:45
**Agent:** analyst
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Status:** Complete

## What was asked

Verify `260909-1047-size-versus-bookkeeping-across-three-projects.md` in depth, re-derive every load-bearing figure independently, audit the reasoning apart from the arithmetic, check every cost attributed to a named mechanism against the plugin source, and name what the same sources would have supported and the report does not say.

## What was done

All three pins resolved and all three trees were reachable, so nothing rests on an unreachable source. Two independent re-derivations were dispatched to agents that were not shown the report, one over the git commit histories and one over the record corpora and event logs, both pinned. The mechanism checks against `bin/fusion-rules`, `agents/*.md`, `skills/*/SKILL.md` and the growth-bound test were done directly.

Sixteen figures reproduced, fourteen were corrected, six could not be checked and are named as such, four conclusions were restated in the weaker form the evidence carries, and six costs the same sources support were added. The report's spine held: bookkeeping does not vary with project size, the phase ledger reproduces to the byte, the wall-clock model lands within four hours in 976. Its causal claim did not: neither of the two designs it offers separates fusion's conditioning load from file size, and the one natural experiment is confounded in the direction that explains the whole result.

The finding that most affects a planned cut is not in the report at all. Thirteen days after the 2026-08-27 cut, the path a coder dispatch reads is 29 percent heavier than at the bottom, and the hard growth bound that was meant to hold it measures the universal core while the growth went to two conditional emissions it does not see.

## Products

- `260909-1345-verification-of-the-size-versus-bookkeeping-analysis.md` in the shared analysis store
- Five issue records: `260909-1345_o_`, `260909-1346_o_`, `260909-1347_o_`, `260909-1348_o_`, `260909-1349_o_`

The analysis under review was not edited. No code, data, prompt or rule file was touched.
