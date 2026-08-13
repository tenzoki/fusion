# Three tests fail at HEAD in two files, and no open record names them

---

**Severity:** Medium — the suite is the cheapest gate this project has, and a red baseline makes every "green" claim in a session report unreadable
**Domain:** code
**Filed by:** analyst, during the documentation-staleness survey (`shared/analyses/260813-0828-documentation-staleness-survey.md`)
**Affects:** `hooks/lib/__tests__/circle-stash-git-exclusion.test.ts`, `hooks/lib/__tests__/fusion-plane.test.ts`
**Cross-references:** `shared/issues/260810-0918_*_the-suite-total-moves-between-runs-and-the-variance-is-entirely-in-one-file.md` (a different defect in the same file); `shared/issues/260810-1032_*_push-rebuild-map-swallows-a-failed-rebuild-and-reconciles-against-the-stale-map.md` and `shared/issues/260810-0747_*_push-plan-rebuild-map-without-a-fixture-drops-the-flag-silently.md` (both closed; the two failing plane cases are the ones those closures installed)

---

## What was measured

`cd hooks && npx vitest run` at HEAD (`1c2d555`) reports **46 of 48 files green, 1007 of 1010
tests green**. The three failures reproduce on a second run against the same tree, so they are
not the collection-count flakiness that `260810-0918` records.

The failing cases:

1. `circle-stash-git-exclusion.test.ts` — *"the unbranched pathspec form is what makes the branch
   necessary (ignored workbench)"*.
2. `fusion-plane.test.ts` — *"the live rebuild, against a reachable Plane > the positive control:
   a rebuild that reaches Plane lands, and the push then reconciles"*.
3. `fusion-plane.test.ts` — *"the live rebuild, against a reachable Plane > a failed rebuild
   cancels the reconcile: nothing reaches the board, and it does not report ok"*.

For case 3 the assertion expects stderr to contain `the issues response was empty` and receives
instead:

```
fusion-plane: rebuilding .plane-map.json from Plane (embedded fusion-key)…
fusion-plane: rebuild-map: could not parse issues — map not changed
fusion-plane: push: the rebuild did not replace the map, so the reconcile did NOT run — nothing was pushed.
```

The tool's refusal is intact and correctly ordered. What differs is the wording of one diagnostic
line, so the likely cause is a message the code changed and the assertion did not follow — but
that is **inference**, not verified: I did not read `bin/fusion-plane` to find where either
string is produced.

## Why it is filed rather than fixed

I am the analyst and read-only on code. It is also out of scope for the documentation Circle this
survey grounds: nothing here is a documentation defect.

## What is not established

- Whether any of the three is environment-dependent. Both plane cases sit in a describe block
  named *"against a reachable Plane"*, and neither the mock's contract nor whether it requires
  anything from the local shell was examined.
- Which commit made them red. No bisect was run.
- Whether the circle-stash case and the two plane cases share a cause. They almost certainly do
  not, but that is an assumption and nothing was done to test it.

## Suggested route

`bugfixer`, or `coder` with a bisect first. The two plane cases should be diagnosed together and
the circle-stash case separately.

---
Resolved: two causes, one test defect and one product defect, both fixed. Suite verified green by the orchestrator independently of the bugfixers: `cd hooks && npx vitest run` → exit 0, 48 files, 1010 passed, 0 failed.

**Case 1, `circle-stash-git-exclusion.test.ts` — a test defect.** The assertion matched git's English refusal text while this machine runs `LANG=de_DE.UTF-8` against a gettext-built git 2.49.0, so the identical refusal arrived translated. Fixed by forcing `LC_ALL=C` on the child environment of that one git invocation; the assertion is unchanged word for word, because git's own sentence naming the ignored-path reason is the strongest available evidence that git refused for *that* reason rather than another. A hand sweep of all 17 direct git invocations in the test tree and a mechanical pass over all 216 prose-shaped `toContain`/`toMatch` literals found no second instance, so no further record was filed.

**Cases 2 and 3, `fusion-plane.test.ts` — a product defect in `bin/fusion-plane`, and the tests were right.** `plane_curl` ran curl inside `zsh -ic` and read that shell's entire stdout as `<body>\n<http_code>`. `-i` sources the operator's interactive rc, and an interactive rc may write to stdout: on stock macOS, `/etc/zshrc_Apple_Terminal:217` prints `Restored session: <date>` whenever `TERM_PROGRAM=Apple_Terminal`. Reproduced directly by the orchestrator: `zsh -ic 'printf "PROBE\n"' 2>/dev/null` emits `Restored session: Do 13 Aug 2026 10:40:58 CEST` ahead of `PROBE`. `tail -n1` still read the HTTP code correctly, but `sed '$d'` handed the banner to `$PLANE_BODY`, so `jq` failed on **every** response body — the Plane bridge was dead for any operator whose rc prints anything, with no diagnostic naming the cause. Fixed by writing the body to a temp file via `curl -o`, leaving the noisy channel carrying nothing but `%{http_code}`. The tool already discarded that shell's stderr in anticipation of exactly this chatter; only stdout was left open to it, so the design intent was present and half-implemented.

**The two failures looked different and had one cause.** The positive control's valid payload and the failure case's empty payload were corrupted identically, so both landed on the parse-failure branch (`bin/fusion-plane:1657`) instead of, respectively, succeeding and reaching the distinct empty-response branch (`bin/fusion-plane:1663`). Both branches exist at HEAD and both strings are live; neither test file nor fixture was modified. Rewriting the assertion to match the observed message — the obvious cheap repair, and the one explicitly forbidden in the dispatch — would have cemented the loss of the empty-response branch's coverage permanently.

**The three questions this record left unestablished, now answered.**

1. *Environment-dependent?* Case 1 yes, on the operator's locale. Cases 2 and 3 yes, but not on `$PLANE_API_KEY` — the test injects the key itself (`fusion-plane.test.ts:1604-1611`), and the mock needs only `zsh`, `curl` and a free loopback port. What made them red is the operator's own interactive rc writing to stdout. Proof without any code change: `SHELL_SESSION_DID_INIT=1 npx vitest run lib/__tests__/fusion-plane.test.ts -t "the live rebuild"` is green at HEAD, that variable suppressing Apple Terminal's session-restore line.
2. *Which commit made them red?* None. `git log -S 'the issues response was empty' -- bin/fusion-plane` names only `dd50efd`, which added the string, and it is present at HEAD. An environment condition broke these two — a session file Apple Terminal writes and restores — which also explains the intermittency this record noticed.
3. *Do the cases share a cause?* No, as the record assumed. Cases 2 and 3 share one with each other; case 1 is unrelated.

**Follow-on filed, deliberately not fixed here:** `circles/260813-0858-playmaker-maintains-backlog-store/issues/260813-1036_*_the-manual-fetch-command-fusion-plane-prints-breaks-the-same-way-plane-curl-just-stopped-breaking.md` — `seed_defer_manual` (`bin/fusion-plane:2263`) prints a manual fetch command with the same `zsh -ic … | jq` shape, which will fail for the same reason when a stranded operator copies it. Printed, never executed, so outside a minimal fix.
