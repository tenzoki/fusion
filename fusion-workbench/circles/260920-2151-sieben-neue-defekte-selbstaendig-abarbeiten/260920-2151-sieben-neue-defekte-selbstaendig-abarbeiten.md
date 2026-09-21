# Die sieben neuen Defekte aus dem Paket 260918-1048 selbständig abarbeiten

---
**Domain:** code
**Status:** done
**Claim:** 5e8248d7 — Kai Stalmann <ks@qantr.com>, 260920-2222
**Active spec/plan:** 260920-2228_*_seven-new-defects-worked-autonomously-with-a-second-opinion-each.md (the plan; no spec, planned from the directive)
**Cross-references:** 260918-1048-defekte-selbstaendig-abarbeiten-mit-zweitmeinung.md
**Filed by:** user, Kai Stalmann <ks@qantr.com>
---

## Directive

Die sieben neuen Defekte aus dem Paket 260918-1048-defekte-selbstaendig-abarbeiten-mit-zweitmeinung selbständig abarbeiten, nach demselben Muster (Konzept, Zweitmeinung, Fix, ein Commit je Defekt, nichts pushen): 260918-1206_*_the-new-agent-registration-step-points-at-a-claude-md-listing-bullet-that-no-longer-names-any-agent.md, 260918-1234_*_the-archive-body-reads-a-rule-through-the-source-root-with-no-unresolved-branch-and-no-do-not-improvise-rule.md, 260918-1250_*_the-dispatch-path-baseline-fixture-says-fifteen-rows-below-while-it-holds-eleven.md, 260918-1334_*_the-review-coverage-cli-header-names-step-3c-and-phase-4-which-the-orchestrator-prompt-does-not-have.md, 260918-1335_*_the-live-state-comment-keeps-two-retired-rows-for-a-consequence-classify-cannot-produce.md, 260918-1409_*_the-live-state-list-claims-class-l-in-full-while-two-class-l-entries-classify-as-unclassified.md, 260918-1410_*_the-dispatch-parameters-section-describes-three-retired-parameters-as-live-and-five-of-its-line-citations-are-stale.md

Versionsnummer am Ende erhöhen. Strukturdaten trotz des JSON/YAML-Ausschlusses bearbeiten.

---
Closed 260921-1048: done. Commit range `80bebc96..057e0393`: seven defects fixed one commit each (`c257731d`, `03e754bf`, `5abadf32`, `258d5dae`, `97651091`, `d5e2de65`, `ae60c939`), the version bump `9c7101aa` (11.8.1), and two commits outside the directive that the user ordered mid-session after naming the gate stops as a defect: `8ef78ffc` (the `**Mode:** autonomous` field, decision `260921-0842_*_how-does-a-work-item-tell-the-orchestrator-to-work-it-without-asking.md`, implemented) and `057e0393` (its gate clause repaired after review). The plan `260920-2228_*_seven-new-defects-worked-autonomously-with-a-second-opinion-each.md` is complete at 8 of 8 steps; the second opinion rejected no package concept and rejected the mode concept once, which was reworked. All ten clauses of `## Where this work stops` hold, confirmed by the user at the closing gate. Review coverage: `260921-0822-reviewer-closing-pass-over-the-seven-fix-package.md` (`b30ec2ea..9c7101aa`) and `260921-1035-reviewer-mode-autonomous-field-against-its-decision.md` (`9c7101aa..8ef78ffc`), both `**Not-opened:** none`; `057e0393` is uncovered, a repair whose concept a consultant read accepted, named here as the gap. Left behind for follow-on work, all in this container's issues store: `260921-0709_*` (the lib review-coverage header's dead addresses), `260921-0807_*` (list ⊆ rule unpinned; the layout tree's uneven naming of the classifier), `260921-0822_*` (the class L comment overstates what the case catches), `260921-1035_*_the-memo-skill-writes-mode-autonomous-…` and `260921-1035_*_the-working-model-doc-…`; the `portfolio.md` leftover hint for `docs/upgrading-to-v11.md` `### 5`; and, in the container of `260918-1048`, its two 260920 text defects and the eighteen records its plan lists under `## Already resolved at HEAD`. Nothing pushed. Ruled by user, Kai Stalmann <ks@qantr.com>.
