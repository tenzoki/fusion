# Coder session: `bin/fusion-checkout-name`, plan step 2

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Circle:** 260904-1619-tracked-checkout-registry-names-each-instance
**Measured at:** HEAD `e2a66a12`

## What was read

Step 2 of `260904-1651_*_the-checkout-registry-names-each-instance-and-joins-one-persons-identities.md` in full, plus its `## Approach` → `### The mechanism` and `## Data Structures`; the answered gate `260904-1058_*_does-a-registry-entry-carry-hostname-account-name-and-folder-path.md` (option 1) and `260904-1058_*_is-the-checkout-alias-the-identifier-or-an-attribute-of-the-minted-one.md`; `bin/fusion-identity` and `bin/fusion-cadence-anchor` for shape; `renderParty` and `flattenField` in `hooks/lib/events-query.ts` for the field-flattening rule; `hooks/lib/__tests__/fusion-identity.test.ts` for the test shape; the `bin/` roster gates in `committed-dist.test.ts`, `derivable-enumerations-lint.test.ts` and `reference-resolution-lint.test.ts`.

## What was produced

Four files, and no fifth.

- `bin/fusion-checkout-name` — new, bash, executable, self-contained. Four subcommands (`resolve`, `roster`, `suggest`, `register`), five exit codes, the store at `fusion-workbench/shared/checkouts/<8hex>.md` created on the first `register` and never otherwise. It resolves the workbench through `bin/fusion-workbench-root` and this checkout's hex through `bin/fusion-identity`, and calls nothing that calls it. The header is the authoritative documentation: usage, the exit table, the entry grammar with a worked example, and the three reasons (alias as attribute, collision reported not enforced, no substituted value on a resolution failure).
- `hooks/lib/__tests__/fusion-checkout-name.test.ts` — new, 168 lines against the 170-line cap, 9 cases driving the real script against throwaway workbenches.
- `.gitignore` — one `!bin/fusion-checkout-name` line.
- `CLAUDE.md` — one Layout-table row.

## What step 1's answer changed in the written code

Option 1, never written. There is no `**Worker:**` field, no `--worker` flag, and no `worker=` line; `register` takes `[--alias A] [--person P]` and nothing else. Nothing in the header, the worked example or the test fixtures carries a hostname, an operating-system account name or a folder path — every example value is synthetic (`3f9a1c07`, `amber-harbor`, `Ada Example <ada@example.invalid>`). One test asserts the written entry contains no `worker` at all, so the absence is pinned rather than merely current.

## Three decisions taken inside the step, each stated because a reader will ask

**`entry=` is relative to `fusion-workbench/`, not to the project root.** The plan says "workbench-relative path" and step 5's acceptance names `shared/checkouts/<hex>.md`; both readings agree on that form, so the helper prints it and the header says what it is relative to.

**Five fields on a first write, not six.** `**Refreshed:**` is absent until the first refresh (the Data Structures table says so), and the worker field is gone with the gate's answer. Step 5's acceptance says "the six fields"; that figure was written before the gate was answered, and the honest count for a first write is now five.

**`register` writes the whole entry only when creating it.** A refresh is a per-field substitution that preserves every other line in the file, so prose a human added to their own entry survives. The alternative — rebuilding the file each run — would silently delete it.

## What the tests did not cover, stated rather than left to be found

The concurrent case: two agents in one checkout calling `register` at the same moment. `register` writes this checkout's own file and no other, so the race is one file and not the cross-checkout collision the header is about, but nothing here serialises it. Not tested for the reason `fusion-identity.test.ts` gives for the same omission — a fork-twenty-children test lands in the load-sensitive flakiness already filed (`260814-2118_*_the-hooks-suite-fails-differently-on-repeated-full-runs-and-does-so-on-clean-head.md`).

## Verification

`cd hooks && npm test` — exit 1. Four gates fail, and they split two and two.

**Caused by this step, and each is a re-approval the gate itself designates as the expected response:**

- `reference-resolution-lint.test.ts`, the pinned `BASELINE`: `paths` 1552 → 1563, `anchors` 216 → 217, `stampBare` 11 → 13. Measured by single-file removal: with `bin/fusion-checkout-name` out of the tree and `CLAUDE.md` restored from HEAD the gate is green on the committed baseline, so the whole delta is this step's. The `CLAUDE.md` row's own share is +3 paths (`bin/fusion-checkout-name`, `bin/fusion-workbench-root`, `bin/fusion-identity`) and the helper header carries the rest, including the one anchor (`rules/workbench-tracking.md` `## The four classes`). The two `stampBare` are the worked example's `**Registered:** 260904-1712` and `**Refreshed:** 260905-0903` — example values on comment lines, the same class as the `**Date:** 260801-1355` example in `hooks/lib/citation-scan.ts` that the 2026-08-29 re-approval already named.
- `surface-growth-bound.test.ts`, the checked-in golden: the `hook-tests` block gains `fusion-checkout-name.test.ts 168` and its total moves 19 876 → 20 044. **The bound itself passes** — 168 lines against 448 free — and only the golden's inventory needs regenerating, which by that file's own header does not move a baseline.

Neither was repaired here: the dispatch bounded this step to four files, and both repairs sit outside them (`hooks/lib/__tests__/reference-resolution-lint.test.ts` and `hooks/lib/__tests__/fixtures/surface-growth.golden`).

**Not caused by this step, red at HEAD `e2a66a12` before any file here was written:**

- `citation-sweep.test.ts`, `--dry-run` over this repository's workbench: `files=3 rewrites=10`, spread over this Circle's own record (1 rewrite), the portfolio briefing at the workbench root (1) and the playmaker history file of 260904-1636 in the shared history store (8). All three are committed and unmodified in this working tree; run `bin/fusion-citation-sweep --dry-run` for the same list.
- `workbench-citation-lint.test.ts`: the portfolio briefing's line 107 cites the curator Circle of 260801-1244 with a leading store segment, which the storeless grammar refuses. Same file, same cause.

**Acceptance criteria that did pass:** `bash bin/fusion-checkout-name --help` prints the usage block and exits 2; the new test's 9 cases pass; `committed-dist.test.ts` holds `git ls-files bin/` equal to the directory listing (the two new files were registered with `git add -N` under `bin/fusion-commit-lock`, no commit); `derivable-enumerations-lint` is green, so the Layout table has exactly one row per `bin/` helper; `path-literal-lint` is green.

One earlier full run reported five failures rather than four, the fifth not reproducing on either subsequent run — the repeated-full-run flakiness of `260814-2118_*_the-hooks-suite-fails-differently-on-repeated-full-runs-and-does-so-on-clean-head.md`, recorded here rather than dismissed.
