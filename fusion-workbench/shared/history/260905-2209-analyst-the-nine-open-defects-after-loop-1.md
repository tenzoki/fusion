# Analyst: the nine open defect records after loop 1, and what loop 2 should do

**Status:** Complete
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Date:** 2026-09-05 22:09
**HEAD:** `e9bd3e53`
**Session:** `260905-2008-orchestrator-session.md`
**Report:** `260905-2158-the-nine-open-defects-after-loop-1-and-what-loop-2-should-do.md` in the shared analyses store

## Task

Decision support standing in for the consultant, which the orchestrator does not dispatch. Assess the nine open defect records at the end of loop 1, test the reconciliation's grouping rather than adopt it, and say what loop 2 should do. Read-only on every record and on all code.

## What the pass produced

The reconciliation reported seven of the nine as unmovable by any dispatch. Four of those seven are movable, and the misclassification runs in one direction only.

Verdicts on the four records characterised as stating a defect and stopping:

- `260830-2235_*` cannot be decided as posed. Its acceptance demands different verdicts for two textually identical tokens. The change of mechanism is to detect at write time rather than at scan time, and the tracker already speaks on a narrow PostToolUse trigger for review files.
- `260830-2247_*` contains a disjoint cut it does not propose: a letter-run fragment before a stamp is decidable, a foreign path segment is not, so a fourth repair class plus a written git remedy meets both halves of the acceptance.
- `260830-2254_*` is decidable. A writer-supplied qualifier is the third instance of a pattern the grammar already runs twice, in `inAnnouncedIllustration()` and `inFooterTemplateSpan()`.
- `260831-0748_*` is not undecidable at all. Branch one is a two-character edit to one constant; branch two is one documentation edit. The census below says which to take.

## Measurements taken at HEAD rather than read off a record

- Hook-test surface: 21 023 lines against a floor of 20 766 and head-room 2 500, so **2 243 lines remain**. The room exists; the cut the record names did not happen.
- Bracket-marked storeless citation tokens: 129 in the `.md` corpus, 104 of them in bare prose, of which **99 would enter the checker's corpus and 13 the blocking gate**. No bracket-marked file exists on disk.
- Head-field whole-value `stamp-name` lines: 253 outside `archive/`, 296 including it, across nine labels. The decision record's figure was 249 over eight.
- September `**Filed by:**` attribution: 99 records, 93 with a person half (84 mandated form, 9 parenthesised), 6 with none, all six session-history entries. One of the six was written by this session during loop 1.
- The exemption chain in `hooks/lib/citation-scan.ts` runs ten reasons. The reconciliation note appended to `260830-2254_*` says seven and lists nine.

## Verification

- `bin/fusion-prose-metric` on the report: 0 em-dashes over 4 565 prose words, permit 4, verdict `ok`.
- `bin/fusion-citation-check` after the report landed: `dangling=301 store-prefixed=395 edited-violations=0 verdict=clean`, identical to the reconciliation's reading, so the report contributes no violation row. Two store-prefixed citations of its own were caught and corrected before this entry was written.
- `bin/fusion-citation-sweep --dry-run`: `files=0 rewrites=0`.
- No record, decision, plan or source file was edited. The two files written are the report and this entry.
