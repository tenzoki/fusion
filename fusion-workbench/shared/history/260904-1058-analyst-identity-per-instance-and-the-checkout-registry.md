# Analyst session: identity per local instance, and whether a tracked checkout registry earns its place

**Date:** 2026-09-04 10:58
**Status:** Complete
**Agent:** analyst (dispatched by orchestrator)
**Domain:** code
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**HEAD at start:** `cda72f71`

## Task

Analyse whether fusion's identity model supports one person working several checkouts across machines with different git configurations, test the user's proposed four-field per-instance registry against that, and produce decidable options. Read-only on the project.

## What was done

Read `bin/fusion-identity`, `bin/fusion-events`, `hooks/lib/events-query.ts`, `bin/monitor`, `bin/fusion-session-mark`, `bin/fusion-commit-lock`, `hooks/hooks.json`, `hooks/session-start.ts`, five rule files, five skill bodies, `agents/orchestrator.md` Setup step 2 and its event-log schema, the project `.gitignore`, and the five prior-art stores named in the report's `## Sources`.

Measured in this tree: `bin/fusion-identity` exit 0 with one person and checkout `5e8248d7`; 280 of 2638 event-log lines carry `person` and `checkout`, each with exactly one distinct value; `$USER=k1`, `hostname=k1i9`; `git check-ignore` over four workbench paths.

## Outcome

The parallel-instance arrangement the user asked for already works and was measured working on 260822. Two defects are real: `presenceReport` counts one person's two git identities as two people, and the checkout identifier describes nothing to anybody. The proposed structure repairs both if read as an attribute table over the two keys that exist, and fails if read as a replacement, because it carries no join column for the records already on disk. `worker-id` does not earn a place as a key and is the only field with a privacy cost.

Four whole options were written, with a recommendation (Option 1: one tracked file per checkout, keyed by the existing eight hex, class R1) and an honest smaller alternative (Option 4).

## Artifacts written

- `260904-1058-identity-per-instance-and-the-checkout-registry.md` (the analysis)
- Three defects: `260904-1058_*_four-tracked-workbench-filenames-are-keyed-by-the-os-account-name-the-identity-decision-rejected.md`, `260904-1058_*_git-clean-deletes-the-checkout-identifier-and-the-next-read-mints-a-new-one-in-silence.md`, `260904-1058_*_cadence-names-its-report-after-one-person-and-reports-every-persons-work.md`
- Four decisions: `260904-1058_*_does-fusion-gain-a-tracked-checkout-registry-and-in-which-shape.md`, `260904-1058_*_is-the-checkout-alias-the-identifier-or-an-attribute-of-the-minted-one.md`, `260904-1058_*_does-a-registry-entry-carry-hostname-account-name-and-folder-path.md`, `260904-1058_*_does-the-identity-helpers-exit-1-halt-survive-a-registry-that-can-name-the-person.md`

## Verification

`bin/fusion-prose-metric` reads `ok` on the analysis and on all seven records. `bin/fusion-citation-check` reports no dangling citation in any of the eight files; the workbench-wide dangling count fell from 253 to 246 as the seven filed records resolved the analysis's forward references. No file outside `shared/analyses/`, `shared/issues/`, `shared/decisions/` and `shared/history/` was written.
