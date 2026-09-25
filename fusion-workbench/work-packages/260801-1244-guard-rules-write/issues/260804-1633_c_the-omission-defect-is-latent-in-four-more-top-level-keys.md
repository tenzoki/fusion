# The omission defect is latent in four more top-level keys, masked only by the plugin file and `DEFAULTS` agreeing today

---

**Severity:** Medium
**Domain:** code (security control)
**Filed by:** planner, planning the C5b remediation
**Affects:** `hooks/lib/config.ts:277-281` (the per-top-level-key merge) and `:294-330` (the per-leaf `?? DEFAULTS` normalisation); `hooks/config.json` and `DEFAULTS` as a pair
**Kind:** Latent. No observable misbehaviour at HEAD `53b3765`. It arms the first time anyone edits a threshold in one of the two files and not the other.
**Cross-references:**
`260804-1601_*_a-partial-guard-object-silently-removes-every-protected-path.md` — the live instance of the same rule, on the one leaf where the two sources differ,
`260804-1630_*_what-does-a-project-guard-object-inherit-for-a-key-it-does-not-supply.md` — the decision whose answer either closes this or leaves it,
`260804-1600-c5b-independent-assessment.md` `### The merge semantics, assessed as a design`

---

## What is wrong

A project's top-level object replaces the plugin's whole, and that object's missing leaves are
then filled from the in-code `DEFAULTS` rather than from the plugin's file. Issue
`260804-1601_*_a-partial-guard-object-silently-removes-every-protected-path.md` reports this for `guard.protectedPaths`, where the two sources differ and the
consequence is that the whole protected list disappears.

The rule is not scoped to that key. It applies identically to `escalation`, `churn`,
`crossFile` and `decisions`. A project that writes `{"churn":{"changesPerSessionWarning":3}}`
gets the other three churn thresholds from `DEFAULTS`, not from `hooks/config.json`.

## Why nothing is observably wrong today, and why that is the problem

Compared leaf by leaf at HEAD `53b3765`:

| Key | `hooks/config.json` | `DEFAULTS` | Differ? |
|---|---|---|---|
| `guard.enabled` | `true` | `true` | no |
| `guard.defaultSensitivity` | `"medium"` | `"medium"` | no |
| `guard.protectedPaths` | nine patterns | `[]` | **yes** |
| `guard.categoryPaths` / `categorySensitivity` | `{}` / `{}` | `{}` / `{}` | no |
| `decisions` | `[]` | `[]` | no |
| `escalation.blocksBeforeHalt` | `3` | `3` | no |
| `churn` (four leaves) | `5 / 10 / 8 / 15` | `5 / 10 / 8 / 15` | no |
| `crossFile` (two leaves) | `3 / 5` | `3 / 5` | no |

Exactly one leaf differs, and it is the one already filed. Every other instance of the defect
is invisible because two files happen to agree, with nothing keeping them agreeing — no test
asserts it, no comment in either file mentions the other, and the two are edited for
different reasons by different people.

This is the same shape as the reasoning that produced `260804-1601_*_a-partial-guard-object-silently-removes-every-protected-path.md` in the first place. The
plan reasoned the merge rule through for `defaultSensitivity`, observed that both values were
`"medium"` today, concluded nothing observable changes, and did not turn the rule around. The
observation was correct and the conclusion did not survive the next key. Filing this is that
lesson applied to the four keys nobody has looked at yet.

## Why it is Medium rather than High

Nothing on disk misbehaves. The reach when it arms is a churn or cross-file threshold, or a
halt threshold, silently reverting to the built-in value for a project that edited a sibling
key — loud in the halt case, advisory in the churn and cross-file cases. It is not a protected
path becoming writable.

## Suggested direction

No separate fix. Option 1 of decision `260804-1630_*_what-does-a-project-guard-object-inherit-for-a-key-it-does-not-supply.md` — a key the project does not supply
falls back to the plugin layer, then to `DEFAULTS` — closes all five instances with the same
change, because the rule stops being about which keys happen to differ. If the decision goes
another way, this issue needs its own answer, and the honest one is a test asserting that
`hooks/config.json` and `DEFAULTS` agree on every leaf they share, so the day they stop
agreeing is the day the suite says so rather than the day a project loses a threshold.
