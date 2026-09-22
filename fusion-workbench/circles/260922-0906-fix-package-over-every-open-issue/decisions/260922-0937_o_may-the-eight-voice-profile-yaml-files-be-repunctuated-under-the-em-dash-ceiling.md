# May the eight voice-profile YAML files be repunctuated under the em-dash ceiling?

---
**Domain:** data
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260827-1807_*_the-always-on-corpus-and-the-four-profiles-are-over-the-em-dash-ceiling-again-six-days-after-they-reached-it.md, 260922-0922_*_the-51-open-issues-at-451bb312-worked-autonomously-as-one-package.md

---

## Question

Step 16 of the package plan edits the four shipped voice profiles (`stilwerk/*.yaml`) and their four workbench copies (`fusion-workbench/stilwerk/*.yaml`) so that `bin/fusion-prose-metric` reads `ok` on each: the header line's em-dash becomes a colon, C04 and L04 lose theirs, and the AI02 rule's specimen (`Klausel — Jargon — Grund`) is written without the character it bans. The files are data by the routing rule, so the step is an `ontocoder` task, which under `**Mode:** autonomous` is a file-and-skip gate: this record is the question the gate would have put, and the step was skipped. The rule half of the same defect (step 15, the two always-on rule files) lands without it.

## Options

1. **Yes, as the plan writes it** — the eight files take the edit; the workbench copies take it where their checksum still matches the shipped line (`fusion-workbench/.asset-provenance`), and an adapted copy is reported rather than overwritten.
   - Pros: closes the defect on both halves; the profiles stop teaching the mark they ban.
   - Cons: a specimen written without its own pattern is a weaker illustration of the pattern.
2. **Yes for the shipped four, leave the workbench copies** — the project's copies are its own and change at the next `assets` check.
   - Pros: no write into another party's adaptable file.
   - Cons: the workbench copies are what every agent actually loads, so the defect's measured surface stays over the ceiling.
3. **No: the profiles are exempt** — a stylometric profile quotes the register it governs, and the metric should skip it.
   - Pros: no edit; the metric learns a scope rule.
   - Cons: the defect record measured the profiles on purpose as part of the always-on corpus.

## Constraints

Rule identifiers and list order stay unchanged whatever is chosen; `rules-voice-profile.test.ts` reads the profiles and any pinned figure that moves is re-approved on its own line.

## Recommendation

Option 1, the plan's own shape: it is the only one that closes the defect as measured.
